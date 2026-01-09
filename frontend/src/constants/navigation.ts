
export interface MenuItem {
    name: string;
    icon: string;
    color: string;
    href: string;
}

export interface SettingsMenuItem {
    name: string;
    icon: string;
    href: string;
}

export interface AdminMenuItem {
    name: string;
    icon: string;
    active: boolean;
    hasPlus: boolean;
    href: string;
    section?: string;
    isSubItem?: boolean;
    subSection?: string;
}

export const menuSections = {
    me: [
        { name: "Messages", icon: "💬", color: "bg-blue-100", href: "/dashboard/messages" },
    ],
    community: [],
    explore: [
        { name: "News Feed", icon: "📰", color: "bg-blue-100", href: "/dashboard" },
        { name: "Albums", icon: "📸", color: "bg-green-100", href: "/dashboard/albums" },
        { name: "Saved Posts", icon: "💾", color: "bg-purple-100", href: "/dashboard/saved" },
        { name: "Reels", icon: "🎬", color: "bg-orange-100", href: "/dashboard/reels" },
        { name: "Explore  ", icon: "📸", color: "bg-green-100", href: "/dashboard/explore" },
        { name: "Market", icon: "🛒", color: "bg-green-100", href: "/dashboard/market" },
        { name: "My Products", icon: "📦", color: "bg-yellow-100", href: "/dashboard/products" },
        { name: "P2P Services", icon: "🤝", color: "bg-indigo-100", href: "/dashboard/p2p" },
        { name: "My Groups", icon: "👥", color: "bg-purple-100", href: "/dashboard/groups" },
        { name: "My Pages", icon: "📄", color: "bg-gray-100", href: "/dashboard/pages" },
        { name: "Popular Posts", icon: "🔥", color: "bg-red-100", href: "/dashboard/popular" },
    ]
};

export const adminMenuItems: AdminMenuItem[] = [
    { name: "Dashboard", icon: "⬜", active: false, hasPlus: false, href: "/dashboard/admin" },
    { name: "Settings", icon: "⚙️", active: true, hasPlus: true, section: "settings", href: "/dashboard/admin/settings" },
    { name: "Website Mode", icon: "🌐", active: true, hasPlus: false, isSubItem: true, section: "settings", href: "/dashboard/admin/settings/website-mode" },
    { name: "General Configuration", icon: "⚙️", active: false, hasPlus: false, isSubItem: true, section: "settings", href: "/dashboard/admin/settings/general" },
    { name: "Website Information", icon: "ℹ️", active: false, hasPlus: false, isSubItem: true, section: "settings", href: "/dashboard/admin/settings/info" },
    { name: "File Upload Configuration", icon: "📁", active: false, hasPlus: false, isSubItem: true, section: "settings", href: "/dashboard/admin/settings/upload" },
    { name: "E-mail & SMS Setup", icon: "📧", active: false, hasPlus: false, isSubItem: true, section: "settings", href: "/dashboard/admin/settings/email" },
    { name: "Chat & Video/Audio", icon: "💬", active: false, hasPlus: false, isSubItem: true, section: "settings", href: "/dashboard/admin/settings/chat" },
    { name: "Social Login Settings", icon: "🔗", active: false, hasPlus: false, isSubItem: true, section: "settings", href: "/dashboard/admin/settings/social" },
    { name: "NodeJS Settings", icon: "🟢", active: false, hasPlus: false, isSubItem: true, section: "settings", href: "/dashboard/admin/settings/nodejs" },
    { name: "CronJob Settings", icon: "⏰", active: false, hasPlus: false, isSubItem: true, section: "settings", href: "/dashboard/admin/settings/cronjob" },
    { name: "AI Settings", icon: "🤖", active: false, hasPlus: false, isSubItem: true, section: "settings", href: "/dashboard/admin/settings/ai" },
    { name: "Posts Settings", icon: "📝", active: false, hasPlus: true, isSubItem: true, section: "settings", subSection: "postSettings", href: "/dashboard/admin/settings/posts" },
    { name: "Manage Colored Posts", icon: "🎨", active: false, hasPlus: false, isSubItem: true, section: "settings", subSection: "postSettings", href: "/dashboard/admin/settings/posts/colored" },
    { name: "Post Reactions", icon: "😊", active: false, hasPlus: false, isSubItem: true, section: "settings", subSection: "postSettings", href: "/dashboard/admin/settings/posts/reactions" },
    { name: "Setup Live Streaming", icon: "📡", active: false, hasPlus: false, isSubItem: true, section: "settings", subSection: "postSettings", href: "/dashboard/admin/settings/posts/live-streaming" },
    { name: "Manage Features", icon: "☰", active: false, hasPlus: true, section: "manageFeatures", href: "/dashboard/admin/manage-features" },
    { name: "Enable / Disable Features", icon: "🔧", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/enable-disable" },
    { name: "Applications", icon: "📱", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/applications" },
    { name: "Pages", icon: "📄", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/pages" },
    { name: "Groups", icon: "👥", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/groups" },
    { name: "Posts", icon: "📝", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/posts" },
    { name: "Fundings", icon: "💰", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/fundings" },
    { name: "Jobs", icon: "💼", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/jobs" },
    { name: "Offers", icon: "🎁", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/offers" },
    { name: "Articles (Blog)", icon: "📰", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/articles" },
    { name: "Events", icon: "📅", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/events" },
    { name: "Content Monetization", icon: "💳", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", href: "/dashboard/admin/manage-features/monetization" },
    { name: "Store", icon: "🏪", active: false, hasPlus: true, isSubItem: true, section: "manageFeatures", subSection: "store", href: "/dashboard/admin/manage-features/store" },
    { name: "Store Settings", icon: "⚙️", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "store", href: "/dashboard/admin/manage-features/store/settings" },
    { name: "Manage Products", icon: "📦", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "store", href: "/dashboard/admin/manage-features/store/products" },
    { name: "Manage Orders", icon: "🛒", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "store", href: "/dashboard/admin/manage-features/store/orders" },
    { name: "Manage Reviews", icon: "⭐", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "store", href: "/dashboard/admin/manage-features/store/reviews" },
    { name: "Forums", icon: "💬", active: false, hasPlus: true, isSubItem: true, section: "manageFeatures", subSection: "forums", href: "/dashboard/admin/manage-features/forums" },
    { name: "Manage Forums Sections", icon: "📋", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "forums", href: "/dashboard/admin/manage-features/forums/sections" },
    { name: "Manage Forums", icon: "💬", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "forums", href: "/dashboard/admin/manage-features/forums/manage" },
    { name: "Manage Threads", icon: "🧵", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "forums", href: "/dashboard/admin/manage-features/forums/threads" },
    { name: "Manage Replies", icon: "💭", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "forums", href: "/dashboard/admin/manage-features/forums/replies" },
    { name: "Create New Section", icon: "➕", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "forums", href: "/dashboard/admin/manage-features/forums/create-section" },
    { name: "Create New Forum", icon: "✨", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "forums", href: "/dashboard/admin/manage-features/forums/create-forum" },
    { name: "Movies", icon: "🎬", active: false, hasPlus: true, isSubItem: true, section: "manageFeatures", subSection: "movies", href: "/dashboard/admin/manage-features/movies" },
    { name: "Manage Movies", icon: "🎬", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "movies", href: "/dashboard/admin/manage-features/movies/manage" },
    { name: "Add New Movie", icon: "🎥", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "movies", href: "/dashboard/admin/manage-features/movies/add" },
    { name: "Games", icon: "🎮", active: false, hasPlus: true, isSubItem: true, section: "manageFeatures", subSection: "games", href: "/dashboard/admin/manage-features/games" },
    { name: "Manage Games", icon: "🎮", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "games", href: "/dashboard/admin/manage-features/games/manage" },
    { name: "Add New Game", icon: "🕹️", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "games", href: "/dashboard/admin/manage-features/games/add" },
    { name: "Categories", icon: "🏷️", active: false, hasPlus: true, isSubItem: true, section: "manageFeatures", subSection: "categories", href: "/dashboard/admin/manage-features/categories" },
    { name: "Pages Categories", icon: "📑", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "categories", href: "/dashboard/admin/manage-features/categories/pages" },
    { name: "Pages Sub Categories", icon: "📑", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "categories", href: "/dashboard/admin/manage-features/categories/pages-sub" },
    { name: "Groups Categories", icon: "👥", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "categories", href: "/dashboard/admin/manage-features/categories/groups" },
    { name: "Groups Sub Categories", icon: "👥", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "categories", href: "/dashboard/admin/manage-features/categories/groups-sub" },
    { name: "Blogs Categories", icon: "📝", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "categories", href: "/dashboard/admin/manage-features/categories/blogs" },
    { name: "Products Categories", icon: "📦", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "categories", href: "/dashboard/admin/manage-features/categories/products" },
    { name: "Products Sub Categories", icon: "📦", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "categories", href: "/dashboard/admin/manage-features/categories/products-sub" },
    { name: "Job Categories", icon: "💼", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "categories", href: "/dashboard/admin/manage-features/categories/jobs" },
    { name: "Custom Fields", icon: "📝", active: false, hasPlus: true, isSubItem: true, section: "manageFeatures", subSection: "customFields", href: "/dashboard/admin/manage-features/custom-fields" },
    { name: "Custom Users Fields", icon: "👤", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "customFields", href: "/dashboard/admin/manage-features/custom-fields/users" },
    { name: "Custom Pages Fields", icon: "📄", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "customFields", href: "/dashboard/admin/manage-features/custom-fields/pages" },
    { name: "Custom Groups Fields", icon: "👥", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "customFields", href: "/dashboard/admin/manage-features/custom-fields/groups" },
    { name: "Custom Products Fields", icon: "📦", active: false, hasPlus: false, isSubItem: true, section: "manageFeatures", subSection: "customFields", href: "/dashboard/admin/manage-features/custom-fields/products" },
    { name: "P2P Categories", icon: "🏷️", active: false, hasPlus: false, href: "/dashboard/admin/p2p/categories" },
    { name: "Languages", icon: "🌐", active: false, hasPlus: true, section: "languages", href: "/dashboard/admin/languages" },
    { name: "Add New Language & Keys", icon: "➕", active: false, hasPlus: false, isSubItem: true, section: "languages", href: "/dashboard/admin/languages/add" },
    { name: "Manage Languages", icon: "🔧", active: false, hasPlus: false, isSubItem: true, section: "languages", href: "/dashboard/admin/languages/manage" },
    { name: "Users", icon: "👤", active: false, hasPlus: true, section: "users", href: "/dashboard/admin/users" },
    { name: "Manage Users", icon: "👥", active: false, hasPlus: false, isSubItem: true, section: "users", href: "/dashboard/admin/users/manage" },
    { name: "Online Users", icon: "🟢", active: false, hasPlus: false, isSubItem: true, section: "users", href: "/dashboard/admin/users/online" },
    { name: "Manage User Stories / Status", icon: "📖", active: false, hasPlus: false, isSubItem: true, section: "users", href: "/dashboard/admin/users/stories" },
    { name: "Manage Verification Requests", icon: "✅", active: false, hasPlus: false, isSubItem: true, section: "users", href: "/dashboard/admin/users/verification" },
    { name: "Payments & Ads", icon: "💰", active: false, hasPlus: true, section: "payments", href: "/dashboard/admin/payments" },
    { name: "Payment Configuration", icon: "⚙️", active: false, hasPlus: false, isSubItem: true, section: "payments", href: "/dashboard/admin/payments/config" },
    { name: "Advertisement Settings", icon: "📢", active: false, hasPlus: false, isSubItem: true, section: "payments", href: "/dashboard/admin/payments/ads" },
    { name: "Manage Currencies", icon: "💱", active: false, hasPlus: false, isSubItem: true, section: "payments", href: "/dashboard/admin/payments/currencies" },
    { name: "Manage Site Advertisements", icon: "🏢", active: false, hasPlus: false, isSubItem: true, section: "payments", href: "/dashboard/admin/payments/site-ads" },
    { name: "Manage User Advertisements", icon: "👤", active: false, hasPlus: false, isSubItem: true, section: "payments", href: "/dashboard/admin/payments/user-ads" },
    { name: "Manage Bank Receipts", icon: "🏦", active: false, hasPlus: false, isSubItem: true, section: "payments", href: "/dashboard/admin/payments/receipts" },
    { name: "Pro System", icon: "⭐", active: false, hasPlus: true, section: "proSystem", href: "/dashboard/admin/pro-system" },
    { name: "Pro System Settings", icon: "⚙️", active: false, hasPlus: false, isSubItem: true, section: "proSystem", href: "/dashboard/admin/pro-system/settings" },
    { name: "Manage Payments", icon: "💳", active: false, hasPlus: false, isSubItem: true, section: "proSystem", href: "/dashboard/admin/pro-system/payments" },
    { name: "Manage Members", icon: "👥", active: false, hasPlus: false, isSubItem: true, section: "proSystem", href: "/dashboard/admin/pro-system/members" },
    { name: "Manage Refund Requests", icon: "↩️", active: false, hasPlus: false, isSubItem: true, section: "proSystem", href: "/dashboard/admin/pro-system/refunds" },
    { name: "Design", icon: "🎨", active: false, hasPlus: true, section: "design", href: "/dashboard/admin/design" },
    { name: "Themes", icon: "🎭", active: false, hasPlus: false, isSubItem: true, section: "design", href: "/dashboard/admin/design/themes" },
    { name: "Change Site Design", icon: "🎨", active: false, hasPlus: false, isSubItem: true, section: "design", href: "/dashboard/admin/design/site" },
    { name: "Custom JS / CSS", icon: "💻", active: false, hasPlus: false, isSubItem: true, section: "design", href: "/dashboard/admin/design/custom" },
    { name: "Tools", icon: "🔧", active: false, hasPlus: true, section: "tools", href: "/dashboard/admin/tools" },
    { name: "Manage Emails", icon: "📧", active: true, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/emails" },
    { name: "Users Invitation", icon: "📨", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/invitations" },
    { name: "Send E-mail", icon: "📤", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/send-email" },
    { name: "Announcements", icon: "📢", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/announcements" },
    { name: "Auto Delete Data", icon: "🗑️", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/auto-delete" },
    { name: "Auto Friend", icon: "🤝", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/auto-friend" },
    { name: "Auto Page Like", icon: "👍", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/auto-like" },
    { name: "Auto Group Join", icon: "👥", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/auto-join" },
    { name: "Fake User Generator", icon: "👤", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/fake-users" },
    { name: "Mass Notifications", icon: "📢", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/notifications" },
    { name: "BlackList", icon: "🚫", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/blacklist" },
    { name: "Generate SiteMap", icon: "🗺️", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/sitemap" },
    { name: "Invitation Codes", icon: "🎫", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/codes" },
    { name: "Backup SQL & Files", icon: "💾", active: false, hasPlus: false, isSubItem: true, section: "tools", href: "/dashboard/admin/tools/backup" },
    { name: "Pages", icon: "📄", active: false, hasPlus: true, section: "pages", href: "/dashboard/admin/pages" },
    { name: "Manage Custom Pages", icon: "📝", active: false, hasPlus: false, isSubItem: true, section: "pages", href: "/dashboard/admin/pages/custom" },
    { name: "Manage Terms Pages", icon: "📋", active: false, hasPlus: false, isSubItem: true, section: "pages", href: "/dashboard/admin/pages/terms" },
    { name: "Reports", icon: "⚠️", active: false, hasPlus: true, section: "reports", href: "/dashboard/admin/reports" },
    { name: "Manage Reports", icon: "📊", active: false, hasPlus: false, isSubItem: true, section: "reports", href: "/dashboard/admin/reports/manage" },
    { name: "Manage Users Reports", icon: "👥", active: false, hasPlus: false, isSubItem: true, section: "reports", href: "/dashboard/admin/reports/users" },
    { name: "API Settings", icon: "↔️", active: false, hasPlus: true, section: "apiSettings", href: "/dashboard/admin/api-settings" },
    { name: "Manage API Server Key", icon: "🔑", active: false, hasPlus: false, isSubItem: true, section: "apiSettings", href: "/dashboard/admin/api-settings/keys" },
    { name: "Push Notifications Settings", icon: "🔔", active: true, hasPlus: false, isSubItem: true, section: "apiSettings", href: "/dashboard/admin/api-settings/push" },
    { name: "Verify Applications", icon: "✅", active: false, hasPlus: false, isSubItem: true, section: "apiSettings", href: "/dashboard/admin/api-settings/verify" },
    { name: "3rd Party Scripts", icon: "📜", active: false, hasPlus: false, isSubItem: true, section: "apiSettings", href: "/dashboard/admin/api-settings/scripts" },
    { name: "System Status", icon: "ℹ️", active: false, hasPlus: false, href: "/dashboard/admin/system-status" },
    { name: "Changelogs", icon: "🕐", active: false, hasPlus: false, href: "/dashboard/admin/changelogs" },
    { name: "FAQs", icon: "⋮", active: false, hasPlus: false, href: "/dashboard/admin/faqs" }
];

export const settingsSections = {
    settings: [
        { name: "General", icon: "⚙️", href: "/dashboard/settings" },
        { name: "Notification Settings", icon: "🔔", href: "/dashboard/settings/notifications" },
        { name: "Invitation Links", icon: "🔗", href: "/dashboard/settings/invitations" },
        { name: "Social Links", icon: "📋", href: "/dashboard/settings/social" },
    ],
    profile: [
        { name: "Profile Settings", icon: "👤", href: "/dashboard/settings/profile" },
        { name: "My Addresses", icon: "📍", href: "/dashboard/settings/addresses" },
        { name: "Avatar & Cover", icon: "📸", href: "/dashboard/settings/avatar" },
        { name: "Verification", icon: "✅", href: "/dashboard/settings/verification" },
        { name: "My Information", icon: "📄", href: "/dashboard/settings/info" },
    ],
    security: [
        { name: "Privacy", icon: "🛡️", href: "/dashboard/settings/privacy" },
        { name: "Password", icon: "🔒", href: "/dashboard/settings/password" },
    ]
};
