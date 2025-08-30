import React, { useState, useEffect } from 'react';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'match';
  timestamp: Date;
}

const ChatSimulation: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const simulationMessages = [
    { sender: 'user' as const, text: "Hey! I saw you love photography 📸" },
    { sender: 'match' as const, text: "Hi! Yes, I'm passionate about it! Do you take photos too?" },
    { sender: 'user' as const, text: "I'm just getting into it. Any tips for a beginner?" },
    { sender: 'match' as const, text: "Start with natural light, it's so forgiving! And practice every day 😊" },
    { sender: 'user' as const, text: "That's great advice! I'd love to see some of your work" },
    { sender: 'match' as const, text: "I'd be happy to share! Maybe we could go on a photo walk sometime? ☕" },
  ];

  useEffect(() => {
    const addMessage = async (index: number) => {
      if (index >= simulationMessages.length) return;

      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setMessages(prev => [...prev, {
        id: Date.now().toString() + index,
        text: simulationMessages[index].text,
        sender: simulationMessages[index].sender,
        timestamp: new Date(),
      }]);
      
      setIsTyping(false);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      addMessage(index + 1);
    };

    addMessage(0);
  }, []);

  return (
    <div className="bg-muted/30 rounded-lg p-3 h-48 overflow-y-auto">
      <div className="space-y-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-lg text-xs ${
                message.sender === 'user'
                  ? 'bg-romantic text-white'
                  : 'bg-background text-foreground border'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-background border px-3 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSimulation;