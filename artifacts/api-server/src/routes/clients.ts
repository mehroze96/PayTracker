import { Router, type IRouter } from "express";
import { db, clientsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateClientBody, DeleteClientParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.use((_req, res, next) => {
  if (!_req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
});

router.get("/clients", async (req, res) => {
  if (!req.isAuthenticated()) return;
  const userId = req.user.id;

  const clients = await db
    .select()
    .from(clientsTable)
    .where(eq(clientsTable.userId, userId))
    .orderBy(clientsTable.name);

  res.json(clients);
});

router.post("/clients", async (req, res) => {
  if (!req.isAuthenticated()) return;
  const userId = req.user.id;

  const body = CreateClientBody.parse(req.body);
  const [client] = await db
    .insert(clientsTable)
    .values({ ...body, userId })
    .returning();

  res.status(201).json(client);
});

router.delete("/clients/:id", async (req, res) => {
  if (!req.isAuthenticated()) return;
  const userId = req.user.id;

  const { id } = DeleteClientParams.parse({ id: Number(req.params.id) });
  const [deleted] = await db
    .delete(clientsTable)
    .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, userId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Client not found" });
    return;
  }
  res.status(204).send();
});

export default router;
