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
    // === Security Recommendation 3: Validate and Sanitize Inputs ===
    // Allow only alphanumeric, dot, dash, and underscore in fileName
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');
    
    // Restrict folder to allowed values (e.g., 'profile' or 'listing')
    const allowedFolders = ['profile', 'listing'];
    if (!allowedFolders.includes(folder)) {
      throw new Error("Invalid folder specified");
    }

    // Validate content type (allow only specific image types)
    const allowedContentTypes = ['image/jpeg', 'image/png'];
    if (!allowedContentTypes.includes(contentType)) {
      throw new Error("Unsupported content type");
    }

    // Generate a unique key – prefix the sanitized filename with folder and a timestamp.
    const key = `${folder}/${Date.now()}_${safeFileName}`;
    
    // Log minimal information (do not log full file names or keys)
    console.log(`[S3Resolver] Generating upload URL for folder: ${folder}, file: ${safeFileName}`);

    try {
      const preSignedUrl = await getPresignedUploadUrl(key, contentType);
      const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      console.log(`[S3Resolver] Upload URL generated successfully.`);
      return { preSignedUrl, fileUrl };
    } catch (error) {
      console.error("[S3Resolver] Error generating upload URL:", error);
      throw error;
    }
  }
}