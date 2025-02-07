// src/hooks/useApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import {
  signUp,
  signIn,
  fetchAllListings,
  searchListings,
  fetchListingById,
  fetchMyProfile,
  updateProfile,
  createListing,
  generateUploadUrl,
} from '../src/apiService';

/**
 * Query hook for fetching all listings with pagination.
 */
export function useAllListings(page: number = 1, pageSize: number = 10) {
  const options: UseQueryOptions<any, Error, any, (string | number)[]> = {
    queryKey: ['allListings', page, pageSize],
    queryFn: () => fetchAllListings(page, pageSize),
  };
  return useQuery(options);
}

/**
 * Query hook for searching listings by a search term.
 */
export function useSearchListings(searchTerm: string, page: number = 1, pageSize: number = 10) {
  const options: UseQueryOptions<any, Error, any, (string | number)[]> = {
    queryKey: ['searchListings', searchTerm, page, pageSize],
    queryFn: () => searchListings(searchTerm, page, pageSize),
    enabled: searchTerm.trim().length > 0, // only run if search term is non-empty
    
  };
  return useQuery(options);
}

/**
 * Query hook for fetching a single listing by ID.
 */
export function useListing(listingId: string) {
  return useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => fetchListingById(listingId),
    enabled: !!listingId, // only run if a listingId is provided
  });
}

/**
 * Query hook for fetching the authenticated user's profile.
 */
export function useMyProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchMyProfile(userId),
    enabled: !!userId,
  });
}

/**
 * Mutation hook for updating a user's profile.
 * Invalidates the profile query so that it gets refetched on success.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; username?: string; bio?: string; profilePicture?: string }) =>
      updateProfile(data.id, data.username, data.bio, data.profilePicture),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile', variables.id] });
    },
  });
}

/**
 * Mutation hook for creating a new listing.
 * Invalidates the listings query so that new data is refetched.
 */
export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newListing: {
      ownerId: string;
      brand: string;
      name: string;
      description: string;
      imageUrls: string[];
    }) =>
      createListing(
        newListing.ownerId,
        newListing.brand,
        newListing.name,
        newListing.description,
        newListing.imageUrls
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allListings'] });
    },
  });
}

/**
 * Mutation hook for signing in.
 */
export function useSignIn() {
  return useMutation({
    mutationFn: (creds: { email: string; password: string }) => signIn(creds.email, creds.password),
  });
}

/**
 * Mutation hook for signing up.
 */
export function useSignUp() {
  return useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      roles: string[];
      username: string;
    }) => signUp(data.email, data.password, data.firstName, data.lastName, data.roles, data.username),
  });
}

/**
 * Mutation hook for generating a pre-signed upload URL.
 */
export function useGenerateUploadUrl() {
  return useMutation({
    mutationFn: (params: { fileName: string; contentType: string; folder: string }) =>
      generateUploadUrl(params.fileName, params.contentType, params.folder),
  });
}