import { Injectable } from '@angular/core';
import { BlobServiceClient } from "@azure/storage-blob";

@Injectable({
  providedIn: 'root'
})
export class ImageuploadService {

  constructor() { }
  async uploadFile(file: File, name: string): Promise<any> {
    const sasUrl = 'https://tgsfiles.blob.core.windows.net/?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-08-17T20:00:59Z&st=2023-08-17T12:00:59Z&spr=https&sig=A5QocHP7wIUhrTdeWzz3f4ZTq8SQ4K1VCXnh9bV38BQ%3D';
    const containerName = "products";
    const blobName = name;
    const blobServiceClient = new BlobServiceClient(sasUrl);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    try {
      const response = await blockBlobClient.uploadData(file, {
        blobHTTPHeaders: {
          blobContentType: file.type,
        },
      });
      return blobName;
      console.log('Upload successful:', response);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }

}
