"use client";

import React, { useState } from "react";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { DollarSign, Star, Flame, Crown, TrendingUp } from "lucide-react";

const ManagePaymentsPage = () => {
  const { isDarkMode } = useDarkMode();
  const [timeFilter, setTimeFilter] = useState("this-year");

  const cardBase = isDarkMode
    ? "bg-gray-800 border border-gray-700 shadow-gray-900/50"
    : "bg-white border border-gray-200 shadow-md";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-300" : "text-gray-600";
  const textTertiary = isDarkMode ? "text-gray-400" : "text-gray-500";

  // KPI Data
  const kpiData = [
    {
      title: "TOTAL EARNINGS",
      value: "$0",
      icon: DollarSign,
      iconColor: "bg-blue-500",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "EARNINGS THIS MONTH",
      value: "$0",
      icon: DollarSign,
      iconColor: "bg-yellow-500",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      title: "Star SALES",
      value: "0",
      icon: Star,
      iconColor: "bg-purple-500",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Hot SALES",
      value: "0",
      icon: Flame,
      iconColor: "bg-red-500",
      iconBg: "bg-red-100 dark:bg-red-900/30",
    },
    {
      title: "Ultima SALES",
      value: "0",
      icon: TrendingUp,
      iconColor: "bg-indigo-500",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      title: "VIP SALES",
      value: "0",
      icon: Crown,
      iconColor: "bg-blue-600",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
    },
  ];

  // Chart data - empty for now
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = {
    star: new Array(12).fill(0),
    hot: new Array(12).fill(0),
    ultima: new Array(12).fill(0),
    vip: new Array(12).fill(0),
  };

  const maxValue = 5;
  const yAxisSteps = 6;

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"} p-6`}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>
          Manage Payments
        </h1>
        <div
          className={`text-sm ${textSecondary} flex items-center space-x-2`}
        >
          <span className={isDarkMode ? "text-red-400" : "text-red-500"}>
            🏠
          </span>
          <span>Home</span>
          <span>&gt;</span>
          <span>Pro System</span>
          <span>&gt;</span>
          <span className={isDarkMode ? "text-red-400" : "text-red-500"}>
            Manage Payments
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {kpiData.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <div
              key={index}
              className={`${cardBase} rounded-xl p-6`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${textSecondary} mb-1`}>
                    {kpi.title}
                  </p>
                  <p className={`text-2xl font-bold ${textPrimary}`}>
                    {kpi.value}
                  </p>
                </div>
                <div
                  className={`${kpi.iconBg} ${kpi.iconColor} w-16 h-16 rounded-full flex items-center justify-center`}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pro Packages Sales Chart */}
      <div className={`${cardBase} rounded-xl p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-semibold ${textPrimary}`}>
            Pro Packages Sales
          </h2>
          <button
            onClick={() => setTimeFilter("this-year")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeFilter === "this-year"
                ? "bg-blue-600 text-white"
                : isDarkMode
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            This Year
          </button>
        </div>

        {/* Chart Container */}
        <div className="relative">
          {/* Y-axis Labels */}
          <div className="flex items-end h-64 mb-4">
            <div className="w-12 mr-4 flex flex-col justify-between h-full">
              {Array.from({ length: yAxisSteps }, (_, i) => {
                const value = maxValue - (i * (maxValue / (yAxisSteps - 1)));
                return (
                  <span
                    key={i}
                    className={`text-xs ${textTertiary} text-right`}
                  >
                    {value.toFixed(0)}
                  </span>
                );
              })}
            </div>

            {/* Chart Area */}
            <div className="flex-1 relative h-64 border-b border-l border-gray-300 dark:border-gray-600">
              {/* Grid Lines */}
              <div className="absolute inset-0">
                {Array.from({ length: yAxisSteps - 1 }, (_, i) => (
                  <div
                    key={i}
                    className={`absolute left-0 right-0 border-t ${
                      isDarkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                    style={{
                      bottom: `${(i * 100) / (yAxisSteps - 1)}%`,
                    }}
                  />
                ))}
              </div>

              {/* Chart Lines (empty for now) */}
              <svg className="absolute inset-0 w-full h-full">
                {/* Star Sales Line (Green) */}
                <polyline
                  points={months
                    .map((_, i) => {
                      const x = (i / (months.length - 1)) * 100;
                      const y = 100 - (chartData.star[i] / maxValue) * 100;
                      return `${x}%,${y}%`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="0"
                />

                {/* Hot Sales Line (Red) */}
                <polyline
                  points={months
                    .map((_, i) => {
                      const x = (i / (months.length - 1)) * 100;
                      const y = 100 - (chartData.hot[i] / maxValue) * 100;
                      return `${x}%,${y}%`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="0"
                />

                {/* Ultima Sales Line (Orange) */}
                <polyline
                  points={months
                    .map((_, i) => {
                      const x = (i / (months.length - 1)) * 100;
                      const y = 100 - (chartData.ultima[i] / maxValue) * 100;
                      return `${x}%,${y}%`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeDasharray="0"
                />

                {/* VIP Sales Line (Blue) */}
                <polyline
                  points={months
                    .map((_, i) => {
                      const x = (i / (months.length - 1)) * 100;
                      const y = 100 - (chartData.vip[i] / maxValue) * 100;
                      return `${x}%,${y}%`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="0"
                />
              </svg>
            </div>
          </div>

          {/* X-axis Labels */}
          <div className="flex ml-16">
            {months.map((month, index) => (
              <div
                key={index}
                className="flex-1 text-center"
              >
                <span className={`text-xs ${textTertiary}`}>{month}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className={`text-sm ${textSecondary}`}>Star Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className={`text-sm ${textSecondary}`}>Hot Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className={`text-sm ${textSecondary}`}>Ultima Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className={`text-sm ${textSecondary}`}>VIP Sales</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePaymentsPage;

