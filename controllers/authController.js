const User = require('../models/User');

exports.showLogin = (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('auth/login', { error: null });
};

exports.showRegister = (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('auth/register', { error: null });
};

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.render('auth/register', { error: 'Email, password and account type are required.' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.render('auth/register', { error: 'Email already registered.' });
    const user = await User.create({ email, password, role });
    req.session.user = { id: user._id, email: user.email, role: user.role };
    if (user.role === 'employer') return res.redirect('/jobs/my');
    res.redirect('/jobs');
  } catch (err) {
    res.render('auth/register', { error: err.message || 'Registration failed.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.render('auth/login', { error: 'Email and password required.' });
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('auth/login', { error: 'Invalid email or password.' });
    }
    req.session.user = { id: user._id, email: user.email, role: user.role };
    if (user.role === 'employer') return res.redirect('/jobs/my');
    res.redirect('/jobs');
  } catch (err) {
    res.render('auth/login', { error: err.message || 'Login failed.' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};
