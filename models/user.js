const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  progress: { type: Number, default: 0 },
  correct: {
    type: Boolean,
    default: null
  },
  last: {
    type: String,
    default: null
  },
  question: [],
  head: { type: Number, default: 0 },
  tail: { type: Number, default: 9 }
});

schema.methods.serialize = function() {
  return {
    username: this.username || "",
    firstName: this.firstName || "",
    id: this._id,
    head: this.head,
    tail: this.tail
    // question: this.question
  };
};

schema.methods.getQuestions = function() {
  return {
    question: this.question
  };
};

schema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

schema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 11);
};

const User = mongoose.model("User", schema);

module.exports = { User };
