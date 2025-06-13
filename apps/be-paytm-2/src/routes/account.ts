import express, { Request, Response } from "express";
import { prisma } from "../db";
import { authMiddleware } from "../middleware";


const router = express.Router();

// ----------- BALANCE CHECK -----------
router.get("/balance", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const account = await prisma.account.findUnique({
      where: { userId: req.userId }
    });

   if (!account) {
      res.status(404).json({ message: "Account not found" });
      return;
    }

    res.json({ balance: account.balance });

  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Unknown error" });
    }
  }
});

// ----------- TRANSFER MONEY -----------
router.post("/transfer", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const amount = parseFloat(req.body.amount);
  const to = req.body.to;

  if (!to || isNaN(amount) || amount <= 0) {
    res.status(400).json({ message: "Invalid transfer data" });
    return;
  }

  try {
    await prisma.$transaction(async (tx: typeof prisma) => {
      const sender = await tx.account.findUnique({
        where: { userId: req.userId }
      });

      if (!sender || sender.balance < amount) {
        throw new Error("Insufficient balance");
      }

      const recipient = await tx.account.findUnique({
        where: { userId: to }
      });

      if (!recipient) {
        throw new Error("Invalid recipient account");
      }

      await tx.account.update({
        where: { userId: req.userId },
        data: { balance: { decrement: amount } }
      });

      await tx.account.update({
        where: { userId: to },
        data: { balance: { increment: amount } }
      });
    });

    res.json({
      message: "Transfer successful",
      from: req.userId,
      to,
      amount
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(400).json({ message: "Something went wrong" });
    }
  }
});


export default router;
