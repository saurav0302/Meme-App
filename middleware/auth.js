const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        console.log('User is not authenticated');
        return res.redirect('/login');
    }
    next();
};

module.exports = { isAuthenticated };