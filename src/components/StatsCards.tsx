"use client";

import { BookOpen, Star, Calendar, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardsProps {
  totalBooks: number;
  readBooks: number;
  thisMonth: number;
  avgRating: number;
}

export default function StatsCards({
  totalBooks,
  readBooks,
  thisMonth,
  avgRating,
}: StatsCardsProps) {
  const cards = [
    {
      label: "کل کتاب‌ها",
      value: totalBooks,
      icon: BookOpen,
      color: "from-sky-400 to-blue-500",
      emoji: "📚",
    },
    {
      label: "خوانده‌شده",
      value: readBooks,
      icon: Trophy,
      color: "from-emerald-400 to-teal-500",
      emoji: "✅",
    },
    {
      label: "این ماه",
      value: thisMonth,
      icon: Calendar,
      color: "from-pink-400 to-rose-500",
      emoji: "📅",
    },
    {
      label: "میانگین امتیاز",
      value: avgRating > 0 ? avgRating.toFixed(1) : "—",
      icon: Star,
      color: "from-amber-400 to-orange-500",
      emoji: "⭐",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08 }}
          className="card relative overflow-hidden"
        >
          <div
            className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${card.color}`}
          />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">{card.label}</p>
              <p className="text-2xl font-extrabold text-gray-800">{card.value}</p>
            </div>
            <span className="text-2xl">{card.emoji}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
