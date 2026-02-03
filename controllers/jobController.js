const Job = require('../models/Job');
const User = require('../models/User');

exports.list = async (req, res) => {
  const q = req.query.q || '';
  const location = req.query.location || '';
  const filter = {};
  if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];
  if (location) filter.location = new RegExp(location, 'i');
  const jobs = await Job.find(filter).populate('employer', 'companyName email').sort({ createdAt: -1 }).lean();
  res.render('jobs/list', { jobs, q, location });
};

exports.myJobs = async (req, res) => {
  const jobs = await Job.find({ employer: req.session.user.id }).sort({ createdAt: -1 }).lean();
  res.render('jobs/my', { jobs });
};

exports.showCreate = (req, res) => res.render('jobs/form', { job: null });

exports.showEdit = async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, employer: req.session.user.id }).lean();
  if (!job) return res.redirect('/jobs/my');
  res.render('jobs/form', { job });
};

exports.create = async (req, res) => {
  await Job.create({
    employer: req.session.user.id,
    title: req.body.title,
    description: req.body.description,
    requirements: req.body.requirements,
    location: req.body.location,
    jobType: req.body.jobType || 'Full-time'
  });
  res.redirect('/jobs/my');
};

exports.update = async (req, res) => {
  await Job.findOneAndUpdate(
    { _id: req.params.id, employer: req.session.user.id },
    { title: req.body.title, description: req.body.description, requirements: req.body.requirements, location: req.body.location, jobType: req.body.jobType }
  );
  res.redirect('/jobs/my');
};

exports.delete = async (req, res) => {
  await Job.findOneAndDelete({ _id: req.params.id, employer: req.session.user.id });
  res.redirect('/jobs/my');
};

exports.showOne = async (req, res) => {
  const job = await Job.findById(req.params.id).populate('employer', 'companyName companyDescription email').lean();
  if (!job) return res.redirect('/jobs');
  res.render('jobs/detail', { job });
};
