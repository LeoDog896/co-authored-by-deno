import { gql, GraphQLClient } from "https://esm.sh/graphql-request@5.2.0";
import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";

const query = gql`query GetEmail($login: String!) {
  user(login: $login) {
    login
    name
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
                      messageHeadline
                      url
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
    name: z.string().optional(),
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
                        messageHeadline: z.string(),
                        url: z.string(),
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
  commit: {
    messageHeadline: string;
    url: string;
  };
}

export async function getEmail(
  login: string,
  token: string,
): Promise<UserData> {
  const graphQLClient = new GraphQLClient("https://api.github.com/graphql", {
    headers: {
      Authorization: `bearer ${token}`,
    },
  });

  const data = schema.parse(
    await graphQLClient.request(query, {
      login,
    }),
  );

  const commit =
    data.user.repositories.edges[0].node.defaultBranchRef.target.history
      .edges[0].node;

  return {
    login: data.user.login,
    email: commit.author.email,
    preferredName: data.user.name || data.user.login,
    commit,
  };
}
