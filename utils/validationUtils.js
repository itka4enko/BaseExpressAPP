const { check, body } = require('express-validator');

const emailValidation = [
  check('email')
    .notEmpty()
    .withMessage('Імейл користувача обов\'язковий')
    .isEmail()
    .withMessage('Неправильний формат електронної пошти'),
];

const passwordValidation = [
  body('password')
    .notEmpty()
    .withMessage('Пароль користувача обов\'язковий')
    .isLength({ min: 8 })
    .withMessage('Пароль має бути не менше 8 символів')
    .matches(/\d/)
    .withMessage('Пароль повинен містити хоча б одну цифру')
    .matches(/[A-Z]/)
    .withMessage('Пароль повинен містити хоча б одну велику літеру')
    .matches(/[\W_]/)
    .withMessage('Пароль повинен містити хоча б один спеціальний символ'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Паролі не співпадають')
];

const validateAuthentication = [
  // Валідація електронної пошти та пароля
  check('email').notEmpty().withMessage('Імейл обов\'язковий для аутентифікації'),
  check('password').notEmpty().withMessage('Пароль обов\'язковий для аутентифікації'),
];

const validateRefreshToken = [
  // Перевірка наявності refresh токена
  check('refreshToken').notEmpty().withMessage('Refresh token обов\'язковий для оновлення'),
];

module.exports = {
  emailValidation,
  passwordValidation,
  validateAuthentication,
  validateRefreshToken
};