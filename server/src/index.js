const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const sequelize = require('./config/db'); // Descomentar cuando db.js este listo

dotenv.config();
console.log("Gemini API Key configured:", process.env.GEMINI_API_KEY ? "YES (Ends with " + process.env.GEMINI_API_KEY.slice(-4) + ")" : "NO");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes placeholder
app.get('/', (req, res) => {
    res.send('MiBolsillo API Running with Supabase');
});

// const { connectDB, sequelize } = require('./config/db');
// connectDB();
// sequelize.sync({ force: false }).then(() => { ... });
// No needed for Supabase as it is a service

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

const { networkInterfaces } = require('os');

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Log available network IPs
    const nets = networkInterfaces();
    console.log("Available Network IPs:");
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                console.log(`  - ${name}: http://${net.address}:${PORT}`);
            }
        }
    }
});
