"use client";

import React, { useState } from "react";
import { useDarkMode } from "@/contexts/DarkModeContext";
import Link from "next/link";

const PostSettingsPage = () => {
  const { isDarkMode } = useDarkMode();

  // Social Share Links
  const [twitterEnabled, setTwitterEnabled] = useState(true);
  const [facebookEnabled, setFacebookEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [pinterestEnabled, setPinterestEnabled] = useState(true);
  const [linkedinEnabled, setLinkedinEnabled] = useState(false);
  const [telegramEnabled, setTelegramEnabled] = useState(false);

  // Adult Images Settings
  const [adultImagesFiltration, setAdultImagesFiltration] = useState(false);
  const [actionForAdultImages, setActionForAdultImages] = useState("blur");
  const [visionApiKey, setVisionApiKey] = useState("");

  // General Posts & Comments Settings
  const [memoriesSystem, setMemoriesSystem] = useState(true);
  const [watermarkOverlay, setWatermarkOverlay] = useState(false);
  const [shoutBoxSystem, setShoutBoxSystem] = useState(true);
  const [coloredPosts, setColoredPosts] = useState(true);
  const [postApprovalSystem, setPostApprovalSystem] = useState(false);
  const [popularPostsComments, setPopularPostsComments] = useState(false);
  const [commentReports, setCommentReports] = useState(true);
  const [location, setLocation] = useState(true);
  const [feelings, setFeelings] = useState(true);
  const [poll, setPoll] = useState(true);
  const [maxCharactersLength, setMaxCharactersLength] = useState("640");
  const [newsfeedPosts, setNewsfeedPosts] = useState("show-all");
  const [secondPostButton, setSecondPostButton] = useState(false);
  const [reactionSystem, setReactionSystem] = useState("default");
  const [postLimitCount, setPostLimitCount] = useState("40");

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

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"} p-6`}
    >
      {/* Header */}
      <div className="mb-6">
        <h1
          className={`text-3xl font-bold ${textPrimary} mb-2`}
        >
          Post Settings
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
          <span>Posts</span>
          <span>&gt;</span>
          <span className={isDarkMode ? "text-red-400" : "text-red-500"}>
            Post Settings
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Social Share Links */}
          <div className={`${cardBase} rounded-xl p-6`}>
            <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
              Social Share Links
            </h2>
            <div className="space-y-6">
              {/* Twitter */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Twitter
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    Share posts to Twitter.
                  </p>
                </div>
                <Toggle
                  enabled={twitterEnabled}
                  onToggle={() => setTwitterEnabled((prev) => !prev)}
                />
              </div>

              {/* Facebook */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Facebook
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    Share posts to Facebook.
                  </p>
                </div>
                <Toggle
                  enabled={facebookEnabled}
                  onToggle={() => setFacebookEnabled((prev) => !prev)}
                />
              </div>

              {/* WhatsApp */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    What's app
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    Share posts to What's app.
                  </p>
                </div>
                <Toggle
                  enabled={whatsappEnabled}
                  onToggle={() => setWhatsappEnabled((prev) => !prev)}
                />
              </div>

              {/* Pinterest */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Pinterest
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    Share posts to Pinterest.
                  </p>
                </div>
                <Toggle
                  enabled={pinterestEnabled}
                  onToggle={() => setPinterestEnabled((prev) => !prev)}
                />
              </div>

              {/* LinkedIn */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Linkedin
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    Share posts to Linkedin.
                  </p>
                </div>
                <Toggle
                  enabled={linkedinEnabled}
                  onToggle={() => setLinkedinEnabled((prev) => !prev)}
                />
              </div>

              {/* Telegram */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Telegram
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    Share posts to Telegram.
                  </p>
                </div>
                <Toggle
                  enabled={telegramEnabled}
                  onToggle={() => setTelegramEnabled((prev) => !prev)}
                />
              </div>
            </div>
          </div>

          {/* Adult Images Settings */}
          <div className={`${cardBase} rounded-xl p-6`}>
            <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
              Adult Images Settings
            </h2>
            <div className="space-y-6">
              {/* Adult Images Filtration */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Adult Images Filtration
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    Enable this feature to blur or delete posts that contain
                    adult contents using Google AI.
                  </p>
                </div>
                <Toggle
                  enabled={adultImagesFiltration}
                  onToggle={() =>
                    setAdultImagesFiltration((prev) => !prev)
                  }
                />
              </div>

              {/* Action For Adult Images */}
              {adultImagesFiltration && (
                <>
                  <div>
                    <label
                      className={`block text-sm font-medium ${textPrimary} mb-2`}
                    >
                      Action For Adult Images
                    </label>
                    <select
                      value={actionForAdultImages}
                      onChange={(e) => setActionForAdultImages(e.target.value)}
                      className={`w-full px-3 py-2 ${
                        isDarkMode
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="blur">Blur The Image</option>
                      <option value="delete">Delete The Image</option>
                    </select>
                    <p className={`${textSecondary} text-xs mt-1`}>
                      Choose the action to do once an adult image was found.
                    </p>
                  </div>

                  {/* Vision API Key */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${textPrimary} mb-2`}
                    >
                      Vision API key
                    </label>
                    <input
                      type="text"
                      value={visionApiKey}
                      onChange={(e) => setVisionApiKey(e.target.value)}
                      placeholder="Your Google Vision API Key"
                      className={`w-full px-3 py-2 ${
                        isDarkMode
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                    />
                    <p className={`${textSecondary} text-xs mt-1`}>
                      Your Google Vision API Key.
                    </p>
                    <div
                      className={`mt-3 p-4 rounded-lg ${
                        isDarkMode
                          ? "bg-gray-700/50 text-gray-300"
                          : "bg-blue-50 text-blue-800"
                      } text-xs`}
                    >
                      <p className="font-semibold mb-2">
                        Please follow the steps below to activate the system:
                      </p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>
                          Select or create a GCP project from{" "}
                          <a
                            href="https://console.cloud.google.com/projectselector2"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            Here
                          </a>
                        </li>
                        <li>
                          Make sure that billing is enabled for your project{" "}
                          <a
                            href="https://console.cloud.google.com/billing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            From Here
                          </a>{" "}
                          Or Create a new billing account
                        </li>
                        <li>
                          Enable the Cloud Vision API.{" "}
                          <a
                            href="https://console.cloud.google.com/apis/library/vision.googleapis.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            From Here
                          </a>
                        </li>
                        <li>
                          Create an API key:
                          <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                            <li>
                              Navigate to the APIs & Services → Credentials
                              panel in GCP Console.
                            </li>
                            <li>
                              Select Create credentials, then select API key from
                              the dropdown menu.
                            </li>
                            <li>
                              Click the Create button. The API key created dialog
                              box displays your newly created key.
                            </li>
                          </ul>
                        </li>
                      </ol>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* General Posts & Comments Settings */}
          <div className={`${cardBase} rounded-xl p-6`}>
            <h2 className={`text-2xl font-semibold ${textPrimary} mb-6`}>
              General Posts & Comments Settings
            </h2>
            <div className="space-y-6">
              {/* Memories System */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Memories System
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    Show post memories for users, on a yearly basis.
                  </p>
                </div>
                <Toggle
                  enabled={memoriesSystem}
                  onToggle={() => setMemoriesSystem((prev) => !prev)}
                />
              </div>

              {/* Watermark Overlay */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Watermark Overlay
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    This feature will create an overlay watermark over images &
                    videos.
                    <br />
                    The used icon path is: ./themes/wondertag/img/icon.png
                  </p>
                </div>
                <Toggle
                  enabled={watermarkOverlay}
                  onToggle={() => setWatermarkOverlay((prev) => !prev)}
                />
              </div>

              {/* Shout Box System */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Shout Box System
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    Allow users to create posts anonymously.
                  </p>
                </div>
                <Toggle
                  enabled={shoutBoxSystem}
                  onToggle={() => setShoutBoxSystem((prev) => !prev)}
                />
              </div>

              {/* Colored Posts */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Colored Posts
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    Users can create colored posts.
                    <br />
                    You can manage colored version from{" "}
                    <Link
                      href="/dashboard/admin/settings/posts/colored"
                      className="underline"
                    >
                      Manage Colored Posts
                    </Link>
                  </p>
                </div>
                <Toggle
                  enabled={coloredPosts}
                  onToggle={() => setColoredPosts((prev) => !prev)}
                />
              </div>

              {/* Post Approval System */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Post Approval System
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    The post will be sent to admins and moderators for approval
                    before publishing.
                  </p>
                </div>
                <Toggle
                  enabled={postApprovalSystem}
                  onToggle={() => setPostApprovalSystem((prev) => !prev)}
                />
              </div>

              {/* Popular Posts & Comments */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Popular Posts & Comments
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    Show popular posts & comments this week.
                    <br />
                    When enabled, you can see the link in left sidebar on the
                    home page.
                  </p>
                </div>
                <Toggle
                  enabled={popularPostsComments}
                  onToggle={() =>
                    setPopularPostsComments((prev) => !prev)
                  }
                />
              </div>

              {/* Comment Reports */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Comment Reports
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    Allow users to report comments.
                  </p>
                </div>
                <Toggle
                  enabled={commentReports}
                  onToggle={() => setCommentReports((prev) => !prev)}
                />
              </div>

              {/* Location */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Location
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    Allow users to post location.
                  </p>
                </div>
                <Toggle
                  enabled={location}
                  onToggle={() => setLocation((prev) => !prev)}
                />
              </div>

              {/* Feelings */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Feelings
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    Allow users to post feelings.
                  </p>
                </div>
                <Toggle
                  enabled={feelings}
                  onToggle={() => setFeelings((prev) => !prev)}
                />
              </div>

              {/* Poll */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Poll
                  </p>
                  <p className={`${textSecondary} text-sm`}>
                    Allow users to post poll.
                  </p>
                </div>
                <Toggle
                  enabled={poll}
                  onToggle={() => setPoll((prev) => !prev)}
                />
              </div>

              {/* Max Allowed Characters Length */}
              <div>
                <label
                  className={`block text-sm font-medium ${textPrimary} mb-2`}
                >
                  Max Allowed Characters Length
                </label>
                <input
                  type="text"
                  value={maxCharactersLength}
                  onChange={(e) => setMaxCharactersLength(e.target.value)}
                  placeholder="640 Characters"
                  className={`w-full px-3 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                />
                <p className={`${textSecondary} text-xs mt-1`}>
                  Set the max allowed characters for posts, comments, replies
                  and messages.
                </p>
              </div>

              {/* NewsFeed Posts */}
              <div>
                <label
                  className={`block text-sm font-medium ${textPrimary} mb-2`}
                >
                  NewsFeed Posts
                </label>
                <select
                  value={newsfeedPosts}
                  onChange={(e) => setNewsfeedPosts(e.target.value)}
                  className={`w-full px-3 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="show-all">Show All Posts</option>
                  <option value="show-following">Show Following Posts Only</option>
                  <option value="show-trending">Show Trending Posts</option>
                </select>
                <p className={`${textSecondary} text-xs mt-1`}>
                  Set how the newsfeed posts will appear for the users.
                </p>
              </div>

              {/* Second Post Button */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    Second Post Button
                  </p>
                </div>
                <Toggle
                  enabled={secondPostButton}
                  onToggle={() => setSecondPostButton((prev) => !prev)}
                />
              </div>

              {/* Reaction System */}
              <div>
                <label
                  className={`block text-sm font-medium ${textPrimary} mb-2`}
                >
                  Reaction System
                </label>
                <select
                  value={reactionSystem}
                  onChange={(e) => setReactionSystem(e.target.value)}
                  className={`w-full px-3 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="default">Default (Like Only)</option>
                  <option value="reactions">Reactions (Like, Love, etc.)</option>
                  <option value="custom">Custom Reactions</option>
                </select>
                <p className={`${textSecondary} text-xs mt-1`}>
                  Choose what type of reaction you want to use beside the like
                  button. You can manage reactions{" "}
                  <Link
                    href="/dashboard/admin/settings/posts/reactions"
                    className="underline"
                  >
                    Here
                  </Link>
                </p>
              </div>

              {/* Post Limit Count */}
              <div>
                <label
                  className={`block text-sm font-medium ${textPrimary} mb-2`}
                >
                  Post Limit Count
                </label>
                <input
                  type="text"
                  value={postLimitCount}
                  onChange={(e) => setPostLimitCount(e.target.value)}
                  placeholder="40"
                  className={`w-full px-3 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500`}
                />
                <p className={`${textSecondary} text-xs mt-1`}>
                  How many posts a user can create in one hour?
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostSettingsPage;



