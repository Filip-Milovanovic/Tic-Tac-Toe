const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/middlewares");

router.delete("/register/:id", verifyJWT, (req, res) => {
  if (req.data.id == req.params.id) {
    console.log("DELETED");
    res.status(200).json("User has been deleted");
  } else {
    console.log("YOU CANT DELETE ME");
    res.status(403).json("You are not allowed to delete this user.");
  }
});

module.exports = router;
