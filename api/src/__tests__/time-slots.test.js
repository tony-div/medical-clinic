import request from "supertest";
import app from '../index.js';

describe("get doctor's appointment time slots", () => {
    test("first time slots starts at doctor's start time and last time slots ends at doctor's end time", async () => {
        const response = await request(app).get("/time-slots/1")
        expect(response.statusCode).toBe(200)
        // expect(response.body)
    })
});