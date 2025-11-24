// pages/profile.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

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
  const { data: session, status } = useSession();
  const [bookmarkedCars, setBookmarkedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const userId = session?.user?.id;

  async function fetchBookmarks() {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bookmarks/${userId}`);
      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to fetch bookmarks:", data);
        setBookmarkedCars([]);
      } else {
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
    if (status === "authenticated" && userId) {
      fetchBookmarks();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, userId]);

  async function handleRemoveBookmark(carId: string) {
    if (!userId) return alert("You must be logged in.");

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
        setBookmarkedCars((prev) =>
          prev.filter((c) => String(c.id) !== String(carId))
        );
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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700">Loading your bookmarks...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 via-purple-50 to-pink-50 px-6">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 border border-gray-100 max-w-md w-full">
          <p className="text-gray-700">Please log in to view your bookmarks.</p>
          <Link href="/login">
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
              Go to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-purple-50 to-pink-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-indigo-700">
              ⭐ Your Bookmarked Cars
            </h1>
            <p className="text-gray-600 mt-1">
              All the cars you saved for later.
            </p>
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
          <div className="text-center py-20 bg-white/95 rounded-xl shadow p-8 border border-gray-100">
            <p className="text-gray-600 text-lg">
              You haven’t bookmarked any cars yet.
            </p>
            <p className="text-gray-400 mt-3">
              Browse the homepage and click “Bookmark” to save cars here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {bookmarkedCars.map((car) => {
              const img =
                car.image && car.image !== ""
                  ? car.image
                  : "/placeholder-car.png";
              return (
                <div
                  key={car.id}
                  className="border border-gray-200 rounded-xl p-5 bg-white/95 shadow-md hover:shadow-lg transition duration-300"
                >
                  <div className="w-full h-40 mb-4 flex items-center justify-center overflow-hidden rounded">
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

                  <h2 className="text-xl font-bold text-gray-800">
                    {car.name}
                  </h2>
                  <p className="text-gray-500">{car.brand}</p>
                  <p className="text-blue-600 font-semibold mb-3">
                    {car.price_text ?? "Price not listed"}
                  </p>

                  <div className="flex justify-between">
                    <Link href={`/cars/${car.id}`}>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow">
                        View Details
                      </button>
                    </Link>

                    <button
                      onClick={() => handleRemoveBookmark(car.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow"
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
