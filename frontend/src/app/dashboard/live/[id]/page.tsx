"use client";
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function LiveStreamRedirect() {
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        if (params.id) {
            // Redirect to dashboard with query param to open modal
            router.push(`/dashboard?liveStreamId=${params.id}`);
        } else {
            router.push('/dashboard');
        }
    }, [params.id, router]);

    return (
        <div className="flex items-center justify-center h-screen bg-black text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                <p>Connecting to live stream...</p>
            </div>
        </div>
    );
}
