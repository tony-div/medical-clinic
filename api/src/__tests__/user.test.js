import request from "supertest";
import app from '../index.js';

USERS = [
{
    id: 1,
    email: "charlie.punk@patient.com",
    password: "strongpass"
    }
]

describe("login given email and password", () => {
    test("return 200 OK for registered user", async () => {
        const response = await request(app).post("/users/login").send({
            email:USERS[0].email,
            password:USERS[0].password
        })
        expect(response.statusCode).toBe(200)
    })
});

describe("login given valid email but wrong password OR unregistered user", () => {
    test("return 403 forbidden", async () => {
        const req_body_data = [
            {
                email:USERS[0].email,
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

describe("non admin user attempts to update a user", () => {
    let authToken;

    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/users/login') 
            .send({
                email: USERS[0].email,
                password: USERS[0].password
            });

        authToken = loginResponse.body.token; 

        if (!authToken) {
            throw new Error("Failed to log in and retrieve authentication token.");
        }
    });

    test("return 403 forbidden", async () => {
        const response = await request(app)
            .patch('/users/2')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                password: "12345678",
                address: "somewhere-far"
            });

        expect(response.statusCode).toBe(403);
    });
});