import { request, gql } from 'graphql-request';

const endpoint = process.env.AUTH_ENDPOINT || 'http://localhost:4001/graphql';

interface LoginResponse {
  login: {
    id: string;
    name: {
      first: string;
      last: string;
    };
    accessToken: string;
  };
}

describe('AuthService login', () => {
  it('should login with valid credentials', async () => {
    const query = gql`
      query Login($input: Credentials!) {
        login(input: $input) {
          id
          name {
            first
            last
          }
          accessToken
        }
      }
    `;

    const variables = {
      input: {
        email: "test@example.com",
        password: "password"
      }
    };

    const response = await request<LoginResponse>(endpoint, query, variables);
    expect(response.login).toBeDefined();
    expect(response.login.id).toBeTruthy();
    expect(response.login.name.first).toBe("John"); // Based on seeded data
    expect(response.login.name.last).toBe("Doe");
    expect(response.login.accessToken).toBeTruthy();
  });

  it('should return an error for invalid credentials', async () => {
    const query = gql`
      query Login($input: Credentials!) {
        login(input: $input) {
          id
          name {
            first
            last
          }
          accessToken
        }
      }
    `;

    const variables = {
      input: {
        email: "wrong@example.com",
        password: "wrongpass"
      }
    };

    await expect(request<LoginResponse>(endpoint, query, variables)).rejects.toThrow('Invalid Credentials');
  });
});