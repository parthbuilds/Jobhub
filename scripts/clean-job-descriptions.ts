/**
 * Clean Job Descriptions Script
 * 
 * This script cleans all existing job descriptions in the database
 * by removing data-start and data-end attributes.
 * 
 * Run this once to clean existing data:
 * npx tsx scripts/clean-job-descriptions.ts
 */

import { supabase } from '../src/lib/db';

function cleanHTML(html: string): string {
    if (!html) return '';
    return html
        .replace(/\s*data-start="[^"]*"/g, '')
        .replace(/\s*data-end="[^"]*"/g, '')
        .trim();
}

async function cleanAllJobDescriptions() {
    console.log('🧹 Starting to clean job descriptions...\n');

    // Fetch all jobs
    const { data: jobs, error: fetchError } = await supabase
        .from('jobs')
        .select('id, title, description');

    if (fetchError) {
        console.error('❌ Error fetching jobs:', fetchError);
        return;
    }

    if (!jobs || jobs.length === 0) {
        console.log('ℹ️  No jobs found in the database.');
        return;
    }

    console.log(`📊 Found ${jobs.length} job(s) to process.\n`);

    let cleanedCount = 0;
    let skippedCount = 0;

    // Process each job
    for (const job of jobs) {
        const originalDescription = job.description || '';
        const cleanedDescription = cleanHTML(originalDescription);

        // Only update if the description changed
        if (originalDescription !== cleanedDescription) {
            const { error: updateError } = await supabase
                .from('jobs')
                .update({ description: cleanedDescription })
                .eq('id', job.id);

            if (updateError) {
                console.error(`❌ Error updating job "${job.title}":`, updateError);
            } else {
                console.log(`✅ Cleaned: "${job.title}"`);
                cleanedCount++;
            }
        } else {
            console.log(`⏭️  Skipped (already clean): "${job.title}"`);
            skippedCount++;
        }
    }

    console.log(`\n✨ Cleaning complete!`);
    console.log(`   - Cleaned: ${cleanedCount} job(s)`);
    console.log(`   - Skipped: ${skippedCount} job(s)`);
}

// Run the script
cleanAllJobDescriptions()
    .then(() => {
        console.log('\n✅ Script finished successfully.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
