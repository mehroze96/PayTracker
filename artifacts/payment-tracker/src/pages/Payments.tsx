import { useState } from "react";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { Plus, MoreHorizontal, Pencil, Trash2, Download } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentForm } from "@/components/PaymentForm";
import { usePaymentsQuery, useRemovePayment } from "@/hooks/use-payments";
import { useClientsQuery } from "@/hooks/use-clients";
import { Payment } from "@workspace/api-client-react";

export default function Payments() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  
  // Filters
  const [clientIdFilter, setClientIdFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  
  const { data: clients } = useClientsQuery();
  const { data: payments, isLoading } = usePaymentsQuery({
    clientId: clientIdFilter !== "all" ? parseInt(clientIdFilter, 10) : undefined,
    year: yearFilter !== "all" ? parseInt(yearFilter, 10) : undefined,
  });
  
  const { mutate: deletePayment } = useRemovePayment();

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  function exportToExcel() {
    if (!payments || payments.length === 0) return;

    const rows = payments.map((p) => ({
      "Date": format(new Date(p.paymentDate), "MM/dd/yyyy"),
      "Client": p.clientName,
      "Amount": p.amount,
      "Description": p.description ?? "",
      "Payment Method": p.paymentMethod.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      "Invoice Number": p.invoiceNumber ?? "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Column widths
    worksheet["!cols"] = [
      { wch: 14 },  // Date
      { wch: 24 },  // Client
      { wch: 14 },  // Amount
      { wch: 36 },  // Description
      { wch: 20 },  // Payment Method
      { wch: 18 },  // Invoice Number
    ];

    // Format Amount column as currency (column C = index 2)
    const range = XLSX.utils.decode_range(worksheet["!ref"] ?? "A1");
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: 2 });
      if (worksheet[cellRef]) {
        worksheet[cellRef].z = '"$"#,##0.00';
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");

    const fileName = `payments-${yearFilter !== "all" ? yearFilter : "all"}-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground mt-1">Manage and track your received payments.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={exportToExcel}
            disabled={!payments || payments.length === 0}
            className="rounded-xl px-4 h-11 gap-2"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </Button>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20 rounded-xl px-5 h-11">
              <Plus className="w-5 h-5 mr-2" />
              Add Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
            </DialogHeader>
            <PaymentForm onSuccess={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card className="shadow-md shadow-black/5 border-border/50 mb-6 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-64">
            <Select value={clientIdFilter} onValueChange={setClientIdFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients?.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-48">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {[...Array(5)].map((_, i) => {
                  const y = new Date().getFullYear() - i;
                  return <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="shadow-md shadow-black/5 border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Loading payments...
                  </TableCell>
                </TableRow>
              ) : payments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No payments found.
                  </TableCell>
                </TableRow>
              ) : (
                payments?.map((payment) => (
                  <TableRow key={payment.id} className="group transition-colors hover:bg-muted/30">
                    <TableCell className="font-medium">
                      {format(new Date(payment.paymentDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{payment.clientName}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {payment.description || payment.invoiceNumber || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        {payment.paymentMethod.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => setEditingPayment(payment)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this payment?")) {
                                deletePayment({ id: payment.id });
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingPayment} onOpenChange={(open) => !open && setEditingPayment(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          {editingPayment && (
            <PaymentForm 
              payment={editingPayment} 
              onSuccess={() => setEditingPayment(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
