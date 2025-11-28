"use client";

import React, { useState } from "react";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { ChevronUp, ChevronDown } from "lucide-react";

const ManageProRefundPage = () => {
  const { isDarkMode } = useDarkMode();
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRefunds, setSelectedRefunds] = useState<string[]>([]);
  const [actionType, setActionType] = useState("Approve");

  // Empty data for now
  const refunds: any[] = [];

  const cardBase = isDarkMode
    ? "bg-gray-800 border border-gray-700 shadow-gray-900/50"
    : "bg-white border border-gray-200 shadow-md";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-300" : "text-gray-600";
  const textTertiary = isDarkMode ? "text-gray-400" : "text-gray-500";
  const tableHeader = isDarkMode
    ? "bg-gray-700 text-gray-200"
    : "bg-gray-100 text-gray-700";

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRefunds(refunds.map((r) => r.id));
    } else {
      setSelectedRefunds([]);
    }
  };

  const handleSelectRefund = (refundId: string, checked: boolean) => {
    if (checked) {
      setSelectedRefunds([...selectedRefunds, refundId]);
    } else {
      setSelectedRefunds(selectedRefunds.filter((id) => id !== refundId));
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) {
      return (
        <div className="flex flex-col ml-1">
          <ChevronUp className="w-3 h-3 text-gray-400" />
          <ChevronDown className="w-3 h-3 text-gray-400 -mt-1" />
        </div>
      );
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    );
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"} p-6`}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>
          Manage Pro Refund
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
            Manage Pro Refund
          </span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className={`${cardBase} rounded-xl p-6`}>
        {/* Internal Title */}
        <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
          Manage Pro Refund
        </h2>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={tableHeader}>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      refunds.length > 0 &&
                      selectedRefunds.length === refunds.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className={`rounded ${
                      isDarkMode ? "border-gray-600" : "border-gray-300"
                    }`}
                  />
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:opacity-80"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center">
                    ID
                    <SortIcon column="id" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  USER
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  MESSAGE
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  STATUS
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {refunds.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`px-4 py-8 text-center ${textSecondary}`}
                  >
                    No refund requests found
                  </td>
                </tr>
              ) : (
                refunds.map((refund) => (
                  <tr
                    key={refund.id}
                    className={`${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    } border-b transition-colors`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRefunds.includes(refund.id)}
                        onChange={(e) =>
                          handleSelectRefund(refund.id, e.target.checked)
                        }
                        className={`rounded ${
                          isDarkMode ? "border-gray-600" : "border-gray-300"
                        }`}
                      />
                    </td>
                    <td className={`px-4 py-3 ${textPrimary} text-sm`}>
                      {refund.id}
                    </td>
                    <td className={`px-4 py-3 ${textPrimary} text-sm`}>
                      {refund.user}
                    </td>
                    <td className={`px-4 py-3 ${textPrimary} text-sm`}>
                      {refund.message}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          refund.status === "Approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : refund.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {refund.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className={`text-sm ${
                          isDarkMode ? "text-blue-400" : "text-blue-600"
                        } hover:underline`}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Action Section */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <label className={`text-sm font-medium ${textPrimary}`}>
              Action:
            </label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className={`px-4 py-2 ${
                isDarkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              } border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
            >
              <option value="Approve">Approve</option>
              <option value="Reject">Reject</option>
              <option value="Pending">Pending</option>
            </select>
            <button
              onClick={() => {
                // Handle submit action
                if (selectedRefunds.length === 0) {
                  alert("Please select at least one refund request");
                  return;
                }
                alert(
                  `Applying ${actionType} to ${selectedRefunds.length} refund request(s)`
                );
              }}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProRefundPage;



