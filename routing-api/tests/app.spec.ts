import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { expect } from "chai";
import supertest from "supertest";

const app = require("../src/app");
const request = supertest(app);

describe("Test send request", () => {
    const mock = new MockAdapter(axios);

    it("Should return 200 response if the destination is OK", async () => {
        mock.onPost("http://localhost:3001").reply(200);
        mock.onPost("http://localhost:3002").reply(200);
        mock.onPost("http://localhost:3003").reply(200);

        const body = {
            "game": "Mobile Legends",
            "gamerID": "GYUTDTE",
            "points": 20
        };

        const response = await request.post("/").send(body);

        expect(response.status).to.equal(200);
        mock.reset();
    });

    it("Should return 500 response if the destination is FAIL", async () => {
        mock.onPost("http://localhost:3001").reply(500);
        mock.onPost("http://localhost:3002").reply(500);
        mock.onPost("http://localhost:3003").reply(500);

        const body = {
            "game": "Mobile Legends",
            "gamerID": "GYUTDTE",
            "points": 20
        };

        const response = await request.post("/").send(body);

        expect(response.status).to.equal(500);
    });
});