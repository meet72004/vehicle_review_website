

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { gsap } from "gsap";

import Sidebar from "../components/Sidebar";
import ReviewModal from "../components/ReviewModal";
import StarRating from "../components/StarRating";
import { useTheme } from "../lib/theme-context";

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
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [cars, setCars] = useState<Car[]>([]);
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bookmarkedCars, setBookmarkedCars] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    carId: string;
    carName: string;
  }>({
    isOpen: false,
    carId: "",
    carName: "",
  });
  const [carRatings, setCarRatings] = useState<
    Record<string, { average: number; count: number }>
  >({});

  const userId = session?.user?.id;

  // Load cars
  useEffect(() => {
    fetch("/data/cars.json")
      .then((res) => res.json())
      .then((data) => {
        setCars(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading cars:", err);
        setLoading(false);
      });
  }, []);

  // Load bookmarks
  useEffect(() => {
    if (userId && status === "authenticated") {
      fetch(`/api/bookmarks/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setBookmarkedCars(data.bookmarks || []);
        })
        .catch((err) => console.error("Error loading bookmarks:", err));
    }
  }, [userId, status]);

  // Hero gradient animation
  useEffect(() => {
    gsap.fromTo(
      ".hero-bg",
      { backgroundPosition: "0% 50%" },
      {
        backgroundPosition: "100% 50%",
        duration: 6,
        repeat: -1,
        ease: "linear",
        yoyo: true,
      }
    );
  }, []);

  async function handleBookmark(carId: string) {
    if (!userId) {
      if (
        confirm(
          "Please log in to bookmark cars. Would you like to go to the login page?"
        )
      ) {
        router.push("/login");
      }
      return;
    }

    try {
      const res = await fetch("/api/bookmarks/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, carId }),
      });

      const data = await res.json();
      if (res.ok) {
        setBookmarkedCars((prev) => [...prev, carId]);
        alert("⭐ Car bookmarked successfully!");
      } else {
        alert(data.message || "Failed to bookmark car");
      }
    } catch (err) {
      console.error("Bookmark error:", err);
      alert("Something went wrong while bookmarking");
    }
  }

  const loadCarRatings = async (carId: string) => {
    try {
      const res = await fetch(`/api/reviews/car/${carId}`);
      const data = await res.json();
      if (res.ok) {
        setCarRatings((prev) => ({
          ...prev,
          [carId]: {
            average: data.averageRating,
            count: data.totalReviews,
          },
        }));
      }
    } catch (err) {
      console.error("Error loading car ratings:", err);
    }
  };

  useEffect(() => {
    cars.forEach((car) => loadCarRatings(car.id));
  }, [cars]);

  const isBookmarked = (carId: string) => bookmarkedCars.includes(carId);

  const openReviewModal = (carId: string, carName: string) => {
    if (!userId) {
      if (
        confirm(
          "Please log in to review cars. Would you like to go to the login page?"
        )
      ) {
        router.push("/login");
      }
      return;
    }
    setReviewModal({ isOpen: true, carId, carName });
  };

  const closeReviewModal = () =>
    setReviewModal({ isOpen: false, carId: "", carName: "" });
  const handleReviewAdded = () => loadCarRatings(reviewModal.carId);

  // Filters
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
        matchesPrice = car.price_value >= 800000 && car.price_value <= 1000000;
        break;
      case "10to12":
        matchesPrice = car.price_value > 1000000 && car.price_value <= 1200000;
        break;
      case "12to15":
        matchesPrice = car.price_value > 1200000 && car.price_value <= 1500000;
        break;
      case "above15":
        matchesPrice = car.price_value > 1500000;
        break;
      default:
        matchesPrice = true;
    }
    return matchesSearch && matchesPrice;
  });

  if (loading || status === "loading") {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
            : "bg-gradient-to-br from-gray-100 via-blue-50 to-indigo-100"
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
            Loading your experience...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={`min-h-screen relative transition-all duration-500 ${
        theme === "dark"
          ? "bg-gradient-to-b from-gray-900 via-gray-800 to-black"
          : "bg-gradient-to-b from-white via-blue-50 to-indigo-100"
      }`}
    >
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={closeReviewModal}
        carId={reviewModal.carId}
        carName={reviewModal.carName}
        onReviewAdded={handleReviewAdded}
      />

      {/* Top Right Buttons */}
      <div className="absolute top-5 right-6 flex items-center gap-3">
        <motion.button
          whileHover={{ rotate: 20, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 200 }}
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-700/70 text-gray-800 dark:text-gray-300 shadow-lg backdrop-blur-md flex items-center justify-center"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </motion.button>

        {session ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 text-white font-bold flex items-center justify-center shadow-lg"
          >
            👤
          </motion.button>
        ) : (
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.05 }}>
              <Link href="/login">
                <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition-all">
                  Login
                </button>
              </Link>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }}>
              <Link href="/signup">
                <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-md hover:shadow-lg transition-all">
                  Sign Up
                </button>
              </Link>
            </motion.button>
          </div>
        )}
      </div>

      {/* Hero Section */}
      <section className="hero-bg text-center py-16 px-6 bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 text-white shadow-2xl overflow-hidden">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl font-extrabold mb-4 tracking-tight drop-shadow-lg"
        >
          Find Your Dream Car 🚗
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="max-w-2xl mx-auto text-lg text-indigo-100"
        >
          Search, filter, and explore cars with beautiful visuals and real
          reviews — all in one elegant experience.
        </motion.p>
      </section>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="max-w-6xl mx-auto bg-white/80 dark:bg-gray-800/70 backdrop-blur-lg shadow-xl rounded-2xl px-6 py-6 mt-8 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="🔍 Search by brand or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="p-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
          >
            <option value="all">All Prices</option>
            <option value="below8">Below 8 Lakh</option>
            <option value="8to10">8 - 10 Lakh</option>
            <option value="10to12">10 - 12 Lakh</option>
            <option value="12to15">12 - 15 Lakh</option>
            <option value="above15">Above 15 Lakh</option>
          </select>
        </div>
      </motion.div>

      {/* Cars */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
          Available Cars
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {filteredCars.map((car, index) => {
            const rating = carRatings[car.id];
            return (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="rounded-2xl bg-white/90 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 p-6 flex flex-col justify-between"
              >
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  src={car.image}
                  alt={car.name}
                  className="w-full h-44 object-contain mb-5 drop-shadow-md"
                />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {car.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  {car.brand}
                </p>
                <p className="text-indigo-600 dark:text-indigo-400 font-bold mb-3">
                  {car.price_text}
                </p>

                {rating && rating.count > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <StarRating rating={rating.average} size="sm" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({rating.count} review{rating.count !== 1 ? "s" : ""})
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-auto">
                  <div className="flex justify-between">
                    <Link href={`/cars/${car.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold shadow-md transition-all"
                      >
                        View Details
                      </motion.button>
                    </Link>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleBookmark(car.id)}
                      className={`px-4 py-2 rounded-xl font-semibold shadow-md ${
                        isBookmarked(car.id)
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                          : "bg-gradient-to-r from-yellow-500 to-amber-500 text-white"
                      }`}
                    >
                      {isBookmarked(car.id) ? "✓ Bookmarked" : "⭐ Bookmark"}
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openReviewModal(car.id, car.name)}
                    className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md transition-all"
                  >
                    💬 Write Review
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredCars.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10 text-lg">
            ❌ No cars match your search or filter.
          </p>
        )}
      </div>
    </motion.div>
  );
}
