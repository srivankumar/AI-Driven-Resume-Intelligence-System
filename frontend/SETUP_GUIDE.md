# Job Portal - Complete Setup Guide

This guide will walk you through setting up the entire job portal system from scratch.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Wasabi account (for resume storage)

## Step 1: Supabase Configuration

### 1.1 Create a Supabase Project
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Wait for the project to be fully provisioned

### 1.2 Get Your Credentials
Navigate to **Settings** > **API** and copy:
- `Project URL` (SUPABASE_URL)
- `anon public` key (SUPABASE_ANON_KEY)
- `service_role` key (SUPABASE_SERVICE_KEY)

### 1.3 Database Schema
The database migrations have already been applied via Supabase MCP tools. The following tables exist:
- `users` (id, name, email, role, created_at)
- `jobs` (id, title, description, skills, experience, application_deadline, is_active, created_at)
- `applications` (id, user_id, job_id, resume_url, ats_score, status, created_at)

### 1.4 Enable Email Service
1. Go to **Authentication** > **Email Templates**
2. Supabase email is enabled by default
3. Email notifications will be sent using Supabase Auth Admin API

## Step 2: Wasabi Configuration

### 2.1 Create Wasabi Account
1. Sign up at [Wasabi](https://wasabi.com)
2. Choose a plan (free tier available)

### 2.2 Create a Bucket
1. Go to Buckets section
2. Create a new bucket named `resumes`
3. Set bucket policy to allow public read access for resume URLs

### 2.3 Get Access Keys
1. Go to **Access Keys**
2. Create a new access key
3. Save the Access Key ID and Secret Access Key

## Step 3: Backend Setup

### 3.1 Install Dependencies
```bash
cd backend
npm install
```

### 3.2 Configure Environment Variables
Create a `.env` file in the `backend` directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

# Wasabi Configuration
WASABI_ACCESS_KEY=your_wasabi_access_key
WASABI_SECRET_KEY=your_wasabi_secret_key
WASABI_BUCKET=resumes
WASABI_REGION=us-east-1
WASABI_ENDPOINT=https://s3.wasabisys.com

# Server Configuration
PORT=3001
```

### 3.3 Start the Backend Server
```bash
npm start
```

The server will run on `http://localhost:3001`

### 3.4 Verify Backend is Running
Open your browser and visit:
```
http://localhost:3001/api/health
```

You should see:
```json
{
  "status": "ok",
  "message": "Job Portal API is running"
}
```

## Step 4: Frontend Setup

### 4.1 Install Dependencies
```bash
# From the root project directory
npm install
```

### 4.2 Start Development Server
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## Step 5: Create Admin Account

### Option 1: Via API
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### Option 2: Via Supabase Dashboard
1. Register a normal user account through the UI
2. Go to Supabase Dashboard > Table Editor > users
3. Find your user and change `role` from `user` to `admin`

## Step 6: Testing the Application

### 6.1 User Flow
1. **Register**: Go to `/register` and create a user account
2. **Login**: Login with your credentials
3. **Browse Jobs**: View active jobs on the dashboard
4. **Apply**: Click "Apply Now" and upload your resume (PDF only)
5. **Track**: Go to "My Applications" to see your application status and ATS score

### 6.2 Admin Flow
1. **Login**: Login with admin credentials
2. **Dashboard**: View statistics (total jobs, applications, etc.)
3. **Create Job**: Click "Create Job" and fill in the details
4. **View Applications**: See all candidate applications
5. **End Application**: Manually end applications or wait for auto-expiry
6. **Top Candidates**: View highest scoring candidates

## Step 7: Understanding the Features

### Automatic Job Expiry
- Jobs automatically expire when deadline passes
- A cron job runs daily at midnight
- Expired jobs trigger email notifications
- Top 30% candidates are shortlisted
- Bottom 70% are rejected

### Manual Application End
- Admin can manually end applications
- Click "End Application" button on any active job
- System evaluates all applications
- Emails are sent immediately to all candidates

### ATS Scoring
- Calculated automatically on application submission
- Based on skill matching
- Score range: 0-100
- Used for candidate ranking

### Email Notifications
Emails are sent when applications end:

**Shortlisted Email:**
- Subject: "You are shortlisted"
- Sent to top 30% candidates
- Contains job title and next steps

**Rejected Email:**
- Subject: "Application Update"
- Sent to remaining 70%
- Professional and encouraging

## Step 8: Production Deployment

### Backend Deployment (Railway/Render/AWS)
1. Push code to GitHub repository
2. Connect to your hosting service
3. Set all environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Update API URL in `src/services/api.ts`
2. Build: `npm run build`
3. Deploy `dist` folder
4. Configure redirects for SPA routing

## Troubleshooting

### Issue: "Cannot connect to backend"
- Ensure backend is running on port 3001
- Check CORS settings in `backend/server.js`
- Verify API_URL in frontend

### Issue: "Authentication failed"
- Check Supabase credentials
- Verify JWT token is being sent
- Check RLS policies in Supabase

### Issue: "Resume upload failed"
- Verify Wasabi credentials
- Check bucket permissions
- Ensure file is PDF and under 5MB

### Issue: "Emails not sending"
- Check Supabase service role key
- Verify email templates in Supabase
- Check logs in backend console

### Issue: "Database errors"
- Verify all tables exist in Supabase
- Check RLS policies are enabled
- Ensure foreign keys are set up correctly

## API Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Job (Admin)
```bash
curl -X POST http://localhost:3001/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Senior Developer",
    "description": "We are looking for...",
    "skills": "React, Node.js, TypeScript",
    "experience": "3-5 years",
    "application_deadline": "2024-12-31"
  }'
```

## Support

For issues or questions:
1. Check the README.md
2. Review this setup guide
3. Check backend logs
4. Review Supabase logs
5. Verify all environment variables

## Next Steps

After setup:
1. Customize email templates
2. Add more job fields if needed
3. Implement additional filters
4. Add analytics dashboard
5. Implement notification system
6. Add export features

## Security Checklist

- [ ] All environment variables are set
- [ ] RLS is enabled on all tables
- [ ] Admin accounts are properly secured
- [ ] File upload limits are enforced
- [ ] API routes are protected
- [ ] CORS is properly configured
- [ ] Secrets are not committed to Git

Congratulations! Your job portal is now fully set up and ready to use.
