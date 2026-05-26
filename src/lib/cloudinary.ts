/* ══════════════════════════════════════════
   Cloudinary — Original Filter
   ──────────────────────────────────────────
   Configuração e helpers para upload de imagens.

   Variáveis de ambiente necessárias no .env.local:
   - CLOUDINARY_CLOUD_NAME       (server-side)
   - CLOUDINARY_API_KEY          (server-side)
   - CLOUDINARY_API_SECRET       (server-side) ⚠️ NUNCA expor no client
   - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME (client-side, igual ao cloud_name)
   ══════════════════════════════════════════ */

import { v2 as cloudinary } from 'cloudinary';

let configured = false;

export function getCloudinary() {
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

export const CLOUDINARY_FOLDER = 'original-filter/products';

/**
 * Gera assinatura para upload direto Cliente → Cloudinary.
 * Retorna timestamp + signature + outros params que o cliente precisa.
 */
export function signUpload(params: { folder?: string; publicId?: string }): {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
} {
  const cld = getCloudinary();
  const timestamp = Math.round(Date.now() / 1000);
  const folder = params.folder ?? CLOUDINARY_FOLDER;

  const paramsToSign: Record<string, string | number> = {
    folder,
    timestamp,
  };
  if (params.publicId) paramsToSign.public_id = params.publicId;

  const signature = cld.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!);

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    folder,
  };
}
