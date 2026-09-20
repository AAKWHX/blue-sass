/**
 * Seeds a fresh Neon database with the AWWA demo dataset:
 * one super admin, a delivery team, three client accounts and their projects.
 *
 * Usage:  npm run db:push  &&  npm run db:seed
 * Safe to re-run — every insert is idempotent on a natural key.
 */
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema.ts";

// Load .env.local without adding a dotenv dependency.
for (const file of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // File is optional.
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local first.");
  process.exit(1);
}

const db = drizzle(neon(url), { schema, casing: "snake_case" });
const { users, projects, projectMembers, projectMilestones, projectFiles, feedback, messages, leads } =
  schema;

async function upsertUser(input: {
  email: string;
  name: string;
  password: string;
  role: schema.AppRole;
  company?: string;
  title?: string;
  locale?: string;
}) {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);
  if (existing[0]) return existing[0].id;

  const [row] = await db
    .insert(users)
    .values({
      email: input.email,
      name: input.name,
      passwordHash: await bcrypt.hash(input.password, 12),
      role: input.role,
      company: input.company ?? null,
      title: input.title ?? null,
      locale: input.locale ?? "en",
      emailVerified: new Date(),
    })
    .returning({ id: users.id });
  return row.id;
}

async function main() {
  console.log("Seeding AWWA database…");

  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe!2026";

  const omar = await upsertUser({
    email: process.env.SEED_ADMIN_EMAIL ?? "admin@aakwhx.com",
    name: "Omar Al-Kaabi",
    password: adminPassword,
    role: "super_admin",
    company: "AAKWHX",
    title: "Founder",
    locale: "ar",
  });
  const lieke = await upsertUser({
    email: "lieke@aakwhx.com", name: "Lieke van Dijk", password: adminPassword,
    role: "admin", company: "AAKWHX", title: "Head of Delivery", locale: "nl",
  });
  const jonas = await upsertUser({
    email: "jonas@aakwhx.com", name: "Jonas Weber", password: adminPassword,
    role: "pm", company: "AAKWHX", title: "Project Manager", locale: "de",
  });
  const elif = await upsertUser({
    email: "elif@aakwhx.com", name: "Elif Demir", password: adminPassword,
    role: "employee", company: "AAKWHX", title: "Lead Engineer", locale: "tr",
  });

  const nadia = await upsertUser({
    email: "nadia@meridian-health.com", name: "Nadia Haddad", password: "ClientDemo!2026",
    role: "client", company: "Meridian Health", title: "CTO", locale: "en",
  });
  const tom = await upsertUser({
    email: "tom@northgate-logistics.nl", name: "Tom Bakker", password: "ClientDemo!2026",
    role: "client", company: "Northgate Logistics", title: "COO", locale: "nl",
  });

  const projectSeeds = [
    {
      slug: "meridian-care-cloud",
      name: "Meridian Care Cloud",
      summary:
        "A HIPAA-aligned patient coordination platform unifying 14 clinics, with realtime triage queues and an AI intake assistant.",
      clientId: nadia, pmId: jonas, stage: "development" as const, progress: 62,
      visibility: "public" as const, industry: "Healthcare", budget: 185000,
      estimatedHours: 480, hoursLogged: 780,
      tech: ["Next.js", "Postgres", "WebSockets", "OpenAI"],
      cover: "/covers/meridian.svg",
    },
    {
      slug: "northgate-freight-os",
      name: "Northgate Freight OS",
      summary:
        "Fleet dispatch, customs paperwork and live shipment tracking rebuilt into one operations console for 240 drivers.",
      clientId: tom, pmId: jonas, stage: "testing" as const, progress: 81,
      visibility: "public" as const, industry: "Logistics", budget: 240000,
      estimatedHours: 210, hoursLogged: 1140,
      tech: ["Next.js", "Drizzle", "Mapbox", "Redis"],
      cover: "/covers/northgate.svg",
    },
    {
      slug: "aakwhx-internal-erp",
      name: "AAKWHX Internal ERP",
      summary:
        "Our own delivery backbone: staffing, capacity planning, invoicing and margin tracking across every active engagement.",
      clientId: omar, pmId: lieke, stage: "design" as const, progress: 28,
      visibility: "private" as const, industry: "Professional Services", budget: 96000,
      estimatedHours: 620, hoursLogged: 240,
      tech: ["Next.js", "Neon", "Auth.js"],
      cover: "/covers/erp.svg",
    },
  ];

  for (const seed of projectSeeds) {
    const existing = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.slug, seed.slug))
      .limit(1);
    if (existing[0]) {
      console.log(`  · project ${seed.slug} already present`);
      continue;
    }

    const [project] = await db
      .insert(projects)
      .values({
        ...seed,
        currency: "EUR",
        startDate: new Date("2026-01-15"),
        deadline: new Date("2026-11-30"),
      })
      .returning({ id: projects.id });

    await db.insert(projectMembers).values([
      { projectId: project.id, userId: seed.pmId, role: "pm" },
      { projectId: project.id, userId: elif, role: "employee" },
    ]);

    const stages = ["planning", "design", "development", "testing", "review"] as const;
    const titles = [
      "Discovery workshops and technical audit",
      "Design system and high-fidelity screens",
      "Core feature build and API integration",
      "QA, load testing and accessibility pass",
      "Client review and launch readiness",
    ];
    const doneCount = Math.round((seed.progress / 100) * stages.length);

    await db.insert(projectMilestones).values(
      stages.map((stage, i) => ({
        projectId: project.id,
        title: titles[i],
        stage,
        status: (i < doneCount ? "done" : i === doneCount ? "in_progress" : "todo") as
          schema.MilestoneStatus,
        assigneeId: i < 2 ? seed.pmId : elif,
        dueDate: new Date(2026, 2 + i * 2, 15),
        estimatedHours: i < doneCount ? 0 : 120,
        orderIndex: i,
      })),
    );

    await db.insert(projectFiles).values([
      {
        projectId: project.id, name: "Design system v3", category: "design", kind: "image",
        url: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200&q=80",
        sizeKb: 4820, version: "v3", visibleToClient: true, uploadedBy: seed.pmId,
      },
      {
        projectId: project.id, name: "Sprint 6 walkthrough", category: "media", kind: "video",
        url: "https://cdn.coverr.co/videos/coverr-typing-on-a-laptop-1573/1080p.mp4",
        sizeKb: 18400, version: "v1", visibleToClient: true, uploadedBy: elif,
      },
      {
        projectId: project.id, name: "Staging demo", category: "media", kind: "demo",
        url: `https://staging.${seed.slug}.aakwhx.dev`,
        sizeKb: 0, version: "v1", visibleToClient: true, uploadedBy: elif,
      },
      {
        projectId: project.id, name: "Statement of work", category: "contract", kind: "document",
        url: "https://example.com/sow.pdf", sizeKb: 620, version: "v2",
        visibleToClient: true, uploadedBy: lieke,
      },
    ]);

    await db.insert(feedback).values([
      {
        projectId: project.id, authorId: seed.clientId, category: "design",
        body: "The dashboard density is right, but the empty states need friendlier copy.",
        resolved: true,
      },
      {
        projectId: project.id, authorId: seed.clientId, category: "scope",
        body: "Can we add CSV export to the reporting screen before launch?",
        resolved: false,
      },
    ]);

    await db.insert(messages).values([
      {
        projectId: project.id, senderId: seed.pmId,
        body: "Sprint 6 is deployed to staging. The walkthrough video is in your files tab.",
      },
      {
        projectId: project.id, senderId: seed.clientId,
        body: "Reviewed it this morning — looks strong. Two notes added to feedback.",
      },
    ]);

    console.log(`  ✓ project ${seed.slug}`);
  }

  const leadCount = await db.select({ id: leads.id }).from(leads).limit(1);
  if (!leadCount[0]) {
    await db.insert(leads).values([
      {
        name: "Sara Yilmaz", email: "sara@atlasretail.com", company: "Atlas Retail Group",
        locale: "tr", projectType: "ecommerce", services: ["design", "development", "seo"],
        budgetEstimate: 120000, timelineWeeks: 20, currency: "EUR", status: "new",
        message: "Seven markets, one launch. We need multilingual from day one.",
      },
      {
        name: "Marc Dubois", email: "marc@fintrail.fr", company: "Fintrail",
        locale: "fr", projectType: "webapp", services: ["development", "integrations"],
        budgetEstimate: 64000, timelineWeeks: 12, currency: "EUR", status: "contacted",
        message: "Compliance dashboard for our risk team.",
      },
    ]);
    console.log("  ✓ demo leads");
  }

  console.log("\nDone. Sign in with:");
  console.log(`  admin  ${process.env.SEED_ADMIN_EMAIL ?? "admin@aakwhx.com"} / ${adminPassword}`);
  console.log("  client nadia@meridian-health.com / ClientDemo!2026");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
