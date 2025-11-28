"use client";

import React, { useState } from "react";
import { useDarkMode } from "@/contexts/DarkModeContext";

const AiSettingsPage = () => {
  const { isDarkMode } = useDarkMode();

  const [openAiKey, setOpenAiKey] = useState("");
  const [openAiModel, setOpenAiModel] = useState("gpt-3.5-turbo");

  const [imagesEnabled, setImagesEnabled] = useState(false);
  const [imagesApi, setImagesApi] = useState("OpenAI");
  const [postsEnabled, setPostsEnabled] = useState(false);
  const [postsApi, setPostsApi] = useState("OpenAI");
  const [blogEnabled, setBlogEnabled] = useState(false);
  const [blogApi, setBlogApi] = useState("OpenAI");
  const [avatarEnabled, setAvatarEnabled] = useState(false);
  const [avatarApi, setAvatarApi] = useState("Replicate");

  const [replicateModel, setReplicateModel] = useState("prompthero/openjourney");
  const [replicateToken, setReplicateToken] = useState("");
  const [inferenceSteps, setInferenceSteps] = useState("1");
  const [guidanceScale, setGuidanceScale] = useState("1");
  const [seed, setSeed] = useState("");

  const [creditPrice, setCreditPrice] = useState("100");
  const [imageCreditEnabled, setImageCreditEnabled] = useState(true);
  const [imagePrice, setImagePrice] = useState("10");
  const [textCreditEnabled, setTextCreditEnabled] = useState(true);
  const [textPrice, setTextPrice] = useState("1");

  const pageBg = isDarkMode ? "bg-gray-900" : "bg-gray-50";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-300" : "text-gray-600";
  const cardBase = isDarkMode
    ? "bg-gray-800 border-gray-700 shadow-gray-900/50"
    : "bg-white border-gray-200 shadow-md";

  const inputStyles = `w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
    isDarkMode
      ? "bg-gray-900 border-gray-700 text-white focus:ring-red-500"
      : "bg-white border-gray-300 text-gray-900 focus:ring-red-400"
  }`;

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

  const renderFeature = (
    title: string,
    description: string,
    enabled: boolean,
    onToggle: () => void,
    apiLabel: string,
    apiValue: string,
    onApiChange: (value: string) => void
  ) => (
    <div className="flex flex-col gap-4 rounded-xl border border-dashed border-gray-200 p-4 dark:border-gray-700">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className={`text-lg font-semibold ${textPrimary}`}>{title}</p>
          <p className={`${textSecondary} text-sm`}>{description}</p>
        </div>
        <Toggle enabled={enabled} onToggle={onToggle} />
      </div>
      <div className="space-y-2">
        <label className={`text-sm font-medium ${textPrimary}`}>{apiLabel}</label>
        <select
          value={apiValue}
          onChange={(e) => onApiChange(e.target.value)}
          className={inputStyles}
        >
          <option>OpenAI</option>
          <option>Replicate</option>
          <option>Custom</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${pageBg} p-6 md:p-10`}>
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${textPrimary}`}>AI Settings</h1>
        <div className={`text-sm ${textSecondary} flex items-center gap-2`}>
          <span role="img" aria-label="home">
            🏠
          </span>
          <span>Home</span>
          <span>&gt;</span>
          <span>Settings</span>
          <span>&gt;</span>
          <span className={isDarkMode ? "text-red-400" : "text-red-500"}>AI Settings</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* OpenAI Settings */}
        <div className={`${cardBase} rounded-2xl border p-6`}>
          <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
            Open AI settings
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`text-sm font-medium ${textPrimary}`}>OpenAI API key</label>
              <input
                type="text"
                value={openAiKey}
                onChange={(e) => setOpenAiKey(e.target.value)}
                placeholder="OpenAI API key"
                className={inputStyles}
              />
            </div>
            <div className="space-y-2">
              <label className={`text-sm font-medium ${textPrimary}`}>OpenAI text model</label>
              <select
                value={openAiModel}
                onChange={(e) => setOpenAiModel(e.target.value)}
                className={inputStyles}
              >
                <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                <option value="gpt-4o">gpt-4o</option>
                <option value="gpt-4.1-mini">gpt-4.1-mini</option>
              </select>
            </div>
          </div>
        </div>

        {/* Replicate Settings */}
        <div className={`${cardBase} rounded-2xl border p-6`}>
          <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
            Replicate AI Settings
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`text-sm font-medium ${textPrimary}`}>Replicate Model</label>
              <select
                value={replicateModel}
                onChange={(e) => setReplicateModel(e.target.value)}
                className={inputStyles}
              >
                <option>prompthero/openjourney</option>
                <option>stability-ai/stable-diffusion</option>
                <option>google/magika</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className={`text-sm font-medium ${textPrimary}`}>Replicate API Token</label>
              <input
                type="text"
                value={replicateToken}
                onChange={(e) => setReplicateToken(e.target.value)}
                placeholder="Replicate API Token"
                className={inputStyles}
              />
            </div>
            <div className="space-y-2">
              <label className={`text-sm font-medium ${textPrimary}`}>
                num_inference_steps
              </label>
              <input
                type="number"
                value={inferenceSteps}
                onChange={(e) => setInferenceSteps(e.target.value)}
                className={inputStyles}
                min={1}
                max={500}
              />
              <p className={`${textSecondary} text-xs`}>
                Number of denoising steps (minimum: 1; maximum: 500)
              </p>
            </div>
            <div className="space-y-2">
              <label className={`text-sm font-medium ${textPrimary}`}>guidance_scale</label>
              <input
                type="number"
                value={guidanceScale}
                onChange={(e) => setGuidanceScale(e.target.value)}
                className={inputStyles}
                min={1}
                max={20}
              />
              <p className={`${textSecondary} text-xs`}>
                Scale for classifier-free guidance (minimum: 1; maximum: 20)
              </p>
            </div>
            <div className="space-y-2">
              <label className={`text-sm font-medium ${textPrimary}`}>seed</label>
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Random seed. Leave blank to randomize."
                className={inputStyles}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Feature Settings */}
      <div className={`${cardBase} rounded-2xl border p-6 mt-6`}>
        <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>AI Settings</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {renderFeature(
            "AI Images System",
            "Allow AI to generate images.",
            imagesEnabled,
            () => setImagesEnabled((prev) => !prev),
            "AI Images API",
            imagesApi,
            setImagesApi
          )}
          {renderFeature(
            "AI Post System",
            "Allow AI to generate posts.",
            postsEnabled,
            () => setPostsEnabled((prev) => !prev),
            "AI Posts API",
            postsApi,
            setPostsApi
          )}
          {renderFeature(
            "AI Blog System",
            "Allow AI to generate articles.",
            blogEnabled,
            () => setBlogEnabled((prev) => !prev),
            "AI Blog API",
            blogApi,
            setBlogApi
          )}
          {renderFeature(
            "AI Avatar/Cover System",
            "Allow users to edit Avatar/Cover using AI.",
            avatarEnabled,
            () => setAvatarEnabled((prev) => !prev),
            "AI Avatar/Cover Images API",
            avatarApi,
            setAvatarApi
          )}
        </div>
      </div>

      {/* AI Credit Settings */}
      <div className={`${cardBase} rounded-2xl border p-6 mt-6`}>
        <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
          AI Credit Settings
        </h2>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className={`text-sm font-medium ${textPrimary}`}>Credit Price</label>
              <input
                type="number"
                value={creditPrice}
                onChange={(e) => setCreditPrice(e.target.value)}
                className={inputStyles}
              />
              <p className={`${textSecondary} text-xs`}>
                Credit Price Example: $1 = 10 credits
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-dashed border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    AI Images Credit System
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    AI Images Credit System.
                  </p>
                </div>
                <Toggle
                  enabled={imageCreditEnabled}
                  onToggle={() => setImageCreditEnabled((prev) => !prev)}
                />
              </div>
              <div className="space-y-2">
                <label className={`text-sm font-medium ${textPrimary}`}>
                  Generated Image Price
                </label>
                <input
                  type="number"
                  value={imagePrice}
                  onChange={(e) => setImagePrice(e.target.value)}
                  className={inputStyles}
                />
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-dashed border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    AI Text Credit System
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    AI Text Credit System.
                  </p>
                </div>
                <Toggle
                  enabled={textCreditEnabled}
                  onToggle={() => setTextCreditEnabled((prev) => !prev)}
                />
              </div>
              <div className="space-y-2">
                <label className={`text-sm font-medium ${textPrimary}`}>
                  Generated Word Price
                </label>
                <input
                  type="number"
                  value={textPrice}
                  onChange={(e) => setTextPrice(e.target.value)}
                  className={inputStyles}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSettingsPage;



