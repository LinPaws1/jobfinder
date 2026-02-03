const Interview = require('../models/Interview');
const Job = require('../models/Job');

exports.myInterviews = async (req, res) => {
  const user = req.session.user;
  let interviews;
  if (user.role === 'jobseeker') {
    interviews = await Interview.find({ jobSeeker: user.id }).populate('job').populate('employer', 'companyName email').sort({ createdAt: -1 }).lean();
  } else {
    interviews = await Interview.find({ employer: user.id }).populate('job').populate('jobSeeker', 'fullName email').sort({ createdAt: -1 }).lean();
  }
  res.render('interviews/list', { interviews });
};

exports.showRequest = async (req, res) => {
  const job = await Job.findById(req.params.jobId).populate('employer').lean();
  if (!job) return res.redirect('/jobs');
  res.render('interviews/request', { job });
};

exports.request = async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.redirect('/jobs');
  await Interview.create({
    job: job._id,
    jobSeeker: req.session.user.id,
    employer: job.employer,
    preferredDate: req.body.preferredDate || undefined,
    preferredTime: req.body.preferredTime,
    message: req.body.message,
    status: 'pending'
  });
  res.redirect('/interviews');
};

exports.approve = async (req, res) => {
  await Interview.findOneAndUpdate(
    { _id: req.params.id, employer: req.session.user.id, status: 'pending' },
    { status: 'confirmed', confirmedDate: req.body.confirmedDate || undefined, confirmedTime: req.body.confirmedTime }
  );
  res.redirect('/interviews');
};

exports.decline = async (req, res) => {
  await Interview.findOneAndUpdate(
    { _id: req.params.id, employer: req.session.user.id, status: 'pending' },
    { status: 'cancelled' }
  );
  res.redirect('/interviews');
};

exports.cancel = async (req, res) => {
  const interview = await Interview.findById(req.params.id).lean();
  if (!interview) return res.redirect('/interviews');
  const canCancel = interview.jobSeeker.toString() === req.session.user.id || interview.employer.toString() === req.session.user.id;
  if (canCancel) await Interview.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
  res.redirect('/interviews');
};
