import { Router, type IRouter } from "express";
import { db, clientsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateClientBody, DeleteClientParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.use((_req, res, next) => {
  if (!_req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
});

router.get("/clients", async (_req, res) => {
  const clients = await db
    .select()
    .from(clientsTable)
    .orderBy(clientsTable.name);
  res.json(clients);
});

router.post("/clients", async (req, res) => {
  const body = CreateClientBody.parse(req.body);
  const [client] = await db.insert(clientsTable).values(body).returning();
  res.status(201).json(client);
});

router.delete("/clients/:id", async (req, res) => {
  const { id } = DeleteClientParams.parse({ id: Number(req.params.id) });
  const [deleted] = await db
    .delete(clientsTable)
    .where(eq(clientsTable.id, id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Client not found" });
    return;
  }
  res.status(204).send();
});

export default router;
