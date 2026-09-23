/**
 * Creates a timestamped dump of the production Supabase database.
 *
 * Run via `pnpm db:backup` (uses `tsx --env-file=.env.local`, so this only
 * ever needs DATABASE_BACKUP_URL from your local `.env.local` — never commit
 * that file, and this script never prints it). Uses the Session Pooler
 * connection string, not the direct one: the direct host is IPv6-only and
 * unreachable from IPv4-only networks, while the session pooler works with
 * plain pg_dump over IPv4.
 *
 * Read-only: shells out to the local pg_dump / pg_dumpall binaries. Nothing
 * here connects with write intent, runs migrations, or resets anything.
 * Produces three plain-SQL files (roles, schema, data) in
 * backups/<timestamp>/ — gitignored, never uploaded anywhere by this script.
 *
 * Uses PostgreSQL 17 client binaries explicitly (via `postgresql@17`,
 * installed alongside the system's default `postgresql@15`): the Supabase
 * project runs Postgres 17, and pg_dumpall refuses to run against a server
 * more than one major version ahead of the client.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

function resolvePg17BinDir(): string {
  const candidates = [
    "/usr/local/opt/postgresql@17/bin",
    "/opt/homebrew/opt/postgresql@17/bin",
  ];
  try {
    const brewPrefix = execFileSync("brew", ["--prefix", "postgresql@17"], {
      encoding: "utf8",
    }).trim();
    if (brewPrefix) candidates.unshift(join(brewPrefix, "bin"));
  } catch {
    // brew not on PATH — fall back to the hardcoded candidates above.
  }
  const found = candidates.find((dir) => existsSync(join(dir, "pg_dump")));
  if (!found) {
    console.error(
      "Could not find PostgreSQL 17 client tools. Install with: brew install postgresql@17",
    );
    process.exit(1);
  }
  return found;
}

function assertVersion17(binPath: string) {
  const output = execFileSync(binPath, ["--version"], { encoding: "utf8" });
  if (!/\)\s*17\./.test(output)) {
    console.error(`Expected PostgreSQL 17.x from ${binPath}, got: ${output.trim()}`);
    process.exit(1);
  }
}

const pg17BinDir = resolvePg17BinDir();
const pgDump = join(pg17BinDir, "pg_dump");
const pgDumpAll = join(pg17BinDir, "pg_dumpall");
assertVersion17(pgDump);
assertVersion17(pgDumpAll);

const DATABASE_BACKUP_URL = process.env.DATABASE_BACKUP_URL;

if (!DATABASE_BACKUP_URL) {
  console.error("Missing DATABASE_BACKUP_URL in .env.local — cannot run backup.");
  console.error(
    "Add the Supabase Session Pooler connection string (dashboard 'Connect' button > Session pooler) as DATABASE_BACKUP_URL.",
  );
  process.exit(1);
}

// Defensive: strip any embedded credentials before anything ever hits the console.
function redact(text: string) {
  return text.replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "postgres://[redacted]");
}

function timestamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

const backupDir = join(process.cwd(), "backups", timestamp());
mkdirSync(backupDir, { recursive: true });

type DumpJob = { file: string; bin: string; args: string[] };

const jobs: DumpJob[] = [
  {
    file: "roles.sql",
    bin: pgDumpAll,
    args: ["--roles-only", "--no-role-passwords", "-d", DATABASE_BACKUP_URL],
  },
  {
    file: "schema.sql",
    bin: pgDump,
    args: ["--schema-only", DATABASE_BACKUP_URL],
  },
  {
    file: "data.sql",
    bin: pgDump,
    args: ["--data-only", DATABASE_BACKUP_URL],
  },
];

console.log("Creating production database backup...");

for (const job of jobs) {
  const outPath = join(backupDir, job.file);
  try {
    execFileSync(job.bin, ["-f", outPath, ...job.args], {
      stdio: ["ignore", "ignore", "pipe"],
    });
  } catch (err) {
    const stderr =
      err instanceof Error && "stderr" in err
        ? String((err as { stderr?: Buffer | string }).stderr ?? "")
        : "";
    console.error(`Backup failed while dumping ${job.file}.`);
    if (stderr.trim()) console.error(redact(stderr.trim()));
    process.exit(1);
  }
}

const missingOrEmpty = jobs
  .map((job) => join(backupDir, job.file))
  .filter((path) => !existsSync(path) || statSync(path).size === 0);

if (missingOrEmpty.length > 0) {
  console.error("Backup failed — these files are missing or empty:");
  for (const path of missingOrEmpty) console.error(`  ${path}`);
  process.exit(1);
}

console.log("\nBackup completed successfully.\n");
console.log("Backup:");
console.log(`backups/${backupDir.split("/").pop()}/`);
