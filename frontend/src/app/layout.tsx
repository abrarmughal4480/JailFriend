import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/video-call.css";
import Head from 'next/head';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import { PrivacyProvider } from '@/contexts/PrivacyContext';
import { VideoCallProvider } from '@/contexts/VideoCallContext';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Jaifriend",
    description: "Jaifriend is a social media platform for friends to connect and share their stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // ALWAYS remove dark class first to prevent any flash
                  document.documentElement.classList.remove('dark');
                  
                  const themeMode = localStorage.getItem('themeMode');
                  const theme = localStorage.getItem('theme');
                  
                  // Determine if should be dark - NEVER check system preference
                  let shouldBeDark = false;
                  
                  if (themeMode === 'dark') {
                    shouldBeDark = true;
                  } else if (themeMode === 'system') {
                    // FORCE migrate system to light - NEVER follow system
                    shouldBeDark = false;
                    localStorage.setItem('themeMode', 'light');
                    localStorage.removeItem('theme');
                  } else if (theme === 'dark' && !themeMode) {
                    // Legacy support
                    shouldBeDark = true;
                    localStorage.setItem('themeMode', 'dark');
                    localStorage.removeItem('theme');
                  } else {
                    // Default to light - NEVER check system
                    shouldBeDark = false;
                    if (!themeMode) {
                      localStorage.setItem('themeMode', 'light');
                    }
                  }
                  
                  // Apply theme - but ONLY if explicitly dark
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    // Force remove dark class - don't follow system
                    document.documentElement.classList.remove('dark');
                  }
                  
                  // Watch for any code trying to add dark class when it shouldn't
                  // This prevents other scripts from overriding our theme
                  const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const currentThemeMode = localStorage.getItem('themeMode');
                        const shouldBeDarkNow = currentThemeMode === 'dark';
                        
                        if (!shouldBeDarkNow && document.documentElement.classList.contains('dark')) {
                          // Someone tried to add dark class but we're in light mode - remove it
                          document.documentElement.classList.remove('dark');
                        } else if (shouldBeDarkNow && !document.documentElement.classList.contains('dark')) {
                          // We're in dark mode but class was removed - add it back
                          document.documentElement.classList.add('dark');
                        }
                      }
                    });
                  });
                  
                  // Start observing the html element for class changes
                  observer.observe(document.documentElement, {
                    attributes: true,
                    attributeFilter: ['class']
                  });
                  
                  // Store observer globally so it persists
                  window.__themeObserver = observer;
                } catch (e) {
                  // Fallback: ALWAYS remove dark class and set to light
                  document.documentElement.classList.remove('dark');
                  try {
                    localStorage.setItem('themeMode', 'light');
                  } catch (e2) {}
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-gray-50 dark:bg-gray-900 overflow-x-hidden transition-colors duration-200 custom-scrollbar">
        <div className="w-full overflow-x-hidden">
          <DarkModeProvider>
            <PrivacyProvider>
              <VideoCallProvider>
                {children}
              </VideoCallProvider>
            </PrivacyProvider>
          </DarkModeProvider>
        </div>
      </body>
    </html>
  );
}
