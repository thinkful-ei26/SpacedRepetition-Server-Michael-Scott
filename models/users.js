"use strict";

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
  }
});

schema.methods.serialize = function() {
  return {
    username: this.username || "",
    firstName: this.firstName || "",
    id: this._id
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