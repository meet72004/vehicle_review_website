"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();

  return (
    <motion.aside
      initial={{ x: "100%" }}
      animate={{ x: isOpen ? 0 : "100%" }}
      transition={{ type: "tween", duration: 0.3 }}
      className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Profile</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 text-xl"
        >
          ✕
        </button>
      </div>

      {/* Options */}
      <div className="flex flex-col p-4 space-y-2">
        {/* Bookmarks button */}
        <button
          onClick={() => {
            router.push("/profile");
            onClose();
          }}
          className="text-left px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          ⭐ Bookmarks
        </button>

        <hr className="my-2 border-gray-200" />

        {/* Sign out button */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-left px-4 py-2 text-red-500 rounded-lg hover:bg-red-100"
        >
          🚪 Sign Out
        </button>
      </div>
    </motion.aside>
  );
}
