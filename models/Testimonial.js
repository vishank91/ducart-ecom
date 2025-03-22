const mongoose = require("mongoose")

const TestimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is Mendatory"]
    },
    pic: {
        type: String,
        required: [true, "Pic is Mendatory"],
    },
    message: {
        type: String,
        required: [true, "Message is Mendatory"],
    },
    active: {
        type: Boolean,
        default: true
    }
})
const Testimonial = new mongoose.model("Testimonial", TestimonialSchema)

module.exports = Testimonial