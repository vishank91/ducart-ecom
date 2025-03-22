const mongoose = require("mongoose")

const CheckoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User Id is Mendatory"]
    },
    orderStatus: {
        type: String,
        default: "Order is Placed"
    },
    paymentMode: {
        type: String,
        default: "COD"
    },
    paymentStatus: {
        type: String,
        default: "Pending"
    },
    rppid: {
        type: String
    },
    subtotal: {
        type: Number,
        required: [true, "Subtotal Amount is Mendatory"]
    },
    shipping: {
        type: Number,
        required: [true, "Shipping Amount is Mendatory"]
    },
    total: {
        type: Number,
        required: [true, "Total Amount is Mendatory"]
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: [true, "Product Product Id is Mendatory"]
            },
            qty: {
                type: Number,
                required: [true, "Product Quantity is Mendatory"]
            },
            total: {
                type: Number,
                required: [true, "Total Amount is Mendatory"]
            }
        }
    ]
}, { timestamps: true })
const Checkout = new mongoose.model("Checkout", CheckoutSchema)

module.exports = Checkout