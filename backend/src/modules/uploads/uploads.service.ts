import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

@Injectable()
export class UploadsService {
  // MVP: сохраняем на диск backend-контейнера (примонтирован volume).
  // TODO: заменить на загрузку в MinIO/S3 через @aws-sdk/client-s3,
  // когда потребуется горизонтальное масштабирование backend.
  async saveImage(file: Express.Multer.File) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const filename = `${randomUUID()}.webp`;
    const filepath = join(UPLOAD_DIR, filename);

    await sharp(file.buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(filepath);

    return { url: `/uploads/${filename}` };
  }
}
