import { pgTable, serial, integer, text, timestamp, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { clientsTable } from "./clients";

export const paymentMethodEnum = ["cash", "check", "bank_transfer", "credit_card", "paypal", "venmo", "zelle", "other"] as const;

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  clientId: integer("client_id").notNull().references(() => clientsTable.id),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  description: text("description"),
  paymentMethod: text("payment_method").notNull().$type<typeof paymentMethodEnum[number]>(),
  invoiceNumber: text("invoice_number"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ id: true, createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
