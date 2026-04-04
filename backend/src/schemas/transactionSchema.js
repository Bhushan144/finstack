import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE'], { required_error: "Type must be either INCOME or EXPENSE" }),
  amount: z.number().positive("Amount must be greater than zero"),
  category: z.string().min(1, "Category is required").trim(),
  note: z.string().trim().optional(),
  date: z.string().datetime("Invalid date format. Must be a valid ISO 8601 string.")
});