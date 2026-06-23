const mongoose = require('mongoose');

const superAdminSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: 'superadmin' }
});

module.exports = mongoose.model('SuperAdmin', superAdminSchema);