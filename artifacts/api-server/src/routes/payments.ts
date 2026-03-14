import { Router, type IRouter } from "express";
import { db, paymentsTable, clientsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  CreatePaymentBody,
  UpdatePaymentBody,
  GetPaymentParams,
  UpdatePaymentParams,
  DeletePaymentParams,
  ListPaymentsQueryParams,
  GetPaymentSummaryQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.use((_req, res, next) => {
  if (!_req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
});

router.get("/payments/summary", async (req, res) => {
  const query = GetPaymentSummaryQueryParams.parse({
    year: req.query.year ? Number(req.query.year) : undefined,
  });

  const yearFilter = query.year
    ? sql`EXTRACT(YEAR FROM ${paymentsTable.paymentDate}) = ${query.year}`
    : sql`1=1`;

  const [totalRow] = await db
    .select({ total: sql<string>`COALESCE(SUM(${paymentsTable.amount}), 0)` })
    .from(paymentsTable)
    .where(yearFilter);

  const byMonth = await db
    .select({
      month: sql<string>`TO_CHAR(${paymentsTable.paymentDate}, 'YYYY-MM')`,
      total: sql<string>`SUM(${paymentsTable.amount})`,
    })
    .from(paymentsTable)
    .where(yearFilter)
    .groupBy(sql`TO_CHAR(${paymentsTable.paymentDate}, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(${paymentsTable.paymentDate}, 'YYYY-MM')`);

  const byClient = await db
    .select({
      clientId: paymentsTable.clientId,
      clientName: clientsTable.name,
      total: sql<string>`SUM(${paymentsTable.amount})`,
    })
    .from(paymentsTable)
    .innerJoin(clientsTable, eq(paymentsTable.clientId, clientsTable.id))
    .where(yearFilter)
    .groupBy(paymentsTable.clientId, clientsTable.name)
    .orderBy(sql`SUM(${paymentsTable.amount}) DESC`);

  const byMethod = await db
    .select({
      method: paymentsTable.paymentMethod,
      total: sql<string>`SUM(${paymentsTable.amount})`,
    })
    .from(paymentsTable)
    .where(yearFilter)
    .groupBy(paymentsTable.paymentMethod)
    .orderBy(sql`SUM(${paymentsTable.amount}) DESC`);

  res.json({
    totalReceived: parseFloat(totalRow?.total ?? "0"),
    totalByMonth: byMonth.map((r) => ({ month: r.month, total: parseFloat(r.total) })),
    totalByClient: byClient.map((r) => ({
      clientId: r.clientId,
      clientName: r.clientName,
      total: parseFloat(r.total),
    })),
    totalByMethod: byMethod.map((r) => ({ method: r.method, total: parseFloat(r.total) })),
  });
});

router.get("/payments", async (req, res) => {
  const query = ListPaymentsQueryParams.parse({
    clientId: req.query.clientId ? Number(req.query.clientId) : undefined,
    year: req.query.year ? Number(req.query.year) : undefined,
    month: req.query.month ? Number(req.query.month) : undefined,
  });

  const conditions = [];
  if (query.clientId) conditions.push(eq(paymentsTable.clientId, query.clientId));
  if (query.year)
    conditions.push(sql`EXTRACT(YEAR FROM ${paymentsTable.paymentDate}) = ${query.year}`);
  if (query.month)
    conditions.push(sql`EXTRACT(MONTH FROM ${paymentsTable.paymentDate}) = ${query.month}`);

  const payments = await db
    .select({
      id: paymentsTable.id,
      clientId: paymentsTable.clientId,
      clientName: clientsTable.name,
      amount: paymentsTable.amount,
      paymentDate: paymentsTable.paymentDate,
      description: paymentsTable.description,
      paymentMethod: paymentsTable.paymentMethod,
      invoiceNumber: paymentsTable.invoiceNumber,
      createdAt: paymentsTable.createdAt,
    })
    .from(paymentsTable)
    .innerJoin(clientsTable, eq(paymentsTable.clientId, clientsTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${paymentsTable.paymentDate} DESC`);

  res.json(
    payments.map((p) => ({
      ...p,
      amount: parseFloat(p.amount as unknown as string),
    }))
  );
});

router.post("/payments", async (req, res) => {
  const body = CreatePaymentBody.parse(req.body);
  const [payment] = await db
    .insert(paymentsTable)
    .values({
      clientId: body.clientId,
      amount: String(body.amount),
      paymentDate: body.paymentDate,
      description: body.description ?? null,
      paymentMethod: body.paymentMethod,
      invoiceNumber: body.invoiceNumber ?? null,
    })
    .returning();

  const [client] = await db
    .select({ name: clientsTable.name })
    .from(clientsTable)
    .where(eq(clientsTable.id, payment.clientId));

  res.status(201).json({
    ...payment,
    clientName: client?.name ?? "",
    amount: parseFloat(payment.amount as unknown as string),
  });
});

router.get("/payments/:id", async (req, res) => {
  const { id } = GetPaymentParams.parse({ id: Number(req.params.id) });

  const [payment] = await db
    .select({
      id: paymentsTable.id,
      clientId: paymentsTable.clientId,
      clientName: clientsTable.name,
      amount: paymentsTable.amount,
      paymentDate: paymentsTable.paymentDate,
      description: paymentsTable.description,
      paymentMethod: paymentsTable.paymentMethod,
      invoiceNumber: paymentsTable.invoiceNumber,
      createdAt: paymentsTable.createdAt,
    })
    .from(paymentsTable)
    .innerJoin(clientsTable, eq(paymentsTable.clientId, clientsTable.id))
    .where(eq(paymentsTable.id, id));

  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  res.json({ ...payment, amount: parseFloat(payment.amount as unknown as string) });
});

router.put("/payments/:id", async (req, res) => {
  const { id } = UpdatePaymentParams.parse({ id: Number(req.params.id) });
  const body = UpdatePaymentBody.parse(req.body);

  const [payment] = await db
    .update(paymentsTable)
    .set({
      clientId: body.clientId,
      amount: String(body.amount),
      paymentDate: body.paymentDate,
      description: body.description ?? null,
      paymentMethod: body.paymentMethod,
      invoiceNumber: body.invoiceNumber ?? null,
    })
    .where(eq(paymentsTable.id, id))
    .returning();

  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  const [client] = await db
    .select({ name: clientsTable.name })
    .from(clientsTable)
    .where(eq(clientsTable.id, payment.clientId));

  res.json({
    ...payment,
    clientName: client?.name ?? "",
    amount: parseFloat(payment.amount as unknown as string),
  });
});

router.delete("/payments/:id", async (req, res) => {
  const { id } = DeletePaymentParams.parse({ id: Number(req.params.id) });
  const [deleted] = await db
    .delete(paymentsTable)
    .where(eq(paymentsTable.id, id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }
  res.status(204).send();
});

export default router;
