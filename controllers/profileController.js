const User = require('../models/User');

exports.showEdit = async (req, res) => {
  const user = await User.findById(req.session.user.id).lean();
  if (!user) return res.redirect('/login');
  res.render('profiles/edit', { profile: user });
};

exports.update = async (req, res) => {
  const id = req.session.user.id;
  const updates = req.body;
  delete updates.email;
  delete updates.password;
  delete updates.role;
  await User.findByIdAndUpdate(id, { $set: updates });
  if (req.session.user.role === 'employer') return res.redirect('/jobs/my');
  res.redirect('/jobs');
};
