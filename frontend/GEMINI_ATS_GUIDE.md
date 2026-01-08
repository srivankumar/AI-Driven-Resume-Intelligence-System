# Gemini AI ATS Scoring System

## Overview

The Job Portal now features an advanced ATS (Applicant Tracking System) powered by Google's Gemini AI. This system provides intelligent resume analysis and scoring based on job requirements.

## How It Works

### 1. Resume Upload Flow
```
User uploads PDF resume
    ↓
Resume text extracted from PDF
    ↓
Gemini AI analyzes resume against job requirements
    ↓
ATS score calculated (0-100)
    ↓
Score saved to Supabase
    ↓
Resume stored in Wasabi S3
```

### 2. ATS Scoring Factors

The Gemini AI evaluates resumes on:

- **Skill Matching (40%)**
  - Extracts skills from resume
  - Compares with required skills
  - Identifies matching and missing skills

- **Experience Level (30%)**
  - Evaluates years of experience
  - Matches required experience level
  - Assesses job title relevance

- **Education Relevance (20%)**
  - Checks educational qualifications
  - Matches degree requirements
  - Evaluates specializations

- **Overall Fit (10%)**
  - General alignment with role
  - Career progression fit
  - Industry experience

### 3. Gemini API Integration

**Model Used**: `gemini-pro`

**Features**:
- Advanced NLP for resume parsing
- Contextual understanding of requirements
- Structured JSON response format
- Fallback scoring if API fails

**API Endpoint**: Google Generative AI

## Configuration

### Environment Variables

```env
GEMINI_API_KEY=AIzaSyDkhC9tV0AxF4TRz7I5GVu7ihfqiqcORgU
```

### Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to your `.env` file

## Backend Implementation

### Gemini ATS Service (`services/gemini-ats.js`)

```javascript
// Extract text from PDF
const resumeText = await extractResumeText(pdfBuffer);

// Calculate ATS score using Gemini
const atsData = await calculateAdvancedATSScore(
  jobSkills,
  jobDescription,
  resumeText
);

// Returns:
{
  score: 82,
  matchedSkills: ['React', 'Node.js'],
  missingSkills: ['TypeScript'],
  reasoning: 'Strong technical skills with 3+ years experience',
  details: {
    experienceMatch: 85,
    educationMatch: 80
  }
}
```

### Functions Available

#### `extractResumeText(pdfBuffer)`
Extracts readable text from PDF file

**Returns**: String (resume text)

#### `calculateAdvancedATSScore(jobSkills, jobDescription, resumeText)`
Analyzes resume using Gemini AI

**Parameters**:
- `jobSkills`: Comma-separated skill requirements
- `jobDescription`: Full job description
- `resumeText`: Extracted resume text

**Returns**:
```javascript
{
  score: 0-100,
  matchedSkills: [],
  missingSkills: [],
  reasoning: string,
  details: {
    experienceMatch: 0-100,
    educationMatch: 0-100
  }
}
```

#### `updateATSInSupabase(supabase, applicationId, atsData)`
Updates ATS score in Supabase

**Returns**: Updated application record or null

## Wasabi S3 Configuration

### Credentials Setup

```env
WASABI_ACCESS_KEY=X969EKX68T0G6OXK33QE
WASABI_SECRET_KEY=R7eeSzJ9V1PaBNA3tt2JSk8cRqY2EeGe26dFwbK2
WASABI_BUCKET=project-carrear-portal
WASABI_REGION=ap-northeast-2
WASABI_ENDPOINT=https://s3.ap-northeast-2.wasabisys.com
```

### Resume Storage

- **Location**: `resumes/{userId}_{jobId}_{timestamp}.pdf`
- **Access**: Public read (via URL)
- **Permissions**: ACL: public-read
- **Bucket**: project-carrear-portal (ap-northeast-2)

### Upload Process

1. User uploads PDF
2. File validated (PDF only, max 5MB)
3. Uploaded to Wasabi S3
4. Public URL returned
5. URL stored in Supabase

## Usage Example

### Frontend Application Submission

```typescript
// User applies for job
const response = await applicationApi.apply(jobId, resumeFile);

// Response includes ATS details
{
  application: {
    id: "abc123",
    ats_score: 82,
    status: "pending",
    ...
  },
  atsDetails: {
    score: 82,
    matchedSkills: ["React", "Node.js"],
    missingSkills: ["TypeScript"],
    reasoning: "Strong technical skills match"
  }
}
```

### Admin Views ATS Scores

1. Navigate to **Applications** page
2. See all candidates ranked by ATS score
3. Filter by minimum score (e.g., >= 70)
4. View top candidates page

## Error Handling

### Gemini API Fails
- System falls back to skill-based matching
- Score calculated using basic algorithm
- User notified of fallback scoring

### PDF Parsing Fails
- Logs error
- Uses fallback ATS calculation
- Application still processed

### Wasabi Upload Fails
- Error returned to user
- Application not created
- User prompted to retry

## Performance Considerations

### API Calls
- Gemini API called once per application
- ~5-10 seconds per analysis
- Asynchronous processing

### Caching
- Results stored in Supabase
- No duplicate analysis for same resume
- Fast retrieval for admin queries

### Rate Limiting
- No built-in rate limiting (configure if needed)
- Wasabi API rate limits: Standard tier
- Gemini API: 60 requests/minute (free tier)

## Data Storage

### Supabase
```sql
applications table:
- ats_score: integer (0-100)
- resume_url: text (Wasabi URL)
```

### Wasabi
- Resume files in `project-carrear-portal` bucket
- Region: ap-northeast-2
- Access: Public (read-only)

## Monitoring & Logs

### Backend Logs

```
// Resume uploaded
[INFO] Uploading to Wasabi: project-carrear-portal/resumes/...

// Gemini API called
[INFO] Analyzing resume with Gemini AI

// ATS score calculated
[INFO] ATS Score: 82 (0-100)

// Score stored in Supabase
[INFO] ATS score updated in Supabase
```

### Error Logs

```
[ERROR] PDF parsing error: ...
[ERROR] Gemini ATS error: ...
[ERROR] Wasabi upload error: ...
[ERROR] Supabase update error: ...
```

## Testing

### Test Application Submission

```bash
# 1. Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'

# 2. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# 3. Create job (as admin)
curl -X POST http://localhost:3001/api/jobs \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Developer",
    "description":"Looking for React developer",
    "skills":"React, Node.js",
    "experience":"2-4 years",
    "application_deadline":"2024-12-31"
  }'

# 4. Apply with resume
curl -X POST http://localhost:3001/api/applications/apply \
  -H "Authorization: Bearer TOKEN" \
  -F "jobId=JOB_ID" \
  -F "resume=@resume.pdf"

# Response includes ATS score
```

## Production Deployment

### Configuration

1. Set Gemini API key in production environment
2. Configure Wasabi credentials
3. Ensure Supabase connection is secure
4. Set appropriate CORS headers

### Scaling

- Gemini API handles concurrent requests
- Wasabi S3 auto-scales
- Supabase auto-scales
- Backend can handle multiple concurrent uploads

### Backup & Recovery

- Resumes stored in Wasabi (backed up)
- ATS scores stored in Supabase (backed up)
- Gemini analysis can be re-run if needed

## Troubleshooting

### Issue: Gemini API Key Invalid
**Solution**: Verify API key in .env file and ensure it's active

### Issue: Wasabi Upload Fails
**Solution**:
- Check AWS credentials
- Verify bucket exists
- Check bucket permissions

### Issue: PDF Parsing Fails
**Solution**:
- Ensure file is valid PDF
- Check file size (max 5MB)
- Try with different PDF format

### Issue: ATS Score is 0
**Solution**:
- Check if skills are in resume
- Verify job skills are properly formatted
- Check Gemini API logs

## Advanced Usage

### Re-analyze Resume

```javascript
// Get resume from Wasabi
// Extract text
// Re-run Gemini analysis
// Update Supabase
```

### Bulk Analysis

```javascript
// Analyze all applications for a job
// Rank by ATS score
// Send emails to top candidates
```

### Custom Scoring

Modify `calculateAdvancedATSScore` to:
- Weight different factors
- Add custom criteria
- Integrate with other APIs

## API Reference

### Gemini Prompt Structure

The system sends this prompt to Gemini:

```
Analyze resume against job requirements:

JOB REQUIREMENTS:
- Skills: [job.skills]
- Description: [job.description]

RESUME TEXT:
[extracted text]

RETURN FORMAT (JSON):
{
  "matchedSkills": [],
  "missingSkills": [],
  "experienceMatch": 0-100,
  "educationMatch": 0-100,
  "overallScore": 0-100,
  "reasoning": "explanation"
}
```

## Future Enhancements

1. **Video Analysis**: Analyze video resumes
2. **Portfolio Check**: Analyze GitHub/portfolio links
3. **Skill Assessment**: Online coding tests integration
4. **Interview Prep**: AI interview questions based on resume
5. **Salary Prediction**: Estimate salary based on profile
6. **Career Path**: Suggest career growth opportunities

## Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Wasabi Documentation](https://wasabi.com/help)
- [Supabase Docs](https://supabase.com/docs)
- [PDF Parse Library](https://www.npmjs.com/package/pdf-parse)

## Support

For issues with:
- **Gemini API**: Check Google AI Studio console
- **Wasabi**: Check Wasabi dashboard
- **Supabase**: Check Supabase logs
- **Backend**: Check server logs and error messages
