import { useState } from "react";
import { format } from "date-fns";
import { Plus, Users, Trash2, Mail } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClientForm } from "@/components/ClientForm";
import { useClientsQuery, useRemoveClient } from "@/hooks/use-clients";

export default function Clients() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const { data: clients, isLoading } = useClientsQuery();
  const { mutate: deleteClient, isPending: isDeleting } = useRemoveClient();

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This might remove associated payments.`)) {
      deleteClient({ id });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your client list and contact info.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20 rounded-xl px-5 h-11">
              <Plus className="w-5 h-5 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <ClientForm onSuccess={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-md shadow-black/5 border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Added On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    Loading clients...
                  </TableCell>
                </TableRow>
              ) : clients?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 text-muted-foreground/50 mb-4" />
                      <p className="text-lg font-medium text-foreground">No clients found</p>
                      <p className="text-sm text-muted-foreground">Add your first client to get started.</p>
                      <Button variant="outline" className="mt-4" onClick={() => setIsAddOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Client
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                clients?.map((client) => (
                  <TableRow key={client.id} className="group transition-colors hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs mr-3">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        {client.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.email ? (
                        <a href={`mailto:${client.email}`} className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                          <Mail className="w-3.5 h-3.5 mr-2" />
                          {client.email}
                        </a>
                      ) : (
                        <span className="text-muted-foreground/50 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(client.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => handleDelete(client.id, client.name)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </Layout>
  );
}
