import React, { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatSimulation: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionsInitialized, setSessionsInitialized] = useState(false);
  const [agentsLaunched, setAgentsLaunched] = useState(false);
  const agentsLaunchedRef = useRef(false);

  const makeId = (prefix: string) =>
    `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const userUserId = useRef(makeId("sim_user"));
  const userSessionId = useRef(makeId("sim_user_sess"));
  const matchUserId = useRef(makeId("sim_match"));
  const matchSessionId = useRef(makeId("sim_match_sess"));
  const chatCheckUserId = useRef(makeId("sim_cc_user"));
  const chatCheckSessionId = useRef(makeId("sim_cc_sess"));

  useEffect(() => {
    if (agentsLaunchedRef.current) return;
    agentsLaunchedRef.current = true;
    const launchAgents = async () => {
      try {
        await fetch('/persona/create-and-launch-agents', {
          method: 'POST',
        });
        setAgentsLaunched(true);
      } catch (error) {
        console.error("Error launching agents:", error);
        setAgentsLaunched(true); // Still proceed
      }
    };

    launchAgents();
  }, []);

  useEffect(() => {
    if (!agentsLaunched) return;
    const initializeSessions = async () => {
      try {
        // Create user session
        // split userUserId based on _ and join the last two elements
        const userUserIdParts = userUserId.current.split("_");
        const userAppName = "dtwin_user_" + userUserIdParts.slice(-2).join("_");
        await fetch(`/agents/apps/${userAppName}/users/${userUserId.current}/sessions/${userSessionId.current}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userUserId.current,
            session_id: userSessionId.current,
          }),
        });

        // Create match session
        // split matchUserId based on _ and join the last two elements
        const matchUserIdParts = matchUserId.current.split("_");
        const matchAppName = "dtwin_user_" + matchUserIdParts.slice(-2).join("_");

        await fetch(`/agents/apps/${matchAppName}/users/${matchUserId.current}/sessions/${matchSessionId.current}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: matchUserId.current,
            session_id: matchSessionId.current,
          }),
        });

        // Create chat_check session
        await fetch(`/agents/apps/chat_check/users/${chatCheckUserId.current}/sessions/${chatCheckSessionId.current}`, {
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
        setSessionsInitialized(true); // Still proceed
      }
    };

    initializeSessions();
  }, [agentsLaunched]);

  useEffect(() => {
    if (!sessionsInitialized || !agentsLaunched) return;

    const runSimulation = async () => {
      let currentHistory: ChatMessage[] = [];
      let lastMessage = "Hey!";
      let senderIsUser = true;

      addUserMessage(lastMessage);
      currentHistory.push({ id: makeId('msg'), text: lastMessage, isBot: false, timestamp: new Date() });

      for (let i = 0; i < 10; i++) { // Limit to 5 turns for now
        setIsTyping(true);

        const nextSenderId = senderIsUser ? matchUserId.current : userUserId.current;
        const nextSessionId = senderIsUser ? matchSessionId.current : userSessionId.current;
        // split nextSenderId based on _ and join the last two elements
        const nextSenderIdParts = nextSenderId.split("_");
        const nextAppName = "dtwin_user_" + nextSenderIdParts.slice(-2).join("_");

        try {
          // Get next message from the agent
          const response = await fetch("/agents/run", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              app_name: nextAppName,
              user_id: nextSenderId,
              session_id: nextSessionId,
              history: currentHistory.map(msg => ({
                role: msg.isBot ? 'model' : 'user',
                parts: [{ text: msg.text }],
              })),
              new_message: { parts: [{ text: lastMessage }], role: "user" }
            }),
          });

          const responseData = await response.json();
          const agent_response = responseData[0]?.content?.parts?.[0]?.text;

          if (!agent_response) {
            addBotMessage("...");
            break;
          }

          // Check if conversation should end
          const chatCheckResponse = await fetch("/agents/run", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              app_name: "chat_check",
              user_id: chatCheckUserId.current,
              session_id: chatCheckSessionId.current,
              history: [],
              new_message: { parts: [{ text: agent_response }], role: "user" }
            }),
          });

          const chatCheckData = await chatCheckResponse.json();
          const check_response = chatCheckData[0]?.content?.parts?.[0]?.text;

          if (check_response && check_response.includes("COMPLETE")) {
            addBotMessage(agent_response);
            break;
          }

          lastMessage = agent_response;
          if (senderIsUser) {
            addBotMessage(lastMessage);
          } else {
            addUserMessage(lastMessage);
          }
          currentHistory.push({ id: makeId('msg'), text: lastMessage, isBot: senderIsUser, timestamp: new Date() });
          senderIsUser = !senderIsUser;

        } catch (error) {
          console.error("Error during simulation:", error);
          addBotMessage("An error occurred.");
          break;
        } finally {
          setIsTyping(false);
        }
      }
    };

    runSimulation();
  }, [sessionsInitialized]);

  const addBotMessage = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: makeId('msg'),
        text,
        isBot: true,
        timestamp: new Date(),
      }]);
      setIsTyping(false);
    }, 800);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: makeId('msg'),
      text,
      isBot: false,
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="bg-muted/30 rounded-lg p-3 h-48 overflow-y-auto">
      <div className="space-y-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${!message.isBot ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-lg text-xs ${
                !message.isBot
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
