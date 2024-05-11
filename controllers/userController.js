const { createUser, deleteUser, authenticateUser, refreshAccessToken, activateUser, resetUserPassword } = require('../services/authServices');
const { getUserInfo } = require('../services/userServices');
const { sendActivationEmail, sendPasswordResetEmail } = require('../services/mailServices');
const { validationResult } = require('express-validator');
const utils = require('../utils/validationUtils');
const cryptoUtils = require('../utils/cryptoUtils');

exports.createUser = [
  utils.emailValidation,
  utils.passwordValidation,

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      credentials = { email: req.body.email, password: req.body.password }
      const user = await createUser(credentials);
      await sendActivationEmail(user._id);

      const anonymizedEmail = cryptoUtils.anonymizedEmail(user.email)

      res.status(201).json({ message: `Користувача створено успішно. Активаційний лист надіслано на імейл ${anonymizedEmail}` });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
];

exports.userInfo = async (req, res) => {
  try {
    const userId = req.userId; 
    const userInfo = await getUserInfo(userId);
    res.json(userInfo);
  } catch (error) {
    res.status(500).json({ message: 'Помилка при отриманні інформації про користувача.' });
  }
};

exports.activateAccount = async (req, res) => {
  try {
    const user = await activateUser(req.params.token);

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено або неправильний токен активації.' });
    }

    res.json({ message: 'Акаунт активовано успішно. Тепер ви можете увійти в систему.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.passwordReset = async (req, res) => {
  try {
    await sendPasswordResetEmail(req.params.email);
    res.status(200).json({ message: `Посилання для відновлення пароля відправлено.` });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.resetPassword = [
  utils.passwordValidation,

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await resetUserPassword(req.params.token, req.body.password);
      res.status(200).json({ message: `Пароль успішно змінено.` });
    } catch (error) {
      res.status(500).json(error);
    }
  }
];

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

