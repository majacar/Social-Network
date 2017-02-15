var port = process.env.PORT || 8008;

// init
var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');
var mongoose = require('mongoose');
var expressJwt = require('express-jwt');
var lusca = require('lusca');
var config = require('./config');
var AuthCheck = require('./config/auth_check');
var ErrorHandler = require('./config/error_handler');
var posix = require('posix');
var random = require('mongoose-simple-random');
var moment = require('moment');

require('http').globalAgent.maxSockets = Infinity;

// raise maximum number of open file descriptors to 10k,
// hard limit is left unchanged
if (process.env.NODE_ENV !== 'test' || process.env.NODE_ENV !== 'localhost') {
  posix.setrlimit('nofile', { soft: 10000, hard: 10000 });
}

// the app
var app = express();

// router and controllers
var router = express.Router();
var UsersController = require('./routes/users');
var ProfileController = require('./routes/profile');
var PostController = require('./routes/posts');

// include in the app
app.use(config.cors);
app.use(config.XPoweredBy);
app.use(compression());
app.use(bodyParser.json({ limit: '15mb' }));
app.use(expressJwt({
  secret: config.getTokenSecret(),
  getToken: function fromHeaderOrQuerystring (req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  }
}).unless({
  path: [
    '/api/v1/signup',
    '/api/v1/signin',
    '/api/v1/forgot',
    '/api/v1/reset'
  ]
}));

// security
app.use(lusca.xframe('ALLOWALL'));
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));

// Create the database connection
mongoose.connect(config.db());
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + config.db());
});

// CONNECTION EVENTS
// If the connection throws an error
mongoose.connection.on('error', function (err) {
  console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});

// When the connection is open
mongoose.connection.on('open', function () {
  console.log('Mongoose default connection is open');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

// routes
router
  .post('/signup', UsersController.signup)
  .post('/signin', UsersController.signin)
  .post('/forgot', UsersController.forgotPassword)
  .post('/reset', UsersController.resetPassword)
  .get('/me', AuthCheck.ensureAuth, ProfileController.me)
  .get('/profile/:_id', AuthCheck.ensureAuth, ProfileController.profile)
  .put('/edit/:id', AuthCheck.ensureAuth, ProfileController.edit)
  .post('/backgroundImage', AuthCheck.ensureAuth, ProfileController.backgroundImage)
  .post('/profilePicture', AuthCheck.ensureAuth, ProfileController.profilePicture)
  .get('/pictures/:userid', AuthCheck.ensureAuth, ProfileController.pictures)
  .post('/post/:userid', AuthCheck.ensureAuth, PostController.post)
  .post('/post', AuthCheck.ensureAuth, PostController.post);

app.use('/api/v1', router);

// error handler
app.use(ErrorHandler());

// start the app
app.listen(port, '0.0.0.0');

// show env vars
console.log('____________ SocialNetwork ____________');
console.log('Starting on port: ' + port);

if (process.env.NODE_ENV == 'test' || process.env.NODE_ENV == 'localhost') {
  // console.log(process.env);
}

console.log('_______________________________');

module.exports = app;
