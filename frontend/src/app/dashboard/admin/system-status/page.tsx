"use client";
import React, { useState, useEffect } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { adminApi } from '@/utils/adminApi';

interface SystemMetric {
  name: string;
  status: string;
  color: string;
  value: string;
}

const AdminSystemStatus = () => {
  const { isDarkMode } = useDarkMode();
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getSystemStatus();
      
      if (data.success && data.metrics) {
        const metrics: SystemMetric[] = [
          { name: "Server Status", status: data.metrics.serverStatus.status, color: data.metrics.serverStatus.color, value: data.metrics.serverStatus.value },
          { name: "Database", status: data.metrics.database.status, color: data.metrics.database.color, value: data.metrics.database.value },
          { name: "Memory Usage", status: data.metrics.memoryUsage.status, color: data.metrics.memoryUsage.color, value: data.metrics.memoryUsage.value },
          { name: "CPU Usage", status: data.metrics.cpuUsage.status, color: data.metrics.cpuUsage.color, value: data.metrics.cpuUsage.value },
          { name: "Disk Space", status: data.metrics.diskSpace.status, color: data.metrics.diskSpace.color, value: data.metrics.diskSpace.value },
          { name: "Active Users", status: data.metrics.activeUsers.status, color: data.metrics.activeUsers.color, value: data.metrics.activeUsers.value.toString() }
        ];
        setSystemMetrics(metrics);
      }
    } catch (err) {
      console.error('Error fetching system status:', err);
      setError(err instanceof Error ? err.message : 'Failed to load system status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          System Status
        </h1>
        <div className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Home {'>'} Admin {'>'} <span className="text-red-500 font-semibold">SYSTEM STATUS</span>
        </div>
      </div>

      {/* System Metrics Grid */}
      {loading ? (
        <div className={`rounded-lg shadow-sm border p-6 transition-colors duration-200 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className={`mt-4 transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Loading system status...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className={`rounded-lg shadow-sm border p-6 transition-colors duration-200 ${
          isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
        }`}>
          <p className={`transition-colors duration-200 ${
            isDarkMode ? 'text-red-300' : 'text-red-800'
          }`}>
            {error}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systemMetrics.map((metric, index) => (
          <div
            key={index}
            className={`rounded-lg shadow-sm border p-6 transition-colors duration-200 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {metric.name}
              </h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors duration-200 ${
                metric.color === 'green'
                  ? isDarkMode
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-green-100 text-green-800'
                  : metric.color === 'yellow'
                  ? isDarkMode
                    ? 'bg-yellow-900/30 text-yellow-400'
                    : 'bg-yellow-100 text-yellow-800'
                  : isDarkMode
                  ? 'bg-red-900/30 text-red-400'
                  : 'bg-red-100 text-red-800'
              }`}>
                {metric.status}
              </span>
            </div>
            <div className={`text-2xl font-bold transition-colors duration-200 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {metric.value}
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default AdminSystemStatus; 
