const express = require('express');
const router = express.Router();

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Log if OpenAI is configured
console.log('🤖 OpenAI API Key configured:', OPENAI_API_KEY ? 'Yes' : 'No (using fallback responses)');

// GET endpoint to test if route is working
router.get('/', (req, res) => {
  res.json({ 
    status: 'AI Chat API is running',
    openai_configured: !!OPENAI_API_KEY
  });
});

// System prompt for the Farm Assistant AI
const SYSTEM_PROMPT = `You are an AI Farm Assistant for a palm oil plantation supervisor app. You help supervisors manage their farm operations efficiently.

Your capabilities include:
- Worker management: assignments, availability, performance tracking
- Task management: creating, scheduling, prioritizing tasks
- Equipment/Asset management: maintenance schedules, status tracking
- Area/Block management: crop status, yields, planting information
- Tree management: health monitoring, disease tracking
- Weather information and recommendations
- Performance analytics and reports

Guidelines:
1. Be helpful, friendly, and professional
2. Provide specific, actionable advice when possible
3. Use emojis sparingly to make responses engaging (🌴 🚜 👷 📋 etc.)
4. Keep responses concise but informative
5. If you don't have specific data, provide general best practices
6. Always relate your answers to farm/plantation management context
7. Format responses with bullet points and sections when appropriate
8. If asked about specific farm data you don't have, explain that you can help with general guidance

Example topics you can help with:
- "Who should I assign for harvesting?" - Provide worker assignment recommendations
- "What are today's priorities?" - Help prioritize daily tasks
- "Equipment maintenance tips" - Maintenance best practices
- "Weather planning" - Weather-based work recommendations
- "Crop health issues" - Disease identification and treatment
- "Yield optimization" - Tips to improve productivity`;

// POST /api/ai-chat
router.post('/', async (req, res) => {
  console.log('📨 AI Chat request received:', req.body?.message?.substring(0, 50) || 'No message');
  
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      console.log('❌ No message in request');
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if OpenAI API key is configured
    if (!OPENAI_API_KEY) {
      // Return a fallback response if no API key
      console.log('📝 Using fallback response (no OpenAI key)');
      const fallbackResp = getFallbackResponse(message);
      console.log('✅ Fallback response generated');
      return res.json({
        response: fallbackResp,
        source: 'fallback'
      });
    }

    // Build messages array for OpenAI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      
      // Return fallback on API error
      return res.json({
        response: getFallbackResponse(message),
        source: 'fallback',
        error: 'AI service temporarily unavailable'
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || getFallbackResponse(message);

    res.json({
      response: aiResponse,
      source: 'openai',
      usage: data.usage
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.json({
      response: getFallbackResponse(req.body?.message || ''),
      source: 'fallback',
      error: 'Failed to get AI response'
    });
  }
});

// Fallback responses when OpenAI is not available
function getFallbackResponse(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes('worker') || msg.includes('assign') || msg.includes('who')) {
    return "👷 **Worker Assignment Tips:**\n\n• Match worker skills to task requirements\n• Consider worker availability and current workload\n• Review past performance for similar tasks\n• Balance workload across your team\n\nFor specific assignments, check the Workers tab to see availability and skills.";
  }
  
  if (msg.includes('maintenance') || msg.includes('equipment') || msg.includes('repair')) {
    return "🔧 **Equipment Maintenance:**\n\n• Regular maintenance prevents costly breakdowns\n• Check the Assets tab for maintenance schedules\n• Log all service activities for tracking\n• Prioritize overdue maintenance items\n\nKeep equipment running smoothly for optimal productivity!";
  }
  
  if (msg.includes('weather') || msg.includes('rain') || msg.includes('forecast')) {
    return "🌤️ **Weather Planning Tips:**\n\n• Plan outdoor tasks during dry periods\n• Adjust irrigation based on rainfall\n• Harvest before heavy rain when possible\n• Schedule spraying on calm, dry days\n\nAlways check weather forecasts before planning field work!";
  }
  
  if (msg.includes('task') || msg.includes('priority') || msg.includes('today')) {
    return "📋 **Task Prioritization:**\n\n• Address urgent/overdue items first\n• Consider weather conditions for outdoor tasks\n• Balance routine and special tasks\n• Check the Tasks tab for your current queue\n\nStay organized and tackle high-priority items early!";
  }
  
  if (msg.includes('tree') || msg.includes('palm') || msg.includes('crop') || msg.includes('yield')) {
    return "🌴 **Crop Management Tips:**\n\n• Regular health inspections catch issues early\n• Track yields by block for optimization\n• Monitor for pests and diseases\n• Maintain proper spacing and pruning\n\nCheck the Trees and Blocks sections for detailed data!";
  }
  
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return "👋 Hello! I'm your AI Farm Assistant. I can help you with:\n\n• Worker assignments & scheduling\n• Task management & priorities\n• Equipment maintenance\n• Crop & yield optimization\n• Weather-based planning\n\nWhat would you like help with today?";
  }
  
  if (msg.includes('help') || msg.includes('what can you')) {
    return "🤖 **I can help you with:**\n\n👷 **Workers** - Assignments, availability, performance\n📋 **Tasks** - Create, prioritize, track progress\n🔧 **Equipment** - Maintenance, status, scheduling\n🌴 **Crops** - Health, yields, block management\n🌤️ **Weather** - Planning recommendations\n📊 **Reports** - Performance analytics\n\nJust ask me anything about your farm operations!";
  }
  
  if (msg.includes('thank')) {
    return "You're welcome! 😊 Happy to help with your farm management. Feel free to ask if you need anything else!";
  }
  
  // Default response
  return "I'm your AI Farm Assistant! 🌴\n\nI can help with worker assignments, task management, equipment maintenance, crop health, and more.\n\nTry asking:\n• \"Who should I assign for harvesting?\"\n• \"What are my priorities today?\"\n• \"Tips for equipment maintenance\"\n• \"How to improve crop yields?\"\n\nWhat would you like to know?";
}

module.exports = router;

