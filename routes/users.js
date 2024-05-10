let express = require('express');
let router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');

/* GET users listing. */
router.post('/register', userController.createUser)
router.get('/activate/:token', authenticateToken, userController.activateAccount);

router.post('/token', userController.token)
router.post('/token/refresh', userController.refreshToken)
router.delete('/delete-user', authenticateToken, userController.deleteUser);

module.exports = router;
