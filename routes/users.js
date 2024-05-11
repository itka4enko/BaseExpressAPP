let express = require('express');
let router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');

router.get('/user-info', authenticateToken, userController.userInfo)

router.post('/register', userController.createUser)
router.post('/activate/:token', userController.activateAccount);

router.post('/token', userController.token)
router.post('/token/refresh', userController.refreshToken)

router.post('/password-reset/:email', userController.passwordReset)
router.post('/reset-password/:token', userController.resetPassword)

router.delete('/delete-user', authenticateToken, userController.deleteUser);

module.exports = router;
