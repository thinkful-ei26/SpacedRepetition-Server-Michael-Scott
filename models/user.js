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
  email: {
    type: String
  },
  question: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" }
      // score: { type: Number, required: true},
      // next: {type: Number, required: true},
      // index: {type: Number, required: true}
    }
  ]
});

schema.methods.serialize = function() {
  return {
    username: this.username || "",
    firstName: this.firstName || "",
    id: this._id,
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
