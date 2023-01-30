import supertest from "supertest";
import { expect } from "chai";

const app = require("../src/app");
const request = supertest(app);

describe("Test POST request", () => {
    it("Should return 200 response", async () => {
        const body = {
            "game": "Mobile Legends",
            "gamerID": "GYUTDTE",
            "points": 20
        };

        const response = await request.post("/").send(body);

        expect(response.status).to.equal(200);
    });
});

describe("Test healthcheck endpoint", () => {
    it("Should return 200 response", async () => {
        const response = await request.get("/healthcheck");

        expect(response.status).to.equal(200);
    });
});

describe("Test activate endpoint", () => {
    it("Should return 200 response", async () => {
        const response = await request.post("/activate");

        expect(response.status).to.equal(200);
    });
});

describe("Test deactivate endpoint", () => {
    describe("With status SLOW", () => {
        it("Should return 200 response", async () => {
            const response = await request.post("/deactivate");

            expect(response.status).to.equal(200);
        });
    });
    describe("With status ERROR", () => {
        it("Should return 200 response", async () => {
            const response = await request.post("/deactivate");

            expect(response.status).to.equal(200);
        });
    });
});