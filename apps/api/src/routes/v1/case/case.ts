import { Router, Request } from "express";
import { userMiddleware } from "../../../middleware/userMiddleware.js";
import { createCaseSchema, addSideSchema } from "@repo/zodvalidation";
import { sendEmail } from "../../../utils/sendEmail.js";
import { client } from "@repo/db";

const router:Router = Router();


interface AuthRequest extends Request {
  userId?: string;
}

/**
 * CREATE NEW CASE
 */
 router.post("/", userMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, respondentEmail } = createCaseSchema.parse(req.body);

    // Create the case
    const newCase = await client.case.create({
      data: {
        title,
        createdByUserId: req.userId!, // logged-in user becomes creator
      },
    });

    // Assign creator as CLAIMANT
    await client.side.create({
      data: {
        caseId: newCase.id,
        userId: req.userId!,
        role: "CLAIMANT",
      },
    });

    // Check if respondent user exists
    const respondent = await client.user.findUnique({
      where: { email: respondentEmail },
    });

    if (respondent) {
      // If user is registered → assign them as RESPONDENT
      await client.side.create({
        data: {
          caseId: newCase.id,
          userId: respondent.id,
          role: "RESPONDENT",
        },
      });

      // Send case notification email
      await sendEmail(
        respondentEmail,
        "A Case Has Been Filed Against You",
        `A case titled "${title}" has been filed against you.\n\nPlease login to Judge AI to respond.`
      );
    } else {
      // If not registered, send invitation email
      await sendEmail(
        respondentEmail,
        "You Are Invited to Respond to a Case",
        `A case titled "${title}" has been created and includes you.\n\nCreate an account on Judge AI to respond.`
      );
    }

    return res.status(201).json({
      message: respondent
        ? "Case created. You are CLAIMANT. RESPONDENT notified."
        : "Case created. You are CLAIMANT. RESPONDENT invited to register.",
      case: newCase,
    });

  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});



/**
 * JOIN CASE (Respondent joins the case after receiving email)
 */
router.post("/:caseId/join", userMiddleware, async (req: AuthRequest, res) => {
  try {
    const caseId = req.params.caseId;
    if (!caseId) return res.status(400).json({ error: "caseId is required" });

    // Check case exist
    const existingCase = await client.case.findUnique({ where: { id: caseId } });
    if (!existingCase) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Check if user already has a side in this case
    const alreadySide = await client.side.findFirst({
      where: { caseId, userId: req.userId },
    });

    if (alreadySide) {
      return res.status(400).json({
        error: "You are already a participant in this case.",
        role: alreadySide.role,
      });
    }

    // Assign user as RESPONDENT
    const respondentSide = await client.side.create({
      data: {
        caseId,
        userId: req.userId!,
        role: "RESPONDENT",
      },
    });

    return res.status(201).json({
      message: "You have successfully joined the case as RESPONDENT.",
      side: respondentSide,
    });

  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});


/**
 * GET CASE DETAILS
 */
router.get("/:caseId", userMiddleware, async (req: AuthRequest, res) => {
  try {
    const { caseId } = req.params;

    const caseData = await client.case.findUnique({
      where: { id: caseId },
      include: {
        sides: { include: { user: true } },
        turns: { include: { side: true } },
        verdict: true,
      },
    });

    if (!caseData) return res.status(404).json({ error: "Case not found" });

    // Find user's role in this case
    const userSide = caseData.sides.find(s => s.userId === req.userId);
    const userRole = userSide?.role || null;

    return res.json({ ...caseData, userRole });
  } catch (error: any) {
    console.error("Error fetching case:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

/**
 * GET ALL CASES OF LOGGED-IN USER
 */
router.get("/user/all", userMiddleware, async (req: AuthRequest, res) => {
  try {
    const cases = await client.side.findMany({
      where: { userId: req.userId },
      include: { 
        case: {
          include: {
            turns: { include: { side: true } },
            verdict: true,
          }
        }
      },
    });

    // Remove duplicates by case ID and map to case data
    const uniqueCases = cases.reduce((acc: any[], side) => {
      const existingCase = acc.find(c => c.id === side.case.id);
      if (!existingCase) {
        acc.push({
          ...side.case,
          userRole: side.role,
        });
      }
      return acc;
    }, []);

    return res.json(uniqueCases);
  } catch {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
