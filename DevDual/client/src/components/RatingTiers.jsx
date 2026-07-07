import React from "react";
import { FaMedal, FaGem, FaTrophy, FaCrown } from "react-icons/fa";

const tiers = [
  { name: "Bronze", range: "<= 200", color: "text-amber-500", icon: FaMedal },
  { name: "Silver", range: "201 — 400", color: "text-slate-300", icon: FaMedal },
  { name: "Gold", range: "401 — 800", color: "text-yellow-400", icon: FaMedal },
  { name: "Platinum", range: "801 — 1300", color: "text-sky-400", icon: FaGem },
  { name: "Diamond", range: "1301 — 2000", color: "text-rose-400", icon: FaGem },
  { name: "Champion", range: "2001 — 2900", color: "text-indigo-400", icon: FaTrophy },
  { name: "Arceus", range: "2901+", color: "text-rose-700", icon: FaCrown },
];

function RatingTiers() {
  return (
    <div className="w-full max-w-3xl mx-auto mt-8 z-10">
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 shadow-md">
        <h3 className="text-white font-semibold mb-3 text-center text-2xl">Rating Tiers</h3>
        <p className="text-zinc-400 text-sm mb-4 text-center">See where you stand in rating ranges for each tier.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tiers.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.name}
                className="flex flex-col items-start gap-1 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800"
              >
                <div className="flex justify-center items-center gap-2">
                  <Icon className={`${t.color} w-5 h-5`} />
                  <div className={`font-semibold ${t.color} text-sm`}>{t.name}</div>
                </div>
                <div className="text-zinc-400 text-xs">{t.range}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RatingTiers;
