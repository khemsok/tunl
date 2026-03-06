import { z } from "zod";

export const siteSchema = z
  .string()
  .min(1, "Domain required")
  .transform((val) => {
    let domain = val.trim().toLowerCase();
    domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "");
    domain = domain.replace(/\/.*$/, "");
    return domain;
  })
  .pipe(
    z
      .string()
      .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/, "Invalid domain"),
  );
