import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { 
  MapPin, Briefcase, LogOut, Star, User as UserIcon, ArrowLeft, MessageSquare, Users, Wallet
} from "lucide-react";

function GuideDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [assignedTours, setAssignedTours] = useState([]);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedCity, setSelectedCity] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // ✅ LOAD DATA FROM BACKEND (Updated Logic)
  const loadAssignments = async () => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user"));

      if (!token || !storedUser) {
        navigate("/login");
        return;
      }

      if (storedUser.role && storedUser.role.toLowerCase() !== "guide") {
        alert("Access Denied: This dashboard is for guides only.");
        navigate("/login");
        return;
      }

      // Check approval status
      if (storedUser.approvalStatus && storedUser.approvalStatus !== "approved") {
        alert("Access Denied: Your account is pending Admin review.");
        navigate("/login");
        return;
      }

      const guideName = storedUser.fullName || storedUser.name || "";
      const res = await axios.get(`https://tourmate-backend-1.onrender.com/api/guide/dashboard?guideName=${encodeURIComponent(guideName)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fix: Ensure data is an array before setting state to avoid crashes
      setAssignedTours(Array.isArray(res.data) ? res.data : []);
      setUser(storedUser);
      setSelectedCity(storedUser.city || "");

      // Load guide availability
      const allGuides = await axios.get("https://tourmate-backend-1.onrender.com/api/guide", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const myGuide = allGuides.data.find(g => g.guideName === (storedUser.fullName || storedUser.name));
      if (myGuide) setIsAvailable(myGuide.available !== false);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      
      // If the backend returns 404, we stay on page but show 0 tours
      if (err.response && err.response.status === 404) {
        setAssignedTours([]);
        setUser(JSON.parse(localStorage.getItem("user")));
      } else {
        // Only redirect on actual auth errors
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    loadAssignments();
    const interval = setInterval(loadAssignments, 10000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  const handleToggleAvailability = async () => {
    try {
      const token = localStorage.getItem("token");
      const guideName = user?.fullName || user?.name;
      await axios.put(
        `https://tourmate-backend-1.onrender.com/api/guide/availability/${encodeURIComponent(guideName)}`,
        { available: !isAvailable },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsAvailable(!isAvailable);
    } catch {
      alert("Failed to update availability.");
    }
  };

  const handleCityUpdate = async (city) => {
    try {
      const token = localStorage.getItem("token");
      // Use email to find and update the guide's city
      await axios.put(
        `https://tourmate-backend-1.onrender.com/api/admin/guide/city/${user.id || 0}`,
        { city },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedCity(city);
      const updatedUser = { ...user, city };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert(`✅ You are now listed as a guide in ${city}!`);
    } catch {
      // Fallback: update via email endpoint
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `https://tourmate-backend-1.onrender.com/api/admin/guide/city/email`,
          { email: user.email, city },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSelectedCity(city);
        const updatedUser = { ...user, city };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        alert(`✅ You are now listed as a guide in ${city}!`);
      } catch {
        alert("Failed to update city. Please log out and log in again.");
      }
    }
  };

  const handleUpdateStatus = async (tourId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://tourmate-backend-1.onrender.com/api/guide/tour/${tourId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Optimistic UI Update
      setAssignedTours(prev =>
        prev.map(t => (t.id === tourId ? { ...t, status: newStatus } : t))
      );
    } catch {
      alert("Failed to update tour status.");
    }
  };

  // ✅ CHAT LOGIC (Local Storage based)
  useEffect(() => {
    if (!activeChat) return;
    const chatKey = `${activeChat.clientEmail}_guide_${activeChat.city}`;
    const fetchMsgs = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/chat/${encodeURIComponent(chatKey)}`);
        const data = await res.json();
        setChatMessages(data);
      } catch {}
    };
    fetchMsgs();
    const interval = setInterval(fetchMsgs, 3000);
    return () => clearInterval(interval);
  }, [activeChat]);

  const openChat = (clientEmail, city) => {
    setActiveChat({ clientEmail, city: (city || "").toLowerCase().trim() });
    setActiveTab("Messages");
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;
    const chatKey = `${activeChat.clientEmail}_guide_${activeChat.city}`;
    try {
      await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatKey, sender: 'guide', text: newMessage, timestamp: Date.now() }),
      });
      setNewMessage("");
      const res = await fetch(`http://localhost:8080/api/chat/${encodeURIComponent(chatKey)}`);
      setChatMessages(await res.json());
    } catch {}
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen font-sans mt-16 text-gray-800 relative z-0">
      {/* 🔹 STYLISH BACKGROUND */}
      <div className="fixed inset-0 bg-slate-900 z-[-3]" />
      <div 
        className="fixed inset-0 z-[-2] pointer-events-none"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021')", 
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />
      <div className="fixed inset-0 bg-black/60 z-[-1] pointer-events-none" />

      {/* 🔹 SIDEBAR */}
      <aside className="w-64 bg-white/75 backdrop-blur-xl border-r border-gray-200/60 fixed h-full z-10 hidden md:flex flex-col">
        <div onClick={() => navigate("/")} className="p-6 flex items-center gap-3 border-b border-gray-100/60 cursor-pointer">
          <MapPin fill="#eab308" className="text-white" size={24} />
          <span className="text-xl font-bold text-gray-900">TourMate</span>
        </div>
        
        <div className="flex-1 px-4 py-8 space-y-1">
          <SidebarItem icon={<Briefcase size={18}/>} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
          <SidebarItem icon={<Users size={18}/>} label="My Tours" active={activeTab === "My Tours"} onClick={() => setActiveTab("My Tours")} />
          <SidebarItem icon={<MessageSquare size={18}/>} label="Messages" active={activeTab === "Messages"} onClick={() => setActiveTab("Messages")} />
          <SidebarItem icon={<Wallet size={18}/>} label="Earnings" active={activeTab === "Earnings"} onClick={() => setActiveTab("Earnings")} />
          <SidebarItem icon={<UserIcon size={18}/>} label="Profile" active={activeTab === "Profile"} onClick={() => setActiveTab("Profile")} />
        </div>

        <div className="p-4 border-t border-gray-100/60 mb-16 space-y-1">
          <SidebarItem icon={<ArrowLeft size={18}/>} label="Back to Home" onClick={() => navigate("/")} />
          <SidebarItem icon={<LogOut size={18}/>} label="Sign Out" onClick={handleLogout} isDanger />
        </div>
      </aside>

      {/* 🔹 MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-6 md:p-10 relative max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-white drop-shadow-sm">Welcome, {user?.fullName?.split(" ")[0]}</h1>
            <p className="text-gray-300">Manage your tours and earnings in real-time.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center font-bold">
               {user?.fullName?.charAt(0)}
             </div>
          </div>
        </header>

        {/* DASHBOARD STATS */}
        {activeTab === "Dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Total Tours" value={assignedTours.length} onClick={() => setActiveTab("My Tours")} />
              <StatCard title="Pending" value={assignedTours.filter(t => t.status === 'pending').length} />
              <StatCard title="Confirmed" value={assignedTours.filter(t => t.status === 'confirmed').length} />
              <StatCard title="Rating" value="4.9 / 5.0" />
            </div>
            {/* Availability Toggle */}
            <div className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-gray-200/60 shadow-sm flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Availability Status</p>
                <p className="text-sm text-gray-500">{isAvailable ? "You are visible to tourists and can be booked" : "You are hidden from tourists — no new bookings"}</p>
              </div>
              <button
                onClick={handleToggleAvailability}
                className={`px-5 py-2 rounded-lg text-white font-medium transition ${
                  isAvailable ? "bg-green-500 hover:bg-green-600" : "bg-red-400 hover:bg-red-500"
                }`}
              >
                {isAvailable ? "🟢 Available" : "🔴 Unavailable"}
              </button>
            </div>
            {/* Quick List */}
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl border border-gray-200/60 shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Your Working City</h3>
                {selectedCity ? (
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold capitalize">{selectedCity}</span>
                    <button onClick={() => setSelectedCity("")} className="text-sm text-blue-600 underline">Change City</button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 text-sm mb-3">Select the city where you want to offer guide services:</p>
                    <div className="flex flex-wrap gap-2">
                      {["hyderabad","warangal","mumbai","pune","delhi","bangalore","mysore","chennai","madurai","jaipur","udaipur","goa","kochi","munnar","kolkata","dehradun","nainital","manali","shimla"].map(c => (
                        <button key={c} onClick={() => handleCityUpdate(c)}
                          className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg capitalize transition">
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
            {/* Upcoming Schedule */}
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl border border-gray-200/60 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Upcoming Schedule</h3>
                {assignedTours.length === 0 ? <p className="text-gray-500">No active assignments found.</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {assignedTours.slice(0, 4).map((t, i) => (
                            <div key={i} className="p-4 border border-gray-100 rounded-lg bg-white/60">
                                <h4 className="font-bold capitalize">{t.cities} Tour</h4>
                                <p className="text-sm text-gray-500">Tourist: {t.touristName}</p>
                                <p className="text-sm text-gray-500">{t.startDate} - {t.endDate}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
        )}

        {/* MY TOURS */}
        {activeTab === "My Tours" && (
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl border border-gray-200/60 shadow-sm">
            <h3 className="text-2xl font-semibold mb-6">Assigned Tours</h3>
            <div className="space-y-4">
              {assignedTours.length === 0 ? <p>No tours found.</p> : assignedTours.map((t) => (
                <div key={t.id} className="p-5 border border-gray-200 rounded-xl bg-white/60 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-lg capitalize">{t.cities} Tour</h4>
                    <p className="text-sm text-gray-500">Tourist: {t.touristName}</p>
                    <p className="text-sm text-gray-500">Dates: {t.startDate} → {t.endDate}</p>
                    <p className={`text-sm font-bold ${t.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'}`}>
                        Status: {t.status?.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {t.status === "pending" && (
                      <>
                        <button onClick={() => handleUpdateStatus(t.id, "confirmed")} className="px-3 py-1.5 bg-green-500 text-white rounded-md text-sm">Accept</button>
                        <button onClick={() => handleUpdateStatus(t.id, "rejected")} className="px-3 py-1.5 bg-red-500 text-white rounded-md text-sm">Reject</button>
                      </>
                    )}
                    <button onClick={() => openChat(t.email, t.cities)} className="px-4 py-1.5 bg-slate-900 text-white rounded-md text-sm">Chat</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === "Messages" && (
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl border min-h-[500px] flex flex-col">
            {activeChat ? (
              <>
                <h3 className="border-b pb-3 mb-4 font-bold">Chatting with {activeChat.clientEmail}</h3>
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'guide' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-2 rounded-lg max-w-xs ${msg.sender === 'guide' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 border p-2 rounded-md" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                  />
                  <button onClick={handleSendMessage} className="bg-blue-600 text-white px-4 py-2 rounded-md">Send</button>
                </div>
              </>
            ) : (
              <div className="m-auto text-center text-gray-400">
                 <MessageSquare size={48} className="mx-auto mb-2" />
                 <p>Select a tour to start chatting with a client.</p>
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "Profile" && (
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl border border-gray-200/60">
            <h3 className="text-2xl font-semibold mb-6">Profile Settings</h3>
            <div className="space-y-4">
                <div className="border-b pb-4">
                    <label className="text-xs text-gray-500 uppercase">Full Name</label>
                    <p className="text-lg font-medium">{user?.fullName}</p>
                </div>
                <div className="border-b pb-4">
                    <label className="text-xs text-gray-500 uppercase">Email</label>
                    <p className="text-lg font-medium">{user?.email}</p>
                </div>
                <div className="border-b pb-4">
                    <label className="text-xs text-gray-500 uppercase">Role</label>
                    <p className="text-lg font-medium">Verified Tour Guide</p>
                </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// 🔹 HELPER COMPONENTS
function SidebarItem({ label, active, onClick, icon, isDanger }) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium
        ${active ? "bg-white/80 text-gray-900 shadow-sm" : isDanger ? "text-red-500 hover:bg-red-50" : "text-gray-500 hover:bg-white/60"}
      `}
    >
      {icon} {label}
    </div>
  );
}

function StatCard({ title, value, onClick }) {
  return (
    <div onClick={onClick} className={`bg-white/80 backdrop-blur-md p-5 rounded-xl border shadow-sm ${onClick ? 'cursor-pointer hover:bg-white' : ''}`}>
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}

export default GuideDashboard;