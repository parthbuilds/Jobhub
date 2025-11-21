# Clean Job Descriptions

This directory contains utility scripts for maintaining the database.

## Clean Job Descriptions Script

The `clean-job-descriptions.ts` script removes unwanted `data-start` and `data-end` attributes from all job descriptions in the database.

### Option 1: Run the Script (Recommended for bulk cleanup)

1. Install tsx if not already installed:
```bash
npm install -D tsx
```

2. Run the script:
```bash
npx tsx scripts/clean-job-descriptions.ts
```

### Option 2: Manual Cleanup (For individual jobs)

Simply edit and re-save any job in the admin panel. The system now automatically cleans HTML attributes when saving.

1. Go to your admin dashboard
2. Click on the job you want to clean
3. Click "Edit" (pencil icon)
4. Click "Save Job" (no changes needed)
5. The job description will be automatically cleaned

## What This Fixes

**Before:**
```html
<p data-start="347" data-end="685">Job description...</p>
```

**After:**
```html
<p>Job description...</p>
```

All new jobs and job updates will automatically have clean HTML without these attributes.
