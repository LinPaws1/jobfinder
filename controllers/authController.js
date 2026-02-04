const User = require('../models/User');

exports.showLogin = (req, res) => {
  if (req.session.user) return res.redirect('/');
  const as = req.query.as === 'employer' ? 'employer' : 'jobseeker';
  res.render('auth/login', { error: null, as });
};

exports.showRegister = (req, res) => {
  if (req.session.user) return res.redirect('/');
  const role = req.query.role === 'employer' ? 'employer' : 'jobseeker';
  res.render('auth/register', { error: null, role });
};

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.render('auth/register', { error: 'Email, password and account type are required.', role: role || 'jobseeker' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.render('auth/register', { error: 'Email already registered.', role: role || 'jobseeker' });
    const user = await User.create({ email, password, role });
    req.session.user = { id: user._id, email: user.email, role: user.role };
    if (user.role === 'employer') return res.redirect('/jobs/my');
    res.redirect('/profiles/edit?welcome=1');
  } catch (err) {
    res.render('auth/register', { error: err.message || 'Registration failed.', role: (req.body && req.body.role) || 'jobseeker' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.render('auth/login', { error: 'Email and password required.', as: req.query.as || 'jobseeker' });
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('auth/login', { error: 'Invalid email or password.', as: req.query.as || 'jobseeker' });
    }
    req.session.user = { id: user._id, email: user.email, role: user.role };
    if (user.role === 'employer') return res.redirect('/jobs/my');
    res.redirect('/jobs');
  } catch (err) {
    res.render('auth/login', { error: err.message || 'Login failed.', as: req.query.as || 'jobseeker' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};
