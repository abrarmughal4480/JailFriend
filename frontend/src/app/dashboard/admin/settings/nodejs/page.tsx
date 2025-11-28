"use client";

import React, { useState } from "react";
import { useDarkMode } from "@/contexts/DarkModeContext";

const NodeJsSettingsPage = () => {
  const { isDarkMode } = useDarkMode();

  const [nodeJsEnabled, setNodeJsEnabled] = useState(false);
  const [sslEnabled, setSslEnabled] = useState(false);
  const [liveNotificationBar, setLiveNotificationBar] = useState(false);
  const [httpPort, setHttpPort] = useState("3000");
  const [httpsPort, setHttpsPort] = useState("449");
  const [sslKeyPath, setSslKeyPath] = useState("");
  const [sslCertPath, setSslCertPath] = useState("");

  const cardBase = isDarkMode
    ? "bg-gray-800 border border-gray-700 shadow-gray-900/50"
    : "bg-white border border-gray-200 shadow-md";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-300" : "text-gray-600";

  const Toggle = ({
    enabled,
    onToggle,
  }: {
    enabled: boolean;
    onToggle: () => void;
  }) => (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
        enabled ? "bg-green-500" : "bg-red-500"
      }`}
      aria-pressed={enabled}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
          enabled ? "translate-x-8" : "translate-x-2"
        }`}
      />
      {!enabled && (
        <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-semibold">
          ×
        </span>
      )}
    </button>
  );

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      } p-6 md:p-10`}
    >
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${textPrimary}`}>NodeJs Settings</h1>
        <div className={`text-sm ${textSecondary} flex items-center gap-2`}>
          <span role="img" aria-label="home">
            🏠
          </span>
          <span>Home</span>
          <span>&gt;</span>
          <span>Settings</span>
          <span>&gt;</span>
          <span className={isDarkMode ? "text-red-400" : "text-red-500"}>
            NodeJs Settings
          </span>
        </div>
      </div>

      <div className={`${cardBase} rounded-2xl p-6`}>
        <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
          NodeJs Configuration
        </h2>

        <div className="space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className={`text-lg font-semibold ${textPrimary}`}>NodeJS</p>
              <p className={`${textSecondary} text-sm`}>
                Get real time messaging, notifications and decrease server load
                by 80% less.
              </p>
            </div>
            <Toggle
              enabled={nodeJsEnabled}
              onToggle={() => setNodeJsEnabled((prev) => !prev)}
            />
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className={`text-lg font-semibold ${textPrimary}`}>
                NodeJs SSL Connection
              </p>
              <p className={`${textSecondary} text-sm`}>
                Enable this feature if you are using your site under SSL.
              </p>
            </div>
            <Toggle enabled={sslEnabled} onToggle={() => setSslEnabled((prev) => !prev)} />
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className={`text-lg font-semibold ${textPrimary}`}>
                Live Notification Bar
              </p>
              <p className={`${textSecondary} text-sm`}>
                Enable this feature and users will get fixed notifications on
                the bottom left corner.
              </p>
            </div>
            <Toggle
              enabled={liveNotificationBar}
              onToggle={() => setLiveNotificationBar((prev) => !prev)}
            />
          </div>

          <hr className={isDarkMode ? "border-gray-700" : "border-gray-200"} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className={`text-sm font-medium ${textPrimary}`}>
                NodeJs HTTP Port
              </label>
              <input
                type="number"
                value={httpPort}
                onChange={(e) => setHttpPort(e.target.value)}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:ring-red-500"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-red-400"
                }`}
              />
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-medium ${textPrimary}`}>
                NodeJs HTTPS (SSL) Port
              </label>
              <input
                type="number"
                value={httpsPort}
                onChange={(e) => setHttpsPort(e.target.value)}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:ring-red-500"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-red-400"
                }`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium ${textPrimary}`}>
              NodeJs SSL Certificate Key Path (.key)
            </label>
            <input
              type="text"
              placeholder="Only required if NodeJs SSL is enabled."
              value={sslKeyPath}
              onChange={(e) => setSslKeyPath(e.target.value)}
              className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? "bg-gray-900 border-gray-700 text-white focus:ring-red-500"
                  : "bg-white border-gray-300 text-gray-900 focus:ring-red-400"
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium ${textPrimary}`}>
              NodeJs SSL Certificate Path (.crt)
            </label>
            <input
              type="text"
              placeholder="Only required if NodeJs SSL is enabled."
              value={sslCertPath}
              onChange={(e) => setSslCertPath(e.target.value)}
              className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? "bg-gray-900 border-gray-700 text-white focus:ring-red-500"
                  : "bg-white border-gray-300 text-gray-900 focus:ring-red-400"
              }`}
            />
          </div>
        </div>

        <p className={`${textSecondary} mt-8 text-sm`}>
          If you disable the NodeJs system, the default AJAX system will be used
          for chat and notifications.
        </p>
      </div>
    </div>
  );
};

export default NodeJsSettingsPage;



