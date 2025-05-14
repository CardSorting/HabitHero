/**
 * Component for managing therapist notes for a client
 */
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTherapistNotes } from '../hooks';
import { ID, TherapistNote } from '../../domain/entities';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

// Icons
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar } from 'lucide-react';

interface TherapistNotesProps {
  clientId: ID;
  clientName: string;
}

/**
 * Component for managing therapist notes for a client
 */
export const TherapistNotes: React.FC<TherapistNotesProps> = ({ clientId, clientName }) => {
  const { toast } = useToast();
  const {
    notes,
    isLoadingNotes,
    createNote,
    isCreating,
    updateNote,
    isUpdating,
    deleteNote,
    isDeleting
  } = useTherapistNotes({ clientId });

  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteMood, setNewNoteMood] = useState('');
  const [newNoteProgress, setNewNoteProgress] = useState('');
  const [newNoteGoalCompletion, setNewNoteGoalCompletion] = useState<string>('');
  const [newNoteIsPrivate, setNewNoteIsPrivate] = useState(true);
  const [addNoteDialogOpen, setAddNoteDialogOpen] = useState(false);
  
  const [editingNote, setEditingNote] = useState<TherapistNote | null>(null);
  const [editNoteContent, setEditNoteContent] = useState('');
  const [editNoteMood, setEditNoteMood] = useState('');
  const [editNoteProgress, setEditNoteProgress] = useState('');
  const [editNoteGoalCompletion, setEditNoteGoalCompletion] = useState<string>('');
  const [editNoteIsPrivate, setEditNoteIsPrivate] = useState(true);
  const [editNoteDialogOpen, setEditNoteDialogOpen] = useState(false);
  
  const [noteToDelete, setNoteToDelete] = useState<ID | null>(null);

  // Handle creating a new note
  const handleCreateNote = () => {
    if (!newNoteContent.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter note content',
        variant: 'destructive'
      });
      return;
    }

    createNote(
      {
        sessionDate: format(new Date(), 'yyyy-MM-dd'),
        content: newNoteContent,
        options: {
          mood: newNoteMood || undefined,
          progress: newNoteProgress || undefined,
          goalCompletion: newNoteGoalCompletion ? parseInt(newNoteGoalCompletion) : undefined,
          isPrivate: newNoteIsPrivate
        }
      },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Note added successfully'
          });
          setNewNoteContent('');
          setNewNoteMood('');
          setNewNoteProgress('');
          setNewNoteGoalCompletion('');
          setAddNoteDialogOpen(false);
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: `Failed to add note: ${error.message}`,
            variant: 'destructive'
          });
        }
      }
    );
  };

  // Handle updating a note
  const handleUpdateNote = () => {
    if (!editingNote || !editNoteContent.trim()) {
      return;
    }

    updateNote(
      {
        id: editingNote.id,
        updates: {
          content: editNoteContent,
          mood: editNoteMood || undefined,
          progress: editNoteProgress || undefined,
          goalCompletion: editNoteGoalCompletion ? parseInt(editNoteGoalCompletion) : undefined,
          isPrivate: editNoteIsPrivate
        }
      },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Note updated successfully'
          });
          setEditingNote(null);
          setEditNoteDialogOpen(false);
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: `Failed to update note: ${error.message}`,
            variant: 'destructive'
          });
        }
      }
    );
  };

  // Handle deleting a note
  const handleDeleteNote = (noteId: ID) => {
    deleteNote(
      noteId,
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Note deleted successfully'
          });
          setNoteToDelete(null);
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: `Failed to delete note: ${error.message}`,
            variant: 'destructive'
          });
        }
      }
    );
  };

  // Open edit dialog and populate fields
  const openEditDialog = (note: TherapistNote) => {
    setEditingNote(note);
    setEditNoteContent(note.content);
    setEditNoteMood(note.mood || '');
    setEditNoteProgress(note.progress || '');
    setEditNoteGoalCompletion(note.goalCompletion?.toString() || '');
    setEditNoteIsPrivate(note.isPrivate);
    setEditNoteDialogOpen(true);
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Session Notes</CardTitle>
            <CardDescription>
              Manage your notes for {clientName}
            </CardDescription>
          </div>
          <Dialog open={addNoteDialogOpen} onOpenChange={setAddNoteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Session Note</DialogTitle>
                <DialogDescription>
                  Create a new note for your session with {clientName}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Note Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter your session notes here..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mood">Client Mood</Label>
                    <Input
                      id="mood"
                      placeholder="e.g., Anxious, Calm"
                      value={newNoteMood}
                      onChange={(e) => setNewNoteMood(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="progress">Progress Notes</Label>
                    <Input
                      id="progress"
                      placeholder="e.g., Improving, Stable"
                      value={newNoteProgress}
                      onChange={(e) => setNewNoteProgress(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goalCompletion">Goal Completion (0-100%)</Label>
                    <Input
                      id="goalCompletion"
                      type="number"
                      placeholder="e.g., 75"
                      min="0"
                      max="100"
                      value={newNoteGoalCompletion}
                      onChange={(e) => setNewNoteGoalCompletion(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      checked={newNoteIsPrivate}
                      onCheckedChange={setNewNoteIsPrivate}
                      id="isPrivate"
                    />
                    <Label htmlFor="isPrivate">Private Note</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddNoteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNote} disabled={isCreating}>
                  {isCreating ? 'Saving...' : 'Save Note'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoadingNotes ? (
            <div className="py-6 text-center text-muted-foreground">
              Loading notes...
            </div>
          ) : notes && notes.length > 0 ? (
            <div className="space-y-4">
              {notes.map((note) => (
                <Card key={note.id} className={note.isPrivate ? 'border-amber-200' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {formatDateForDisplay(note.sessionDate)}
                        </span>
                        {note.isPrivate && (
                          <div className="flex items-center text-amber-600">
                            <EyeOff className="mr-1 h-4 w-4" />
                            <span className="text-xs">Private</span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(note)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setNoteToDelete(note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="whitespace-pre-wrap">{note.content}</div>
                      {(note.mood || note.progress || note.goalCompletion !== undefined) && (
                        <div className="mt-4 flex flex-wrap gap-3">
                          {note.mood && (
                            <Badge variant="outline" className="bg-blue-50">
                              Mood: {note.mood}
                            </Badge>
                          )}
                          {note.progress && (
                            <Badge variant="outline" className="bg-green-50">
                              Progress: {note.progress}
                            </Badge>
                          )}
                          {note.goalCompletion !== undefined && (
                            <Badge variant="outline" className="bg-purple-50">
                              Goals: {note.goalCompletion}%
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              No notes found. Add your first note to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Note Dialog */}
      <Dialog open={editNoteDialogOpen} onOpenChange={setEditNoteDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Session Note</DialogTitle>
            <DialogDescription>
              Update your session notes for {clientName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-content">Note Content</Label>
              <Textarea
                id="edit-content"
                placeholder="Enter your session notes here..."
                value={editNoteContent}
                onChange={(e) => setEditNoteContent(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-mood">Client Mood</Label>
                <Input
                  id="edit-mood"
                  placeholder="e.g., Anxious, Calm"
                  value={editNoteMood}
                  onChange={(e) => setEditNoteMood(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-progress">Progress Notes</Label>
                <Input
                  id="edit-progress"
                  placeholder="e.g., Improving, Stable"
                  value={editNoteProgress}
                  onChange={(e) => setEditNoteProgress(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-goalCompletion">Goal Completion (0-100%)</Label>
                <Input
                  id="edit-goalCompletion"
                  type="number"
                  placeholder="e.g., 75"
                  min="0"
                  max="100"
                  value={editNoteGoalCompletion}
                  onChange={(e) => setEditNoteGoalCompletion(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  checked={editNoteIsPrivate}
                  onCheckedChange={setEditNoteIsPrivate}
                  id="edit-isPrivate"
                />
                <Label htmlFor="edit-isPrivate">Private Note</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateNote} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Note Confirmation */}
      <AlertDialog open={!!noteToDelete} onOpenChange={() => setNoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => noteToDelete && handleDeleteNote(noteToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Note'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};