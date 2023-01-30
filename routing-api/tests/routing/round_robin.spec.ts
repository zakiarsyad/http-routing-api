import { expect } from 'chai';
import { RoundRobin } from '../../routing/round_robin';
import { ResponseStatus, Server } from '../../routing/server';

describe("RoundRobin class test", () => {
    const server1 = new Server({
        url: "http://localhost:3001",
        rollingCountTimeout: 10000,
        rollingCountBuckets: 10,
        errorThresholdPercentage: 20,
        latencyThresholdPercentage: 20,
        latencyThreshold: 3000,
        healthcheckPeriode: 5000,
    });

    const server2 = new Server({
        url: "http://localhost:3002",
        rollingCountTimeout: 10000,
        rollingCountBuckets: 10,
        errorThresholdPercentage: 20,
        latencyThresholdPercentage: 20,
        latencyThreshold: 3000,
        healthcheckPeriode: 5000,
    });

    const roundRobin = new RoundRobin([server1, server2]);

    describe("Test the initital value of the attributes", () => {
        it("Should return the default value", () => {
            expect(roundRobin["servers"]).to.be.an("array");
            expect(roundRobin["servers"][0].url).to.deep.equal(server1.url);
        });
    });

    describe("Test the methods", () => {
        describe("pick", () => {
            // add a dummy load to server 2
            server2["recordStats"](ResponseStatus.SUCCESS);

            // should pick server1 as it has lower load
            const server = roundRobin.pick();

            expect(server.url).to.equal(server1.url);
        });
    });
});