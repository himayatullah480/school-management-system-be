const express = require('express');
const connectdb = require('./db/connection');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

connectdb();

app.use('/api/superadmin', require('./routes/superAdmin'));
app.use('/api/subadmin', require('./routes/subAdmin'));

app.listen(5000, () => {
    console.log('🚀 Server running on port 5000');
});