import React, { useEffect, useState } from 'react';
import { Heart, Sparkles, Users, Zap } from 'lucide-react';

interface LoadingScreenProps {
  userId: string | null;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ userId }) => {
  const [done, setDone] = useState(false);
  const [persona, setPersona] = useState<string | null>(null);

  const steps = [
    { icon: Users, text: "Analyzing your profile...", delay: 0 },
    { icon: Heart, text: "Finding characteristics...", delay: 2000 },
    { icon: Sparkles, text: "Using AI to understand preferences...", delay: 4000 },
    { icon: Zap, text: "Creating your clone...", delay: 6000 },
  ];

  useEffect(() => {
    const runPersona = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`/persona/generate-persona?user_id=${userId}`);
        const data = await res.json();
        if (data.output) {
          setPersona(data.output);
        } else {
          console.error("Error:", data.error);
        }
      } catch (err) {
        console.error("Failed to call backend", err);
      } finally {
        setDone(true); // mark loading finished
      }
    };

    runPersona();
  }, []);

  if (done && persona) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white shadow-lg p-6 rounded-xl max-w-lg">
          <h2 className="text-2xl font-bold mb-4">Persona Generated ✅</h2>
          <pre className="text-sm whitespace-pre-wrap">{persona}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        {/* ... your same animations ... */}
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
      </div>
    </div>
  );
};

export default LoadingScreen;
