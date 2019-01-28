const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  answer: {type: String, required: false},
  question:  {type: String, required: false},

});

// Add `createdAt` and `updatedAt` fields
sessionSchema.set('timestamps', true);

// Transform output during `res.json(data)`, `console.log(data)` etc.
sessionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
  }
});

module.exports = mongoose.model('Question', sessionSchema);
