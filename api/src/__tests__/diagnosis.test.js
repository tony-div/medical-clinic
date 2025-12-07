import request from "supertest";
import app from '../index.js';

const USERS = [
    {
        id: 2,
        email: "patient1@gmail.com",
        password: "123123",
        role:"patient"
    },
    {
        id:1,
        email:"doc1@mail.com",
        password:"123123",
        role:"doctor"
    }

]
const AP = [
    {
        id: 1,
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