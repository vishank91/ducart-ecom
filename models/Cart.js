const mongoose = require("mongoose")

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User Id is Mendatory"]
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product Id is Mendatory"]
    },
    qty: {
        type: Number,
        required: [true, "Product Quantity is Mendatory"]
    },
    total: {
        type: Number,
        required: [true, "Total Amount is Mendatory"]
    }
})
const Cart = new mongoose.model("Cart", CartSchema)

module.exports = Cart