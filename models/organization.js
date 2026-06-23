const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    extra: { type: String, default: '' },
    addedAt: { type: Date, default: Date.now }
});

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, default: 'school', enum: ['school', 'gym', 'hospital', 'clinic', 'office'] },
    members: [memberSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Organization', organizationSchema);