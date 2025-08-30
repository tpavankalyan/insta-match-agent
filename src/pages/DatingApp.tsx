import React, { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import LoadingScreen from '@/components/LoadingScreen';
import BubbleNetwork from '@/components/BubbleNetwork';

type AppStage = 'chat' | 'loading' | 'matching';

const DatingApp: React.FC = () => {
  const [stage, setStage] = useState<AppStage>('chat');
  const [userResponses, setUserResponses] = useState<Record<string, any>>({});
  const [userId, setUserId] = useState<string | null>(null);

  const handleChatComplete = (responses: Record<string, any>) => {
    setUserResponses(responses);
    setUserId(responses.userId);
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
      return <LoadingScreen userId={userId} />;
    case 'matching':
      return <BubbleNetwork userResponses={userResponses} userId={userId!} />;
    default:
      return <ChatInterface onComplete={handleChatComplete} />;
  }
};

export default DatingApp;
