const jwt = require('jsonwebtoken');

//Generate access token
const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '15m'});
};

//Used to issue new access tokens without re-login
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '7d'});
};

//Generate invite token
const generateInviteToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_INVITE_SECRET, {expiresIn: '24h'});
}

//Verify token
const verifyToken = (token, secret) => {
    return jwt.verify(token, secret);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateInviteToken,
    verifyToken
};