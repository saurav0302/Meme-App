const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const { signup, login, logout } = require('../controllers/authController');
const { getMeme, getNewMeme } = require('../controllers/memeController');

const router = express.Router();

// Base routes
router.get('/', (req, res) => res.redirect('/signup'));

// Auth routes
router.get('/signup', (req, res) => res.render('signup', { message: '' }));
router.post('/signup', signup);
router.get('/login', (req, res) => res.render('login', { message: '' }));
router.post('/login', login);
router.get('/logout', logout);

// Meme routes
router.get('/meme', isAuthenticated, getMeme);
router.get('/new-meme', isAuthenticated, getNewMeme);

module.exports = router;