import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { citiesByState } from "../data/cities";
import { attractionsByCity } from "../data/attractions";
import { cityTaglines } from "../data/taglines";

function City() {
  const { slug } = useParams(); // This matches the URL /city/:slug
  const navigate = useNavigate();

  // Selection state for multiple attractions
  const [selectedPlaces, setSelectedPlaces] = useState([]);

  // 1. Find City Data dynamically from your states data
  const getCityData = () => {
    for (const state in citiesByState) {
      const city = citiesByState[state].find((c) => c.slug === slug);
      if (city) return city;
    }
    return null;
  };

  const city = getCityData();
  const attractionDetails = attractionsByCity[slug] || [];

  // 2. Selection Handlers
  const selectAll = () => setSelectedPlaces(attractionDetails);
  const clearAll = () => setSelectedPlaces([]);

  const toggleSelect = (place) => {
    const exists = selectedPlaces.find((p) => p.name === place.name);
    if (exists) {
      setSelectedPlaces(selectedPlaces.filter((p) => p.name !== place.name));
    } else {
      setSelectedPlaces([...selectedPlaces, place]);
    }
  };

  if (!city) {
    return <h1 className="text-center mt-20 text-2xl">City not found</h1>;
  }

  return (
    <div className="bg-white text-gray-800">
      
      {/* HERO SECTION - Dynamic based on City */}
      <div className="relative h-[60vh] min-h-[400px] text-white">
        <img
          src={city.image}
          alt={city.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
          <h1 className="text-6xl font-bold drop-shadow-lg">{city.name}</h1>
          <p className="text-xl text-white/90 mt-2">{city.stateName}</p>
          <p className="max-w-2xl text-white/80 mt-4 italic">
            "{cityTaglines[city.name] || city.knownFor}"
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="container mx-auto py-12 px-6">
        
        {/* HEADER & SELECTION CONTROLS */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Top Attractions</h2>
            <p className="text-gray-500">Pick the places you want to visit</p>
          </div>

          <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg shadow-sm">
            <span className="text-sm font-medium text-blue-600">
              {selectedPlaces.length} Selected
            </span>
            <button
              onClick={selectAll}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 text-sm rounded transition"
            >
              Select All
            </button>
            <button
              onClick={clearAll}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 text-sm rounded transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* ATTRACTIONS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {attractionDetails.length > 0 ? (
            attractionDetails.map((attraction, index) => {
              const isSelected = selectedPlaces.some((p) => p.name === attraction.name);

              return (
                <div
                  key={index}
                  className={`group bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 ${
                    isSelected ? "border-green-500 scale-[1.02]" : "border-transparent hover:shadow-xl"
                  }`}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={attraction.image}
                      alt={attraction.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {isSelected && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white p-1 rounded-full shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-xl text-gray-800">{attraction.name}</h3>
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{attraction.description}</p>

                    <div className="mt-4 space-y-2 border-t pt-4 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>⏱ Duration:</span>
                        <span className="font-medium">{attraction.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🎟 Entry:</span>
                        <span className="font-medium">{attraction.entry}</span>
                      </div>
                      <p className="text-blue-600 font-bold mt-2">
                        🧑‍🏫 Guides from ₹{500 + index * 50} / day
                      </p>
                    </div>

                    <button
                      onClick={() => toggleSelect(attraction)}
                      className={`w-full mt-5 py-2 rounded-xl font-semibold transition-colors ${
                        isSelected
                          ? "bg-green-600 text-white"
                          : "bg-yellow-500 hover:bg-yellow-600 text-white"
                      }`}
                    >
                      {isSelected ? "Remove from Plan" : "Add to Plan"}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center text-gray-400">
              No attractions found for this city.
            </div>
          )}
        </div>

        {/* FLOATING PROCEED BUTTON */}
        {selectedPlaces.length > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
            <button
              onClick={() => navigate("/plan", { state: { selectedPlaces, city: slug } })}
              className="bg-blue-600 text-white px-10 py-4 rounded-full shadow-2xl hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-3 font-bold"
            >
              Proceed to Plan ({selectedPlaces.length})
              <span className="text-xl">→</span>
            </button>
          </div>
        )}
      </main>

      <footer className="bg-gray-50 border-t text-center py-8 text-gray-500 text-sm mt-10">
        © 2026 TourMate. All Rights Reserved.
      </footer>
    </div>
  );
}

export default City;