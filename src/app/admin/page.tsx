'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminProfile, signOut, createCompany, linkAdminToCompany } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogOut, Building2, Plus, Settings, X } from 'lucide-react';

interface AdminProfile {
    id: string;
    email: string;
    full_name: string;
    company_id: string | null;
    companies?: {
        id: string;
        name: string;
        slug: string;
    };
}

export default function AdminDashboard() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<AdminProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Create Company State
    const [isCreating, setIsCreating] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [newCompanySlug, setNewCompanySlug] = useState('');
    const [creatingLoading, setCreatingLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/admin/auth');
            return;
        }

        if (user) {
            loadProfile();
        }
    }, [user, authLoading, router]);

    const loadProfile = async () => {
        try {
            const data = await getAdminProfile();
            setProfile(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push('/admin/auth');
        } catch (err: any) {
            setError(err.message || 'Failed to sign out');
        }
    };

    const handleCompanyNameChange = (value: string) => {
        setNewCompanyName(value);
        const slug = value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        setNewCompanySlug(slug);
    };

    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setCreatingLoading(true);

        try {
            if (!user) return;

            // 1. Create the company
            const company = await createCompany(newCompanyName, newCompanySlug);

            // 2. Link admin to company
            await linkAdminToCompany(user.id, company.id);

            // 3. Reload profile
            await loadProfile();
            setIsCreating(false);
        } catch (err: any) {
            setError(err.message || 'Failed to create company');
        } finally {
            setCreatingLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
            {/* Header */}
            <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Admin Dashboard</h1>
                            <p className="text-sm text-muted-foreground">
                                Welcome, {profile?.full_name || user.email}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSignOut}
                        className="gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Profile Card */}
                    <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Your Profile</CardTitle>
                            <CardDescription>Manage your account and company settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                                    <p className="text-lg">{profile?.full_name || 'Not set'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    <p className="text-lg">{profile?.email || user.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Company Section */}
                    {profile?.companies ? (
                        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div>
                                    <CardTitle>Your Company</CardTitle>
                                    <CardDescription>Manage your careers page</CardDescription>
                                </div>
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/admin/${profile.companies.slug}`}>
                                        <Settings className="w-4 h-4 mr-2" />
                                        Manage
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Company Name</p>
                                        <p className="text-2xl font-bold">{profile.companies.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Company Slug</p>
                                        <p className="text-lg font-mono">{profile.companies.slug}</p>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Public Careers Page</p>
                                        <Button asChild variant="secondary" className="w-full">
                                            <Link href={`/${profile.companies.slug}/careers`} target="_blank">
                                                View Careers Page →
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>No Company Yet</CardTitle>
                                <CardDescription>
                                    Create a company to start building your careers page
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isCreating ? (
                                    <form onSubmit={handleCreateCompany} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="new-company-name">Company Name</Label>
                                            <Input
                                                id="new-company-name"
                                                value={newCompanyName}
                                                onChange={(e) => handleCompanyNameChange(e.target.value)}
                                                placeholder="Acme Inc."
                                                required
                                                disabled={creatingLoading}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new-company-slug">Company Slug</Label>
                                            <Input
                                                id="new-company-slug"
                                                value={newCompanySlug}
                                                onChange={(e) => setNewCompanySlug(e.target.value)}
                                                placeholder="acme-inc"
                                                required
                                                disabled={creatingLoading}
                                                className="font-mono"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="submit"
                                                disabled={creatingLoading}
                                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                                            >
                                                {creatingLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Creating...
                                                    </>
                                                ) : (
                                                    'Create Company'
                                                )}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsCreating(false)}
                                                disabled={creatingLoading}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <Button
                                        onClick={() => setIsCreating(true)}
                                        className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create Company
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer">
                            <CardHeader>
                                <CardTitle className="text-lg">Editor</CardTitle>
                                <CardDescription>Customize your careers page design</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/admin/editor">
                                        Open Editor
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {profile?.companies && (
                            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="text-lg">Jobs</CardTitle>
                                    <CardDescription>Manage job postings</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href={`/admin/${profile.companies.slug}`}>
                                            Manage Jobs
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
