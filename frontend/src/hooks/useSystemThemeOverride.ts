'use client';
import { useEffect } from 'react';

export const useSystemThemeOverride = () => {
  useEffect(() => {
  
    if (typeof window !== 'undefined') {

      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      // Override document color scheme - critical for mobile
      document.documentElement.style.colorScheme = 'light';
      document.documentElement.setAttribute('data-color-scheme', 'light');
      
      // Remove any dark mode classes
      document.documentElement.classList.remove('dark');
      
      // Mobile-specific meta tag overrides
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#ffffff');
      } else {
     
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = '#ffffff';
        document.head.appendChild(meta);
      }
      
  
      const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
      if (metaColorScheme) {
        metaColorScheme.setAttribute('content', 'light');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'color-scheme';
        meta.content = 'light';
        document.head.appendChild(meta);
      }
      
      // iOS-specific overrides
      if (isIOS) {
        // Override iOS status bar style
        const metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        if (metaStatusBar) {
          metaStatusBar.setAttribute('content', 'default');
        } else {
          const meta = document.createElement('meta');
          meta.name = 'apple-mobile-web-app-status-bar-style';
          meta.content = 'default';
          document.head.appendChild(meta);
        }
        
        // Override iOS theme
        const metaAppleTheme = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
        if (metaAppleTheme) {
          metaAppleTheme.setAttribute('content', 'yes');
        }
      }
      
      // Android-specific overrides
      if (isAndroid) {
        // Override Android theme
        document.documentElement.setAttribute('data-theme', 'light');
      }
      
      // Force light mode on body
      document.body.style.colorScheme = 'light';
      document.body.style.backgroundColor = '#f9fafb';
      document.body.style.color = '#111827';
      
      // Mobile viewport overrides
      if (isMobile) {
        document.body.style.setProperty('--mobile-theme', 'light');
        document.documentElement.style.setProperty('--mobile-color-scheme', 'light');
      }
      
      console.log(`🌞 System theme override applied - Mobile: ${isMobile}, iOS: ${isIOS}, Android: ${isAndroid}`);
    }
  }, []);

  // Return a function to force light mode if needed - enhanced for mobile
  const forceLightMode = () => {
    if (typeof window !== 'undefined') {
      // Detect mobile system
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      // Force light mode
      document.documentElement.style.colorScheme = 'light';
      document.documentElement.setAttribute('data-color-scheme', 'light');
      document.documentElement.classList.remove('dark');
      
      // Mobile-specific overrides
      if (isMobile) {
        document.body.style.setProperty('--mobile-theme', 'light');
        document.documentElement.style.setProperty('--mobile-color-scheme', 'light');
      }
      
      // iOS-specific
      if (isIOS) {
        document.documentElement.setAttribute('data-ios-theme', 'light');
      }
      
      // Android-specific
      if (isAndroid) {
        document.documentElement.setAttribute('data-theme', 'light');
      }
      
      document.body.style.backgroundColor = '#f9fafb';
      document.body.style.color = '#111827';
      
      console.log(`🌞 Force light mode applied - Mobile: ${isMobile}, iOS: ${isIOS}, Android: ${isAndroid}`);
    }
  };

  return { forceLightMode };
};

export default useSystemThemeOverride;
