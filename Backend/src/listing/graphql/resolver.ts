//Backend/src/listing/graphql/resolver.ts
import { Query, Resolver, Mutation, Arg, Int, Ctx } from "type-graphql";
import { Request } from "express";
import { ListingService } from "./service";
import { Listing, NewListing, UUID, PaginatedListings } from "./schema";

@Resolver()
export class ListingResolver {
  /**
   * Get a single listing by ID.
   */
  @Query(() => Listing)
  async listing(@Ctx() _req: Request, @Arg("id") id: UUID): Promise<Listing> {
    return new ListingService().getListing(id);
  }

  /**
   * Get paginated listings.
   */
  @Query(() => PaginatedListings)
  async allListings(
    @Ctx() _req: Request,
    @Arg("page", () => Int, { defaultValue: 1 }) page: number,
    @Arg("pageSize", () => Int, { defaultValue: 10 }) pageSize: number
  ): Promise<PaginatedListings> {
    return new ListingService().getAllListings(page, pageSize);
  }

  /**
   * Create a new listing.
   */
  @Mutation(() => Listing)
  async createListing(
    @Arg("input") listingInfo: NewListing,
    @Ctx() _req: Request
  ): Promise<Listing> {
    return new ListingService().createListing(listingInfo);
  }

  /**
   * Delete a listing by ID.
   */
  @Mutation(() => Boolean)
  async deleteListing(
    @Arg("id") listingId: UUID,
    @Ctx() _req: Request
  ): Promise<boolean> {
    return new ListingService().deleteListing(listingId);
  }

  @Query(() => PaginatedListings)
  async searchListings(
    @Arg("searchTerm") searchTerm: string,
    @Arg("page", () => Int, { defaultValue: 1 }) page: number,
    @Arg("pageSize", () => Int, { defaultValue: 10 }) pageSize: number
  ): Promise<PaginatedListings> {
    const { listings, totalCount } = await new ListingService().searchListings(
      searchTerm,
      page,
      pageSize
    );
    return { listings, totalCount };
  }
}
