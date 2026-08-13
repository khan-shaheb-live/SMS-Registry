import path from 'path'
import fs from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads'
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB ?? '10', 10)
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const ALLOWED_EXTENSIONS = ['.pdf', '.docx']

export interface UploadedFile {
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
}

export interface UploadError {
  error: string
}

export type UploadResult = { success: true; file: UploadedFile } | { success: false; error: string }

/**
 * Ensure the upload directory exists.
 */
function ensureUploadDir(subDir: string = ''): string {
  const dir = subDir ? path.join(UPLOAD_DIR, subDir) : UPLOAD_DIR
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}

/**
 * Sanitize a filename to prevent path traversal and injection.
 */
export function sanitizeFilename(filename: string): string {
  // Remove any path components
  const base = path.basename(filename)
  // Replace special characters
  return base.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 200)
}

/**
 * Validate a file before saving.
 */
export function validateFile(
  file: File,
  options?: { mimeType?: string; size?: number }
): { valid: boolean; error?: string } {
  const ext = path.extname(file.name).toLowerCase()
  const mimeType = options?.mimeType ?? file.type
  const size = options?.size ?? file.size

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `File type not supported. Only PDF and DOCX files are accepted. Received: ${ext || 'unknown'}`,
    }
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `File type not supported. Only PDF and DOCX files are accepted.`,
    }
  }

  if (size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (size / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `File is too large (${sizeMB} MB). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`,
    }
  }

  if (size === 0) {
    return { valid: false, error: 'File is empty.' }
  }

  return { valid: true }
}

/**
 * Save a file to the upload directory.
 * Returns the relative file path for storage in the database.
 */
export async function saveFile(
  file: File,
  subDir: string = ''
): Promise<UploadResult> {
  try {
    const validation = validateFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error! }
    }

    const uploadDir = ensureUploadDir(subDir)
    const sanitized = sanitizeFilename(file.name)
    const timestamp = Date.now()
    const uniqueName = `${timestamp}_${sanitized}`
    const absolutePath = path.join(uploadDir, uniqueName)
    const relativePath = path.join(UPLOAD_DIR, subDir, uniqueName).replace(/\\/g, '/')

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(absolutePath, buffer)

    return {
      success: true,
      file: {
        fileName: sanitized,
        filePath: relativePath,
        fileSize: file.size,
        mimeType: file.type,
      },
    }
  } catch (error) {
    console.error('File save error:', error)
    return { success: false, error: 'Failed to save file. Please try again.' }
  }
}

/**
 * Delete a file from the upload directory.
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const absolutePath = path.resolve(filePath)
    // Security: ensure the path is within the upload directory
    const uploadRoot = path.resolve(UPLOAD_DIR)
    if (!absolutePath.startsWith(uploadRoot)) {
      console.error('Attempted to delete file outside upload directory:', absolutePath)
      return
    }
    await fs.unlink(absolutePath)
  } catch {
    // File may not exist — ignore
  }
}

/**
 * Read a file from the upload directory.
 */
export async function readFile(filePath: string): Promise<Buffer | null> {
  try {
    const absolutePath = path.resolve(filePath)
    const uploadRoot = path.resolve(UPLOAD_DIR)
    if (!absolutePath.startsWith(uploadRoot)) {
      return null
    }
    return await fs.readFile(absolutePath)
  } catch {
    return null
  }
}
