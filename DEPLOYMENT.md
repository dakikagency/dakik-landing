# Deployment Guide

## Fixed Issues

✅ **Turbo Warning**: Configured `@collab/db#build` to only expect Prisma client outputs
✅ **404 Error**: Properly configured Vercel for monorepo deployment

## Vercel Configuration

The project is now correctly configured for Vercel deployment.

### Files Changed

1. **`turbo.json`** - Added specific configuration for `@collab/db#build` to prevent warnings
2. **`apps/web/vercel.json`** - Created deployment configuration for the Next.js app
3. **Root `vercel.json`** - Removed (not needed for monorepo setup)

### Vercel Dashboard Settings

When deploying to Vercel, configure these settings:

**General Settings:**
- **Root Directory**: `apps/web`
- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: Provided by `apps/web/vercel.json`
- **Install Command**: Provided by `apps/web/vercel.json`
- **Output Directory**: Leave empty (auto-detected)

**Environment Variables:**
Add all variables from your `.env` file:
```
DATABASE_URL=<your-neon-postgres-url>
BETTER_AUTH_SECRET=<your-secret>
BETTER_AUTH_URL=<your-production-url>
CORS_ORIGIN=<your-production-url>
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>
CLOUDINARY_CLOUD_NAME=<your-cloud>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=<your-email>
MAIL_FROM=<your-from-email>
SMTP_PASS=<your-app-password>
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_CALENDAR_CLIENT_ID=<same-as-google-client-id>
GOOGLE_CALENDAR_CLIENT_SECRET=<same-as-google-client-secret>
GOOGLE_CALENDAR_REFRESH_TOKEN=<your-refresh-token>
GOOGLE_CALENDAR_ID=primary
BLOG_INTEGRATION_API_KEY=<your-api-key>
```

### Deploy

```bash
# 1. Commit the changes
git add .
git commit -m "fix: configure Vercel deployment for monorepo"

# 2. Push to your repository
git push origin master

# 3. Vercel will automatically deploy
```

### Troubleshooting

**If you still see 404 errors:**
1. Check that "Root Directory" is set to `apps/web` in Vercel dashboard
2. Verify all environment variables are set correctly
3. Check build logs for any errors during deployment

**If the build fails:**
1. Ensure all environment variables are set (especially `DATABASE_URL`)
2. Check that the build command completes successfully locally
3. Review Vercel build logs for specific errors

### Local Testing

Test the production build locally:

```bash
# Build the project
bun run build

# Start the production server
cd apps/web
bun run start
```

The app should be available at http://localhost:3000

## How It Works

1. **Monorepo Structure**: Vercel deploys from `apps/web` as the root directory
2. **Build Command**: Runs `turbo build --filter=web` from the monorepo root
3. **Install Command**: Installs dependencies from the monorepo root
4. **Outputs**: Next.js `.next` folder is auto-detected by Vercel
5. **Dependencies**: Turborepo ensures all workspace packages are built in correct order
