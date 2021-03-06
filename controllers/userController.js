const promisify = require('es6-promisify');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const mail = require('../handlers/mail');

function setUserInfo(user) {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gravatar: user.gravatar
    }
};

function generateToken(user) {
    return jwt.sign(user, process.env.SECRET, {
        expiresIn: 10080 // in seconds
    });
};

exports.login = function (req, res, next) {
    const user = setUserInfo(req.user);

    res.json({
        success: true,
        token: 'JWT ' + generateToken(user),
        message: `Welcome ${user.name}`,
        user
    });
};

exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name');
    req.checkBody('name', 'You must supply a name').notEmpty();
    req.checkBody('email', 'That Email is not valid').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        gmail_remove_dots: false,
        gmail_remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'You must supply a password').notEmpty();
    req.checkBody('confirm', 'You must supply a password').notEmpty();
    req.checkBody('confirm', 'Passwords do not match').equals(req.body.password);

    const errors = req.validationErrors()

    if (errors) {
        const errMessages = errors.map(e => e.msg).join(', ');
        return res.json({
            success: false,
            message: `Invalid Email or password: ${errMessages}`,
        });
    }

    next();
};

exports.register = async (req, res, next) => {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });
    // If user is not unique, return error
    if (existingUser) {
        return res.json({ success: false, message: 'That email address is already in use.' });
    }

    const user = new User({ email, password, name });

    const newUser = await user.save();

    req.user = setUserInfo(newUser);
    next();
};

exports.updateAccount = async (req, res) => {
    const updates = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: updates },
        { new: true, runValidators: true, context: 'query' }
    );

    return res.json({ success: true, user, message: 'Your profile has been updated!' });
};

exports.logout = (req, res) => {
    req.logout();
    return res.json({
        success: true,
        message: 'You are now logged out'
    });
};

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        return res.json({
            success: false,
            message: 'You should log in first to do that'
        });
    }
};

exports.forgot = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.json({ success: false, message: 'No user exists with that Email address' })
    }

    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 Hour from now

    await user.save();
    const resetURL = `https://${req.headers.host}/auth/reset/${user.resetPasswordToken}`;

    await mail.send({ user, subject: 'Password Reset', resetURL, filename: 'password-reset' });

    res.json({ success: true, message: `An reset link has been sent to ${user.email}` });
};

exports.verifyResetToken = async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.json({
            success: false,
            message: 'Password reset token is either invalid or has expired'
        });
    }

    return res.json({
        success: true,
        message: 'Token is valid'
    });
}

exports.confirmedPasswords = (req, res, next) => {
    if (req.body.password === req.body['password-confirm']) {
        return next();
    }
    return res.json({
        success: false,
        message: 'Passwords do not match'
    });
};

exports.update = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        return res.json({
            success: false,
            message: 'Password reset token is invalid or has expired'
        });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    const updatedUser = await user.save();
    return res.json({ success: true, message: 'Your password has been updated!' });
};