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
  inhale: { type: Number },
  inhaleHold: { type: Number },
  exhale: { type: Number },
  exhaleHold: { type: Number },
  cycles: { type: Number },
  cooldownSeconds: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  rating: { type: Number, required: true },
  closureNotes: { type: String, default: '' },
  archived: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

historySchema.index({ archived: 1, timestamp: -1 });
historySchema.index({ timestamp: -1 });

const History = mongoose.model('History', historySchema);

// Settings Schema
const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
});

const Settings = mongoose.model('Settings', settingsSchema);

// Journal Schema
const journalSchema = new mongoose.Schema({
  chakra: { type: String, required: true },
  question: { type: String, required: true },
  response: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Journal = mongoose.model('Journal', journalSchema);

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

app.get('/api/history/export', async (req, res) => {
  try {
    // Export active history
    const history = await History.find({ archived: { $ne: true } }).sort({ timestamp: -1 });
    
    // CSV Header
    const headers = ['Date', 'Time', 'Method', 'Duration (s)', 'Inhale (s)', 'Inhale Hold (s)', 'Exhale (s)', 'Exhale Hold (s)', 'Cycles', 'Cooldown (s)', 'Rating', 'Notes', 'Closure notes'];
    
    // CSV Rows
    const rows = history.map(item => {
      const date = new Date(item.timestamp);
      const formattedDate = date.toISOString().split('T')[0];
      const formattedTime = date.toTimeString().split(' ')[0];
      
      // Escape notes: wrap in quotes and escape existing quotes
      const escapedNotes = `"${(item.notes || '').replace(/"/g, '""')}"`;
      const escapedClosureNotes = `"${(item.closureNotes || '').replace(/"/g, '""')}"`;
      
      return [
        formattedDate,
        formattedTime,
        item.pattern,
        item.duration,
        item.inhale || '',
        item.inhaleHold || '',
        item.exhale || '',
        item.exhaleHold || '',
        item.cycles || '',
        item.cooldownSeconds || 0,
        item.rating || '',
        escapedNotes,
        escapedClosureNotes
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const filename = `breathing_history_${year}${month}${day}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('Error exporting history:', err);
    res.status(500).json({ message: 'Internal server error while exporting history.' });
  }
});

app.get('/api/journal/export', async (req, res) => {
  try {
    const entries = await Journal.find().sort({ timestamp: -1 });
    
    // CSV Header
    const headers = ['Date', 'Time', 'Chakra', 'Question', 'Response'];
    
    // CSV Rows
    const rows = entries.map(item => {
      const date = new Date(item.timestamp);
      const formattedDate = date.toISOString().split('T')[0];
      const formattedTime = date.toTimeString().split(' ')[0];
      
      const escapedQuestion = `"${(item.question || '').replace(/"/g, '""')}"`;
      const escapedResponse = `"${(item.response || '').replace(/"/g, '""')}"`;
      
      return [
        formattedDate,
        formattedTime,
        item.chakra,
        escapedQuestion,
        escapedResponse
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const filename = `chakra_journal_history_${year}${month}${day}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('Error exporting journal:', err);
    res.status(500).json({ message: 'Internal server error while exporting journal.' });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const history = await History.find({ archived: { $ne: true } })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await History.countDocuments({ archived: { $ne: true } });
    const hasMore = skip + history.length < totalCount;

    res.json({
      data: history,
      hasMore,
      totalCount
    });
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ message: 'Internal server error while fetching history.' });
  }
});

// Simple in-memory cache for dashboard stats
const statsCache = new Map();
const clearStatsCache = () => statsCache.clear();

app.get('/api/history/stats', async (req, res) => {
  try {
    const timezone = req.headers['x-timezone'] || 'UTC';
    
    // Serve from cache if available
    if (statsCache.has(timezone)) {
      return res.json(statsCache.get(timezone));
    }

    const totalStats = await History.aggregate([
      { $match: { archived: { $ne: true } } },
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                totalSeconds: { $sum: "$duration" },
                totalCooldownSeconds: { $sum: "$cooldownSeconds" },
                totalAums: { 
                  $sum: { 
                    $cond: [{ $eq: ["$pattern", "Aum Chanting"] }, { $ifNull: ["$cycles", 0] }, 0] 
                  } 
                },
                overallDuration: { $sum: "$duration" },
                totalSessions: { $sum: 1 }
              }
            }
          ],
          byMethod: [
            {
              $group: {
                _id: "$pattern",
                totalDuration: { $sum: "$duration" }
              }
            }
          ],
          lastSessions: [
            { $sort: { timestamp: -1 } },
            { $limit: 3 }
          ],
          practicedDates: [
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp", timezone } },
                totalDuration: { $sum: "$duration" }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);

    const stats = totalStats[0];
    const overall = stats.overall[0] || { totalSeconds: 0, totalCooldownSeconds: 0, totalAums: 0, overallDuration: 0, totalSessions: 0 };
    const methodTotals = stats.byMethod.reduce((acc, curr) => {
      acc[curr._id] = curr.totalDuration;
      return acc;
    }, {});

    const practicedDates = stats.practicedDates.reduce((acc, curr) => {
      acc[curr._id] = curr.totalDuration;
      return acc;
    }, {});

    const statsResult = {
      totalSeconds: overall.totalSeconds,
      totalCooldownSeconds: overall.totalCooldownSeconds,
      totalAums: overall.totalAums,
      overallDuration: overall.overallDuration,
      totalSessions: overall.totalSessions,
      methodTotals,
      lastSessions: stats.lastSessions || [],
      practicedDates
    };

    statsCache.set(timezone, statsResult);
    res.json(statsResult);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: 'Internal server error while fetching stats.' });
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
    // Hard delete history instead of archiving
    await History.deleteMany({});
    clearStatsCache();
    
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
    const { closureNotes, generateCsv } = req.body;
    let csvContent = null;

    if (generateCsv) {
      // Export all history before deletion
      const history = await History.find().sort({ timestamp: -1 });
      
      // CSV Header
      const headers = ['Date', 'Time', 'Method', 'Duration (s)', 'Inhale (s)', 'Inhale Hold (s)', 'Exhale (s)', 'Exhale Hold (s)', 'Cycles', 'Cooldown (s)', 'Rating', 'Notes', 'Closure notes'];
      
      // CSV Rows
      const rows = history.map(item => {
        const date = new Date(item.timestamp);
        const formattedDate = date.toISOString().split('T')[0];
        const formattedTime = date.toTimeString().split(' ')[0];
        
        // Escape notes: wrap in quotes and escape existing quotes
        const escapedNotes = `"${(item.notes || '').replace(/"/g, '""')}"`;
        const escapedClosureNotes = `"${(closureNotes || '').replace(/"/g, '""')}"`;
        
        return [
          formattedDate,
          formattedTime,
          item.pattern,
          item.duration,
          item.inhale || '',
          item.inhaleHold || '',
          item.exhale || '',
          item.exhaleHold || '',
          item.cycles || '',
          item.cooldownSeconds || 0,
          item.rating || '',
          escapedNotes,
          escapedClosureNotes
        ].join(',');
      });
      csvContent = [headers.join(','), ...rows].join('\n');
    }

    // Hard delete all history
    await History.deleteMany({});
    clearStatsCache();
    
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
    res.json({ message: 'Challenge reset', csv: csvContent });
  } catch (err) {
    console.error('Error resetting challenge:', err);
    res.status(500).json({ message: 'Internal server error while resetting challenge.' });
  }
});

// Journal Routes
app.post('/api/journal', async (req, res) => {
  try {
    const { chakra, question, response } = req.body;
    if (!chakra || !question || !response) {
      return res.status(400).json({ message: 'Chakra, question, and response are required.' });
    }
    const entry = new Journal({ chakra, question, response });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    console.error('Error saving journal entry:', err);
    res.status(500).json({ message: 'Internal server error while saving journal entry.' });
  }
});

app.get('/api/journal', async (req, res) => {
  try {
    const entries = await Journal.find().sort({ timestamp: -1 });
    res.json(entries);
  } catch (err) {
    console.error('Error fetching journal entries:', err);
    res.status(500).json({ message: 'Internal server error while fetching journal entries.' });
  }
});

// Conscious Eating Integrated Routes
app.get('/api/eating', async (req, res) => {
  try {
    const { date } = req.query; // Expecting YYYY-MM-DD
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const records = await History.find({
      pattern: { $regex: /^Conscious Eating -/ },
      timestamp: { $gte: startOfDay, $lte: endOfDay }
    });
    res.json(records);
  } catch (err) {
    console.error('Error fetching eating records:', err);
    res.status(500).json({ message: 'Internal server error while fetching eating records.' });
  }
});

app.post('/api/eating', async (req, res) => {
  try {
    clearStatsCache();
    const { meal, value, notes, timestamp } = req.body;
    const pattern = `Conscious Eating - ${meal}`;
    const targetDate = new Date(timestamp);
    
    // Day bounds for the target date
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    if (value) {
      const record = await History.findOneAndUpdate(
        { 
          pattern, 
          timestamp: { $gte: startOfDay, $lte: endOfDay } 
        },
        { 
          $set: { 
            duration: 300, 
            rating: 5, 
            notes: notes || '',
            archived: false,
            timestamp: targetDate // Maintain the latest sent timestamp
          } 
        },
        { upsert: true, new: true }
      );
      res.json(record);
    } else {
      await History.findOneAndDelete({ 
        pattern, 
        timestamp: { $gte: startOfDay, $lte: endOfDay } 
      });
      res.json({ message: 'Entry removed' });
    }
  } catch (err) {
    console.error('Error updating eating record:', err);
    res.status(500).json({ message: 'Internal server error while updating eating record.' });
  }
});

// Conscious Walking Integrated Routes
app.get('/api/walking', async (req, res) => {
  try {
    const { date } = req.query; // Expecting YYYY-MM-DD
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const record = await History.findOne({
      pattern: 'Conscious Walking',
      timestamp: { $gte: startOfDay, $lte: endOfDay }
    });
    res.json(record);
  } catch (err) {
    console.error('Error fetching walking records:', err);
    res.status(500).json({ message: 'Internal server error while fetching walking records.' });
  }
});

app.post('/api/walking', async (req, res) => {
  try {
    clearStatsCache();
    const { minutes, notes, timestamp } = req.body;
    const pattern = 'Conscious Walking';
    const targetDate = new Date(timestamp);
    
    // Day bounds for the target date
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    if (minutes > 0) {
      const record = await History.findOneAndUpdate(
        { 
          pattern, 
          timestamp: { $gte: startOfDay, $lte: endOfDay } 
        },
        { 
          $set: { 
            duration: minutes * 60, 
            rating: 5, 
            notes: notes || '',
            archived: false,
            timestamp: targetDate
          } 
        },
        { upsert: true, new: true }
      );
      res.json(record);
    } else {
      await History.findOneAndDelete({ 
        pattern, 
        timestamp: { $gte: startOfDay, $lte: endOfDay } 
      });
      res.json({ message: 'Entry removed' });
    }
  } catch (err) {
    console.error('Error updating walking record:', err);
    res.status(500).json({ message: 'Internal server error while updating walking record.' });
  }
});


// Debug Simulation Routes
app.post('/api/debug/expire-challenge', async (req, res) => {
  try {
    clearStatsCache();
    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);
    
    await Settings.findOneAndUpdate(
      { key: 'challengeStartDate' },
      { $set: { value: thirtyOneDaysAgo.toISOString() } },
      { upsert: true }
    );
    await Settings.findOneAndUpdate(
      { key: 'challengeActive' },
      { $set: { value: true } },
      { upsert: true }
    );
    res.json({ message: 'Challenge expired (Start date set to 31 days ago)' });
  } catch (err) {
    console.error('Debug Expire Error:', err);
    res.status(500).json({ message: 'Debug error' });
  }
});

app.post('/api/debug/complete-challenge', async (req, res) => {
  try {
    clearStatsCache();
    const now = new Date();
    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

    await Settings.findOneAndUpdate(
      { key: 'challengeActive' },
      { $set: { value: true } },
      { upsert: true }
    );
    await Settings.findOneAndUpdate(
      { key: 'challengeStartDate' },
      { $set: { value: thirtyOneDaysAgo.toISOString() } },
      { upsert: true }
    );

    // Generate 31 sessions, one for each day
    const historyEntries = [];
    for (let i = 0; i <= 31; i++) {
      const sessionDate = new Date(thirtyOneDaysAgo);
      sessionDate.setDate(sessionDate.getDate() + i);
      
      historyEntries.push({
        duration: 1860, // 31 minutes
        pattern: 'Unlearn Meditation (Debug)',
        rating: 5,
        notes: `Day ${i} of Unlearn Challenge`,
        archived: false,
        timestamp: sessionDate
      });
    }
    
    await History.insertMany(historyEntries);
    res.json({ message: 'Challenge completed (31 sessions of 31 mins added across 31 days)' });
  } catch (err) {
    console.error('Debug Complete Error:', err);
    res.status(500).json({ message: 'Debug error' });
  }
});

app.post('/api/history', async (req, res) => {
  const { duration, pattern, inhale, inhaleHold, exhale, exhaleHold, cycles, notes, cooldownSeconds, rating } = req.body;

  // Input Validation
  if (typeof duration !== 'number' || isNaN(duration) || duration < 0) {
    return res.status(400).json({ message: 'Invalid duration: must be a positive number.' });
  }
  if (typeof pattern !== 'string' || !pattern.trim()) {
    return res.status(400).json({ message: 'Invalid pattern: must be a non-empty string.' });
  }
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Invalid rating: must be a number between 1 and 5.' });
  }

  const historyItem = new History({
    duration,
    pattern,
    inhale,
    inhaleHold,
    exhale,
    exhaleHold,
    cycles,
    cooldownSeconds: cooldownSeconds || 0,
    notes: notes || '',
    rating
  });

  try {
    const newHistory = await historyItem.save();
    clearStatsCache();
    res.status(201).json(newHistory);
  } catch (err) {
    console.error('Error saving history:', err);
    res.status(500).json({ message: 'Internal server error while saving history.' });
  }
});

app.delete('/api/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await History.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: 'History item not found.' });
    }
    clearStatsCache();
    res.json({ message: 'History item deleted successfully.' });
  } catch (err) {
    console.error('Error deleting history item:', err);
    res.status(500).json({ message: 'Internal server error while deleting history item.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
