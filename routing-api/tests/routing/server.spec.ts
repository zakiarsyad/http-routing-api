import { expect } from 'chai';
import { ResponseStatus, Server } from '../../routing/server';
import sinon from "sinon";
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

describe("Server class test", () => {
    const server = new Server({
        url: "http://localhost:3001",
        rollingCountTimeout: 10000,
        rollingCountBuckets: 10,
        errorThresholdPercentage: 20,
        latencyThresholdPercentage: 20,
        latencyThreshold: 3000,
        healthcheckPeriode: 5000,
    });

    describe("Test the initital value of the attributes", () => {
        it("Should return the default value", () => {
            expect(server.url).to.equal("http://localhost:3001");
            expect(server.load).to.equal(0);
            expect(server.errorRate).to.equal(0);
            expect(server.slowRate).to.equal(0);
            expect(server["timout"]).to.equal(10000);
            expect(server["buckets"]).to.equal(10);
            expect(server["window"]).length(10);
            expect(server["errorThresholdPercentage"]).to.equal(20);
            expect(server["latencyThresholdPercentage"]).to.equal(20);
            expect(server["latencyThreshold"]).to.equal(3000);
            expect(server["healthcheckPeriode"]).to.equal(5000);
        });
    });

    describe("Test the methods", () => {
        describe("isReady", () => {
            it("Should return true if the error and slow rate are below the threshold", () => {
                const result = server.isReady();

                expect(result).to.equal(true);
            });

            it("Should return true if the error rate is higher the threshold", () => {
                server.errorRate = 30;
                const result = server.isReady();

                expect(result).to.equal(false);
            });

            it("Should return true if the slow rate is higher the threshold", () => {
                server.slowRate = 30;
                const result = server.isReady();

                expect(result).to.equal(false);
            });
        });

        describe("updateStats", () => {
            it("Should count the total values on the buckets", () => {
                const bucket = {
                    fires: 1,
                    fails: 1,
                    slows: 1,
                };

                // generate buckets in the window
                for (let i = 0; i < server["buckets"]; i++) {
                    server["window"][i] = bucket;
                }

                server["updateStats"]();

                expect(server.load).to.equal(10);
                expect(server.errorRate).to.equal(100);
                expect(server.slowRate).to.equal(100);
            });
        });

        describe("bucket", () => {
            it("Should return the default bucket", () => {
                const bucket = server["bucket"]();

                expect(bucket.fires).to.equal(0);
                expect(bucket.fails).to.equal(0);
                expect(bucket.slows).to.equal(0);
            });
        });

        describe("rotate", () => {
            it("Should rotate the buckets in the window", () => {
                const bucket = {
                    fires: 1,
                    fails: 1,
                    slows: 1,
                };

                // generate buckets in the window
                for (let i = 0; i < server["buckets"]; i++) {
                    server["window"][i] = bucket;
                }

                server["rotate"]();

                // newly created bucket
                expect(server["window"][0].fires).to.equal(0);
                expect(server["window"][0].fails).to.equal(0);
                expect(server["window"][0].slows).to.equal(0);

                // old bucket
                expect(server["window"][1].fires).to.equal(1);
                expect(server["window"][1].fails).to.equal(1);
                expect(server["window"][1].slows).to.equal(1);
                expect(server["window"][9].fires).to.equal(1);
                expect(server["window"][9].fails).to.equal(1);
                expect(server["window"][9].slows).to.equal(1);
            });
        });

        describe("recordStats", () => {
            it("Should add the fires count", () => {
                // set initial value of the bucket
                server["rotate"]();

                server["recordStats"](ResponseStatus.SUCCESS);

                expect(server["window"][0].fires).to.equal(1);
                expect(server["window"][0].fails).to.equal(0);
                expect(server["window"][0].slows).to.equal(0);
            });

            it("Should add the fails count if the status is FAIL", () => {
                // set initial value of the bucket
                server["rotate"]();

                server["recordStats"](ResponseStatus.FAIL);

                expect(server["window"][0].fires).to.equal(1);
                expect(server["window"][0].fails).to.equal(1);
                expect(server["window"][0].slows).to.equal(0);
            });

            it("Should add the slows count if the status is SLOW", () => {
                // set initial value of the bucket
                server["rotate"]();

                server["recordStats"](ResponseStatus.SUCCESS, 4000);

                expect(server["window"][0].fires).to.equal(1);
                expect(server["window"][0].fails).to.equal(0);
                expect(server["window"][0].slows).to.equal(1);
            });
        });
    });
});