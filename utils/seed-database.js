const mongoose = require('mongoose');

const { DATABASE_URL } = require('../config');

const Question = require('../models/question');


const {  questions  } = require('../db/seedDB');

console.log(`Connecting to mongodb at ${DATABASE_URL}`);
mongoose.connect(DATABASE_URL, { useNewUrlParser: true })
  .then(() => {
    console.info('Delete Data');
    return Promise.all([
      Question.deleteMany(),
    ]);
  })
  .then(() => {
    console.info('Seeding Database');
    return Promise.all([
      Question.insertMany(questions),
    ]);
  })
  .then(results => {
    console.log('Inserted', results);
    console.info('Disconnecting');
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    return mongoose.disconnect();
  });
