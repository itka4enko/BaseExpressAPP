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

const generateActivationToken = () => {
    return crypto.randomBytes(20).toString('hex');
};

const anonymizedEmail = (email) => {
    return email.replace(/(.{1}).+(.{1}@.+)/, "$1*****$2");
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    comparePassword,
    generateActivationToken, 
    anonymizedEmail
};
  