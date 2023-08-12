import { walkSync } from "https://deno.land/std@0.151.0/fs/walk.ts";
import { basename, extname } from "https://deno.land/std@0.151.0/path/posix.ts";

const inputsPath = 'inputs'
const outputsPath = 'outputs'
const suffix = '-base64'

function bufferToBase64(buf: Uint8Array): string {
  const binary = Array.from(buf).map(byte => String.fromCharCode(byte)).join("");
  return btoa(binary);
}

const imageToBase64 = (imagePath: string) => {
  const fileExtensionNoDot = extname(imagePath).substring(1)
  const mimeTypeMap: Record<string, string> = {
    'jpg': 'jpeg',  // 'jpg' is converted to 'jpeg' for MIME type
    'jpeg': 'jpeg',
    'png': 'png',
    'gif': 'gif',
  }

  const mimeType = mimeTypeMap[fileExtensionNoDot]
  if (!mimeType) {
    throw new Error(`Unsupported file type for image: "${basename(imagePath)}"`)
  }

  const fileBuffer = Deno.readFileSync(imagePath)
  const base64String = `data:image/${mimeType};base64,${bufferToBase64(fileBuffer)}`

  return base64String
}

const inputImages = walkSync(inputsPath)

for (const imageFile of inputImages) {
  const { path } = imageFile

  if (path === inputsPath) continue

  const base64 = imageToBase64(path)
  const nameNoExt = basename(path, extname(path))

  Deno.writeTextFile(
    `${outputsPath}/${nameNoExt}${suffix}.txt`,
    base64
  )
}
