import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import { Readable } from 'stream';

// DATA_DIR is the root; files are stored at DATA_DIR/<key>
// e.g. key="recordings/userId/file.webm" → /data/recordings/userId/file.webm
const DATA_DIR = process.env.RECORDINGS_DIR || '/data';

async function ensureDir(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

function guessContentType(key: string): string {
  const ext = path.extname(key).toLowerCase();
  const types: Record<string, string> = {
    '.webm': 'audio/webm',
    '.mp3': 'audio/mpeg',
    '.mp4': 'audio/mp4',
    '.ogg': 'audio/ogg',
    '.wav': 'audio/wav',
  };
  return types[ext] || 'application/octet-stream';
}

export const storage = {
  async put(key: string, value: ArrayBuffer | null | unknown): Promise<null> {
    if (value === null || value === undefined) {
      await this.delete(key);
      return null;
    }
    const filePath = path.join(DATA_DIR, key);
    await ensureDir(filePath);
    await fs.writeFile(filePath, Buffer.from(value as ArrayBuffer));
    return null;
  },

  async get(key: string): Promise<{
    body: ReadableStream;
    size: number;
    httpMetadata: { contentType?: string };
    customMetadata: Record<string, string>;
  } | null> {
    const filePath = path.join(DATA_DIR, key);
    try {
      const stat = await fs.stat(filePath);
      const nodeStream = createReadStream(filePath);
      const webStream = Readable.toWeb(nodeStream) as ReadableStream;
      return {
        body: webStream,
        size: stat.size,
        httpMetadata: { contentType: guessContentType(key) },
        customMetadata: {},
      };
    } catch {
      return null;
    }
  },

  async delete(key: string): Promise<void> {
    const filePath = path.join(DATA_DIR, key);
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore if file doesn't exist
    }
  },
};
