const User = require('../models/user'); 
const cryptoUtils = require('../utils/cryptoUtils');
const jwt = require('jsonwebtoken');
const sendEmail = require('../mailer');

require('dotenv').config();

exports.createUser = async ({ email, password }) => {
  // Перевірка на існування користувача з таким самим email
  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    throw new Error('Користувач з таким email вже існує.');
  }

  // Створення нового користувача
  const user = new User({
    email: email,
    password: password,
    // Додайте інші поля, якщо потрібно
  });

  // Збереження користувача в базі даних
  await user.save();
  return user;
};

exports.deleteUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('Користувача не знайдено.');
  }

  await User.findByIdAndDelete(userId);
  return { message: 'Користувача успішно видалено.' };
};

exports.authenticateUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Користувача з таким email не знайдено.');
  }

  if (!user.active) {
    throw new Error('Акаунт не активовано. Будь ласка, активуйте ваш акаунт.');
  }

  const isMatch = await cryptoUtils.comparePassword(password, user.password);
  if (!isMatch) {
    throw new Error('Неправильний пароль.');
  }

  const accessToken = cryptoUtils.generateAccessToken({ id: user.id }, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE });
  const refreshToken = cryptoUtils.generateRefreshToken({ id: user.id }, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE });
  return { accessToken, refreshToken };
};

exports.refreshAccessToken = async (refreshToken) => {
  try {
    const user = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);
    const accessToken = cryptoUtils.generateAccessToken({ id: user.id }, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE });
    return accessToken;
  } catch (error) {
    throw new Error(error);
  }
};

exports.sendActivationEmail = async (user) => {
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
};

exports.activateUser = async (activationToken) => {
  const user = await User.findOne({ activationToken });
  if (!user) {
    throw new Error('Неможливо знайти користувача з таким токеном активації.');
  }

  user.active = true;
  user.activationToken = ''; // Видалення токена після активації
  await user.save();
  return user; // Повернення користувача для подальшої аутентифікації
};

