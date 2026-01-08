# Job Portal - Complete Features Documentation

## Overview
This document provides a comprehensive overview of all features implemented in the Job Portal system.

---

## 1. Authentication & Authorization

### User Registration
- **Endpoint**: `POST /api/auth/register`
- **Features**:
  - Email and password validation
  - Automatic user creation in Supabase Auth
  - User profile creation in database
  - Default role assignment (user)
  - Admin role can be assigned during registration

### User Login
- **Endpoint**: `POST /api/auth/login`
- **Features**:
  - Email and password authentication
  - JWT token generation
  - User session management
  - Role-based redirect (user → dashboard, admin → admin panel)

### Role-Based Access Control
- **User Role**: Can view and apply for jobs
- **Admin Role**: Full system access including job management
- **Protected Routes**: Automatic redirect for unauthorized access
- **Middleware**: Server-side role verification

---

## 2. User Features

### Job Browsing
- **Page**: `/dashboard`
- **Features**:
  - View all active jobs
  - See job details (title, description, skills, experience, deadline)
  - Filter automatically (only active jobs with future deadlines)
  - Visual deadline display
  - Skill tags for quick scanning

### Job Application
- **Page**: `/apply/:jobId`
- **Features**:
  - Auto-fill user information
  - Resume upload (PDF only, max 5MB)
  - Real-time file validation
  - Resume storage in Wasabi S3
  - Automatic ATS score calculation
  - Prevent duplicate applications
  - Deadline validation

### Application Tracking
- **Page**: `/my-applications`
- **Features**:
  - View all submitted applications
  - See application status (pending, shortlisted, rejected)
  - View ATS scores
  - Download submitted resumes
  - Visual progress bars
  - Application date tracking
  - Color-coded status indicators

---

## 3. Admin Features

### Dashboard
- **Page**: `/admin`
- **Features**:
  - Statistics overview:
    - Total jobs count
    - Active jobs count
    - Total applications count
    - Shortlisted candidates count
  - View all jobs (active and expired)
  - Job status indicators (Active, Expired, Ended)
  - Quick actions (View, End, Delete)

### Job Management

#### Create Job
- **Page**: `/admin/create-job`
- **Features**:
  - Job title input
  - Rich description textarea
  - Skills input (comma-separated)
  - Experience level dropdown
  - Deadline date picker
  - Future date validation
  - Auto-activation on creation

#### Edit Job
- **Features**:
  - Update job details
  - Change deadline
  - Modify requirements
  - Preserve existing applications

#### Delete Job
- **Features**:
  - Confirmation dialog
  - Cascade delete applications
  - Permanent removal

#### End Application
- **Features**:
  - Manual application closure
  - Automatic candidate evaluation
  - Top 30% → Shortlisted
  - Bottom 70% → Rejected
  - Email notifications to all candidates
  - Job marked as inactive
  - Statistics display (shortlisted/rejected counts)

### Application Management
- **Page**: `/admin/applications`
- **Features**:
  - View all applications across all jobs
  - Advanced filtering:
    - By job
    - By status (pending, shortlisted, rejected)
    - By minimum ATS score
  - Candidate information display:
    - Name and email
    - Applied job
    - Application date
    - ATS score
    - Current status
  - Download resumes
  - Table view with sorting

### Top Candidates
- **Page**: `/admin/top-candidates`
- **Features**:
  - Rank candidates by ATS score
  - Configurable limit (10, 20, 50, 100)
  - Visual ranking indicators:
    - 1st place: Gold trophy
    - 2nd place: Silver trophy
    - 3rd place: Bronze trophy
  - Candidate details:
    - Name and email
    - Applied job
    - ATS score with progress bar
    - Application status
  - Resume download
  - Color-coded score visualization

---

## 4. ATS (Applicant Tracking System)

### Score Calculation
- **Algorithm**:
  - Parse job skills (comma-separated)
  - Match skills with resume content
  - Calculate base score (skill match percentage × 70)
  - Add random bonus (0-30 points) for variation
  - Final score: 0-100

### Score Display
- **User View**: See own scores on applications
- **Admin View**: See all scores, filter by minimum score
- **Visual Indicators**:
  - Green (80-100): Excellent match
  - Yellow (60-79): Good match
  - Orange (40-59): Fair match
  - Red (0-39): Poor match

### Use Cases
- Automatic candidate ranking
- Shortlist determination (top 30%)
- Filter candidates by score threshold
- Top candidates identification

---

## 5. Email Notification System

### Email Triggers
1. **Manual Application End**: Admin clicks "End Application"
2. **Automatic Expiry**: Daily cron job checks deadlines

### Email Types

#### Shortlisted Email
- **To**: Top 30% candidates (by ATS score)
- **Subject**: "You are shortlisted"
- **Content**:
  - Personalized greeting
  - Job title
  - Congratulatory message
  - Next steps information

#### Rejected Email
- **To**: Bottom 70% candidates
- **Subject**: "Application Update"
- **Content**:
  - Personalized greeting
  - Job title
  - Professional rejection message
  - Encouragement to apply for other positions

### Email Service
- **Provider**: Supabase Auth Admin API
- **Features**:
  - HTML email templates
  - Bulk sending support
  - Error handling
  - Delivery tracking

---

## 6. Job Expiry System

### Automatic Expiry
- **Scheduler**: Node-cron (daily at midnight)
- **Process**:
  1. Check all active jobs
  2. Compare deadline with current date
  3. If deadline passed:
     - Evaluate all applications
     - Sort by ATS score (descending)
     - Shortlist top 30%
     - Reject bottom 70%
     - Send email notifications
     - Mark job as inactive

### Manual Expiry
- **Admin Action**: Click "End Application" button
- **Process**: Same as automatic expiry
- **Immediate**: Executes instantly (no waiting for cron)

### Expiry Indicators
- **User View**: Expired jobs hidden from listing
- **Admin View**:
  - "Expired" badge (red) for deadline-passed jobs
  - "Ended" badge (gray) for manually ended jobs

---

## 7. Resume Management

### Upload System
- **Storage**: Wasabi S3 (AWS S3 compatible)
- **File Format**: PDF only
- **File Size**: Maximum 5MB
- **Naming**: `{userId}_{jobId}.pdf`
- **Access**: Public read (via URL)

### Validation
- File type check (PDF only)
- File size check (5MB limit)
- Duplicate prevention (one application per user per job)

### Download
- Direct URL access
- Download links in admin panel
- Resume preview capability

---

## 8. Security Features

### Database Security
- **Row Level Security (RLS)**: Enabled on all tables
- **Policies**:
  - Users can read own data only
  - Admins can read all data
  - Users can create own applications
  - Admins can update application statuses
  - Job viewing restricted to active jobs for users

### Authentication Security
- JWT token-based authentication
- Token stored in localStorage
- Token sent in Authorization header
- Server-side token verification
- Automatic token refresh

### API Security
- Protected routes (authentication required)
- Role-based middleware
- Request validation
- Error handling without data leakage
- CORS configuration

### File Upload Security
- Type validation (PDF only)
- Size limits (5MB)
- Unique naming to prevent conflicts
- Secure S3 bucket configuration

---

## 9. User Interface

### Design System
- **Framework**: Tailwind CSS
- **Color Scheme**:
  - Primary: Slate (neutral, professional)
  - Success: Green (shortlisted, active)
  - Warning: Yellow/Orange (pending)
  - Error: Red (rejected, expired)
- **Icons**: Lucide React
- **Layout**: Responsive (mobile, tablet, desktop)

### Page Components

#### Navigation
- **User Nav**: Dashboard, My Applications, Logout
- **Admin Nav**: Dashboard, Applications, Top Candidates, Logout
- Role indicator badge

#### Forms
- Clean, spacious input fields
- Clear labels and placeholders
- Validation error messages
- Loading states
- Success feedback

#### Lists & Tables
- Card-based layouts for jobs
- Table view for applications
- Status badges
- Action buttons
- Hover effects

#### Feedback
- Loading spinners
- Success messages
- Error alerts
- Confirmation dialogs
- Empty states

---

## 10. Technical Architecture

### Frontend Architecture
- **Router**: React Router DOM
- **State Management**: React Context (Auth)
- **API Layer**: Centralized service files
- **Type Safety**: TypeScript
- **Build Tool**: Vite

### Backend Architecture
- **Framework**: Express.js
- **Structure**: MVC pattern
  - Controllers: Business logic
  - Routes: Endpoint definitions
  - Middleware: Authentication, validation
  - Services: External integrations
- **Database**: Supabase PostgreSQL
- **Storage**: Wasabi S3
- **Scheduler**: Node-cron

### Data Flow
1. User action → Frontend
2. API call → Backend endpoint
3. Middleware → Authentication/validation
4. Controller → Business logic
5. Service → External service (DB, storage, email)
6. Response → Frontend
7. UI update

---

## 11. API Documentation

### Response Format
```json
{
  "data": {},
  "error": null
}
```

### Error Format
```json
{
  "error": "Error message"
}
```

### Authentication Header
```
Authorization: Bearer {jwt_token}
```

### Rate Limiting
- Not implemented (add if needed)

### Pagination
- Not implemented (add if needed for large datasets)

---

## 12. Monitoring & Logging

### Backend Logs
- Server startup confirmation
- API request logging
- Error logging
- Scheduler execution logs
- Email sending logs

### Frontend Logs
- Authentication state changes
- API errors
- File upload progress
- Navigation events

---

## 13. Future Enhancement Ideas

### Potential Features
1. **Real-time Notifications**: WebSocket for instant updates
2. **Advanced Filters**: More search criteria
3. **Analytics Dashboard**: Charts and graphs
4. **Interview Scheduling**: Calendar integration
5. **Video Interviews**: Video call integration
6. **Skill Assessment**: Online coding tests
7. **Multi-language Support**: i18n
8. **Mobile App**: React Native version
9. **Export Features**: CSV/PDF exports
10. **Advanced ATS**: AI-powered resume parsing

### Performance Optimizations
1. Implement caching (Redis)
2. Add pagination for large lists
3. Lazy loading for images
4. Code splitting
5. Database query optimization
6. CDN for static assets

### Security Enhancements
1. Rate limiting
2. CAPTCHA for registration
3. Two-factor authentication
4. Password strength requirements
5. Session timeout
6. Activity logging
7. IP whitelisting for admin

---

## Conclusion

This job portal is a production-ready system with comprehensive features for both job seekers and administrators. It includes authentication, job management, application tracking, ATS scoring, automated emails, and role-based access control. The system is built with modern technologies and follows best practices for security, scalability, and maintainability.
