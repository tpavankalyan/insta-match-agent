import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Instagram } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onComplete: (responses: Record<string, any>) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onComplete }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionsInitialized, setSessionsInitialized] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const makeId = (prefix: string) =>
    `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const dtwinUserId = useRef(makeId("dtwin_user"));
  const dtwinSessionId = useRef(makeId("dtwin_sess"));
  const chatCheckUserId = useRef(makeId("cc_user"));
  const chatCheckSessionId = useRef(makeId("cc_sess"));

  // Initialize sessions once when component mounts
  useEffect(() => {
    const initializeSessions = async () => {
      try {
        // Create dtwin session
        await fetch(`/api/apps/dtwin/users/${dtwinUserId.current}/sessions/${dtwinSessionId.current}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: dtwinUserId.current,
            session_id: dtwinSessionId.current,
          }),
        });

        // Create chat_check session
        await fetch(`/api/apps/chat_check/users/${chatCheckUserId.current}/sessions/${chatCheckSessionId.current}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: chatCheckUserId.current,
            session_id: chatCheckSessionId.current,
          }),
        });

        setSessionsInitialized(true);
      } catch (error) {
        console.error("Error initializing sessions:", error);
        // Still set to true to prevent blocking the chat
        setSessionsInitialized(true);
      }
    };

    initializeSessions();
  }, []);

  useEffect(() => {
    // Add initial message after sessions are initialized
    if (sessionsInitialized) {
      addBotMessage("Hi! Welcome to LoveSync AI 💕 I'm here to help you find your perfect match. Let's start by connecting your Instagram to get to know you better.");
    }
  }, [sessionsInitialized]);

  const handleInstagramConnect = async () => {
    if (!username || !password) {
      addBotMessage("Please enter your Instagram username and password.");
      return;
    }
    addBotMessage("Connecting to Instagram...");
    try {
      const response = await fetch(`http://localhost:8002/instagram?username=${username}&password=${password}&user_id=${dtwinUserId.current}`);
      const data = await response.json();
      if (data.success) {
        addBotMessage("Successfully connected to Instagram!");
      } else {
        addBotMessage(`Error connecting to Instagram: ${data.error}`);
      }
    } catch (error) {
      console.error("Error connecting to Instagram:", error);
      addBotMessage("Sorry, I'm having trouble connecting to Instagram. Please try again later.");
    }
  };

  const addBotMessage = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text,
        isBot: true,
        timestamp: new Date(),
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date(),
    }]);
  };

  const handleSubmit = async (value: string) => {
    // Don't allow submissions until sessions are initialized
    if (!sessionsInitialized) {
      return;
    }

    addUserMessage(value);
    setCurrentInput('');
    setIsTyping(true);

    try {
      const ADK_AGENT_URL = "/api/run";

      // Construct history
      const history = messages.map(msg => ({
        role: msg.isBot ? 'model' : 'user',
        parts: [{ text: msg.text }],
      }));

      // Send to dtwin (sessions already exist)
      const response = await fetch(ADK_AGENT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_name: "dtwin",
          user_id: dtwinUserId.current,
          session_id: dtwinSessionId.current,
          history,
          new_message: { parts: [{ text: value }], role: "user" }
        }),
      });

      const responseData = await response.json();
      const agent_response = responseData[0]['content'];

      if (agent_response && agent_response.parts?.length > 0) {
        // Handle tool calls
        for (const part of agent_response.parts) {
          if (part.functionCall) {
            addBotMessage(`Running tool: ${part.functionCall.name}...`);
          }
        }

        // Last text part
        const lastTextPart = [...agent_response.parts].reverse().find(p => p.text);
        if (lastTextPart) {
          const botReply = lastTextPart.text;
          addBotMessage(botReply);

          // Validate with chat_check (session already exists)
          const chatCheckResponse = await fetch(ADK_AGENT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              app_name: "chat_check",
              user_id: chatCheckUserId.current,
              session_id: chatCheckSessionId.current,
              history: [],
              new_message: { parts: [{ text: botReply }], role: "user" }
            }),
          });

          const chatCheckData = await chatCheckResponse.json();
          const check_response = chatCheckData[0]['content']['parts'][0]['text'];

          if (check_response.includes("COMPLETE")) {
            setTimeout(() => {
              onComplete({ userId: dtwinUserId.current });
            }, 2000);
          }
        }
      } else {
        addBotMessage("Sorry, I couldn't get a response.");
      }
    } catch (error) {
      console.error("Error communicating with the bot:", error);
      addBotMessage("Sorry, I'm having trouble connecting. Please try again later.");
    } finally {
      setIsTyping(false);
    }
  };

  const renderInput = () => {
    return (
      <div>
        <div className="flex gap-2 mb-2">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Instagram Username"
            className="border-romantic/20 focus:ring-romantic"
          />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Instagram Password"
            type="password"
            className="border-romantic/20 focus:ring-romantic"
          />
          <Button
            onClick={handleInstagramConnect}
            variant="default"
            className="bg-pink-500 text-white border-0"
          >
            <Instagram className="w-4 h-4 mr-2" />
            Connect
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder={sessionsInitialized ? "Type your message..." : "Initializing..."}
            disabled={!sessionsInitialized}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && currentInput.trim() && sessionsInitialized) {
                handleSubmit(currentInput.trim());
              }
            }}
            className="border-romantic/20 focus:ring-romantic"
          />
          <Button
            onClick={() => currentInput.trim() && handleSubmit(currentInput.trim())}
            disabled={!currentInput.trim() || !sessionsInitialized}
            variant="default"
            className="gradient-romantic text-white border-0"
          >
            Send
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col shadow-soft">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isBot
                    ? 'bg-muted text-foreground'
                    : 'gradient-romantic text-white shadow-romantic'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t">
          {renderInput()}
        </div>
      </Card>
    </div>
  );
};

export default ChatInterface;
