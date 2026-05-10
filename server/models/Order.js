
const mongoose = require("mongoose");
module.exports = mongoose.model("Order", new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    total: { type: Number, default: 0},
    created: { type: Date, default: Date.now() }
}));
