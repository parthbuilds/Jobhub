import { createClient } from '@supabase/supabase-js';
import { Company, Job, BrandConfig, PageSection } from './mock-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kxmfqywpawckesoqdwyj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bWZxeXdwYXdja2Vzb3Fkd3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NTU2ODUsImV4cCI6MjA3OTIzMTY4NX0.A1DDVE3wFBDKwEENeGCiPX3T7wSA4UZdWSlF_BQGSYk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

export async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
}

export async function getAdminProfile() {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('admin_users')
        .select('*, companies(*)')
        .eq('id', user.id)
        .single();

    if (error) throw error;
    return data;
}

export async function linkAdminToCompany(userId: string, companyId: string) {
    const { data, error } = await supabase
        .from('admin_users')
        .update({ company_id: companyId })
        .eq('id', userId);

    if (error) throw error;
    return data;
}

export async function createAdminProfile(
    userId: string,
    email: string,
    fullName: string,
    companyName?: string,
    companySlug?: string
) {
    console.log('createAdminProfile called for user:', userId);
    let companyId: string | null = null;

    // If company details provided, create the company first
    if (companyName && companySlug) {
        const company = await createCompany(companyName, companySlug);
        companyId = company.id;
    }

    // Create admin profile
    // Update admin profile (row already created by trigger)
    const { data, error } = await supabase
        .from('admin_users')
        .update({
            email,
            full_name: fullName,
            company_id: companyId,
        })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================
// COMPANY FUNCTIONS
// ============================================

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase credentials not found. Using mock data.');
        // Fallback to mock data
        const { getCompanyBySlug: getMockCompany } = await import('./mock-data');
        const mockCompany = getMockCompany(slug);
        return mockCompany || null;
    }

    const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Error fetching company:', error);
        // Fallback to mock data on error
        const { getCompanyBySlug: getMockCompany } = await import('./mock-data');
        const mockCompany = getMockCompany(slug);
        return mockCompany || null;
    }

    if (!data) return null;

    return {
        id: data.id,
        slug: data.slug,
        name: data.name,
        brandConfig: data.brand_config,
        pageSections: data.page_sections,
    };
}

export async function createCompany(name: string, slug: string): Promise<Company> {
    console.log('createCompany called with:', { name, slug });
    const { data, error } = await supabase
        .from('companies')
        .insert({
            name,
            slug,
        })
        .select()
        .single();

    if (error) {
        console.error('createCompany error:', error);
        throw error;
    }

    return {
        id: data.id,
        slug: data.slug,
        name: data.name,
        brandConfig: data.brand_config,
        pageSections: data.page_sections,
    };
}

export async function updateCompany(
    companyId: string,
    updates: {
        name?: string;
        slug?: string;
        brandConfig?: BrandConfig;
        pageSections?: PageSection[];
    }
): Promise<Company> {
    const dbUpdates: any = {};

    if (updates.name) dbUpdates.name = updates.name;
    if (updates.slug) dbUpdates.slug = updates.slug;
    if (updates.brandConfig) dbUpdates.brand_config = updates.brandConfig;
    if (updates.pageSections) dbUpdates.page_sections = updates.pageSections;

    const { data, error } = await supabase
        .from('companies')
        .update(dbUpdates)
        .eq('id', companyId)
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        slug: data.slug,
        name: data.name,
        brandConfig: data.brand_config,
        pageSections: data.page_sections,
    };
}

// ============================================
// JOB FUNCTIONS
// ============================================

export async function getJobsByCompanyId(companyId: string): Promise<Job[]> {
    // Check if companyId is a valid UUID. If not (e.g. "c1"), use mock data.
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(companyId);

    if (!supabaseUrl || !supabaseAnonKey || !isUuid) {
        if (!isUuid) console.warn(`Company ID "${companyId}" is not a valid UUID. Using mock data.`);
        else console.warn('Supabase credentials not found. Using mock data.');

        // Fallback to mock data
        const { getJobsByCompanyId: getMockJobs } = await import('./mock-data');
        return getMockJobs(companyId);
    }

    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching jobs:', error);
        // Fallback to mock data on error
        const { getJobsByCompanyId: getMockJobs } = await import('./mock-data');
        return getMockJobs(companyId);
    }

    return data.map((job: any) => ({
        id: job.id,
        companyId: job.company_id,
        title: job.title,
        location: job.location,
        workPolicy: job.work_policy,
        department: job.department,
        employmentType: job.employment_type,
        experienceLevel: job.experience_level,
        jobType: job.job_type,
        salaryRange: job.salary_range,
        slug: job.slug,
        postedDaysAgo: Math.floor((new Date().getTime() - new Date(job.created_at).getTime()) / (1000 * 3600 * 24)),
        description: job.description,
        applicationUrl: job.application_url || '#',
    }));
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase credentials not found. Using mock data.');
        // Fallback to mock data
        const { getJobBySlug: getMockJob } = await import('./mock-data');
        const mockJob = getMockJob(slug);
        return mockJob || null;
    }

    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Error fetching job:', error);
        // Fallback to mock data on error
        const { getJobBySlug: getMockJob } = await import('./mock-data');
        const mockJob = getMockJob(slug);
        return mockJob || null;
    }

    if (!data) return null;

    return {
        id: data.id,
        companyId: data.company_id,
        title: data.title,
        location: data.location,
        workPolicy: data.work_policy,
        department: data.department,
        employmentType: data.employment_type,
        experienceLevel: data.experience_level,
        jobType: data.job_type,
        salaryRange: data.salary_range,
        slug: data.slug,
        postedDaysAgo: Math.floor((new Date().getTime() - new Date(data.created_at).getTime()) / (1000 * 3600 * 24)),
        description: data.description,
        applicationUrl: data.application_url || '#',
    };
}

export async function createJob(jobData: {
    companyId: string;
    title: string;
    slug: string;
    location: string;
    workPolicy: 'Remote' | 'Hybrid' | 'On-site';
    department: string;
    employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
    experienceLevel: 'Junior' | 'Mid-level' | 'Senior' | 'Lead' | 'Executive';
    jobType: 'Permanent' | 'Temporary';
    salaryRange?: string;
    description: string;
    applicationUrl?: string;
}): Promise<Job> {
    const { data, error } = await supabase
        .from('jobs')
        .insert({
            company_id: jobData.companyId,
            title: jobData.title,
            slug: jobData.slug,
            location: jobData.location,
            work_policy: jobData.workPolicy,
            department: jobData.department,
            employment_type: jobData.employmentType,
            experience_level: jobData.experienceLevel,
            job_type: jobData.jobType,
            salary_range: jobData.salaryRange,
            description: jobData.description,
            application_url: jobData.applicationUrl,
        })
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        companyId: data.company_id,
        title: data.title,
        location: data.location,
        workPolicy: data.work_policy,
        department: data.department,
        employmentType: data.employment_type,
        experienceLevel: data.experience_level,
        jobType: data.job_type,
        salaryRange: data.salary_range,
        slug: data.slug,
        postedDaysAgo: 0,
        description: data.description,
        applicationUrl: data.application_url || '#',
    };
}

export async function updateJob(jobId: string, updates: Partial<{
    title: string;
    slug: string;
    location: string;
    workPolicy: 'Remote' | 'Hybrid' | 'On-site';
    department: string;
    employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
    experienceLevel: 'Junior' | 'Mid-level' | 'Senior' | 'Lead' | 'Executive';
    jobType: 'Permanent' | 'Temporary';
    salaryRange: string;
    description: string;
    applicationUrl: string;
}>): Promise<Job> {
    const dbUpdates: any = {};

    if (updates.title) dbUpdates.title = updates.title;
    if (updates.slug) dbUpdates.slug = updates.slug;
    if (updates.location) dbUpdates.location = updates.location;
    if (updates.workPolicy) dbUpdates.work_policy = updates.workPolicy;
    if (updates.department) dbUpdates.department = updates.department;
    if (updates.employmentType) dbUpdates.employment_type = updates.employmentType;
    if (updates.experienceLevel) dbUpdates.experience_level = updates.experienceLevel;
    if (updates.jobType) dbUpdates.job_type = updates.jobType;
    if (updates.salaryRange !== undefined) dbUpdates.salary_range = updates.salaryRange;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.applicationUrl !== undefined) dbUpdates.application_url = updates.applicationUrl;

    const { data, error } = await supabase
        .from('jobs')
        .update(dbUpdates)
        .eq('id', jobId)
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        companyId: data.company_id,
        title: data.title,
        location: data.location,
        workPolicy: data.work_policy,
        department: data.department,
        employmentType: data.employment_type,
        experienceLevel: data.experience_level,
        jobType: data.job_type,
        salaryRange: data.salary_range,
        slug: data.slug,
        postedDaysAgo: Math.floor((new Date().getTime() - new Date(data.created_at).getTime()) / (1000 * 3600 * 24)),
        description: data.description,
        applicationUrl: data.application_url || '#',
    };
}

export async function deleteJob(jobId: string): Promise<void> {
    const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

    if (error) throw error;
}
