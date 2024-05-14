const { createUser, deleteUser, authenticateUser, refreshAccessToken, activateUser, resetUserPassword } = require('../services/authServices');
const { getUserInfo } = require('../services/userServices');
const { sendActivationEmail, sendPasswordResetEmail } = require('../services/mailServices');
const { validationResult } = require('express-validator');
const validationUtilsutils = require('../utils/validationUtils');
const utils = require('../utils/utils');

exports.createUser = [
  validationUtilsutils.emailValidation,
  validationUtilsutils.passwordValidation,
  validationUtilsutils.confirmPasswordValidation,

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const credentials = { email: req.body.email, password: req.body.password }
      const user = await createUser(credentials);
      await sendActivationEmail(user._id);

      const anonymizedEmail = utils.anonymizedEmail(user.email)

      res.status(201).json({ message: `Користувача створено успішно. Активаційний лист надіслано на імейл ${anonymizedEmail}` });
    } catch (error) {
      next(error)
    }
  }
];

exports.userInfo = async (req, res, next) => {
  try {
    const userId = req.userId; 
    const userInfo = await getUserInfo(userId);
    res.json(userInfo);
  } catch (error) {
    next(error)
  }
};

exports.activateAccount = async (req, res, next) => {
  try {
    const user = await activateUser(req.params.token);

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено або неправильний токен активації.' });
    }

    res.json({ message: 'Акаунт активовано успішно. Тепер ви можете увійти в систему.' });
  } catch (error) {
    next(error)
  }
};

exports.passwordReset = [
  validationUtilsutils.emailValidation, 

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      userEmail = req.params.email
      await sendPasswordResetEmail(userEmail);
      const anonymizedEmail = utils.anonymizedEmail(userEmail)
      
      res.status(200).json({ message: `Посилання для відновлення пароля відправлено на ${anonymizedEmail}.` });
    } catch (error) {
      next(error)
    }
  }
];

exports.resetPassword = [
  validationUtilsutils.passwordValidation,
  validationUtilsutils.confirmPasswordValidation,

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      await resetUserPassword(req.params.token, req.body.password);
      res.status(200).json({ message: `Пароль успішно змінено.` });
    } catch (error) {
      next(error)
    }
  }
];

exports.deleteUser = async (req, res) => {
  try {
    const message = await deleteUser(req.userId);
    res.json(message);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.token = [
  validationUtilsutils.emailValidation,
  validationUtilsutils.passwordValidation,

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const tokens = await authenticateUser(req.body);
      res.json(tokens);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }
];

exports.refreshToken = [
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const accessToken = await refreshAccessToken(req.body.refreshToken);
      res.json({ accessToken });
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }
];

