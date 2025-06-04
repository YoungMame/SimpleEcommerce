const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI

module.exports = async function connectDB() {
    try {
        return await mongoose.connect(uri)
    } catch (error) {
        throw new Error(error)
    }
}
