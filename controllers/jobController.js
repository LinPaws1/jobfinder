const Job = require('../models/Job');
const User = require('../models/User');
const Interview = require('../models/Interview');

exports.list = async (req, res) => {
  try {
    const location = req.query.location || '';
    const jobType = req.query.jobType || '';
    const title = req.query.title || '';
    const filter = {};
    if (location) filter.location = location;
    if (jobType) filter.jobType = jobType;
    if (title) filter.title = title;
    const jobs = await Job.find(filter).populate('employer', 'companyName email').sort({ createdAt: -1 }).lean();

    // Job seeker's interviews for dashboard
    const interviews = await Interview.find({ jobSeeker: req.session.user.id })
      .populate('job')
      .populate('employer', 'companyName email')
      .sort({ createdAt: -1 })
      .lean();

    // Build location, job type and job title dropdowns from ALL jobs in DB (not filtered)
    const allJobs = await Job.find({}).select('location jobType title').lean();
    const locationCounts = {};
    const jobTypeCounts = {};
    const titleCounts = {};
    allJobs.forEach(job => {
      const loc = (job.location && job.location.trim()) || null;
      if (loc) {
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
      }
      const type = (job.jobType && job.jobType.trim()) || 'Full-time';
      jobTypeCounts[type] = (jobTypeCounts[type] || 0) + 1;
      const jobTitle = (job.title && job.title.trim()) || null;
      if (jobTitle) {
        titleCounts[jobTitle] = (titleCounts[jobTitle] || 0) + 1;
      }
    });
    const locationsWithCount = Object.entries(locationCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([value, count]) => ({ value, count }));
    const jobTypesWithCount = Object.entries(jobTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, count }));
    const titlesWithCount = Object.entries(titleCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([value, count]) => ({ value, count }));

    res.render('jobs/list', { jobs, interviews: interviews || [], location, jobType, title, locationsWithCount, jobTypesWithCount, titlesWithCount });
  } catch (err) {
    console.error('jobs list error:', err);
    res.render('jobs/list', { jobs: [], interviews: [], location: '', jobType: '', title: '', locationsWithCount: [], jobTypesWithCount: [], titlesWithCount: [] });
  }
};

exports.myJobs = async (req, res) => {
  const jobs = await Job.find({ employer: req.session.user.id }).sort({ createdAt: -1 }).lean();
  // Employer's interviews with applicant profile (fullName, location, skills, experience, email)
  const interviews = await Interview.find({ employer: req.session.user.id })
    .populate('job')
    .populate('jobSeeker', 'fullName email location skills experience')
    .sort({ createdAt: -1 })
    .lean();
  res.render('jobs/my', { jobs, interviews: interviews || [] });
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
