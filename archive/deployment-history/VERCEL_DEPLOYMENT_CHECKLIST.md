# ✅ Vercel Deployment Checklist

## Into The Wild - Quick Reference

**Use this checklist while deploying to track your progress.**

---

## 📋 Phase 1: Pre-Deployment (30 min)

### Code Cleanup

- [ ] Remove console.log statements from these files:
  - [ ] `src/components/trek/TrekDiscussion.tsx`
  - [ ] `src/components/Header.tsx`
  - [ ] `src/pages/TrekEvents.tsx`
  - [ ] `src/components/profile/ProfileForm.tsx`
  - [ ] `src/components/dashboard/UserTreks.tsx`

### Build Verification

- [ ] Run `npm ci` (clean install)
- [ ] Run `npm run build` (success)
- [ ] Run `npm run preview` (test locally)
- [ ] Run `npm run lint` (no errors)
- [ ] Run `npm run test:run` (all pass)
- [ ] Verify `dist/` folder created

---

## 📋 Phase 2: Supabase Setup (30 min)

### Database

- [ ] Login: `supabase login`
- [ ] Link project: `supabase link --project-ref YOUR_REF`
- [ ] Check migrations: `supabase db remote commit`
- [ ] Push migrations: `supabase db push`

### Verify Functions

- [ ] `get_trek_participant_count` exists
- [ ] `create_notification` exists
- [ ] `mark_notification_as_read` exists
- [ ] `get_user_notifications` exists
- [ ] `is_admin` exists

### Auth Configuration

- [ ] Add Vercel domain to redirect URLs
- [ ] Set site URL to production domain
- [ ] Verify Google OAuth config (if enabled)
- [ ] Check email templates

### Storage Buckets

- [ ] `payment-proofs` bucket (private)
- [ ] `avatars` bucket (public)
- [ ] `trek-images` bucket (public)
- [ ] Storage policies configured

### Environment Variables (Save These!)

```
VITE_SUPABASE_URL=___________________________
VITE_SUPABASE_ANON_KEY=____________________
```

---

## 📋 Phase 3: Vercel Deployment (45 min)

### Connect Repository

- [ ] Go to vercel.com/dashboard
- [ ] Click "Add New Project"
- [ ] Import "into-the-wild" repo
- [ ] Select framework: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Node version: 18.x

### Add Environment Variables

Add these in Vercel Dashboard → Environment Variables:

- [ ] `VITE_SUPABASE_URL` (from Supabase)
- [ ] `VITE_SUPABASE_ANON_KEY` (from Supabase)
- [ ] `VITE_APP_NAME=Into The Wild`
- [ ] `VITE_APP_VERSION=1.0.0`
- [ ] `VITE_APP_ENV=production`
- [ ] `VITE_MAX_FILE_SIZE=2097152`
- [ ] `VITE_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp`
- [ ] `VITE_RATE_LIMIT_REQUESTS=10`
- [ ] `VITE_RATE_LIMIT_WINDOW=60000`
- [ ] `VITE_ENABLE_GOOGLE_AUTH=true`
- [ ] `VITE_ENABLE_FILE_UPLOADS=true`
- [ ] `VITE_ENABLE_ANALYTICS=false`

**Important:** Check all three environments (Production, Preview, Development)

### Deploy

- [ ] Click "Deploy"
- [ ] Wait for build (2-3 minutes)
- [ ] Note deployment URL: `_________________________`

---

## 📋 Phase 4: Post-Deployment Config (30 min)

### Custom Domain (Optional)

- [ ] Add domain in Vercel
- [ ] Configure DNS records
- [ ] Update Supabase auth URLs

### Automatic Deployments

- [ ] Enable auto-deploy from `main` branch
- [ ] Enable preview deployments for PRs
- [ ] Configure branch protection in GitHub

### Monitoring

- [ ] Enable Vercel Analytics
- [ ] Enable Speed Insights
- [ ] Set up error tracking (Sentry/LogRocket)
- [ ] Configure uptime monitoring (UptimeRobot)

---

## 📋 Phase 5: Testing (30 min)

### Authentication

- [ ] Sign up new user
- [ ] Sign in with email/password
- [ ] Sign in with Google (if enabled)
- [ ] Password reset flow
- [ ] Sign out

### User Features

- [ ] View trek events
- [ ] Filter/search treks
- [ ] View trek details
- [ ] Register for trek
- [ ] Upload payment proof
- [ ] View/edit profile
- [ ] Upload avatar
- [ ] View notifications

### Admin Features

- [ ] Access admin dashboard
- [ ] View pending verifications
- [ ] Approve/reject registrations
- [ ] Create new trek
- [ ] Edit trek
- [ ] Manage participants

### Performance

- [ ] Run Lighthouse audit
- [ ] Performance score > 85: \_\_\_
- [ ] Accessibility > 90: \_\_\_
- [ ] Best Practices > 90: \_\_\_
- [ ] SEO > 85: \_\_\_

### Security

- [ ] Test RLS policies
- [ ] Verify file upload limits
- [ ] Check security headers
- [ ] Test HTTPS

### Mobile & Browser

- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] Tablet
- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] Desktop Safari

---

## 📋 Phase 6: Launch

### Pre-Launch

- [ ] All tests passed
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Team notified
- [ ] Documentation updated

### Launch

- [ ] Announce to users
- [ ] Monitor error logs (first hour)
- [ ] Check user feedback
- [ ] Verify analytics tracking

### Post-Launch (24 hours)

- [ ] No critical errors
- [ ] Performance stable
- [ ] User feedback positive
- [ ] Usage analytics normal

---

## 🚨 Emergency Rollback

If something goes wrong:

1. **Immediate Rollback:**
   - Go to Vercel Dashboard → Deployments
   - Find last working deployment
   - Click "..." → "Promote to Production"

2. **Check These First:**
   - [ ] Environment variables correct?
   - [ ] Supabase connection working?
   - [ ] Build logs show errors?
   - [ ] Browser console errors?

---

## 📞 Support Resources

**Vercel:**

- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- Support: https://vercel.com/help

**Supabase:**

- Dashboard: https://supabase.com/dashboard
- Docs: https://supabase.com/docs
- Support: https://supabase.com/support

---

## ✅ Deployment Complete!

**Final Checks:**

- [ ] Production URL working: ************\_************
- [ ] Custom domain working: ************\_************
- [ ] All features tested
- [ ] Monitoring active
- [ ] Team notified
- [ ] Users can access

**Congratulations! 🎉**

---

**Checklist Version:** 1.0  
**Date Deployed:** ****\_\_****  
**Deployed By:** ****\_\_****  
**Production URL:** ****\_\_****  
**Notes:**

---

---

---
