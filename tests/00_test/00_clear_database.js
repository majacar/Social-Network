var mongoose = require('mongoose');

after(function (done) {
  mongoose.connection.db.dropDatabase(function (err, result) {
    console.log('db collections dropped');
    mongoose.disconnect();
    done();
  });
});
