import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/config';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Allowed file types
const ALLOWED_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'application/zip',
];

export async function POST(request: Request): Promise<NextResponse> {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB for documents, 4MB for images)
    const isImage = file.type.startsWith('image/');
    const maxSize = isImage ? 4 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max ${isImage ? '4MB' : '10MB'} allowed.` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${sanitizedName}`;

    // Determine if this is an image (for response metadata)
    const isImageFile = file.type.startsWith('image/');

    // Check if Vercel Blob is configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Upload to Vercel Blob (production)
      const blob = await put(`tickets/${filename}`, file, {
        access: 'public',
      });
      return NextResponse.json({
        url: blob.url,
        isImage: isImageFile,
        filename: file.name,
      });
    } else {
      // Local development fallback - save to public/uploads
      const uploadDir = path.join(
        process.cwd(),
        'public',
        'uploads',
        'tickets'
      );
      await mkdir(uploadDir, { recursive: true });

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      // Return API URL for dynamic serving
      const url = `/api/uploads/tickets/${filename}`;
      return NextResponse.json({
        url,
        isImage: isImageFile,
        filename: file.name,
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// Configure max file size for the route
export const runtime = 'nodejs';
