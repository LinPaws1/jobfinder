const mongoose = require('mongoose');
const Interview = require('../models/Interview');
const Job = require('../models/Job');

exports.myInterviews = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const error = req.query.error || null;
    let interviews;
    if (req.session.user.role === 'jobseeker') {
      interviews = await Interview.find({ jobSeeker: userId })
        .populate('job')
        .populate('employer', 'companyName email')
        .sort({ createdAt: -1 })
        .lean();
    } else {
      interviews = await Interview.find({ employer: userId })
        .populate('job')
        .populate('jobSeeker', 'fullName email')
        .sort({ createdAt: -1 })
        .lean();
    }
    res.render('interviews/list', { interviews, error });
  } catch (err) {
    console.error('myInterviews error:', err);
    res.render('interviews/list', { interviews: [], error: null });
  }
};

exports.showRequest = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate('employer').lean();
    if (!job) return res.redirect('/jobs');
    res.render('interviews/request', { job });
  } catch (err) {
    console.error('showRequest error:', err);
    res.redirect('/jobs');
  }
};

exports.request = async (req, res) => {
  const jobId = req.params.jobId;
  
  console.log('=== Interview Request Debug ===');
  console.log('jobId:', jobId);
  console.log('session user:', req.session.user);
  
  try {
    // Find the job
    const job = await Job.findById(jobId);
    console.log('job found:', job ? 'yes' : 'no');
    
    if (!job) {
      console.error('Job not found:', jobId);
      return res.redirect('/jobs');
    }

    console.log('job.employer:', job.employer);
    
    const jobSeekerId = req.session.user.id;
    const employerId = job.employer;

    console.log('jobSeekerId:', jobSeekerId);
    console.log('employerId:', employerId);

    // Check if already requested
    const existing = await Interview.findOne({ 
      job: jobId, 
      jobSeeker: jobSeekerId 
    });
    
    console.log('existing interview:', existing ? 'yes' : 'no');
    
    if (existing) {
      return res.redirect('/interviews');
    }

    // Create the interview request
    console.log('Creating interview...');
    const interview = new Interview({
      job: job._id,
      jobSeeker: jobSeekerId,
      employer: employerId,
      status: 'pending'
    });
    
    console.log('Interview object:', interview);
    
    await interview.save();
    console.log('Interview saved successfully');
    return res.redirect('/interviews');
  } catch (err) {
    console.error('Interview request error:', err.message);
    console.error('Full error:', err);
    return res.redirect('/jobs/' + jobId + '?error=request_failed');
  }
};

exports.approve = async (req, res) => {
  try {
    const interviewId = req.params.id;
    const employerId = req.session.user.id;
    const confirmedDate = (req.body.confirmedDate || '').trim();
    const confirmedTime = (req.body.confirmedTime || '').trim();
    const confirmedLocation = (req.body.confirmedLocation || '').trim();

    if (!confirmedDate || !confirmedTime || !confirmedLocation) {
      return res.redirect('/interviews?error=required_date_time_location');
    }

    await Interview.findOneAndUpdate(
      { _id: interviewId, employer: employerId, status: 'pending' },
      {
        status: 'confirmed',
        confirmedDate: new Date(confirmedDate),
        confirmedTime: confirmedTime,
        confirmedLocation: confirmedLocation
      }
    );
    res.redirect('/interviews');
  } catch (err) {
    console.error('approve error:', err);
    res.redirect('/interviews');
  }
};

exports.decline = async (req, res) => {
  try {
    const interviewId = req.params.id;
    const employerId = req.session.user.id;
    
    await Interview.findOneAndUpdate(
      { _id: interviewId, employer: employerId, status: 'pending' },
      { status: 'cancelled' }
    );
    res.redirect('/interviews');
  } catch (err) {
    console.error('decline error:', err);
    res.redirect('/interviews');
  }
};

exports.cancel = async (req, res) => {
  try {
    const interviewId = req.params.id;
    const userId = req.session.user.id;
    
    const interview = await Interview.findById(interviewId);
    if (!interview) return res.redirect('/interviews');
    
    // Check if user is either the job seeker or employer
    const isJobSeeker = interview.jobSeeker.toString() === userId;
    const isEmployer = interview.employer.toString() === userId;
    
    if (isJobSeeker || isEmployer) {
      await Interview.findByIdAndUpdate(interviewId, { status: 'cancelled' });
    }
    res.redirect('/interviews');
  } catch (err) {
    console.error('cancel error:', err);
    res.redirect('/interviews');
  }
};
