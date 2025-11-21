
import { PageSection, Company, Job } from '@/lib/mock-data';
import JobBoard from '@/components/JobBoard';
import { Button } from '@/components/ui/button';

interface CareerPageTemplateProps {
    company: Company;
    jobs: Job[];
}

export default function CareerPageTemplate({ company, jobs }: CareerPageTemplateProps) {
    // Sort sections by order
    const sections = [...company.pageSections]
        .filter((s) => s.isVisible)
        .sort((a, b) => a.order - b.order);

    const getFontFamily = (fontName: string) => {
        switch (fontName) {
            case 'Inter': return 'var(--font-inter)';
            case 'Roboto': return 'var(--font-roboto)';
            case 'Open Sans': return 'var(--font-open-sans)';
            case 'Lato': return 'var(--font-lato)';
            case 'Montserrat': return 'var(--font-montserrat)';
            default: return 'var(--font-inter)';
        }
    };

    return (
        <div
            className="min-h-screen bg-background text-foreground overflow-y-auto"
            style={{
                fontFamily: getFontFamily(company.brandConfig.fontFamily),
            } as React.CSSProperties}
        >
            {/* Header / Nav */}
            <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {company.brandConfig.logoUrl && (
                            <img src={company.brandConfig.logoUrl} alt={`${company.name} Logo`} className="h-8 w-auto object-contain" />
                        )}
                        <span className="font-bold text-xl hidden sm:block">{company.name} Careers</span>
                    </div>
                    <Button variant="outline" asChild>
                        <a href={company.brandConfig.logoUrl ? '/' : '#'}>Back to Home</a>
                    </Button>
                </div>
            </header>

            <main>
                {sections.map((section) => (
                    <SectionRenderer key={section.id} section={section} company={company} jobs={jobs} />
                ))}
            </main>

            <footer className="border-t py-8 mt-12 bg-muted/30">
                <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
                    &copy; {new Date().getFullYear()} {company.name}. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

function SectionRenderer({
    section,
    company,
    jobs,
}: {
    section: PageSection;
    company: Company;
    jobs: Job[];
}) {
    switch (section.type) {
        case 'Hero':
            return (
                <section
                    className="py-20 md:py-32 px-4 text-center bg-cover bg-center relative"
                    style={{
                        backgroundImage: section.backgroundImageUrl
                            ? `url(${section.backgroundImageUrl})`
                            : `linear-gradient(to bottom, ${company.brandConfig.secondaryColor}15, transparent)`
                    }}
                >
                    {section.backgroundImageUrl && (
                        <div className="absolute inset-0 bg-black/60" />
                    )}
                    <div className="container mx-auto max-w-4xl space-y-6 relative z-10 flex flex-col items-center">
                        {company.brandConfig.logoUrl && (
                            <img
                                src={company.brandConfig.logoUrl}
                                alt={`${company.name} Logo`}
                                className="h-16 md:h-24 w-auto object-contain mb-4"
                            />
                        )}
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight" style={{ color: section.backgroundImageUrl ? '#ffffff' : company.brandConfig.primaryColor }}>
                            {section.title}
                        </h1>
                        <p className="text-xl md:text-2xl max-w-2xl mx-auto" style={{ color: section.backgroundImageUrl ? '#e2e8f0' : undefined }}>
                            {section.content}
                        </p>
                        <Button size="lg" className="mt-4" style={{ backgroundColor: company.brandConfig.secondaryColor, color: '#ffffff' }}>
                            Learn More
                        </Button>
                    </div>
                </section>
            );
        case 'About':
            return (
                <section className="py-16 px-4 bg-muted/20">
                    <div className="container mx-auto max-w-4xl">
                        <h2 className="text-3xl font-bold mb-6 text-center">{section.title}</h2>
                        <div className="prose prose-lg mx-auto text-muted-foreground text-center">
                            <p>{section.content}</p>
                        </div>
                    </div>
                </section>
            );
        case 'Video':
            return (
                <section className="py-16 px-4">
                    <div className="container mx-auto max-w-4xl">
                        <h2 className="text-3xl font-bold mb-8 text-center">{section.title}</h2>
                        <div className="aspect-video rounded-xl overflow-hidden shadow-xl bg-black">
                            {section.content && section.content.includes('http') ? (
                                <iframe
                                    src={section.content}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-white">Video Placeholder</div>
                            )}
                        </div>
                    </div>
                </section>
            );
        case 'Jobs':
            return (
                <section className="py-16 px-4" id="jobs">
                    <div className="container mx-auto max-w-5xl">
                        <h2 className="text-3xl font-bold mb-8 text-center">{section.title || 'Open Positions'}</h2>
                        <JobBoard jobs={jobs} brandConfig={company.brandConfig} companySlug={company.slug} />
                    </div>
                </section>
            );
        default:
            return null;
    }
}
