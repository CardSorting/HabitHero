/**
 * Hook for managing therapist clients
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTherapistService } from './useTherapistContext';
import { useAuth } from '@/hooks/use-auth';
import { ID, DateString, ClientSummary, Client, ClientStatus } from '../../domain/entities';

/**
 * Hook for managing therapist clients
 */
export const useTherapistClients = () => {
  const { user } = useAuth();
  const therapistService = useTherapistService();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  // Therapist ID from authenticated user
  const therapistId = user?.id as ID;

  // Query for fetching all clients
  const {
    data: clients,
    isLoading: isLoadingClients,
    error: clientsError,
    refetch: refetchClients
  } = useQuery({
    queryKey: ['/api/therapist/clients'],
    queryFn: () => therapistService.getClients(therapistId),
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
    queryFn: () => therapistService.searchClients(searchQuery),
    enabled: !!searchQuery && searchQuery.length >= 2
  });

  // Mutation for assigning a client to the therapist
  const {
    mutate: assignClient,
    isPending: isAssigning,
    error: assignError
  } = useMutation({
    mutationFn: ({
      clientUsername,
      startDate = new Date().toISOString().split('T')[0],
      notes
    }: {
      clientUsername: string;
      startDate?: DateString;
      notes?: string;
    }) => therapistService.assignClient(therapistId, clientUsername, startDate, notes),
    onSuccess: () => {
      // Invalidate the clients query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/therapist/clients'] });
    }
  });

  // Mutation for removing a client from the therapist
  const {
    mutate: removeClient,
    isPending: isRemoving
  } = useMutation({
    mutationFn: (clientId: ID) => therapistService.removeClient(therapistId, clientId),
    onSuccess: () => {
      // Invalidate the clients query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/therapist/clients'] });
    }
  });

  // Mutation for updating a client's relationship
  const {
    mutate: updateClientRelationship,
    isPending: isUpdating
  } = useMutation({
    mutationFn: ({
      id,
      status,
      endDate,
      notes
    }: {
      id: ID;
      status?: ClientStatus;
      endDate?: DateString;
      notes?: string;
    }) => therapistService.updateClientTherapistRelationship(id, therapistId, {
      status,
      endDate,
      notes
    }),
    onSuccess: () => {
      // Invalidate the clients query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/therapist/clients'] });
    }
  });

  // Function to get a client by ID
  const getClientById = async (clientId: ID): Promise<Client | undefined> => {
    return therapistService.getClientById(therapistId, clientId);
  };

  // Function to check if a therapist is authorized for a client
  const isAuthorizedForClient = async (clientId: ID): Promise<boolean> => {
    return therapistService.isAuthorizedForClient(therapistId, clientId);
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