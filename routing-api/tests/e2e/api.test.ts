import { expect } from "chai";

import { initSuite } from "../test-utils";
import { fire } from "../util/request";

describe('End to end test', () => {
    describe('We have all api servers running', () => {
        const s = initSuite();

        it('Should distribute to all api servers', async () => {
            const traffic = 100;
            const promises = [];

            // Fire all the requests
            for (let i = 0; i < traffic; i++) {
                promises.push(fire(s(), '/transactions'));
            }
            await Promise.all(promises);

            const traffic1 = s().mockApiServers[0].getTxnCounter();
            const traffic2 = s().mockApiServers[1].getTxnCounter();
            const traffic3 = s().mockApiServers[2].getTxnCounter();
            const totalTraffic = traffic1 + traffic2 + traffic3;

            expect(totalTraffic).to.equal(traffic);
            
            // The health api servers should distribute the traffic (almost) evenly
            const base = totalTraffic / s().mockApiServers.length;
            const tolerance = 0.1;
            expect(traffic1).to.greaterThan(base * (1 - tolerance));
            expect(traffic2).to.greaterThan(base * (1 - tolerance));
            expect(traffic3).to.greaterThan(base * (1 - tolerance));
        })
    })

    describe('We have an error api servers', () => {
        const s = initSuite();

        it('Should distribute to the health api servers', async () => {
            const traffic = 100;
            
            // Fire half of the requests
            const firstPromises = [];
            for (let i = 0; i < traffic / 2; i++) {
                firstPromises.push(fire(s(), '/transactions'));
            }
            await Promise.all(firstPromises);

            // Stop one of the api server
            s().mockApiServers[0].stop();

            // Fire the rest of the requests
            const secondPromises = [];
            for (let i = 0; i < traffic / 2; i++) {
                secondPromises.push(fire(s(), '/transactions'));
            }
            await Promise.all(secondPromises);

            const traffic1 = s().mockApiServers[0].getTxnCounter();
            const traffic2 = s().mockApiServers[1].getTxnCounter();
            const traffic3 = s().mockApiServers[2].getTxnCounter();
            const totalTraffic = traffic1 + traffic2 + traffic3;

            expect(totalTraffic).to.equal(traffic);
            
            // The health api servers should have more traffic than the error api server
            expect(traffic2).to.greaterThan(traffic1);
            expect(traffic3).to.greaterThan(traffic1);
            
            // The health api servers should distribute the traffic (almost) evenly
            const base = (traffic2 + traffic3) / 2;
            const tolerance = 0.1;
            expect(traffic2).to.within(base * (1 - tolerance), base * (1 + tolerance));
            expect(traffic3).to.within(base * (1 - tolerance), base * (1 + tolerance));
        })
    })
})