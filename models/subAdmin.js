const mongoose = require('mongoose');

const subAdminSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,

    // Organization request details
    // We now store selected organizationId for approval flow
    organization: String, // legacy: organization name
    organizationType: { type: String, default: 'school' }, // legacy
    organizationId: { type: String }, // new: Organization ObjectId as string


    status: { 
        type: String, 
        default: 'pending'  // pending, approved, rejected
    },
    role: { type: String, default: 'subadmin' }
});


module.exports = mongoose.model('SubAdmin', subAdminSchema);