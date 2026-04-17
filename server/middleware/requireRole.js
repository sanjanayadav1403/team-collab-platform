const pool = require('../utils/db');
const {createError} = require('./errorHandler');

const requireRole = (role) => {
    return async (req, res, next) => {
        try {
           const userId = req.user.id;
           const {orgId} = req.params;
           
           if(!orgId) {
            return next(createError(400, 'Organisation ID is required in route params.'));
           }

           const result = await pool.query(
            `select role from org_members where org_id = $1 and user_id = $2`,
            [orgId, userId]
           );

           if(result.rows.length === 0) {
            return next(createError(403, 'You are not a member of this organisation.'));
           }

           const userRole = result.rows[0].role;

           if(role==='admin' && userRole!=='admin') {
            return next(createError(403, 'Admin access required for this action.'));
           }

           req.userRole = userRole;

           next();
        } catch (error) {
            next(err);
        }
    };
};

module.exports = requireRole;