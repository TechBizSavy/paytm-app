import express, { Request, Response } from "express";
import { prisma } from "../db";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { authMiddleware } from "../middleware";
import { z } from "zod";

const router = express.Router();

// ------------------ SIGNUP ------------------

const signupSchema = z.object({
  username: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string()
});

router.post("/signup", async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = signupSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(411).json({ message: "Invalid input format" });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: req.body.username }
    });

    if (existingUser) {
      res.status(411).json({ message: "Email already taken" });
      return;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName
      }
    });

    // Create account with random balance
    const balance = parseFloat((1 + Math.random() * 10000).toFixed(2));
    await prisma.account.create({
      data: {
        userId: user.id,
        balance
      }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    // ✅ Send balance back in response
    res.json({
      message: "User created successfully",
      userId: user.id,
      token,
      balance
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
});

// ------------------ SIGNIN ------------------

const signinSchema = z.object({
  username: z.string().email(),
  password: z.string()
});

router.post("/signin", async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = signinSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(411).json({ message: "Invalid credentials" });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        username: req.body.username,
        password: req.body.password
      }
    });

    if (!user) {
      res.status(411).json({ message: "Error while logging in" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({id : user.id,  token :token });
  } catch (err: unknown) {
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ UPDATE ------------------

const updateSchema = z.object({
  password: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

router.put("/", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = updateSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(411).json({ message: "Invalid update format" });
      return;
    }

    await prisma.user.update({
      where: { id: req.userId },
      data: req.body
    });

    res.json({ message: "Updated successfully" });
  } catch (err: unknown) {
    res.status(500).json({ message: "Update failed" });
  }
});

// GET all users with account balances

router.get("/bulk", async (req: Request, res: Response): Promise<void> => {
  const filter = (req.query.filter as string) || "";

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: filter, mode: "insensitive" } },
          { lastName: { contains: filter, mode: "insensitive" } }
        ]
      }
    });

    const result = users.map((user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
    }) => ({
      _id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName
    }));

    res.json({ user: result });
  } catch (err: unknown) {
    res.status(500).json({ message: "Could not fetch users" });
  }
});

export default router;
