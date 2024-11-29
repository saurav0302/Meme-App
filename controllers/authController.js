const User = require('../model/user');

const signup = async (req, res) => {
    try {
        const data = req.body;
        await User.create(data);
        res.render('login', { message: 'Registration successful! Please login.' });
    } catch (error) {
        res.render('signup', { message: 'Registration failed. Please try again.' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await user.comparePassword(password))) {
            return res.render('login', { message: 'Invalid email or password' });
        }
        
        req.session.user = user;
        res.redirect('/meme');
    } catch (error) {
        res.render('login', { message: 'Login failed. Please try again.' });
    }
};

const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
};

module.exports = { signup, login, logout };