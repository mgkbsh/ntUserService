require('newrelic')

const express = require('express');
const app = express();
const port = process.env.PORT || 1234;
const async = require('async');

const redis = require('redis');
const WORKERS = process.env.WEB_CONCURRENCY || 1;
const cluster = require('cluster');

// Code to run if we're in the master process
if (cluster.isMaster) {
  // Create a worker for each WORKERS
  for (var i = 0; i < WORKERS; i += 1) {
    console.log("Spawning workers")
    cluster.fork();
  }
  // Code to run if we're in a worker process
} else {

  const async = require('async');

  var https = require('https');
  https.globalAgent.maxSockets = Infinity;
  app.https=http

  var http = require('http');
  https.globalAgent.maxSockets = Infinity;
  app.http=http
  /* ===========BODY_PARSER=========== */
  const bodyParser = require('body-parser');

  function parallel(middlewares) {
    return function (req, res, next) {
        async.each(middlewares, function (mw, cb) {
            mw(req, res, cb);
        }, next);
    };
  }

  app.use(parallel([
      // Parse application/x-www-form-urlencoded
      bodyParser.urlencoded({ extended: false }),
      // Parse application/json
      bodyParser.json(),
      // Parse application/vnd.api+json as json
      bodyParser.json({ type: 'application/vnd.api+json' })

  ]));

  /* =============ROUTES============= */
  const user = require('./controllers/users')
  const router = express.Router();

  router.post('/follow', user.follow);
  router.post('/unfollow', user.unfollow);
  router.get('/followers', user.getFollowers);
  router.get('/followees', user.getFollowees);
  router.get('/user', user.getUser);

  app.use('/', router);

  app.listen(port);
}
