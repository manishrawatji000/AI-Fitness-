// frontend/src/components/VoiceAssistant.jsx
import React, { useState, useEffect, useRef } from 'react';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I\'m your AI fitness coach. Ask me about workouts, diet plans, or any fitness doubts!' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleQuery(text);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          alert('No speech detected. Please try again.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
        alert('Could not start voice recognition. Please check your microphone permissions.');
      }
    }
  };

  const speak = (text) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = 'en-US';
      synthRef.current.speak(utterance);
    }
  };

  const handleQuery = async (query) => {
    if (!query.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setIsProcessing(true);

    try {
      // Try to use Anthropic API first
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `You are an AI fitness and nutrition coach. Answer this question concisely and helpfully in 2-3 sentences: ${query}`
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiText = data.content?.[0]?.text || getFallbackResponse(query);
        addAssistantMessage(aiText);
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.log('Using fallback response');
      const fallbackResponse = getFallbackResponse(query);
      addAssistantMessage(fallbackResponse);
    }

    setIsProcessing(false);
    setTranscript('');
  };

  const addAssistantMessage = (text) => {
    setMessages(prev => [...prev, { role: 'assistant', text }]);
    speak(text);
  };

  const getFallbackResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Workout-related queries
    if (lowerQuery.includes('workout') || lowerQuery.includes('exercise') || lowerQuery.includes('train')) {
      if (lowerQuery.includes('beginner')) {
        return 'For beginners, start with: 3 days per week of full-body workouts. Include squats, push-ups, planks, and lunges. Start with 2-3 sets of 8-12 reps. Rest 48 hours between sessions.';
      }
      if (lowerQuery.includes('chest') || lowerQuery.includes('upper body')) {
        return 'Great chest exercises: bench press, push-ups, dumbbell flyes, and dips. Do 3-4 sets of 8-12 reps. Include at least one compound movement and one isolation exercise per session.';
      }
      if (lowerQuery.includes('leg')) {
        return 'Essential leg exercises: squats, lunges, leg press, and deadlifts. Train legs 2x per week with 4-5 exercises per session. Always warm up properly and maintain proper form.';
      }
      if (lowerQuery.includes('cardio')) {
        return 'For effective cardio: Try HIIT 2-3x per week (20-30 minutes) or steady-state cardio 3-4x per week (30-45 minutes). Mix running, cycling, and swimming for variety.';
      }
      return 'For a balanced workout: Include strength training 3-4x per week, cardio 2-3x per week, and rest days for recovery. Focus on compound movements and progressive overload. Always warm up and cool down.';
    }

    // Diet and nutrition queries
    if (lowerQuery.includes('diet') || lowerQuery.includes('nutrition') || lowerQuery.includes('eat')) {
      if (lowerQuery.includes('protein')) {
        return 'Aim for 1.6-2.2g protein per kg of body weight daily. Great sources: chicken, fish, eggs, Greek yogurt, legumes, and protein powder. Distribute protein across 4-5 meals for optimal absorption.';
      }
      if (lowerQuery.includes('meal') || lowerQuery.includes('food')) {
        return 'Healthy meal structure: Lean protein (palm-sized portion), complex carbs (fist-sized), healthy fats (thumb-sized), and vegetables (2 handfuls). Eat 3-5 balanced meals daily at consistent times.';
      }
      if (lowerQuery.includes('carb')) {
        return 'Choose complex carbs: oats, brown rice, quinoa, sweet potatoes, and whole grain bread. Time carbs around workouts for energy. Aim for 3-5g per kg body weight depending on activity level.';
      }
      return 'Balanced nutrition includes: lean proteins, complex carbs, healthy fats, fruits, and vegetables. Eat in a moderate deficit for fat loss, surplus for muscle gain. Stay hydrated with 2-3 liters of water daily.';
    }

    // Weight loss queries
    if (lowerQuery.includes('weight loss') || lowerQuery.includes('lose weight') || lowerQuery.includes('fat loss')) {
      return 'For sustainable weight loss: Create a 300-500 calorie deficit daily, eat high protein (1.8-2g per kg), do both cardio and strength training, sleep 7-9 hours, and be patient. Aim for 0.5-1kg loss per week.';
    }

    // Muscle gain queries
    if (lowerQuery.includes('muscle') || lowerQuery.includes('bulk') || lowerQuery.includes('gain')) {
      return 'To build muscle: Eat in a 200-300 calorie surplus, consume 1.8-2.2g protein per kg, focus on progressive overload, train each muscle 2x per week, and prioritize recovery with 7-9 hours sleep.';
    }

    // Recovery and rest
    if (lowerQuery.includes('rest') || lowerQuery.includes('recover') || lowerQuery.includes('sleep')) {
      return 'Recovery is crucial: Get 7-9 hours of quality sleep, take 1-2 rest days per week, stay hydrated, eat adequate protein, and consider light stretching or yoga. Listen to your body.';
    }

    // Supplements
    if (lowerQuery.includes('supplement')) {
      return 'Essential supplements: Protein powder for convenience, creatine (5g daily) for strength, vitamin D, and omega-3. Most nutrients should come from whole foods. Consult a doctor before starting any supplement.';
    }

    // Form and technique
    if (lowerQuery.includes('form') || lowerQuery.includes('technique')) {
      return 'Proper form is key: Start with lighter weights, focus on controlled movements, maintain neutral spine, breathe properly (exhale on effort), and never sacrifice form for heavier weight. Consider working with a trainer initially.';
    }

    // Motivation
    if (lowerQuery.includes('motivat') || lowerQuery.includes('start')) {
      return 'Getting started: Set small, achievable goals. Track your progress with photos and measurements. Find a workout buddy or join a community. Remember, consistency beats intensity. Start with 3 workouts per week.';
    }

    // Default response
    return 'I can help you with workout routines, diet plans, nutrition advice, weight loss/gain strategies, exercise form, supplements, and motivation. What specific fitness question do you have?';
  };

  const handleTextInput = (e) => {
    e.preventDefault();
    const input = e.target.elements.queryInput;
    if (input.value.trim()) {
      handleQuery(input.value);
      input.value = '';
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,120,100,0.05), rgba(100,200,255,0.05))',
      borderRadius: 24,
      padding: 28,
      border: '1px solid rgba(148,163,184,0.1)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff7864, #ff5a87)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(255,120,100,0.4)'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>AI Voice Coach</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#94a3b8' }}>
            Ask me anything about fitness & nutrition
          </p>
        </div>
        {isListening && (
          <div style={{
            padding: '8px 16px',
            background: 'rgba(239,68,68,0.2)',
            borderRadius: 12,
            fontSize: 12,
            color: '#fca5a5',
            fontWeight: 600,
            animation: 'pulse 2s infinite'
          }}>
            🎤 Listening...
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div style={{
        maxHeight: 350,
        overflowY: 'auto',
        marginBottom: 20,
        padding: 16,
        background: 'rgba(15,23,42,0.6)',
        borderRadius: 20,
        border: '1px solid rgba(148,163,184,0.1)'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            marginBottom: 16,
            padding: 16,
            borderRadius: 16,
            background: msg.role === 'user' 
              ? 'linear-gradient(135deg, rgba(100,200,255,0.15), rgba(100,150,255,0.15))'
              : 'linear-gradient(135deg, rgba(255,120,100,0.1), rgba(255,90,135,0.1))',
            border: `1px solid ${msg.role === 'user' ? 'rgba(100,200,255,0.2)' : 'rgba(255,120,100,0.2)'}`,
            marginLeft: msg.role === 'user' ? '20%' : '0',
            marginRight: msg.role === 'user' ? '0' : '20%'
          }}>
            <div style={{ 
              fontSize: 11, 
              color: '#94a3b8', 
              marginBottom: 8,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {msg.role === 'user' ? '👤 You' : '🤖 AI Coach'}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: '#f1f5f9' }}>
              {msg.text}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div style={{
            padding: 16,
            borderRadius: 16,
            background: 'rgba(255,120,100,0.1)',
            border: '1px solid rgba(255,120,100,0.2)',
            fontSize: 14,
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 20,
              height: 20,
              border: '3px solid rgba(255,120,100,0.3)',
              borderTopColor: '#ff7864',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}/>
            AI is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Current Transcript */}
      {transcript && (
        <div style={{
          padding: 16,
          marginBottom: 16,
          background: 'rgba(100,200,255,0.1)',
          borderRadius: 16,
          fontSize: 14,
          border: '1px solid rgba(100,200,255,0.3)',
          color: '#64c8ff'
        }}>
          <strong>Heard:</strong> "{transcript}"
        </div>
      )}

      {/* Text Input Form */}
      <form onSubmit={handleTextInput} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            name="queryInput"
            placeholder="Type your question or use voice..."
            disabled={isProcessing || isListening}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: 16,
              border: '1px solid rgba(148,163,184,0.2)',
              background: 'rgba(15,23,42,0.6)',
              color: '#f1f5f9',
              fontSize: 14,
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#ff7864';
              e.target.style.boxShadow = '0 0 0 3px rgba(255,120,100,0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(148,163,184,0.2)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            type="submit"
            disabled={isProcessing || isListening}
            style={{
              padding: '14px 24px',
              borderRadius: 16,
              border: 'none',
              background: 'linear-gradient(135deg, #64c8ff, #4f97ff)',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: isProcessing || isListening ? 'not-allowed' : 'pointer',
              opacity: isProcessing || isListening ? 0.6 : 1,
              boxShadow: '0 8px 24px rgba(100,200,255,0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            Send
          </button>
        </div>
      </form>

      {/* Voice Button */}
      <button
        onClick={toggleListening}
        disabled={isProcessing}
        style={{
          width: '100%',
          padding: '18px 28px',
          borderRadius: 16,
          border: 'none',
          background: isListening 
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : 'linear-gradient(135deg, #ff7864, #ff5a87)',
          color: 'white',
          fontSize: 16,
          fontWeight: 700,
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          boxShadow: isListening 
            ? '0 8px 24px rgba(239,68,68,0.4)'
            : '0 8px 24px rgba(255,120,100,0.4)',
          transition: 'all 0.3s ease',
          opacity: isProcessing ? 0.6 : 1,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isListening ? (
            <path d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M9 9v6a3 3 0 0 0 3 3m0-9a3 3 0 0 0-3-3m3 3a3 3 0 0 1 3-3m-3 3v-4"/>
          ) : (
            <>
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </>
          )}
        </svg>
        {isListening ? 'Stop Listening' : 'Start Voice Chat'}
      </button>

      {/* Instructions */}
      <div style={{ 
        marginTop: 20, 
        padding: 16,
        background: 'rgba(100,200,255,0.05)',
        borderRadius: 16,
        border: '1px solid rgba(100,200,255,0.1)'
      }}>
        <p style={{ 
          margin: 0,
          fontSize: 13, 
          color: '#94a3b8', 
          lineHeight: 1.7
        }}>
          <strong style={{ color: '#64c8ff' }}>💡 Tips:</strong><br/>
          • Click the voice button and speak your question<br/>
          • Or type your question in the text box above<br/>
          • Ask about workouts, diet, nutrition, or any fitness doubts<br/>
          • The AI will respond with voice and text
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default VoiceAssistant;