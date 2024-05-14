const jwt = require('jsonwebtoken');

require('dotenv').config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).send({ message: 'Не авторизовано' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: err });
    }

    // Зберегти ID користувача для подальшої обробки
    req.userId = decoded.id;
    next();
  });
}

module.exports = authenticateToken;
