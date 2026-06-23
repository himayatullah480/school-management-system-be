const mongoose = require('mongoose');

const accessSchema = new mongoose.Schema({
  subAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubAdmin',
    required: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },

  
  permissions: {
    type: [String],
    default: [],
  },


  status: {
    type: String,
    default: 'approved', 
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});


accessSchema.index({ subAdmin: 1, organization: 1 }, { unique: true });

module.exports = mongoose.model('SubAdminOrganizationAccess', accessSchema);

