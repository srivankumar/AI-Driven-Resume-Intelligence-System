import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { applicationApi } from "../services/api";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Award,
  ExternalLink,
  AlertCircle,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw
} from "lucide-react";
import { formatDate } from "../utils/validation";

interface Application {
  id: string;
  resume_url: {
    key: string;
    timestamp: number;
  };
  ats_score: number;
  status: "pending" | "shortlisted" | "rejected";
  created_at: string;
  job: {
    id: string;
    title: string;
    description: string;
  };
}

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await applicationApi.getMyApplications();
      if (response?.applications && Array.isArray(response.applications)) {
        setApplications(response.applications);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error("Fetch applications error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load applications. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resumeKey: string, jobTitle: string) => {
    try {
      setDownloadError(null);
      setDownloadingKey(resumeKey);

      if (!resumeKey) {
        setDownloadError("Resume key is missing");
        setDownloadingKey(null);
        return;
      }

      const response = await applicationApi.getResumeDownloadUrl(resumeKey);

      if (response?.url) {
        window.open(response.url, "_blank", "noopener");
        // Add small delay before clearing loading state
        setTimeout(() => {
          setDownloadingKey(null);
        }, 1000);
      } else {
        setDownloadError("Failed to generate download link");
        setDownloadingKey(null);
      }
    } catch (err) {
      console.error("Resume download error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to download resume. Please try again.";
      setDownloadError(errorMessage);
      setDownloadingKey(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "shortlisted":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "shortlisted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "shortlisted":
        return "Shortlisted";
      case "rejected":
        return "Rejected";
      default:
        return "Pending Review";
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "shortlisted":
        return "Great! You've been shortlisted for this job. Check your email for next steps.";
      case "rejected":
        return "Your application was not selected. Try applying for other positions!";
      default:
        return "Your application is under review. We'll notify you soon.";
    }
  };

  const getATSScoreDescription = (score: number) => {
    if (score >= 85) return "Excellent match!";
    if (score >= 70) return "Good match";
    if (score >= 50) return "Potential match";
    return "Needs improvement";
  };

  const shortlistedCount = applications.filter((a) => a.status === "shortlisted").length;
  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const rejectedCount = applications.filter((a) => a.status === "rejected").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">My Applications</h1>
          <p className="text-slate-600">Track the status of all your job applications</p>
        </div>

        {/* Statistics */}
        {applications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-slate-600 text-sm font-medium">Total Applications</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{applications.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg border border-green-200 p-4">
              <p className="text-green-700 text-sm font-medium">Shortlisted</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{shortlistedCount}</p>
            </div>
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
              <p className="text-amber-700 text-sm font-medium">Pending Review</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{pendingCount}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-red-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium mb-1">Failed to load applications</p>
              <p className="text-sm opacity-90 mb-3">{error}</p>
              <button
                onClick={fetchApplications}
                className="text-sm font-medium text-red-700 hover:text-red-900 flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Download Error */}
        {downloadError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">{downloadError}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-4"></div>
            <p className="text-slate-600">Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Applications Yet</h3>
            <p className="text-slate-600 mb-6">You haven't applied for any jobs yet.</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-block bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((application, index) => (
              <div
                key={application.id}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-slate-200 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900">
                          {application.job.title}
                        </h3>
                        <p className="text-slate-600 line-clamp-2 mt-2">
                          {application.job.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 text-right">
                    <div className={`px-4 py-2 rounded-lg border font-medium text-sm flex items-center gap-2 whitespace-nowrap ${getStatusColor(
                      application.status
                    )}`}>
                      {getStatusIcon(application.status)}
                      {getStatusText(application.status)}
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                  <p className="text-sm text-slate-700">
                    {getStatusDescription(application.status)}
                  </p>
                </div>

                {/* Details */}
                <div className="p-6">
                  <div className="grid md:grid-cols-4 gap-6 mb-6">
                    {/* Application Date */}
                    <div>
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">
                        Applied On
                      </p>
                      <div className="flex items-center gap-2 text-slate-900">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span>{formatDate(application.created_at)}</span>
                      </div>
                    </div>

                    {/* ATS Score */}
                    <div>
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">
                        ATS Score
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-slate-900">
                          {application.ats_score}
                        </span>
                        <span className="text-xs text-slate-600">/100</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {getATSScoreDescription(application.ats_score)}
                      </p>
                    </div>

                    {/* Score Bar */}
                    <div className="col-span-2">
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">
                        Match Quality
                      </p>
                      <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            application.ats_score >= 75
                              ? "bg-green-600"
                              : application.ats_score >= 50
                              ? "bg-amber-600"
                              : "bg-red-600"
                          }`}
                          style={{ width: `${Math.min(application.ats_score, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>Poor</span>
                        <span>Fair</span>
                        <span>Excellent</span>
                      </div>
                    </div>
                  </div>

                  {/* Resume Download */}
                  <div className="border-t border-slate-200 pt-4">
                    <button
                      onClick={() =>
                        handleDownload(application.resume_url.key, application.job.title)
                      }
                      disabled={downloadingKey === application.resume_url.key}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingKey === application.resume_url.key ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download Resume
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
