import request from "supertest";
import app from './index.js';

describe("POST /users", () => {
    test("return 200 OK", async () => {
        const response = await request(app).post("/users/login").send({
            email:"charlie.punk@patient.com",
            password:"strongpass"
        })
        expect(response.statusCode).toBe(200)
    })
});