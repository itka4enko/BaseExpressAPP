const User = require('../models/user'); 

exports.getUserInfo = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error();
      error.message = "Користувача не знайдено."
      error.status = 404
      throw error;
    }
    return {
        id: user._id,
        email: user.email,
        active: user.active
    };
  } catch (error) {
    if (error.status != 404){
      error.status = 400
    }
    throw error
  }
};