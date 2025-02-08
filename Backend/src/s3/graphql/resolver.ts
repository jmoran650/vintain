// Backend/src/s3/graphql/resolver.ts
import { Service } from "typedi";
import { Resolver, Mutation, Arg } from "type-graphql";
import { S3UploadUrl } from "./schema";
import { getPresignedUploadUrl } from "./service";

@Service()
@Resolver()
export class S3Resolver {
  @Mutation(() => S3UploadUrl)
  async generateUploadUrl(
    @Arg("fileName") fileName: string,
    @Arg("contentType") contentType: string,
    @Arg("folder") folder: string
  ): Promise<S3UploadUrl> {
    // Validate and sanitize inputs
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');

    const allowedFolders = ['profile', 'listing'];
    if (!allowedFolders.includes(folder)) {
      throw new Error("Invalid folder specified");
    }

    const allowedContentTypes = ['image/jpeg', 'image/png'];
    if (!allowedContentTypes.includes(contentType)) {
      throw new Error("Unsupported content type");
    }

    // Generate a unique key using folder, timestamp, and safeFileName
    const key = `${folder}/${Date.now()}_${safeFileName}`;

    console.log(`[S3Resolver] Generating upload URL for folder: ${folder}, file: ${safeFileName}`);

    try {
      const preSignedUrl = await getPresignedUploadUrl(key, contentType);

      // Use CloudFront domain instead of S3 endpoint
      const cloudFrontDomain =
        process.env.AWS_CLOUDFRONT_DOMAIN ||
        `${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;
      const fileUrl = `https://${cloudFrontDomain}/${key}`;

      console.log(`[S3Resolver] Upload URL generated successfully.`);
      return { preSignedUrl, fileUrl };
    } catch (error) {
      console.error("[S3Resolver] Error generating upload URL:", error);
      throw error;
    }
  }
}