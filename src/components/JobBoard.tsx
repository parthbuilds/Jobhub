
'use client';

import { useState, useMemo } from 'react';
import { Job, BrandConfig } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase } from 'lucide-react';
import JobFilter from './JobFilter';

interface JobBoardProps {
    jobs: Job[];
    brandConfig: BrandConfig;
}

export default function JobBoard({ jobs, brandConfig, companySlug }: JobBoardProps & { companySlug: string }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    // Function to strip HTML tags and create a plain text excerpt
    const getPlainTextExcerpt = (html: string, maxLength: number = 150): string => {
        if (!html) return '';

        // Remove HTML tags
        const plainText = html
            .replace(/<[^>]*>/g, ' ')  // Remove all HTML tags
            .replace(/\s+/g, ' ')       // Replace multiple spaces with single space
            .trim();

        // Truncate to maxLength
        if (plainText.length <= maxLength) return plainText;
        return plainText.substring(0, maxLength).trim() + '...';
    };

    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesLocation = locationFilter === 'All' || job.location === locationFilter;
            const matchesType = typeFilter === 'All' || job.employmentType === typeFilter;
            return matchesSearch && matchesLocation && matchesType;
        });
    }, [jobs, searchQuery, locationFilter, typeFilter]);

    return (
        <div className="w-full max-w-5xl mx-auto p-4 space-y-8">
            <JobFilter
                jobs={jobs}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                locationFilter={locationFilter}
                setLocationFilter={setLocationFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
            />

            <div className="grid gap-4">
                {filteredJobs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10">No jobs found matching your criteria.</p>
                ) : (
                    filteredJobs.map((job) => (
                        <Card key={job.id} className="hover:shadow-md transition-shadow group cursor-pointer" onClick={() => window.location.href = `/${companySlug}/jobs/${job.slug}`}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-semibold group-hover:underline" style={{ color: brandConfig.primaryColor }}>
                                            {job.title}
                                        </CardTitle>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="h-4 w-4" /> {job.department}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" /> {job.location} ({job.workPolicy})
                                            </span>
                                        </div>
                                    </div>
                                    <Button asChild size="sm" style={{ backgroundColor: brandConfig.primaryColor, color: '#ffffff' }}>
                                        <a href={`/${companySlug}/jobs/${job.slug}`} onClick={(e) => e.stopPropagation()}>View Details</a>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="px-2 py-1 rounded-md bg-muted text-xs font-medium">{job.employmentType}</span>
                                    <span className="px-2 py-1 rounded-md bg-muted text-xs font-medium">{job.experienceLevel}</span>
                                    <span className="px-2 py-1 rounded-md bg-muted text-xs font-medium">{job.salaryRange}</span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{getPlainTextExcerpt(job.description)}</p>
                            </CardContent>
                            <CardFooter className="pt-0 pb-4">
                                <p className="text-xs text-muted-foreground">Posted {job.postedDaysAgo} days ago</p>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
