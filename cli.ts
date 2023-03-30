// the cli module enables local testing of the email fetching logic
import "https://deno.land/std@0.181.0/dotenv/load.ts";
import { getEmail } from "./lib.ts";

const login = Deno.args[0];

if (!login) {
  console.error("Please provide a GitHub login");
  Deno.exit(1);
}

const token = Deno.env.get("PERSONAL_ACCESS_TOKEN");

if (!token) {
  console.error("Please provide a GitHub personal access token");
  Deno.exit(1);
}

const data = await getEmail(login, token);

console.log(`Co-authored-by: ${data.preferredName} <${data.email}>`);
