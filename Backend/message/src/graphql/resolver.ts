import { Query, Resolver, Ctx, Mutation, Arg } from 'type-graphql';
import { Request } from 'express';
import { MessageService } from './service';
import { Message, NewMessage, UUID } from './schema';

@Resolver()
export class MessageResolver {
  @Query(() => Message)
  async message(@Ctx() _req: Request, @Arg('input') id: UUID): Promise<Message> {
    const result = await new MessageService().getMessage(id);
    return result;
  }

  @Query(() => [Message])
  async messagesByItemOwner(@Ctx() _req: Request, @Arg('input') itemOwnerId: UUID): Promise<Message[]> {
    const result = await new MessageService().getMessagesByItemOwner(itemOwnerId);
    return result;
  }

  @Query(() => [Message])
  async messagesBySender(@Ctx() _req: Request, @Arg('input') senderId: UUID): Promise<Message[]> {
    const result = await new MessageService().getMessagesBySender(senderId);
    return result;
  }

  @Mutation(() => Message)
  async createMessage(@Arg('input') messageInfo: NewMessage, @Ctx() _req: Request): Promise<Message> {
    const result = await new MessageService().createMessage(messageInfo);
    return result;
  }

  @Mutation(() => Boolean)
  async deleteMessage(@Arg('input') messageId: UUID, @Ctx() _req: Request): Promise<boolean> {
    const result = await new MessageService().deleteMessage(messageId);
    return result;
  }
}