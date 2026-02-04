import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationApi } from '../services/api';

// Query keys for cache management
export const applicationKeys = {
  all: ['applications'] as const,
  myApplications: ['applications', 'my'] as const,
  allApplications: (filters?: any) => ['applications', 'all', filters] as const,
  topCandidates: (limit: number) => ['applications', 'top', limit] as const,
  status: (jobId: string) => ['applications', 'status', jobId] as const,
};

// Hook to check application status for a job
export function useApplicationStatus(jobId: string | undefined) {
  return useQuery({
    queryKey: applicationKeys.status(jobId || ''),
    queryFn: async () => {
      if (!jobId) return { applied: false };
      return await applicationApi.checkApplicationStatus(jobId);
    },
    enabled: !!jobId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook to get user's own applications
export function useMyApplications() {
  return useQuery({
    queryKey: applicationKeys.myApplications,
    queryFn: async () => {
      const response = await applicationApi.getMyApplications();
      return response.applications || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook to get all applications (admin)
export function useAllApplications(filters?: {
  jobId?: string;
  status?: string;
  minScore?: number;
}) {
  return useQuery({
    queryKey: applicationKeys.allApplications(filters),
    queryFn: async () => {
      const response = await applicationApi.getAllApplications(filters);
      return response.applications || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute for admin view
  });
}

// Hook to get top candidates
export function useTopCandidates(limit = 10) {
  return useQuery({
    queryKey: applicationKeys.topCandidates(limit),
    queryFn: async () => {
      const response = await applicationApi.getTopCandidates(limit);
      return response.candidates || [];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

// Hook to apply for a job
export function useApplyJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ jobId, resumeFile }: { jobId: string; resumeFile: File }) => 
      applicationApi.apply(jobId, resumeFile),
    onSuccess: (_, variables) => {
      // Invalidate application status for this job
      queryClient.invalidateQueries({ queryKey: applicationKeys.status(variables.jobId) });
      // Invalidate user's applications list
      queryClient.invalidateQueries({ queryKey: applicationKeys.myApplications });
      // Invalidate all applications list
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
    },
  });
}

// Hook to update application status
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      applicationApi.updateStatus(id, status),
    onSuccess: () => {
      // Invalidate all application-related queries
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
    },
  });
}

// Hook to get resume download URL
export function useResumeDownloadUrl() {
  return useMutation({
    mutationFn: (key: string) => applicationApi.getResumeDownloadUrl(key),
  });
}
