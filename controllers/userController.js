const { createUser, deleteUser, authenticateUser, refreshAccessToken, sendActivationEmail, activateUser } = require('../services/authServices');
const { validationResult } = require('express-validator');
const utils = require('../utils/validationUtils');
const cryptoUtils = require('../utils/cryptoUtils');

exports.createUser = [
  utils.validateUserCreation,

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      credentials = { email: req.body.email, password: req.body.password }
      const user = await createUser(credentials);
      await sendActivationEmail(user);

      const anonymizedEmail = cryptoUtils.anonymizedEmail(user.email)

      res.status(201).json({ message: `Користувача створено успішно. Активаційний лист надіслано на імейл ${anonymizedEmail}` });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
];

exports.activateAccount = async (req, res) => {
  try {
    const user = await activateUser(req.params.token);
    const tokens = await authenticateUser({ email: user.email, password: user.password });

    res.json({ 
      message: 'Акаунт активовано успішно.',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const message = await deleteUser(req.userId);
    res.json(message);
  } catch (error) {
    res.status(error.status).json({ message: error.message });
  }
};

exports.token = [
  utils.validateAuthentication,

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const tokens = await authenticateUser(req.body);
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
];

exports.refreshToken = [
  utils.validateRefreshToken,

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const accessToken = await refreshAccessToken(req.body.refreshToken);
      res.json({ accessToken });
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  }
];

