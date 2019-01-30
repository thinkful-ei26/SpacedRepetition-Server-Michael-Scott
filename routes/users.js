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

/*
return a single question to the client
next level return based on algorithm
*/
router.get("/next", jwtAuth, (req, res) => {
  const id = req.user.id;
  /*
  
  Create Algorithm logic so that we do these things:
  1. set head value to the new value
    promise to User.something to set value PUT request
  2. determine the spot for the answered question depending on m value

  3. set the next values for the item being reentered into the list
  4. add checks to length so that an item with higher m value than length goes to the end

*/

  return User.findOne({ _id: id })
    .then(user => {
      console.log(user.head);
      console.log("test :", user.getQuestions().question[user.head]);
      res.json(user.getQuestions().question[user.head]);
    })
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

router.put("/submit", jwtAuth, (req, res) => {
  const userId = req.user.id;
  const { answer } = req.body;

  // return res.sendStatus(200);

  /*
  input: answer
  output: modified the correct question with score and changing the nexts/head

  when looping through the elements if the   

  */

  return User.findOne({ _id: userId })
    .then(users => {
      let temp = users.getQuestions().question;
      // then access the headith item of the
      console.log(answer);
      console.log(temp[users.head].answer);

      if (temp[users.head].answer === answer) {
        temp[users.head].score *= 2;
        // console.log(temp.length);
        // console.log(temp[users.head].score);
        if (temp[users.head].score >= temp.length) {
          let switcher = temp[users.head].next;
          // console.log(switcher);
          temp[users.tail].next = users.head;
          users.tail = users.head;
          temp[users.head].next = null;
          users.head = switcher;
        } else {
          // place the item at the score index and dont mess up the next
          // traverse score items then place item
          let currNode = temp[users.head];
          let prevNode = temp[users.head];
          let i = 0;
          // // can be above or below depending on this greater than symbol

          while (i < temp[users.head].score) {
            prevNode = currNode;
            currNode = temp[currNode.next];
            i++;
          }
          // switch all the pointers to match correctly
          let tempH = prevNode.next;
          let tempP = temp[users.head].next;
          prevNode.next = users.head;
          temp[users.head].next = tempH;
          users.head = tempP;
          console.log("head :", users.head);
        }
        // if its not greater than array length
      } else {
        temp[users.head].score = 1;
      }

      // console.log(temp[users.head].next);
      // console.log(temp[temp[users.head].next]);
      users.questions = temp;
      users.questions.forEach(element => {
        console.log("/////////////");
        console.log(element.answer);
        console.log(element.score);
        console.log(element.next);
        console.log("/////////////");
      });

      return users;
    })
    .then(revised => {
      console.log("end");
      console.log("head :", revised.head);
      return User.findOneAndUpdate(
        { _id: userId },
        { question: revised.question, head: revised.head, tail: revised.tail },
        { new: true }
      ).then(() => res.sendStatus(200));
    })
    .catch(err => res.status(500).json(err));
});

module.exports = router;
