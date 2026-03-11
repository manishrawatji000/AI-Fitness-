import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Send, Dumbbell, Apple, TrendingUp, User } from 'lucide-react';

// Voice Assistant Component
const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I\'m your AI fitness coach. Ask me about workouts, diet plans, or any fitness doubts!' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
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
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speak = (text) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      synthRef.current.speak(utterance);
    }
  };

  const handleQuery = async (query) => {
    if (!query.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setIsProcessing(true);

    try {
      const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
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
              content: `You are an AI fitness and nutrition coach. Answer this question concisely and helpfully: ${query}`
            }
          ]
        })
      });

      const data = await aiResponse.json();
      const aiText = data.content?.[0]?.text || 'I can help you with workout plans, diet advice, and fitness tips. What would you like to know?';
      
      setResponse(aiText);
      setMessages(prev => [...prev, { role: 'assistant', text: aiText }]);
      speak(aiText);
    } catch (error) {
      const fallbackResponse = getFallbackResponse(query);
      setResponse(fallbackResponse);
      setMessages(prev => [...prev, { role: 'assistant', text: fallbackResponse }]);
      speak(fallbackResponse);
    }

    setIsProcessing(false);
    setTranscript('');
  };

  const getFallbackResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('workout') || lowerQuery.includes('exercise')) {
      return 'For a balanced workout routine, I recommend: 1) Warm up for 5-10 minutes, 2) Strength training 3-4 times per week focusing on compound movements like squats, deadlifts, and bench press, 3) Cardio 2-3 times per week for 20-30 minutes, and 4) Cool down with stretching. Always listen to your body and progress gradually.';
    } else if (lowerQuery.includes('diet') || lowerQuery.includes('nutrition') || lowerQuery.includes('eat')) {
      return 'A healthy diet should include: lean proteins (chicken, fish, legumes), complex carbs (brown rice, quinoa, oats), healthy fats (avocado, nuts, olive oil), and plenty of vegetables and fruits. Aim for 0.8-1g of protein per pound of body weight, and stay hydrated with at least 8 glasses of water daily.';
    } else if (lowerQuery.includes('protein')) {
      return 'Protein is essential for muscle recovery and growth. Good sources include chicken breast, fish, eggs, Greek yogurt, legumes, and protein supplements. Aim for 20-30g of protein per meal, distributed throughout the day for optimal absorption.';
    } else if (lowerQuery.includes('weight loss') || lowerQuery.includes('lose weight')) {
      return 'For healthy weight loss: Create a moderate caloric deficit of 300-500 calories daily, focus on whole foods, increase protein intake to preserve muscle, do both cardio and strength training, get 7-9 hours of sleep, and be patient - aim for 0.5-1kg loss per week.';
    } else if (lowerQuery.includes('muscle') || lowerQuery.includes('gain')) {
      return 'To build muscle: Eat in a slight caloric surplus (200-300 calories above maintenance), consume 1.6-2.2g protein per kg body weight, focus on progressive overload in strength training, get adequate rest between workouts, and ensure quality sleep for recovery.';
    } else {
      return 'I\'m here to help with your fitness journey! Ask me about workout routines, diet plans, nutrition advice, exercise form, or any fitness-related questions you have.';
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,120,100,0.1), rgba(100,200,255,0.1))',
      borderRadius: 24,
      padding: 24,
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff7864, #ff5a87)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(255,120,100,0.4)'
        }}>
          <Volume2 size={24} color="white" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>AI Voice Coach</h3>
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>Ask me anything about fitness</p>
        </div>
      </div>

      <div style={{
        maxHeight: 300,
        overflowY: 'auto',
        marginBottom: 16,
        padding: 12,
        background: 'rgba(15,23,42,0.6)',
        borderRadius: 16,
        border: '1px solid rgba(148,163,184,0.1)'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            marginBottom: 12,
            padding: 12,
            borderRadius: 12,
            background: msg.role === 'user' 
              ? 'linear-gradient(135deg, rgba(100,200,255,0.2), rgba(100,150,255,0.2))'
              : 'rgba(255,120,100,0.1)',
            border: '1px solid rgba(255,255,255,0.05)',
            textAlign: msg.role === 'user' ? 'right' : 'left'
          }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
              {msg.role === 'user' ? 'You' : 'AI Coach'}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>{msg.text}</div>
          </div>
        ))}
        {isProcessing && (
          <div style={{
            padding: 12,
            borderRadius: 12,
            background: 'rgba(255,120,100,0.1)',
            border: '1px solid rgba(255,255,255,0.05)',
            fontSize: 14,
            color: '#94a3b8'
          }}>
            Thinking...
          </div>
        )}
      </div>

      {transcript && (
        <div style={{
          padding: 12,
          marginBottom: 12,
          background: 'rgba(100,200,255,0.1)',
          borderRadius: 12,
          fontSize: 14,
          border: '1px solid rgba(100,200,255,0.3)'
        }}>
          <strong>You said:</strong> {transcript}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={toggleListening}
          disabled={isProcessing}
          style={{
            flex: 1,
            padding: '16px 24px',
            borderRadius: 16,
            border: 'none',
            background: isListening 
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'linear-gradient(135deg, #ff7864, #ff5a87)',
            color: 'white',
            fontSize: 16,
            fontWeight: 600,
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 8px 24px rgba(255,120,100,0.4)',
            transition: 'all 0.3s ease',
            opacity: isProcessing ? 0.6 : 1
          }}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          {isListening ? 'Stop Listening' : 'Start Voice Chat'}
        </button>
      </div>

      <p style={{ 
        marginTop: 12, 
        fontSize: 12, 
        color: '#64748b', 
        textAlign: 'center',
        lineHeight: 1.5
      }}>
        🎤 Click the button and speak your question<br/>
        Ask about workouts, diet, nutrition, or any fitness doubts
      </p>
    </div>
  );
};

// Modern Dashboard
const ModernFitnessDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const StatCard = ({ icon: Icon, label, value, unit, color, progress }) => (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(30,41,59,0.8))',
      borderRadius: 20,
      padding: 20,
      border: '1px solid rgba(148,163,184,0.1)',
      backdropFilter: 'blur(10px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}20, transparent)`,
        opacity: 0.5
      }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={20} color={color} />
        </div>
        <span style={{ fontSize: 13, color: '#94a3b8' }}>{label}</span>
      </div>
      
      <div style={{ fontSize: 32, fontWeight: 700, color: color, marginBottom: 8 }}>
        {value}<span style={{ fontSize: 16, marginLeft: 4 }}>{unit}</span>
      </div>
      
      {progress && (
        <div style={{
          width: '100%',
          height: 6,
          background: 'rgba(148,163,184,0.2)',
          borderRadius: 10,
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: color,
            borderRadius: 10,
            transition: 'width 0.5s ease'
          }} />
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      color: '#f1f5f9',
      padding: 24,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(15,23,42,0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        border: '1px solid rgba(148,163,184,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #ff7864, #64c8ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              FitAI Trainer
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: 14 }}>
              Your AI-Powered Fitness Coach
            </p>
          </div>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #64c8ff, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(100,200,255,0.4)'
          }}>
            <User size={24} color="white" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 24,
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
          { id: 'workout', icon: Dumbbell, label: 'Workout' },
          { id: 'diet', icon: Apple, label: 'Diet' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              borderRadius: 16,
              border: 'none',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, #ff7864, #ff5a87)'
                : 'rgba(15,23,42,0.8)',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.3s ease',
              boxShadow: activeTab === tab.id ? '0 8px 24px rgba(255,120,100,0.4)' : 'none'
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
        marginBottom: 24
      }}>
        <StatCard
          icon={User}
          label="Weight"
          value="72.5"
          unit="kg"
          color="#ff7864"
          progress={65}
        />
        <StatCard
          icon={Dumbbell}
          label="Steps"
          value="8,264"
          unit=""
          color="#64c8ff"
          progress={82}
        />
        <StatCard
          icon={TrendingUp}
          label="Calories"
          value="1,670"
          unit="kcal"
          color="#8b5cf6"
          progress={75}
        />
        <StatCard
          icon={Apple}
          label="Protein"
          value="98"
          unit="g"
          color="#10b981"
          progress={88}
        />
      </div>

      {/* Voice Assistant */}
      <VoiceAssistant />

      {/* Tips Section */}
      <div style={{
        marginTop: 24,
        padding: 20,
        background: 'rgba(15,23,42,0.6)',
        borderRadius: 20,
        border: '1px solid rgba(148,163,184,0.1)'
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>💡 Quick Tips</h3>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#94a3b8', lineHeight: 2 }}>
          <li>Use voice commands to ask about workout routines</li>
          <li>Get personalized diet recommendations instantly</li>
          <li>Track your progress with real-time feedback</li>
          <li>Ask any fitness-related doubts to your AI coach</li>
        </ul>
      </div>
    </div>
  );
};

export default ModernFitnessDashboard;