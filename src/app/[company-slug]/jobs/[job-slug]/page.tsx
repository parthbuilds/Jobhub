import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCompanyBySlug, getJobBySlug } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, Clock, DollarSign, Building, ArrowLeft } from 'lucide-react';

interface JobPageProps {
    params: Promise<{ 'company-slug': string; 'job-slug': string }>;
}

export default async function JobDetailsPage({ params }: JobPageProps) {
    const { 'company-slug': companySlug, 'job-slug': jobSlug } = await params;

    let company;
    let job;

    try {
        company = await getCompanyBySlug(companySlug);
        job = await getJobBySlug(jobSlug);

        if (!company || !job) {
            notFound();
        }
    } catch (error) {
        console.error('Error loading job details:', error);
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md">
                    <h1 className="text-2xl font-bold text-destructive">Error Loading Job</h1>
                    <p className="text-muted-foreground">
                        We encountered an error while loading this job. Please try again later.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans" style={{ fontFamily: company.brandConfig.fontFamily }}>
            {/* Header */}
            <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {company.brandConfig.logoUrl && (
                            <img src={company.brandConfig.logoUrl} alt={`${company.name} Logo`} className="h-8 w-auto object-contain" />
                        )}
                        <span className="font-bold text-xl hidden sm:block">{company.name} Careers</span>
                    </div>
                    <Button variant="ghost" asChild>
                        <Link href={`/${company.slug}/careers`}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
                        </Link>
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-3xl">
                <div className="space-y-8">
                    {/* Job Header */}
                    <div className="space-y-4">
                        <h1 className="text-3xl md:text-4xl font-bold" style={{ color: company.brandConfig.primaryColor }}>{job.title}</h1>
                        <div className="flex flex-wrap gap-4 text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Building className="h-4 w-4" /> {job.department}
                            </span>
                            <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" /> {job.location} ({job.workPolicy})
                            </span>
                            <span className="flex items-center gap-1">
                                <Briefcase className="h-4 w-4" /> {job.employmentType}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" /> Posted {job.postedDaysAgo} days ago
                            </span>
                        </div>
                    </div>

                    {/* Apply Button (Top) */}
                    <div>
                        <Button size="lg" className="w-full md:w-auto" style={{ backgroundColor: company.brandConfig.primaryColor, color: '#ffffff' }} asChild>
                            <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">Apply for this Job</a>
                        </Button>
                    </div>

                    <hr />

                    {/* Job Description */}
                    <div className="prose prose-lg max-w-none">
                        <h3 className="text-xl font-semibold mb-4">About the Role</h3>
                        <p>{job.description}</p>

                        {/* Placeholder for more detailed content since mock data is simple */}
                        <h3 className="text-xl font-semibold mt-8 mb-4">Requirements</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Experience with modern web technologies.</li>
                            <li>Strong problem-solving skills.</li>
                            <li>Excellent communication and teamwork abilities.</li>
                            <li>{job.experienceLevel} level experience required.</li>
                        </ul>

                        <h3 className="text-xl font-semibold mt-8 mb-4">Benefits</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Competitive salary: {job.salaryRange}</li>
                            <li>Remote/Hybrid work options.</li>
                            <li>Health and wellness programs.</li>
                        </ul>
                    </div>

                    {/* Apply Button (Bottom) */}
                    <div className="pt-8">
                        <Button size="lg" className="w-full md:w-auto" style={{ backgroundColor: company.brandConfig.primaryColor, color: '#ffffff' }} asChild>
                            <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">Apply for this Job</a>
                        </Button>
                    </div>
                </div>
            </main>

            <footer className="border-t py-8 mt-12 bg-muted/30">
                <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
                    &copy; {new Date().getFullYear()} {company.name}. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
