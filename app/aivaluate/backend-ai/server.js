require('dotenv').config({ path: '/app/aivaluate/backend-ai/.env' });
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const aiRoutes = require('./aiRoutes');
const aiTestRoutes = require('./aiTestRoutes');

const app = express();
const PORT = process.env.PORT || 9000;
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
    }
}));

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
    console.log('Session:', req.session);
    console.log('Request Body:', req.body);
    if (!req.session.courseId && req.body.courseId) {
        req.session.courseId = req.body.courseId;
    }
    if (!req.session.instructorId && req.body.instructorId) {
        req.session.instructorId = req.body.instructorId;
    }
    next();
});

// app.post('/ai-api/set-session', (req, res) => {
//   const { instructorId, courseId } = req.body;
//   if (!instructorId || !courseId) {
//       return res.status(400).json({ message: 'Instructor ID and Course ID are required' });
//   }
//   req.session.instructorId = instructorId;
//   req.session.courseId = courseId;
//   res.status(200).json({ message: 'Session variables set successfully' });
// });

app.use('/ai-api', aiRoutes);
app.use('/ai-api', aiTestRoutes);

app.listen(PORT, () => {
    console.log(`AI backend server is running on port ${PORT}`);
});