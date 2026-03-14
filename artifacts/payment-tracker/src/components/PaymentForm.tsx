import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddPayment, useEditPayment } from "@/hooks/use-payments";
import { useClientsQuery } from "@/hooks/use-clients";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Payment } from "@workspace/api-client-react";

const paymentMethods = ["cash", "check", "bank_transfer", "credit_card", "paypal", "venmo", "zelle", "other"] as const;

const paymentSchema = z.object({
  clientId: z.coerce.number().min(1, "Client is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  paymentDate: z.string().min(1, "Date is required"),
  paymentMethod: z.enum(paymentMethods),
  description: z.string().optional(),
  invoiceNumber: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  payment?: Payment;
  onSuccess?: () => void;
}

export function PaymentForm({ payment, onSuccess }: PaymentFormProps) {
  const { toast } = useToast();
  const { data: clients } = useClientsQuery();
  const { mutate: createPayment, isPending: isCreating } = useAddPayment();
  const { mutate: updatePayment, isPending: isUpdating } = useEditPayment();

  const isPending = isCreating || isUpdating;

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      clientId: payment?.clientId || 0,
      amount: payment?.amount || ("" as unknown as number),
      paymentDate: payment?.paymentDate ? format(new Date(payment.paymentDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      paymentMethod: payment?.paymentMethod || "bank_transfer",
      description: payment?.description || "",
      invoiceNumber: payment?.invoiceNumber || "",
    },
  });

  function onSubmit(data: PaymentFormValues) {
    if (payment) {
      updatePayment(
        { id: payment.id, data },
        {
          onSuccess: () => {
            toast({ title: "Payment updated successfully!" });
            onSuccess?.();
          },
          onError: () => toast({ title: "Failed to update payment", variant: "destructive" }),
        }
      );
    } else {
      createPayment(
        { data },
        {
          onSuccess: () => {
            toast({ title: "Payment recorded successfully!" });
            form.reset();
            onSuccess?.();
          },
          onError: () => toast({ title: "Failed to record payment", variant: "destructive" }),
        }
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client *</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(parseInt(val, 10))}
                  value={field.value ? field.value.toString() : ""}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount ($) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} className="bg-background font-mono" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="bg-background" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Method *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="invoiceNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Number</FormLabel>
              <FormControl>
                <Input placeholder="INV-001" {...field} className="bg-background" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description / Notes</FormLabel>
              <FormControl>
                <Input placeholder="Project milestone 1..." {...field} className="bg-background" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isPending} 
          className="w-full h-11 text-base font-semibold shadow-md mt-6"
        >
          {isPending ? "Saving..." : payment ? "Update Payment" : "Record Payment"}
        </Button>
      </form>
    </Form>
  );
}
