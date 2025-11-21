'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminProfile } from '@/lib/db';
import { Loader2 } from 'lucide-react';

export default function EditorRedirect() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push('/admin/auth');
            return;
        }

        async function redirect() {
            try {
                const profile = await getAdminProfile();
                if (profile?.companies?.slug) {
                    router.push(`/admin/${profile.companies.slug}`);
                } else {
                    // No company yet, go to dashboard to create one
                    router.push('/admin');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                router.push('/admin');
            }
        }

        redirect();
    }, [user, authLoading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Redirecting to editor...</p>
            </div>
        </div>
    );
}
