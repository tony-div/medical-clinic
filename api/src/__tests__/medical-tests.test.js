import request from "supertest";
import app from '../index.js';

USERS = [
{
    id: 3,
    email: "charlie.brown@patient.com",
    password: "strongpass"
    }
]


describe("create medical test for a complete apt", () => {
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

    test("return 201 created", async () => {
        const response = await request(app)
            .post('/medical-tests/')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            "appointment_id":1,
            "test_date":"2020-05-03",
            "description":"CT Scan"
        });

        expect(response.statusCode).toBe(400);
    });
});