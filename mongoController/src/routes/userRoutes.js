const express = require('express');
const router = express.Router();
const { login } = require('../controler/userContolers');

router.post('/login', login);

module.exports = userRoutes;
