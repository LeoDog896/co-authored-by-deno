# co-authored-by-deno

deno deploy function for [co-authored-by](https://github.com/LeoDog896/co-authored-by).

The API is deployed on [`https://co-authored-by.deno.dev`](https://co-authored-by.deno.dev). Usage:

```bash
curl https://co-authored-by.deno.dev/username
```

for example:

```bash
curl https://co-authored-by.deno.dev/LeoDog896 # returns "Co-authored-by: Tristan F. <LeoDog896@hotmail.com>"
```

## how does the API grab emails?

It does it in 4 steps, with fallback to the next step if the previous one fails.

1. Find a main email address (are there any social media accounts attached? Are
   one of these mail?
2. Find an email address from the latest commit (if this is a non-shadow email,
   use it).
3. Use the modern shadow email (with an id, in a format
   `id+user@users.noreply.github.com`).
4. Generate a legacy shadow email (without an id).

## API Signature

`/` - `400`, Bad Request, no username was provided (message can vary)

`/<username>` - `200`, returns the exact [Co-authored-by](https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/creating-a-commit-with-multiple-authors) footer format as one line.

> **Note**
> If the username does not exist OR the username is an organization, a `404` code will be returned instead.
