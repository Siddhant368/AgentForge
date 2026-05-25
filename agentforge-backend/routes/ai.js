const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

// Google Gen AI SDK Initialization
// Make sure aapke .env me GEMINI_API_KEY saved ho
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/execute', async (req, res) => {
  try {
    const { nodes, edges } = req.body;

    // 1. Pure graph me se Gemini AI Node ko dhundo
    const aiNode = nodes.find(node => node.type === 'aiNode');

    if (!aiNode) {
      return res.status(400).json({ 
        success: false, 
        error: "Canvas par koi Gemini AI Engine node nahi mila!" 
      });
    }

    // 2. Node ke andar ka prompt template uthao
    const promptText = aiNode.data.promptTemplate || "Hello Gemini!";
    const modelToUse = aiNode.data.modelName || "gemini-2.5-flash";

    console.log(`🤖 Executing Agent Workflow with model: ${modelToUse}`);
    console.log(`📝 Prompt: "${promptText}"`);

    // 3. Call Official Google Gen AI SDK
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: promptText,
    });

    // 4. Send back the response text
    res.status(200).json({
      success: true,
      output: response.text
    });

  } catch (error) {
    console.error("❌ Execution Engine Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Gemini API Calling me dikkat aayi." 
    });
  }
});

module.exports = router;