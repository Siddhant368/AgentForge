const mongoose = require('mongoose');

// Schema ko plain/flexible rakhenge taaki React Flow ke saare node types smoothly save ho sakein
const WorkflowSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    default: "" 
  },
  nodes: { 
    type: Array, 
    default: [] // Strict schema hata kar humne ise flexible generic array bana diya
  },
  edges: { 
    type: Array, 
    default: [] 
  }
}, { timestamps: true });

module.exports = mongoose.model('Workflow', WorkflowSchema);