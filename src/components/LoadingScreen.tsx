import React from 'react';
import { Heart, Sparkles, Users, Zap } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  const steps = [
    { icon: Users, text: "Analyzing your profile...", delay: 0 },
    { icon: Heart, text: "Finding compatible matches...", delay: 2000 },
    { icon: Sparkles, text: "Using AI to understand preferences...", delay: 4000 },
    { icon: Zap, text: "Creating your perfect connections...", delay: 6000 },
  ];

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        {/* Main loading animation */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 gradient-romantic rounded-full opacity-20 animate-ping"></div>
            <div className="absolute inset-2 gradient-romantic rounded-full opacity-40 animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute inset-4 gradient-romantic rounded-full opacity-60 animate-ping" style={{ animationDelay: '1s' }}></div>
            <div className="absolute inset-6 gradient-romantic rounded-full flex items-center justify-center shadow-glow">
              <Heart className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground">
            Finding Your Perfect Match
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Our AI is analyzing thousands of profiles to find your ideal connections
          </p>
        </div>

        {/* Progress steps */}
        <div className="space-y-4 max-w-md mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-card shadow-soft"
              style={{
                animation: `fade-in 0.6s ease-out forwards`,
                animationDelay: `${step.delay}ms`,
                opacity: 0
              }}
            >
              <div className="w-8 h-8 gradient-romantic rounded-full flex items-center justify-center">
                <step.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-foreground font-medium">{step.text}</span>
            </div>
          ))}
        </div>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 gradient-romantic rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;