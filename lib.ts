import { GraphQLClient, gql } from "https://esm.sh/graphql-request@5.2.0"

const query = gql`query GetEmail($login: String!) {
  user(login: $login) {
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
                      message
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
}`

export async function getEmail(login: string, token: string) {
  const graphQLClient = new GraphQLClient("https://api.github.com/graphql", {
    headers: {
      Authorization: `bearer ${token}`,
    },
  })
  
  return await graphQLClient.request(query, {
    login,
  })
}