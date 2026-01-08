# Credentials & Configuration Guide

## All Credentials Summary

This guide contains all the credentials and configuration needed for the Job Portal.

### ⚠️ SECURITY WARNING

Never commit these credentials to public repositories. Use `.env` files and environment variables only.

## Wasabi S3 Configuration

### Account Details

```
Service: Wasabi Object Storage
Region: ap-northeast-2 (Seoul)
Bucket: project-carrear-portal
```

### Access Credentials

```
Access Key ID:     X969EKX68T0G6OXK33QE
Secret Access Key: R7eeSzJ9V1PaBNA3tt2JSk8cRqY2EeGe26dFwbK2
```

### Connection Details

```
Endpoint:   https://s3.ap-northeast-2.wasabisys.com
Bucket:     project-carrear-portal
Region:     ap-northeast-2
Protocol:   S3-compatible
```

### Backend Configuration

Add to `backend/.env`:

```env
WASABI_ACCESS_KEY=X969EKX68T0G6OXK33QE
WASABI_SECRET_KEY=R7eeSzJ9V1PaBNA3tt2JSk8cRqY2EeGe26dFwbK2
WASABI_BUCKET=project-carrear-portal
WASABI_REGION=ap-northeast-2
WASABI_ENDPOINT=https://s3.ap-northeast-2.wasabisys.com
```

### Usage

```javascript
// Upload resume to Wasabi
const resumeUrl = await uploadToWasabi(file, userId, jobId);
// Returns: https://s3.ap-northeast-2.wasabisys.com/project-carrear-portal/resumes/...

// Download resume (public link)
window.open(resumeUrl, '_blank');
```

## Gemini AI Configuration

### API Key

```
GEMINI_API_KEY: AIzaSyDkhC9tV0AxF4TRz7I5GVu7ihfqiqcORgU
```

### Backend Configuration

Add to `backend/.env`:

```env
GEMINI_API_KEY=AIzaSyDkhC9tV0AxF4TRz7I5GVu7ihfqiqcORgU
```

### Usage

```javascript
// Analyze resume and calculate ATS score
const atsData = await calculateAdvancedATSScore(
  jobSkills,
  jobDescription,
  resumeText
);
// Returns: { score: 82, matchedSkills: [...], missingSkills: [...] }
```

## Supabase Configuration

### Where to Get Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** > **API**
4. Copy the following:

### Required Credentials

```env
# From Supabase Dashboard > Settings > API
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

### Backend Configuration

Add to `backend/.env`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

### Database Connection

- **Tables**: users, jobs, applications
- **RLS**: Enabled on all tables
- **Policies**: Role-based access control
- **Auth**: Built-in email/password auth

## Server Configuration

### Backend Server

```env
PORT=3001
NODE_ENV=production  # or development
```

### Frontend Configuration

```env
VITE_API_URL=http://localhost:3001/api  # Development
VITE_API_URL=https://api.yourdomain.com/api  # Production
```

## Complete Backend .env Template

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_public_key
SUPABASE_SERVICE_KEY=your_service_role_key

# Wasabi S3 Configuration
WASABI_ACCESS_KEY=X969EKX68T0G6OXK33QE
WASABI_SECRET_KEY=R7eeSzJ9V1PaBNA3tt2JSk8cRqY2EeGe26dFwbK2
WASABI_BUCKET=project-carrear-portal
WASABI_REGION=ap-northeast-2
WASABI_ENDPOINT=https://s3.ap-northeast-2.wasabisys.com

# Gemini AI Configuration
GEMINI_API_KEY=AIzaSyDkhC9tV0AxF4TRz7I5GVu7ihfqiqcORgU

# Server Configuration
PORT=3001
NODE_ENV=development
```

## Quick Start with Credentials

### 1. Set up Backend

```bash
cd backend

# Create .env file with credentials above
cat > .env << 'EOF'
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_KEY=your_key
WASABI_ACCESS_KEY=X969EKX68T0G6OXK33QE
WASABI_SECRET_KEY=R7eeSzJ9V1PaBNA3tt2JSk8cRqY2EeGe26dFwbK2
WASABI_BUCKET=project-carrear-portal
WASABI_REGION=ap-northeast-2
WASABI_ENDPOINT=https://s3.ap-northeast-2.wasabisys.com
GEMINI_API_KEY=AIzaSyDkhC9tV0AxF4TRz7I5GVu7ihfqiqcORgU
PORT=3001
EOF

# Install and start
npm install
npm start
```

### 2. Start Frontend

```bash
npm install
npm run dev
```

### 3. Access Application

```
Frontend: http://localhost:5173
API: http://localhost:3001/api
```

## Testing Credentials

### Test User Account

```
Email:    test@test.com
Password: test123456
Role:     user
```

### Test Admin Account

```
Email:    admin@test.com
Password: admin123456
Role:     admin
```

## Renewing Credentials (Security)

### Wasabi Access Keys

1. Go to [Wasabi Console](https://console.wasabisys.com)
2. **Settings** > **Access Keys**
3. Regenerate keys
4. Update `.env` file
5. Restart backend

### Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Regenerate API key
3. Update `.env` file
4. Restart backend

### Supabase Keys

1. Go to Supabase Dashboard
2. **Settings** > **API** > **Regenerate**
3. Update `.env` file
4. Restart backend

## Environment-Specific Configuration

### Development

```env
SUPABASE_URL=https://dev-project.supabase.co
WASABI_ENDPOINT=https://s3.ap-northeast-2.wasabisys.com
NODE_ENV=development
PORT=3001
```

### Production

```env
SUPABASE_URL=https://prod-project.supabase.co
WASABI_ENDPOINT=https://s3.ap-northeast-2.wasabisys.com
NODE_ENV=production
PORT=3001
```

### Staging

```env
SUPABASE_URL=https://staging-project.supabase.co
WASABI_ENDPOINT=https://s3.ap-northeast-2.wasabisys.com
NODE_ENV=staging
PORT=3001
```

## Deployment Configuration

### Heroku / Railway / Render

Set environment variables in dashboard:

```
SUPABASE_URL = https://...
SUPABASE_ANON_KEY = ...
SUPABASE_SERVICE_KEY = ...
WASABI_ACCESS_KEY = X969EKX68T0G6OXK33QE
WASABI_SECRET_KEY = R7eeSzJ9V1PaBNA3tt2JSk8cRqY2EeGe26dFwbK2
WASABI_BUCKET = project-carrear-portal
WASABI_REGION = ap-northeast-2
WASABI_ENDPOINT = https://s3.ap-northeast-2.wasabisys.com
GEMINI_API_KEY = AIzaSyDkhC9tV0AxF4TRz7I5GVu7ihfqiqcORgU
PORT = 3001
NODE_ENV = production
```

### AWS / Docker

Create `.env` file or use AWS Secrets Manager:

```bash
# AWS Systems Manager Parameter Store
aws ssm put-parameter --name /jobportal/supabase_url --value "..." --type String
aws ssm put-parameter --name /jobportal/wasabi_key --value "..." --type SecureString
```

## Credential Rotation Schedule

### Recommended Schedule

- **Monthly**: Audit credential usage
- **Quarterly**: Rotate non-critical keys
- **Semi-annually**: Rotate critical keys (Supabase Service Key)
- **Immediately**: If compromised or leaked

### Rotation Steps

1. Generate new credentials in respective service
2. Update `.env` file
3. Restart backend service
4. Verify all connections work
5. Deactivate old credentials
6. Monitor logs for issues

## Verification Commands

### Verify Wasabi Credentials

```bash
# Test connection
node -e "
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
  console.log(err ? 'Failed: ' + err : 'Success!');
  process.exit(err ? 1 : 0);
});
"
```

### Verify Gemini API Key

```bash
node -e "
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

model.generateContent('test').then(() => {
  console.log('Gemini API key valid!');
  process.exit(0);
}).catch((err) => {
  console.log('Gemini API key failed:', err.message);
  process.exit(1);
});
"
```

### Verify Supabase Connection

```bash
curl -H "Authorization: Bearer YOUR_ANON_KEY" \
  https://your-project.supabase.co/rest/v1/users?select=count()
```

## Security Best Practices

### DO ✅

- Store credentials in `.env` files
- Use strong, unique passwords
- Rotate credentials regularly
- Keep credentials private
- Use environment variables in production
- Monitor credential usage
- Log all credential access attempts
- Use secrets management tools

### DON'T ❌

- Commit `.env` to Git
- Share credentials in messages/emails
- Use default/weak passwords
- Expose credentials in logs
- Use credentials in URLs
- Store credentials in client code
- Hardcode credentials
- Leave unused credentials active

## Troubleshooting

### "Invalid Credentials" Error

1. Check `.env` file for typos
2. Verify credentials are current (not rotated)
3. Ensure credentials have correct permissions
4. Restart backend after updating `.env`

### "Access Denied" Error

1. Verify correct bucket name
2. Check Wasabi permissions
3. Ensure Supabase RLS policies allow access
4. Verify user authentication token is valid

### "API Key Invalid" Error

1. Check Gemini API key in `.env`
2. Verify API key is active in Google AI Studio
3. Check API quota hasn't been exceeded
4. Regenerate API key if needed

## Support Resources

- [Supabase Docs](https://supabase.com/docs)
- [Wasabi Documentation](https://wasabi.com/help)
- [Google Gemini API](https://ai.google.dev/)
- [AWS SDK Documentation](https://docs.aws.amazon.com/sdk-for-javascript/)

## Credential Checklist

Before launching:

- [ ] Supabase URL configured
- [ ] Supabase anon key added
- [ ] Supabase service key added
- [ ] Wasabi access key added
- [ ] Wasabi secret key added
- [ ] Wasabi bucket name correct
- [ ] Wasabi region correct (ap-northeast-2)
- [ ] Gemini API key added
- [ ] All keys verified to work
- [ ] Backend starts without errors
- [ ] Frontend connects to backend
- [ ] User registration works
- [ ] Resume upload works
- [ ] ATS scoring works
- [ ] No credentials in Git history

You're all set! Your Job Portal is fully configured and ready to go! 🚀
