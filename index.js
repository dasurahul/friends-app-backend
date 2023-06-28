const express = require("express");
const cors = require("cors");

const data = require("./data");

const allCharacters = [...data.characters, ...data.extras];

const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

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
