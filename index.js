const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const data = require("./data");
const User = require("./User");

const allCharacters = [...data.characters, ...data.extras];

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:4200", "https://friends-app-rahul.vercel.app"],
  })
);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("DB Connected"))
  .catch((error) => console.error(error));

app.listen(3000);

app.get("/friends", (req, res) => {
  res.status(200).json({
    message: "Friends list fetched successfully",
    data: allCharacters,
  });
});

app.get("/friends/:name", (req, res) => {
  const name = req.params.name;
  const friend = allCharacters.find((character) => character.name === name);
  if (!friend) {
    res.status(404).json({ message: "Friend not fouund", data: {} });
    return;
  }
  res.status(200).json({ message: "Friend found", data: friend });
});

app.post("/auth/signup", (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username) {
      res.status(400).json({ message: "Username is required" });
      return;
    }
    if (!password) {
      res.status(400).json({ message: "Password is required" });
      return;
    }
    try {
      const user = User.create({ username, password });
      res.status(200).json({ message: "User created successfully" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/auth/login", (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username) {
      res.status(400).json({ message: "Username is required" });
      return;
    }
    if (!password) {
      res.status(400).json({ message: "Password is required" });
      return;
    }
    try {
      const user = User.findOne({ username: username, password: password });
      if (user) {
        const token = jwt.sign(
          { username: user.username, password: user.password },
          process.env.SECRET_KEY
        );
        res
          .status(200)
          .json({ message: "User login successfully", token: token });
      } else {
        res.status(400).json({ message: "Username or Password not correct" });
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

const authentication = (req, res, next) => {
  try {
    const token = req.body.token;
    if (token) {
      jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
        if (error) {
          res.status(400).json({ message: "User not authenticated" });
        } else {
          next();
        }
      });
    } else {
      res.status(400).json({ message: "User not authenticated" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
