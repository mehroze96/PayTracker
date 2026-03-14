import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clientsRouter from "./clients";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(clientsRouter);
router.use(paymentsRouter);

export default router;
