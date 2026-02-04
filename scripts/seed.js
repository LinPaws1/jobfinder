/**
 * Seed script: creates employer users and many job listings.
 * Run: npm run seed   (or node scripts/seed.js)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobfinder';

const EMPLOYERS = [
  { email: 'hr@techcorp.com', password: 'seed123', companyName: 'TechCorp', companyDescription: 'Leading software company building products for the future.' },
  { email: 'jobs@designstudio.com', password: 'seed123', companyName: 'Design Studio', companyDescription: 'Creative agency specialising in brand and digital design.' },
  { email: 'careers@financeplus.com', password: 'seed123', companyName: 'Finance Plus', companyDescription: 'Financial services and consulting firm.' },
  { email: 'talent@retailco.com', password: 'seed123', companyName: 'RetailCo', companyDescription: 'National retail chain with stores across Australia.' },
  { email: 'hiring@healthfirst.com', password: 'seed123', companyName: 'Health First', companyDescription: 'Healthcare and wellness provider.' },
  { email: 'recruit@buildit.com', password: 'seed123', companyName: 'BuildIt Constructions', companyDescription: 'Commercial and residential construction.' },
  { email: 'people@marketinghub.com', password: 'seed123', companyName: 'Marketing Hub', companyDescription: 'Full-service marketing and advertising.' },
  { email: 'careers@edutech.com', password: 'seed123', companyName: 'EduTech', companyDescription: 'EdTech startup revolutionising online learning.' },
];

const JOB_TITLES = [
  'Software Engineer', 'Senior Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Project Manager', 'Product Manager', 'Scrum Master', 'Business Analyst',
  'UX Designer', 'UI Designer', 'Product Designer', 'Graphic Designer',
  'Data Analyst', 'Data Scientist', 'DevOps Engineer', 'QA Engineer',
  'Marketing Manager', 'Content Writer', 'Digital Marketing Specialist', 'SEO Specialist',
  'Sales Representative', 'Account Manager', 'Customer Success Manager',
  'HR Coordinator', 'Office Administrator', 'Executive Assistant',
  'Finance Analyst', 'Accountant', 'Payroll Officer',
  'Nurse', 'Care Coordinator', 'Support Worker',
  'Site Supervisor', 'Project Coordinator', 'Estimator',
];

const LOCATIONS = [
  'Melbourne', 'Sydney', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Hobart', 'Darwin',
  'Melbourne CBD', 'Sydney CBD', 'Brisbane CBD', 'Remote', 'Hybrid',
];

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote'];

const DESCRIPTIONS = [
  'We are looking for a talented professional to join our team. You will work on meaningful projects and collaborate with a diverse team.',
  'Join us to build products that matter. You will have ownership of your work and opportunities to grow.',
  'This role offers the chance to make an impact in a fast-paced environment. We value creativity and initiative.',
  'We need someone who can hit the ground running and contribute to our growing team from day one.',
  'Ideal for someone who enjoys problem-solving and working with cutting-edge technologies.',
  'You will be responsible for delivering high-quality outcomes and supporting our clients.',
  'Great opportunity to develop your skills and advance your career in a supportive environment.',
  'We offer flexible working and a strong focus on work-life balance.',
];

const REQUIREMENTS = [
  'Relevant experience and strong communication skills. Team player with a positive attitude.',
  'Degree or equivalent experience. Proficiency with modern tools and practices.',
  '2+ years experience preferred. Ability to work independently and in a team.',
  'Strong attention to detail. Willingness to learn and adapt.',
  'Excellent organisational skills. Comfortable with deadlines and prioritisation.',
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create or find employers
    const employerIds = [];
    for (const emp of EMPLOYERS) {
      let user = await User.findOne({ email: emp.email });
      if (!user) {
        user = await User.create({
          email: emp.email,
          password: emp.password,
          role: 'employer',
          companyName: emp.companyName,
          companyDescription: emp.companyDescription,
        });
        console.log('Created employer:', emp.email);
      } else {
        console.log('Employer exists:', emp.email);
      }
      employerIds.push(user._id);
    }

    // How many new jobs to add this run
    const toCreate = 80;
    console.log(`Creating ${toCreate} new jobs...`);

    const jobsToInsert = [];
    for (let i = 0; i < toCreate; i++) {
      const title = JOB_TITLES[Math.floor(Math.random() * JOB_TITLES.length)];
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const jobType = JOB_TYPES[Math.floor(Math.random() * JOB_TYPES.length)];
      const employerId = employerIds[Math.floor(Math.random() * employerIds.length)];
      const description = DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)];
      const requirements = REQUIREMENTS[Math.floor(Math.random() * REQUIREMENTS.length)];

      jobsToInsert.push({
        employer: employerId,
        title,
        description,
        requirements,
        location,
        jobType,
      });
    }

    await Job.insertMany(jobsToInsert);
    const total = await Job.countDocuments();
    console.log(`Created ${jobsToInsert.length} jobs. Total jobs in DB: ${total}`);

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
