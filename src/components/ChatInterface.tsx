import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Instagram, Heart, Camera, Video } from 'lucide-react';

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
          <div className="flex gap-2">
            <Button 
              onClick={() => handleSubmit(true)} 
              variant="default"
              className="flex items-center gap-2 gradient-romantic text-white border-0 shadow-romantic"
            >
              <Instagram className="w-4 h-4" />
              Connect Instagram
            </Button>
          </div>
        );

      case 'text':
      case 'number':
        return (
          <div className="flex gap-2">
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
              className="border-romantic/20 focus:ring-romantic"
            />
            <Button 
              onClick={() => currentInput.trim() && handleSubmit(currentInput.trim())}
              disabled={!currentInput.trim()}
              variant="default"
              className="gradient-romantic text-white border-0"
            >
              Send
            </Button>
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <Textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Tell me more..."
              className="border-romantic/20 focus:ring-romantic"
              rows={3}
            />
            <Button 
              onClick={() => currentInput.trim() && handleSubmit(currentInput.trim())}
              disabled={!currentInput.trim()}
              variant="default"
              className="gradient-romantic text-white border-0"
            >
              Send
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