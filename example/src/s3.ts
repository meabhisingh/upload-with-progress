import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  endpoint: "http://localhost:9000",
  region: "us-east-1",
  credentials: {
    accessKeyId: "minioadmin",
    secretAccessKey: "minioadmin",
  },
  forcePathStyle: true,
});

export async function generatePresignedUrlForPut(
  bucketName: string,
  fileName: string,
  fileType: string,
  expiresIn: number = 600
) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    ContentType: fileType,
  });

  try {
    const presignedUrl = await getSignedUrl(s3, command, {
      expiresIn,
    }); // URL expires in 10 minutes
    return presignedUrl;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw error;
  }
}
