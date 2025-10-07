import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../components/Sidebar"; // ✅ new import

interface Car {
  id: string;
  slug: string;
  brand: string;
  name: string;
  price_text: string;
  price_value: number;
  image: string;
}

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // ✅ new

  // ⚡️ Hardcoded userId for now (replace later with real logged-in user ID)
  const userId = "68dda1431797d061a138d22";

  useEffect(() => {
    fetch("/data/cars.json")
      .then((res) => res.json())
      .then((data) => setCars(data))
      .catch((err) => console.error("Error loading cars:", err));
  }, []);

  // 📌 Bookmark handler
  async function handleBookmark(carId: string) {
    try {
      const res = await fetch("/api/bookmarks/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, carId }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("⭐ Car bookmarked successfully!");
      } else {
        alert(data.message || "Failed to bookmark car");
      }
    } catch (err) {
      console.error("Bookmark error:", err);
      alert("Something went wrong while bookmarking");
    }
  }

  // 🔎 Apply Search + Price Filter
  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.name.toLowerCase().includes(search.toLowerCase()) ||
      car.brand.toLowerCase().includes(search.toLowerCase());

    let matchesPrice = true;
    switch (priceFilter) {
      case "below8":
        matchesPrice = car.price_value < 800000;
        break;
      case "8to10":
        matchesPrice =
          car.price_value >= 800000 && car.price_value <= 1000000;
        break;
      case "10to12":
        matchesPrice =
          car.price_value > 1000000 && car.price_value <= 1200000;
        break;
      case "12to15":
        matchesPrice =
          car.price_value > 1200000 && car.price_value <= 1500000;
        break;
      case "above15":
        matchesPrice = car.price_value > 1500000;
        break;
      default:
        matchesPrice = true;
    }

    return matchesSearch && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50 to-purple-50 relative">
      {/* ✅ Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Profile Button (top right) */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center hover:bg-indigo-700 transition"
        >
          👤
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-6 text-center shadow-md">
        <h1 className="text-4xl font-extrabold mb-3">Find Your Dream Car 🚗</h1>
        <p className="text-lg max-w-2xl mx-auto text-gray-100">
          Search, filter, and explore cars with detailed specs and images.
          Choose the one that matches your lifestyle and budget.
        </p>
      </div>

      {/* Search + Filter Panel */}
      <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-xl max-w-6xl mx-auto px-6 py-6 mt-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="🔍 Search by brand or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Prices</option>
            <option value="below8">Below 8 Lakh</option>
            <option value="8to10">8 - 10 Lakh</option>
            <option value="10to12">10 - 12 Lakh</option>
            <option value="12to15">12 - 15 Lakh</option>
            <option value="above15">Above 15 Lakh</option>
          </select>
        </div>
      </div>

      {/* Cars Grid */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Available Cars
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredCars.map((car) => (
            <div
              key={car.id}
              className="border rounded-xl p-5 bg-white shadow-md hover:shadow-lg transition duration-300"
            >
              <img
                src={car.image}
                alt={car.name}
                className="w-full h-40 object-contain mb-4"
              />
              <h2 className="text-xl font-bold text-gray-800">{car.name}</h2>
              <p className="text-gray-500">{car.brand}</p>
              <p className="text-blue-600 font-semibold mb-3">
                {car.price_text}
              </p>

              <div className="flex justify-between mt-3">
                <Link href={`/cars/${car.id}`}>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                    View Details
                  </button>
                </Link>

                {/* ⭐ Bookmark Button */}
                <button
                  onClick={() => handleBookmark(car.id)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                  ⭐ Bookmark
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCars.length === 0 && (
          <p className="text-center text-gray-500 mt-6">
            ❌ No cars match your search or filter.
          </p>
        )}
      </div>
    </div>
  );
}
