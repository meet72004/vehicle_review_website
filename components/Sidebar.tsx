"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import StarRating from "./StarRating";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Review {
  id: string;
  carId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  } | null;
  car?: {
    name: string;
    brand: string;
  } | null;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  // Load current user's reviews when sidebar opens
  useEffect(() => {
    if (session?.user?.id && isOpen) {
      setLoading(true);
      fetch(`/api/reviews/${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.reviews) {
            setReviews(data.reviews);
          }
        })
        .catch((err) => console.error("Error loading reviews:", err))
        .finally(() => setLoading(false));
    }
  }, [session?.user?.id, isOpen]);

  return (
    <motion.aside
      initial={{ x: "100%" }}
      animate={{ x: isOpen ? 0 : "100%" }}
      transition={{ type: "tween", duration: 0.3 }}
      className="fixed top-0 right-0 h-full w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Profile
          </h2>
          {session?.user?.name && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {session.user.name}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      {/* Navigation */}
      <div className="flex flex-col p-4 space-y-2 border-b border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60">
        <button
          onClick={() => {
            router.push("/profile");
            onClose();
          }}
          className="text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300 shadow-sm"
        >
          ⭐ My Bookmarks
        </button>
      </div>

      {/* Reviews Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              My Reviews
            </h3>
            {reviews.length > 0 && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {reviews.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Loading reviews...
              </p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No reviews yet
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                Start reviewing cars to see them here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-gray-50/90 dark:bg-gray-700/90 rounded-lg p-3 transition-colors duration-300 border border-gray-200 dark:border-gray-600 shadow-sm"
                >
                  {/* Car Name and Brand */}
                  {review.car && (
                    <div className="mb-2">
                      <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
                        {review.car.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {review.car.brand}
                      </p>
                    </div>
                  )}

                  {/* User and Date */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        by {review.user?.name || "Anonymous"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} size="sm" />
                  </div>

                  {/* Comment */}
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sign out button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/40 transition"
        >
          🚪 Sign Out
        </button>
      </div>
    </motion.aside>
  );
}
