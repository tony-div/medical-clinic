import request from "supertest";
import app from '../index.js';

describe("login given email and password", () => {
    test("return 200 OK for registered user", async () => {
        const response = await request(app).post("/users/login").send({
            email:"charlie.punk@patient.com",
            password:"strongpass"
        })
        expect(response.statusCode).toBe(200)
    })
});

describe("login given valid email but wrong password OR unregistered user", () => {
    test("return 403 forbidden", async () => {
        const req_body_data = [
            {
                email:"charlie.punk@patient.com",
                password:"strongpassword"
            },
            {
                email:"charlie@patient.com",
                password:"strongpass"
            }
        ]
        for(const body of req_body_data){
            const response = await request(app).post("/users/login").send(body)
            expect(response.statusCode).toBe(403);
        }
    });
});