import { z } from "zod";

export const scheduleSchema = z.object({
  name: z.string().min(1, "Name required").max(30, "Name too long"),
  days: z.array(z.number().min(0).max(6)).min(1, "Select at least one day"),
  startMin: z.number().min(0).max(1439),
  endMin: z.number().min(0).max(1439),
  blockedSites: z.array(z.string()).min(1, "Add at least one site"),
});
