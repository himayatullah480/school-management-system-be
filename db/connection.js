const mongoose = require("mongoose");

const connectdb = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/orgSystem');
        console.log('✅ MongoDB Connected!');
    } catch (error) {
        console.log('❌ MongoDB connection failed:', error.message);
    }
}

module.exports = connectdb;