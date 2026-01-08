import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobApi, applicationApi } from '../services/api';
import {
  Briefcase,
  Calendar,
  Users,
  Award,
  LogOut,
  Plus,
  Trash2,
  XCircle,
  Eye,
  Search,
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  skills: string;
  experience: string;
  application_deadline: string;
  is_active: boolean;
  isExpired?: boolean;
}

interface Stats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  shortlisted: number;
}

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<Stats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const [jobsResponse, applicationsResponse] = await Promise.all([
      jobApi.getAllJobs(),
      applicationApi.getAllApplications(),
    ]);

    if (jobsResponse.jobs) {
      setJobs(jobsResponse.jobs);
      setStats((prev) => ({
        ...prev,
        totalJobs: jobsResponse.jobs.length,
        activeJobs: jobsResponse.jobs.filter(
          (j: Job) => j.is_active && new Date(j.application_deadline) >= new Date()
        ).length,
      }));
    }

    if (applicationsResponse.applications) {
      setStats((prev) => ({
        ...prev,
        totalApplications: applicationsResponse.applications.length,
        shortlisted: applicationsResponse.applications.filter(
          (a: any) => a.status === 'shortlisted'
        ).length,
      }));
    }

    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEndApplication = async (jobId: string, jobTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to end applications for "${jobTitle}"? This will evaluate all applications and send emails to candidates.`
      )
    ) {
      return;
    }

    const response = await jobApi.endApplication(jobId);

    if (response.message) {
      alert(
        `Application ended successfully!\nShortlisted: ${response.shortlisted}\nRejected: ${response.rejected}\nEmails have been sent to all candidates.`
      );
      fetchData();
    } else {
      alert('Failed to end application');
    }
  };

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
      return;
    }

    const response = await jobApi.deleteJob(jobId);

    if (response.message) {
      alert('Job deleted successfully');
      fetchData();
    } else {
      alert('Failed to delete job');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const filteredJobs = jobs.filter((job) => {
    const query = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.skills.toLowerCase().includes(query) ||
      job.experience.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
             <img
                  src="https://i.postimg.cc/cJsQ2V4P/Screenshot-2026-01-09-002655.png"
                  className="w-16 h-10 object-cover rounded"/>
                <span className="text-xl font-bold text-slate-900">Admin Portal</span>
            </div>


            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/applications')}
                className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <Users className="w-4 h-4" />
                <span>Applications</span>
              </button>

              <button
                onClick={() => navigate('/admin/top-candidates')}
                className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <Award className="w-4 h-4" />
                <span>Top Candidates</span>
              </button>

              <div className="text-sm text-slate-700">
                <span className="font-medium">{user?.name}</span>{' '}
                <span className="text-xs bg-slate-900 text-white px-2 py-1 rounded">ADMIN</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Dashboard Overview</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 text-sm">Total Jobs</span>
                <Briefcase className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.totalJobs}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 text-sm">Active Jobs</span>
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600">{stats.activeJobs}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 text-sm">Total Applications</span>
                <Users className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.totalApplications}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 text-sm">Shortlisted</span>
                <Award className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600">{stats.shortlisted}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 mr-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs by title, description, skills, or experience..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/create-job')}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Job</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            <p className="mt-4 text-slate-600">Loading jobs...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No jobs found matching your search</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                      {job.isExpired && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                          Expired
                        </span>
                      )}
                      {!job.is_active && !job.isExpired && (
                        <span className="px-3 py-1 bg-slate-100 text-slate-800 text-sm rounded-full">
                          Ended
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 mb-3 line-clamp-2">{job.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span>Experience: {job.experience}</span>
                      <span>Deadline: {formatDate(job.application_deadline)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/admin/job/${job.id}/applications`)}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                      title="View Applications"
                    >
                      <Eye className="w-5 h-5" />
                    </button>

                    {job.is_active && !job.isExpired && (
                      <button
                        onClick={() => handleEndApplication(job.id, job.title)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                        title="End Application"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteJob(job.id, job.title)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Job"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )))
            }
          </div>
        )}
      </div>
    </div>
  );
}
