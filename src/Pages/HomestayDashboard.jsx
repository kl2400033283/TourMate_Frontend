import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../api";
import { 
  MapPin, Home as HomeIcon, LogOut, Wallet, User as UserIcon, ArrowLeft, Calendar, MessageSquare, Plus, X, List
} from "lucide-react";

function HomestayDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [reservedStays, setReservedStays] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [newPropName, setNewPropName] = useState("");
  const [newPropCity, setNewPropCity] = useState("");
  const [newPropPrice, setNewPropPrice] = useState("");
  const [newPropDesc, setNewPropDesc] = useState("");

  const loadReservations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }

      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser || storedUser.role?.toLowerCase() !== "host") {
        alert("Access Denied: This dashboard is for homestay hosts only.");
        navigate("/login");
        return;
      }

      setUser(storedUser);

      // GET BOOKINGS WITH HOMESTAY
      const res = await axios.get(`${BASE_URL}/api/host/dashboard?hostEmail=${encodeURIComponent(storedUser.email)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservedStays(Array.isArray(res.data) ? res.data : []);

      // GET MY PROPERTIES
      const propRes = await axios.get(`${BASE_URL}/api/host?hostEmail=${encodeURIComponent(storedUser.email)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyProperties(Array.isArray(propRes.data) ? propRes.data : []);

    } catch {
      console.error("err");
      setUser(JSON.parse(localStorage.getItem("user")));
    }
  };

  useEffect(() => {
    loadReservations();
    const interval = setInterval(loadReservations, 10000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CHAT
  useEffect(() => {
    if (!activeChat) return;
    const chatKey = `${activeChat.clientEmail}_host_${activeChat.city}`;
    const fetchMsgs = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/chat/${encodeURIComponent(chatKey)}`);
        const data = await res.json();
        setChatMessages(data);
      } catch {}
    };
    fetchMsgs();
    const interval = setInterval(fetchMsgs, 3000);
    return () => clearInterval(interval);
  }, [activeChat]);

  const openChat = (clientEmail, city) => {
    setActiveChat({ clientEmail, city: city?.toLowerCase().trim() });
    setActiveTab("Messages");
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;
    const chatKey = `${activeChat.clientEmail}_host_${activeChat.city}`;
    try {
      await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatKey, sender: 'host', text: newMessage, timestamp: Date.now() }),
      });
      setNewMessage("");
      const res = await fetch(`${BASE_URL}/api/chat/${encodeURIComponent(chatKey)}`);
      setChatMessages(await res.json());
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  // UPDATE BOOKING STATUS via backend
  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${BASE_URL}/api/host/booking/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReservedStays(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch {
      alert("Failed to update booking");
    }
  };

  // ADD PROPERTY via backend
  const handleAddProperty = async (e) => {
    e.preventDefault();
    if (!newPropName || !newPropCity || !newPropPrice) return;
    try {
      const token = localStorage.getItem("token");
      const newProperty = {
        homestayName: newPropName,
        hostName: user?.fullName,
        hostEmail: user?.email,
        city: newPropCity.toLowerCase().trim(),
        status: "PENDING",
      };
      await axios.post(`${BASE_URL}/api/host`, newProperty, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewPropName(""); setNewPropCity(""); setNewPropPrice(""); setNewPropDesc("");
      setShowAddPropertyModal(false);
      alert("Property listed successfully! Pending Admin review.");
      loadReservations();
    } catch {
      alert("Failed to list property.");
    }
  };

  if (!user) return null;

  const confirmedStays = reservedStays.filter(t => t.status === "confirmed");
  const totalEarnings = confirmedStays.reduce((sum, t) => sum + (t.homestayPrice || 0), 0);

  return (
    <div className="flex min-h-screen font-sans mt-16 text-gray-800 relative z-0">
      <div className="fixed inset-0 bg-slate-900 z-[-3]" />
      <div className="fixed inset-0 z-[-2] pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />
      <div className="fixed inset-0 bg-black/60 z-[-1] pointer-events-none" />

      {/* SIDEBAR */}
      <aside className="w-64 bg-white/75 backdrop-blur-xl border-r border-gray-200/60 fixed h-full z-10 hidden md:flex flex-col">
        <div onClick={() => navigate("/")} className="p-6 flex items-center gap-3 border-b border-gray-100/60 cursor-pointer hover:bg-white/40 transition-colors">
          <MapPin fill="#eab308" className="text-white" size={24} />
          <span className="text-xl font-bold tracking-tight text-gray-900">TourMate</span>
        </div>
        <div className="flex-1 px-4 py-8 space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Host Portal</p>
          <SidebarItem icon={<HomeIcon size={18}/>} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
          <SidebarItem icon={<List size={18}/>} label="My Properties" active={activeTab === "My Properties"} onClick={() => setActiveTab("My Properties")} />
          <SidebarItem icon={<Calendar size={18}/>} label="Reservations" active={activeTab === "Reservations"} onClick={() => setActiveTab("Reservations")} />
          <SidebarItem icon={<MessageSquare size={18}/>} label="Messages" active={activeTab === "Messages"} onClick={() => setActiveTab("Messages")} />
          <SidebarItem icon={<Wallet size={18}/>} label="Earnings" active={activeTab === "Earnings"} onClick={() => setActiveTab("Earnings")} />
          <SidebarItem icon={<UserIcon size={18}/>} label="Profile" active={activeTab === "Profile"} onClick={() => setActiveTab("Profile")} />
        </div>
        <div className="p-4 border-t border-gray-100/60 mb-16 flex flex-col gap-1">
          <SidebarItem icon={<ArrowLeft size={18}/>} label="Back to Home" onClick={() => navigate("/")} />
          <SidebarItem icon={<LogOut size={18}/>} label="Sign Out" onClick={handleLogout} isDanger />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-6 md:p-10 relative max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white drop-shadow-sm">Welcome back, {user?.fullName?.split(" ")[0] || "Host"}</h1>
            <p className="text-gray-300 mt-1">Manage your properties and reservations.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowAddPropertyModal(true)} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-xl transition shadow">
              <Plus size={18} /> List New Property
            </button>
            <div onClick={() => setActiveTab("Profile")} className="hidden md:flex items-center gap-3 cursor-pointer hover:bg-white/10 py-1.5 px-3 rounded-xl transition">
              <span className="font-medium text-white drop-shadow-sm">{user?.fullName}</span>
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 border border-blue-200 flex items-center justify-center font-bold text-sm shadow-sm">
                {user?.fullName?.charAt(0) || "H"}
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD TAB */}
        {activeTab === "Dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Active Reservations" value={reservedStays.length} onClick={() => setActiveTab("Reservations")} />
              <StatCard title="Total Earnings" value={`₹ ${totalEarnings}`} onClick={() => setActiveTab("Earnings")} />
              <StatCard title="Overall Rating" value="4.8 / 5.0" onClick={() => setActiveTab("Profile")} />
            </div>
            <section className="bg-white/80 backdrop-blur-md p-6 rounded-xl border border-gray-200/60 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-5">Upcoming Check-ins</h3>
              {reservedStays.length === 0 ? (
                <p className="text-gray-500 py-4">No upcoming reservations.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reservedStays.map((t, idx) => (
                    <div key={idx} onClick={() => setActiveTab("Reservations")} className="p-4 border border-gray-100 rounded-lg hover:border-blue-400 transition-colors bg-white/60 cursor-pointer shadow-sm hover:shadow-md">
                      <h4 className="font-semibold text-gray-900">{t.homestayName}</h4>
                      <p className="text-sm text-gray-500 mt-1">Check-in: {t.startDate}</p>
                      <p className="text-sm text-gray-500 mt-1">Check-out: {t.endDate}</p>
                      <p className="text-xs text-blue-600 font-medium mt-2">Guest: {t.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* MY PROPERTIES TAB */}
        {activeTab === "My Properties" && (
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl border border-gray-200/60 shadow-sm min-h-[60vh]">
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">My Stays & Properties</h3>
            <p className="text-gray-500 mb-8">Track the operational and approval status of all your listed properties.</p>
            {myProperties.length === 0 ? (
              <div className="text-center py-12">
                <List className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500 font-medium text-lg">No properties listed yet.</p>
                <p className="text-sm text-gray-400 mt-1">Click "List New Property" to start welcoming guests!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myProperties.map((t) => (
                  <div key={t.id} className="p-5 border border-gray-200 rounded-xl bg-white/60 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900 text-lg">{t.homestayName}</h4>
                        <span className={`px-2 py-1 text-[10px] font-bold tracking-widest rounded uppercase ${
                          t.status === "APPROVED" ? "bg-green-100 text-green-700" :
                          t.status === "REJECTED" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>{t.status}</span>
                      </div>
                      <p className="text-sm text-gray-600">Host: {t.hostName}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      {t.status === "APPROVED" && (
                        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">Live on Platform</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RESERVATIONS TAB */}
        {activeTab === "Reservations" && (
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl border border-gray-200/60 shadow-sm min-h-[60vh]">
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">Reservation Requests</h3>
            <p className="text-gray-500 mb-8">Manage incoming guests and their booking status.</p>
            {reservedStays.length === 0 ? (
              <p className="text-gray-500 py-4">No reservations at the moment.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {reservedStays.map((t) => (
                  <div key={t.id} className="p-5 border border-gray-200 rounded-xl bg-white/60 flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg">{t.homestayName} - <span className="capitalize">{t.cities}</span></h4>
                      <p className="text-sm text-gray-500 mt-1">Booking: {t.startDate} to {t.endDate}</p>
                      <p className="text-sm text-gray-500 mt-1">Tourist: {t.touristName}</p>
                      <p className="text-sm mt-1">
                        Status: <span className={`font-medium ${t.status === "confirmed" ? "text-green-600" : t.status === "rejected" ? "text-red-500" : "text-blue-600"}`}>{t.status?.toUpperCase()}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {t.status === "pending" && (
                        <>
                          <button onClick={() => handleUpdateStatus(t.id, "confirmed")} className="px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition">Accept</button>
                          <button onClick={() => handleUpdateStatus(t.id, "rejected")} className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition">Reject</button>
                        </>
                      )}
                      <button onClick={() => openChat(t.touristEmail || t.email, t.cities)} className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition">Contact Guest</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === "Messages" && (
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl border border-gray-200/60 shadow-sm min-h-[60vh] flex flex-col">
            {activeChat ? (
              <>
                <div className="border-b border-gray-200 pb-4 mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Chat with {activeChat.clientEmail}</h3>
                  <button onClick={() => setActiveChat(null)} className="text-sm text-gray-500 hover:text-gray-800">Close Chat</button>
                </div>
                <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-[300px]">
                  {chatMessages.length === 0 && <div className="text-center text-gray-400 mt-10"><p>No messages yet.</p></div>}
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === "host" ? "justify-end" : "justify-start"}`}>
                      <div className={`px-4 py-2 rounded-lg max-w-sm ${msg.sender === "host" ? "bg-blue-500 text-white" : "bg-white border border-gray-200 text-gray-800"}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" className="flex-1 border border-gray-300 rounded-lg px-4 py-2" placeholder="Write a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} />
                  <button onClick={handleSendMessage} className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition">Send</button>
                </div>
              </>
            ) : (
              <div className="m-auto text-center">
                <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Active Chat</h3>
                <p className="text-gray-500">Select "Contact Guest" from your reservations to start messaging.</p>
              </div>
            )}
          </div>
        )}

        {/* EARNINGS TAB */}
        {activeTab === "Earnings" && (
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl border border-gray-200/60 shadow-sm min-h-[60vh]">
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">Detailed Earnings Report</h3>
            <p className="text-gray-500 mb-8">View your revenue breakdown across all finalized guest stays.</p>
            <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-xl flex justify-between items-center shadow-sm">
              <span className="text-green-800 font-semibold text-lg">Total Cleared Revenue</span>
              <span className="text-3xl font-bold text-green-700 drop-shadow-sm">₹{totalEarnings}</span>
            </div>
            {confirmedStays.length === 0 ? (
              <p className="text-gray-500 py-10 text-center font-medium">No confirmed earnings yet. Accept some reservations!</p>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left bg-white/60 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <thead className="bg-gray-100/80">
                    <tr>
                      <th className="p-4 font-semibold text-gray-700 border-b border-gray-200">Guest</th>
                      <th className="p-4 font-semibold text-gray-700 border-b border-gray-200">Property / City</th>
                      <th className="p-4 font-semibold text-gray-700 border-b border-gray-200">Dates</th>
                      <th className="p-4 font-semibold text-gray-700 border-b border-gray-200 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmedStays.map((t, idx) => (
                      <tr key={idx} className="border-b border-gray-200/60 hover:bg-white/50 transition">
                        <td className="p-4 font-medium text-gray-900">{t.touristName}</td>
                        <td className="p-4 text-gray-600">{t.homestayName} ({t.cities})</td>
                        <td className="p-4 text-gray-600">{t.startDate} - {t.endDate}</td>
                        <td className="p-4 text-green-600 font-bold text-right">₹{t.homestayPrice || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "Profile" && (
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl border border-gray-200/60 shadow-sm min-h-[60vh]">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8">Host Profile</h3>
            <div className="flex items-center gap-5 mb-10 border-b border-gray-100 pb-8">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 border border-blue-200 text-3xl font-bold">
                {user?.fullName?.charAt(0) || "H"}
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">{user?.fullName}</h4>
                <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-0.5 rounded-md border border-slate-200">Property Host</span>
              </div>
            </div>
            <div className="max-w-2xl">
              <h4 className="text-lg font-semibold text-gray-900 mb-6 w-full border-b border-gray-100 pb-2">Business Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                <div><label className="text-sm text-gray-500 block mb-1">Full Name</label><p className="text-base text-gray-900">{user?.fullName}</p></div>
                <div><label className="text-sm text-gray-500 block mb-1">Email Address</label><p className="text-base text-gray-900">{user?.email}</p></div>
                <div><label className="text-sm text-gray-500 block mb-1">Listed Properties</label><p className="text-base text-gray-900">{myProperties.length} Listings</p></div>
                <div><label className="text-sm text-gray-500 block mb-1">Active Reservations</label><p className="text-base text-gray-900">{reservedStays.length}</p></div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-20 text-center text-gray-400 font-semibold text-sm pt-8 border-t border-gray-600/50">
          © {new Date().getFullYear()} TourMate. Your perfectly planned adventure.
        </footer>
      </main>

      {/* ADD PROPERTY MODAL */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">List a New Homestay</h2>
              <button onClick={() => setShowAddPropertyModal(false)} className="text-gray-400 hover:text-gray-700 p-1"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddProperty} className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Name *</label>
                  <input type="text" value={newPropName} onChange={(e) => setNewPropName(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g., Sunrise Mountain Villa" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input type="text" value={newPropCity} onChange={(e) => setNewPropCity(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g., Pune" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night (₹) *</label>
                    <input type="number" value={newPropPrice} onChange={(e) => setNewPropPrice(e.target.value)} required min="500" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="1500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={newPropDesc} onChange={(e) => setNewPropDesc(e.target.value)} rows="3" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Describe the ambiance, location, and amenities..."></textarea>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddPropertyModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">Publish Property</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, onClick }) {
  return (
    <div onClick={onClick} className={`bg-white/80 backdrop-blur-md p-5 rounded-xl border border-gray-200/60 shadow-sm ${onClick ? "cursor-pointer hover:shadow-md hover:border-blue-400 transition-all" : ""}`}>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <h2 className="text-3xl font-semibold text-gray-900">{value}</h2>
    </div>
  );
}

function SidebarItem({ label, active, onClick, icon, isDanger }) {
  return (
    <div onClick={onClick} className={`px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${active ? "bg-white/80 text-gray-900 shadow-sm border border-gray-200/50" : isDanger ? "text-red-500 hover:bg-red-50 mt-4" : "text-gray-500 hover:bg-white/60 hover:text-gray-900"}`}>
      {icon}{label}
    </div>
  );
}

export default HomestayDashboard;
