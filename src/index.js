const defaultCatcher = () => (err) => {
  console.warn('WARNING: Using Default Error Handler (this just re-throws the exception)');

  throw err;
};

function catchAsyncError(fn, catcher) {
  return function catchErrorHandler(...params) {
    const routePromise = fn.call(this, ...params);

    if (routePromise && routePromise.catch) {
      return routePromise.catch(catcher(...params));
    }

    return routePromise;
  };
}

const asyncErrorWrapper = (arr, catcher = defaultCatcher) => {
  const retArray = { ...arr };

  Object.keys(arr).forEach((key) => {
    if (arr[key].prototype) {
      retArray[key] = arr[key];
      Object.getOwnPropertyNames(retArray[key].prototype).forEach((prop) => {
        if (prop === 'constructor') { return; }

        retArray[key].prototype[prop] = catchAsyncError(retArray[key].prototype[prop], catcher);
      });
    } else if (typeof arr[key] === 'function') {
      retArray[key] = catchAsyncError(arr[key], catcher);
    } else if (typeof arr[key] === 'object') {
      retArray[key] = asyncErrorWrapper(arr[key], catcher);
    } else {
      retArray[key] = arr[key];
    }
  });

  return retArray;
};

module.exports = asyncErrorWrapper;
