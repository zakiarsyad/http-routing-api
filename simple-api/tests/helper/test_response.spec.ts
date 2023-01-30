import { TestFlag, TestHelper } from '../../helper/test_response';
import { expect } from "chai";
import sinon from "sinon";

describe("Test Helper", () => {
    describe("Test Flag = NORMAL", () => {
        const testHelper = new TestHelper(TestFlag.NORMAL, 0);

        it("Should return status 200", async () => {
            const response = await testHelper.getResponse({
                game: "Mobile Legends"
            });

            expect(response.status).to.equal(200);
            expect(response.data).to.deep.equal({ game: "Mobile Legends" });
        });
    });

    describe("Test Flag = SLOW", () => {
        const testHelper = new TestHelper(TestFlag.SLOW, 0);

        it("Should return status 200", async () => {
            const clock = sinon.useFakeTimers();

            const promise = testHelper.getResponse({
                game: "Mobile Legends"
            });

            clock.tick(5010);
            const response = await promise;

            expect(response.status).to.equal(200);
            expect(response.data).to.deep.equal({ game: "Mobile Legends" });
            clock.restore();
        });
    });

    describe("Test Flag = ERROR", () => {
        describe("Test Period = 0", () => {
            const testHelper = new TestHelper(TestFlag.ERROR, 0);

            it("Should return status 500", async () => {
                try {
                    await testHelper.getResponse({
                        game: "Mobile Legends"
                    });
                } catch (err) {
                    expect(err.status).to.equal(500);
                    expect(err.data).to.deep.equal({ error_code: "SERVER_ERROR" });
                }
            });
        });

        describe("Test Period = 1", () => {
            const testHelper = new TestHelper(TestFlag.ERROR, 1);

            it("The first request should return status 200", async () => {
                const response = await testHelper.getResponse({
                    game: "Mobile Legends"
                });

                expect(response.status).to.equal(200);
                expect(response.data).to.deep.equal({ game: "Mobile Legends" });
            });

            it("The second request should return status 500", async () => {
                try {
                    await testHelper.getResponse({
                        game: "Mobile Legends"
                    });
                } catch (err) {
                    expect(err.status).to.equal(500);
                    expect(err.data).to.deep.equal({ error_code: "SERVER_ERROR" });
                }
            });
        });
    });
});