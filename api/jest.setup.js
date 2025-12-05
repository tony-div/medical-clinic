import { db } from "./config/database.js";

afterAll(async () => {
    await db.end();
});
