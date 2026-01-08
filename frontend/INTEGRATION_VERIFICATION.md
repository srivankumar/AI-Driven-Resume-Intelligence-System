# Integration Verification Checklist

Complete guide to verify all integrations are working correctly.

## Pre-Setup Checklist

- [ ] Supabase account created
- [ ] Wasabi account created (project-carrear-portal bucket)
- [ ] Gemini API key generated
- [ ] Node.js v18+ installed
- [ ] Git repository setup

## Backend Configuration Verification

### 1. Environment Variables

Create `.env` file in backend directory:

```bash
cd backend
cat > .env << 'EOF'
# Supabase
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# Wasabi
WASABI_ACCESS_KEY=X969EKX68T0G6OXK33QE
WASABI_SECRET_KEY=R7eeSzJ9V1PaBNA3tt2JSk8cRqY2EeGe26dFwbK2
WASABI_BUCKET=project-carrear-portal
WASABI_REGION=ap-northeast-2
WASABI_ENDPOINT=https://s3.ap-northeast-2.wasabisys.com

# Gemini AI
GEMINI_API_KEY=AIzaSyDkhC9tV0AxF4TRz7I5GVu7ihfqiqcORgU

# Server
PORT=3001
EOF
```

**Verification**:
```bash
cat .env
# Should show all variables are set
```

### 2. Dependencies Installation

```bash
cd backend
npm install
```

**Check for**:
- [ ] No errors during installation
- [ ] All packages installed successfully
- [ ] `@google/generative-ai` present
- [ ] `pdf-parse` present

**Verify**:
```bash
npm ls @google/generative-ai
npm ls pdf-parse
npm ls aws-sdk
```

### 3. Backend Server Start

```bash
npm start
```

**Should see**:
```
Server running on port 3001
Health check: http://localhost:3001/api/health
Job expiry scheduler started (runs daily at midnight)
```

### 4. Health Check

In another terminal:

```bash
curl http://localhost:3001/api/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "message": "Job Portal API is running"
}
```

## Frontend Configuration Verification

### 1. Install Dependencies

```bash
npm install
```

**Check for**:
- [ ] React Router DOM installed
- [ ] No dependency conflicts
- [ ] All packages present

### 2. Build Frontend

```bash
npm run build
```

**Expected Output**:
```
vite v5.4.8 building for production...
✓ X modules transformed.
dist/index.html          X.XX kB
dist/assets/index-xxx.css  X.XX kB
dist/assets/index-xxx.js   XXX.XX kB
✓ built in X.XXs
```

### 3. Start Development Server

```bash
npm run dev
```

**Should see**:
```
VITE v5.4.8  ready in XXX ms

➜  Local:   http://localhost:5173/
```

## Database Verification

### 1. Supabase Connection

In Supabase Dashboard:

1. Go to **SQL Editor**
2. Run:

```sql
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
```

**Expected**: Should return 3+ tables (users, jobs, applications)

### 2. Check Tables Exist

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
```

**Expected Output**:
```
applications
jobs
users
```

### 3. Check RLS Policies

```sql
SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';
```

**Should see multiple policies** for each table

### 4. Test Query

```sql
SELECT * FROM users LIMIT 1;
```

## Wasabi Verification

### 1. Test Credentials

In backend, test file: `test-wasabi.js`

```javascript
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.WASABI_ACCESS_KEY,
  secretAccessKey: process.env.WASABI_SECRET_KEY,
  endpoint: process.env.WASABI_ENDPOINT,
  region: process.env.WASABI_REGION,
  s3ForcePathStyle: true,
});

s3.headBucket({ Bucket: process.env.WASABI_BUCKET }, (err) => {
  if (err) {
    console.error('Wasabi connection failed:', err);
  } else {
    console.log('Wasabi connection successful!');
  }
});
```

Run:
```bash
node test-wasabi.js
```

**Expected**: `Wasabi connection successful!`

### 2. Check Bucket Exists

In Wasabi Console:
1. Login to [console.wasabisys.com](https://console.wasabisys.com)
2. Go to **Buckets**
3. Verify `project-carrear-portal` exists
4. Check region is `ap-northeast-2`

### 3. Verify Bucket Permissions

1. Click bucket name
2. Go to **Settings**
3. Check **Access Control** allows public read

## Gemini AI Verification

### 1. Test Gemini API Key

In backend, test file: `test-gemini.js`

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const result = await model.generateContent('Say "Hello from Gemini"');
console.log(result.response.text());
```

Run:
```bash
node test-gemini.js
```

**Expected**: `Hello from Gemini`

### 2. Test PDF Parsing

In backend, test file: `test-pdf-parse.js`

```javascript
import pdfParse from 'pdf-parse';
import fs from 'fs';

const pdfPath = './test-resume.pdf';
const pdfBuffer = fs.readFileSync(pdfPath);

const data = await pdfParse(pdfBuffer);
console.log(`Extracted text length: ${data.text.length}`);
console.log(`Sample text: ${data.text.substring(0, 100)}...`);
```

**Expected**: Successfully extracts text from PDF

## Application Flow Testing

### 1. User Registration

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@test.com",
    "password": "test123456"
  }'
```

**Expected Response**:
```json
{
  "user": {
    "id": "uuid",
    "name": "Test User",
    "email": "test@test.com",
    "role": "user",
    "created_at": "timestamp"
  },
  "session": { ... }
}
```

✅ **Verification**: User created in Supabase

### 2. User Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test123456"
  }'
```

**Expected Response**: Returns `token` and `session`

✅ **Save the token for next steps**

### 3. Admin Registration

Create admin account:

```bash
# Option 1: Via API
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "admin123456",
    "role": "admin"
  }'

# Option 2: Via Supabase SQL
# UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';
```

### 4. Admin Login & Create Job

```bash
# Login as admin
ADMIN_TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123456"
  }' | jq -r '.token')

# Create job
curl -X POST http://localhost:3001/api/jobs \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior React Developer",
    "description": "Looking for experienced React developer with Node.js background",
    "skills": "React, Node.js, TypeScript, AWS",
    "experience": "3-5 years",
    "application_deadline": "2024-12-31"
  }'
```

**Expected**: Job created successfully

✅ **Save job ID**

### 5. Apply for Job with Resume

First, create a test PDF or use an existing resume.

```bash
curl -X POST http://localhost:3001/api/applications/apply \
  -H "Authorization: Bearer $USER_TOKEN" \
  -F "jobId=JOB_ID" \
  -F "resume=@./resume.pdf"
```

**Expected Response**:
```json
{
  "application": {
    "id": "uuid",
    "ats_score": 75,
    "status": "pending",
    "resume_url": "https://s3.ap-northeast-2.wasabisys.com/..."
  },
  "atsDetails": {
    "score": 75,
    "matchedSkills": ["React", "Node.js"],
    "missingSkills": ["AWS"],
    "reasoning": "..."
  }
}
```

✅ **Verifications**:
- [ ] Resume uploaded to Wasabi
- [ ] ATS score calculated (Gemini)
- [ ] Score saved to Supabase
- [ ] Resume URL is accessible

### 6. Verify Resume Upload

```bash
# Test resume download
curl -L "https://s3.ap-northeast-2.wasabisys.com/project-carrear-portal/resumes/..." \
  -o downloaded-resume.pdf

file downloaded-resume.pdf
# Should output: PDF document
```

✅ **Resume accessible**

### 7. View Applications (User)

```bash
curl http://localhost:3001/api/applications/my-applications \
  -H "Authorization: Bearer $USER_TOKEN"
```

**Expected**: Returns user's application with ATS score

✅ **Application visible to user**

### 8. View All Applications (Admin)

```bash
curl http://localhost:3001/api/applications/all \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected**: Returns all applications, sorted by ATS score

✅ **Admin can view all applications**

### 9. End Application (Trigger Emails & ATS)

```bash
curl -X PUT http://localhost:3001/api/jobs/JOB_ID/end \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response**:
```json
{
  "message": "Application ended and emails sent",
  "shortlisted": 1,
  "rejected": 0
}
```

✅ **Verifications**:
- [ ] Applications status updated in Supabase
- [ ] Top 30% marked "shortlisted"
- [ ] Bottom 70% marked "rejected"
- [ ] Emails sent (check Supabase logs)

### 10. Get Top Candidates

```bash
curl "http://localhost:3001/api/applications/top-candidates?limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected**: Returns top candidates by ATS score

✅ **Top candidates ranking working**

## Frontend Testing

### 1. Visit Login Page

```
http://localhost:5173/login
```

✅ **Should load without errors**

### 2. Register User

- Fill registration form
- Create account
- Should redirect to dashboard

✅ **User registered and logged in**

### 3. Browse Jobs

- Navigate to dashboard
- See active jobs list
- Each job shows title, skills, deadline

✅ **Jobs displayed correctly**

### 4. Apply for Job

- Click "Apply Now"
- See pre-filled user info
- Upload PDF resume
- Submit application

✅ **Application submitted, see ATS score**

### 5. View Applications

- Go to "My Applications"
- See all submitted applications
- See status (pending/shortlisted/rejected)
- See ATS score

✅ **Applications tracked correctly**

### 6. Admin Dashboard

- Login as admin
- See dashboard with stats
- Create new job
- View all applications
- View top candidates

✅ **Admin features working**

## Performance Verification

### 1. Backend Response Times

```bash
# Measure API response time
time curl http://localhost:3001/api/health
```

**Expected**: < 100ms

### 2. Application Submission Time

```bash
# Measure application submission (includes Gemini API call)
time curl -X POST http://localhost:3001/api/applications/apply \
  -H "Authorization: Bearer $TOKEN" \
  -F "jobId=..." \
  -F "resume=@resume.pdf"
```

**Expected**: 5-15 seconds (Gemini API processing)

### 3. Wasabi Upload Speed

**Expected**: < 5 seconds for 5MB file

### 4. Frontend Load Time

```bash
# Check bundle size
ls -lh dist/assets/
```

**Expected**:
- JS bundle: < 300KB
- CSS bundle: < 50KB

## Security Verification

### 1. JWT Token Validation

```bash
# Try accessing with invalid token
curl http://localhost:3001/api/applications/my-applications \
  -H "Authorization: Bearer invalid-token"
```

**Expected**: `401 Unauthorized`

✅ **Invalid tokens rejected**

### 2. Admin Access Control

```bash
# Try admin endpoint as regular user
curl http://localhost:3001/api/jobs \
  -H "Authorization: Bearer $USER_TOKEN"
```

**Expected**: `403 Forbidden`

✅ **Regular users can't access admin endpoints**

### 3. RLS Verification

In Supabase SQL:

```sql
-- Users can only see their own data
SELECT * FROM applications WHERE user_id != auth.uid();
```

**Expected**: Should enforce RLS policy

### 4. File Upload Validation

```bash
# Try uploading non-PDF file
curl -X POST http://localhost:3001/api/applications/apply \
  -H "Authorization: Bearer $TOKEN" \
  -F "jobId=..." \
  -F "resume=@file.txt"
```

**Expected**: Rejected, "Only PDF files allowed"

✅ **File validation working**

## Error Handling Verification

### 1. Missing Credentials

Try API call without auth header:

```bash
curl http://localhost:3001/api/applications/my-applications
```

**Expected**: `401 No token provided`

✅ **Error handled gracefully**

### 2. Invalid Job ID

```bash
curl http://localhost:3001/api/jobs/invalid-id \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: `404 Job not found`

✅ **Error handled**

### 3. Duplicate Application

Try applying twice for same job:

```bash
# First application
curl -X POST http://localhost:3001/api/applications/apply \
  -H "Authorization: Bearer $TOKEN" \
  -F "jobId=..." \
  -F "resume=@resume.pdf"

# Second application (should fail)
curl -X POST http://localhost:3001/api/applications/apply \
  -H "Authorization: Bearer $TOKEN" \
  -F "jobId=..." \
  -F "resume=@resume.pdf"
```

**Expected**: `400 Already applied for this job`

✅ **Duplicate prevention working**

## Database Verification

### 1. Check User Record

In Supabase SQL:

```sql
SELECT id, name, email, role FROM users WHERE email = 'test@test.com';
```

**Should return**: User record with role = 'user'

### 2. Check Job Record

```sql
SELECT id, title, is_active, application_deadline FROM jobs LIMIT 1;
```

**Should return**: Job with deadline in future

### 3. Check Application Record

```sql
SELECT id, user_id, job_id, ats_score, status FROM applications LIMIT 1;
```

**Should return**: Application with calculated ATS score

### 4. Check Indexes

```sql
SELECT indexname FROM pg_indexes WHERE tablename IN ('users', 'jobs', 'applications');
```

**Should return**: Multiple indexes for performance

## Final Verification Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] Supabase connected and tables exist
- [ ] Wasabi credentials working
- [ ] Gemini API key valid
- [ ] User registration works
- [ ] User login works
- [ ] Admin account created
- [ ] Job creation works
- [ ] Job application works
- [ ] Resume uploaded to Wasabi
- [ ] ATS score calculated
- [ ] Score stored in Supabase
- [ ] Emails send on application end
- [ ] Top candidates ranking works
- [ ] Admin views all applications
- [ ] Invalid requests rejected
- [ ] Errors handled gracefully
- [ ] Frontend loads without errors
- [ ] All pages accessible

## Production Ready?

If ALL checkboxes above are marked:

✅ **System is production-ready!**

## Deployment Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Database backups enabled
- [ ] Wasabi lifecycle policies set
- [ ] SSL certificates configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Monitoring set up
- [ ] Error logging configured
- [ ] Admin password changed
- [ ] Sensitive data removed from logs
- [ ] Database authenticated
- [ ] API secured
- [ ] File uploads scanned
- [ ] Email templates tested
- [ ] Load testing completed

## Support

For issues, check:
1. Backend logs: `npm start` output
2. Supabase logs: Dashboard > Logs
3. Wasabi logs: Dashboard > Logs
4. Frontend console: Browser DevTools

## Next Steps

After verification:

1. **Configure DNS**: Point domain to your server
2. **Set up SSL**: Install SSL certificate
3. **Scale infrastructure**: Configure load balancing if needed
4. **Set up monitoring**: Add error tracking and analytics
5. **Backup strategy**: Configure automated backups
6. **Support system**: Set up help desk/support

Congratulations! Your Job Portal is fully integrated and verified! 🚀
