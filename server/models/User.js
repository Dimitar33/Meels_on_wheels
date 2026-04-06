
const mongoose = require("mongoose");
module.exports = mongoose.model("User", new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  bag: [
    {
      meal: { type: mongoose.Schema.Types.ObjectId, ref: "Meal" },
      quantity: { type: Number, default: 1 }
    }]
}));
