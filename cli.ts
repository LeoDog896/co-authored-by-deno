// the cli module enables local testing of the email fetching logic
import "https://deno.land/std@0.182.0/dotenv/load.ts";
import { getCoAuthoredBy } from "./lib.ts";

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

console.log(await getCoAuthoredBy(login, token));
