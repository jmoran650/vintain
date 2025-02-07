// src/s3/graphql/s3service.ts
import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  region: process.env.AWS_REGION!,
});

const s3 = new AWS.S3();

export async function getPresignedUploadUrl(key: string, contentType: string, expiresIn = 60): Promise<string> {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Expires: expiresIn,
    ContentType: contentType,
  };

  console.log("[s3service] Generating pre-signed URL with params:", params);

  try {
    const url = await s3.getSignedUrlPromise('putObject', params);
    console.log("[s3service] Pre-signed URL generated successfully:", url);
    return url;
  } catch (error) {
    console.error("[s3service] Error generating pre-signed URL:", error);
    throw error;
  }
}