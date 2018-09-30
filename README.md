# Simple Async Errors

A simple library for handling async errors in controllers.
This makes it easier to create global error handlers and will
stop `UnhandledPromiseRejection` errors from showing up anymore.

## Installation

Install Async Errors using `npm`:

```
npm install --save-dev simple-async-errors
```

## Usage

Async functions are supported and will call a catcher for you when they throw:

```js
module.exports = require('simple-async-errors')({
  index: (req, res) => res.send('yay!')
});
```

Async functions on static and non-static memebers of classes
can be used as well:

```js
class TestController {
  async test(req, res) {
    res.send('yay');
  }

  static async test2(req, res) {
    res.send('yay');
  }
}

module.exports = require('simple-async-errors')(TestController);
```

They can also all be rolled up into deeply nested objects and still work!
Like when you have an `index` route file that exports all routes as an object.
Doing this will allow you to only run the async handler in a single location
instead of spread throughout all of your route files:

```js
// Error handler for all requests
const errorHandler = (req, res) => (err) => {
  switch (err.name) {
    case 'UnauthorizedError':
      return res.status(401).json({
        error: { message: err.message }
      });

    default:
      debug(err.name);
      debug(err);

      return res.status(500).json({
        error: config.debugMode ? err : 'Unknown Error'
      });
  }
};

module.exports = require('simple-async-errors')({
  TestController: require('./test'),
  HomeController: require('./home'),
}, errorHandler);
```
