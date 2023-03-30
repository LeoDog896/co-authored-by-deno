// the cli module enables local testing of the email fetching logic

import { getEmail } from "./lib.ts";

const login = Deno.args[0];

if (!login) {
    console.error("Please provide a GitHub login");
    Deno.exit(1);
}

console.log(await getEmail(login));
