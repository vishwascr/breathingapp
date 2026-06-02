require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
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
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/settings/theme', async (req, res) => {
  try {
    const { theme } = req.body;
    let themeSetting = await Settings.findOneAndUpdate(
      { key: 'currentTheme' },
      { value: theme },
      { new: true, upsert: true }
    );
    res.json({ theme: themeSetting.value });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const history = await History.find().sort({ timestamp: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/history', async (req, res) => {
  const historyItem = new History({
    duration: req.body.duration,
    pattern: req.body.pattern,
    phaseDuration: req.body.phaseDuration,
    cycles: req.body.cycles,
    notes: req.body.notes || ''
  });

  try {
    const newHistory = await historyItem.save();
    res.status(201).json(newHistory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
