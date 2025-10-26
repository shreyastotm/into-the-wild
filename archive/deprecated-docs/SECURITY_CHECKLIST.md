# 🔒 Security Checklist for Production Deployment

## ✅ Pre-Deployment Security Checklist

### **Environment & Configuration**

- [ ] All environment variables properly configured (no hardcoded secrets)
- [ ] Production Supabase project configured with proper RLS policies
- [ ] Security headers configured (\_headers file)
- [ ] HTTPS enforced on hosting platform
- [ ] Error logging configured (sanitized messages)

### **Authentication & Authorization**

- [ ] Supabase Auth properly configured
- [ ] Google OAuth configured for production domain
- [ ] Admin role permissions properly restricted
- [ ] Session management configured securely
- [ ] Password reset flow tested

### **Data Security**

- [ ] All database queries use parameterized statements
- [ ] Row Level Security (RLS) policies active on all tables
- [ ] File upload restrictions properly configured
- [ ] User input validation on all forms
- [ ] XSS prevention measures in place

### **API Security**

- [ ] Rate limiting configured
- [ ] CORS properly configured for production domain
- [ ] API endpoints secured with proper authentication
- [ ] Error messages don't leak sensitive information
- [ ] File upload security measures active

### **Infrastructure Security**

- [ ] Domain configured with security headers
- [ ] SSL/TLS certificate properly configured
- [ ] CDN configured if applicable
- [ ] Backup strategy in place
- [ ] Monitoring and alerting configured

## 🚨 Critical Security Settings

### **Supabase Production Settings**

```sql
-- Ensure RLS is enabled on all tables
ALTER TABLE trek_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tent_requests ENABLE ROW LEVEL SECURITY;
-- ... etc for all tables
```

### **Environment Variables for Production**

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_APP_ENV=production
VITE_ENABLE_ANALYTICS=true
```

### **Vercel Environment Variables Setup**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the following variables:
   - `VITE_SUPABASE_URL` (your Supabase project URL)
   - `VITE_SUPABASE_ANON_KEY` (your production anon key)
   - `VITE_APP_ENV` = `production`

## 🛡️ Ongoing Security Maintenance

### **Weekly Checks**

- [ ] Review error logs for security issues
- [ ] Check failed login attempts
- [ ] Monitor API usage patterns
- [ ] Review user permissions and roles

### **Monthly Checks**

- [ ] Update dependencies for security patches
- [ ] Review and rotate API keys if needed
- [ ] Audit user accounts and permissions
- [ ] Test backup and recovery procedures

### **Quarterly Checks**

- [ ] Full security audit
- [ ] Penetration testing (if applicable)
- [ ] Review and update security policies
- [ ] Update security headers and CSP policies

## 🚫 What NOT to Do

### **Never Commit These to Git:**

- Production environment variables
- API keys or secrets
- User credentials
- Database connection strings
- Private keys or certificates

### **Never Log in Production:**

- User passwords
- Authentication tokens
- Credit card information
- Personal data (PII)
- Internal system details

## 📞 Incident Response Plan

### **If Security Incident Detected:**

1. **Immediate Actions:**
   - Revoke compromised API keys
   - Change affected user passwords
   - Block suspicious IP addresses
   - Document the incident

2. **Investigation:**
   - Review logs for scope of breach
   - Identify affected data/users
   - Determine attack vector
   - Assess damage

3. **Recovery:**
   - Patch security vulnerabilities
   - Restore from clean backups if needed
   - Implement additional security measures
   - Monitor for continued threats

4. **Communication:**
   - Notify affected users (if required)
   - Document lessons learned
   - Update security procedures
   - File any required breach notifications

## 🔍 Security Testing Commands

```bash
# Check for hardcoded secrets
npm audit
grep -r "password\|secret\|key" src/ --exclude-dir=node_modules

# Check dependencies for vulnerabilities
npm audit fix

# Build and test production bundle
npm run build
npm run preview

# Test security headers
curl -I https://your-domain.com
```

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Vercel Security](https://vercel.com/docs/concepts/deployment/security)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
