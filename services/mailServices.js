const sendEmail = require('../mailer');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

require('dotenv').config();


exports.sendActivationEmail = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Користувача не знайдено.');
    }

    const activationToken = jwt.sign({id: user._id, }, process.env.JWT_ACTIVATION, { expiresIn: process.env.ACTIVATION_TOKEN_EXPIRE }); 

    const activationUrl = `http://${process.env.FRONTEND_URL}/users/activate/${activationToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Активація вашого акаунта',
      text: `Для активації вашого акаунта, будь ласка, перейдіть за цим посиланням: ${activationUrl}`,
      html: ``
    });
  } catch (error) {
    throw new Error('Не вдалося відправити активаційний лист.');
  }
};

exports.sendPasswordResetEmail = async (email) => {
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error('Користувача не знайдено.');
    }
  
    const resetToken = jwt.sign({id: user._id, }, process.env.JWT_PASSWORD_RESET, { expiresIn: process.env.RESET_TOKEN_EXPIRE });
    const resetUrl = `http://${process.env.FRONTEND_URL}/users/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Відновлення пароля',
      text: `Для відновлення пароля, будь ласка, перейдіть за цим посиланням: ${resetUrl}`,
      html: ``
    });
  } catch (error) {
    throw new Error('Не вдалося відправити лист для відновлення пароля.');
  }
};