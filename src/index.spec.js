/* eslint class-methods-use-this: 0 */
const asyncErrorWrapper = require('./index');

const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout));

class Testing {
  async testFail() { return Promise.reject(new Error('TEST_CLASS_ERROR')); }

  async testSuccess() { return Promise.resolve('TEST_CLASS_SUCCESS'); }

  testSync() { return 'TEST_CLASS_SYNC_SUCCESS'; }
}

describe('index', () => {
  const data = {
    num: 3,
    Test: Testing,
    test2: {
      testFn: () => Promise.reject(new Error('TEST_ERROR')),
      testSuccessFn: () => Promise.resolve('TEST_ASYNC_DATA'),
      testSyncFn: () => 'TEST_SYNC_DATA',
      num: 4,
    },
  };

  let wrappedData;

  beforeEach(() => {
    wrappedData = asyncErrorWrapper(data);
  });

  it('catches errors with custom catcher when one is passed', async () => {
    const catchFn = jest.fn();
    wrappedData = asyncErrorWrapper(data, () => catchFn);

    wrappedData.test2.testFn();

    await sleep(100);
    expect(catchFn).toHaveBeenCalledWith(new Error('TEST_ERROR'));
  });

  it('calls async function and returns result', async () => {
    const result = await wrappedData.test2.testSuccessFn();

    expect(result).toEqual('TEST_ASYNC_DATA');
  });

  it('calls sync function and returns result', () => {
    const result = wrappedData.test2.testSyncFn();

    expect(result).toEqual('TEST_SYNC_DATA');
  });

  it('catches async class function and catches error', async () => {
    console.warn = jest.fn();
    const testController = new wrappedData.Test();

    testController.testFail();

    await sleep(200);
    expect(console.warn).toHaveBeenCalled();
  });

  it('calls async class function and returns result', async () => {
    const testController = new wrappedData.Test();

    const result = await testController.testSuccess();

    expect(result).toEqual('TEST_CLASS_SUCCESS');
  });

  it('calls sync class function and returns result', () => {
    const testController = new wrappedData.Test();

    const result = testController.testSync();

    expect(result).toEqual('TEST_CLASS_SYNC_SUCCESS');
  });

  it('passes non-function data through', () => {
    expect(wrappedData.num).toEqual(data.num);
    expect(wrappedData.test2.num).toEqual(data.test2.num);
  });

  it('re-throws using default catcher when no catcher is passed', async () => {
    const catchFn = jest.fn();
    console.warn = jest.fn();

    wrappedData.test2.testFn().catch(catchFn);

    await sleep(100);
    expect(console.warn).toHaveBeenCalled();
    expect(catchFn).toHaveBeenCalled();
  });
});
