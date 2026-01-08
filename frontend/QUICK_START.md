# Quick Start Guide

Get your Job Portal up and running in 5 minutes!

## Prerequisites Check
- [ ] Node.js installed
- [ ] Supabase account created
- [ ] Wasabi account created

## 1. Database Setup (1 minute)

The database schema is already created. Just get your Supabase credentials:

```
Supabase Dashboard → Settings → API
```

Copy:
- Project URL
- anon public key
- service_role key

## 2. Backend Setup (2 minutes)

```bash
cd backend
npm install

# Create .env file
cat > .env << EOL
SUPABASE_URL=your_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

WASABI_ACCESS_KEY=your_wasabi_key
WASABI_SECRET_KEY=your_wasabi_secret
WASABI_BUCKET=resumes
WASABI_REGION=us-east-1
WASABI_ENDPOINT=https://s3.wasabisys.com

PORT=3001
EOL

# Start server
npm start
```

## 3. Frontend Setup (1 minute)

```bash
# From root directory
npm install
npm run dev
```

## 4. Create Admin Account (1 minute)

**Option A - Quick (via API):**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@test.com",
    "password": "admin123",
    "role": "admin"
  }'
```

**Option B - UI:**
1. Register at `/register`
2. In Supabase: `UPDATE users SET role = 'admin' WHERE email = 'your@email.com'`

## 5. Test It Out!

**User Flow:**
1. Open `http://localhost:5173`
2. Register as user
3. Browse jobs
4. Apply with resume (PDF)

**Admin Flow:**
1. Login with admin account
2. Create a job
3. View applications
4. End application (sends emails!)

## Common Tasks

### View API Status
```bash
curl http://localhost:3001/api/health
```

### Create Test Job (Admin)
```bash
curl -X POST http://localhost:3001/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Job",
    "description": "Test description",
    "skills": "React, Node.js",
    "experience": "1-3 years",
    "application_deadline": "2024-12-31"
  }'
```

### Check Logs
```bash
# Backend logs
cd backend && npm start

# Frontend logs
npm run dev
```

## Troubleshooting

**Backend won't start:**
- Check .env file exists
- Verify all credentials are correct
- Check port 3001 is available

**Frontend error:**
- Ensure backend is running first
- Check browser console
- Verify API URL in api.ts

**Database error:**
- Check Supabase credentials
- Verify tables exist in Supabase dashboard

**Email not working:**
- Verify SUPABASE_SERVICE_KEY is correct
- Check Supabase email settings
- Look at backend logs

## Production Checklist

- [ ] Update API URL in frontend
- [ ] Set secure environment variables
- [ ] Configure proper CORS
- [ ] Set up SSL certificates
- [ ] Configure email domain
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test all features

## Need Help?

1. Check README.md for detailed docs
2. Review SETUP_GUIDE.md for step-by-step instructions
3. See FEATURES.md for complete feature list
4. Check backend logs for errors
5. Review Supabase logs

## Default Admin Login

After creating admin account:
- Email: admin@test.com
- Password: admin123

**Remember to change these in production!**

---

That's it! Your job portal is ready to use. 🚀
