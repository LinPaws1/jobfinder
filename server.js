require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const jobRoutes = require('./routes/jobs');
const interviewRoutes = require('./routes/interviews');

connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'jobfinder-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/jobfinder' }),
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use('/', authRoutes);
app.use('/profiles', profileRoutes);
app.use('/jobs', jobRoutes);
app.use('/interviews', interviewRoutes);

app.get('/', (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === 'employer') return res.redirect('/jobs/my');
    return res.redirect('/jobs');
  }
  res.render('landing');
});

app.use((req, res) => res.status(404).render('404'));

app.listen(PORT, () => console.log(`JobFinder running at http://localhost:${PORT}`));
