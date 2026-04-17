const express = require('express');
const router = express.Router();
const {
  createOrg,
  getMyOrgs,
  getMembers,
  inviteMember,
  joinOrg,
  changeMemberRole,
} = require('../controllers/orgController');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');

/**
 * Org Routes — all mounted at /api/orgs
 * All routes require authentication (logged-in user).
 *
 * POST   /api/orgs                              — create organisation
 * GET    /api/orgs/me                           — get my organisations
 * POST   /api/orgs/join                         — join via invite token
 * GET    /api/orgs/:orgId/members               — list org members
 * POST   /api/orgs/:orgId/invite                — invite member (admin only)
 * PATCH  /api/orgs/:orgId/members/:userId/role  — change member role (admin only)
 */

router.post('/', authenticate, createOrg);
router.get('/me', authenticate, getMyOrgs);

// IMPORTANT: /join must come BEFORE /:orgId routes
// Otherwise Express will match "join" as an :orgId param
router.post('/join', authenticate, joinOrg);

router.get('/:orgId/members', authenticate, getMembers);
router.post('/:orgId/invite', authenticate, requireRole('admin'), inviteMember);
router.patch('/:orgId/members/:userId/role', authenticate, requireRole('admin'), changeMemberRole);

module.exports = router;