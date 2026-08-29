import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRef =
  process.env.SUPABASE_PROJECT_REF ?? "eupjgmmqykamkvvalara";
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!accessToken) {
  console.error(
    "Missing SUPABASE_ACCESS_TOKEN.\n" +
      "Create one at https://supabase.com/dashboard/account/tokens\n" +
      "Then run:\n" +
      "  SUPABASE_ACCESS_TOKEN=sbp_... npm run sync:email-template"
  );
  process.exit(1);
}

const templatePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "supabase",
  "email-templates",
  "confirm-signup.html"
);

const content = readFileSync(templatePath, "utf8");

const response = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/config/auth`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mailer_subjects_confirmation: "Confirm your Assignment Planner signup",
      mailer_templates_confirmation_content: content,
    }),
  }
);

const body = await response.text();

if (!response.ok) {
  console.error(`Failed to update template (${response.status}):\n${body}`);
  process.exit(1);
}

console.log("Confirm signup email template synced to Supabase.");
console.log("Sign up with a new email address to verify the sent email.");
