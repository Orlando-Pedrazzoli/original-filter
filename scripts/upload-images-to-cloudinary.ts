/* ══════════════════════════════════════════
   Original Filter — Upload de Imagens para Cloudinary
   ══════════════════════════════════════════
   USO:
   1. Descompacte product-images.zip na raiz do projeto:
      → C:\PROJETOS\original-filter\product-images\OFA2023C.jpg
   2. Garanta credenciais no .env.local:
      CLOUDINARY_CLOUD_NAME=
      CLOUDINARY_API_KEY=
      CLOUDINARY_API_SECRET=
   3. Execute: npm run upload:images

   O QUE FAZ:
   - Lê todas as imagens da pasta product-images/
   - Para cada arquivo, extrai SKU do nome
   - Faz upload para Cloudinary (pasta: original-filter/products/)
   - Atualiza o produto no MongoDB com images[]
   - Idempotente: re-rodar não duplica (usa public_id = SKU)
   - Salta arquivos já presentes no Cloudinary
   ══════════════════════════════════════════ */

import { config } from 'dotenv';
config({ path: '.env.local' });

import mongoose from 'mongoose';
import { readdirSync, statSync } from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

import Product from '../src/models/Product';
import type { ProductImage } from '../src/types';

const IMAGES_DIR = path.join(process.cwd(), 'product-images');
const CLOUDINARY_FOLDER = 'original-filter/products';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

interface UploadResult {
  sku: string;
  url: string;
  publicId: string;
}

async function uploadOne(filePath: string, sku: string): Promise<UploadResult | null> {
  const publicId = `${CLOUDINARY_FOLDER}/${sku.toLowerCase()}`;

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      overwrite: false, // se já existir, não sobrescreve
      resource_type: 'image',
      format: 'webp', // converte para WebP (mais leve)
      transformation: [{ quality: 'auto:good' }, { width: 1200, height: 1200, crop: 'limit' }],
      tags: ['product', sku.toLowerCase()],
    });

    return {
      sku,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (err: unknown) {
    const e = err as { http_code?: number; message?: string };
    // Se já existir (409) e overwrite false, busca a URL existente
    if (e.http_code === 409 || (e.message ?? '').includes('already exists')) {
      try {
        const info = await cloudinary.api.resource(publicId);
        return { sku, url: info.secure_url, publicId: info.public_id };
      } catch {
        // ignora
      }
    }
    console.error(`  ❌ ${sku}: ${e.message ?? String(err)}`);
    return null;
  }
}

async function main() {
  // Validações iniciais
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.error('❌ Credenciais Cloudinary ausentes no .env.local');
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI ausente no .env.local');
    process.exit(1);
  }

  // Listar imagens
  let files: string[];
  try {
    files = readdirSync(IMAGES_DIR).filter(
      (f) => /\.(jpe?g|png|webp)$/i.test(f) && statSync(path.join(IMAGES_DIR, f)).isFile(),
    );
  } catch (err) {
    console.error(`❌ Pasta ${IMAGES_DIR} não encontrada.`);
    console.error('   Descompacte product-images.zip na raiz do projeto.');
    process.exit(1);
  }

  if (files.length === 0) {
    console.error(`❌ Nenhuma imagem encontrada em ${IMAGES_DIR}`);
    process.exit(1);
  }

  console.log(`📦 Encontradas ${files.length} imagens em product-images/\n`);

  console.log('🔌 Conectando ao MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Conectado\n');

  // ─── Upload em lote ───
  console.log('☁️  Subindo para Cloudinary...');
  const uploaded: UploadResult[] = [];
  const failed: string[] = [];

  // Concorrência limitada para não sobrecarregar Cloudinary
  const BATCH = 5;
  for (let i = 0; i < files.length; i += BATCH) {
    const slice = files.slice(i, i + BATCH);
    const results = await Promise.all(
      slice.map(async (f) => {
        const sku = path.parse(f).name.toUpperCase();
        const filePath = path.join(IMAGES_DIR, f);
        return uploadOne(filePath, sku);
      }),
    );
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r) {
        uploaded.push(r);
      } else {
        failed.push(path.parse(slice[j]).name.toUpperCase());
      }
    }
    process.stdout.write(`  ${Math.min(i + BATCH, files.length)}/${files.length}\r`);
  }
  console.log(`\n✓ ${uploaded.length} imagens no Cloudinary`);
  if (failed.length) console.log(`✗ ${failed.length} falhas`);

  // ─── Atualizar produtos no MongoDB ───
  console.log('\n📝 Atualizando produtos no banco...');
  let updated = 0;
  let notFoundProducts: string[] = [];

  for (const u of uploaded) {
    const image: ProductImage = {
      url: u.url,
      alt: `Filtro ${u.sku} — Original Filter`,
      isPrimary: true,
    };

    const result = await Product.findOneAndUpdate(
      { sku: u.sku },
      { $set: { images: [image] } },
      { returnDocument: 'after' },
    );

    if (result) updated++;
    else notFoundProducts.push(u.sku);
  }

  console.log(`✓ ${updated} produtos atualizados`);
  if (notFoundProducts.length) {
    console.log(
      `⚠️  ${notFoundProducts.length} imagens subidas mas SEM produto correspondente no banco:`,
    );
    notFoundProducts.slice(0, 10).forEach((s) => console.log(`   - ${s}`));
    if (notFoundProducts.length > 10) {
      console.log(`   ... e mais ${notFoundProducts.length - 10}`);
    }
  }

  // ─── Stats finais ───
  const totalWithImage = await Product.countDocuments({ 'images.0': { $exists: true } });
  const totalProducts = await Product.countDocuments();
  console.log(
    `\n📊 ${totalWithImage}/${totalProducts} produtos no banco têm imagem (${((totalWithImage / totalProducts) * 100).toFixed(1)}%)`,
  );

  console.log('\n✅ Upload concluído.\n');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
