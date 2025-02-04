// src/listing/graphql/resolver.ts

import { Authorized, Query, Resolver, Mutation, Arg, Int, Ctx } from "type-graphql";
import { Request } from "express";
import { ListingService } from "./service";
import { Listing, NewListing, PaginatedListings } from "./schema";
import { UUID } from "../../common/types";
import { Service } from "typedi";

@Service()
@Resolver()
export class ListingResolver {
  constructor(private readonly listingService: ListingService) {}

  @Authorized()
  @Query(() => Listing)
  async listing(
    @Ctx() _req: Request,
    @Arg("id") id: UUID
  ): Promise<Listing> {
    return this.listingService.getListing(id);
  }

  @Authorized()
  @Query(() => PaginatedListings)
  async allListings(
    @Ctx() _req: Request,
    @Arg("page", () => Int, { defaultValue: 1 }) page: number,
    @Arg("pageSize", () => Int, { defaultValue: 10 }) pageSize: number
  ): Promise<PaginatedListings> {
    return this.listingService.getAllListings(page, pageSize);
  }

  @Authorized()
  @Mutation(() => Listing)
  async createListing(
    @Arg("input") listingInfo: NewListing,
    @Ctx() _req: Request
  ): Promise<Listing> {
    return this.listingService.createListing(listingInfo);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteListing(
    @Arg("id") listingId: UUID,
    @Ctx() _req: Request
  ): Promise<boolean> {
    return this.listingService.deleteListing(listingId);
  }

  @Authorized()
  @Query(() => PaginatedListings)
  async searchListings(
    @Arg("searchTerm") searchTerm: string,
    @Arg("page", () => Int, { defaultValue: 1 }) page: number,
    @Arg("pageSize", () => Int, { defaultValue: 10 }) pageSize: number
  ): Promise<PaginatedListings> {
    const { listings, totalCount } = await this.listingService.searchListings(
      searchTerm,
      page,
      pageSize
    );
    return { listings, totalCount };
  }
}