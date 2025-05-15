/**
 * Component for displaying a list of clients
 */
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useTherapistClients } from '../hooks';
import { ClientStatus, ID, Client } from '../../domain/entities';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Icons
import {
  CheckCircle,
  Clock,
  MoreVertical,
  Search,
  Plus,
  ArrowRight,
  XCircle,
  UserPlus,
  UserMinus,
  FileText
} from 'lucide-react';

/**
 * Component for displaying a list of clients
 */
export const ClientList: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const {
    clients,
    isLoadingClients,
    searchResults,
    isSearching,
    assignClient,
    isAssigning,
    removeClient,
    isRemoving,
    updateClientRelationship,
    searchQuery,
    setSearchQuery
  } = useTherapistClients();

  const [newClientUsername, setNewClientUsername] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');
  const [addClientDialogOpen, setAddClientDialogOpen] = useState(false);
  const [clientToRemove, setClientToRemove] = useState<ID | null>(null);
  const [selectedSearchResult, setSelectedSearchResult] = useState<Client | null>(null);

  // Handle client input change
  const handleClientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewClientUsername(e.target.value);
    
    // Clear selected client when input changes
    if (selectedSearchResult && selectedSearchResult.username !== e.target.value) {
      setSelectedSearchResult(null);
    }
    
    // Set search query to find matching clients
    setSearchQuery(e.target.value);
  };
  
  // Handle selecting a client from search results
  const selectSearchResult = (client: Client) => {
    setSelectedSearchResult(client);
    setNewClientUsername(client.username);
  };

  // Handle adding a new client
  const handleAddClient = () => {
    if (!newClientUsername.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid username',
        variant: 'destructive'
      });
      return;
    }

    assignClient(
      {
        clientUsername: selectedSearchResult?.username || newClientUsername,
        notes: newClientNotes
      },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: `Client ${selectedSearchResult?.username || newClientUsername} has been added to your client list.`
          });
          setNewClientUsername('');
          setNewClientNotes('');
          setSelectedSearchResult(null);
          setAddClientDialogOpen(false);
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: `Failed to add client: ${error.message}`,
            variant: 'destructive'
          });
        }
      }
    );
  };

  // Handle removing a client
  const handleRemoveClient = (clientId: ID) => {
    removeClient(
      clientId,
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Client has been removed from your client list.'
          });
          setClientToRemove(null);
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: `Failed to remove client: ${error.message}`,
            variant: 'destructive'
          });
        }
      }
    );
  };

  // Get badge color based on client status
  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case ClientStatus.ACTIVE:
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" /> Active
          </Badge>
        );
      case ClientStatus.INACTIVE:
        return (
          <Badge variant="outline" className="text-yellow-600">
            <Clock className="mr-1 h-3 w-3" /> Inactive
          </Badge>
        );
      case ClientStatus.TERMINATED:
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" /> Terminated
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Navigate to client details page
  const navigateToClient = (clientId: ID) => {
    navigate(`/therapist/clients/${clientId}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Clients</CardTitle>
            <CardDescription>
              Manage and view your assigned clients
            </CardDescription>
          </div>
          <Dialog open={addClientDialogOpen} onOpenChange={setAddClientDialogOpen}>
            <DialogTrigger asChild>
              <Button className="ml-auto">
                <UserPlus className="mr-2 h-4 w-4" /> Add Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Enter the username of the client you want to add to your client list.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Client Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter client username"
                    value={newClientUsername}
                    onChange={handleClientInputChange}
                  />
                  {searchResults && searchResults.length > 0 && !selectedSearchResult && (
                    <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
                      <div className="p-2 bg-muted text-sm font-medium">
                        Search Results
                      </div>
                      <ul className="py-1">
                        {searchResults.map(client => (
                          <li 
                            key={client.id}
                            className="px-2 py-1.5 hover:bg-accent cursor-pointer flex items-center"
                            onClick={() => selectSearchResult(client)}
                          >
                            <span className="font-medium">{client.username}</span>
                            {client.fullName && (
                              <span className="ml-2 text-muted-foreground"> ({client.fullName})</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedSearchResult && (
                    <div className="mt-2 p-2 border rounded-md bg-green-50 flex items-center justify-between">
                      <div>
                        <span className="font-medium">{selectedSearchResult.username}</span>
                        {selectedSearchResult.fullName && (
                          <span className="ml-2 text-muted-foreground">({selectedSearchResult.fullName})</span>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedSearchResult(null)}
                      >
                        Change
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add initial notes about this client"
                    value={newClientNotes}
                    onChange={(e) => setNewClientNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddClientDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddClient} disabled={isAssigning}>
                  {isAssigning ? 'Adding...' : 'Add Client'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoadingClients || isSearching ? (
            <div className="py-6 text-center text-muted-foreground">
              Loading clients...
            </div>
          ) : clients && clients.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        {client.fullName || client.username}
                      </TableCell>
                      <TableCell>{getStatusBadge(client.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span>{client.emotionsCount} emotions tracked</span>
                          <span>{client.crisisEventsCount} crisis events</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateToClient(client.id)}
                          >
                            View <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigateToClient(client.id)}>
                                <FileText className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive" 
                                onClick={() => setClientToRemove(client.id)}
                              >
                                <UserMinus className="mr-2 h-4 w-4" /> Remove Client
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              No clients found. Add your first client to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation dialog for removing a client */}
      <AlertDialog open={!!clientToRemove} onOpenChange={() => setClientToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this client from your list? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => clientToRemove && handleRemoveClient(clientToRemove)}
              disabled={isRemoving}
            >
              {isRemoving ? 'Removing...' : 'Remove Client'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};