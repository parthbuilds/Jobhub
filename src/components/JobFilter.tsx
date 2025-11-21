import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Job } from '@/lib/mock-data';
import { useMemo } from 'react';

interface JobFilterProps {
    jobs: Job[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    locationFilter: string;
    setLocationFilter: (location: string) => void;
    typeFilter: string;
    setTypeFilter: (type: string) => void;
}

export default function JobFilter({
    jobs,
    searchQuery,
    setSearchQuery,
    locationFilter,
    setLocationFilter,
    typeFilter,
    setTypeFilter,
}: JobFilterProps) {
    const locations = useMemo(() => {
        const uniqueLocations = Array.from(new Set(jobs.map((job) => job.location)));
        return ['All', ...uniqueLocations];
    }, [jobs]);

    const types = useMemo(() => {
        const uniqueTypes = Array.from(new Set(jobs.map((job) => job.employmentType)));
        return ['All', ...uniqueTypes];
    }, [jobs]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-4 rounded-lg shadow-sm border">
            <div>
                <Input
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                />
            </div>
            <div>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by Location" />
                    </SelectTrigger>
                    <SelectContent>
                        {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                                {location}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {types.map((type) => (
                            <SelectItem key={type} value={type}>
                                {type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
