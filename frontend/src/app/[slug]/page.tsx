"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PageSlugRoute() {
  const { slug } = useParams();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if this slug is a page URL and redirect accordingly
    const checkAndRedirect = async () => {
      try {
        const actualSlug = Array.isArray(slug) ? slug[0] : slug;
        
        if (!actualSlug) {
          router.replace('/dashboard');
          return;
        }

        // Skip check for known routes
        const knownRoutes = ['dashboard', 'register', 'login', 'start-up', 'api'];
        if (knownRoutes.includes(actualSlug.toLowerCase())) {
          return; // Let Next.js handle these routes normally
        }

        console.log('Checking if slug is a page URL:', actualSlug);
        
        const response = await fetch(`${API_URL}/api/pages/${actualSlug}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const pageData = await response.json();
          console.log('Page found, redirecting to:', `/dashboard/pages/${actualSlug}`);
          // Redirect to dashboard page route with the slug/URL
          router.replace(`/dashboard/pages/${actualSlug}`);
        } else {
          console.log('Not a valid page, redirecting to dashboard');
          router.replace('/dashboard');
        }
      } catch (error) {
        console.error('Error checking page:', error);
        router.replace('/dashboard');
      } finally {
        setChecking(false);
      }
    };

    if (slug) {
      checkAndRedirect();
    } else {
      router.replace('/dashboard');
    }
  }, [slug, router]);

  // Show loading state while checking
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading page...</p>
        </div>
      </div>
    );
  }

  return null;
}

