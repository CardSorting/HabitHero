/**
 * Custom hook for fetching client details
 * Following SOLID principles, DDD, and Clean Architecture
 */
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { ID } from '../../domain/entities';

interface ClientDetails {
  id: ID;
  userId: ID;
  username: string;
  email?: string;
  fullName?: string;
  // Additional client properties as needed
}

/**
 * Custom hook for retrieving client details
 */
export function useClientDetails(clientId: ID) {
  const {
    data: client,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [`/api/therapist/clients/${clientId}`],
    queryFn: async () => {
      const response = await apiRequest({
        url: `/api/therapist/clients/${clientId}`,
        method: 'GET',
      });
      return response as ClientDetails;
    },
    enabled: Boolean(clientId),
  });
  
  return {
    client,
    isLoading,
    isError,
    error,
    refetch,
  };
}