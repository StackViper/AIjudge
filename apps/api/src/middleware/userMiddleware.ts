import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare module "express" {
  interface Request {
    userId?: string;
  }
}

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized: Missing Authorization Header" });
  }


  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Invalid Token Format" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error(" JWT_SECRET is missing in .env");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const decoded = jwt.verify(token, secret) as { userId: string };
    req.userId = decoded.userId;

    return next();
  } catch (err) {
    console.error("JWT Verification failed:", err);
    return res.status(401).json({ message: "Unauthorized: Invalid or Expired Token" });
  }
};
