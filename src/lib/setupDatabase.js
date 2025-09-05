import { UsersTable } from "../structures/Users";
export default async function setupDB() {
    return UsersTable.connection;
}
