import { Query, Resolver, Ctx, Mutation, Arg } from 'type-graphql';
import { Request } from 'express';
import { ListingService } from './service';
import { Listing, NewListing, UUID } from './schema';

@Resolver()
export class ListingResolver {
  @Query((_returns) => Listing)
  async listing(@Ctx() _req: Request, @Arg('input') id: UUID): Promise<Listing> {
    const result = await new ListingService().getListing(id);
    return result;
  }

  @Query((_returns) => [Listing])
  async allListings(@Ctx() _req: Request): Promise<Listing[]> {
    const result = await new ListingService().getAllListings();
    return result;
  }

  @Mutation((_returns) => Listing)
  async createListing(@Arg('input') listingInfo: NewListing, @Ctx() _req: Request): Promise<Listing> {
    const result = await new ListingService().createListing(listingInfo);
    return result;
  }

  @Mutation((_returns) => Boolean)
  async deleteListing(@Arg('input') listingId: UUID, @Ctx() _req: Request): Promise<boolean> {
    const result = await new ListingService().deleteListing(listingId);
    return result;
  }
}