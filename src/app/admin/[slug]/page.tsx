'use client';

import { useState, useEffect } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CareerPageTemplate from '@/components/CareerPageTemplate';
import RichTextEditor from '@/components/RichTextEditor';
import { Company, PageSection, Job } from '@/lib/mock-data'; // Types only
import { getCompanyBySlug, getJobsByCompanyId, updateCompany, createJob, updateJob, deleteJob } from '@/lib/db';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Copy, Check, Video, Image as ImageIcon, Type, Eye, Pencil, Briefcase } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
// import { toast } from 'sonner'; // Removed to fix lint error, using alert instead

export default function CompanyEditorPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const slug = params.slug as string;

    const [company, setCompany] = useState<Company | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isJobSheetOpen, setIsJobSheetOpen] = useState(false);
    const [currentJob, setCurrentJob] = useState<Job | null>(null);
    const [jobFormData, setJobFormData] = useState<Partial<Job>>({});
    const [jobSaving, setJobSaving] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSectionImageUpload = (sectionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleSectionChange(sectionId, 'backgroundImageUrl', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const openJobSheet = (job?: Job) => {
        setCurrentJob(job || null);
        setJobFormData(job || {
            title: '',
            location: 'Remote',
            workPolicy: 'Remote',
            employmentType: 'Full-time',
            description: '',
            companyId: company?.id,
            experienceLevel: 'Mid-level',
            jobType: 'Permanent',
            department: 'Engineering',
            salaryRange: '',
            applicationUrl: ''
        });
        setIsJobSheetOpen(true);
    };

    const handleJobSubmit = async () => {
        if (!company) return;
        setJobSaving(true);
        try {
            const slug = jobFormData.slug || jobFormData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `job-${Date.now()}`;

            const jobData = {
                ...jobFormData,
                companyId: company.id,
                slug,
                title: jobFormData.title || 'Untitled Job',
                location: jobFormData.location || 'Remote',
                workPolicy: jobFormData.workPolicy || 'Remote',
                employmentType: jobFormData.employmentType || 'Full-time',
                description: jobFormData.description || '',
                experienceLevel: jobFormData.experienceLevel || 'Mid-level',
                jobType: jobFormData.jobType || 'Permanent',
                department: jobFormData.department || 'Engineering',
                salaryRange: jobFormData.salaryRange,
                applicationUrl: jobFormData.applicationUrl
            } as any;

            if (currentJob) {
                await updateJob(currentJob.id, jobData);
            } else {
                await createJob(jobData);
            }

            const updatedJobs = await getJobsByCompanyId(company.id);
            setJobs(updatedJobs);
            setIsJobSheetOpen(false);
        } catch (error) {
            console.error('Error saving job:', error);
            alert(`Failed to save job: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        } finally {
            setJobSaving(false);
        }
    };

    const handleDeleteJob = async (jobId: string) => {
        if (!confirm('Delete this job?')) return;
        try {
            await deleteJob(jobId);
            const updatedJobs = await getJobsByCompanyId(company!.id);
            setJobs(updatedJobs);
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('Failed to delete job');
        }
    };

    useEffect(() => {
        async function loadData() {
            try {
                const foundCompany = await getCompanyBySlug(slug);
                if (foundCompany) {
                    // Ensure sections are sorted by order
                    foundCompany.pageSections.sort((a, b) => a.order - b.order);
                    setCompany(foundCompany);
                    const foundJobs = await getJobsByCompanyId(foundCompany.id);
                    setJobs(foundJobs);
                } else {
                    console.error('Company not found');
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [slug]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!company) {
        return <div className="flex items-center justify-center h-screen">Company Not Found</div>;
    }

    const handleBrandChange = (key: keyof Company['brandConfig'], value: string) => {
        setCompany((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                brandConfig: {
                    ...prev.brandConfig,
                    [key]: value,
                },
            };
        });
    };

    const handleSectionChange = (sectionId: string, key: keyof PageSection, value: any) => {
        setCompany((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                pageSections: prev.pageSections.map((s) =>
                    s.id === sectionId ? { ...s, [key]: value } : s
                ),
            };
        });
    };

    const handleAddSection = (type: PageSection['type']) => {
        setCompany((prev) => {
            if (!prev) return null;
            const newOrder = prev.pageSections.length > 0
                ? Math.max(...prev.pageSections.map(s => s.order)) + 1
                : 0;

            const newSection: PageSection = {
                id: `section-${Date.now()}`,
                type,
                title: type === 'Video' ? 'Our Culture' : 'New Section',
                content: type === 'Video' ? '' : 'Add your content here...',
                isVisible: true,
                order: newOrder,
            };

            return {
                ...prev,
                pageSections: [...prev.pageSections, newSection],
            };
        });
    };

    const handleDeleteSection = (sectionId: string) => {
        if (!confirm('Are you sure you want to delete this section?')) return;
        setCompany((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                pageSections: prev.pageSections.filter(s => s.id !== sectionId),
            };
        });
    };

    const handleMoveSection = (index: number, direction: 'up' | 'down') => {
        setCompany((prev) => {
            if (!prev) return null;
            const newSections = [...prev.pageSections];

            if (direction === 'up' && index > 0) {
                [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
            } else if (direction === 'down' && index < newSections.length - 1) {
                [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
            }

            // Re-assign order based on new index
            return {
                ...prev,
                pageSections: newSections.map((s, i) => ({ ...s, order: i })),
            };
        });
    };

    const handleSave = async () => {
        if (!company) return;
        setSaving(true);
        try {
            await updateCompany(company.id, {
                brandConfig: company.brandConfig,
                pageSections: company.pageSections
            });
            // Ideally use a toast here
            alert('Changes saved successfully!');
        } catch (error) {
            console.error('Error saving changes:', error);
            alert('Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/${company.slug}/careers`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleBrandChange('logoUrl', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="h-screen w-full overflow-hidden flex flex-col bg-background text-foreground">
            <header className="h-14 border-b flex items-center justify-between px-4 bg-background z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/admin')}>&larr; Back</Button>
                    <h1 className="font-semibold text-lg hidden md:block">{company.name} Editor</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={handleCopyLink}>
                        {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                        {copied ? 'Copied' : 'Share Link'}
                    </Button>
                    <Button size="sm" variant="default" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save Changes
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={30} minSize={25} maxSize={45} className="bg-muted/10 border-r">
                        <div className="h-full overflow-y-auto p-4 space-y-6">

                            {/* Brand Configuration */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" />
                                        Brand Theme
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="primaryColor">Primary Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="primaryColor"
                                                type="color"
                                                className="w-12 h-10 p-1 cursor-pointer"
                                                value={company.brandConfig.primaryColor}
                                                onChange={(e) => handleBrandChange('primaryColor', e.target.value)}
                                            />
                                            <Input
                                                type="text"
                                                value={company.brandConfig.primaryColor}
                                                onChange={(e) => handleBrandChange('primaryColor', e.target.value)}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="secondaryColor"
                                                type="color"
                                                className="w-12 h-10 p-1 cursor-pointer"
                                                value={company.brandConfig.secondaryColor}
                                                onChange={(e) => handleBrandChange('secondaryColor', e.target.value)}
                                            />
                                            <Input
                                                type="text"
                                                value={company.brandConfig.secondaryColor}
                                                onChange={(e) => handleBrandChange('secondaryColor', e.target.value)}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="fontFamily">Font Family</Label>
                                        <Select
                                            value={company.brandConfig.fontFamily}
                                            onValueChange={(val) => handleBrandChange('fontFamily', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Font" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Inter">Inter</SelectItem>
                                                <SelectItem value="Roboto">Roboto</SelectItem>
                                                <SelectItem value="Open Sans">Open Sans</SelectItem>
                                                <SelectItem value="Lato">Lato</SelectItem>
                                                <SelectItem value="Montserrat">Montserrat</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="logoUrl">Logo</Label>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id="logoUrl"
                                                    value={company.brandConfig.logoUrl}
                                                    onChange={(e) => handleBrandChange('logoUrl', e.target.value)}
                                                    placeholder="https://..."
                                                    className="flex-1"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">OR Upload:</span>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoUpload}
                                                    className="text-xs h-8"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Job Listings */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between py-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Briefcase className="w-4 h-4" />
                                        Job Listings
                                    </CardTitle>
                                    <Button size="sm" variant="ghost" onClick={() => openJobSheet()}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {jobs.length === 0 ? (
                                        <p className="text-xs text-muted-foreground text-center py-4">No jobs posted yet.</p>
                                    ) : (
                                        jobs.map(job => (
                                            <div key={job.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md text-sm">
                                                <span className="truncate font-medium">{job.title}</span>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openJobSheet(job)}>
                                                        <Pencil className="w-3 h-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteJob(job.id)}>
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>

                            {/* Page Sections */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-sm text-muted-foreground">Content Sections</h3>
                                </div>

                                {company.pageSections.map((section, index) => (
                                    <Card key={section.id} className="relative group">
                                        <CardHeader className="py-3 px-4 bg-muted/30 flex flex-row items-center justify-between space-y-0">
                                            <div className="flex items-center gap-2">
                                                {section.type === 'Hero' && <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                                                {section.type === 'Video' && <Video className="w-4 h-4 text-muted-foreground" />}
                                                {section.type === 'About' && <Type className="w-4 h-4 text-muted-foreground" />}
                                                {section.type === 'Jobs' && <BriefcaseIcon className="w-4 h-4 text-muted-foreground" />}
                                                <span className="font-medium text-sm">{section.type}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    disabled={index === 0}
                                                    onClick={() => handleMoveSection(index, 'up')}
                                                >
                                                    <ArrowUp className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    disabled={index === company.pageSections.length - 1}
                                                    onClick={() => handleMoveSection(index, 'down')}
                                                >
                                                    <ArrowDown className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-destructive hover:text-destructive"
                                                    onClick={() => handleDeleteSection(section.id)}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <Label htmlFor={`visible-${section.id}`} className="text-xs">Visible</Label>
                                                <Input
                                                    id={`visible-${section.id}`}
                                                    type="checkbox"
                                                    className="h-4 w-4"
                                                    checked={section.isVisible}
                                                    onChange={(e) => handleSectionChange(section.id, 'isVisible', e.target.checked)}
                                                />
                                            </div>

                                            {section.type !== 'Jobs' && (
                                                <>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-muted-foreground">Heading</Label>
                                                        <Input
                                                            value={section.title || ''}
                                                            onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)}
                                                            placeholder="Section Heading"
                                                        />
                                                    </div>

                                                    {section.type === 'Hero' && (
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-muted-foreground">Background Image URL</Label>
                                                            <div className="space-y-2">
                                                                <Input
                                                                    value={section.backgroundImageUrl || ''}
                                                                    onChange={(e) => handleSectionChange(section.id, 'backgroundImageUrl', e.target.value)}
                                                                    placeholder="https://..."
                                                                />
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-muted-foreground">OR Upload:</span>
                                                                    <Input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(e) => handleSectionImageUpload(section.id, e)}
                                                                        className="text-xs h-8"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-muted-foreground">
                                                            {section.type === 'Video' ? 'Video URL (YouTube/Vimeo)' : 'Content'}
                                                        </Label>
                                                        {section.type === 'Video' ? (
                                                            <div className="space-y-2">
                                                                <Input
                                                                    value={section.content || ''}
                                                                    onChange={(e) => handleSectionChange(section.id, 'content', e.target.value)}
                                                                    placeholder="https://www.youtube.com/watch?v=..."
                                                                />
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-muted-foreground">OR Upload:</span>
                                                                    <Input
                                                                        type="file"
                                                                        accept="video/*"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                const reader = new FileReader();
                                                                                reader.onloadend = () => {
                                                                                    handleSectionChange(section.id, 'content', reader.result as string);
                                                                                };
                                                                                reader.readAsDataURL(file);
                                                                            }
                                                                        }}
                                                                        className="text-xs h-8"
                                                                    />
                                                                </div>
                                                                <p className="text-xs text-muted-foreground italic">
                                                                    Paste a YouTube or Vimeo URL, or upload a video file
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <Textarea
                                                                value={section.content || ''}
                                                                onChange={(e) => handleSectionChange(section.id, 'content', e.target.value)}
                                                                placeholder="Section content..."
                                                                className="min-h-[80px]"
                                                            />
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                            {section.type === 'Jobs' && (
                                                <p className="text-xs text-muted-foreground italic">
                                                    Displays all active job listings.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}

                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <Button variant="outline" size="sm" onClick={() => handleAddSection('About')}>
                                        <Plus className="w-3 h-3 mr-2" /> Text Section
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleAddSection('Video')}>
                                        <Plus className="w-3 h-3 mr-2" /> Video Section
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleAddSection('Hero')}>
                                        <Plus className="w-3 h-3 mr-2" /> Hero Section
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleAddSection('Jobs')} disabled={company.pageSections.some(s => s.type === 'Jobs')}>
                                        <Plus className="w-3 h-3 mr-2" /> Jobs Section
                                    </Button>
                                </div>
                            </div>

                        </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    <ResizablePanel defaultSize={70}>
                        <div className="h-full w-full bg-white overflow-hidden relative flex flex-col">
                            <div className="bg-muted/30 border-b px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-3 h-3" />
                                    Live Preview
                                </div>
                                <div>
                                    Changes are applied immediately to this preview
                                </div>
                            </div>
                            {/* We wrap the template in a div that handles scrolling if the template doesn't */}
                            <div className="flex-1 overflow-y-auto relative">
                                <CareerPageTemplate company={company} jobs={jobs} />
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>

            <Sheet open={isJobSheetOpen} onOpenChange={setIsJobSheetOpen}>
                <SheetContent className="overflow-y-auto sm:max-w-md p-4">
                    <SheetHeader>
                        <SheetTitle>{currentJob ? 'Edit Job' : 'Add New Job'}</SheetTitle>
                        <SheetDescription>
                            {currentJob ? 'Update job details below.' : 'Create a new job listing for your career page.'}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Job Title</Label>
                            <Input
                                value={jobFormData.title || ''}
                                onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                                placeholder="e.g. Senior Frontend Engineer"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Job Slug</Label>
                            <Input
                                value={jobFormData.slug || ''}
                                onChange={(e) => setJobFormData({ ...jobFormData, slug: e.target.value })}
                                placeholder="e.g. senior-frontend-engineer"
                            />
                            <p className="text-xs text-muted-foreground">URL-friendly identifier (lowercase, hyphens only)</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input
                                value={jobFormData.location || ''}
                                onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                                placeholder="e.g. New York, NY"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Department</Label>
                            <Input
                                value={jobFormData.department || ''}
                                onChange={(e) => setJobFormData({ ...jobFormData, department: e.target.value })}
                                placeholder="e.g. Engineering"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Salary Range (Optional)</Label>
                            <Input
                                value={jobFormData.salaryRange || ''}
                                onChange={(e) => setJobFormData({ ...jobFormData, salaryRange: e.target.value })}
                                placeholder="e.g. $100k - $150k"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Application URL (Optional)</Label>
                            <Input
                                value={jobFormData.applicationUrl || ''}
                                onChange={(e) => setJobFormData({ ...jobFormData, applicationUrl: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Work Policy</Label>
                                <Select
                                    value={jobFormData.workPolicy}
                                    onValueChange={(val: any) => setJobFormData({ ...jobFormData, workPolicy: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select policy" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Remote">Remote</SelectItem>
                                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                                        <SelectItem value="On-site">On-site</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Experience Level</Label>
                                <Select
                                    value={jobFormData.experienceLevel}
                                    onValueChange={(val: any) => setJobFormData({ ...jobFormData, experienceLevel: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Junior">Junior</SelectItem>
                                        <SelectItem value="Mid-level">Mid-level</SelectItem>
                                        <SelectItem value="Senior">Senior</SelectItem>
                                        <SelectItem value="Lead">Lead</SelectItem>
                                        <SelectItem value="Executive">Executive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Employment Type</Label>
                                <Select
                                    value={jobFormData.employmentType}
                                    onValueChange={(val: any) => setJobFormData({ ...jobFormData, employmentType: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Full-time">Full-time</SelectItem>
                                        <SelectItem value="Part-time">Part-time</SelectItem>
                                        <SelectItem value="Contract">Contract</SelectItem>
                                        <SelectItem value="Internship">Internship</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <RichTextEditor
                                value={jobFormData.description || ''}
                                onChange={(value) => setJobFormData({ ...jobFormData, description: value })}
                                placeholder="Write a detailed job description with formatting..."
                            />
                        </div>
                    </div>
                    <SheetFooter>
                        <Button variant="outline" onClick={() => setIsJobSheetOpen(false)}>Cancel</Button>
                        <Button onClick={handleJobSubmit} disabled={jobSaving}>
                            {jobSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Job
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}

function BriefcaseIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    );
}
