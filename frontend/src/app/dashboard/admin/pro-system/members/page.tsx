"use client";

import React, { useState } from "react";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const ManageProMembersPage = () => {
  const { isDarkMode } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [actionType, setActionType] = useState("Free Member");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");

  // Empty data for now
  const members: any[] = [];
  const totalMembers = 0;

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
      setSelectedMembers(members.map((m) => m.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const handleSelectMember = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers([...selectedMembers, memberId]);
    } else {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
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
          Manage Pro Members
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
            Manage Pro Members
          </span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className={`${cardBase} rounded-xl p-6`}>
        {/* Top Right Buttons */}
        <div className="flex justify-end gap-3 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? isDarkMode
                  ? "bg-gray-700 text-white border border-gray-600"
                  : "bg-white text-gray-900 border border-gray-300"
                : isDarkMode
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => {
              // Handle cancel expired subscriptions
              alert("Cancel Expired Subscriptions functionality");
            }}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Cancel Expired Subscriptions
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textTertiary} w-5 h-5`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for Username, E-mail, First or Last Name."
              className={`w-full pl-10 pr-4 py-2 ${
                isDarkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              } border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
            />
          </div>
          <button
            onClick={() => {
              // Handle search
              console.log("Searching for:", searchQuery);
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Search
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={tableHeader}>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      members.length > 0 &&
                      selectedMembers.length === members.length
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
                <th
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:opacity-80"
                  onClick={() => handleSort("username")}
                >
                  <div className="flex items-center">
                    USERNAME
                    <SortIcon column="username" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:opacity-80"
                  onClick={() => handleSort("proType")}
                >
                  <div className="flex items-center">
                    PRO TYPE
                    <SortIcon column="proType" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:opacity-80"
                  onClick={() => handleSort("subscribed")}
                >
                  <div className="flex items-center">
                    SUBSCRIBED
                    <SortIcon column="subscribed" />
                  </div>
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
              {members.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className={`px-4 py-8 text-center ${textSecondary}`}
                  >
                    No members found
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr
                    key={member.id}
                    className={`${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    } border-b transition-colors`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={(e) =>
                          handleSelectMember(member.id, e.target.checked)
                        }
                        className={`rounded ${
                          isDarkMode ? "border-gray-600" : "border-gray-300"
                        }`}
                      />
                    </td>
                    <td className={`px-4 py-3 ${textPrimary} text-sm`}>
                      {member.id}
                    </td>
                    <td className={`px-4 py-3 ${textPrimary} text-sm`}>
                      {member.username}
                    </td>
                    <td className={`px-4 py-3 ${textPrimary} text-sm`}>
                      {member.proType}
                    </td>
                    <td className={`px-4 py-3 ${textPrimary} text-sm`}>
                      {member.subscribed}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          member.status === "Active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {member.status}
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

        {/* Pagination and Info */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <span className={`text-sm ${textSecondary}`}>
              Showing {members.length} out of {totalMembers}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`p-2 rounded ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
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
              <option value="Free Member">Free Member</option>
              <option value="Star Member">Star Member</option>
              <option value="Hot Member">Hot Member</option>
              <option value="Ultima Member">Ultima Member</option>
              <option value="VIP Member">VIP Member</option>
            </select>
            <button
              onClick={() => {
                // Handle submit action
                if (selectedMembers.length === 0) {
                  alert("Please select at least one member");
                  return;
                }
                alert(
                  `Applying ${actionType} to ${selectedMembers.length} member(s)`
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

export default ManageProMembersPage;

