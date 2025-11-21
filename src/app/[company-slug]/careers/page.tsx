import { notFound } from 'next/navigation';
import { getCompanyBySlug, getJobsByCompanyId } from '@/lib/db';
import CareerPageTemplate from '@/components/CareerPageTemplate';
import { Suspense } from 'react';

interface PageProps {
    params: Promise<{ 'company-slug': string }>;
}

function LoadingState() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Loading career page...</p>
            </div>
        </div>
    );
}

export default async function CareerPage({ params }: PageProps) {
    const { 'company-slug': slug } = await params;

    let company;
    let jobs;

    try {
        company = await getCompanyBySlug(slug);

        if (!company) {
            notFound();
        }

        jobs = await getJobsByCompanyId(company.id);
    } catch (error) {
        console.error('Error loading career page:', error);
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md">
                    <h1 className="text-2xl font-bold text-destructive">Error Loading Page</h1>
                    <p className="text-muted-foreground">
                        We encountered an error while loading this career page. Please try again later.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Make sure your Supabase credentials are configured in .env.local
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Suspense fallback={<LoadingState />}>
            <CareerPageTemplate company={company} jobs={jobs} />
        </Suspense>
    );
}
