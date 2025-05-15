/**
 * Hook for managing therapist notes
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTherapistContext } from './useTherapistContext';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { 
  ID, 
  TherapistNote 
} from '../../domain/entities';

interface UseTherapistNotesProps {
  clientId: ID;
}

/**
 * Hook for managing therapist notes for a specific client
 */
export const useTherapistNotes = ({ clientId }: UseTherapistNotesProps) => {
  const { user } = useAuth();
  const { therapistId } = useTherapistContext();
  const queryClient = useQueryClient();

  // Query for fetching notes for a client
  const {
    data: notes,
    isLoading: isLoadingNotes,
    error: notesError,
    refetch: refetchNotes
  } = useQuery({
    queryKey: ['/api/therapist/clients', clientId, 'notes'],
    queryFn: async () => {
      const response = await apiRequest<TherapistNote[]>({
        url: `/api/therapist/clients/${clientId}/notes`,
        method: 'GET',
      });
      return response;
    },
    enabled: !!therapistId && !!clientId
  });

  // Mutation for creating a note
  const {
    mutate: createNote,
    isPending: isCreating
  } = useMutation({
    mutationFn: async ({
      sessionDate,
      content,
      options
    }: {
      sessionDate: string;
      content: string;
      options?: {
        mood?: string;
        progress?: string;
        goalCompletion?: number;
        isPrivate?: boolean;
      };
    }) => {
      const response = await apiRequest<TherapistNote>({
        url: `/api/therapist/clients/${clientId}/notes`,
        method: 'POST',
        data: {
          therapistId,
          sessionDate,
          content,
          ...options
        }
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate the notes query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/therapist/clients', clientId, 'notes'] });
      toast({
        title: "Success",
        description: "Note created successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create note: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutation for updating a note
  const {
    mutate: updateNote,
    isPending: isUpdating
  } = useMutation({
    mutationFn: async ({
      id,
      updates
    }: {
      id: ID;
      updates: Partial<TherapistNote>;
    }) => {
      const response = await apiRequest<TherapistNote>({
        url: `/api/therapist/notes/${id}`,
        method: 'PUT',
        data: {
          therapistId,
          ...updates
        }
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate the notes query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/therapist/clients', clientId, 'notes'] });
      toast({
        title: "Success",
        description: "Note updated successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update note: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutation for deleting a note
  const {
    mutate: deleteNote,
    isPending: isDeleting
  } = useMutation({
    mutationFn: async (id: ID) => {
      const response = await apiRequest({
        url: `/api/therapist/notes/${id}`,
        method: 'DELETE',
        data: { therapistId }
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate the notes query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/therapist/clients', clientId, 'notes'] });
      toast({
        title: "Success",
        description: "Note deleted successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete note: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    // Queries
    notes,
    isLoadingNotes,
    notesError,
    refetchNotes,
    
    // Mutations
    createNote,
    isCreating,
    updateNote,
    isUpdating,
    deleteNote,
    isDeleting
  };
};