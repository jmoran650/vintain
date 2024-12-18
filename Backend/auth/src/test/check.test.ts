import { request, gql } from 'graphql-request';

const endpoint = process.env.AUTH_ENDPOINT || 'http://localhost:4001/graphql';

interface LoginForCheckResponse {
  login: {
    id: string;
    accessToken: string;
  };
}

interface CheckResponse {
  check: {
    id: string;
  };
}

describe('AuthService check', () => {
  let accessToken: string;
  beforeAll(async () => {
    const loginQuery = gql`
      query Login($input: Credentials!) {
        login(input: $input) {
          id
          accessToken
        }
      }
    `;

    const variables = { input: { email: "test@example.com", password: "password" } };
    const response = await request<LoginForCheckResponse>(endpoint, loginQuery, variables);
    accessToken = response.login.accessToken;
  });

  it('should return an account id with a valid token', async () => {
    const checkQuery = gql`
      query Check($input: String!) {
        check(input: $input) {
          id
        }
      }
    `;

    const checkVars = { input: accessToken };
    const checkResponse = await request<CheckResponse>(endpoint, checkQuery, checkVars);
    expect(checkResponse.check.id).toBeTruthy();
  });
});