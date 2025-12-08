import request from "supertest";
import app from '../index.js';

USERS = [
{
    id: 2,
    email: "patient2@gmail.com",
    password: "123123"
    },
{
    id:1,
    email:"doc1@mail.com",
    password:"123123"
    }
]

describe("doctor attempts to create review", () => {
    let authToken;

    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/users/login') 
            .send({
                email: USERS[1].email,
                password: USERS[1].password
            });

        authToken = loginResponse.body.token; 

        if (!authToken) {
            throw new Error("Failed to log in and retrieve authentication token.");
        }
    });

    test("return 403 forbidden", async () => {
        const response = await request(app)
            .post(`/reviews`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                doctor_id: USERS[1].id,
                rating: 5,
                comment: "good"
            });

        expect(response.statusCode).toBe(403);
    });
});


describe("user attempts to review a doctor twice", () => {
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

    test("return 201 for first review and 400 for second", async () => {
        const firstResponse = await request(app)
            .post(`/reviews`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                doctor_id:USERS[1].id,
                rating: 1,
                comment: "bad"
            });
            
            expect(firstResponse.statusCode).toBe(201);
            
            const secondResponse = await request(app)
            .post(`/reviews`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                doctor_id:USERS[1].id,
                rating: 1,
                comment: "worst"
            });

        expect(secondResponse.statusCode).toBe(400);
    });
});