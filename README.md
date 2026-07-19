# BGMI Website (Next.js Full Stack)

Production-ready foundation for:
- Same BGMI calculator logic and fields
- Theme-based public + admin UI
- News system with admin workflows
- SEO/schema, robots, sitemap, manifest
- Admin modules for settings, ads, media, backups, users

## Project Path
`C:\Users\DELL\Desktop\bgmi`

## Run Locally
1. Install deps:
   - `npm install`
2. Auto-setup local env:
   - `npm run setup:local`
3. Start local infra:
   - `docker compose up -d`
4. Generate Prisma client:
   - `npm run prisma:generate`
5. Push schema:
   - `npm run prisma:push`
6. Seed admin:
   - `npm run seed:admin`
7. Start app:
   - `npm run dev`

## Production Setup
1. Configure Postgres in `DATABASE_URL`
2. Apply schema:
   - `npm run prisma:push`
3. Seed admin account:
   - `npm run seed:admin`
4. Generate VAPID keys:
   - `npm run vapid:generate`
5. Fill SMTP, Push, Storage/CDN keys in env
6. Validate env:
   - `npm run env:check`
7. Build:
   - `npm run build`

## Fully Local (no external services)
- Postgres: `localhost:5432`
- SMTP test inbox (Mailpit UI): [http://localhost:8025](http://localhost:8025)
- MinIO console: [http://localhost:9001](http://localhost:9001)

## Default Admin (fallback/dev)
- Email: `admin@example.com`
- Password: `admin1234`

Use DB seed / admin Users panel to set passwords in production.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
