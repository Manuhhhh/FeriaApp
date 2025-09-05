import { db } from '../database/database'
import { sql } from 'kysely'
import type { UserUpdate, User, NewUser } from '../types/database'
import { hashSync, compareSync } from 'bcrypt'
import { signJwt } from '@/lib/auth'
import type { SessionTokenData } from '@/types/session'

interface LoginInterface {
    emailOrUsername?: string;
    password: string;
    remember?: boolean;
}

class Users {
    public connection: boolean | Promise<boolean>

    constructor() {
        this.connection = this.init()
    }

    private async init() {
        await db.schema.createTable('users')
            .ifNotExists()
            .addColumn('id', 'serial', (cb) => cb.primaryKey())
            .addColumn('email', 'varchar(255)', (cb) =>
                cb.notNull().unique()
            )
            .addColumn('username', 'varchar(255)', (cb) =>
                cb.notNull().unique()
            )
            .addColumn('password', 'varchar(255)', (cb) =>
                cb.notNull()
            )
            .addColumn('created_at', 'timestamp', (cb) =>
                cb.notNull().defaultTo(sql`now()`)
            )
            .execute()

        console.log('Users table initialized')
        return true
    }

    public async findById(id: number) {
        return await db.selectFrom('users')
            .where('id', '=', id)
            .selectAll()
            .executeTakeFirst()
    }

    public async findAll() {
        return await db.selectFrom('users')
            .selectAll()
            .execute()
    }

    public async findByCriteria(criteria: Partial<User>) {
        const query = db.selectFrom('users')
            .selectAll()
            .where((eb) => eb.and(criteria))
            .execute()

        return await query
    }

    public async update(id: number, updateWith: UserUpdate) {
        await db.updateTable('users').set(updateWith).where('id', '=', id).execute()
    }

    // Will return an error message if any field is already taken
    // Returns undefined if the user was created successfully
    public async create(user: NewUser): Promise<['username' | 'email' | undefined, string | undefined]> {

        user.password = hashSync(user.password, 10)

        const existingUser = await db.selectFrom('users')
            .selectAll()
            .where((eb) => eb.or({
                email: user.email,
                username: user.username,
            }))
            .executeTakeFirst()

        if (existingUser?.email === user.email) {
            return ['email', undefined]
        }

        if (existingUser?.username === user.username) {
            return ['username', undefined]
        }

        const insertedUser = await db.insertInto('users')
            .values(user)
            .returningAll()
            .executeTakeFirstOrThrow()
            .catch((error) => {
                console.error(error)

                return error.message
            })

        const token = await this.generateSession(insertedUser)

        return [, token]
    }

    public async delete(id: number) {
        return await db.deleteFrom('users').where('id', '=', id)
            .returningAll()
            .executeTakeFirst()
    }

    public async login({ emailOrUsername, password, remember }: LoginInterface): Promise<string | undefined> {
        if (!emailOrUsername || !password) {
            return
        }

        const query = db.selectFrom('users')
            .select(['password', 'id', 'username', 'email'])
            .where((eb) => eb
                .or([
                    eb('email', '=', emailOrUsername || ''),
                    eb('username', '=', emailOrUsername || '')
                ])
            )
            .compile()

        const posibleUsers = await db.executeQuery(query)

        if (!posibleUsers) {
            return
        }

        let result = undefined

        posibleUsers.rows.forEach(user => {
            if (user.password && compareSync(password, user.password)) {
                return result = this.generateSession(user, remember)
            }
        })

        return result
    }

    private async generateSession(user: SessionTokenData, remember?: boolean): Promise<string> {

        const payload = {
            id: user.id,
            email: user.email,
            username: user.username,
        }

        return signJwt(payload, remember)
    }
}

export const UsersTable = new Users()