# co-authored-by-deno

deno deploy function for co-authored-by.

## how does the API grab emails?

It does it in 4 steps, with fallback to the next step if the previous one fails.

1. Find a main email address (are there any social media accounts attached? Are one of these mail?
2. Find an email address from the latest commit (if this is a non-shadow email, use it).
3. Use the modern shadow email (with an id, in a format `id+user@users.noreply.github.com`).
4. Generate a legacy shadow email (without an id).