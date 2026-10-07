import "server-only";
import {eq} from "drizzle-orm";
import {db,isDatabaseConfigured} from "./index";
import {platformContent} from "./schema";
import {z} from "zod";
export const metricsSchema=z.array(z.object({label:z.string().trim().min(2).max(100),value:z.number().finite().min(0).max(1_000_000_000),suffix:z.string().max(12)})).max(12);
export async function publicMetrics(){if(!isDatabaseConfigured)return[];const [row]=await db.select({metrics:platformContent.metrics}).from(platformContent).where(eq(platformContent.key,"public-metrics")).limit(1);const parsed=metricsSchema.safeParse(row?.metrics??[]);return parsed.success?parsed.data:[];}
