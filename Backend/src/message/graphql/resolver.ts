// src/message/graphql/resolver.ts

import { Authorized, Query, Resolver, Ctx, Mutation, Arg } from "type-graphql";
import { Request } from "express";
import { MessageService } from "./service";
import { Message, NewMessage } from "./schema";
import { UUID } from "../../common/types";
import { Service } from "typedi";

@Service()
@Resolver()
export class MessageResolver {
  constructor(private readonly messageService: MessageService) {}

  @Authorized()
  @Query(() => Message)
  async message(
    @Ctx() _req: Request,
    @Arg("input") id: UUID
  ): Promise<Message> {
    return this.messageService.getMessage(id);
  }

  @Authorized()
  @Query(() => [Message])
  async messagesByItemOwner(
    @Ctx() _req: Request,
    @Arg("input") itemOwnerId: UUID
  ): Promise<Message[]> {
    return this.messageService.getMessagesByItemOwner(itemOwnerId);
  }

  @Authorized()
  @Query(() => [Message])
  async messagesBySender(
    @Ctx() _req: Request,
    @Arg("input") senderId: UUID
  ): Promise<Message[]> {
    return this.messageService.getMessagesBySender(senderId);
  }

  @Authorized()
  @Mutation(() => Message)
  async createMessage(
    @Arg("input") messageInfo: NewMessage,
    @Ctx() _req: Request
  ): Promise<Message> {
    return this.messageService.createMessage(messageInfo);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteMessage(
    @Arg("input") messageId: UUID,
    @Ctx() _req: Request
  ): Promise<boolean> {
    return this.messageService.deleteMessage(messageId);
  }
}