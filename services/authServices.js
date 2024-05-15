const User = require('../models/user'); 
const jwt = require('jsonwebtoken');
const { sendActivationEmail } = require('../services/mailServices');


require('dotenv').config();

exports.createUser = async ({ email, password }) => {
  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    const error = new Error();
    error.message = "Користувач з таким email вже існує."
    error.status = 409
    throw error;
  }

  const user = new User({
    email: email,
    password: password,
  });

  await user.save();
  return user;
};

exports.deleteUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Користувача не знайдено.');
      error.status = 404;
      throw error;
    }

    await User.findByIdAndDelete(userId);
    return { message: 'Користувача успішно видалено.' };
  } catch (error) {
    throw error
  }
};

exports.authenticateUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error('Користувача з таким email не знайдено.');
    error.status = 404;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Неправильний пароль.');
    error.status = 401;
    throw error;
  }

  if (!user.active) {
    await sendActivationEmail(user._id);
    const error = new Error('Акаунт не активовано. Активаційний лист повторно надіслано на вашу електронну адресу.'); 
    error.status = 403;
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
    error = new Error();
    error.status = 401
    error.message = 'Невірний токен аутентифікації'
    throw error
  }
};

exports.activateUser = async (activationToken) => {
  try {
    const payload = jwt.verify(activationToken, process.env.JWT_ACTIVATION);
    const user = await User.findOne({ _id: payload.id});
    if (!user) {
      error = new Error();
      error.status = 404
      error.message = 'Неможливо знайти користувача з таким ID або токеном активації.'
      throw error
    }

    user.active = true;
    await user.save();
    return user; 
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      error.status = 401
      error.message = 'Токен активації застарів.'
    } else if(error.status != 404) {
      error.status = 400
      error.message = 'Помилка при перевірці токена.'
    }

    throw error
  }
};

exports.resetUserPassword = async (token, newPassword) => {
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_PASSWORD_RESET);
    const userId = decodedToken.id; 

    const user = await User.findById(userId);
    if (!user) {
      error = new Error();
      error.status = 404
      error.message = 'Користувача з таким ID не знайдено.'
      throw error
    }

    user.password = newPassword;
    await user.save();

    return user; 
  } catch (error) {
    if (error.status != 404){
      error.status = 400
    }
    throw error
  }
};

