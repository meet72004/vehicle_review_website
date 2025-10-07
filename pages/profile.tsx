// pages/profile.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Car {
  id: string;
  slug?: string;
  brand?: string;
  name: string;
  price_text?: string;
  price_value?: number;
  image?: string;
}

export default function ProfilePage() {
  const [bookmarkedCars, setBookmarkedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null); // holds carId being removed

  // ⚠️ Replace this with the actual logged-in userId (Mongo _id string) or
  // later read it from localStorage/session once you wire it in.
  const userId = "68dda1431797d061a138d226";

  // Fetch bookmarked cars from backend endpoint
  async function fetchBookmarks() {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookmarks/${userId}`);
      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to fetch bookmarks:", data);
        setBookmarkedCars([]);
      } else {
        // Our API returns { bookmarks: [...ids], cars: [...carObjects] }
        // Use the `cars` array (full objects). If not present, fall back to empty.
        const carsFromApi: Car[] = Array.isArray(data.cars) ? data.cars : [];
        setBookmarkedCars(carsFromApi);
      }
    } catch (err) {
      console.error("Error loading bookmarks:", err);
      setBookmarkedCars([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!userId || userId.includes("replace_with")) {
      // If userId not set, avoid calling API and show empty state
      setBookmarkedCars([]);
      setLoading(false);
      return;
    }
    fetchBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Remove bookmark and update UI optimistically
  async function handleRemoveBookmark(carId: string) {
    if (!userId || userId.includes("replace_with")) {
      alert("Please set a valid userId for testing or log in first.");
      return;
    }

    if (!confirm("Remove this car from your bookmarks?")) return;

    setBusy(carId);
    try {
      const res = await fetch("/api/bookmarks/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, carId }),
      });

      const json = await res.json();
      if (res.ok) {
        // Remove from UI immediately
        setBookmarkedCars((prev) => prev.filter((c) => String(c.id) !== String(carId)));
      } else {
        console.error("Remove failed:", json);
        alert(json?.error || "Failed to remove bookmark");
      }
    } catch (err) {
      console.error("Remove bookmark error:", err);
      alert("Network error while removing bookmark");
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return <p className="text-center mt-10">Loading your bookmarks...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-purple-50 to-pink-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-indigo-700">⭐ Your Bookmarked Cars</h1>
            <p className="text-gray-600 mt-1">All the cars you saved for later.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="px-4 py-2 bg-white text-indigo-700 rounded-lg shadow hover:bg-gray-50">
                ← Back to Home
              </button>
            </Link>
            <button
              onClick={fetchBookmarks}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {bookmarkedCars.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow p-8">
            <p className="text-gray-600 text-lg">You haven’t bookmarked any cars yet.</p>
            <p className="text-gray-400 mt-3">Browse the homepage and click “Bookmark” to save cars here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {bookmarkedCars.map((car) => {
              const img = car.image && car.image !== "" ? car.image : "/placeholder-car.png";
              return (
                <div
                  key={car.id}
                  className="border rounded-xl p-5 bg-white shadow-md hover:shadow-lg transition duration-300"
                >
                  <div className="w-full h-40 mb-4 flex items-center justify-center overflow-hidden rounded">
                    {/* graceful fallback for missing images */}
                    <img
                      src={img}
                      alt={car.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "data:image/svg+xml;utf8," +
                          encodeURIComponent(
                            `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23888' font-size='18'>Image not available</text></svg>`
                          );
                      }}
                    />
                  </div>

                  <h2 className="text-xl font-bold text-gray-800">{car.name}</h2>
                  <p className="text-gray-500">{car.brand}</p>
                  <p className="text-blue-600 font-semibold mb-3">{car.price_text ?? "Price not listed"}</p>

                  <div className="flex justify-between">
                    <Link href={`/cars/${car.id}`}>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                        View Details
                      </button>
                    </Link>

                    <button
                      onClick={() => handleRemoveBookmark(car.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      disabled={busy === car.id}
                    >
                      {busy === car.id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
