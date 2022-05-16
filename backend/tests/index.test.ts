import * as chai from 'chai';
import * as request from 'supertest';
import { httpServer } from "../src";
import { SuperTest, Test } from "supertest";

let assert = chai.assert;
let testServer: SuperTest<Test>;


describe('Koa Server', () => {
  it('stress_test_controller', async () => {
    testServer = request(httpServer);
    //
    // const response = await testServer
    //   .get('/')
    //   .send({})
    //   .expect(200);
    //
    // console.log(response.text);

    // assert.equal(response.text, 'home');
    assert.equal(1, 2);
      
  });
});
