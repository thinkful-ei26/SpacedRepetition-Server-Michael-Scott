const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");

const Question = require("../models/question");

const router = express.Router();

const jwtAuth = passport.authenticate("jwt", {
  session: false,
  failWithError: true
});

router.get("/", jwtAuth, (req, res, next) => {
  const userId = req.user.id;
  console.log("the user id is ", req.user.id);
  Question.findOne()
    .sort({ createdAt: "desc" })
    .then(sessions => {
      res.json(sessions);
    })
    .catch(err => {
      next(err);
    });
});

router.get("/all", (req, res, next) => {
  Question.find()
    .sort({ createdAt: "desc" })
    .then(sessions => {
      res.json(sessions);
    })
    .catch(err => {
      next(err);
    });
});

router.post("/", jwtAuth, (req, res, next) => {
  const newQuestion = req.body;
  const userId = req.user.id;
  newQuestion.userId = userId;
  console.log("the user id is ", userId);

  Question.create(newQuestion)
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      next(err);
    });
});

//
router.get("/nextquestion", jwtAuth, (req, res, next) => {
  /*
  Create a call to a funtion that will determine the next question depending on the score.
  */
  const word = req.body;

  Question.findOne({})
    .sort({ createdAt: "desc" })
    .then(sessions => {
      res.json(sessions);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
