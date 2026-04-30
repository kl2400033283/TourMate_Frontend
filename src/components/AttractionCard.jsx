import { Link } from "react-router-dom";

function AttractionCard({ attraction, city, index = 0, toggleSelect, isSelected }) {
  const guidePrice = 500 + index * 50;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:scale-105 transition">
      <img src={attraction.image} alt={attraction.name} className="h-48 w-full object-cover" />
      <div className="p-4 text-center">
        <h3 className="font-bold text-lg">{attraction.name}</h3>
        <p className="text-gray-500 text-sm mt-1">{attraction.description}</p>
        <div className="mt-3 text-sm text-center">
          <p className="text-gray-600">⏱ Duration: {attraction.duration}</p>
          <p className="text-gray-600">🎟 Entry: {attraction.entry}</p>
          <p className="text-blue-600 font-semibold">🧑🏫 Guides from ₹{guidePrice} / day</p>
        </div>
        {toggleSelect && (
          <button
            onClick={() => toggleSelect(attraction)}
            className={`mt-3 px-4 py-1 rounded ${isSelected ? "bg-green-600 text-white" : "bg-yellow-500 text-white"}`}
          >
            {isSelected ? "Selected" : "Select"}
          </button>
        )}
        {city && (
          <Link to={`/city/${city}/attraction/${attraction.slug}`}>
            <button className="mt-3 px-4 py-1 rounded bg-slate-800 text-white text-sm">View</button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default AttractionCard;
