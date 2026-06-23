const OrgAccess = require('../models/subAdminOrganizationAccess');

const hasPermission = (permissions = [], required) => {
  if (!required) return true;
  if (Array.isArray(required)) {
    return required.every((p) => permissions.includes(p));
  }
  return permissions.includes(required);
};

const requireOrgPermission = ({ requiredPermission } = {}) => {
  return async (req, res, next) => {
    try {
      // organizationId kisi bhi jagah se lo
      const orgId =
        req.body?.organizationId ||
        req.params?.organizationId ||
        req.query?.organizationId;

      // Agar organizationId nahi hai to subadmin ki pehli approved org use karo
      if (!orgId) {
        const access = await OrgAccess.findOne({
          subAdmin: req.user.id,
          status: 'approved',
        });
        if (!access) {
          return res.status(403).json({ message: 'Forbidden: no access to any organization' });
        }
        if (!hasPermission(access.permissions, requiredPermission)) {
          return res.status(403).json({ message: 'Forbidden: missing required permission' });
        }
        req.orgAccess = access;
        req.organizationId = access.organization.toString();
        return next();
      }

      const access = await OrgAccess.findOne({
        subAdmin: req.user.id,
        organization: orgId,
        status: 'approved',
      });

      if (!access) {
        return res.status(403).json({ message: 'Forbidden: no access to this organization' });
      }

      if (!hasPermission(access.permissions, requiredPermission)) {
        return res.status(403).json({ message: 'Forbidden: missing required permission' });
      }

      req.orgAccess = access;
      req.organizationId = orgId;
      return next();
    } catch (err) {
      return res.status(500).json({ message: 'Server error' });
    }
  };
};

module.exports = { requireOrgPermission };