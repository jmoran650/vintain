// src/message/graphql/resolver.ts

import { Authorized, Query, Resolver, Ctx, Mutation, Arg } from "type-graphql";
import { Request } from "express";
import { MessageService } from "./service";
import { Message, NewMessage, UUID } from "./schema";

@Resolver()
export class MessageResolver {
  @Authorized()
  @Query(() => Message)
  async message(
    @Ctx() _req: Request,
    @Arg("input") id: UUID
  ): Promise<Message> {
    return new MessageService().getMessage(id);
  }

  @Authorized()
  @Query(() => [Message])
  async messagesByItemOwner(
    @Ctx() _req: Request,
    @Arg("input") itemOwnerId: UUID
  ): Promise<Message[]> {
    return new MessageService().getMessagesByItemOwner(itemOwnerId);
  }

  @Authorized()
  @Query(() => [Message])
  async messagesBySender(
    @Ctx() _req: Request,
    @Arg("input") senderId: UUID
  ): Promise<Message[]> {
    return new MessageService().getMessagesBySender(senderId);
  }

  @Authorized()
  @Mutation(() => Message)
  async createMessage(
    @Arg("input") messageInfo: NewMessage,
    @Ctx() _req: Request
  ): Promise<Message> {
    return new MessageService().createMessage(messageInfo);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteMessage(
    @Arg("input") messageId: UUID,
    @Ctx() _req: Request
  ): Promise<boolean> {
    return new MessageService().deleteMessage(messageId);
  }
}