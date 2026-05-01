import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { 
  MapPin, Shield, Users, BarChart3, LogOut, ArrowLeft, Globe, Home as HomeIcon, CheckCircle, Map, Plus, Settings, RefreshCw, Search, Filter, ChevronLeft, ChevronRight
} from "lucide-react";
import { citiesByState } from "../data/cities";
import { attractionsByCity } from "../data/attractions";
import { guidesByCity } from "../data/guides";

function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [allPlans, setAllPlans] = useState([]);
  const [propertyRequests, setPropertyRequests] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");

  const [newCity, setNewCity] = useState({ name: "", stateName: "", image: "", knownFor: "" });
  const [newAttraction, setNewAttraction] = useState({ citySlug: "", name: "", description: "", image: "", entry: "Free", duration: "" });

  const handleAddCity = (e) => {
    e.preventDefault();
    if (!newCity.name || !newCity.stateName) return;
    
    // generate stateSlug
    const stateSlug = newCity.stateName.toLowerCase().replace(/\s+/g, '');
    const citySlug = newCity.name.toLowerCase().replace(/\s+/g, '-');
    
    const cityData = { ...newCity, slug: citySlug, attractions: 0, homestays: 0 };
    
    const local = JSON.parse(localStorage.getItem("admin_cities") || "{}");
    if (!local[stateSlug]) local[stateSlug] = [];
    local[stateSlug].push(cityData);
    localStorage.setItem("admin_cities", JSON.stringify(local));
    
    alert("City added successfully! Reloading to apply changes.");
    window.location.reload();
  };

  const handleAddAttraction = (e) => {
    e.preventDefault();
    if (!newAttraction.citySlug || !newAttraction.name) return;
    
    const attractionData = { 
      name: newAttraction.name, 
      description: newAttraction.description, 
      image: newAttraction.image, 
      entry: newAttraction.entry, 
      duration: newAttraction.duration 
    };
    
    const local = JSON.parse(localStorage.getItem("admin_attractions") || "{}");
    if (!local[newAttraction.citySlug]) local[newAttraction.citySlug] = [];
    local[newAttraction.citySlug].push(attractionData);
    localStorage.setItem("admin_attractions", JSON.stringify(local));
    
    alert("Attraction added successfully! Reloading to apply changes.");
    window.location.reload();
  };

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }

      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser || storedUser.role?.toLowerCase() !== "admin") {
        alert("Access Denied: This dashboard is for admins only.");
        navigate("/login");
        return;
      }

      setUser(storedUser);

      const usersRes = await axios.get("https://tourmate-backend-1.onrender.com/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = usersRes.data?.data ?? usersRes.data;
      setAllUsers(Array.isArray(usersData) ? usersData : []);

      const plansRes = await axios.get("https://tourmate-backend-1.onrender.com/api/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const plansData = plansRes.data?.data ?? plansRes.data;
      setAllPlans(Array.isArray(plansData) ? plansData : []);

      const propertyRes = await axios.get("https://tourmate-backend-1.onrender.com/api/admin/properties", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const propData = propertyRes.data?.data ?? propertyRes.data;
      setPropertyRequests(Array.isArray(propData) ? propData : []);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSyncDemoGuides = async () => {
    if (!window.confirm("This will auto-register all hardcoded guides into your backend database. Are you sure?")) return;
    setIsSyncing(true);
    let successCount = 0;
    try {
      const allStaticGuides = Object.values(guidesByCity).flat();
      for (const guide of allStaticGuides) {
        try {
          const formattedEmail = guide.name.toLowerCase().replace(/\s+/g, '') + "@guide.com";
          await axios.post(
            "https://tourmate-backend-1.onrender.com/api/auth/signup",
            {
              name: guide.name,
              email: formattedEmail,
              password: "guide123",
              role: "guide",
            },
            { headers: { "Content-Type": "application/json" } }
          );
          successCount++;
        } catch (err) {
          console.error("Already exists or failed:", err);
        }
      }
      alert(`✅ Synchronization complete! ${successCount} dummy guides were created. Now please click 'Approve Demo Accounts' (or manually approve them) to make them live!`);
      await fetchAdminData();
    } catch (err) {
      alert("Failed to run synchronization.");
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleApproveDemoAccounts = async () => {
    setIsSyncing(true);
    try {
      const token = localStorage.getItem("token");
      const demoUsers = allUsers.filter(u => u.email && u.email.endsWith("@guide.com") && !u.approved);
      let count = 0;
      for (const u of demoUsers) {
        await axios.put(
          `https://tourmate-backend-1.onrender.com/api/admin/user/${u.id}`,
          { status: "approved" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        count++;
      }
      alert(`✅ Automatically approved ${count} demo accounts!`);
      await fetchAdminData();
    } catch (err) {
      alert("Something went wrong while approving accounts.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateUserStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://tourmate-backend-1.onrender.com/api/admin/user/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllUsers(prev => prev.map(u => u.id === id ? { ...u, approved: status === "approved" } : u));
    } catch {
      alert("Failed to update user");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://tourmate-backend-1.onrender.com/api/admin/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      alert("Failed to delete user");
    }
  };

  const handleUpdatePropertyStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://tourmate-backend-1.onrender.com/api/admin/property/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPropertyRequests(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch {
      alert("Failed to update property");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen font-sans mt-16 text-gray-800 relative z-0">
      <div className="fixed inset-0 bg-slate-900 z-[-3]" />
      <div 
        className="fixed inset-0 z-[-2] pointer-events-none"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')", 
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
      <div className="fixed inset-0 bg-black/60 z-[-1] pointer-events-none" />

      {/* SIDEBAR */}
      <aside className="w-64 bg-white/75 backdrop-blur-xl border-r border-gray-200/60 fixed h-full z-10 hidden md:flex flex-col">
        <div onClick={() => navigate("/")} className="p-6 flex items-center gap-3 border-b border-gray-100/60 cursor-pointer hover:bg-white/40 transition-colors">
          <MapPin fill="#eab308" className="text-white" size={24} />
          <span className="text-xl font-bold tracking-tight text-gray-900">TourMate</span>
        </div>
        
        <div className="flex-1 px-4 py-8 space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Admin Panel</p>
          <SidebarItem icon={<BarChart3 size={18}/>} label="Overview" active={activeTab === "Overview"} onClick={() => setActiveTab("Overview")} />
          <SidebarItem icon={<Users size={18}/>} label="Manage Users" active={activeTab === "Manage Users"} onClick={() => setActiveTab("Manage Users")} />
          <SidebarItem icon={<Globe size={18}/>} label="All Bookings" active={activeTab === "All Bookings"} onClick={() => setActiveTab("All Bookings")} />
          <SidebarItem icon={<HomeIcon size={18}/>} label="Property Requests" active={activeTab === "Property Requests"} onClick={() => setActiveTab("Property Requests")} />
          <SidebarItem icon={<CheckCircle size={18}/>} label="Active Properties" active={activeTab === "Active Properties"} onClick={() => setActiveTab("Active Properties")} />
          <SidebarItem icon={<Map size={18}/>} label="Destinations" active={activeTab === "Destinations"} onClick={() => setActiveTab("Destinations")} />
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
            <h1 className="text-3xl font-semibold text-white drop-shadow-sm flex items-center gap-3">
              <Shield className="text-yellow-400" size={28} />
              TourMate Administration
            </h1>
            <p className="text-gray-300 mt-1">Hello {user?.fullName?.split(" ")[0]}, monitor platform health and usage.</p>
          </div>
          <div onClick={() => setActiveTab("Settings")} className="hidden md:flex items-center gap-3 cursor-pointer hover:bg-white/10 py-1.5 px-3 rounded-xl transition">
            <span className="font-medium text-white drop-shadow-sm">{user?.fullName}</span>
            <div className="w-10 h-10 rounded-full bg-slate-800 text-white border border-slate-600 flex items-center justify-center font-bold text-sm shadow-sm">
              {user?.fullName?.charAt(0) || "A"}
            </div>
          </div>
        </header>

        {/* OVERVIEW TAB */}
        {activeTab === "Overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Total Users" value={allUsers.length} onClick={() => setActiveTab("Manage Users")} />
              <StatCard title="Active Plans" value={allPlans.length} onClick={() => setActiveTab("All Bookings")} />
              <StatCard title="Live Guides" value={allUsers.filter(u => u.role === 'guide').length} onClick={() => setActiveTab("Manage Users")} />
              <StatCard title="Properties" value={propertyRequests.length} onClick={() => setActiveTab("Property Requests")} />
            </div>

            <section className="bg-white/80 backdrop-blur-md p-6 rounded-xl border border-gray-200/60 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-5">Recent Bookings</h3>
              {allPlans.length === 0 ? (
                <p className="text-gray-500 py-4">No recent activity.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allPlans.slice(-4).map((t, idx) => (
                    <div key={idx} className="p-4 border border-gray-100 rounded-lg bg-white/60 flex flex-col hover:border-blue-300 transition">
                      <h4 className="font-semibold text-gray-900">{t.cities} Trip</h4>
                      <p className="text-sm text-gray-500 mt-1">Tourist: {t.touristName}</p>
                      {t.homestayName && <p className="text-sm text-gray-500">🏡 {t.homestayName}</p>}
                      {t.guideName && <p className="text-sm text-gray-500">👨🏫 {t.guideName}</p>}
                      <span className={`mt-2 self-start px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        t.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        t.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{t.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* MANAGE USERS TAB */}
        {activeTab === "Manage Users" && (() => {
          const filteredUsers = allUsers.filter(u => {
            const matchesSearch = (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === "all" || (u.role || "tourist").toLowerCase() === roleFilter;
            return matchesSearch && matchesRole;
          });
          const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
          const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

          return (
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl border border-gray-200/60 shadow-sm min-h-[60vh]">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-1">User Directory</h3>
                <p className="text-gray-500">View and manage the {allUsers.length} registered users on the TourMate platform.</p>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <div className="flex items-center gap-3 md:justify-end">
                  <button
                    onClick={handleApproveDemoAccounts}
                    disabled={isSyncing}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition disabled:opacity-50"
                  >
                    <CheckCircle size={16} /> Approve Demo Accounts
                  </button>
                  <button
                    onClick={handleSyncDemoGuides}
                    disabled={isSyncing}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                    {isSyncing ? "Syncing..." : "Sync Demo Guides"}
                  </button>
                </div>
                <div className="flex items-center gap-3 md:justify-end">
                  <div className="relative flex-1 md:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition" />
                </div>
                <div className="relative">
                  <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select value={roleFilter} onChange={(e) => {setRoleFilter(e.target.value); setCurrentPage(1);}} className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition cursor-pointer">
                    <option value="all">All Roles</option>
                    <option value="tourist">Tourists</option>
                    <option value="guide">Guides</option>
                    <option value="host">Hosts</option>
                  </select>
                </div>
              </div>
            </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-gray-50/50 rounded-xl border border-gray-100">
                <Users className="text-gray-300 mb-3" size={40} />
                <p className="text-gray-500 font-medium text-lg">No users match your filters.</p>
                <button onClick={() => {setSearchQuery(""); setRoleFilter("all");}} className="mt-3 text-sm text-blue-600 font-medium hover:underline">Clear Filters</button>
              </div>
            ) : (
              <div className="w-full flex flex-col">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                    <thead className="bg-gray-50/80 border-b border-gray-100">
                      <tr>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold shadow-sm">
                                {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                              </div>
                              <span className="font-semibold text-gray-900 truncate max-w-[150px]">{u.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-600 font-medium truncate max-w-[200px]">{u.email}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                              u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' :
                              u.role === 'guide' ? 'bg-amber-100 text-amber-700' :
                              u.role === 'host' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {u.role || 'tourist'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${u.approved ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                              <span className={`text-xs font-bold uppercase tracking-wide ${u.approved ? 'text-emerald-700' : 'text-amber-600'}`}>
                                {u.approved ? 'Approved' : 'Pending'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            {u.role !== 'admin' && (
                              <div className="flex gap-2 justify-end">
                                {!u.approved ? (
                                  <button onClick={() => handleUpdateUserStatus(u.id, 'approved')} className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition shadow-sm">Approve</button>
                                ) : (
                                  <button onClick={() => handleUpdateUserStatus(u.id, 'rejected')} className="px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 text-xs font-semibold rounded-lg hover:bg-amber-100 transition shadow-sm">Revoke</button>
                                )}
                                <button onClick={() => handleDeleteUser(u.id)} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-lg hover:bg-red-100 transition shadow-sm">Remove</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing <span className="font-medium text-gray-900">{(currentPage - 1) * usersPerPage + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * usersPerPage, filteredUsers.length)}</span> of <span className="font-medium text-gray-900">{filteredUsers.length}</span> users
                  </p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm font-medium text-gray-700 px-2">Page {currentPage} of {totalPages}</span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          );
        })()}

        {/* ALL BOOKINGS TAB */}
        {activeTab === "All Bookings" && (
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl border border-gray-200/60 shadow-sm min-h-[60vh]">
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">Global Bookings</h3>
            <p className="text-gray-500 mb-8">All active trip plans logged in the system.</p>
            {allPlans.length === 0 ? (
              <p className="text-gray-500 py-4">No plans have been created.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {allPlans.map((t, idx) => (
                  <div key={idx} className="p-5 border border-gray-200 rounded-xl bg-white/60 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{t.cities} Trip</h4>
                      <p className="text-sm text-gray-500 mt-1">Tourist: {t.touristName}</p>
                      <p className="text-sm text-slate-500 mt-1">Dates: {t.startDate} → {t.endDate}</p>
                      {t.homestayName && <p className="text-sm text-gray-500">🏡 Homestay: {t.homestayName}</p>}
                      {t.guideName && <p className="text-sm text-gray-500">👨🏫 Guide: {t.guideName}</p>}
                      <span className={`mt-2 inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                        t.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        t.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{t.status}</span>
                    </div>
                    <button onClick={() => setSelectedBooking(t)} className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition">View Details</button>
                  </div>
                ))}
              </div>
            )}

            {/* BOOKING DETAILS MODAL */}
            {selectedBooking && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl p-6 mt-16 max-h-[85vh] overflow-y-auto">
                  <h3 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-4">Booking Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Booking User</p>
                      <p className="text-lg text-blue-700 font-semibold">{selectedBooking.touristName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Tourist Name</p>
                      <p className="text-base text-gray-800">{selectedBooking.touristName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Homestay</p>
                        <p className="text-sm font-semibold text-gray-800">{selectedBooking.homestayName || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Guide</p>
                        <p className="text-sm font-semibold text-gray-800">{selectedBooking.guideName || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-green-50 px-4 py-3 rounded-lg border border-green-200">
                      <span className="font-bold text-green-900 uppercase tracking-widest text-sm">Status</span>
                      <span className="text-lg font-bold text-green-700">{selectedBooking.status}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedBooking(null)} className="w-full mt-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black font-semibold transition">Close</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROPERTY REQUESTS TAB */}
        {activeTab === "Property Requests" && (() => {
          const pendingRequests = propertyRequests.filter(p => p && p.status !== "APPROVED");
          return (
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl border border-gray-200/60 shadow-sm min-h-[60vh]">
              <h3 className="text-2xl font-semibold text-gray-900 mb-1">Host Property Submissions</h3>
              <p className="text-gray-500 mb-8">Review and moderate user-submitted homestays before they go live.</p>
              {pendingRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 bg-gray-50/50 rounded-xl border border-gray-100">
                  <HomeIcon className="text-gray-300 mb-3" size={40} />
                  <p className="text-gray-500 font-medium text-lg">No pending property requests.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {pendingRequests.map((p) => (
                    <div key={p.id} className="p-6 border border-gray-200 rounded-xl bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-gray-900 text-xl">{p.homestayName}</h4>
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-yellow-200 uppercase">Pending Review</span>
                        </div>
                        <p className="text-sm font-medium text-blue-600 mb-2">Host: {p.hostName}</p>
                        <p className="text-sm text-gray-600">Status: {p.status}</p>
                      </div>
                      <div className="flex gap-3 min-w-[220px]">
                        <button onClick={() => handleUpdatePropertyStatus(p.id, 'APPROVED')} className="flex-1 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition">Approve</button>
                        <button onClick={() => handleUpdatePropertyStatus(p.id, 'REJECTED')} className="flex-1 px-4 py-2.5 bg-red-50 text-red-700 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-100 transition">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* ACTIVE PROPERTIES TAB */}
        {activeTab === "Active Properties" && (() => {
          const liveProperties = propertyRequests.filter(p => p && p.status === "APPROVED");
          return (
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl border border-gray-200/60 shadow-sm min-h-[60vh]">
              <h3 className="text-2xl font-semibold text-gray-900 mb-1">Live Managed Properties</h3>
              <p className="text-gray-500 mb-8">View active approved homestays on the platform.</p>
              {liveProperties.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 bg-gray-50/50 rounded-xl border border-gray-100">
                  <CheckCircle className="text-gray-300 mb-3" size={40} />
                  <p className="text-gray-500 font-medium text-lg">No active custom listings.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {liveProperties.map((p) => (
                    <div key={p.id} className="p-6 border border-gray-200 rounded-xl bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-gray-900 text-xl">{p.homestayName}</h4>
                          <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded border border-green-200 uppercase">Live</span>
                        </div>
                        <p className="text-sm font-medium text-blue-600 mb-2">Host: {p.hostName}</p>
                        <p className="text-sm text-gray-600">Tourist: {p.touristName || "N/A"}</p>
                      </div>
                      <button onClick={() => handleUpdatePropertyStatus(p.id, 'REJECTED')} className="px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition">Terminate</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* DESTINATIONS TAB */}
        {activeTab === "Destinations" && (
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl border border-gray-200/60 shadow-sm min-h-[60vh]">
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">Manage Destinations</h3>
            <p className="text-gray-500 mb-8">Add new cities and local attractions to expand the platform footprint.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><MapPin size={20} className="text-blue-500"/> Add New City</h4>
                <form onSubmit={handleAddCity} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">City Name</label>
                    <input type="text" className="w-full mt-1 p-2 border border-gray-200 rounded-lg" required value={newCity.name} onChange={e => setNewCity({...newCity, name: e.target.value})} placeholder="e.g. Surat" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">State Name</label>
                    <input type="text" className="w-full mt-1 p-2 border border-gray-200 rounded-lg" required value={newCity.stateName} onChange={e => setNewCity({...newCity, stateName: e.target.value})} placeholder="e.g. Gujarat" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Image URL</label>
                    <input type="url" className="w-full mt-1 p-2 border border-gray-200 rounded-lg" value={newCity.image} onChange={e => setNewCity({...newCity, image: e.target.value})} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Known For</label>
                    <input type="text" className="w-full mt-1 p-2 border border-gray-200 rounded-lg" value={newCity.knownFor} onChange={e => setNewCity({...newCity, knownFor: e.target.value})} placeholder="e.g. Diamond City" />
                  </div>
                  <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                    <Plus size={18}/> Save City
                  </button>
                </form>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Map size={20} className="text-emerald-500"/> Add New Attraction</h4>
                <form onSubmit={handleAddAttraction} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Select City</label>
                    <select className="w-full mt-1 p-2 border border-gray-200 rounded-lg" required value={newAttraction.citySlug} onChange={e => setNewAttraction({...newAttraction, citySlug: e.target.value})}>
                      <option value="">-- Choose a city --</option>
                      {Object.values(citiesByState).flat().map(city => (
                        <option key={city.slug} value={city.slug}>{city.name} ({city.stateName})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Attraction Name</label>
                    <input type="text" className="w-full mt-1 p-2 border border-gray-200 rounded-lg" required value={newAttraction.name} onChange={e => setNewAttraction({...newAttraction, name: e.target.value})} placeholder="e.g. Dumas Beach" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Description</label>
                    <input type="text" className="w-full mt-1 p-2 border border-gray-200 rounded-lg" required value={newAttraction.description} onChange={e => setNewAttraction({...newAttraction, description: e.target.value})} placeholder="Short description..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Entry</label>
                      <select className="w-full mt-1 p-2 border border-gray-200 rounded-lg" value={newAttraction.entry} onChange={e => setNewAttraction({...newAttraction, entry: e.target.value})}>
                        <option value="Free">Free</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Duration</label>
                      <input type="text" className="w-full mt-1 p-2 border border-gray-200 rounded-lg" value={newAttraction.duration} onChange={e => setNewAttraction({...newAttraction, duration: e.target.value})} placeholder="e.g. 1-2 hrs" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Image URL</label>
                    <input type="url" className="w-full mt-1 p-2 border border-gray-200 rounded-lg" value={newAttraction.image} onChange={e => setNewAttraction({...newAttraction, image: e.target.value})} placeholder="https://..." />
                  </div>
                  <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                    <Plus size={18}/> Save Attraction
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Present Cities</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.values(citiesByState).flat().map((city, idx) => {
                  const cityAttractions = attractionsByCity[city.slug] || [];
                  return (
                    <div key={idx} className="p-3 border border-gray-100 rounded-lg bg-gray-50 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{city.name}</p>
                        <p className="text-xs text-gray-500 font-medium">{cityAttractions.length} Attractions</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}{/* SETTINGS TAB */}
        {activeTab === "Settings" && (
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl border border-gray-200/60 shadow-sm min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <Settings className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">System Configuration</h3>
              <p className="text-gray-500">Platform-wide settings and API keys can be managed here.</p>
            </div>
          </div>
        )}

        <footer className="mt-20 text-center text-gray-400 font-semibold text-sm pt-8 border-t border-gray-600/50">
          © {new Date().getFullYear()} TourMate Administration.
        </footer>
      </main>
    </div>
  );
}

function StatCard({ title, value, onClick }) {
  return (
    <div onClick={onClick} className={`bg-white/80 backdrop-blur-md p-5 rounded-xl border border-gray-200/60 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md hover:border-blue-400 transition-all' : ''}`}>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <h2 className="text-3xl font-semibold text-gray-900">{value}</h2>
    </div>
  );
}

function SidebarItem({ label, active, onClick, icon, isDanger }) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium
        ${active ? "bg-white/80 text-gray-900 shadow-sm border border-gray-200/50" 
          : isDanger ? "text-red-500 hover:bg-red-50 mt-4"
          : "text-gray-500 hover:bg-white/60 hover:text-gray-900"
        }`}
    >
      {icon}
      {label}
    </div>
  );
}

export default AdminDashboard;