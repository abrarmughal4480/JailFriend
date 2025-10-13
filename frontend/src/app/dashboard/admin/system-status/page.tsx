"use client";
import React from 'react';

const AdminSystemStatus = () => {
  const systemMetrics = [
    { name: "Server Status", status: "Online", color: "green", value: "100%" },
    { name: "Database", status: "Connected", color: "green", value: "Active" },
    { name: "Memory Usage", status: "Normal", color: "yellow", value: "67%" },
    { name: "CPU Usage", status: "Normal", color: "green", value: "45%" },
    { name: "Disk Space", status: "Warning", color: "red", value: "89%" },
    { name: "Active Users", status: "Online", color: "green", value: "1,234" }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          System Status
        </h1>
        <div className="text-sm text-gray-600">
          Home {'>'} Admin {'>'} <span className="text-red-500 font-semibold">SYSTEM STATUS</span>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systemMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{metric.name}</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                metric.color === 'green' ? 'bg-green-100 text-green-800' :
                metric.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {metric.status}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSystemStatus; 
