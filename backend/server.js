require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3002',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Compass'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// History Schema
const historySchema = new mongoose.Schema({
  duration: { type: Number, required: true },
  pattern: { type: String, required: true },
  phaseDuration: { type: Number },
  cycles: { type: Number },
  notes: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

const History = mongoose.model('History', historySchema);

// Settings Schema
const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
});

const Settings = mongoose.model('Settings', settingsSchema);

// Routes
app.get('/api/settings/theme', async (req, res) => {
  try {
    let themeSetting = await Settings.findOne({ key: 'currentTheme' });
    if (!themeSetting) {
      themeSetting = new Settings({ key: 'currentTheme', value: 'noir' });
      await themeSetting.save();
    }
    res.json({ theme: themeSetting.value });
  } catch (err) {
    console.error('Error fetching theme:', err);
    res.status(500).json({ message: 'Internal server error while fetching theme.' });
  }
});

app.post('/api/settings/theme', async (req, res) => {
  try {
    const { theme } = req.body;
    let themeSetting = await Settings.findOneAndUpdate(
      { key: 'currentTheme' },
      { value: theme },
      { returnDocument: 'after', upsert: true }
    );
    res.json({ theme: themeSetting.value });
  } catch (err) {
    console.error('Error updating theme:', err);
    res.status(400).json({ message: 'Bad request while updating theme.' });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const history = await History.find().sort({ timestamp: -1 });
    res.json(history);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ message: 'Internal server error while fetching history.' });
  }
});

app.get('/api/challenge/status', async (req, res) => {
  try {
    const activeSetting = await Settings.findOne({ key: 'challengeActive' });
    const startSetting = await Settings.findOne({ key: 'challengeStartDate' });
    res.json({
      challengeActive: activeSetting ? activeSetting.value : false,
      challengeStartDate: startSetting ? startSetting.value : null
    });
  } catch (err) {
    console.error('Error fetching challenge status:', err);
    res.status(500).json({ message: 'Internal server error while fetching challenge status.' });
  }
});

app.post('/api/challenge/start', async (req, res) => {
  try {
    // Hard delete history
    await History.deleteMany({});
    
    // Set challenge settings
    await Settings.findOneAndUpdate(
      { key: 'challengeActive' },
      { value: true },
      { returnDocument: 'after', upsert: true }
    );
    await Settings.findOneAndUpdate(
      { key: 'challengeStartDate' },
      { value: new Date().toISOString() },
      { returnDocument: 'after', upsert: true }
    );
    
    res.json({ message: 'Challenge started' });
  } catch (err) {
    console.error('Error starting challenge:', err);
    res.status(500).json({ message: 'Internal server error while starting challenge.' });
  }
});

app.post('/api/challenge/reset', async (req, res) => {
  try {
    // Hard delete history
    await History.deleteMany({});
    
    await Settings.findOneAndUpdate(
      { key: 'challengeActive' },
      { value: false },
      { returnDocument: 'after', upsert: true }
    );
    await Settings.findOneAndUpdate(
      { key: 'challengeStartDate' },
      { value: null },
      { returnDocument: 'after', upsert: true }
    );
    res.json({ message: 'Challenge reset' });
  } catch (err) {
    console.error('Error resetting challenge:', err);
    res.status(500).json({ message: 'Internal server error while resetting challenge.' });
  }
});

app.post('/api/history', async (req, res) => {
  const { duration, pattern, phaseDuration, cycles, notes } = req.body;

  // Input Validation
  if (typeof duration !== 'number' || isNaN(duration) || duration < 0) {
    return res.status(400).json({ message: 'Invalid duration: must be a positive number.' });
  }
  if (typeof pattern !== 'string' || !pattern.trim()) {
    return res.status(400).json({ message: 'Invalid pattern: must be a non-empty string.' });
  }

  const historyItem = new History({
    duration,
    pattern,
    phaseDuration,
    cycles,
    notes: notes || ''
  });

  try {
    const newHistory = await historyItem.save();
    res.status(201).json(newHistory);
  } catch (err) {
    console.error('Error saving history:', err);
    res.status(500).json({ message: 'Internal server error while saving history.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
