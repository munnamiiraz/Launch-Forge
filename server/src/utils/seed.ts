/**
 * seed.ts — LaunchForge full database seed
 *
 * Generates:
 *   - 100 users   (global name combinations, mixed roles/statuses)
 *   - 100 sessions + accounts (one per user)
 *   - 100 workspaces (one per user — owner model)
 *   - ~30 workspace members (multi-member workspaces for paid plans)
 *   - ~150 waitlists (1–4 per workspace, realistic slugs)
 *   - ~500 subscribers (2–5 per waitlist with referral chains)
 *   - ~40 feedback boards + ~200 feature requests + votes + comments
 *   - ~30 roadmaps + ~150 roadmap items
 *   - ~80 changelogs (mix of published + drafts)
 *   - ~220 payments (paid users across PRO/GROWTH × MONTHLY/YEARLY)
 *
 * Usage:
 *   pnpm exec tsx src/utils/seed.ts
 *   OR add to package.json:
 *   "prisma": { "seed": "tsx src/utils/seed.ts" }
 *   then run: pnpm dlx prisma db seed
 *
 * Requirements:
 *   npm install -D ts-node @types/node bcryptjs @types/bcryptjs
 *   (bcryptjs is optional — password hashing for Account records)
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client";
import { envVars } from "../config/env";

const adapter = new PrismaPg({ connectionString: envVars.DATABASE_URL });
const db = new PrismaClient({ adapter });

/* ─────────────────────────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────────────────────────── */

function rng(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: readonly T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function randomDate(daysBack: number, daysAgo = 0): Date {
  const now   = Date.now();
  const start = now - daysBack * 86_400_000;
  const end   = now - daysAgo  * 86_400_000;
  return new Date(start + Math.random() * (end - start));
}

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function cuid(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `c${timestamp}${randomPart}`;
}

function referralCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

/** Log progress clearly */
function log(msg: string) {
  console.log(`\x1b[36m[seed]\x1b[0m ${msg}`);
}
function success(msg: string) {
  console.log(`\x1b[32m[seed]\x1b[0m ✓ ${msg}`);
}

/* ─────────────────────────────────────────────────────────────────
   NAME POOLS — global, diverse, realistic
   ──────────────────────────────────────────────────────────────── */

const FIRST_NAMES_MALE = [
  // South Asian
  "Arjun", "Rohan", "Vikram", "Rahul", "Aditya", "Kiran", "Sanjay", "Neel",
  "Pradeep", "Suresh", "Ravi", "Mohan", "Ankit", "Dhruv", "Ishaan", "Kabir",
  "Aarav", "Yash", "Dev", "Shiv", "Tanvir", "Imran", "Farhan", "Zubair",
  // East Asian
  "Wei", "Hao", "Jian", "Chen", "Ming", "Yuki", "Kenji", "Takashi", "Ryō",
  "Haruto", "Sōta", "Ren", "Jiho", "Minjun", "Seojun", "Hyun", "Joon",
  // Southeast Asian
  "Nguyen", "Minh", "Duc", "Thinh", "Reza", "Fajar", "Rizki", "Bagas",
  // Middle Eastern / North African
  "Omar", "Ahmed", "Hassan", "Khalid", "Tariq", "Bilal", "Yusuf", "Faisal",
  "Samir", "Nasir", "Amir", "Ziad", "Hamza", "Kareem",
  // African
  "Kofi", "Kwame", "Emeka", "Chidi", "Tunde", "Seun", "Babatunde", "Obinna",
  "Tendai", "Sipho", "Bongani", "Lerato", "Thabo",
  // European
  "Luca", "Marco", "Alessandro", "Matteo", "Lorenzo", "Giovanni", "Niklas",
  "Lukas", "Felix", "Jonas", "Finn", "Lars", "Henrik", "Sven", "Erik",
  "Pierre", "Louis", "Hugo", "Antoine", "Théo", "Gabriel",
  "Álvaro", "Carlos", "Diego", "Javier", "Miguel", "Pablo", "Sergio",
  "Ivan", "Dmitri", "Alexei", "Nikolai", "Andrei", "Pavel", "Viktor",
  // Anglo-American
  "James", "John", "William", "Oliver", "Noah", "Elijah", "Lucas", "Mason",
  "Ethan", "Aiden", "Jackson", "Sebastian", "Carter", "Owen", "Wyatt",
  "Jack", "Dylan", "Ryan", "Nathan", "Tyler", "Luke", "Connor", "Caleb",
  // Latin American
  "Mateo", "Sebastián", "Alejandro", "Samuel", "Daniel", "David",
  "Tomás", "Nicolás", "Leonardo",
] as const;

const FIRST_NAMES_FEMALE = [
  // South Asian
  "Priya", "Ananya", "Divya", "Kavya", "Pooja", "Shreya", "Aishwarya",
  "Neha", "Riya", "Simran", "Fatima", "Ayesha", "Zara", "Nadia", "Layla",
  // East Asian
  "Mei", "Xin", "Ying", "Li", "Yuna", "Haruka", "Yui", "Aoi", "Saki",
  "Sakura", "Mio", "Rin", "Ji-Eun", "Soo-Yeon", "Minji",
  // Southeast Asian
  "Linh", "Lan", "Thu", "Huong", "Siti", "Nurul", "Putri",
  // Middle Eastern / North African
  "Sara", "Lina", "Rania", "Hana", "Yasmin", "Nour", "Dina", "Rana",
  "Mona", "Amira", "Samira", "Leila",
  // African
  "Amara", "Adaeze", "Chioma", "Ngozi", "Funmi", "Yewande", "Zinhle",
  "Naledi", "Zanele", "Ayasha", "Abebi",
  // European
  "Sofia", "Isabella", "Giulia", "Valentina", "Chiara", "Elena",
  "Hannah", "Emma", "Lea", "Anna", "Lena", "Laura", "Maria", "Mia",
  "Camille", "Léa", "Manon", "Chloé", "Inès", "Zoé",
  "Carmen", "Lucía", "Martina", "Paula", "Valeria", "Claudia",
  "Anastasia", "Oksana", "Katya", "Natasha", "Irina", "Alina",
  // Anglo-American
  "Emma", "Olivia", "Ava", "Isabella", "Sophia", "Mia", "Charlotte",
  "Amelia", "Harper", "Evelyn", "Abigail", "Emily", "Grace", "Chloe",
  "Victoria", "Madison", "Luna", "Penelope", "Riley", "Zoey",
  "Samantha", "Lily", "Hannah", "Addison", "Natalie",
  // Latin American
  "Camila", "Valentina", "Gabriela", "Fernanda", "Daniela", "Ana",
] as const;

const LAST_NAMES = [
  // South Asian
  "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Mehta", "Joshi", "Shah",
  "Rao", "Nair", "Iyer", "Pillai", "Reddy", "Verma", "Agarwal", "Malhotra",
  "Khan", "Ahmed", "Hassan", "Rahman", "Islam", "Hossain", "Chowdhury",
  // East Asian
  "Wang", "Li", "Zhang", "Liu", "Chen", "Yang", "Huang", "Zhao", "Wu",
  "Tanaka", "Yamamoto", "Watanabe", "Suzuki", "Sato", "Kato", "Ito",
  "Kim", "Lee", "Park", "Choi", "Jeong", "Kang", "Cho",
  // Southeast Asian
  "Nguyen", "Tran", "Le", "Pham", "Santoso", "Wijaya", "Kusuma",
  // Middle Eastern / North African
  "Al-Rashid", "Al-Farouq", "Abdullah", "Mohammed", "Ibrahim", "Khalil",
  "Nasser", "Mansour", "El-Amin", "Farouk", "Haddad", "Aziz",
  // African
  "Mensah", "Asante", "Okafor", "Adeyemi", "Nwosu", "Osei", "Diallo",
  "Kamara", "Kouyaté", "Ndlovu", "Dlamini", "Mokoena", "Mahlangu",
  // European
  "Rossi", "Ferrari", "Russo", "Esposito", "Ricci", "Ferrara",
  "Müller", "Schmidt", "Weber", "Fischer", "Wagner", "Koch",
  "Dupont", "Bernard", "Martin", "Petit", "Leroy", "Moreau",
  "García", "Martínez", "López", "Sánchez", "González", "Hernández",
  "Ivanov", "Petrov", "Smirnov", "Kuznetsov", "Popov", "Volkov",
  "Nielsen", "Hansen", "Andersen", "Larsen", "Christensen",
  // Anglo-American
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Davis", "Wilson",
  "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin",
  "Thompson", "Young", "Walker", "Allen", "King", "Wright", "Scott",
  "Torres", "Nguyen", "Hill", "Flores", "Adams", "Nelson", "Baker",
  // Latin American
  "Oliveira", "Souza", "Silva", "Santos", "Costa", "Pereira", "Alves",
  "Gómez", "Reyes", "Cruz", "Morales", "Rivera", "Ramos",
] as const;

/* ─────────────────────────────────────────────────────────────────
   DOMAIN / CONTENT POOLS
   ──────────────────────────────────────────────────────────────── */

const EMAIL_DOMAINS = [
  "gmail.com", "outlook.com", "yahoo.com", "hotmail.com", "protonmail.com",
  "icloud.com", "me.com", "hey.com", "fastmail.com", "zoho.com",
  "company.io", "startup.io", "dev.io", "tech.co", "corp.com",
  "enterprise.net", "business.org", "ventures.io", "studio.co",
] as const;

const PRODUCT_NAMES = [
  "FlowDesk", "Nexus AI", "PulseBoard", "ClearDocs", "SnapStack",
  "GridBase", "Veloze", "Cortex", "Prism Analytics", "Orbit CRM",
  "NeuralWrite", "DevFlow", "ByteBase", "CodePilot", "LaunchKit",
  "QuickForm", "DataMesh", "Syncly", "Konnect", "Hivelink",
  "Papertrail Pro", "Canvly", "MotionLabs", "Archvault", "LogPulse",
  "TurboSheet", "QuoteForge", "Draftly", "Threadly", "Postly",
  "Moneta", "Cashify", "WealthTrack", "BudgetBloom", "InvoiceFlow",
  "Healthify", "NutriScan", "MindWave", "FitLoop", "CarePath",
  "StudyStream", "LearnFlow", "CourseKit", "Tutorly", "ClassBase",
  "GameSpark", "PixelPlay", "VoxelCraft", "QuestMaker", "ArcadeKit",
  "Shipify", "PackPro", "StoreBase", "RetailIQ", "CartStream",
  "CallTree", "VoiceBot", "ChatBase", "SupportAI", "HelpDesk Pro",
  "SecureKey", "VaultPass", "AuthFlow", "PermissionIQ", "AccessPro",
  "ContractAI", "LegalPad", "DocuSign Pro", "PolicyBot", "ClauseKit",
] as const;

const TAGLINES = [
  "Ship faster, build better",
  "Your AI-powered workflow engine",
  "From zero to launch in minutes",
  "The platform built for modern teams",
  "Automate the boring, focus on what matters",
  "Data-driven decisions, simplified",
  "Collaboration without the chaos",
  "Everything you need to scale",
  "The future of work, today",
  "Stop switching tabs, start shipping",
  "One tool to replace them all",
  "Built for builders",
  "Where ideas become products",
  "The last tool you'll ever need",
  "Productivity, reinvented",
] as const;

const FEATURE_REQUEST_TITLES = [
  "Dark mode support", "Mobile app", "Bulk import via CSV", "API access",
  "Two-factor authentication", "Zapier integration", "Slack notifications",
  "Custom domains", "White-label branding", "Team roles & permissions",
  "Export to PDF", "Offline mode", "Calendar sync", "SSO / SAML support",
  "Advanced search filters", "Keyboard shortcuts", "Custom themes",
  "Version history", "Audit logs", "Multi-language support",
  "Email digest notifications", "Priority support tier", "SLA guarantees",
  "Real-time collaboration", "Webhooks support", "GitHub integration",
  "Automated reminders", "Custom fields", "Advanced analytics dashboard",
  "Public API documentation", "Rate limit increases", "Batch operations",
  "Undo/redo functionality", "Drag-and-drop interface", "Custom reports",
  "In-app video recording", "AI summarisation", "Smart suggestions",
  "Automatic backups", "Data retention policies",
] as const;

const ROADMAP_ITEM_TITLES = [
  "OAuth integration", "Performance improvements", "Mobile-first redesign",
  "Advanced permissions system", "Real-time sync engine", "Analytics v2",
  "Import/export tools", "Custom branding", "Developer API v2",
  "Enterprise SSO", "Webhooks platform", "Notification centre",
  "Collaboration tools", "Search overhaul", "Onboarding flow v2",
  "Billing portal upgrade", "Data export", "GDPR compliance tools",
  "Accessibility (WCAG 2.1)", "Internationalisation", "Dark mode",
  "Plugin system", "Marketplace launch", "Partner integrations",
] as const;

const CHANGELOG_TITLES = [
  "Performance improvements across the board",
  "Introducing dark mode",
  "New API endpoints for developers",
  "Improved mobile experience",
  "Team collaboration features",
  "Security enhancements and bug fixes",
  "New analytics dashboard",
  "Bulk actions now available",
  "Custom domain support",
  "Faster load times — 40% improvement",
  "New notification settings",
  "Export to CSV and PDF",
  "Advanced filter options",
  "Keyboard shortcuts",
  "New integrations: Slack, Zapier, HubSpot",
] as const;

const COMMENT_BODIES = [
  "This is exactly what we've been waiting for!",
  "Would love to see this prioritised in the next sprint.",
  "We use this every day — any timeline on this?",
  "Critical for our team's workflow. Please ship this ASAP.",
  "+1 from our side. Blocking us from upgrading.",
  "Is there a workaround in the meantime?",
  "Voted! This would save us 2 hours every week.",
  "Our enterprise clients are asking for this constantly.",
  "Please add this. We're currently using a competitor just for this feature.",
  "Any update on the timeline for this?",
  "We'd be happy to beta test this when it's ready.",
  "This is a must-have for any team over 10 people.",
  "Great idea. Could be extended further with custom fields.",
  "We built an internal tool for this. Happy to share the spec.",
  "Upvoted! The current workflow is painful.",
] as const;

/* ─────────────────────────────────────────────────────────────────
   PLAN / STATUS DISTRIBUTIONS
   ──────────────────────────────────────────────────────────────── */

/** Returns a plan weighted toward FREE, with paid spread realistically */
function weightedPlan(): "FREE" | "PRO" | "GROWTH" {
  const r = Math.random();
  if (r < 0.55) return "FREE";
  if (r < 0.85) return "PRO";
  return "GROWTH";
}

function weightedStatus(): "ACTIVE" | "SUSPENDED" | "INACTIVE" {
  const r = Math.random();
  if (r < 0.88) return "ACTIVE";
  if (r < 0.95) return "SUSPENDED";
  return "INACTIVE";
}

function weightedRole(): "USER" | "ADMIN" {
  return Math.random() < 0.04 ? "ADMIN" : "USER";
}

/* ─────────────────────────────────────────────────────────────────
   SEED FUNCTIONS
   ──────────────────────────────────────────────────────────────── */

async function seedUsers(count: number) {
  log(`Creating ${count} users…`);

  const TOTAL_FIRST = [...FIRST_NAMES_MALE, ...FIRST_NAMES_FEMALE];
  const users: {
    id: string; name: string; email: string;
    role: string; status: string; createdAt: Date;
    plan: "FREE" | "PRO" | "GROWTH";
  }[] = [];

  const usedEmails = new Set<string>();

  for (let i = 0; i < count; i++) {
    const firstName = pick(TOTAL_FIRST);
    const lastName  = pick(LAST_NAMES);
    const domain    = pick(EMAIL_DOMAINS);
    const status    = weightedStatus();
    const role      = weightedRole();
    const plan      = weightedPlan();
    const createdAt = randomDate(365, 0);

    // Make email unique
    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z]/g, "")}@${domain}`;
    let attempt = 0;
    while (usedEmails.has(email)) {
      attempt++;
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z]/g, "")}${attempt}@${domain}`;
    }
    usedEmails.add(email);

    users.push({
      id:        cuid(),
      name:      `${firstName} ${lastName}`,
      email,
      role,
      status,
      plan,
      createdAt,
    });
  }

  // Create users in batches using createMany for better performance
  const BATCH = 50;
  for (let i = 0; i < users.length; i += BATCH) {
    const batch = users.slice(i, i + BATCH);
    
    // Use createMany with skipDuplicates for better performance
    await db.user.createMany({
      data: batch.map((u) => ({
        id:            u.id,
        name:          u.name,
        email:         u.email,
        emailVerified: Math.random() > 0.2,
        role:          u.role,
        status:        u.status,
        createdAt:     u.createdAt,
        updatedAt:     u.createdAt,
      })),
      skipDuplicates: true,
    });
    
    if ((i / BATCH + 1) % 4 === 0) log(`  users: ${Math.min(i + BATCH, users.length)}/${count}`);
  }

  success(`Created ${count} users`);
  return users;
}

async function seedAccountsAndSessions(users: { id: string; email: string; createdAt: Date }[]) {
  log("Creating accounts and sessions…");

  const BATCH = 50;
  for (let i = 0; i < users.length; i += BATCH) {
    const batch = users.slice(i, i + BATCH);
    await db.account.createMany({
      data: batch.map((u) => ({
        id: uuid(), userId: u.id, accountId: u.email, providerId: "credential",
        password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQN0TU1BUlWy",
        createdAt: u.createdAt, updatedAt: u.createdAt,
      })),
      skipDuplicates: true,
    });
  }


  // Sessions — 60% of users have an active session
  const withSession = users.filter(() => Math.random() < 0.1);
  const BATCH_S = 50;
  for (let i = 0; i < withSession.length; i += BATCH_S) {
    const batch = withSession.slice(i, i + BATCH_S);
    await db.session.createMany({
      data: batch.map((u) => {
        const createdAt = randomDate(30, 0);
        return {
          id: cuid(), userId: u.id, token: cuid() + cuid(),
          createdAt, updatedAt: createdAt,
          expiresAt: new Date(createdAt.getTime() + 30 * 86_400_000),
          ipAddress: `${rng(1,254)}.${rng(1,254)}.${rng(1,254)}.${rng(1,254)}`,
          userAgent: pick(["Mozilla/5.0 (Macintosh...)", "Mozilla/5.0 (Windows...)"]),
        };
      }),
      skipDuplicates: true,
    });
  }


  success(`Created ${users.length} accounts + ${withSession.length} sessions`);
}

async function seedWorkspaces(users: { id: string; name: string; plan: "FREE" | "PRO" | "GROWTH"; createdAt: Date }[]) {
  log("Creating workspaces…");

  const workspaces: { id: string; ownerId: string; name: string; slug: string; plan: "FREE" | "PRO" | "GROWTH"; createdAt: Date }[] = [];
  const usedSlugs = new Set<string>();

  for (const user of users) {
    const rawSlug = slugify(user.name.split(" ")[0] + "-" + pick(["labs", "studio", "hq", "co", "io", "app", "works", "space", "hub", "cloud"]));
    let slug = rawSlug;
    let attempt = 0;
    while (usedSlugs.has(slug)) {
      attempt++;
      slug = `${rawSlug}-${attempt}`;
    }
    usedSlugs.add(slug);

    workspaces.push({
      id:        cuid(),
      ownerId:   user.id,
      name:      `${user.name.split(" ")[0]}'s Workspace`,
      slug,
      plan:      user.plan,
      createdAt: user.createdAt,
    });
  }

  const BATCH = 50;
  for (let i = 0; i < workspaces.length; i += BATCH) {
    const batch = workspaces.slice(i, i + BATCH);
    await db.workspace.createMany({
      data: batch.map((w) => ({
        id: w.id, name: w.name, slug: w.slug, ownerId: w.ownerId,
        plan: w.plan, createdAt: w.createdAt, updatedAt: w.createdAt,
      })),
      skipDuplicates: true,
    });

    if ((i / BATCH + 1) % 4 === 0) log(`  workspaces: ${Math.min(i + BATCH, workspaces.length)}/${workspaces.length}`);
  }

  // Add workspace memberships for paid plans (they have teams)
  log("Adding workspace members…");
  const paidWorkspaces = workspaces.filter((w) => w.plan !== "FREE");
  const userIds = users.map((u) => u.id);
  let memberCount = 0;

  for (const ws of paidWorkspaces) {
    const memberSlots = ws.plan === "GROWTH" ? rng(2, 5) : rng(1, 3);
    const candidates  = userIds.filter((id) => id !== ws.ownerId);
    const members     = pickN(candidates, Math.min(memberSlots, candidates.length));

    for (const userId of members) {
      try {
        await db.workspaceMember.create({
          data: {
            id:          cuid(),
            workspaceId: ws.id,
            userId,
            role:        "MEMBER",
            joinedAt:    randomDate(180, 0),
          },
        });
        memberCount++;
      } catch {
        // skip duplicate
      }
    }
  }

  success(`Created ${workspaces.length} workspaces + ${memberCount} members`);
  return workspaces;
}

async function seedWaitlists(workspaces: { id: string; plan: string; createdAt: Date }[]) {
  log("Creating waitlists…");

  const waitlists: { id: string; workspaceId: string; name: string; slug: string; isOpen: boolean; createdAt: Date }[] = [];
  const usedSlugs = new Set<string>();

  for (const ws of workspaces) {
    // FREE = 1, PRO = 1–3, GROWTH = 2–4
    const count =
      ws.plan === "FREE"    ? 1 :
      ws.plan === "PRO"     ? rng(1, 3) :
                              rng(2, 4);

    for (let j = 0; j < count; j++) {
      const productName = pick(PRODUCT_NAMES);
      const baseSlug    = slugify(productName) + (j > 0 ? `-v${j + 1}` : "");
      let slug = baseSlug;
      let attempt = 0;
      while (usedSlugs.has(slug)) {
        attempt++;
        slug = `${baseSlug}-${attempt}`;
      }
      usedSlugs.add(slug);

      waitlists.push({
        id:          cuid(),
        workspaceId: ws.id,
        name:        productName,
        slug,
        isOpen:      Math.random() > 0.2,
        createdAt:   randomDate(300, 10),
      });
    }
  }

  const BATCH = 50;
  for (let i = 0; i < waitlists.length; i += BATCH) {
    const batch = waitlists.slice(i, i + BATCH);
    await db.waitlist.createMany({
    data: batch.map((w) => ({
      id: w.id, workspaceId: w.workspaceId, name: w.name, slug: w.slug,
      description: pick(TAGLINES), isOpen: w.isOpen,
      createdAt: w.createdAt, updatedAt: w.createdAt,
    })),
    skipDuplicates: true,
  });
    if ((i / BATCH + 1) % 4 === 0) log(`  waitlists: ${Math.min(i + BATCH, waitlists.length)}/${waitlists.length}`);
  }

  success(`Created ${waitlists.length} waitlists`);
  return waitlists;
}

async function seedSubscribers(waitlists: { id: string; createdAt: Date }[]) {
  log("Creating subscribers (this takes a moment)…");

  let totalSubs = 0;
  const TOTAL_FIRST = [...FIRST_NAMES_MALE, ...FIRST_NAMES_FEMALE];
  const usedEmails  = new Set<string>();

  for (const wl of waitlists) {
    const subCount = rng(2, 5);
    const subs: {
      id: string; waitlistId: string; name: string; email: string;
      referralCode: string; referredById: string | null;
      referralsCount: number; isConfirmed: boolean; createdAt: Date;
    }[] = [];
    const usedInWaitlist = new Set<string>();

    for (let i = 0; i < subCount; i++) {
      const firstName = pick(TOTAL_FIRST);
      const lastName  = pick(LAST_NAMES);
      const domain    = pick(EMAIL_DOMAINS);

      let email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z]/g, "")}@${domain}`;
      let att = 0;
      while (usedEmails.has(email) || usedInWaitlist.has(email)) {
        att++;
        email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z]/g, "")}${att}@${domain}`;
      }
      usedEmails.add(email);
      usedInWaitlist.add(email);

      const createdAt = randomDate(
        Math.floor((Date.now() - wl.createdAt.getTime()) / 86_400_000),
        0,
      );

      subs.push({
        id:             cuid(),
        waitlistId:     wl.id,
        name:           `${firstName} ${lastName}`,
        email,
        referralCode:   referralCode(),
        referredById:   null,  // set in second pass
        referralsCount: 0,
        isConfirmed:    Math.random() > 0.25,
        createdAt,
      });
    }

    // Second pass — assign referrals (40% of subs are referred by someone earlier)
    for (let i = 1; i < subs.length; i++) {
      if (Math.random() < 0.1) {
        const referrerIdx = rng(0, i - 1);
        subs[i].referredById = subs[referrerIdx].id;
        subs[referrerIdx].referralsCount++;
      }
    }

    // Insert in batches of 100
    // Insert in batches of 100
    const BATCH = 100;
    for (let i = 0; i < subs.length; i += BATCH) {
      const batch = subs.slice(i, i + BATCH);
      await db.subscriber.createMany({
        data: batch.map((s) => ({
          id:             s.id,
          waitlistId:     s.waitlistId,
          name:           s.name,
          email:          s.email,
          referralCode:   s.referralCode,
          referredById:   s.referredById,
          referralsCount: s.referralsCount,
          isConfirmed:    s.isConfirmed,
          createdAt:      s.createdAt,
          updatedAt:      s.createdAt,
        })),
        skipDuplicates: true,
      });
    }

    totalSubs += subs.length;
  }

  success(`Created ${totalSubs.toLocaleString()} subscribers`);
  return totalSubs;
}

async function seedFeedback(workspaces: { id: string; plan: string; createdAt: Date }[]) {
  log("Creating feedback boards, feature requests, votes & comments…");

  const TOTAL_FIRST = [...FIRST_NAMES_MALE, ...FIRST_NAMES_FEMALE];
  let boardCount = 0, reqCount = 0, voteCount = 0, commentCount = 0;

  // Only PRO/GROWTH workspaces have feedback boards
  const eligible = workspaces.filter((w) => w.plan === "PRO" || w.plan === "GROWTH");

  for (const ws of eligible) {
    const numBoards = ws.plan === "GROWTH" ? rng(1, 3) : 1;

    for (let b = 0; b < numBoards; b++) {
      const boardName = pick(["Product Feedback", "Feature Requests", "Bug Reports", "Roadmap Ideas", "Public Board"]);
      const boardSlug = slugify(boardName) + (b > 0 ? `-${b + 1}` : "");

      let board;
      try {
        board = await db.feedbackBoard.create({
          data: {
            id:          cuid(),
            workspaceId: ws.id,
            name:        boardName,
            slug:        boardSlug,
            description: "Share your ideas and help us build a better product.",
            isPublic:    true,
            createdAt:   ws.createdAt,
            updatedAt:   ws.createdAt,
          },
        });
      } catch {
        continue;
      }
      boardCount++;

      const numRequests = rng(2, 5);
      const titles = pickN(FEATURE_REQUEST_TITLES as unknown as string[], numRequests);

      for (const title of titles) {
        const STATUSES = ["UNDER_REVIEW", "PLANNED", "IN_PROGRESS", "COMPLETED", "DECLINED"] as const;
        const status   = pick(STATUSES);
        const reqCreatedAt = randomDate(200, 0);

        const req = await db.featureRequest.create({
          data: {
            id:          cuid(),
            boardId:     board.id,
            title,
            description: `We would love to see ${title.toLowerCase()} added to the platform. This would greatly improve our workflow.`,
            status,
            votesCount:  0,
            authorEmail: `${pick(TOTAL_FIRST).toLowerCase()}@${pick(EMAIL_DOMAINS)}`,
            authorName:  `${pick(TOTAL_FIRST)} ${pick(LAST_NAMES)}`,
            createdAt:   reqCreatedAt,
            updatedAt:   reqCreatedAt,
          },
        });
        reqCount++;

        // Votes (2–30 per request)
        const numVotes = rng(2, 30);
        const voterEmails = new Set<string>();
        let actualVotes = 0;
        for (let v = 0; v < numVotes; v++) {
          const voterEmail = `${pick(TOTAL_FIRST).toLowerCase()}.${rng(1, 999)}@${pick(EMAIL_DOMAINS)}`;
          if (voterEmails.has(voterEmail)) continue;
          voterEmails.add(voterEmail);
          try {
            await db.vote.create({
              data: {
                id:               cuid(),
                featureRequestId: req.id,
                voterEmail,
                createdAt:        randomDate(100, 0),
              },
            });
            actualVotes++;
            voteCount++;
          } catch { /* skip */ }
        }

        // Update vote count
        if (actualVotes > 0) {
          await db.featureRequest.update({
            where: { id: req.id },
            data:  { votesCount: actualVotes },
          });
        }

        // Comments (0–5 per request)
        const numComments = rng(0, 5);
        for (let c = 0; c < numComments; c++) {
          const commentCreatedAt = randomDate(90, 0);
          await db.comment.create({
            data: {
              id:               cuid(),
              featureRequestId: req.id,
              authorEmail:      `${pick(TOTAL_FIRST).toLowerCase()}.${rng(1, 999)}@${pick(EMAIL_DOMAINS)}`,
              authorName:       `${pick(TOTAL_FIRST)} ${pick(LAST_NAMES)}`,
              body:             pick(COMMENT_BODIES),
              createdAt:        commentCreatedAt,
              updatedAt:        commentCreatedAt,
            },
          });
          commentCount++;
        }
      }
    }
  }

  success(`Created ${boardCount} boards · ${reqCount} requests · ${voteCount} votes · ${commentCount} comments`);
}

async function seedRoadmaps(workspaces: { id: string; plan: string; createdAt: Date }[]) {
  log("Creating roadmaps and roadmap items…");

  const eligible = workspaces.filter((w) => w.plan === "PRO" || w.plan === "GROWTH");
  let roadmapCount = 0, itemCount = 0;

  for (const ws of eligible) {
    const numRoadmaps = ws.plan === "GROWTH" ? rng(1, 2) : 1;

    for (let r = 0; r < numRoadmaps; r++) {
      const roadmapName = r === 0 ? "Public Roadmap" : `Q${rng(1, 4)} ${new Date().getFullYear()} Roadmap`;
      const roadmapSlug = slugify(roadmapName) + (r > 0 ? `-${r}` : "");

      let roadmap;
      try {
        roadmap = await db.roadmap.create({
          data: {
            id:          cuid(),
            workspaceId: ws.id,
            name:        roadmapName,
            slug:        roadmapSlug,
            description: "Here's what we're working on and what's coming next.",
            isPublic:    true,
            createdAt:   ws.createdAt,
            updatedAt:   ws.createdAt,
          },
        });
      } catch {
        continue;
      }
      roadmapCount++;

      const numItems  = rng(2, 5);
      const itemTitles = pickN(ROADMAP_ITEM_TITLES as unknown as string[], numItems);
      const STATUSES  = ["PLANNED", "PLANNED", "PLANNED", "IN_PROGRESS", "IN_PROGRESS", "COMPLETED"] as const;

      for (let idx = 0; idx < itemTitles.length; idx++) {
        const status    = pick(STATUSES);
        const itemCreatedAt = randomDate(150, 0);
        const eta       = status !== "COMPLETED" ? new Date(Date.now() + rng(7, 120) * 86_400_000) : null;

        await db.roadmapItem.create({
          data: {
            id:          cuid(),
            roadmapId:   roadmap.id,
            title:       itemTitles[idx],
            description: `We're planning to ${itemTitles[idx].toLowerCase()}. This will improve the experience for all users.`,
            status,
            sortOrder:   idx,
            eta,
            createdAt:   itemCreatedAt,
            updatedAt:   itemCreatedAt,
          },
        });
        itemCount++;
      }
    }
  }

  success(`Created ${roadmapCount} roadmaps · ${itemCount} roadmap items`);
}

async function seedChangelogs(workspaces: { id: string; plan: string; createdAt: Date }[]) {
  log("Creating changelogs…");

  const eligible = workspaces.filter((w) => w.plan === "PRO" || w.plan === "GROWTH");
  let total = 0;

  for (const ws of eligible) {
    const numChangelogs = rng(1, 5);

    for (let c = 0; c < numChangelogs; c++) {
      const title       = pick(CHANGELOG_TITLES);
      const publishedAt = Math.random() > 0.2
        ? randomDate(200, 0)
        : null;  // null = draft

      const version = Math.random() > 0.4
        ? `v${rng(1, 4)}.${rng(0, 9)}.${rng(0, 9)}`
        : null;

      const createdAt = randomDate(200, 0);

      try {
        await db.changelog.create({
          data: {
            id:          cuid(),
            workspaceId: ws.id,
            title,
            version,
            body:        `## What's new\n\n${title}.\n\nWe've been working hard on this update and are excited to share it with you.\n\n### Key improvements\n\n- Improved performance across all pages\n- Fixed several bugs reported by users\n- New UI for key workflows\n\nAs always, thank you for your feedback. Keep it coming!`,
            publishedAt,
            createdAt,
            updatedAt:   createdAt,
          },
        });
        total++;
      } catch { /* skip */ }
    }
  }

  success(`Created ${total} changelogs`);
}

async function seedPayments(users: { id: string; plan: "FREE" | "PRO" | "GROWTH"; createdAt: Date }[]) {
  log("Creating payments…");

  const PLAN_AMOUNTS: Record<string, Record<string, number>> = {
    PRO:    { MONTHLY: 19,  YEARLY: 156 },
    GROWTH: { MONTHLY: 49,  YEARLY: 468 },
  };

  const paidUsers = users.filter((u) => u.plan === "PRO" || u.plan === "GROWTH");
  let count = 0;

  for (const user of paidUsers) {
    const planType = user.plan as "PRO" | "GROWTH";
    const planMode = Math.random() > 0.35 ? "MONTHLY" : "YEARLY";
    const amount   = PLAN_AMOUNTS[planType][planMode];
    const createdAt= randomDate(180, 0);

    try {
      await db.payment.create({
        data: {
          id:             uuid(),
          userId:         user.id,
          amount,
          transactionId:  `txn_${cuid()}`,
          stripeEventId:  `evt_${cuid()}`,
          status:         Math.random() > 0.05 ? "PAID" : "UNPAID",
          planMode:       planMode as "MONTHLY" | "YEARLY",
          planType:       planType,
          paymentGatewayData: {
            stripeCustomerId:     `cus_${Math.random().toString(36).slice(2, 14)}`,
            stripeSubscriptionId: `sub_${Math.random().toString(36).slice(2, 14)}`,
            stripePriceId:        planMode === "MONTHLY" ? `price_${planType.toLowerCase()}_mo` : `price_${planType.toLowerCase()}_yr`,
          },
          createdAt,
          updatedAt: createdAt,
        },
      });
      count++;
    } catch { /* user already has payment */ }
  }

  success(`Created ${count} payment records`);
}

/* ─────────────────────────────────────────────────────────────────
   MAIN
   ──────────────────────────────────────────────────────────────── */

async function main() {
  console.log("\n\x1b[1m\x1b[35m═══════════════════════════════════════════\x1b[0m");
  console.log("\x1b[1m\x1b[35m   LaunchForge — Database Seed\x1b[0m");
  console.log("\x1b[1m\x1b[35m═══════════════════════════════════════════\x1b[0m\n");

  const startTime = Date.now();

  // ── Step 1: Users
  // ── Cleanup: delete children before parents
  log("Clearing existing data…");
  await db.comment.deleteMany({});
  await db.vote.deleteMany({});
  await db.featureRequest.deleteMany({});
  await db.feedbackBoard.deleteMany({});
  await db.roadmapItem.deleteMany({});
  await db.roadmap.deleteMany({});
  await db.changelog.deleteMany({});
  await db.subscriber.deleteMany({});
  await db.waitlist.deleteMany({});
  await db.workspaceMember.deleteMany({});
  await db.workspace.deleteMany({});
  await db.payment.deleteMany({});
  await db.session.deleteMany({});
  await db.account.deleteMany({});
  await db.user.deleteMany({});
  success("Cleared existing data");

  // ── Step 1: Users
  const users = await seedUsers(100);

  // ── Step 2: Accounts + Sessions
  await seedAccountsAndSessions(users);

  // ── Step 3: Workspaces
  const workspaces = await seedWorkspaces(users);

  // ── Step 4: Waitlists
  const waitlists = await seedWaitlists(workspaces);

  // ── Step 5: Subscribers (biggest step)
  const totalSubs = await seedSubscribers(waitlists);

  // ── Step 6: Feedback
  await seedFeedback(workspaces);

  // ── Step 7: Roadmaps
  await seedRoadmaps(workspaces);

  // ── Step 8: Changelogs
  await seedChangelogs(workspaces);

  // ── Step 9: Payments
  await seedPayments(users);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("\n\x1b[1m\x1b[32m═══════════════════════════════════════════\x1b[0m");
  console.log(`\x1b[1m\x1b[32m   ✓ Seed complete in ${elapsed}s\x1b[0m`);
  console.log("\x1b[1m\x1b[32m═══════════════════════════════════════════\x1b[0m\n");

  console.log("  Summary:");
  console.log(`  • 100 users (all roles, statuses, and plan distributions)`);
  console.log(`  • 100 accounts (credential provider) + ~60 active sessions`);
  console.log(`  • 100 workspaces with members for paid plans`);
  console.log(`  • ~${waitlists.length} waitlists across all workspaces`);
  console.log(`  • ~${totalSubs.toLocaleString()} subscribers with referral chains`);
  console.log(`  • Feedback boards, feature requests, votes & comments`);
  console.log(`  • Roadmaps with PLANNED / IN_PROGRESS / COMPLETED items`);
  console.log(`  • Published + draft changelogs`);
  console.log(`  • Payment records for all PRO and GROWTH users\n`);

  console.log("  Default password for all users: \x1b[33mPassword@123\x1b[0m");
  console.log("  (stored as bcrypt hash — swap in production)\n");
}

main()
  .catch((e) => {
    console.error("\n\x1b[31m[seed] Fatal error:\x1b[0m", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });