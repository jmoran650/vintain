// vintainApp/src/services/apiService.ts
const BASE_URL = "http://localhost:4000/graphql";
// If running Docker with port 4001, or on a real device, adjust accordingly

async function graphQLFetch(query: string, variables: any = {}) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors[0].message || "GraphQL Error");
  }
  return json.data;
}

export async function signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    roles: string[],
    username: string // new param
  ) {

    try{

    
    const query = `
      mutation($input: NewAccount!) {
        makeAccount(input: $input) {
          id
          email
        }
      }
    `;
    // Pass username in as well
    const variables = {
      input: {
        email,
        password,
        firstName,
        lastName,
        roles,
        username,  // required
        // we can omit bio if it's optional or add it if you want
      },
    };
    const data = await graphQLFetch(query, variables);
    return data.makeAccount;
    } catch(error) {
        console.log(error);
    }
  }

export async function signIn(email: string, password: string) {
  const query = `
    query($creds: Credentials!) {
      login(input: $creds) {
        id
        name { first last }
        accessToken
      }
    }
  `;
  const variables = { creds: { email, password } };
  const data = await graphQLFetch(query, variables);
  return data.login;
}

export async function fetchAllListings(page = 1, pageSize = 10) {
  const query = `
    query($page: Int!, $pageSize: Int!) {
      allListings(page: $page, pageSize: $pageSize) {
        listings { id brand name description imageUrls }
        totalCount
      }
    }
  `;
  const data = await graphQLFetch(query, { page, pageSize });
  return data.allListings;
}

export async function searchListings(searchTerm: string, page = 1, pageSize = 10) {
  const query = `
    query($searchTerm: String!, $page: Int!, $pageSize: Int!) {
      searchListings(searchTerm: $searchTerm, page: $page, pageSize: $pageSize) {
        listings { id brand name description imageUrls }
        totalCount
      }
    }
  `;
  const data = await graphQLFetch(query, { searchTerm, page, pageSize });
  return data.searchListings;
}

export async function fetchListingById(id: string) {
  const query = `
    query($id: String!) {
      listing(id: $id) {
        id
        brand
        name
        description
        imageUrls
      }
    }
  `;
  const data = await graphQLFetch(query, { id });
  return data.listing;
}

export async function fetchMyProfile(id: string) {
    const query = `
      query($id: String!) {
        account(input: $id) {
          id
          name {
            first
            last
          }
          profile {
            username
            bio
          }
        }
      }
    `;
    const variables = { id };
    const data = await graphQLFetch(query, variables);
    return data.account;
  }