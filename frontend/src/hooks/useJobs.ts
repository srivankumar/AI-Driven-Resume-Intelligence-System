import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobApi } from '../services/api';

// Query keys for cache management
export const jobKeys = {
  all: ['jobs'] as const,
  active: ['jobs', 'active'] as const,
  allJobs: ['jobs', 'all'] as const,
  detail: (id: string) => ['jobs', 'detail', id] as const,
};

// Hook to get active jobs (user dashboard)
export function useActiveJobs() {
  return useQuery({
    queryKey: jobKeys.active,
    queryFn: async () => {
      const response = await jobApi.getActiveJobs();
      return response.jobs || [];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes for active jobs list
  });
}

// Hook to get all jobs (admin dashboard)
export function useAllJobs() {
  return useQuery({
    queryKey: jobKeys.allJobs,
    queryFn: async () => {
      const response = await jobApi.getAllJobs();
      return response.jobs || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for admin jobs list
  });
}

// Hook to get job details by ID
export function useJob(jobId: string | undefined) {
  return useQuery({
    queryKey: jobKeys.detail(jobId || ''),
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID is required');
      const response = await jobApi.getJobById(jobId);
      return response.job;
    },
    enabled: !!jobId, // Only run query if jobId exists
    staleTime: 5 * 60 * 1000, // 5 minutes for job details
  });
}

// Hook to create a new job
export function useCreateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      skills: string;
      experience: string;
      application_deadline: string;
    }) => jobApi.createJob(data),
    onSuccess: () => {
      // Invalidate and refetch job lists
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}

// Hook to update a job
export function useUpdateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => jobApi.updateJob(id, data),
    onSuccess: (_, variables) => {
      // Invalidate job lists and specific job detail
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(variables.id) });
    },
  });
}

// Hook to end job application
export function useEndJobApplication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => jobApi.endApplication(id),
    onSuccess: () => {
      // Invalidate all job lists
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}

// Hook to delete a job
export function useDeleteJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => jobApi.deleteJob(id),
    onSuccess: () => {
      // Invalidate all job lists
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}
