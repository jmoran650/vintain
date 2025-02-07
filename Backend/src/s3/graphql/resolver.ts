// src/s3/graphql/resolver.ts
import { Service } from "typedi";
import { Resolver, Mutation, Arg } from "type-graphql";
import { S3UploadUrl } from "./schema";
import { getPresignedUploadUrl } from "./service";

@Service()
@Resolver()
export class S3Resolver {
  /**
   * Generate a pre-signed URL for uploading an image.
   * @param fileName - original filename (used as a base)
   * @param contentType - the MIME type of the file (e.g. image/jpeg)
   * @param folder - a folder string to separate profile images and listing images (e.g. "profile" or "listing")
   */
  @Mutation(() => S3UploadUrl)
  async generateUploadUrl(
    @Arg("fileName") fileName: string,
    @Arg("contentType") contentType: string,
    @Arg("folder") folder: string
  ): Promise<S3UploadUrl> {
    // Generate a unique key – here we prefix the filename with folder and a timestamp.
    const key = `${folder}/${Date.now()}_${fileName}`;
    console.log("[S3Resolver] Request received to generate upload URL for key:", key, "with content type:", contentType);

    try {
      const preSignedUrl = await getPresignedUploadUrl(key, contentType);
      const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      console.log("[S3Resolver] Pre-signed URL generated successfully:", preSignedUrl);
      console.log("[S3Resolver] File URL will be:", fileUrl);
      return { preSignedUrl, fileUrl };
    } catch (error) {
      console.error("[S3Resolver] Error generating upload URL:", error);
      throw error;
    }
  }
}