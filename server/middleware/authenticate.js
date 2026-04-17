const {verifyToken} = require('../utils/jwt');
const {createError} = require('./errorHandler');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        //Check header exists and starts with bearer
        if(!authHeader || !authHeader.startsWith('Bearer')) {
            return next(createError(401, 'No token provided. Please log in.'));
        }

        //Extract token part after "Bearer"
        const token = authHeader.split(' ')[1];
 
        if (!token) {
        return next(createError(401, 'Malformed authorization header.'));
        }

        //Verify access token - throws if invalid or expired
        const decoded = verifyToken(token, process.env.JWT_ACCESS_SECRET);

        req.user = decoded;
        
        next();     
    } catch (error) {
        next(error);
    }
};

module.exports = authenticate;