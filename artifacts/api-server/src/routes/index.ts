import { Router, type IRouter } from "express";
import healthRouter from "./health";
import publicRouter from "./public";
import authRouter from "./auth";
import localDataRouter from "./local-data";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use(localDataRouter);
router.use(publicRouter);

export default router;
