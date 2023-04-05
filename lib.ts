import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";

const query = `query GetEmail($login: String!) {
  user(login: $login) {
    login
    name
    databaseId
    repositories(
      first: 1
      isFork: false
      orderBy: {field: CREATED_AT, direction: DESC}
    ) {
      edges {
        node {
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 1) {
                  edges {
                    node {
                      author {
                        email
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

const schema = z.object({
  user: z.object({
    login: z.string(),
    name: z.string().nullable(),
    databaseId: z.number(),
    repositories: z.object({
      edges: z.array(
        z.object({
          node: z.object({
            defaultBranchRef: z.object({
              target: z.object({
                history: z.object({
                  edges: z.array(
                    z.object({
                      node: z.object({
                        author: z.object({
                          email: z.string(),
                        }),
                      }),
                    }),
                  ),
                }),
              }),
            }),
          }),
        }),
      ),
    }),
  }),
});

interface UserData {
  email: string;
  preferredName: string;
  login: string;
}

export async function getEmail(
  login: string,
  token: string,
): Promise<UserData | null> {
  const request = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify({
      query,
      variables: {
        login,
      },
    })
  }).then((res) => res.json()).then((res) => res.data);

  const data = schema.parse(
    request,
  );

  const hasCommit = data.user.repositories.edges.length > 0;

  const commit = hasCommit
    ? data.user.repositories.edges[0].node.defaultBranchRef.target.history
      .edges[0].node
    : null;

  return {
    login: data.user.login,
    email: commit?.author.email ||
      `${data.user.databaseId}+${data.user.login}@users.noreply.github.com`,
    preferredName: data.user.name || data.user.login,
  };
}

export async function getCoAuthoredBy(
  login: string,
  token: string,
): Promise<string | null> {
  const data = await getEmail(login, token);
  if (!data) {
    return null;
  }
  return `Co-authored-by: ${data.preferredName} <${data.email}>`;
}
