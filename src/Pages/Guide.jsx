import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { guidesByCity } from "../data/guides";

function Guide() {
  const navigate = useNavigate();
  const location = useLocation();
  const { city } = location.state || {};

  const hardcodedGuides = guidesByCity[city?.toLowerCase()] || [];
  const [guidesData, setGuidesData] = useState(hardcodedGuides);

  useEffect(() => {
    const fetchApprovedGuides = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/admin/approved-guides?city=${encodeURIComponent(city?.toLowerCase().trim() || "")}`);
        const data = await res.json();
        const liveGuides = (Array.isArray(data) ? data : []).map(u => ({
          name: u.name,
          image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=2080&auto=format&fit=crop",
          speciality: "Cultural & Heritage Expert",
          rating: 4.8,
          language: "English, Local Native",
          price: 1500,
          isLiveGuide: true,
          available: u.available !== false,
        }));
        // Merge hardcoded + live, avoid duplicates by name
        const existingNames = new Set(hardcodedGuides.map(g => g.name));
        const newLive = liveGuides.filter(g => !existingNames.has(g.name));
        setGuidesData([...hardcodedGuides, ...newLive]);
      } catch {
        setGuidesData(hardcodedGuides);
      }
    };
    fetchApprovedGuides();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [redirectToStay, setRedirectToStay] = useState(false);

  const filteredGuides = guidesData.filter((g) => {
    const matchSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.speciality.toLowerCase().includes(search.toLowerCase());
    const matchRating = ratingFilter === "all" || g.rating >= Number(ratingFilter);
    return matchSearch && matchRating;
  });

  const handleBook = async (guide) => {
    const cityKey = city.toLowerCase().trim();
    const user = JSON.parse(localStorage.getItem("user"));
    localStorage.setItem(`guideName_${cityKey}_${user?.email}`, guide.name);
    localStorage.setItem(`guideName_${cityKey}`, guide.name);
    localStorage.setItem(`guidePrice_${cityKey}`, guide.price);

    // Immediately update existing booking in DB with guide name
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const plan = JSON.parse(localStorage.getItem("currentPlan")) || {};

      const bookings = await fetch(
        `http://localhost:8080/api/bookings/user?email=${encodeURIComponent(user?.email)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).then(r => r.json()).catch(() => []);

      const match = Array.isArray(bookings) && bookings.find(
        b => b.cities === cityKey && b.startDate === plan.startDate && b.endDate === plan.endDate
      );

      if (match) {
        await fetch(`http://localhost:8080/api/bookings/${match.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...match, guideName: guide.name }),
        });
      } else {
        await fetch("http://localhost:8080/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            email: user?.email,
            touristName: user?.fullName,
            cities: cityKey,
            guideName: guide.name,
            homestayName: localStorage.getItem(`homestayName_${cityKey}`) || null,
            startDate: plan.startDate || null,
            endDate: plan.endDate || null,
            status: "pending",
          }),
        });
      }
    } catch {
      console.error("Guide booking update failed");
    }

    const existingStay = localStorage.getItem(`homestayName_${cityKey}`);
    if (existingStay) {
      setPopupMessage("Guide booked successfully! 🎉\n\nHomestay already booked 🏡");
      setRedirectToStay(false);
    } else {
      setPopupMessage("Guide booked successfully! 🎉\n\nDo you want to book a homestay too? 🏡");
      setRedirectToStay(true);
    }
    setShowPopup(true);
  };

  return (
    <div className="min-h-screen bg-[#f5efe4] px-6 py-8 pt-24">
      <h1 className="text-3xl font-bold text-center mb-6">Guides in {city} 👨🏫</h1>

      <div className="flex flex-wrap gap-3 justify-center mb-8">
        <input
          type="text"
          placeholder="Search guide or speciality..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg w-64"
        />
        <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="border px-4 py-2 rounded-lg">
          <option value="all">All Ratings</option>
          <option value="4">4+ ⭐</option>
          <option value="4.5">4.5+ ⭐</option>
        </select>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {filteredGuides.length === 0 ? (
          <p className="text-center col-span-3 text-gray-500">No guides available for this city 😔</p>
        ) : (
          filteredGuides.map((guide, index) => {
            const cityKey = city.toLowerCase().trim();
            const user = JSON.parse(localStorage.getItem("user"));
            const myBookedGuide = localStorage.getItem(`guideName_${cityKey}_${user?.email}`);
            const isMyBooking = myBookedGuide === guide.name;
            const isUnavailable = guide.available === false;
            return (
              <div key={index} className="bg-white rounded-xl shadow-md p-5 text-center hover:shadow-xl transition">
                <img src={guide.image} className="w-24 h-24 rounded-full mx-auto object-cover mb-3" />
                {isMyBooking && (
                  <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full inline-block mb-2">
                    ✔ You booked this guide
                  </div>
                )}
                {isUnavailable && !isMyBooking && (
                  <div className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full inline-block mb-2">
                    🔴 Currently Unavailable
                  </div>
                )}
                {!isUnavailable && !isMyBooking && (
                  <div className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded-full inline-block mb-2">
                    🟢 Available
                  </div>
                )}
                <h2 className="text-xl font-semibold">{guide.name}</h2>
                <p className="text-yellow-500">⭐ {guide.rating}</p>
                <p className="text-gray-500 text-sm mt-1">{guide.speciality}</p>
                <p className="text-gray-500 text-sm">{guide.language}</p>
                <p className="text-green-600 font-bold mt-2">₹{guide.price}/day</p>
                <div className="flex gap-2 mt-4 justify-center">
                  <button onClick={() => alert(`Contact ${guide.name} at 9876543210`)} className="bg-blue-500 text-white px-3 py-1 rounded">
                    Contact 📞
                  </button>
                </div>
                <button
                  disabled={isMyBooking || isUnavailable}
                  onClick={() => !isMyBooking && !isUnavailable && handleBook(guide)}
                  className={`mt-4 w-full py-2 rounded-lg text-white ${
                    isMyBooking ? "bg-gray-400 cursor-not-allowed" :
                    isUnavailable ? "bg-red-300 cursor-not-allowed" :
                    "bg-yellow-500 hover:bg-yellow-600"
                  }`}
                >
                  {isMyBooking ? "Already Booked" : isUnavailable ? "Unavailable" : "Book Guide"}
                </button>
              </div>
            );
          })
        )}
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[400px] p-6 text-center">
            <div className="text-3xl mb-2">✔️</div>
            <p className="text-gray-800 mb-6 whitespace-pre-line font-medium">{popupMessage}</p>
            {redirectToStay ? (
              <div className="flex justify-center gap-4">
                <button onClick={() => { setShowPopup(false); navigate("/homestay", { state: { city } }); }} className="bg-yellow-500 text-white px-5 py-2 rounded-lg hover:bg-yellow-600">Yes</button>
                <button onClick={() => { setShowPopup(false); navigate("/plan", { state: { city } }); }} className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300">No</button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button onClick={() => { setShowPopup(false); navigate("/plan", { state: { city } }); }} className="bg-blue-500 text-white px-6 py-2 rounded-lg">OK</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Guide;
