// Backend/src/s3/graphql/schema.ts
import { ObjectType, Field, InputType } from "type-graphql";

@ObjectType()
export class S3UploadUrl {
  @Field()
  preSignedUrl!: string;

  @Field()
  fileUrl!: string;
}