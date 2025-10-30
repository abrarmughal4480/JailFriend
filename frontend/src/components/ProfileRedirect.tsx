'use client';
import { useEffect } from 'react';

interface ProfileRedirectProps {
  userId?: string;
  shouldRedirect?: boolean;
}

export default function ProfileRedirect({ userId, shouldRedirect = true }: ProfileRedirectProps) {
  useEffect(() => {
    if (shouldRedirect && userId) {
      // Open profile in new tab instead of redirecting
      window.open(`/dashboard/profile/${userId}`, '_blank');
    }
  }, [userId, shouldRedirect]);

  return null; // This component doesn't render anything
} 
