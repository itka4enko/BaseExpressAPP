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
    .withMessage('Пароль повинен містити хоча б один спеціальний символ')
    .matches(/^\S*$/)
    .withMessage('Пароль не повинен містити пробіли')
]

const confirmPasswordValidation = [
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Паролі не співпадають')
];


module.exports = {
  emailValidation,
  passwordValidation,
  confirmPasswordValidation
};