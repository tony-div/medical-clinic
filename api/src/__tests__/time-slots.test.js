import request from "supertest";
import app from '../index.js';

DATE = {
    date:"2025-12-09",
    day:"Tue"
}


describe("get time slots at specific day", () => {
    test("return 200 OK", async () => {
        const response = await request(app).get(`/time-slots/1?startDate=${DATE.date}`)
        expect(response.statusCode).toBe(200)
    })
});

describe("get doctor's appointment time slots", () => {
    test("first time slots starts at doctor's start time and last time slots ends at doctor's end time", async () => {
        const scheduleResponse = await request(app).get('/doctors/schedule/1') 

        if(!scheduleResponse.body.schedule){
            throw new Error(`Failed to get doctor's schedule on ${DATE.day}.`);
        }
        const schedule = scheduleResponse.body.schedule.find(
            (item) => item.day === DATE.day
        )

        const response = await request(app).get(`/time-slots/1?startDate=${DATE.date}`)
        expect(response.statusCode).toBe(200)
        expect(response.body.data).toBeInstanceOf(Array)

        first_slot = response.body.data[0];
        last_slot = response.body.data[response.body.data.length -1];

        expect(first_slot.startTime === schedule.starts_at.substring(0, 5))
        expect(last_slot.endTime === schedule.ends_at.substring(0, 5))
    })
});