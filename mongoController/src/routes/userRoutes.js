const express = require('express');
const router = express.Router();
const { userSining, login } = require('../controler/userContolers');

router.post('/singup', userSining);
router.post('/login', login);

module.exports = userRoutes;
