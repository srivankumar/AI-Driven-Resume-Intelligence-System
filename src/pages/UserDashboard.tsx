import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobApi } from '../services/api';
import { Briefcase, Calendar, Clock, LogOut, FileText, Search } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  skills: string;
  experience: string;
  application_deadline: string;
  is_active: boolean;
}

export default function UserDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const response = await jobApi.getActiveJobs();
    if (response.jobs) {
      setJobs(response.jobs);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-3 sm:py-0 gap-3 sm:gap-0">
            <div className="flex items-center space-x-2">
              <img src="https://i.postimg.cc/cJsQ2V4P/Screenshot-2026-01-09-002655.png"
                 className="w-12 sm:w-16 h-8 sm:h-10 object-cover rounded"/>
              <span className="text-lg sm:text-xl font-bold text-slate-900">Carrer Portal</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <button
                onClick={() => navigate('/my-applications')}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition text-sm sm:text-base"
              >
                <FileText className="w-4 h-4" />
                <span>My Applications</span>
              </button>

              <div className="text-xs sm:text-sm text-slate-700">
                Welcome, <span className="font-medium">{user?.name}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-sm sm:text-base"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Available Jobs</h1>
          <p className="text-sm sm:text-base text-slate-600 mb-4">Find your dream job and apply today</p>

          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            <p className="mt-4 text-sm sm:text-base text-slate-600">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow">
            <Briefcase className="w-8 sm:w-12 h-8 sm:h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-slate-600">
              {searchQuery ? 'No jobs found matching your search' : 'No active jobs available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">{job.title}</h3>
                    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{job.experience}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Deadline: {formatDate(job.application_deadline)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/apply/${job.id}`);
                    }}
                    className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm sm:text-base"
                  >
                    Apply Now
                  </button>
                </div>

                <p className="text-sm sm:text-base text-slate-700 mb-4 line-clamp-2">{job.description}</p>

                <div className="flex flex-wrap gap-2">
                  {job.skills.split(',').map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-100 text-slate-700 text-xs sm:text-sm rounded-full"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
