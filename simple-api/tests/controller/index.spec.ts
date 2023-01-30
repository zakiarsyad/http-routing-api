import { expect } from "chai";
import sinon from "sinon";
import { Controller, ResponseStatus } from "../../controller/index";

describe("Controller", () => {
    describe("Status = NORMAL", () => {
        const controller = new Controller();

        it("Should return status 200", async () => {
            const response = await controller.process({
                game: "Mobile Legends"
            });

            expect(response.status).to.equal(200);
            expect(response.data).to.deep.equal({ game: "Mobile Legends" });
        });
    });

    describe("Status = SLOW", () => {
        const controller = new Controller();
        controller.updateStatus(ResponseStatus.SLOW);

        it("Should return status 200", async () => {
            const clock = sinon.useFakeTimers();

            const promise = controller.process({
                game: "Mobile Legends"
            });

            clock.tick(5010);
            const response = await promise;

            expect(response.status).to.equal(200);
            expect(response.data).to.deep.equal({ game: "Mobile Legends" });
            clock.restore();
        });
    });

    describe("Status = ERROR", () => {
        const controller = new Controller();
        controller.updateStatus(ResponseStatus.ERROR);

        it("The second request should return status 500", async () => {
            try {
                await controller.process({
                    game: "Mobile Legends"
                });
            } catch (err) {
                expect(err.status).to.equal(500);
                expect(err.data).to.deep.equal({ message: "SERVER_ERROR" });
            }
        });
    });
});