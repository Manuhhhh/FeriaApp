import { db } from '../database/database';
import { sql } from 'kysely';
import { hashSync, compareSync } from 'bcrypt';
import { signJwt } from '@/lib/auth';
class Users {
    connection;
    constructor() {
        this.connection = this.init();
    }
    async init() {
        await db.schema.createTable('users')
            .ifNotExists()
            .addColumn('id', 'serial', (cb) => cb.primaryKey())
            .addColumn('email', 'varchar(255)', (cb) => cb.notNull().unique())
            .addColumn('username', 'varchar(255)', (cb) => cb.notNull().unique())
            .addColumn('password', 'varchar(255)', (cb) => cb.notNull())
            .addColumn('created_at', 'timestamp', (cb) => cb.notNull().defaultTo(sql `now()`))
            .execute();
        console.log('Users table initialized');
        return true;
    }
    async findById(id) {
        return await db.selectFrom('users')
            .where('id', '=', id)
            .selectAll()
            .executeTakeFirst();
    }
    async findAll() {
        return await db.selectFrom('users')
            .selectAll()
            .execute();
    }
    async findByCriteria(criteria) {
        const query = db.selectFrom('users')
            .selectAll()
            .where((eb) => eb.and(criteria))
            .execute();
        return await query;
    }
    async update(id, updateWith) {
        await db.updateTable('users').set(updateWith).where('id', '=', id).execute();
    }
    // Will return an error message if any field is already taken
    // Returns undefined if the user was created successfully
    async create(user) {
        user.password = hashSync(user.password, 10);
        const existingUser = await db.selectFrom('users')
            .selectAll()
            .where((eb) => eb.or({
            email: user.email,
            username: user.username,
        }))
            .executeTakeFirst();
        if (existingUser?.email === user.email) {
            return ['email', undefined];
        }
        if (existingUser?.username === user.username) {
            return ['username', undefined];
        }
        const insertedUser = await db.insertInto('users')
            .values(user)
            .returningAll()
            .executeTakeFirstOrThrow()
            .catch((error) => {
            console.error(error);
            return error.message;
        });
        const token = await this.generateSession(insertedUser);
        return [, token];
    }
    async delete(id) {
        return await db.deleteFrom('users').where('id', '=', id)
            .returningAll()
            .executeTakeFirst();
    }
    async login({ emailOrUsername, password, remember }) {
        if (!emailOrUsername || !password) {
            return;
        }
        const query = db.selectFrom('users')
            .select(['password', 'id', 'username', 'email'])
            .where((eb) => eb
            .or([
            eb('email', '=', emailOrUsername || ''),
            eb('username', '=', emailOrUsername || '')
        ]))
            .compile();
        const posibleUsers = await db.executeQuery(query);
        if (!posibleUsers) {
            return;
        }
        let result = undefined;
        posibleUsers.rows.forEach(user => {
            if (user.password && compareSync(password, user.password)) {
                return result = this.generateSession(user, remember);
            }
        });
        return result;
    }
    async generateSession(user, remember) {
        const payload = {
            id: user.id,
            email: user.email,
            username: user.username,
        };
        return signJwt(payload, remember);
    }
}
export const UsersTable = new Users();
