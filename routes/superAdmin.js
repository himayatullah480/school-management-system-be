const express = require('express');
const router = express.Router();
const SubAdmin = require('../models/subAdmin');
const Organization = require('../models/organization');
const OrgAccess = require('../models/subAdminOrganizationAccess');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/superAdmin');
const { authMiddleware } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// Super Admin Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existing = await SuperAdmin.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already registered.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const superAdmin = await SuperAdmin.create({ name, email, password: hashedPassword });
        res.json({ message: '✅ Super Admin created!', superAdmin });
    } catch (error) {
        res.status(500).json({ message: '❌ Error', error: error.message });
    }
});

// Super Admin Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const superAdmin = await SuperAdmin.findOne({ email });
        if (!superAdmin) return res.status(404).json({ message: '❌ Admin not found!' });

        const isMatch = await bcrypt.compare(password, superAdmin.password);
        if (!isMatch) return res.status(401).json({ message: '❌ Wrong password!' });

        const token = jwt.sign(
            { id: superAdmin._id, role: 'superadmin', name: superAdmin.name },
            JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.json({ message: '✅ Login successful!', token });
    } catch (error) {
        res.status(500).json({ message: '❌ Error', error: error.message });
    }
});

// GET all organizations - PUBLIC (sub admin signup dropdown ke liye)
router.get('/organizations', async (req, res) => {
    try {
        const orgs = await Organization.find({}, '_id name type');
        res.json({ organizations: orgs });
    } catch (error) {
        res.status(500).json({ message: '❌ Error', error: error.message });
    }
});

// All Pending Requests with organization name
router.get('/requests', authMiddleware(['superadmin']), async (req, res) => {
    try {
        const requests = await SubAdmin.find({ status: 'pending' });
        const enriched = await Promise.all(requests.map(async (r) => {
            const obj = r.toObject();
            if (r.organizationId) {
                const org = await Organization.findById(r.organizationId).select('name type');
                obj.organizationName = org ? `${org.name} (${org.type})` : r.organizationId;
            } else {
                obj.organizationName = r.organization || 'N/A';
            }
            return obj;
        }));
        res.json(enriched);
    } catch (error) {
        res.status(500).json({ message: '❌ Error', error: error.message });
    }
});

// Approve Sub Admin
router.put('/approve/:id', authMiddleware(['superadmin']), async (req, res) => {
    try {
        const subAdmin = await SubAdmin.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        );
        if (!subAdmin) return res.status(404).json({ message: '❌ Sub Admin not found!' });

        const organization = await Organization.findById(subAdmin.organizationId);
        if (!organization) {
            return res.status(400).json({ message: '❌ Organization not found. Cannot approve.' });
        }

        const existing = await OrgAccess.findOne({ subAdmin: subAdmin._id, organization: organization._id });
        if (!existing) {
            await OrgAccess.create({
                subAdmin: subAdmin._id,
                organization: organization._id,
                permissions: ['USER_ADD', 'USER_REMOVE'],
                status: 'approved',
            });
        }

        res.json({ message: '✅ Sub Admin approved!', subAdmin });
    } catch (error) {
        res.status(500).json({ message: '❌ Error', error: error.message });
    }
});

// Reject Sub Admin
router.put('/reject/:id', authMiddleware(['superadmin']), async (req, res) => {
    try {
        const subAdmin = await SubAdmin.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        );
        if (!subAdmin) return res.status(404).json({ message: '❌ Sub Admin not found!' });
        res.json({ message: '✅ Sub Admin rejected!', subAdmin });
    } catch (error) {
        res.status(500).json({ message: '❌ Error', error: error.message });
    }
});
// GET all organizations - PUBLIC
router.get('/organizations', async (req, res) => {
    try {
        const orgs = await Organization.find({}, '_id name type');
        res.json({ organizations: orgs });
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
});

module.exports = router;