import { Router } from "express";
import authRouter from "./auth/auth.js";
import caseRouter from "./case/case.js";
import documentsRouter from "./document/documents.js";
import turnsRouter from "./turns.js";
import searchRouter from "./search.js";
import verdictRouter from "./verdict.js";
const router: Router = Router();

router.use("/auth", authRouter);
router.use("/cases", caseRouter);
router.use("/", documentsRouter);  // Documents route already includes /cases in path
router.use("/", turnsRouter);      // Turns, search, verdict need path fixes in their files
router.use("/", searchRouter);
router.use("/", verdictRouter);
export default router;