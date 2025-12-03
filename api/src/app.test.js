import request from "supertest";
import app from './index.js';

describe("login given email and password", () => {
    test("return 200 OK for registered user", async () => {
        const response = await request(app).post("/users/login").send({
            email:"charlie.punk@patient.com",
            password:"strongpass"
        })
        expect(response.statusCode).toBe(200)
    })
});