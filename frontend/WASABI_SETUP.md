# Wasabi S3 Setup Guide

## Account Information

**Bucket**: `project-carrear-portal`
**Region**: `ap-northeast-2` (Seoul, South Korea)
**Endpoint**: `https://s3.ap-northeast-2.wasabisys.com`

### Credentials

```env
Access Key ID: X969EKX68T0G6OXK33QE
Secret Access Key: R7eeSzJ9V1PaBNA3tt2JSk8cRqY2EeGe26dFwbK2
```

## Configuration

### Backend .env Setup

```env
WASABI_ACCESS_KEY=X969EKX68T0G6OXK33QE
WASABI_SECRET_KEY=R7eeSzJ9V1PaBNA3tt2JSk8cRqY2EeGe26dFwbK2
WASABI_BUCKET=project-carrear-portal
WASABI_REGION=ap-northeast-2
WASABI_ENDPOINT=https://s3.ap-northeast-2.wasabisys.com
```

## Resume Storage Structure

Resumes are stored in the following format:

```
project-carrear-portal/
├── resumes/
│   ├── {userId}_{jobId}_{timestamp}.pdf
│   ├── user123_job456_1704850234.pdf
│   └── user789_job012_1704850567.pdf
```

### File Naming Scheme

- **Format**: `{userId}_{jobId}_{timestamp}.pdf`
- **Example**: `550e8400_e29b41d4_1704850234.pdf`
- **Timestamp**: Unix milliseconds (ensures uniqueness)

### Permissions

- **ACL**: `public-read` (allows public resume downloads)
- **Content-Type**: `application/pdf`
- **Max Size**: 5MB

## Upload Process

1. **Validation**
   - File type: PDF only
   - File size: Max 5MB
   - User authentication: Required

2. **Upload to Wasabi**
   - Using AWS SDK v2 compatible API
   - S3ForcePathStyle: true
   - Multipart upload for reliability

3. **URL Generation**
   - Format: `{ENDPOINT}/{BUCKET}/resumes/{fileName}.pdf`
   - Example: `https://s3.ap-northeast-2.wasabisys.com/project-carrear-portal/resumes/uuid_jobid_timestamp.pdf`

4. **Storage in Supabase**
   - URL stored in `applications.resume_url`
   - Enables direct download from admin panel

## Security

### Bucket Policies

Current setup allows:
- **Public Read**: Resume download by anyone with URL
- **Private Write**: Only with AWS credentials
- **Private Delete**: Only with AWS credentials

### Access Control

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::project-carrear-portal/resumes/*"
    }
  ]
}
```

### Best Practices

1. **Secure Credentials**: Keep secret key private
2. **Regenerate Keys**: Periodically rotate access keys
3. **Monitor Access**: Check Wasabi logs for suspicious activity
4. **Data Retention**: Implement cleanup policies for old resumes

## Usage

### Backend Upload Code

```javascript
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.WASABI_ACCESS_KEY,
  secretAccessKey: process.env.WASABI_SECRET_KEY,
  endpoint: process.env.WASABI_ENDPOINT,
  region: process.env.WASABI_REGION,
  s3ForcePathStyle: true,
});

// Upload file
const result = await s3.upload({
  Bucket: 'project-carrear-portal',
  Key: `resumes/${userId}_${jobId}_${timestamp}.pdf`,
  Body: fileBuffer,
  ContentType: 'application/pdf',
  ACL: 'public-read',
}).promise();

const resumeUrl = result.Location;
```

### Download Resume

```javascript
// From admin panel
window.open(resumeUrl, '_blank');

// Or as direct link
const resumeLink = `https://s3.ap-northeast-2.wasabisys.com/project-carrear-portal/resumes/...pdf`;
```

## Monitoring

### Check Wasabi Dashboard

1. Go to [Wasabi Console](https://console.wasabisys.com)
2. Login with your account
3. Navigate to **Buckets** > **project-carrear-portal**
4. View:
   - Storage usage
   - File count
   - Upload/download activity
   - Access logs

### Backend Logs

```javascript
console.log(`Uploading to Wasabi: ${bucket}/${key}`);
console.log(`Successfully uploaded resume: ${result.Location}`);
console.log(`Wasabi upload error: ${error.message}`);
```

## Troubleshooting

### Issue: Upload Fails with "Invalid Credentials"

**Solution**:
- Verify Access Key ID and Secret Key
- Check .env file for typos
- Regenerate keys if compromised
- Restart backend server

### Issue: Upload Fails with "Access Denied"

**Solution**:
- Check bucket permissions
- Verify bucket name is correct
- Check ACL settings
- Ensure user has PutObject permission

### Issue: Resume URL is Invalid

**Solution**:
- Verify ENDPOINT is correct
- Check bucket name spelling
- Verify file exists in bucket
- Try accessing URL in browser

### Issue: File Size Limit Exceeded

**Solution**:
- Limit to 5MB max (configured in frontend)
- Ask user to compress PDF
- Split large document

### Issue: Upload Timeout

**Solution**:
- Check network connection
- Verify Wasabi service is running
- Increase timeout setting
- Retry upload

## Cost Management

### Pricing (ap-northeast-2)

- **Storage**: $0.00456/GB/month
- **Upload**: $0.05/GB
- **Download**: $0.05/GB
- **API Requests**: Included

### Estimate for 1000 Resumes

```
Average PDF size: 500 KB = 0.5 MB
Total storage: 1000 × 0.5 MB = 500 MB = 0.5 GB
Monthly cost: 0.5 GB × $0.00456 = $0.00228 (negligible)

If downloaded 100 times:
Download cost: 100 × 0.5 MB = 50 MB = 0.05 GB
Download cost: 0.05 GB × $0.05 = $0.0025
```

### Cleanup Strategy

```javascript
// Optional: Delete old resumes after 30 days
const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

// Or delete rejected applications' resumes
// To save storage and comply with data retention policies
```

## Advanced Configuration

### CloudFront CDN (Optional)

For faster downloads worldwide:
1. Create CloudFront distribution
2. Set Wasabi as origin
3. Use CloudFront URL in applications

### Lifecycle Policies (Optional)

```javascript
// Auto-delete old files after 90 days
const params = {
  Bucket: 'project-carrear-portal',
  LifecycleConfiguration: {
    Rules: [{
      ID: 'DeleteOldResumes',
      Prefix: 'resumes/',
      Status: 'Enabled',
      Expiration: { Days: 90 }
    }]
  }
};
```

### Multi-Region Backup (Optional)

- Set up replication to secondary region
- Ensures disaster recovery
- Provides redundancy

## Dashboard Access

### Login to Wasabi Console

1. Go to [console.wasabisys.com](https://console.wasabisys.com)
2. Enter your account credentials
3. Navigate to **Buckets**
4. Select **project-carrear-portal**

### View Statistics

- **Storage Used**: Total GB stored
- **Object Count**: Number of files
- **Recent Activity**: Upload/download logs
- **Access Logs**: Detailed request history

## API Documentation

### AWS CLI Commands

```bash
# List all resumes
aws s3 ls s3://project-carrear-portal/resumes/ \
  --endpoint-url https://s3.ap-northeast-2.wasabisys.com

# Upload file
aws s3 cp resume.pdf s3://project-carrear-portal/resumes/ \
  --endpoint-url https://s3.ap-northeast-2.wasabisys.com

# Download file
aws s3 cp s3://project-carrear-portal/resumes/file.pdf ./ \
  --endpoint-url https://s3.ap-northeast-2.wasabisys.com

# Delete file
aws s3 rm s3://project-carrear-portal/resumes/file.pdf \
  --endpoint-url https://s3.ap-northeast-2.wasabisys.com
```

## Migration & Backup

### Backup All Resumes

```bash
aws s3 sync s3://project-carrear-portal/resumes/ ./backup/ \
  --endpoint-url https://s3.ap-northeast-2.wasabisys.com
```

### Restore Backup

```bash
aws s3 sync ./backup/ s3://project-carrear-portal/resumes/ \
  --endpoint-url https://s3.ap-northeast-2.wasabisys.com
```

## Support & Resources

- [Wasabi Documentation](https://wasabi.com/help)
- [Wasabi Support Portal](https://support.wasabisys.com)
- [AWS SDK Documentation](https://docs.aws.amazon.com/sdk-for-javascript)

## Summary

Your Wasabi setup is ready to:
- ✅ Store resumes reliably
- ✅ Serve public download links
- ✅ Scale to thousands of files
- ✅ Maintain security and privacy
- ✅ Cost-effectively manage storage
