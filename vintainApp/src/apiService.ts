// vintainApp/src/apiService.ts
const BASE_URL = "http://localhost:4000/graphql";

// A module-level variable to store the token:
let authToken: string | null = null;

// A function to update the token (you can call this from your AuthContext when a user signs in)
export function setAuthToken(token: string | null) {
  authToken = token;
}

async function graphQLFetch(query: string, variables: any = {}) {
  // Build headers, including Authorization if authToken exists.
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
  };

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    console.log(json.errors[0].message);
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
  username: string
) {
  try {
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
      },
    };
    const data = await graphQLFetch(query, variables);
    return data.makeAccount;
  } catch (error) {
    console.log(error);
  }
}

export async function signIn(email: string, password: string) {
  // Use a mutation for the login operation
  const query = `
    mutation($creds: Credentials!) {
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
          profilePicture
        }
      }
    }
  `;
  const variables = { id };
  const data = await graphQLFetch(query, variables);
  return data.account;
}

export async function updateProfile(
  id: string,
  username?: string,
  bio?: string,
  profilePicture?: string
) {
  const query = `
    mutation UpdateProfile($id: String!, $username: String, $bio: String, $profilePicture: String) {
      updateProfile(id: $id, username: $username, bio: $bio, profilePicture: $profilePicture)
    }
  `;
  const variables = { id, username, bio, profilePicture };
  const data = await graphQLFetch(query, variables);
  return data.updateProfile; // should return true/false
}

export async function createListing(
  ownerId: string,
  brand: string,
  name: string,
  description: string,
  imageUrls: string[]
) {
  const query = `
    mutation CreateListing($input: NewListing!) {
      createListing(input: $input) {
        id
        ownerId
        brand
        name
        description
        imageUrls
      }
    }
  `;
  const variables = {
    input: { ownerId, brand, name, description, imageUrls },
  };
  const data = await graphQLFetch(query, variables);
  return data.createListing;
}

export async function generateUploadUrl(
  fileName: string,
  contentType: string,
  folder: string
) {
  console.log("apiservicegenerateuploadurl: ", fileName, contentType, folder);
  const query = `
    mutation GenerateUploadUrl($fileName: String!, $contentType: String!, $folder: String!) {
      generateUploadUrl(fileName: $fileName, contentType: $contentType, folder: $folder) {
        preSignedUrl
        fileUrl
      }
    }
  `;
  const variables = { fileName, contentType, folder };
  const data = await graphQLFetch(query, variables);
  return data.generateUploadUrl;
}