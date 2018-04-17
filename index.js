const express = require('express');
const app = express();
const port = process.env.PORT || 1234;
var https = require('https');
https.globalAgent.maxSockets = Infinity;
app.https=http

var http = require('http');
https.globalAgent.maxSockets = Infinity;
app.http=http
/* ===========BODY_PARSER=========== */
const bodyParser = require('body-parser');
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Parse application/json
app.use(bodyParser.json());
// Parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

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
