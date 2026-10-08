import "server-only";
import {sql} from "drizzle-orm";
/** Drizzle's postgres-js adapter expects raw timestamp parameters serialized. */
export function quotaUsageQuery(userId:string,start:Date){const since=start.toISOString();return sql`select (select count(*) from site_audits where user_id=${userId} and created_at>=${since}::timestamptz and status<>'failed') + (select coalesce(sum(credits),0) from tool_usage where user_id=${userId} and created_at>=${since}::timestamptz and status<>'failed') as used`;}
