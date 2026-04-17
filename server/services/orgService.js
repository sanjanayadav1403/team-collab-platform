const pool = require('../utils/db');

const createOrganisation = async(name, slug, ownerId) => {
    const result = await pool.query(
        `insert into organisations (name, slug, owner_id)
         values ($1, $2, $3)
         returning *`,
         [name, slug, ownerId]
    );
    return result.rows[0];
};

const addOrgMember = async(orgId, userId, role = 'member') => {
    const result = await pool.query(
        `insert into org_members (org_id, user_id, role)
        values ($1, $2, $3)
        returning *`,
        [orgId, userId, role]
    );
    return result.rows[0];
};

const getOrgsByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT o.id, o.name, o.slug, o.owner_id, o.created_at, om.role
     FROM organisations o
     JOIN org_members om ON o.id = om.org_id
     WHERE om.user_id = $1
     ORDER BY o.created_at ASC`,
    [userId]
  );
  return result.rows;
};

const getOrgById = async (orgId) => {
  const result = await pool.query(
    'SELECT * FROM organisations WHERE id = $1',
    [orgId]
  );
  return result.rows[0] || null;
};

const getOrgBySlug = async (slug) => {
  const result = await pool.query(
    'SELECT * FROM organisations WHERE slug = $1',
    [slug]
  );
  return result.rows[0] || null;
};

const getMemberRole = async (orgId, userId) => {
    const result = await pool.query(
        `select role from org_members where org_id = $1 and user_id = $2`,
        [orgId, userId]
    );
    return result.rows[0]?.role || null;
};

const isMember = async (orgId, userId) => {
  const result = await pool.query(
    'SELECT id FROM org_members WHERE org_id = $1 AND user_id = $2',
    [orgId, userId]
  );
  return result.rows.length > 0;
};

const updateMemberRole = async (orgId, userId, role) => {
  const result = await pool.query(
    `UPDATE org_members SET role = $1
     WHERE org_id = $2 AND user_id = $3
     RETURNING *`,
    [role, orgId, userId]
  );
  return result.rows[0] || null;
};
 
const getOrgMembers = async (orgId) => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.avatar_url, u.is_online, om.role, om.joined_at
     FROM users u
     JOIN org_members om ON u.id = om.user_id
     WHERE om.org_id = $1
     ORDER BY om.joined_at ASC`,
    [orgId]
  );
  return result.rows;
};
 
module.exports = {
  createOrganisation,
  addOrgMember,
  getOrgsByUserId,
  getOrgById,
  getOrgBySlug,
  getMemberRole,
  isMember,
  updateMemberRole,
  getOrgMembers,
};