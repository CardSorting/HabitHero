/**
 * Hook for managing therapist clients
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTherapistContext } from './useTherapistContext';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { ID, ClientSummary } from '../../domain/entities';
import { toast } from '@/hooks/use-toast';

/**
 * Hook for managing therapist clients
 */
export const useTherapistClients = () => {
  const { user } = useAuth();
  const { therapistId } = useTherapistContext();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  // Query for fetching all clients
  const {
    data: clients,
    isLoading: isLoadingClients,
    error: clientsError,
    refetch: refetchClients
  } = useQuery({
    queryKey: ['/api/therapist/clients'],
    queryFn: async () => {
      const response = await apiRequest<ClientSummary[]>({
        url: '/api/therapist/clients',
        method: 'GET',
      });
      return response;
    },
    enabled: !!therapistId
  });

  // Query for searching clients by username
  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
    refetch: refetchSearch
  } = useQuery({
    queryKey: ['/api/therapist/clients/search', searchQuery],
    queryFn: async () => {
      const response = await apiRequest<ClientSummary[]>({
        url: `/api/therapist/clients/search?query=${encodeURIComponent(searchQuery)}`,
        method: 'GET',
      });
      return response;
    },
    enabled: !!searchQuery && (
      searchQuery.length >= 2 || 
      // Allow searches with just a number (likely an ID)
      (!isNaN(Number(searchQuery)) && Number.isInteger(Number(searchQuery)))
    ),
    // Don't keep stale search data when query changes
    staleTime: 0
  });

  // Mutation for assigning a client to the therapist
  const {
    mutate: assignClient,
    isPending: isAssigning,
    error: assignError
  } = useMutation({
    mutationFn: async ({
      clientUsername,
      startDate = new Date().toISOString().split('T')[0],
      notes
    }: {
      clientUsername: string;
      startDate?: string;
      notes?: string;
    }) => {
      const response = await apiRequest({
        url: `/api/therapist/clients/assign`,
        method: 'POST',
        data: {
          therapistId,
          clientUsername,
          startDate,
          notes
        }
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate the clients query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/therapist/clients'] });
      toast({
        title: "Success",
        description: "Client assigned successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to assign client: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutation for removing a client from the therapist
  const {
    mutate: removeClient,
    isPending: isRemoving
  } = useMutation({
    mutationFn: async (clientId: ID) => {
      const response = await apiRequest({
        url: `/api/therapist/clients/${clientId}/remove`,
        method: 'DELETE',
        data: { therapistId }
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate the clients query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/therapist/clients'] });
      toast({
        title: "Success",
        description: "Client removed successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to remove client: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutation for updating a client's relationship
  const {
    mutate: updateClientRelationship,
    isPending: isUpdating
  } = useMutation({
    mutationFn: async ({
      id,
      status,
      endDate,
      notes
    }: {
      id: ID;
      status?: string;
      endDate?: string;
      notes?: string;
    }) => {
      const response = await apiRequest({
        url: `/api/therapist/clients/${id}/relationship`,
        method: 'PUT',
        data: {
          therapistId,
          status,
          endDate,
          notes
        }
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate the clients query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/therapist/clients'] });
      toast({
        title: "Success",
        description: "Client relationship updated successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update client relationship: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Function to get a client by ID
  const getClientById = async (clientId: ID): Promise<ClientSummary | undefined> => {
    try {
      const response = await apiRequest<ClientSummary>({
        url: `/api/therapist/clients/${clientId}`,
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error("Error fetching client:", error);
      return undefined;
    }
  };

  // Function to check if a therapist is authorized for a client
  const isAuthorizedForClient = async (clientId: ID): Promise<boolean> => {
    try {
      const response = await apiRequest<{authorized: boolean}>({
        url: `/api/therapist/clients/${clientId}/authorized`,
        method: 'GET'
      });
      return response?.authorized || false;
    } catch (error) {
      console.error("Error checking authorization:", error);
      return false;
    }
  };

  // Function to handle search input change
  const handleSearchInputChange = (query: string) => {
    setSearchQuery(query);
  };

  return {
    // Queries
    clients,
    isLoadingClients,
    clientsError,
    refetchClients,
    searchResults,
    isSearching,
    searchError,
    refetchSearch,
    
    // Mutations
    assignClient,
    isAssigning,
    assignError,
    removeClient,
    isRemoving,
    updateClientRelationship,
    isUpdating,
    
    // Additional functions
    getClientById,
    isAuthorizedForClient,
    handleSearchInputChange,
    searchQuery,
    setSearchQuery
  };
};