const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const { User } = require("../models/user");
const router = express.Router();
const jsonParser = bodyParser.json();
const { ExtractJwt } = require("passport-jwt");
const Question = require("../models/question");
const jwtAuth = passport.authenticate("jwt", { session: false });

router.post("/", jsonParser, (req, res) => {
  const requiredFields = ["username", "password", "firstName"];
  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Missing field",
      lcoation: missingField
    });
  }
  const stringFields = ["username", "password", "firstName"];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== "string"
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Incorrect field type: expected string",
      location: nonStringField
    });
  }
  const explicityTrimmedFields = ["username", "password"];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Cannot start or end with whitespace",
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 10,
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      "min" in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      "max" in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
        : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let { username, password, firstName } = req.body;
  firstName = firstName.trim();

  /*
Auto populate the question when the user is being created.
We might want to create an extension of being able to add a new set of questions while keeping old data.
*/
  return User.find({ username })
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: "ValidationError",
          message: "Username already taken",
          location: "username"
        });
      }
      return User.hashPassword(password);
    })
    .then(hash => {
      return Question.find().then(questionset => {
        return { hash, questionset };
      });
    })
    .then(data => {
      return User.create({
        username,
        password: data.hash,
        firstName,
        question: data.questionset
      });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      if (err.reason === "ValidationError") {
        return res.status(err.code).json(err);
      }
      res.status(500).json({ code: 500, message: "Internal server error" });
    });
});

// normal version
//   return User.find({ username })
//     .count()
//     .then(count => {
//       console.log(questions);
//       if (count > 0) {
//         return Promise.reject({
//           code: 422,
//           reason: "ValidationError",
//           message: "Username already taken",
//           location: "username"
//         });
//       }
//       return User.hashPassword(password);
//     })
//     .then(hash => {
//       return User.create({
//         username,
//         password: hash,
//         firstName,
//         questions
//       });
//     })
//     .then(user => {
//       return res.status(201).json(user.serialize());
//     })
//     .catch(err => {
//       if (err.reason === "ValidationError") {
//         return res.status(err.code).json(err);
//       }
//       res.status(500).json({ code: 500, message: "Internal server error" });
//     });
// });

router.delete("/", jwtAuth, (req, res) => {
  const id = req.user.id;
  return User.findOneAndDelete({ _id: id })
    .then(users => res.json(users.serialize()))
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});
router.delete("/purge", (req, res) => {
  return User.deleteMany()
    .then(() => res.sendStatus(204))
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

router.get("/", (req, res) => {
  return User.find()
    .then(users => res.json(users.map(user => user.serialize())))
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

// create a route that adds a wrong questions to the user who made it
/*
Current objective is to be able to use this endpoint to update the scores using a postman request

*/
router.put("/submit", jwtAuth, (req, res) => {
  const id = req.user.id;
  console.log(req.user);
  console.log(req.body);
  const { updatedArr } = req.body;
  /* info from the body: array thats updated
   promise to put the new array in place
  */
  console.log(question);
  return User.findOneAndUpdate({ _id: id }, { question: updatedArr })
    .then(users => res.json(users.serialize()))
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

module.exports = router;
