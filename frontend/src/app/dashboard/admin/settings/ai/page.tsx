"use client";

import React, { useState, useEffect } from "react";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';

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
  const [cartesiaKey, setCartesiaKey] = useState("");
  const [sonioxKey, setSonioxKey] = useState("");

  const [creditPrice, setCreditPrice] = useState("100");
  const [imageCreditEnabled, setImageCreditEnabled] = useState(true);
  const [imagePrice, setImagePrice] = useState("10");
  const [textCreditEnabled, setTextCreditEnabled] = useState(true);
  const [textPrice, setTextPrice] = useState("1");
  const [initialUserCredits, setInitialUserCredits] = useState("0");
  const [translationPrice, setTranslationPrice] = useState("4");
  const [translationEnabled, setTranslationEnabled] = useState(true);
  const [coupons, setCoupons] = useState<{ code: string; type: string; value: number; description: string }[]>([]);
  const [newCoupon, setNewCoupon] = useState({ code: '', type: 'percentage', value: 0, description: '' });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const pageBg = isDarkMode ? "bg-gray-900" : "bg-gray-50";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-300" : "text-gray-600";
  const cardBase = isDarkMode
    ? "bg-gray-800 border-gray-700 shadow-gray-900/50"
    : "bg-white border-gray-200 shadow-md";

  const inputStyles = `w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${isDarkMode
    ? "bg-gray-900 border-gray-700 text-white focus:ring-red-500"
    : "bg-white border-gray-300 text-gray-900 focus:ring-red-400"
    }`;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/website-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.ai) {
          const aiSettings = data.data.ai;
          if (aiSettings.openai) {
            setOpenAiKey(aiSettings.openai.apiKey || '');
            setOpenAiModel(aiSettings.openai.model || 'gpt-3.5-turbo');
          }
          if (aiSettings.cartesia) {
            setCartesiaKey(aiSettings.cartesia.key || '');
          }
          if (aiSettings.soniox) {
            setSonioxKey(aiSettings.soniox.key || '');
          }

          if (aiSettings.replicate) {
            setReplicateModel(aiSettings.replicate.model || 'prompthero/openjourney');
            setReplicateToken(aiSettings.replicate.apiToken || '');
            setInferenceSteps(aiSettings.replicate.inferenceSteps || '1');
            setGuidanceScale(aiSettings.replicate.guidanceScale || '1');
            setSeed(aiSettings.replicate.seed || '');
          }
          if (aiSettings.imagesSystem) {
            setImagesEnabled(aiSettings.imagesSystem.enabled);
            setImagesApi(aiSettings.imagesSystem.api);
          }
          if (aiSettings.postSystem) {
            setPostsEnabled(aiSettings.postSystem.enabled);
            setPostsApi(aiSettings.postSystem.api);
          }
          if (aiSettings.blogSystem) {
            setBlogEnabled(aiSettings.blogSystem.enabled);
            setBlogApi(aiSettings.blogSystem.api);
          }
          if (aiSettings.avatarSystem) {
            setAvatarEnabled(aiSettings.avatarSystem.enabled);
            setAvatarApi(aiSettings.avatarSystem.api);
          }
          if (aiSettings.creditSystem) {
            setCreditPrice(aiSettings.creditSystem.creditPrice?.toString() || '100');
            if (aiSettings.creditSystem.image) {
              setImageCreditEnabled(aiSettings.creditSystem.image.enabled);
              setImagePrice(aiSettings.creditSystem.image.price?.toString() || '10');
            }
            if (aiSettings.creditSystem.text) {
              setTextCreditEnabled(aiSettings.creditSystem.text.enabled);
              setTextPrice(aiSettings.creditSystem.text.price?.toString() || '1');
            }
            setInitialUserCredits(aiSettings.creditSystem.initialUserCredits?.toString() || '0');
            if (aiSettings.creditSystem.translation) {
              setTranslationEnabled(aiSettings.creditSystem.translation.enabled);
              setTranslationPrice(aiSettings.creditSystem.translation.price?.toString() || '4');
            }
          }
          if (aiSettings.coupons) {
            setCoupons(aiSettings.coupons);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/website-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ai: {
            openai: {
              enabled: true,
              apiKey: openAiKey,
              model: openAiModel
            },
            cartesia: {
              enabled: true,
              key: cartesiaKey
            },
            soniox: {
              enabled: true,
              key: sonioxKey
            },
            replicate: {
              model: replicateModel,
              apiToken: replicateToken,
              inferenceSteps: inferenceSteps,
              guidanceScale: guidanceScale,
              seed: seed
            },
            imagesSystem: {
              enabled: imagesEnabled,
              api: imagesApi
            },
            postSystem: {
              enabled: postsEnabled,
              api: postsApi
            },
            blogSystem: {
              enabled: blogEnabled,
              api: blogApi
            },
            avatarSystem: {
              enabled: avatarEnabled,
              api: avatarApi
            },
            creditSystem: {
              initialUserCredits: Number(initialUserCredits),
              creditPrice: Number(creditPrice),
              image: {
                enabled: imageCreditEnabled,
                price: Number(imagePrice)
              },
              text: {
                enabled: textCreditEnabled,
                price: Number(textPrice)
              },
              translation: {
                enabled: translationEnabled,
                price: Number(translationPrice)
              }
            },
            coupons: coupons
          }
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Error saving settings' });
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({
    enabled,
    onToggle,
  }: {
    enabled: boolean;
    onToggle: () => void;
  }) => (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${enabled ? "bg-green-500" : "bg-red-500"
        }`}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${enabled ? "translate-x-8" : "translate-x-2"
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

  if (loading) {
    return (
      <div className={`min-h-screen ${pageBg} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

      {message.text && (
        <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

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
                <option value="gpt-4-turbo">gpt-4-turbo</option>
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

        {/* Cartesia Settings */}
        <div className={`${cardBase} rounded-2xl border p-6`}>
          <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
            Cartesia TTS Settings
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`text-sm font-medium ${textPrimary}`}>Cartesia API Key</label>
              <input
                type="text"
                value={cartesiaKey}
                onChange={(e) => setCartesiaKey(e.target.value)}
                placeholder="Cartesia API Key"
                className={inputStyles}
              />
            </div>
          </div>
        </div>

        {/* Soniox Settings */}
        <div className={`${cardBase} rounded-2xl border p-6`}>
          <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
            Soniox STT Settings
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`text-sm font-medium ${textPrimary}`}>Soniox API Key</label>
              <input
                type="text"
                value={sonioxKey}
                onChange={(e) => setSonioxKey(e.target.value)}
                placeholder="Soniox API Key"
                className={inputStyles}
              />
            </div>
          </div>
        </div>

        {/* Translation Settings */}
        <div className={`${cardBase} rounded-2xl border p-6`}>
          <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
            Real-Time Call Translation Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${textPrimary}`}>Enable Call Translation</p>
                <p className={`${textSecondary} text-xs`}>Allow users to use real-time translation during calls.</p>
              </div>
              <Toggle enabled={translationEnabled} onToggle={() => setTranslationEnabled(!translationEnabled)} />
            </div>
            <div className="space-y-2">
              <label className={`text-sm font-medium ${textPrimary}`}>Translation Price (per minute)</label>
              <input
                type="number"
                value={translationPrice}
                onChange={(e) => setTranslationPrice(e.target.value)}
                placeholder="4"
                className={inputStyles}
              />
              <p className={`${textSecondary} text-xs`}>Cost in credits per minute for real-time translation.</p>
            </div>
          </div>
        </div>

        {/* Coupon Management */}
        <div className={`${cardBase} rounded-2xl border p-6`}>
          <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
            Coupon Management
          </h2>
          <div className="space-y-6">
            <div className="space-y-4 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              <h3 className={`text-sm font-bold ${textPrimary}`}>Add New Coupon</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="CODE (e.g. SAVE10)"
                  className={inputStyles}
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                />
                <select
                  className={inputStyles}
                  value={newCoupon.type}
                  onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
                <input
                  type="number"
                  placeholder="Value"
                  className={inputStyles}
                  value={newCoupon.value}
                  onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
                />
                <input
                  type="text"
                  placeholder="Description"
                  className={inputStyles}
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                />
              </div>
              <button
                onClick={() => {
                  if (newCoupon.code && newCoupon.value > 0) {
                    setCoupons([...coupons, newCoupon]);
                    setNewCoupon({ code: '', type: 'percentage', value: 0, description: '' });
                  }
                }}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold"
              >
                Add Coupon
              </button>
            </div>

            <div className="space-y-3">
              <h3 className={`text-sm font-bold ${textPrimary}`}>Active Coupons</h3>
              {coupons.length === 0 ? (
                <p className={`${textSecondary} text-xs italic`}>No active coupons.</p>
              ) : (
                <div className="space-y-2">
                  {coupons.map((coupon, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                      <div>
                        <p className={`font-bold text-sm ${textPrimary}`}>{coupon.code}</p>
                        <p className={`${textSecondary} text-xs`}>
                          {coupon.type === 'percentage' ? `${coupon.value}% Off` : `Fixed ${coupon.value} Off`} • {coupon.description || 'No description'}
                        </p>
                      </div>
                      <button
                        onClick={() => setCoupons(coupons.filter((_, i) => i !== idx))}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                Credit Price (Cost of 1 credit in wallet currency)
              </p>
            </div>
            <div className="space-y-2">
              <label className={`text-sm font-medium ${textPrimary}`}>Initial User Credits</label>
              <input
                type="number"
                value={initialUserCredits}
                onChange={(e) => setInitialUserCredits(e.target.value)}
                className={inputStyles}
              />
              <p className={`${textSecondary} text-xs`}>
                Credits assigned to new users upon signup.
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

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div >
  );
};

export default AiSettingsPage;
