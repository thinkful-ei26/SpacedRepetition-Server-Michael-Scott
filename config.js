"use strict";
// Create a .env file
module.exports = {
  PORT: process.env.PORT || 8080,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "mongodb://dev:111111a@ds163705.mlab.com:63705/language-database",
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL ||
    "mongodb://localhost/thinkful-backend-test",
  JWT_SECRET: "strog",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "7d"
  // DATABASE_URL:
  //     process.env.DATABASE_URL || 'postgres://localhost/thinkful-backend',
  // TEST_DATABASE_URL:
  //     process.env.TEST_DATABASE_URL ||
  //     'postgres://localhost/thinkful-backend-test'
};
