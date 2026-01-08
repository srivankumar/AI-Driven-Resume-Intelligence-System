# ⚡ Quick Validation Reference

## Real-Time Validations (Instant Feedback - No Delay)

### 🔐 Login Page
```
Email Field:
  - Required ✓
  - Valid format (user@domain.com) ✓
  - Green checkmark when valid ✓
  - Red error when invalid ✓

Password Field:
  - Required ✓
  - Shows error if empty ✓
  - Green checkmark when filled ✓

Submit Button:
  - Disabled if form invalid ✓
  - Only enables when both fields valid ✓
```

### 📝 Register Page
```
Name Field:
  - 2-100 characters ✓
  - Letters, spaces, hyphens, apostrophes only ✓
  - Real-time validation ✓
  - Green checkmark when valid ✓

Email Field:
  - Valid email format ✓
  - Checks if already registered (async) ✓
  - Shows "Already registered" if taken ✓
  - Spinner while checking ✓
  - Green checkmark when available ✓

Password Field:
  - Minimum 6 characters ✓
  - Shows strength tips (uppercase, numbers recommended) ✓
  - Green checkmark when valid ✓

Confirm Password Field:
  - Matches password field ✓
  - Real-time matching check ✓
  - Green checkmark when matches ✓

Submit Button:
  - Disabled until all fields valid ✓
  - Disabled while email is checking ✓
  - Only enables when form is complete ✓
```

### 💼 Apply Job Page
```
Pre-Application Checks (Automatic):
  - Job exists ✓
  - Deadline not passed ✓
  - User has not applied yet ✓
  - Shows deadline countdown (e.g., "3d left") ✓
  - Shows warning if deadline soon ✓

If Already Applied:
  - Shows "You've Already Applied" message ✓
  - Shows application date ✓
  - Resume upload disabled ✓
  - Submit button disabled ✓

Resume Upload:
  - Accept PDF files ✓
  - Accept Word documents (.doc, .docx) ✓
  - Max 5MB file size ✓
  - Min 10KB file size ✓
  - Shows file preview with name ✓
  - Shows formatted file size ✓
  - Shows specific errors for invalid files ✓
  - Allows easy file replacement ✓

Submit Button:
  - Disabled if no resume selected ✓
  - Disabled if already applied ✓
  - Only enabled when valid state ✓
```

### 📊 My Applications Page
```
Application Statistics:
  - Total applications count ✓
  - Shortlisted count ✓
  - Pending count ✓

Status Indicators:
  - Shortlisted → Green checkmark ✓
  - Pending → Clock icon ✓
  - Rejected → X icon ✓

ATS Score Display:
  - Shows numerical score (/100) ✓
  - Shows quality description ✓
  - Visual progress bar ✓
  - Color-coded (green/amber/red) ✓

Resume Download:
  - Shows loading state ✓
  - Disabled while downloading ✓
  - Shows error if fails ✓
  - Retry option available ✓

Error Handling:
  - Failed to load → Retry button ✓
  - Failed download → Clear error message ✓
```

---

## Backend Validation Endpoints

### Email Availability Check
```
POST /api/auth/check-email
{
  "email": "user@example.com"
}

Response: {
  "exists": true/false,
  "message": "optional error message"
}

Used By: Register page (real-time as user types)
Validation: Prevents duplicate registrations
```

### Application Status Check
```
GET /api/applications/check/:jobId

Response: {
  "applied": true/false,
  "applicationDate": "2026-01-09T10:30:00Z",
  "status": "pending|shortlisted|rejected"
}

Used By: Apply Job page (on page load)
Validation: Prevents duplicate applications
```

---

## Error Messages Reference

### Login Errors
| Error | Cause | Solution |
|-------|-------|----------|
| "Email is required" | Empty email field | Enter email address |
| "Please enter a valid email address" | Invalid format | Use format: user@domain.com |
| "Password is required" | Empty password field | Enter password |
| "Invalid email or password" | Wrong credentials | Check email and password |

### Register Errors
| Error | Cause | Solution |
|-------|-------|----------|
| "Full name is required" | Empty name | Enter your name |
| "Name must be at least 2 characters" | Too short | Use at least 2 characters |
| "Name can only contain letters, spaces, hyphens, and apostrophes" | Invalid chars | Use only: A-Z, a-z, space, -, ' |
| "Please enter a valid email address" | Invalid format | Use format: user@domain.com |
| "This email is already registered" | Duplicate email | Use different email or login |
| "Password must be at least 6 characters long" | Too short | Use 6+ characters |
| "Stronger password: use uppercase, lowercase, and numbers" | Weak password | Add uppercase, lowercase, numbers |
| "Passwords do not match" | Confirm mismatch | Ensure both password fields match |

### Apply Job Errors
| Error | Cause | Solution |
|-------|-------|----------|
| "Only PDF and Word documents are allowed" | Wrong file type | Upload .pdf, .doc, or .docx |
| "File size must be less than 5MB" | File too large | Compress resume to < 5MB |
| "File seems too small to be a valid resume" | File too small | Upload resume > 10KB |
| "Application deadline has passed for this job" | Deadline expired | Job is no longer accepting applications |
| "You have already applied for this job on [date]" | Duplicate application | You can only apply once per job |
| "Please upload your resume" | No file selected | Select a resume file |

### My Applications Errors
| Error | Cause | Solution |
|-------|-------|----------|
| "Failed to load applications" | Connection issue | Click Retry button |
| "Failed to download resume" | Download failed | Try again or contact support |

---

## Validation Rules Summary

### Passwords
```
Minimum: 6 characters
Format: Letters, numbers, special chars allowed
Strength Tips:
  - Use uppercase letters (A-Z)
  - Use lowercase letters (a-z)  
  - Use numbers (0-9)
  - Use special characters (!@#$%^&*)
```

### Email
```
Format: username@domain.com
Max Length: 254 characters
Uniqueness: Cannot duplicate in database
Case: Normalized to lowercase
```

### Name
```
Min Length: 2 characters
Max Length: 100 characters
Allowed: Letters, spaces, hyphens (-), apostrophes (')
Examples: ✓ John Smith, ✓ Mary-Jane, ✓ O'Brien
```

### Resume Files
```
Formats: PDF, DOC, DOCX
Max Size: 5MB (5,242,880 bytes)
Min Size: 10KB (10,240 bytes)
```

### Job Deadline
```
Check: Application date vs deadline date
Warning: Show if deadline < 3 days away
Error: Show if deadline has passed
Display: Formatted as "3d left", "Today", "Expired"
```

---

## Color Coding

### Field States
```
🟢 Green Border: Field valid and complete
🔴 Red Border: Field invalid with error
⚪ Gray Border: Field neutral/not yet filled
```

### Status Badges
```
🟢 Green Badge: Shortlisted
🟡 Yellow Badge: Pending Review
🔴 Red Badge: Rejected
```

### Deadline Status
```
🟢 Green: 8+ days remaining
🟡 Yellow: 4-7 days remaining
🟠 Orange: 1-3 days remaining OR Today
🔴 Red: Expired/Passed
```

### ATS Score
```
🟢 Green: 75+ (Good match)
🟡 Yellow: 50-74 (Fair match)
🔴 Red: <50 (Needs work)
```

---

## User Flow Diagrams

### ✅ Successful Registration
```
Start
  ↓
Enter Name → Validate (real-time)
  ↓
Enter Email → Validate (real-time) → Check Availability
  ↓
Enter Password → Validate (real-time) → Show Strength
  ↓
Confirm Password → Validate (real-time)
  ↓
All Valid? → Yes → Green Checkmarks
  ↓
Submit Button Enabled
  ↓
Click Submit
  ↓
Account Created → Redirect to Dashboard
```

### ❌ Prevent Duplicate Application
```
User navigates to Job Page
  ↓
System checks: "Has user applied before?"
  ↓
Already Applied? → Yes
  ↓
Show "Already Applied on [date]" message
  ↓
Hide resume upload
  ↓
Disable submit button
  ↓
Show "Already Applied" button state
```

### 📄 Resume Upload Validation
```
User selects file
  ↓
Check file type
  ↓
Invalid type? → Show "Only PDF/Word"
  ↓
Check file size
  ↓
Too large? → Show "Max 5MB"
  ↓
Too small? → Show "Min 10KB"
  ↓
Valid? → Show preview & file size
  ↓
Allow submit
```

---

## Performance Notes

- ✅ All validations instant (no delay)
- ✅ Email check is async but doesn't block
- ✅ Application status check on page load
- ✅ No unnecessary server calls
- ✅ Smart caching where applicable

---

## Accessibility Features

- ✅ Clear error messages for screen readers
- ✅ Color-coded + icon indicators (not color alone)
- ✅ Helpful tooltips and hints
- ✅ Disabled states clearly marked
- ✅ Form field labels properly associated

---

Last Updated: January 9, 2026
All validations instant and user-friendly! 🎉
