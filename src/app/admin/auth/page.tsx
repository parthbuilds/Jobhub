'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createAdminProfile } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building2, Mail, Lock, User, Briefcase } from 'lucide-react';

export default function AuthPage() {
    const router = useRouter();
    const { signIn, signUp, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Login form state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Signup form state
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [companySlug, setCompanySlug] = useState('');

    // Redirect if already logged in
    if (user) {
        router.push('/admin');
        return null;
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signIn(loginEmail, loginPassword);
            router.push('/admin');
        } catch (err: any) {
            if (err.message?.includes('Email not confirmed')) {
                setError('Email not confirmed. Please check your inbox or disable "Confirm Email" in Supabase Dashboard.');
            } else {
                setError(err.message || 'Failed to sign in. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Validation
        if (signupPassword !== signupConfirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (signupPassword.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        if (!fullName.trim()) {
            setError('Full name is required');
            setLoading(false);
            return;
        }

        try {
            // Create auth user
            const { user: newUser, session } = await signUp(signupEmail, signupPassword);

            if (!newUser) {
                throw new Error('Failed to create user');
            }

            // Attempt auto-login if session is missing (e.g. if email confirmation is enabled but we want to try anyway)
            if (!session) {
                try {
                    await signIn(signupEmail, signupPassword);
                } catch (loginErr: any) {
                    console.warn('Auto-login failed:', loginErr);

                    if (loginErr.message?.includes('Email not confirmed')) {
                        setSuccess('Account created! However, Supabase requires email confirmation by default. Please check your email OR disable "Confirm Email" in your Supabase Dashboard (Authentication -> Providers -> Email) and try logging in again.');
                    } else {
                        setSuccess('Account created! Please log in.');
                    }
                    setLoading(false);
                    return;
                }
            }

            // Create admin profile with optional company
            await createAdminProfile(
                newUser.id,
                signupEmail,
                fullName,
                companyName.trim() || undefined,
                companySlug.trim() || undefined
            );

            setSuccess('Account created successfully! Logging you in...');

            // Clear form
            setSignupEmail('');
            setSignupPassword('');
            setSignupConfirmPassword('');
            setFullName('');
            setCompanyName('');
            setCompanySlug('');

            // Auto-redirect
            setTimeout(() => {
                router.push('/admin');
            }, 1000);
        } catch (err: any) {
            setError(err.message || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-generate slug from company name
    const handleCompanyNameChange = (value: string) => {
        setCompanyName(value);
        const slug = value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        setCompanySlug(slug);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8 space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
                        <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Careers Page Builder
                    </h1>
                    <p className="text-muted-foreground">
                        Admin Portal
                    </p>
                </div>

                <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
                    <CardHeader>
                        <CardTitle>Welcome</CardTitle>
                        <CardDescription>
                            Sign in to manage your careers page or create a new account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            </TabsList>

                            {/* Login Tab */}
                            <TabsContent value="login">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="login-email"
                                                type="email"
                                                placeholder="admin@company.com"
                                                value={loginEmail}
                                                onChange={(e) => setLoginEmail(e.target.value)}
                                                className="pl-10"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="login-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                className="pl-10"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </Button>
                                </form>
                            </TabsContent>

                            {/* Signup Tab */}
                            <TabsContent value="signup">
                                <form onSubmit={handleSignup} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-name">Full Name *</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="signup-name"
                                                type="text"
                                                placeholder="John Doe"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="pl-10"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email *</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="signup-email"
                                                type="email"
                                                placeholder="admin@company.com"
                                                value={signupEmail}
                                                onChange={(e) => setSignupEmail(e.target.value)}
                                                className="pl-10"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Password *</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="signup-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={signupPassword}
                                                onChange={(e) => setSignupPassword(e.target.value)}
                                                className="pl-10"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-confirm-password">Confirm Password *</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="signup-confirm-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={signupConfirmPassword}
                                                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                                className="pl-10"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t pt-4 mt-4">
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Company Details (Optional - you can add this later)
                                        </p>

                                        <div className="space-y-2">
                                            <Label htmlFor="company-name">Company Name</Label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="company-name"
                                                    type="text"
                                                    placeholder="Acme Inc."
                                                    value={companyName}
                                                    onChange={(e) => handleCompanyNameChange(e.target.value)}
                                                    className="pl-10"
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="company-slug">Company Slug</Label>
                                            <Input
                                                id="company-slug"
                                                type="text"
                                                placeholder="acme-inc"
                                                value={companySlug}
                                                onChange={(e) => setCompanySlug(e.target.value)}
                                                disabled={loading}
                                                className="font-mono text-sm"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Your careers page will be at: /{companySlug || 'your-company'}/careers
                                            </p>
                                        </div>
                                    </div>

                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    {success && (
                                        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                                            <AlertDescription className="text-green-700 dark:text-green-300">
                                                {success}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating account...
                                            </>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
}
