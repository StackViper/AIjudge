import { Router } from "express";
import { client } from "@repo/db";
import {registerSchema ,loginSchema } from "@repo/zodvalidation";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router: Router = Router();

router.post("/signup", async (req, res) => {
  try {
    const body = registerSchema.parse(req.body); 
    const { name, email, password } = body;

    
    const existingUser = await client.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists." });
    }

   
    const passwordHash = await bcrypt.hash(password, 10);

   
    const newUser = await client.user.create({
      data: { name, email, passwordHash },
    });

    return res.status(201).json({
      message: "Signup successful",
      userId: newUser.id,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Invalid Data" });
  }
});
router.post("/signin", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const { email, password } = data;

    const user = await client.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
export default router;