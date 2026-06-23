const express = require('express');
const router = express.Router();
const SubAdmin = require('../models/subAdmin');
const Organization = require('../models/organization');
const OrgAccess = require('../models/subAdminOrganizationAccess');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middleware/auth');
const { requireOrgPermission } = require('../middleware/orgPermission');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// Sub Admin Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, organizationId } = req.body;
        if (!name || !email || !password || !organizationId) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const existing = await SubAdmin.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already registered.' });

        const org = await Organization.findById(organizationId);
        if (!org) return res.status(400).json({ message: 'Invalid organization selected.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const subAdmin = await SubAdmin.create({
            name, email, password: hashedPassword,
            organizationId, organization: org.name,
            organizationType: org.type, status: 'pending'
        });
        res.json({ message: '✅ Request sent! Please wait for Super Admin approval.', subAdmin });
    } catch (error) {
        res.status(500).json({ message: '❌ Error', error: error.message });
    }
});

// Sub Admin Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const subAdmin = await SubAdmin.findOne({ email });
        if (!subAdmin) return res.status(404).json({ message: '❌ Account not found!' });

        if (subAdmin.status === 'pending') {
            return res.status(403).json({ message: '⏳ Your request is still pending approval.' });
        }
        if (subAdmin.status === 'rejected') {
            return res.status(403).json({ message: '❌ Your request was rejected by Super Admin.' });
        }

        const hasApprovedOrg = await OrgAccess.exists({ subAdmin: subAdmin._id, status: 'approved' });
        if (!hasApprovedOrg) {
            return res.status(403).json({ message: '⏳ Still waiting for organization access approval.' });
        }

        const isMatch = await bcrypt.compare(password, subAdmin.password);
        if (!isMatch) return res.status(401).json({ message: '❌ Wrong password!' });

        const token = jwt.sign(
            { id: subAdmin._id, role: 'subadmin', name: subAdmin.name },
            JWT_SECRET, { expiresIn: '1d' }
        );
        res.json({ message: '✅ Login successful!', token });
    } catch (error) {
        res.status(500).json({ message: '❌ Error', error: error.message });
    }
});

// Get subadmin's organizations
router.get('/organization', authMiddleware(['subadmin']), async (req, res) => {
    try {
        const accesses = await OrgAccess.find({ subAdmin: req.user.id, status: 'approved' })
            .populate('organization');
        if (!accesses.length) return res.status(404).json({ message: '❌ No organization found!' });

        const orgs = accesses.map((a) => ({
            _id: a.organization._id,
            name: a.organization.name,
            type: a.organization.type,
            permissions: a.permissions,
        }));
        res.json({ organizations: orgs });
    } catch (error) {
        res.status(500).json({ message: '❌ Error', error: error.message });
    }
});

// Get all members
router.get('/users', authMiddleware(['subadmin']), requireOrgPermission(), async (req, res) => {
    try {
        const org = await Organization.findById(req.organizationId);
        if (!org) return res.status(404).json({ message: 'Organization not found' });
        res.json({ users: org.members || [] });
    } catch (error) {
        res.status(500).json({ message: '❌ Error', error: error.message });
    }
});

// Add a member
router.post('/users', authMiddleware(['subadmin']), requireOrgPermission({ requiredPermission: 'USER_ADD' }), async (req, res) => {
    try {
        const { name, email, phone, extra } = req.body;
        if (!name || !email) return res.status(400).json({ message: 'Name and email are required.' });

        const org = await Organization.findById(req.organizationId);
        if (!org) return res.status(404).json({ message: 'Organization not found' });

        const newMember = { name, email, phone: phone || '', extra: extra || '', addedAt: new Date() };
        org.members = org.members || [];
        org.members.push(newMember);
        await org.save();

        res.json({ message: '✅ Member added!', member: newMember });
    } catch (error) {
        res.status(500).json({ message: '❌ Error', error: error.message });
    }
});

// Remove a member
router.delete('/users/:memberId', authMiddleware(['subadmin']), requireOrgPermission({ requiredPermission: 'USER_REMOVE' }), async (req, res) => {
    try {
        const org = await Organization.findById(req.organizationId);
        if (!org) return res.status(404).json({ message: 'Organization not found' });

        org.members = (org.members || []).filter(
            (m) => m._id.toString() !== req.params.memberId
        );
        await org.save();
        res.json({ message: '✅ Member removed!' });
    } catch (error) {
        res.status(500).json({ message: '❌ Error', error: error.message });
    }
});

module.exports = router;