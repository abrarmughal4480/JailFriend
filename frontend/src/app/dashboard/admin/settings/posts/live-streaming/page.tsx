"use client";

import React, { useState } from "react";
import { useDarkMode } from "@/contexts/DarkModeContext";
import Link from "next/link";
import { Info } from "lucide-react";

const SetupLiveStreamingPage = () => {
  const { isDarkMode } = useDarkMode();

  // Live Streaming Settings
  const [liveStreaming, setLiveStreaming] = useState(true);
  const [liveStreamingStorage, setLiveStreamingStorage] = useState(true);

  // Millicast API Configuration
  const [millicastEnabled, setMillicastEnabled] = useState(false);
  const [publishingToken, setPublishingToken] = useState("");
  const [accountId, setAccountId] = useState("");

  // Agora API Configuration
  const [agoraEnabled, setAgoraEnabled] = useState(true);
  const [appId, setAppId] = useState("b0ac9fe629c143839e04ecde2e436d2c");
  const [appCertificate, setAppCertificate] = useState("");
  const [customerId, setCustomerId] = useState("7fce6b7b407b448798dd0017f8321947");
  const [customerSecret, setCustomerSecret] = useState("");

  // Amazon S3 Configuration
  const [amazonS3Enabled, setAmazonS3Enabled] = useState(false);
  const [bucketName, setBucketName] = useState("");
  const [s3Key, setS3Key] = useState("");
  const [s3SecretKey, setS3SecretKey] = useState("");
  const [s3Region, setS3Region] = useState("eu-west-1");

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
      {enabled ? (
        <span className="absolute left-2 flex items-center justify-center text-white text-sm font-semibold">
          ✓
        </span>
      ) : (
        <span className="absolute right-2 flex items-center justify-center text-white text-sm font-semibold">
          ×
        </span>
      )}
    </button>
  );

  const handleProviderToggle = (provider: "millicast" | "agora") => {
    if (provider === "millicast") {
      setMillicastEnabled(!millicastEnabled);
      if (!millicastEnabled) {
        setAgoraEnabled(false);
      }
    } else {
      setAgoraEnabled(!agoraEnabled);
      if (!agoraEnabled) {
        setMillicastEnabled(false);
      }
    }
  };

  const s3Regions = [
    { value: "us-east-1", label: "US East (N. Virginia)" },
    { value: "us-east-2", label: "US East (Ohio)" },
    { value: "us-west-1", label: "US West (N. California)" },
    { value: "us-west-2", label: "US West (Oregon)" },
    { value: "eu-west-1", label: "EU (Ireland)" },
    { value: "eu-west-2", label: "EU (London)" },
    { value: "eu-west-3", label: "EU (Paris)" },
    { value: "eu-central-1", label: "EU (Frankfurt)" },
    { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
    { value: "ap-southeast-2", label: "Asia Pacific (Sydney)" },
    { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
    { value: "ap-south-1", label: "Asia Pacific (Mumbai)" },
    { value: "sa-east-1", label: "South America (São Paulo)" },
  ];

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"} p-6`}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>
          Setup Live Streaming
        </h1>
        <div
          className={`text-sm ${textSecondary} flex items-center space-x-2`}
        >
          <span className={isDarkMode ? "text-red-400" : "text-red-500"}>
            🏠
          </span>
          <span>Home</span>
          <span>&gt;</span>
          <span>Settings</span>
          <span>&gt;</span>
          <span className={isDarkMode ? "text-red-400" : "text-red-500"}>
            Setup Live Streaming
          </span>
        </div>
      </div>

      {/* Info Banner */}
      <div
        className={`mb-6 p-4 rounded-lg flex items-start gap-2 ${
          isDarkMode
            ? "bg-blue-900/30 text-blue-200 border border-blue-800"
            : "bg-blue-50 text-blue-800 border border-blue-200"
        }`}
      >
        <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <p className="text-sm">
          <span className="font-semibold">Info:</span> For more information on
          how to setup live streaming, please visit our{" "}
          <a
            href="#"
            className="underline hover:no-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation page
          </a>
          .
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Live Streaming Settings */}
          <div className={`${cardBase} rounded-xl p-6`}>
            <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
              Live Streaming Settings
            </h2>
            <div className="space-y-6">
              {/* Live Streaming */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Live Streaming
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    Users can go live instantly.
                  </p>
                </div>
                <Toggle
                  enabled={liveStreaming}
                  onToggle={() => setLiveStreaming((prev) => !prev)}
                />
              </div>

              {/* Live Streaming Storage */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Live Streaming Storage
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    Let the live stream save streams to watch again later.
                  </p>
                </div>
                <Toggle
                  enabled={liveStreamingStorage}
                  onToggle={() =>
                    setLiveStreamingStorage((prev) => !prev)
                  }
                />
              </div>
            </div>
          </div>

          {/* Millicast API Configuration */}
          <div className={`${cardBase} rounded-xl p-6`}>
            <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
              Millicast API Configuration
            </h2>

            {/* Info Banner */}
            <div
              className={`mb-6 p-4 rounded-lg ${
                isDarkMode
                  ? "bg-blue-900/30 text-blue-200 border border-blue-800"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              <p className="text-sm">
                To start using this feature, you'll need to create an account in{" "}
                <a
                  href="https://www.millicast.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  MilliCast
                </a>
                .
              </p>
            </div>

            <div className="space-y-6">
              {/* Millicast Live Streaming */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Millicast Live Streaming
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    Users can go live instantly using Millicast.
                    <br />
                    Note you can only choose one provider at the same time.
                  </p>
                </div>
                <Toggle
                  enabled={millicastEnabled}
                  onToggle={() => handleProviderToggle("millicast")}
                />
              </div>

              {millicastEnabled && (
                <>
                  {/* Publishing Token */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${textPrimary} mb-2`}
                    >
                      Publishing Token
                    </label>
                    <input
                      type="text"
                      value={publishingToken}
                      onChange={(e) => setPublishingToken(e.target.value)}
                      placeholder="Your Millicast Publishing Token."
                      className={`w-full px-3 py-2 ${
                        isDarkMode
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>

                  {/* Account ID */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${textPrimary} mb-2`}
                    >
                      Account ID
                    </label>
                    <input
                      type="text"
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      placeholder="Your Millicast Account ID."
                      className={`w-full px-3 py-2 ${
                        isDarkMode
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Agora API Configuration */}
          <div className={`${cardBase} rounded-xl p-6`}>
            <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
              Agora API Configuration
            </h2>

            {/* Info Banner */}
            <div
              className={`mb-6 p-4 rounded-lg ${
                isDarkMode
                  ? "bg-blue-900/30 text-blue-200 border border-blue-800"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              <p className="text-sm">
                To start using this feature, you'll need to create an account in{" "}
                <a
                  href="https://www.agora.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  Agora
                </a>
                .
              </p>
            </div>

            <div className="space-y-6">
              {/* Agora Live Streaming */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Agora Live Streaming
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    Users can go live instantly using Agora.
                    <br />
                    Note you can only choose one provider at the same time.
                  </p>
                </div>
                <Toggle
                  enabled={agoraEnabled}
                  onToggle={() => handleProviderToggle("agora")}
                />
              </div>

              {agoraEnabled && (
                <>
                  {/* App ID */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${textPrimary} mb-2`}
                    >
                      App ID
                    </label>
                    <input
                      type="text"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      className={`w-full px-3 py-2 ${
                        isDarkMode
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>

                  {/* App Certificate */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${textPrimary} mb-2`}
                    >
                      App Certificate
                    </label>
                    <input
                      type="password"
                      value={appCertificate}
                      onChange={(e) => setAppCertificate(e.target.value)}
                      placeholder="Enter App Certificate"
                      className={`w-full px-3 py-2 ${
                        isDarkMode
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                    />
                    <div
                      className={`mt-2 p-3 rounded-lg ${
                        isDarkMode
                          ? "bg-pink-900/30 text-pink-200 border border-pink-800"
                          : "bg-pink-50 text-pink-800 border border-pink-200"
                      }`}
                    >
                      <p className="text-xs">
                        The secret key is not showing due security reasons, you
                        can still overwrite the current one.
                      </p>
                    </div>
                  </div>

                  {/* Customer ID */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${textPrimary} mb-2`}
                    >
                      Customer ID
                    </label>
                    <input
                      type="text"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      className={`w-full px-3 py-2 ${
                        isDarkMode
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>

                  {/* Customer Secret */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${textPrimary} mb-2`}
                    >
                      Customer Secret
                    </label>
                    <input
                      type="password"
                      value={customerSecret}
                      onChange={(e) => setCustomerSecret(e.target.value)}
                      placeholder="Enter Customer Secret"
                      className={`w-full px-3 py-2 ${
                        isDarkMode
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                    />
                    <div
                      className={`mt-2 p-3 rounded-lg ${
                        isDarkMode
                          ? "bg-pink-900/30 text-pink-200 border border-pink-800"
                          : "bg-pink-50 text-pink-800 border border-pink-200"
                      }`}
                    >
                      <p className="text-xs">
                        The secret key is not showing due security reasons, you
                        can still overwrite the current one.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Amazon S3 Live Streaming Storage */}
          <div className={`${cardBase} rounded-xl p-6`}>
            <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
              Amazon S3 Live Streaming Storage
            </h2>
            <p className={`${textSecondary} text-sm mb-6`}>
              Used to store video streams if "Live Streaming Storage" is
              enabled.
            </p>

            <div className="space-y-6">
              {/* Amazon S3 Toggle */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Amazon S3 Live Streaming Storage
                  </p>
                </div>
                <Toggle
                  enabled={amazonS3Enabled}
                  onToggle={() => setAmazonS3Enabled((prev) => !prev)}
                />
              </div>

              {amazonS3Enabled && (
                <>
                  {/* Amazon Bucket Name */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${textPrimary} mb-2`}
                    >
                      Amazon Bucket Name
                    </label>
                    <input
                      type="text"
                      value={bucketName}
                      onChange={(e) => setBucketName(e.target.value)}
                      placeholder="Your Amazon S3 Bucket Name"
                      className={`w-full px-3 py-2 ${
                        isDarkMode
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>

                  {/* Amazon S3 Key */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${textPrimary} mb-2`}
                    >
                      Amazon S3 Key
                    </label>
                    <input
                      type="text"
                      value={s3Key}
                      onChange={(e) => setS3Key(e.target.value)}
                      placeholder="Your Amazon Key from AWS credentials"
                      className={`w-full px-3 py-2 ${
                        isDarkMode
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>

                  {/* Amazon S3 Secret Key */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${textPrimary} mb-2`}
                    >
                      Amazon S3 Secret Key
                    </label>
                    <input
                      type="password"
                      value={s3SecretKey}
                      onChange={(e) => setS3SecretKey(e.target.value)}
                      placeholder="Your Amazon Secret from AWS credentials"
                      className={`w-full px-3 py-2 ${
                        isDarkMode
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>

                  {/* Amazon S3 bucket Region */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${textPrimary} mb-2`}
                    >
                      Amazon S3 bucket Region
                    </label>
                    <select
                      value={s3Region}
                      onChange={(e) => setS3Region(e.target.value)}
                      className={`w-full px-3 py-2 ${
                        isDarkMode
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                    >
                      {s3Regions.map((region) => (
                        <option key={region.value} value={region.value}>
                          {region.label}
                        </option>
                      ))}
                    </select>
                    <p className={`${textSecondary} text-xs mt-1`}>
                      Your Amazon's S3 Region
                    </p>
                  </div>

                  {/* Important Notices */}
                  <div className="space-y-3">
                    <div
                      className={`p-4 rounded-lg ${
                        isDarkMode
                          ? "bg-yellow-900/30 text-yellow-200 border border-yellow-800"
                          : "bg-yellow-50 text-yellow-800 border border-yellow-200"
                      }`}
                    >
                      <p className="text-xs font-semibold mb-1">
                        Before enabling Amazon S3:
                      </p>
                      <p className="text-xs">
                        Make sure you upload the whole "upload/" folder to your
                        bucket.
                      </p>
                    </div>

                    <div
                      className={`p-4 rounded-lg ${
                        isDarkMode
                          ? "bg-yellow-900/30 text-yellow-200 border border-yellow-800"
                          : "bg-yellow-50 text-yellow-800 border border-yellow-200"
                      }`}
                    >
                      <p className="text-xs font-semibold mb-1">
                        Before disabling Amazon S3:
                      </p>
                      <p className="text-xs">
                        Make sure you download the whole "upload/" folder to
                        your server.
                      </p>
                    </div>

                    <div
                      className={`p-4 rounded-lg ${
                        isDarkMode
                          ? "bg-blue-900/30 text-blue-200 border border-blue-800"
                          : "bg-blue-50 text-blue-800 border border-blue-200"
                      }`}
                    >
                      <p className="text-xs">
                        We recommend to upload the folder and files via S3cmd.
                      </p>
                    </div>

                    <div
                      className={`p-4 rounded-lg ${
                        isDarkMode
                          ? "bg-green-900/30 text-green-200 border border-green-800"
                          : "bg-green-50 text-green-800 border border-green-200"
                      }`}
                    >
                      <p className="text-xs">
                        If your site is still brand new, you can escape the
                        upload step, but make sure to click on "Test Connection".
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-6">
        <p className={`text-sm ${textSecondary}`}>
          Looking for Video Call Configuration?{" "}
          <Link
            href="/dashboard/admin/settings/chat"
            className={`${
              isDarkMode ? "text-blue-400" : "text-blue-600"
            } underline hover:no-underline`}
          >
            Click here
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default SetupLiveStreamingPage;



