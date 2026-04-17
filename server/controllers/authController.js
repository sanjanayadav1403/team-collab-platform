const bcrypt = require('bcryptjs');
const {createUser, findUserByEmail, findUserById} = require('../services/authService');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require('../utils/jwt');
const { createError } = require('../middleware/errorHandler');
const SALT_ROUNDS = 12;

const register = async (req, res, next) => {
    try {
        const {name, email, password} = req.body;

        if(!email || !name || !password) {
            return next(createError(400, 'Name, email, and password are required.'));
        }

        if(password.length < 6) {
            return next(createError(400, 'Password must be at least 6 characters.'));
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return next(createError(400, 'Please provide a valid email address.'));
        }

        const existingUser = await findUserByEmail(email.toLowerCase());
        if(existingUser) {
            return next(createError(409, 'An account with this email already exists.'));
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const user = await createUser(name.trim(), email.toLowerCase(), passwordHash);

        const accessToken = generateAccessToken({ id: user.id, email: user.email, name: user.name });
        const refreshToken = generateRefreshToken({id: user.id, email: user.email});

        return res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            data: {
                user,
                accessToken,
                refreshToken,
            },
        });
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            return next(createError(400, 'Email and password are required.'));
        }

        const user = await findUserByEmail(email.toLowerCase());
        if(!user) {
            return next(createError(401, 'Invalid email or password'));
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if(!isMatch) {
            return next(createError(401, 'Invalid email or password.'));
        }

        const accessToken = generateAccessToken({ id: user.id, email: user.email, name: user.name });
        const refreshToken = generateRefreshToken({ id: user.id, email: user.email });
    
        //Return user without password_hash
        const { password_hash, ...safeUser } = user;
    
        return res.status(200).json({
            success: true,
            message: 'Logged in successfully.',
            data: {
                user: safeUser,
                accessToken,
                refreshToken,
            },
        });
    } catch (err) {
        next(err);
    }
};

const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
    
        if (!refreshToken) {
            return next(createError(400, 'Refresh token is required.'));
        }
    
        //Verify the refresh token
        let decoded;
        try {
            decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (err) {
            return next(createError(401, 'Invalid or expired refresh token. Please log in again.'));
        }
    
        //Verify user still exists
        const user = await findUserById(decoded.id);
        if (!user) {
            return next(createError(401, 'User no longer exists.'));
        }
    
        //Issue new access token
        const newAccessToken = generateAccessToken({ id: user.id, email: user.email });
    
        return res.status(200).json({
            success: true,
            message: 'Access token refreshed.',
            data: {
                accessToken: newAccessToken,
            },
        });
    } catch (err) {
        next(err);
    }
};

const me = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
 
    if (!user) {
      return next(createError(404, 'User not found.'));
    }
 
    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};
 
module.exports = { register, login, refresh, me };