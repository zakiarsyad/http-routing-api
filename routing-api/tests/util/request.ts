import supertest from 'supertest';

import { TestSuite } from "../test-utils";

export const fire = async (suite: TestSuite, path: string) => {
    return supertest(suite.server).post(path).send({ foo: 'bar' });
}