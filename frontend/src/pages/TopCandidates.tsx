import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationApi } from '../services/api';
import { ArrowLeft, Award, Trophy, Download, Mail, User } from 'lucide-react';

interface Candidate {
  id: string;
  resume_url: {
    key: string;
    timestamp: number;
  };
  ats_score: number;
  status: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  job: {
    id: string;
    title: string;
  };
}

export default function TopCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopCandidates();
  }, [limit]);

  const fetchTopCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await applicationApi.getTopCandidates(limit);
      if (response?.candidates) {
        setCandidates(response.candidates);
      } else {
        setCandidates([]);
      }
    } catch (err) {
      console.error('Failed to fetch top candidates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Trophy className="w-6 h-6 text-slate-400" />;
    if (index === 2) return <Trophy className="w-6 h-6 text-orange-600" />;
    return <Award className="w-6 h-6 text-slate-400" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleDownload = async (resumeKey: string) => {
    try {
      const { url } = await applicationApi.getResumeDownloadUrl(resumeKey);
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      console.error('Resume download error:', err);
      alert('Failed to download resume');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Top Candidates</h1>
              <p className="text-slate-600">Highest scoring candidates across all applications</p>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-slate-700">Show:</label>
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
                <option value={100}>Top 100</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            <p className="mt-4 text-slate-600">Loading top candidates...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Award className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No candidates found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {candidates.map((candidate, index) => (
              <div
                key={candidate.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full">
                      {getRankIcon(index)}
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-2xl font-bold text-slate-900">#{index + 1}</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                          {candidate.user?.name || 'Unknown User'}
                        </h3>
                        <div className="flex items-center space-x-1 text-sm text-slate-600">
                          <Mail className="w-4 h-4" />
                          <span>{candidate.user?.email || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <Award className="w-5 h-5 text-slate-400" />
                          <span className="text-3xl font-bold text-slate-900">
                            {candidate.ats_score}
                          </span>
                          <span className="text-slate-600">/100</span>
                        </div>
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            candidate.status
                          )}`}
                        >
                          {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">
                          Applied for: <span className="font-medium text-slate-900">{candidate.job?.title || 'N/A'}</span>
                        </p>
                        <p className="text-sm text-slate-600">
                          Applied on: {new Date(candidate.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDownload(candidate.resume_url.key)}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Resume</span>
                      </button>
                    </div>

                    <div className="mt-4">
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            candidate.ats_score >= 80
                              ? 'bg-green-600'
                              : candidate.ats_score >= 60
                              ? 'bg-yellow-600'
                              : 'bg-orange-600'
                          }`}
                          style={{ width: `${candidate.ats_score}%` }}
                        ></div>
                      </div>
                    </div>
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
