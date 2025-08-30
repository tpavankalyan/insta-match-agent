import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Instagram, Heart, Camera, Video, Bot, User } from 'lucide-react';

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
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isTyping, setIsTyping] = useState(false);

  const steps = [
    {
      id: 'welcome',
      botMessage: "Hi! Welcome to LoveSync AI 💕 I'm here to help you find your perfect match. Let's start by connecting your Instagram to get to know you better.",
      type: 'instagram',
    },
    {
      id: 'name',
      botMessage: "Great! Now, what's your name?",
      type: 'text',
    },
    {
      id: 'age',
      botMessage: "Nice to meet you! How old are you?",
      type: 'number',
    },
    {
      id: 'interests',
      botMessage: "Tell me about your interests and hobbies. What do you love doing?",
      type: 'textarea',
    },
    {
      id: 'photos',
      botMessage: "Let's add some photos to your profile! Upload your best pictures.",
      type: 'upload',
    },
    {
      id: 'lookingfor',
      botMessage: "What are you looking for in a relationship?",
      type: 'textarea',
    },
    {
      id: 'complete',
      botMessage: "Perfect! I have everything I need. Let me find your perfect matches...",
      type: 'complete',
    }
  ];

  useEffect(() => {
    // Add initial message
    addBotMessage(steps[0].botMessage);
  }, []);

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

  const handleSubmit = (value: any) => {
    const currentStepData = steps[currentStep];
    
    if (currentStepData.type === 'instagram') {
      addUserMessage("Connected to Instagram ✓");
      setResponses(prev => ({ ...prev, instagram: true }));
    } else {
      addUserMessage(typeof value === 'string' ? value : 'Uploaded files');
      setResponses(prev => ({ ...prev, [currentStepData.id]: value }));
    }

    const nextStep = currentStep + 1;
    if (nextStep < steps.length) {
      setCurrentStep(nextStep);
      setTimeout(() => {
        addBotMessage(steps[nextStep].botMessage);
        if (steps[nextStep].type === 'complete') {
          setTimeout(() => {
            onComplete(responses);
          }, 2000);
        }
      }, 1500);
    }
    
    setCurrentInput('');
  };

  const renderInput = () => {
    const currentStepData = steps[currentStep];
    
    if (!currentStepData || currentStepData.type === 'complete') return null;

    switch (currentStepData.type) {
      case 'instagram':
         return (
           <div className="flex gap-3">
             <Button 
               onClick={() => handleSubmit(true)} 
               variant="default"
               className="flex items-center gap-2 gradient-romantic text-white border-0 shadow-romantic rounded-full px-6 py-3 hover:shadow-lg transition-all duration-200"
             >
               <Instagram className="w-5 h-5" />
               Connect Instagram
             </Button>
           </div>
         );

      case 'text':
      case 'number':
        return (
          <div className="flex gap-3 items-end">
            <Input
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Type your answer..."
              type={currentStepData.type === 'number' ? 'number' : 'text'}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && currentInput.trim()) {
                  handleSubmit(currentInput.trim());
                }
              }}
              className="flex-1 rounded-full border-border/50 focus:border-romantic focus:ring-romantic/20 bg-background/50 backdrop-blur-sm"
            />
            <Button 
              onClick={() => currentInput.trim() && handleSubmit(currentInput.trim())}
              disabled={!currentInput.trim()}
              variant="default"
              className="gradient-romantic text-white border-0 rounded-full w-12 h-12 p-0 shadow-romantic hover:shadow-lg transition-all duration-200"
            >
              <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </Button>
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-3">
            <Textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Tell me more..."
              className="rounded-2xl border-border/50 focus:border-romantic focus:ring-romantic/20 bg-background/50 backdrop-blur-sm resize-none"
              rows={3}
            />
            <Button 
              onClick={() => currentInput.trim() && handleSubmit(currentInput.trim())}
              disabled={!currentInput.trim()}
              variant="default"
              className="gradient-romantic text-white border-0 rounded-full px-6 py-3 hover:shadow-lg transition-all duration-200"
            >
              Send Message
            </Button>
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                className="flex items-center gap-2 h-20 border-romantic/30 text-romantic hover:bg-romantic/10"
              >
                <Camera className="w-5 h-5" />
                <div className="text-center">
                  <div className="font-medium">Photos</div>
                  <div className="text-xs text-muted-foreground">Upload images</div>
                </div>
              </Button>
              <Button 
                variant="outline"
                className="flex items-center gap-2 h-20 border-romantic/30 text-romantic hover:bg-romantic/10"
              >
                <Video className="w-5 h-5" />
                <div className="text-center">
                  <div className="font-medium">Videos</div>
                  <div className="text-xs text-muted-foreground">Upload videos</div>
                </div>
              </Button>
            </div>
            <Button 
              onClick={() => handleSubmit(['photo1.jpg', 'photo2.jpg'])}
              variant="default"
              className="w-full gradient-romantic text-white border-0"
            >
              Continue with Sample Photos
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-romantic/5 flex flex-col">
      {/* Modern Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 gradient-romantic rounded-full flex items-center justify-center shadow-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">LoveSync AI</h1>
              <p className="text-xs text-muted-foreground">Online • Ready to help</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-romantic rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">AI Matchmaker</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex items-end gap-2 animate-fade-in ${
                message.isBot ? 'justify-start' : 'justify-end'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {message.isBot && (
                <div className="w-8 h-8 gradient-romantic rounded-full flex items-center justify-center shadow-md flex-shrink-0 mb-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`group relative max-w-[75%] ${message.isBot ? 'order-2' : 'order-1'}`}>
                <div
                  className={`px-4 py-3 rounded-3xl shadow-sm transition-all duration-200 hover:shadow-md ${
                    message.isBot
                      ? 'bg-background border border-border/50 text-foreground rounded-bl-md'
                      : 'gradient-romantic text-white rounded-br-md shadow-romantic/25'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                </div>
                <div className={`text-xs text-muted-foreground/70 mt-1 px-1 ${
                  message.isBot ? 'text-left' : 'text-right'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {!message.isBot && (
                <div className="w-8 h-8 bg-romantic/20 rounded-full flex items-center justify-center flex-shrink-0 mb-1 order-2">
                  <User className="w-4 h-4 text-romantic" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-end gap-2 animate-fade-in">
              <div className="w-8 h-8 gradient-romantic rounded-full flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-background border border-border/50 px-4 py-3 rounded-3xl rounded-bl-md shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-romantic rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-romantic rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 bg-romantic rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
        
      {/* Modern Input Area */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-xl border-t border-border/50 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {renderInput()}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;