import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import "https://deno.land/std@0.182.0/dotenv/load.ts";
import { getCoAuthoredBy } from "./lib.ts";

const PERSONAL_ACCESS_TOKEN = Deno.env.get("PERSONAL_ACCESS_TOKEN");

if (!PERSONAL_ACCESS_TOKEN) {
  throw new Error("Please provide a GitHub personal access token");
}

const cache: { [key: string]: [number, string | undefined] } = {};

const cacheDuration = 60 * 60 * 1000; // 1 hour

serve(async (request) => {
  // get the login from the request (http://localhost:8000/torvalds)
  const login = request.url.split("/")[3];

  if (!login) {
    return new Response("Please provide a GitHub login", {
      status: 400,
      headers: { "content-type": "text/plain" },
    });
  }

  if (cache[login]) {
    const [timestamp, data] = cache[login];

    if (data === undefined) {
      return new Response("Not found", {
        status: 404,
        headers: { "content-type": "text/plain" },
      });
    }

    if (timestamp + cacheDuration > Date.now()) {
      return new Response(data, {
        headers: { "content-type": "text/plain" },
      });
    }
  }

  const coAuthoredBy = await getCoAuthoredBy(login, PERSONAL_ACCESS_TOKEN);

  if (!coAuthoredBy) {
    cache[login] = [Date.now(), undefined];

    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain" },
    });
  }
  
  cache[login] = [Date.now(), coAuthoredBy];

  return new Response(coAuthoredBy, {
    headers: { "content-type": "text/plain" },
  });
});
