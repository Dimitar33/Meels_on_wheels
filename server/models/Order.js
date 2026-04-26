
const mongoose = require("mongoose");
module.exports = mongoose.model("Order", new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    meals: [{
        meal: { type: mongoose.Schema.Types.ObjectId, ref: "Meal" },
        quantity: { type: Number, default: 1 },
        price: { type: Number, default: 0 },
    }],
    total: { type: Number, default: 0},
    created: { type: Date, default: Date.now() }
}));
