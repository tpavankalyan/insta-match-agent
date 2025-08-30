import React, { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import LoadingScreen from '@/components/LoadingScreen';
import BubbleNetwork from '@/components/BubbleNetwork';

type AppStage = 'chat' | 'loading' | 'matching';

const DatingApp: React.FC = () => {
  const [stage, setStage] = useState<AppStage>('chat');
  const [userResponses, setUserResponses] = useState<Record<string, any>>({});

  const handleChatComplete = (responses: Record<string, any>) => {
    setUserResponses(responses);
    setStage('loading');
    
    // Simulate backend processing time
    setTimeout(() => {
      setStage('matching');
    }, 8000);
  };

  switch (stage) {
    case 'chat':
      return <ChatInterface onComplete={handleChatComplete} />;
    case 'loading':
      return <LoadingScreen />;
    case 'matching':
      return <BubbleNetwork userResponses={userResponses} />;
    default:
      return <ChatInterface onComplete={handleChatComplete} />;
  }
};

export default DatingApp;