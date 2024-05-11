const User = require('../models/user'); 

exports.getUserInfo = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Користувача не знайдено.');
    }
    return {
        id: user._id,
        email: user.email,
        active: user.active
    };
  } catch (error) {
    throw new Error('Помилка при отриманні інформації про користувача.');
  }
};