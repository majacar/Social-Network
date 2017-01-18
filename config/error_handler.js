module.exports = function () {
  return function (err, req, res, next) {

    if (process.env.NODE_ENV != 'test') {
      console.log(err);
    }

    var status = 500;
    var errorCode = 0;
    var message = 'Oops, an error occurred';

    if (err.name === 'AccessTokenError') {
      status = 401;
      message = 'You don\'t have proper permissions';
      errorCode = 1;
    }

    if (err.name === 'DatabaseConnectionError') {
      status = 500;
      message = 'Cannot connect to database';
      errorCode = 2;
    }

    if (err.name === 'UnauthorizedError') {
      message = 'Invalid token';
      errorCode = 3;
      status = 401;
    }

    if (err.name == 'MissingParamsError') {
      message = 'Missing parameters';
      errorCode = 4;
      status = 400;
    }

    if (err.name == 'DuplicateEmailError') {
      status = 406;
      message = 'This email address is already registered';
      errorCode = 5;
    }

    if (err.name == 'ValidEmailError') {
      message = 'Please fill a valid email address';
      errorCode = 6;
      status = 400;
    }

    if (err.name == 'UploadImageError') {
      status = 500;
      message = 'Something went wrong during image upload';
      errorCode = 7;
    }

    if (err.name == 'CredentialsError') {
      status = 401;
      message = 'Wrong credentials';
      errorCode = 8;
    }

    if (err.name == 'EmailNotSentError') {
      status = 500;
      message = 'Email not sent';
      errorCode = 9;
    }

    if (err.name == 'NotAcceptable') {
      status = 406;
      message = 'Not acceptable';
      errorCode = 10;
    }

    if (err.name == 'NotFound') {
      status = 404;
      message = 'Not Found';
      errorCode = 11;
    }

    if (err.name == 'MongoSaveError') {
      status = 500;
      message = err.message;
      errorCode = 12;
    }

    if (err.name == 'InvalidUserType') {
      status = 403;
      message = 'Invalid user type';
      errorCode = 14;
    }

    if (err.name == 'Forbidden') {
      status = 403;
      message = 'Insufficient privileges';
      errorCode = 15;
    }

    if (err.name == 'AlreadyAdded') {
      status = 406;
      message = 'User already added';
      errorCode = 16;
    }

    if (err.name == 'EmailDoesNotExist') {
      status = 404;
      message = 'User with this email address does not exist';
      errorCode = 17;
    }

    if (err.name == 'InvalidMethod') {
      status = 400;
      message = 'Invalid Request Method';
      errorCode = 18;
    }

    if (err.name == 'InvalidImageType') {
      status = 406;
      message = 'Invalid Image Type';
      errorCode = 18;
    }

    if (err.name == 'DuplicateUsernameError') {
      status = 406;
      message = 'This username is already registered';
      errorCode = 22;
    }

    if (err.name == 'DuplicateNameError') {
      status = 406;
      message = 'This name is already registered';
      errorCode = 23;
    }

    if (err.message) {
      message = err.message;
    }

    res.status(status).send({
      status: 'error',
      errorCode: errorCode,
      message: message
    });
  };
};
