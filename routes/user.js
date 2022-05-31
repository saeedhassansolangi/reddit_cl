const express = require('express');
const router = express.Router();
const { User } = require('../controllers/user');
const passportConfig = require('../services/passport');
const passport = require('passport');

router.get('/register', User.showSignUpForm);
router.get('/login', User.showLoginForm);
router.post('/register/new', User.addUser);
router.get('/logout', User.userLogout);
router.get('/:username', User.userProfile);
router.get('/:username/profile', User.updateLoggedInUserProfile);
router.put('/:username/:userId/profile', User.updateProfile);
router.get('/:username/submit', User.allowUserNewPost);
router.get('/:username/avatar', User.changeAvatar);
router.post('/:username/update', User.updateAvatar);
router.post(
    '/login',
    passport.authenticate('local', {
        failureRedirect: '/user/login',
    }),
    function (req, res) {
        req.flash("success","Welcome back "+ req.user.username.toUpperCase())
        res.redirect('/');
    }
);

module.exports = router;
