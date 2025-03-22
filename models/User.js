const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Full Name is Mendatory"]
    },
    username: {
        type: String,
        required: [true, "User Name is Mendatory"],
        unique: true
    },
    email: {
        type: String,
        required: [true, "User Email Address is Mendatory"],
        unique: true
    },
    phone: {
        type: String,
        required: [true, "User Phone Number is Mendatory"]
    },
    password: {
        type: String,
        required: [true, "Password is Mendatory"]
    },
    role: {
        type: String,
        default: "Buyer"
    },
    address: {
        type: String
    },
    pin: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    otp: {
        type: Number,
        default: -2345654
    },
    otpTime: {
        type: Date
    },
    otpCounter: {
        type: Number,
        default: 0
    },
    pic: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    }
})
const User = new mongoose.model("User", UserSchema)

module.exports = User