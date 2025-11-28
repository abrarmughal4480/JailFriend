"use client";

import React, { useState } from "react";
import { useDarkMode } from "@/contexts/DarkModeContext";

const CronJobSettingsPage = () => {
  const { isDarkMode } = useDarkMode();

  const [cronCommand, setCronCommand] = useState(
    "*/5 * * * * curl https://demo.jaifriend.com/cron-job.php &>/dev/null"
  );
  const [lastRun, setLastRun] = useState("");

  const pageBg = isDarkMode ? "bg-gray-900" : "bg-gray-50";
  const cardBg = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-300" : "text-gray-600";

  return (
    <div className={`min-h-screen ${pageBg} p-6 md:p-10`}>
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${textPrimary}`}>CronJob Settings</h1>
        <div className={`text-sm ${textSecondary} flex items-center gap-2`}>
          <span role="img" aria-label="home">
            🏠
          </span>
          <span>Home</span>
          <span>&gt;</span>
          <span>Settings</span>
          <span>&gt;</span>
          <span className={isDarkMode ? "text-red-400" : "text-red-500"}>CronJob Settings</span>
        </div>
      </div>

      <div className={`rounded-2xl border ${cardBg} p-6 shadow-md`}>
        <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>CronJob Settings</h2>

        <div
          className={`rounded-xl p-4 mb-6 ${
            isDarkMode ? "bg-yellow-900/40 text-yellow-200" : "bg-yellow-100 text-yellow-800"
          }`}
        >
          Make sure to add this cronjob to your crontab list. The target file is
          <span className="font-semibold"> cron-job.php</span>, and it should run every 5 minutes using the command below.
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className={`text-sm font-semibold ${textPrimary}`}>CronJob Command</label>
            <input
              type="text"
              value={cronCommand}
              onChange={(e) => setCronCommand(e.target.value)}
              className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? "bg-gray-900 border-gray-700 text-white focus:ring-red-500"
                  : "bg-white border-gray-300 text-gray-900 focus:ring-red-400"
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-semibold ${textPrimary}`}>CronJob Last Run</label>
            <input
              type="text"
              value={lastRun}
              onChange={(e) => setLastRun(e.target.value)}
              placeholder="e.g., 2025-11-24 10:30 AM"
              className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? "bg-gray-900 border-gray-700 text-white focus:ring-red-500"
                  : "bg-white border-gray-300 text-gray-900 focus:ring-red-400"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CronJobSettingsPage;



