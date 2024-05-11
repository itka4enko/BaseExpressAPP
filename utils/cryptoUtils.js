const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateAccessToken = (user, expires) => {
    return jwt.sign(user, process.env.JWT_SECRET, expires);
};
const generateRefreshToken = (user, expires) => {
    return jwt.sign(user, process.env.JWT_SECRET_REFRESH, expires);
};

const comparePassword = async (candidatePassword, userPassword) => {
    try {
        return await bcrypt.compare(candidatePassword, userPassword);
    } catch (error) {
        throw error;
    }
};

const generateActivationToken = (user) => {
    const payload = {
      id: user._id, 
    };
  
    return jwt.sign(payload, process.env.JWT_ACTIVATION, { expiresIn: process.env.ACTIVATION_TOKEN_EXPIRE }); 
};

const generateResetToken = (user) => {
    const payload = {
      id: user._id, 
    };
  
    return jwt.sign(payload, process.env.JWT_PASSWORD_RESET, { expiresIn: process.env.RESET_TOKEN_EXPIRE }); 
};

const anonymizedEmail = (email) => {
    return email.replace(/(.{1}).+(.{1}@.+)/, "$1*****$2");
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    comparePassword,
    generateActivationToken, 
    anonymizedEmail,
    generateActivationToken,
    generateResetToken
};
  