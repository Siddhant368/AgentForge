const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Workflow = require('./models/Workflow');

const app = express();
const PORT = process.env.PORT || 5000;

const aiRouter = require('./routes/ai');

// Middleware
app.use(cors());
app.use(express.json()); // JSON parsing ke liye
app.use('/api/ai', aiRouter);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🚀 MongoDB Connected Successfully!'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- API ROUTES ---

// 1. Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AgentForge Backend is running' });
});

// 2. FIXED CRASH-PROOF ROUTE: Get Latest Saved Workflow (For Auto-Load on Refresh)
app.get('/api/workflows/latest', async (req, res) => {
  try {
    const workflows = await Workflow.find().sort({ _id: -1 }).limit(1);
    
    if (!workflows || workflows.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'Database is empty, starting fresh canvas', 
        nodes: [], 
        edges: [] 
      });
    }

    const latestWorkflow = workflows[0];
    res.status(200).json({ 
      success: true, 
      nodes: latestWorkflow.nodes || [], 
      edges: latestWorkflow.edges || [] 
    });
  } catch (error) {
    console.error('❌ Error inside /latest route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔥 3. UPDATED ROUTE: Save or Update a Workflow (With Multi-Agent Dropdown Support)
app.post('/api/workflows', async (req, res) => {
  try {
    const { id, name, description, nodes, edges } = req.body;

    let workflow;
    
    // Agar frontend se existing MongoDB ID aayi hai, to usi specific agent ko update karo
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      workflow = await Workflow.findByIdAndUpdate(
        id,
        { name, description, nodes, edges },
        { new: true, runValidators: true }
      );
    }

    // Agar ID nahi aayi (ya database me nahi mili), iska matlab naya agent banana hai
    if (!workflow) {
      workflow = new Workflow({
        name: name || `AI Agent #${Math.floor(1000 + Math.random() * 9000)}`,
        description: description || "Created via AgentForge Workspace Dashboard",
        nodes,
        edges
      });
      await workflow.save();
    }

    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    console.error('Error saving workflow:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Get All Workflows (For dashboard dropdown list)
app.get('/api/workflows', async (req, res) => {
  try {
    const workflows = await Workflow.find().sort({ updatedAt: -1 });
    res.status(200).json({ success: true, data: workflows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Get a Single Workflow by ID (When selecting an agent from dropdown)
app.get('/api/workflows/:id', async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`📡 Server running on port ${PORT}`);
});