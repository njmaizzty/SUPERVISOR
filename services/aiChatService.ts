import { API_BASE_URL } from '@/config/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatResponse {
  response: string;
  source: 'openai' | 'fallback';
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Send a message to the AI chat backend
 */
export async function sendAIMessage(
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<AIChatResponse> {
  const apiUrl = `${API_BASE_URL}/ai-chat`;
  console.log('🚀 Sending AI message to:', apiUrl);
  console.log('📝 Message:', message);
  
  try {
    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AIChatResponse = await response.json();
    console.log('✅ AI Response received:', data.source);
    return data;
  } catch (error: any) {
    console.error('❌ AI Chat Service Error:', error?.message || error);
    
    // Return a fallback response on network error
    return {
      response: getLocalFallbackResponse(message),
      source: 'fallback',
      error: error?.name === 'AbortError' ? 'Request timeout' : 'Network error - using offline mode',
    };
  }
}

/**
 * Local fallback responses when backend is unavailable
 */
function getLocalFallbackResponse(message: string): string {
  const msg = message.toLowerCase();
  
  if (msg.includes('worker') || msg.includes('assign')) {
    return "👷 For worker assignments, check the Workers tab to see availability and skills. Match workers to tasks based on their experience and current workload.";
  }
  
  if (msg.includes('task') || msg.includes('priority')) {
    return "📋 Check the Tasks tab to view and manage your priorities. Focus on urgent items first and plan ahead for upcoming deadlines.";
  }
  
  if (msg.includes('equipment') || msg.includes('maintenance')) {
    return "🔧 Visit the Assets tab to check equipment status and maintenance schedules. Regular maintenance prevents costly breakdowns!";
  }
  
  if (msg.includes('weather')) {
    return "🌤️ Plan outdoor work during favorable weather. Check local forecasts and adjust irrigation schedules based on expected rainfall.";
  }
  
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return "👋 Hello! I'm your Farm Assistant. I can help with workers, tasks, equipment, and more. What do you need help with?";
  }
  
  return "I'm here to help with your farm management! Try asking about workers, tasks, equipment, or crop management. What would you like to know?";
}

