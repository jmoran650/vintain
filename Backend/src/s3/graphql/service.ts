// src/s3/graphql/service.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize the S3 client.
// The client will pick up AWS credentials and region from environment variables.
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  // Optionally, you can specify credentials explicitly:
  // credentials: {
  //   accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  // },
});

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 60
): Promise<string> {
  // Create a command for putting an object into S3.
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ContentType: contentType,
  });

  console.log(
    "[s3service] Generating pre-signed URL for key:",
    key,
    "with content type:",
    contentType
  );

  try {
    // Generate the pre-signed URL using the v3 getSignedUrl utility.
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    console.log("[s3service] Pre-signed URL generated successfully:", url);
    return url;
  } catch (error) {
    console.error("[s3service] Error generating pre-signed URL:", error);
    throw error;
  }
}