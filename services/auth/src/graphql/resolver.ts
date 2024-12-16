

@Resolver()
class authResolver{
  @Query(() => Authenticated)
  async login(
    @Ctx() req: Request,
    @Arg('input') creds: Credentials
  )
}