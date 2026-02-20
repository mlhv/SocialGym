import { useState } from 'react'
import { ChatBox } from './components/ChatBox'

function App() {
  const [username, setUsername] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>('');

  const handleLogin = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUsername(tempName);
      setIsLoggedIn(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {!isLoggedIn ? (
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Enter SocialGym</h1>
          <input
            type="text"
            placeholder="Enter your username"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Join Chat
          </button>
        </form>
      ) : (
        <ChatBox username={username} />
      )}
    </div>
  );
}

export default App;