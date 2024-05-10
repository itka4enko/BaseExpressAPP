const { check, body } = require('express-validator');

const validateUserCreation = [
    body('email')
    .notEmpty()
    .withMessage('Імейл користувача обов\'язковий'),

    body('password')
        .notEmpty()
        .withMessage('Пароль користувача обов\'язковий'), 
    
    // Перевірка на співпадіння пароля та його підтвердження
    body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Паролі не співпадають'),

    // Валідація електронної пошти
    check('email')
        .isEmail()
        .withMessage('Неправильний формат електронної пошти'),

    // Валідація пароля
    check('password')
    .isLength({ min: 8 })
    .withMessage('Пароль має бути не менше 8 символів')
    .matches(/\d/)
    .withMessage('Пароль повинен містити хоча б одну цифру')
    .matches(/[A-Z]/)
    .withMessage('Пароль повинен містити хоча б одну велику літеру')
    .matches(/[\W_]/)
    .withMessage('Пароль повинен містити хоча б один спеціальний символ'),
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
  validateUserCreation,
  validateAuthentication,
  validateRefreshToken
};