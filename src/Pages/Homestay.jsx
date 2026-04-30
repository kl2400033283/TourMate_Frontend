import { useLocation, useNavigate } from "react-router-dom";
import { homestaysByCity } from "../data/Homestays";
import { useState, useEffect } from "react";

function Homestay() {
  const location = useLocation();
  const navigate = useNavigate();
  const { city } = location.state || {};

  const safeCity = city ? city.toLowerCase().trim() : "";
  const [customHomestays, setCustomHomestays] = useState([]);

  useEffect(() => {
    const fetchApprovedHomestays = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/admin/approved-homestays");
        const data = await res.json();
        const approved = (Array.isArray(data) ? data : []).filter(h => {
          const hCity = (h.city || "").toLowerCase().trim();
          return hCity === safeCity || hCity.includes(safeCity) || safeCity.includes(hCity);
        }).map(h => ({
          name: h.homestayName,
          price: 1500,
          rating: 4.5,
          image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
          isLive: true,
        }));
        setCustomHomestays(approved);
      } catch {
        setCustomHomestays([]);
      }
    };
    fetchApprovedHomestays();
  }, [safeCity]);

  const homestays = [...(homestaysByCity[safeCity] || []), ...customHomestays];

  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [showPopup, setShowPopup] = useState(false);
  const [redirectToGuide, setRedirectToGuide] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const filtered = homestays.filter((stay) => {
    if (!stay) return false;
    const matchesSearch = (stay.name || "").toLowerCase().includes((search || "").toLowerCase());
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "low" && stay.price < 1000) ||
      (priceFilter === "mid" && stay.price >= 1000 && stay.price <= 2000) ||
      (priceFilter === "high" && stay.price > 2000);
    const matchesRating =
      ratingFilter === "all" ||
      (ratingFilter === "4" && stay.rating >= 4) ||
      (ratingFilter === "3" && stay.rating >= 3);
    return matchesSearch && matchesPrice && matchesRating;
  });

  const handleBook = async (stay) => {
    const cityKey = city.toLowerCase().trim();
    localStorage.setItem(`homestayName_${cityKey}`, stay.name);
    localStorage.setItem(`homestayPrice_${cityKey}`, stay.price);

    // Immediately update existing booking in DB with homestay name
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const plan = JSON.parse(localStorage.getItem("currentPlan")) || {};

      // Find existing booking for this tourist+city+dates and update it
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
          body: JSON.stringify({ ...match, homestayName: stay.name }),
        });
      } else {
        // No existing booking yet — save new one
        await fetch("http://localhost:8080/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            email: user?.email,
            touristName: user?.fullName,
            cities: cityKey,
            homestayName: stay.name,
            guideName: localStorage.getItem(`guideName_${cityKey}`) || null,
            startDate: plan.startDate || null,
            endDate: plan.endDate || null,
            status: "pending",
          }),
        });
      }
    } catch {
      console.error("Homestay booking update failed");
    }

    const existingGuide = localStorage.getItem(`guideName_${cityKey}`);
    if (existingGuide) {
      setPopupMessage("Homestay booked successfully! 🎉\n\nGuide already booked 👨🏫");
      setRedirectToGuide(false);
    } else {
      setPopupMessage("Homestay booked successfully! 🎉\n\nDo you want to hire a guide too? 👨🏫");
      setRedirectToGuide(true);
    }
    setShowPopup(true);
  };

  return (
    <div className="min-h-screen bg-[#f5efe4] pt-24">
      <div className="px-8 mt-6">
        <h2 className="text-4xl font-bold">Homestays in {city}</h2>
        <p className="text-gray-600 mt-2">Find comfortable and verified stays near top attractions</p>
      </div>

      <div className="bg-white mx-8 mt-6 p-4 rounded-xl shadow flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="🔍 Search homestays..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border px-4 py-2 rounded-lg"
        />
        <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} className="border px-4 py-2 rounded-lg">
          <option value="all">All Prices</option>
          <option value="low">Below ₹1000</option>
          <option value="mid">₹1000 - ₹2000</option>
          <option value="high">Above ₹2000</option>
        </select>
        <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="border px-4 py-2 rounded-lg">
          <option value="all">All Ratings</option>
          <option value="4">4+ ⭐</option>
          <option value="3">3+ ⭐</option>
        </select>
      </div>

      <div className="grid md:grid-cols-3 gap-6 px-8 mt-8 pb-10">
        {filtered.length === 0 ? (
          <p className="text-center col-span-3 text-gray-500">No homestays found 😔</p>
        ) : (
          filtered.map((stay, index) => {
            const cityKey = city.toLowerCase().trim();
            const isBooked = localStorage.getItem(`homestayName_${cityKey}`) === stay.name;
            return (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
                <img src={stay.image} className="h-52 w-full object-cover" />
                <div className="p-4">
                  {isBooked && (
                    <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full inline-block mb-2">
                      ✔ Already Booked
                    </div>
                  )}
                  <h3 className="text-lg font-semibold">{stay.name}</h3>
                  <p className="text-sm text-gray-500">📍 Near city center</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-yellow-500 text-sm">⭐ {stay.rating}</p>
                    <p className="text-green-600 font-bold">₹{stay.price}<span className="text-sm text-gray-500">/night</span></p>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Comfortable stay with great amenities and easy access to attractions.</p>
                  <button
                    disabled={isBooked}
                    onClick={() => !isBooked && handleBook(stay)}
                    className={`mt-4 w-full py-2 rounded-lg text-white ${isBooked ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600"}`}
                  >
                    {isBooked ? "Already Booked" : "Book Now"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center w-[90%] max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-3 text-green-600">✅ {popupMessage}</h2>
            {redirectToGuide ? (
              <div className="flex justify-center gap-4">
                <button onClick={() => { setShowPopup(false); navigate("/guide", { state: { city } }); }} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">Yes</button>
                <button onClick={() => { setShowPopup(false); navigate("/plan", { state: { city } }); }} className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400">No</button>
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

export default Homestay;
