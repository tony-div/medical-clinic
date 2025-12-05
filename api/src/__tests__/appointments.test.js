import request from "supertest";
import app from '../index.js';

const USERS = [
    {
        id: 3,
        email: "charlie.brown@patient.com",
        password: "strongpass"
    },
    {
        id:1,
        email:"alice.smith@clinic.com",
        password:"strongpass"
    }

]
    

describe("get appointments for a user", () => {
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

    test("return 200 OK", async () => {
        const response = await request(app)
            .get(`/appointments/list/`)
            .set('Authorization', `Bearer ${authToken}`)

        expect(response.statusCode).toBe(200);
    });
});

describe("doctor attempts to create appointment", () => {
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

    test("return 403", async () => {
        const response = await request(app)
            .post('/appointments')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                doctor_id:USERS[1].id,
                reason:null,
                date:"2025-12-30",
                starts:"9:30:00",
                ends_at:"10:30:00"
            })

        expect(response.statusCode).toBe(403);
    });
});

describe("user attempts to update a complete appointment", () => {
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

    test("return bad request 400", async () => {
        const response = await request(app)
            .patch('/appointments/details/1')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                doctor_id:USERS[1].id,
                reason:"new reason"
            })

        expect(response.statusCode).toBe(400);
    });
});