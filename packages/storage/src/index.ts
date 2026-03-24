import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface StorageService {
  createUploadUrl(input: {
    key: string;
    contentType: string;
    expiresIn?: number;
  }): Promise<{ uploadUrl: string; key: string }>;
  getPublicUrl(key: string): string;
}

export function createR2StorageService(input: {
  accountId: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
}): StorageService {
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${input.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: input.accessKeyId,
      secretAccessKey: input.secretAccessKey
    }
  });

  return {
    async createUploadUrl({ key, contentType, expiresIn = 300 }) {
      const command = new PutObjectCommand({
        Bucket: input.bucket,
        Key: key,
        ContentType: contentType
      });
      const uploadUrl = await getSignedUrl(client, command, { expiresIn });
      return { uploadUrl, key };
    },
    getPublicUrl(key: string) {
      return `${input.publicBaseUrl.replace(/\/$/, "")}/${key}`;
    }
  };
}
