# Website Maintenance & Incident Response Manual

**System**: Sri Srinivasa Canvassing Website & Administration Backend  
**Production URL**: `https://www.srinivascanvassing.com`  
**Location**: Miryalaguda, Telangana, India — 508207  

---

## 1. Maintenance Schedules

### Daily Maintenance
- [ ] **Website Availability**: Verify site loads cleanly at `https://www.srinivascanvassing.com`.
- [ ] **Market Rates Verification**: Confirm displayed market prices reflect dated indicative figures from Miryalaguda.
- [ ] **Enquiry Pipeline Check**: Check admin dashboard (`/admin`) for new bulk quote requests (RFQs).
- [ ] **Database Backup Verification**: Verify automated daily SQLite/PostgreSQL backup creation.
- [ ] **Price Error Triage**: Immediately address any incorrect price reports by switching status to `review_required` or `draft`.

### Weekly Maintenance
- [ ] **Test RFQ Submission**: Submit a test quote request with `[TEST]` prefix and verify RFQ reference ID generation.
- [ ] **Contact Links Audit**: Test WhatsApp links (`wa.me/919866760028`), telephone click-to-call, and email links.
- [ ] **Media & Cloudinary Audit**: Verify product images load cleanly without broken image icons or CDN failures.
- [ ] **Spam & Log Inspection**: Review contact honeypot logs and clear spam entries.
- [ ] **Rate Audit Log Audit**: Review `RateAuditLog` for unusual rate spikes or unauthorized changes.

### Monthly Maintenance
- [ ] **Google Search Console**: Review indexation coverage, canonical status, and sitemap health (`sitemap.xml`).
- [ ] **Core Web Vitals**: Run Lighthouse/PageSpeed audit targeting LCP < 2.5s, INP < 200ms, CLS < 0.1.
- [ ] **Dependency Security Audit**: Run `npm audit` and python safety checks for non-breaking security updates.
- [ ] **Backup Restoration Test**: Perform a dry-run database restore from monthly backup to a test environment.
- [ ] **Accessibility Walkthrough**: Test keyboard navigation (Tab/Shift+Tab), screen reader labels, and 200% browser zoom.

### Quarterly Maintenance
- [ ] **Product Specification Review**: Verify rice variety moisture, sortexing, and packaging options with mill partners.
- [ ] **Structured Data Audit**: Validate JSON-LD schema using Schema.org and Google Rich Results tools.
- [ ] **Security Headers Audit**: Verify CSP, HSTS, X-Content-Type-Options, and Referrer-Policy headers.
- [ ] **Access & Credentials Recertification**: Review admin accounts and rotate JWT secret keys / API tokens.

### Annual Maintenance
- [ ] **Full Security Assessment**: Perform penetration check, CORS audit, and authentication review.
- [ ] **Domain & SSL/TLS Renewal**: Confirm domain registration and SSL certificate auto-renewals.
- [ ] **Legal Document Review**: Re-verify Privacy Policy, Terms, and Commodity Disclaimer with legal counsel.
- [ ] **Disaster Recovery Exercise**: Test full codebase and database recovery from scratch on clean server.

---

## 2. Incident Classification & Priority Matrix

| Priority Level | Response SLA | System Condition / Impact | Action Protocol |
|---|---|---|---|
| **Priority 1 (Critical)** | **< 30 Minutes** | Website completely unavailable, database outage, admin security breach, unverified pricing published, or broken lead submission. | 1. Immediately switch rate status to `withdrawn`.<br>2. Revert to latest verified release commit.<br>3. Restore database from last clean backup.<br>4. Notify business owner. |
| **Priority 2 (High)** | **< 4 Hours** | Individual product page crash, rate API failure, missing product images, or broken WhatsApp widget. | 1. Deploy controlled fallback state.<br>2. Inspect backend logs (`uvicorn` / `main.py`).<br>3. Fix and re-deploy targeted component. |
| **Priority 3 (Medium)** | **< 24 Hours** | Minor layout misalignment, typo in description, non-critical metadata update, or minor styling issue. | 1. Log issue in tracking record.<br>2. Resolve during routine maintenance window. |

---

## 3. Incident Tracking Record Template

```markdown
### Incident Report: [INCIDENT-ID]
- **Date & Time**: YYYY-MM-DD HH:MM IST
- **Priority Level**: P1 / P2 / P3
- **Affected System**: Frontend / Backend API / Database / Media CDN
- **Reporter**: Name / Admin
- **Assignee**: Developer / Lead
- **Symptom & Root Cause**: Brief description of what failed and why.
- **Remediation Action Taken**: Changes applied to resolve the issue.
- **Verification Result**: Test command or manual verification confirmation.
- **Completion Time**: Duration to resolve.
```

---

## 4. Backup & Rollback Procedures

### Database Backup Instructions
1. SQLite Backup Command:
   ```bash
   cp backend/market_data.db backend/backups/market_data_backup_$(date +%Y%m%d_%H%M%S).db
   ```
2. Verification:
   ```bash
   python3 -c "import sqlite3; conn = sqlite3.connect('backend/backups/market_data_backup_latest.db'); print('Tables:', conn.execute(\"SELECT name FROM sqlite_master WHERE type='table';\").fetchall())"
   ```

### Code Rollback Procedure
1. Identify the last clean commit hash:
   ```bash
   git log --oneline -n 10
   ```
2. Rollback working tree:
   ```bash
   git checkout <last_stable_commit_hash>
   ```
3. Re-build frontend production bundle:
   ```bash
   cd frontend && npm run build
   ```
4. Restart FastAPI backend:
   ```bash
   cd backend && uvicorn main:app --reload
   ```
