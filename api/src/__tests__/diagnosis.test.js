import request from "supertest";
import app from '../index.js';

const USERS = [
    {
        id: 3,
        email: "charlie.brown@patient.com",
        password: "strongpass",
        role:"patient"
    },
    {
        id:1,
        email:"alice.smith@clinic.com",
        password:"strongpass",
        role:"doctor"
    }

]
const AP = [
    {
        id: 10,
        status:"complete"
    },
    {
        id:11,
        status:"scheduled"
    }

]



describe("get diagnosis", () => {
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

    test("return 404", async () => {
        const response = await request(app)
            .get(`/diagnosis/${AP[1].id}`)
            .set('Authorization', `Bearer ${authToken}`)

        expect(response.statusCode).toBe(404);
    });
});
describe("doctor attempts to create a diagnosis on a past appointment", () => {
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

    test("return 400", async () => {
        const response = await request(app)
            .post(`/diagnosis/${AP[0].id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                description:"flu",
                prescription:"panadol",
                treatment_plan:"every 8 hours"
            })

        expect(response.statusCode).toBe(400);
    });
});