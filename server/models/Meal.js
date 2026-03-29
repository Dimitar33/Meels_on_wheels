
const mongoose = require("mongoose");
module.exports = mongoose.model("Meal", new mongoose.Schema({
  mealName: {type: String, required: true},
  price: {type: Number, required: true},
  description: {type: String, required: true},
  image: {type: String, required: true},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}));
