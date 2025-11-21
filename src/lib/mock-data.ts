
export type PageSection = {
    id: string;
    type: 'Hero' | 'About' | 'Video' | 'Jobs';
    title?: string;
    content?: string;
    backgroundImageUrl?: string;
    order: number;
    isVisible: boolean;
};

export type BrandConfig = {
    primaryColor: string; // hex
    secondaryColor: string; // hex
    fontFamily: string;
    logoUrl: string;
};

export type Company = {
    id: string;
    slug: string;
    name: string;
    brandConfig: BrandConfig;
    pageSections: PageSection[];
};

export type Job = {
    id: string;
    companyId: string;
    title: string;
    location: string;
    workPolicy: 'Remote' | 'Hybrid' | 'On-site';
    department: string;
    employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
    experienceLevel: 'Junior' | 'Mid-level' | 'Senior' | 'Lead' | 'Executive';
    jobType: 'Permanent' | 'Temporary';
    salaryRange: string;
    slug: string;
    postedDaysAgo: number;
    description: string;
    applicationUrl: string;
};

export const MOCK_COMPANIES: Company[] = [
    {
        id: 'c1',
        slug: 'acme-corp',
        name: 'Acme Corp',
        brandConfig: {
            primaryColor: '#0f172a', // slate-900
            secondaryColor: '#3b82f6', // blue-500
            fontFamily: 'Inter',
            logoUrl: 'https://placehold.co/150x50/0f172a/ffffff?text=Acme+Corp',
        },
        pageSections: [
            {
                id: 's1',
                type: 'Hero',
                title: 'Join the Future',
                content: 'We are building the next generation of widgets.',
                backgroundImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2301&ixlib=rb-4.0.3',
                order: 0,
                isVisible: true
            },
            { id: 's2', type: 'About', title: 'About Us', content: 'Acme Corp is the leading provider of widgets worldwide.', order: 1, isVisible: true },
            { id: 's3', type: 'Jobs', title: 'Open Positions', order: 2, isVisible: true },
        ],
    },
    {
        id: 'c2',
        slug: 'tech-nova',
        name: 'Tech Nova',
        brandConfig: {
            primaryColor: '#7c3aed', // violet-600
            secondaryColor: '#10b981', // emerald-500
            fontFamily: 'Roboto',
            logoUrl: 'https://placehold.co/150x50/7c3aed/ffffff?text=Tech+Nova',
        },
        pageSections: [
            {
                id: 's1',
                type: 'Hero',
                title: 'Innovate with Us',
                content: 'Pushing the boundaries of technology.',
                backgroundImageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
                order: 0,
                isVisible: true
            },
            { id: 's2', type: 'Video', title: 'Life at Tech Nova', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ', order: 1, isVisible: true },
            { id: 's3', type: 'Jobs', title: 'Careers', order: 2, isVisible: true },
        ],
    },
];

export const MOCK_JOBS: Job[] = [
    // Acme Corp Jobs
    {
        id: 'j1',
        companyId: 'c1',
        title: 'Full Stack Engineer',
        workPolicy: 'Remote',
        location: 'Berlin, Germany',
        department: 'Product',
        employmentType: 'Full-time',
        experienceLevel: 'Senior',
        jobType: 'Temporary',
        salaryRange: 'AED 8K–12K / month',
        slug: 'full-stack-engineer-berlin',
        postedDaysAgo: 40,
        description: 'Build amazing UIs with React and robust backends.',
        applicationUrl: '#'
    },
    {
        id: 'j2',
        companyId: 'c1',
        title: 'Business Analyst',
        workPolicy: 'Hybrid',
        location: 'Riyadh, Saudi Arabia',
        department: 'Customer Success',
        employmentType: 'Part-time',
        experienceLevel: 'Mid-level',
        jobType: 'Permanent',
        salaryRange: 'USD 4K–6K / month',
        slug: 'business-analyst-riyadh',
        postedDaysAgo: 5,
        description: 'Analyze business needs and solutions.',
        applicationUrl: '#'
    },
    {
        id: 'j3',
        companyId: 'c1',
        title: 'Software Engineer',
        workPolicy: 'Remote',
        location: 'Berlin, Germany',
        department: 'Sales',
        employmentType: 'Contract',
        experienceLevel: 'Senior',
        jobType: 'Permanent',
        salaryRange: 'SAR 10K–18K / month',
        slug: 'software-engineer-berlin',
        postedDaysAgo: 32,
        description: 'Drive sales through engineering.',
        applicationUrl: '#'
    },
    {
        id: 'j4',
        companyId: 'c1',
        title: 'Marketing Manager',
        workPolicy: 'Hybrid',
        location: 'Boston, United States',
        department: 'Engineering',
        employmentType: 'Part-time',
        experienceLevel: 'Mid-level',
        jobType: 'Temporary',
        salaryRange: 'AED 8K–12K / month',
        slug: 'marketing-manager-boston',
        postedDaysAgo: 22,
        description: 'Lead our marketing efforts.',
        applicationUrl: '#'
    },
];

export const getCompanyBySlug = (slug: string): Company | undefined => {
    return MOCK_COMPANIES.find((c) => c.slug === slug);
};

export const getJobsByCompanyId = (companyId: string): Job[] => {
    return MOCK_JOBS.filter((j) => j.companyId === companyId);
};

export const getJobBySlug = (slug: string): Job | undefined => {
    return MOCK_JOBS.find((j) => j.slug === slug);
};
