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
import { useAddClient } from "@/hooks/use-clients";
import { useToast } from "@/hooks/use-toast";

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export function ClientForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const { mutate: createClient, isPending } = useAddClient();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  function onSubmit(data: ClientFormValues) {
    createClient(
      { data: { ...data, email: data.email || null } },
      {
        onSuccess: () => {
          toast({ title: "Client added successfully!" });
          form.reset();
          onSuccess?.();
        },
        onError: () => {
          toast({ title: "Failed to add client", variant: "destructive" });
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Name *</FormLabel>
              <FormControl>
                <Input placeholder="Acme Corp" {...field} className="bg-background" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="billing@acme.com" type="email" {...field} className="bg-background" />
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
          {isPending ? "Saving..." : "Save Client"}
        </Button>
      </form>
    </Form>
  );
}
