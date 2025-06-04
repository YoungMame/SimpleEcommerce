const mongoose = require('mongoose');
const { cartItemSchema } = require("./cart.js");

const userSchema = mongoose.Schema(
    {
        email : {
            type: String,
            required: true,
            unique: true
        },
        password : {
            type: String,
            required: true
        },
        admin : {
            type: Boolean,
            required: true
        },
        cart : {
            type: [cartItemSchema],
            default: []
        },
        validated : {
            type: Boolean,
            default: false
        },
        firstname : {
            type: String,
            required: true
        },
        lastname : {
            type: String,
            required: true
        },
        birthdate : {
            type: Date,
            required: true
        },
        phone : {
            type:String,
            required: false
        },
        lang : {
            type:String,
            required: false
        },
        stripeCustomerId : {
            type:String,
            required: false
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('user', userSchema);