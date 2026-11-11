# Deployment Guide for GeM Analyser

The **GeM Analyser App** (`app/`) is architected for **zero-configuration deployments** across both **Vercel** and **Cloudflare Pages / Workers**.

---

## 🚀 Option 1: Deploy to Vercel (Recommended)

### Method A: Via Vercel Web Dashboard
1. Go to [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub repository: `pra-labs/gem-analyser`.
3. In **Project Settings**:
   - **Root Directory**: Select `app` (Click Edit ➔ `app`).
   - **Framework Preset**: Next.js (automatically detected).
4. Click **Deploy**.

### Method B: Via Vercel CLI
```bash
cd app
npx vercel
```

---

## ⚡ Option 2: Deploy to Cloudflare Pages

The codebase has zero Node-specific runtime dependencies (uses pure ESM JSON bundling and edge-compliant Next.js patterns).

### Method A: Cloudflare Dashboard (Next.js)
1. Go to **Cloudflare Dashboard ➔ Workers & Pages ➔ Create application ➔ Pages ➔ Connect to Git**.
2. Select `pra-labs/gem-analyser`.
3. Set Build Settings:
   - **Root directory**: `/app`
   - **Build command**: `npx @cloudflare/next-on-pages@1`
   - **Output directory**: `.vercel/output/static`
   - **Compatibility flags**: Add `nodejs_compat`
4. Click **Save and Deploy**.

### Method B: Cloudflare Static Export (`next export`)
To run completely statically on Cloudflare Pages without a worker:
```bash
cd app
NEXT_EXPORT=true npm run build
# Deploy the generated `app/out` directory to Cloudflare Pages
```
