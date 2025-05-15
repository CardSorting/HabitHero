/**
 * Hook for managing therapist notes
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTherapistService } from './useTherapistContext';
import { useAuth } from '@/hooks/use-auth';
import { 
  ID, 
  DateString, 
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
  const therapistService = useTherapistService();
  const queryClient = useQueryClient();

  // Therapist ID from authenticated user
  const therapistId = user?.id as ID;

  // Query for fetching notes for a client
  const {
    data: notes,
    isLoading: isLoadingNotes,
    error: notesError,
    refetch: refetchNotes
  } = useQuery({
    queryKey: ['/api/therapist/clients', clientId, 'notes'],
    queryFn: () => therapistService.getClientNotes(therapistId, clientId),
    enabled: !!therapistId && !!clientId
  });

  // Mutation for creating a note
  const {
    mutate: createNote,
    isPending: isCreating
  } = useMutation({
    mutationFn: ({
      sessionDate,
      content,
      options
    }: {
      sessionDate: DateString;
      content: string;
      options?: {
        mood?: string;
        progress?: string;
        goalCompletion?: number;
        isPrivate?: boolean;
      };
    }) => therapistService.addNote(
      therapistId,
      clientId,
      sessionDate,
      content,
      options
    ),
    onSuccess: () => {
      // Invalidate the notes query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/therapist/clients', clientId, 'notes'] });
    }
  });

  // Mutation for updating a note
  const {
    mutate: updateNote,
    isPending: isUpdating
  } = useMutation({
    mutationFn: ({
      id,
      updates
    }: {
      id: ID;
      updates: Partial<TherapistNote>;
    }) => therapistService.updateNote(id, therapistId, updates),
    onSuccess: () => {
      // Invalidate the notes query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/therapist/clients', clientId, 'notes'] });
    }
  });

  // Mutation for deleting a note
  const {
    mutate: deleteNote,
    isPending: isDeleting
  } = useMutation({
    mutationFn: (id: ID) => therapistService.deleteNote(id, therapistId),
    onSuccess: () => {
      // Invalidate the notes query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/therapist/clients', clientId, 'notes'] });
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