"use strict";

/*
List the dataset.json files with the commands to populate data for testing here.


*/
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const passport = require("passport");
const { PORT, CLIENT_ORIGIN } = require("./config");
const { dbConnect } = require("./db-mongoose");
const userRouter = require("./routes/users");
const { router: authRouter, localStrategy, jwtStrategy } = require("./auth");
// const {dbConnect} = require('./db-knex');

const app = express();

app.use(
  morgan(process.env.NODE_ENV === "production" ? "common" : "dev", {
    skip: (req, res) => process.env.NODE_ENV === "test"
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

passport.use(localStrategy);
passport.use(jwtStrategy);
app.use("/users/", userRouter);
app.use("/auth/", authRouter);
const jwtAuth = passport.authenticate("jwt", { session: false });

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on("error", err => {
      console.error("Express failed to start");
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
