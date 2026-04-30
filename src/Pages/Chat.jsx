import { useState, useEffect } from "react";

const BASE_URL = "https://tourmate-backend-1.onrender.com";
const CHAT_KEY = "test";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const fetchMessages = async () => {
    console.log("Fetching messages...");
    const res = await fetch(`${BASE_URL}/api/chat/${CHAT_KEY}`);
    const data = await res.json();
    console.log(data);
    setMessages(data);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatKey: CHAT_KEY, sender: "user", text: message }),
    });
    setMessage("");
    await fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 px-6 pt-24 pb-8 flex flex-col items-center">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl flex flex-col h-[70vh]">
        <div className="p-4 border-b font-bold text-lg text-gray-700">💬 TourMate Chat</div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`px-4 py-2 rounded-xl max-w-xs text-sm ${
                msg.sender === "user"
                  ? "bg-yellow-400 text-white self-end ml-auto"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <span className="block font-semibold text-xs mb-1">{msg.sender}</span>
              {msg.text}
            </div>
          ))}
        </div>

        <div className="p-4 border-t flex gap-2">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
