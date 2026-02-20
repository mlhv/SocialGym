import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useWebSocket} from "../hooks/useWebSocket";
import { VibeGraph } from "./VibeGraph";

interface ChatBoxProps {
    username: string;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ username }) => {
    const { messages, sendMessage, isConnected } = useWebSocket(username);
    const [gameMode, setGameMode] = useState('DATING')
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e: React.SubmitEvent | React.MouseEvent) => {
        e.preventDefault();
        if (input.trim()) {
            sendMessage(input, gameMode);
            setInput('');
        }
    };

    const graphData = messages
        .filter(msg => msg.type === 'CHAT' && msg.score !== undefined)
        .map((msg, index) => ({
          index: index + 1,
          score: msg.score || 0, // Default to 0 if score is undefined
        }));

    const currentVibe = graphData.length > 0 ? graphData[graphData.length - 1].score : 100;

    return (
    <div className="flex flex-col md:flex-row gap-4 w-full max-w-5xl h-[600px]">
      {/*Chat area*/}
      <div className="flex flex-col flex-1 border border-gray-300 rounded-lg shadow-lg bg-white overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-lg">SocialGym</h2>

            {/* THE DROPDOWN */}
            <select 
                value={gameMode} 
                onChange={(e) => setGameMode(e.target.value)}
                className="bg-blue-700 text-white text-sm rounded px-2 py-1 border border-blue-500 focus:outline-none"
            >
                <option value="DATING">❤️ Dating Coach</option>
                <option value="DEBATE">⚖️ Debate Club</option>
            </select>
          </div>

          <span className={`text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-500'}`}>
            {isConnected ? 'Live' : 'Connecting...'}
          </span>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-2">
        {messages.map((msg, index) => {
          if (msg.type === 'JOIN' || msg.type === 'LEAVE') {
            return (
              <div key={index} className="text-center text-xs text-gray-400 my-1">
                {msg.sender} {msg.type === 'JOIN' ? 'joined' : 'left'} the chat
              </div>
            );
          }

          const isMe = msg.sender === username;
          return (
            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 text-sm shadow-sm flex flex-col ${
                  isMe 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                {!isMe && <div className="text-xs text-gray-400 mb-1">{msg.sender}</div>}
                
                {/* The actual message */}
                <div>{msg.content}</div>

                {/* NEW: ML Sentiment Badge */}
                {msg.sentimentScore != null && (
                  <div 
                    className={`text-[10px] mt-2 font-medium inline-block px-2 py-0.5 rounded w-fit ${
                      msg.sentimentScore > 0 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}
                  >
                    🧠 ML Vibe: {msg.sentimentScore > 0 ? '+' : ''}{msg.sentimentScore.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={!isConnected}
        />
        <button
          type="submit"
          disabled={!isConnected || !input.trim()}
          className="bg-blue-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </form>
    </div>
    
    {/* Right sidebar with graph and feedback */}
    <div className="w-full md:w-80 flex flex-col gap-4">
        {/* 1. The Graph */}
        <VibeGraph data={graphData} />
        {/* 2. The Latest Feedback Card */}
        <div className={`p-4 rounded-lg shadow-md border-l-4 ${currentVibe > 50 ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
            <h4 className="font-bold text-gray-700 text-sm mb-1">AI Coach Says:</h4>
            <p className="text-sm text-gray-600 italic">
                {messages.length > 0 && messages[messages.length-1].feedback 
                    ? `"${messages[messages.length-1].feedback}"`
                    : "Start chatting to get feedback..."}
            </p>
        </div>
    </div>
  </div>
  );
};