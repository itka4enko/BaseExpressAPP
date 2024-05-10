const User = require('../models/user'); 
const cryptoUtils = require('../utils/cryptoUtils');
const jwt = require('jsonwebtoken');
const sendEmail = require('../mailer');

require('dotenv').config();

exports.createUser = async ({ email, password }) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Перевірка на існування користувача з таким самим email
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        return reject({ status: 400, message: 'Користувач з таким email вже існує.' });
      }

      // Створення нового користувача
      const user = new User({
        email: email,
        password: password,
        // Додайте інші поля, якщо потрібно
      });

      // Збереження користувача в базі даних
      await user.save();
      resolve({ user });
    } catch (error) {
      reject(error);
    }
  });
};

exports.deleteUser = async (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return reject({ status: 404, message: 'Користувача не знайдено.' });
      }

      await User.findByIdAndDelete(userId);
      resolve({ message: 'Користувача успішно видалено.' });
    } catch (error) {
      reject(error);
    }
  });
};

exports.authenticateUser = async ({ email, password }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return reject({ status: 401, message: 'Користувача з таким email не знайдено.' });
      }

      if (!user.active) {
        return reject({ status: 403, message: 'Акаунт не активовано. Будь ласка, активуйте ваш акаунт.' });
      }

      const isMatch = await cryptoUtils.comparePassword(password, user.password);
      if (!isMatch) {
        return reject({ status: 401, message: 'Неправильний пароль.' });
      }

      const accessToken = cryptoUtils.generateAccessToken({ id: user.id }, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE });
      const refreshToken = cryptoUtils.generateRefreshToken({ id: user.id }, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE });
      resolve({ accessToken, refreshToken });
    } catch (error) {
      reject(error);
    }
  });
};

exports.refreshAccessToken = async (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH, (err, user) => {
      if (err) {
        reject(err);
      } else {
        const accessToken = cryptoUtils.generateAccessToken({ id: user.id }, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE });
        resolve(accessToken);
      }
    });
  });
};

exports.sendActivationEmail = async (user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const activationToken = cryptoUtils.generateActivationToken();
      user.activationToken = activationToken;
      await user.save();

      const activationUrl = `${process.env.FRONTEND_URL}/activate/${activationToken}`;

      await sendEmail({
        to: user.email,
        subject: 'Активація вашого акаунта',
        text: `Для активації вашого акаунта, будь ласка, перейдіть за цим посиланням: ${activationUrl}`,
        html: `<p>Для активації вашого акаунта, будь ласка, <a href="${activationUrl}">перейдіть за цим посиланням</a>.</p>`
      });

      resolve();
    } catch (error) {
      reject('Помилка при відправці активаційного листа: ' + error.message);
    }
  });
};

exports.activateUser = (activationToken) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({ activationToken });
      if (!user) {
        reject('Неможливо знайти користувача з таким токеном активації.');
      } else {
        user.active = true;
        user.activationToken = ''; // Видалення токена після активації
        await user.save();
        resolve(user); // Повернення користувача для подальшої аутентифікації
      }
    } catch (error) {
      reject('Помилка при активації користувача: ' + error.message);
    }
  });
};

