const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: false 
  }
});


// Перед збереженням користувача в базі даних, шифруємо пароль
userSchema.pre('save', function(next) {
  // Шифруємо пароль тільки якщо він був змінений або користувач новий
  if (!this.isModified('password')) return next();

  // Генерація "солі" для шифрування
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    // Шифрування пароля з використанням солі
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      // Заміна пароля на зашифрований
      this.password = hash;
      next();
    });
  });
});

// Метод для перевірки пароля при вході користувача
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
