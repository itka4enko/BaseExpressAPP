const User = require('../models/user'); 
const jwt = require('jsonwebtoken');
const { sendActivationEmail } = require('../services/mailServices');


require('dotenv').config();

exports.createUser = async ({ email, password }) => {
  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    throw new Error('Користувач з таким email вже існує.');
  }

  const user = new User({
    email: email,
    password: password,
  });

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

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Неправильний пароль.');
  }

  if (!user.active) {
    await sendActivationEmail(user._id);
    const error = new Error('Акаунт не активовано. Активаційний лист повторно надіслано на вашу електронну адресу.');
    error.status = 401; 
    throw error;
  }

  const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE });
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_REFRESH, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE });

  return { accessToken, refreshToken };
};

exports.refreshAccessToken = async (refreshToken) => {
  try {
    const user = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE });
    return accessToken;
  } catch (error) {
    throw new Error(error);
  }
};

exports.activateUser = async (activationToken) => {
  try {
    const payload = jwt.verify(activationToken, process.env.JWT_ACTIVATION);
    const user = await User.findOne({ _id: payload.id});
    if (!user) {
      throw new Error('Неможливо знайти користувача з таким ID або токеном активації.');
    }

    user.active = true;
    await user.save();
    return user; 
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Токен активації застарів.');
    } else {
      throw new Error('Помилка при перевірці токена.');
    }
  }
};

exports.resetUserPassword = async (token, newPassword) => {
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_PASSWORD_RESET);
    const userId = decodedToken.id; 

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Користувача з таким ID не знайдено.');
    }

    user.password = newPassword;
    await user.save();

    return user; 
  } catch (error) {
    throw new Error('Помилка при скиданні пароля.');
  }
};

