
const mongoose = require("mongoose");
module.exports = mongoose.model("Note", new mongoose.Schema({
  text: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}));
