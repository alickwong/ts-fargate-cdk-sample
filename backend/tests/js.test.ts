import * as chai from 'chai';
import PerformanceService from '../src/services/PerformanceService';

let assert = chai.assert;
describe('NodeJs Playground', () => {
  it('mocha test', async () => {
    let a: number = 123;
    console.log(a);
    assert.equal(a, 123);
  }).timeout(10000);

  it('performance service', () => {
    let performanceService = new PerformanceService();
    performanceService.startTimer();

    performanceService.addTimeLog('test 1');
    let logList = performanceService.getTimeLogList();

    console.log(logList);
    assert.equal(logList.length, 123);
    
  });
});
