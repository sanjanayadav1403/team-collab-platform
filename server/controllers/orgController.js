const {
    createOrganisation,
    addOrgMember,
    getOrgsByUserId,
    getOrgById,
    getMemberRole,
    isMember,
    updateMemberRole,
    getOrgMembers,
} = require('../services/orgService');
const { findUserByEmail, findUserById } = require('../services/authService');
const { generateInviteToken, verifyToken } = require('../utils/jwt');
const { createError } = require('../middleware/errorHandler');
const { sendInviteEmail } = require('../services/emailService');

const generateSlug = (name) => {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // remove special chars
    .replace(/\s+/g, '-')            // spaces to hyphens
    .replace(/-+/g, '-');            // collapse multiple hyphens
 
  const suffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${suffix}`;
};

const createOrg = async (req, res, next) => {
  try {
    const {name} = req.body;

    if(!name || name.trim().length < 2) {
      return next(createError(400, 'Organisation name must be at least 2 characters.'));
    }

    const slug = generateSlug(name);

    const org = await createOrganisation(name.trim(), slug, req.user.id);

    await addOrgMember(org.id, req.user.id, 'admin');

    return res.status(201).json({
      success: true,
      message: 'Organisation created successfully.',
      data: {org},
    });
  } catch (err) {
    next(err);
  }
};

const getMyOrgs = async (req, res, next) => {
  try {
    const orgs = await getOrgsByUserId(req.user.id);

    return res.status(200).json({
      success: true,
      data: {orgs},
    });
  } catch (err) {
    next(err);
  }
};

const getMembers = async (req, res, next) => {
  try {
    const {orgId} = req.params;
    const role = await getMemberRole(orgId, req.user.id);
    if(!role) {
      return next(createError(403, 'You are not a member of this organisation.'));
    }
    const members = await getOrgMembers(orgId);
    return res.status(200).json({
      success: true,
      data: {members},
    });
  } catch (err) {
    next(err);
  }
};

const inviteMember = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const { email } = req.body;
 
    if (!email) {
      return next(createError(400, 'Email address is required.'));
    }
 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(createError(400, 'Please provide a valid email address.'));
    }
 
    // Check org exists
    const org = await getOrgById(orgId);
    if (!org) {
      return next(createError(404, 'Organisation not found.'));
    }
 
    // Check if user with this email already a member
    const invitedUser = await findUserByEmail(email.toLowerCase());
    if (invitedUser) {
      const alreadyMember = await isMember(orgId, invitedUser.id);
      if (alreadyMember) {
        return next(createError(409, 'This user is already a member of the organisation.'));
      }
    }
 
    // Get inviter's name for the email
    const inviter = await findUserById(req.user.id);
 
    // Generate signed invite token: { email, orgId }
    const inviteToken = generateInviteToken({
      email: email.toLowerCase(),
      orgId,
    });
 
    // Build the invite link (frontend handles this route)
    const inviteLink = `${process.env.CLIENT_URL}/join?token=${inviteToken}`;
 
    // Send the email
    await sendInviteEmail(email.toLowerCase(), org.name, inviteLink, inviter.name);
 
    return res.status(200).json({
      success: true,
      message: `Invitation sent to ${email}.`,
    });
  } catch (err) {
    next(err);
  }
};

const joinOrg = async (req, res, next) => {
  try {
    const { token } = req.body;
 
    if (!token) {
      return next(createError(400, 'Invite token is required.'));
    }
 
    // Verify invite token
    let decoded;
    try {
      decoded = verifyToken(token, process.env.JWT_INVITE_SECRET);
    } catch (err) {
      return next(createError(400, 'Invite link is invalid or has expired.'));
    }
 
    const { email, orgId } = decoded;
 
    // Logged-in user's email must match the invited email
    if (req.user.email !== email) {
      return next(
        createError(403, `This invite was sent to ${email}. Please log in with that account.`)
      );
    }
 
    // Check org exists
    const org = await getOrgById(orgId);
    if (!org) {
      return next(createError(404, 'Organisation not found.'));
    }
 
    // Check if already a member
    const alreadyMember = await isMember(orgId, req.user.id);
    if (alreadyMember) {
      return next(createError(409, 'You are already a member of this organisation.'));
    }
 
    // Add user as member
    await addOrgMember(orgId, req.user.id, 'member');
 
    return res.status(200).json({
      success: true,
      message: `You have successfully joined ${org.name}.`,
      data: { org },
    });
  } catch (err) {
    next(err);
  }
};
 
const changeMemberRole = async (req, res, next) => {
  try {
    const { orgId, userId } = req.params;
    const { role } = req.body;
 
    if (!role || !['admin', 'member'].includes(role)) {
      return next(createError(400, "Role must be either 'admin' or 'member'."));
    }
 
    // Prevent admin from changing their own role
    if (userId === req.user.id) {
      return next(createError(400, 'You cannot change your own role.'));
    }
 
    // Check target user is actually a member
    const targetRole = await getMemberRole(orgId, userId);
    if (!targetRole) {
      return next(createError(404, 'This user is not a member of the organisation.'));
    }
 
    const updated = await updateMemberRole(orgId, userId, role);
 
    return res.status(200).json({
      success: true,
      message: 'Member role updated successfully.',
      data: { member: updated },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
    createOrg,
    getMyOrgs,
    getMembers,
    inviteMember,
    joinOrg,
    changeMemberRole,
};