# Deploy Assignment Planner to Vercel

Use **Vercel** (not Firebase) for this app. It uses Astro SSR, API routes, and auth middleware — Vercel supports that natively. Firebase would require a full rewrite.

Production domain: **https://assignmentplanner.org**

---

## 1. Push code to GitHub

```bash
# from project root
git add .
git commit -m "Prepare for Vercel deployment"
```

Create a repo on GitHub (https://github.com/new), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/assignment-planner.git
git branch -M main
git push -u origin main
```

`.env` is gitignored — secrets never go in the repo.

---

## 2. Deploy on Vercel

1. Go to https://vercel.com and sign in with GitHub
2. **Add New → Project** → import your `assignment-planner` repo
3. Framework: **Astro** (auto-detected)
4. Before deploying, open **Environment Variables** and add:

| Name | Value | Environments |
|------|-------|--------------|
| `SUPABASE_URL` | `https://eupjgmmqykamkvvalara.supabase.co` | Production, Preview, Development |
| `SUPABASE_PUBLISHABLE_KEY` | your `sb_publishable_...` key | Production, Preview, Development |
| `SUPABASE_SECRET_KEY` | your `sb_secret_...` key | Production, Preview, Development |
| `PUBLIC_SOURCE_URL` | your GitHub repo URL (optional) | Production, Preview, Development |

5. Click **Deploy**

First deploy gives you a URL like `assignment-planner.vercel.app`.

---

## 3. Custom domain + SSL (assignmentplanner.org)

SSL is **automatic** on Vercel once DNS is correct. No separate certificate step.

1. Vercel project → **Settings → Domains**
2. Add `assignmentplanner.org` and `www.assignmentplanner.org`
3. Vercel shows DNS records — add them at your domain registrar (where you bought `.org`):

**Typical setup (Vercel will show exact values):**

| Type | Name | Value |
|------|------|-------|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

4. Wait for DNS propagation (minutes to a few hours)
5. Vercel issues SSL automatically — you'll see a green checkmark on the domain

Set **www → apex redirect** in Vercel if you want one canonical URL.

---

## 4. Supabase URL configuration

Supabase dashboard → **Authentication → URL Configuration**

| Setting | Value |
|---------|-------|
| **Site URL** | `https://assignmentplanner.org` |
| **Redirect URLs** | `https://assignmentplanner.org/confirm` |
| | `https://assignmentplanner.org/api/auth/callback` |
| | `http://localhost:4321/api/auth/callback` (keep for local dev) |

Save. Auth emails and OAuth redirects will use production URL.

---

## 5. Resend — verify assignmentplanner.org

1. Resend → **Domains → Add Domain** → `assignmentplanner.org`
2. Add the DNS records Resend gives you at your registrar:

   - **SPF** (TXT)
   - **DKIM** (TXT or CNAME)
   - Optional: **DMARC** (TXT) — recommended

3. Wait for verification (green check in Resend)

### Update Supabase SMTP sender

**Authentication → Emails → SMTP Settings**

| Field | Value |
|-------|-------|
| Host | `smtp.resend.com` |
| Port | `587` |
| Username | `resend` |
| Password | your Resend API key |
| Sender email | `no-reply@assignmentplanner.org` |
| Sender name | `Assignment Planner` |

### Bump email rate limit

**Authentication → Rate Limits → Email sent** → raise as needed (e.g. 100/hour).

---

## 6. Local development

Copy `.env.example` to `.env` and fill in values. Local dev still uses `http://localhost:4321`.

```bash
npm install
npm run dev
```

---

## Checklist

- [ ] Code on GitHub (no `.env` committed)
- [ ] Vercel project deployed with env vars
- [ ] `assignmentplanner.org` DNS pointing to Vercel
- [ ] SSL active on Vercel (automatic)
- [ ] Supabase Site URL + redirect URLs updated
- [ ] Resend domain verified
- [ ] Supabase SMTP sender = `no-reply@assignmentplanner.org`
- [ ] Test: sign up on production → confirm email → dashboard

---

## Why not Firebase?

Firebase Hosting is built for static sites + Cloud Functions. This app uses Astro SSR with middleware and API routes. Vercel's `@astrojs/vercel` adapter handles that with zero extra config.
