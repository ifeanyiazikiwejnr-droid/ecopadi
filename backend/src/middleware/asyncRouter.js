const express = require('express');

// A drop-in replacement for express.Router() that automatically catches
// errors thrown by async route handlers and forwards them to server.js's
// error-handling middleware — instead of becoming an unhandled promise
// rejection, which (since Node 15+) crashes the ENTIRE backend process.
//
// That crash is what "Failed to fetch" looks like from the browser: the
// connection just dies mid-request with no response at all, rather than a
// normal error message. A single unguarded route with a database error —
// e.g. a column that doesn't exist yet because a migration hasn't run —
// was enough to take the whole server down for every user until Render
// restarted it.
//
// Using this instead of express.Router() protects every route in a file
// automatically, including ones added later, with no per-route changes.
function createAsyncRouter() {
  const router = express.Router();
  ['get', 'post', 'put', 'delete', 'patch'].forEach((method) => {
    const original = router[method].bind(router);
    router[method] = (path, ...handlers) => {
      const wrapped = handlers.map((handler) => {
        if (typeof handler === 'function' && handler.constructor.name === 'AsyncFunction') {
          return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
        }
        return handler; // non-async middleware (e.g. multer) passes through untouched
      });
      return original(path, ...wrapped);
    };
  });
  return router;
}

module.exports = createAsyncRouter;
