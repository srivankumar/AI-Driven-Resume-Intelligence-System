import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobApi, applicationApi } from '../services/api';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Clock, Checkmark } from 'lucide-react';
import { validateResumeFile, formatFileSize, formatDate, getDeadlineStatus, validateJobDeadline } from '../utils/validation';

interface Job {
  id: string;
  title: string;
  description: string;
  skills: string;
  experience: string;
  application_deadline: string;
}

interface ApplicationStatus {
  hasApplied: boolean;
  applicationDate?: string;
}

export default function ApplyJob() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');
  const [success, setSuccess] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>({ hasApplied: false });
  const [deadlineWarning, setDeadlineWarning] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (jobId) {
      fetchJob();
      checkApplicationStatus();
    }
  }, [jobId]);

  // Check if user has already applied for this job
  const checkApplicationStatus = async () => {
    try {
      const response = await applicationApi.checkApplicationStatus(jobId!);
      if (response.applied) {
        setApplicationStatus({
          hasApplied: true,
          applicationDate: response.applicationDate,
        });
      }
    } catch (err) {
      console.error('Error checking application status:', err);
    }
  };

  const fetchJob = async () => {
    setLoading(true);
    const response = await jobApi.getJobById(jobId!);
    if (response.job) {
      setJob(response.job);
      
      // Check deadline
      const deadlineValidation = validateJobDeadline(response.job.application_deadline);
      if (deadlineValidation.warning) {
        setDeadlineWarning(deadlineValidation.warning);
      }
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateResumeFile(file);
      if (!validation.isValid) {
        setFileError(validation.error || 'Invalid file');
        setResumeFile(null);
        return;
      }
      setResumeFile(file);
      setFileError('');
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if already applied
    if (applicationStatus.hasApplied) {
      setError('You have already applied for this job');
      return;
    }

    // Validate file
    if (!resumeFile) {
      setFileError('Please upload your resume');
      return;
    }

    const fileValidation = validateResumeFile(resumeFile);
    if (!fileValidation.isValid) {
      setFileError(fileValidation.error || 'Invalid file');
      return;
    }

    setSubmitting(true);

    const response = await applicationApi.apply(jobId!, resumeFile);

    if (response.error) {
      setError(response.error);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      navigate('/my-applications');
    }, 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Job not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-900 font-medium hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
          <p className="text-slate-600 mb-4">
            Your application has been successfully submitted. Redirecting to your applications...
          </p>
        </div>
      </div>
    );
  }

  const deadlineStatus = getDeadlineStatus(job.application_deadline);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Jobs</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Apply for {job.title}</h1>
              <p className="text-slate-600">Complete the form below to submit your application</p>
            </div>
            <div className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${deadlineStatus.color}`}>
              <Clock className="w-4 h-4" />
              {deadlineStatus.status}
            </div>
          </div>

          {/* Already Applied Warning */}
          {applicationStatus.hasApplied && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-4 rounded-lg mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">You've Already Applied for This Job</p>
                <p className="text-sm opacity-90">
                  Applied on: {formatDate(applicationStatus.applicationDate || '')}
                </p>
              </div>
            </div>
          )}

          {/* Deadline Warning */}
          {deadlineWarning && (
            <div className="bg-orange-50 border border-orange-200 text-orange-900 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{deadlineWarning}</span>
            </div>
          )}

          {/* Job Details */}
          <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Job Details</h3>
            <p className="text-slate-700 mb-4">{job.description}</p>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600">
                  <span className="font-medium text-slate-900">Experience Required:</span>
                </p>
                <p className="text-slate-700 mt-1">{job.experience}</p>
              </div>
              <div>
                <p className="text-slate-600">
                  <span className="font-medium text-slate-900">Required Skills:</span>
                </p>
                <p className="text-slate-700 mt-1">{job.skills}</p>
              </div>
              <div>
                <p className="text-slate-600">
                  <span className="font-medium text-slate-900">Application Deadline:</span>
                </p>
                <p className="text-slate-700 mt-1">{formatDate(job.application_deadline)}</p>
              </div>
            </div>
          </div>

          {/* Main Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
              />
              <p className="mt-1 text-xs text-slate-600">This is your registered name</p>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
              />
              <p className="mt-1 text-xs text-slate-600">Employers will use this email to contact you</p>
            </div>

            {/* Resume Upload Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload Resume
              </label>
              <p className="text-xs text-slate-600 mb-3">
                PDF and Word documents accepted • Max 5MB • Min 10KB
              </p>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
                resumeFile
                  ? 'border-green-300 bg-green-50'
                  : fileError
                  ? 'border-red-300 bg-red-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                  disabled={applicationStatus.hasApplied}
                />
                <label
                  htmlFor="resume-upload"
                  className={`cursor-pointer flex flex-col items-center ${
                    applicationStatus.hasApplied ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {resumeFile ? (
                    <>
                      <CheckCircle className="w-12 h-12 text-green-600 mb-2" />
                      <p className="text-slate-900 font-medium">{resumeFile.name}</p>
                      <p className="text-sm text-slate-600 mt-1">
                        {formatFileSize(resumeFile.size)}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setResumeFile(null);
                          setFileError('');
                        }}
                        className="mt-2 text-sm text-blue-600 hover:underline"
                      >
                        Change file
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className={`w-12 h-12 mb-2 ${
                        fileError ? 'text-red-400' : 'text-slate-400'
                      }`} />
                      <p className="text-slate-900 font-medium">Click to upload resume</p>
                      <p className="text-sm text-slate-600 mt-1">or drag and drop</p>
                    </>
                  )}
                </label>
              </div>
              {fileError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fileError}
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600">
                ✓ By submitting this application, you confirm that all information is accurate and true.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !resumeFile || applicationStatus.hasApplied}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {applicationStatus.hasApplied ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Already Applied
                </>
              ) : submitting ? (
                'Submitting Application...'
              ) : (
                'Submit Application'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
