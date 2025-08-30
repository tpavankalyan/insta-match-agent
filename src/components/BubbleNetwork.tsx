import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, X, Check } from 'lucide-react';
import ChatSimulation from './ChatSimulation';

interface Profile {
  id: string;
  name: string;
  age: number;
  image: string;
  interests: string[];
  bio: string;
  isUser?: boolean;
}

interface BubbleNetworkProps {
  userResponses: Record<string, any>;
}

const BubbleNetwork: React.FC<BubbleNetworkProps> = ({ userResponses }) => {
  const [selectedChat, setSelectedChat] = useState<Profile | null>(null);
  const [connections, setConnections] = useState<string[]>([]);
  const [currentChatting, setCurrentChatting] = useState<string | null>(null);
  const [completedChats, setCompletedChats] = useState<string[]>([]);
  const [finalMatch, setFinalMatch] = useState<Profile | null>(null);

  const userProfile: Profile = {
    id: 'user',
    name: userResponses.name || 'You',
    age: userResponses.age || 25,
    image: '👤',
    interests: ['Travel', 'Food', 'Music'],
    bio: userResponses.interests || 'Love life and adventure!',
    isUser: true,
  };

  const potentialMatches: Profile[] = [
    {
      id: 'match1',
      name: 'Emma',
      age: 24,
      image: '👩‍🦰',
      interests: ['Photography', 'Yoga', 'Books'],
      bio: 'Creative soul who loves capturing life\'s beautiful moments',
    },
    {
      id: 'match2',
      name: 'Sofia',
      age: 26,
      image: '👩‍🦱',
      interests: ['Dancing', 'Cooking', 'Travel'],
      bio: 'Passionate dancer and food enthusiast',
    },
    {
      id: 'match3',
      name: 'Zoe',
      age: 23,
      image: '👩',
      interests: ['Music', 'Art', 'Hiking'],
      bio: 'Artist by day, music lover by night',
    },
    {
      id: 'match4',
      name: 'Luna',
      age: 27,
      image: '👩‍🦳',
      interests: ['Fitness', 'Science', 'Movies'],
      bio: 'Fitness enthusiast and science nerd',
    },
  ];

  // Auto-start chats after component mounts
  useEffect(() => {
    const startChats = async () => {
      for (const match of potentialMatches) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setCurrentChatting(match.id);
        await new Promise(resolve => setTimeout(resolve, 3000));
        setCompletedChats(prev => [...prev, match.id]);
        setCurrentChatting(null);
      }
      
      // After all chats, determine the best match
      setTimeout(() => {
        const bestMatch = potentialMatches[1]; // Sofia
        setFinalMatch(bestMatch);
        setConnections([bestMatch.id]);
      }, 1000);
    };

    const timer = setTimeout(startChats, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getBubblePosition = (index: number, total: number) => {
    const angle = (index * 360) / total;
    const radius = 120;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    return { x, y };
  };

  const renderProfile = (profile: Profile, index?: number) => {
    const isConnected = connections.includes(profile.id);
    const isChatting = currentChatting === profile.id;
    const hasCompleted = completedChats.includes(profile.id);
    
    let position = { x: 0, y: 0 };
    if (!profile.isUser && index !== undefined) {
      position = getBubblePosition(index, potentialMatches.length);
    }

    return (
      <div
        key={profile.id}
        className={`absolute transition-all duration-1000 ${profile.isUser ? '' : 'bubble-float'}`}
        style={{
          left: `calc(50% + ${position.x}px)`,
          top: `calc(50% + ${position.y}px)`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          className={`relative w-20 h-20 rounded-full border-4 transition-all duration-500 cursor-pointer ${
            profile.isUser
              ? 'border-primary bg-card shadow-romantic'
              : isConnected
              ? 'border-success bg-success/10 shadow-glow animate-pulse'
              : isChatting
              ? 'border-romantic bg-romantic/10 bubble-pulse'
              : hasCompleted
              ? 'border-muted bg-muted/20'
              : 'border-border bg-card hover:border-romantic/50'
          }`}
          onClick={() => !profile.isUser && setSelectedChat(profile)}
        >
          <div className="w-full h-full rounded-full flex items-center justify-center text-2xl">
            {profile.image}
          </div>
          
          {isChatting && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-romantic rounded-full flex items-center justify-center">
              <MessageCircle className="w-3 h-3 text-white" />
            </div>
          )}
          
          {isConnected && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full flex items-center justify-center">
              <Heart className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        
        <div className="text-center mt-2">
          <div className="font-medium text-sm">{profile.name}</div>
          <div className="text-xs text-muted-foreground">{profile.age}</div>
        </div>
      </div>
    );
  };

  const renderConnections = () => {
    return potentialMatches.map((match, index) => {
      const isConnected = connections.includes(match.id);
      if (!isConnected) return null;

      const matchPos = getBubblePosition(index, potentialMatches.length);
      
      return (
        <svg
          key={`connection-${match.id}`}
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          <line
            x1="50%"
            y1="50%"
            x2={`calc(50% + ${matchPos.x}px)`}
            y2={`calc(50% + ${matchPos.y}px)`}
            stroke="hsl(var(--success))"
            strokeWidth="3"
            strokeDasharray="5,5"
            className="animate-pulse"
            style={{
              animation: 'connection-draw 1s ease-out forwards'
            }}
          />
        </svg>
      );
    });
  };

  return (
    <div className="min-h-screen gradient-soft p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Finding Your Perfect Match</h1>
          <p className="text-muted-foreground">Watch as our AI analyzes compatibility in real-time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main bubble network */}
          <div className="lg:col-span-2">
            <Card className="relative h-96 shadow-soft overflow-hidden">
              {renderConnections()}
              
              {/* User profile in center */}
              {renderProfile(userProfile)}
              
              {/* Potential matches around the circle */}
              {potentialMatches.map((match, index) => renderProfile(match, index))}
            </Card>
            
            {finalMatch && (
              <Card className="mt-4 p-6 shadow-soft border-success/20">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto gradient-success rounded-full flex items-center justify-center">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-success">Perfect Match Found!</h3>
                  <p className="text-muted-foreground">
                    Based on our AI analysis, <strong>{finalMatch.name}</strong> is your ideal match because:
                  </p>
                  <div className="bg-success/5 rounded-lg p-4 text-sm">
                    <ul className="space-y-2 text-left">
                      <li>• 94% compatibility score based on interests and values</li>
                      <li>• Shared passion for {finalMatch.interests[0].toLowerCase()} and {finalMatch.interests[2].toLowerCase()}</li>
                      <li>• Similar communication style and humor</li>
                      <li>• Complementary personality traits for long-term compatibility</li>
                    </ul>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Chat sidebar */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Live Conversations</h3>
            
            {currentChatting && (
              <Card className="p-4 shadow-soft border-romantic/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full gradient-romantic flex items-center justify-center text-white">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">AI Chat Active</div>
                    <div className="text-sm text-muted-foreground">
                      Chatting with {potentialMatches.find(m => m.id === currentChatting)?.name}
                    </div>
                  </div>
                </div>
                <ChatSimulation />
              </Card>
            )}

            {completedChats.map(chatId => {
              const match = potentialMatches.find(m => m.id === chatId);
              if (!match) return null;
              
              const isConnected = connections.includes(chatId);
              
              return (
                <Card key={chatId} className={`p-4 shadow-soft ${isConnected ? 'border-success/20 bg-success/5' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{match.image}</div>
                    <div className="flex-1">
                      <div className="font-medium">{match.name}</div>
                      <div className="text-sm text-muted-foreground">Chat completed</div>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isConnected ? 'bg-success text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {isConnected ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 shadow-romantic">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedChat.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedChat(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">{selectedChat.image}</div>
                <div className="text-lg font-medium">{selectedChat.name}, {selectedChat.age}</div>
              </div>
              
              <p className="text-muted-foreground text-center">{selectedChat.bio}</p>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedChat.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-romantic/10 text-romantic rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BubbleNetwork;