import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const CATEGORIES = ['movies', 'books', 'comics'];

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Optimiza un directorio de catálogo:
 * 1. Minifica los archivos JSON eliminando espacios y saltos de línea innecesarios.
 * 2. Genera el índice index.json correspondiente de forma minificada.
 */
async function optimizeCategory(category) {
  const categoryDir = path.join(DATA_DIR, category);
  if (!fs.existsSync(categoryDir)) {
    console.log(`[${category}] Directorio no encontrado, omitiendo.`);
    return { filesCount: 0, originalBytes: 0, optimizedBytes: 0 };
  }

  console.log(`\n========================================`);
  console.log(`Iniciando optimización de: ${category.toUpperCase()}`);
  console.log(`========================================`);

  const allFiles = fs
    .readdirSync(categoryDir)
    .filter((f) => f.endsWith('.json') && f !== 'index.json');

  let originalBytes = 0;
  let optimizedBytes = 0;
  const indexEntries = [];

  const totalFiles = allFiles.length;
  console.log(`Encontrados ${totalFiles} archivos en ${category}.`);

  for (let i = 0; i < totalFiles; i++) {
    const file = allFiles[i];
    const filePath = path.join(categoryDir, file);

    try {
      const stats = fs.statSync(filePath);
      originalBytes += stats.size;

      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);

      // Minificar
      const minified = JSON.stringify(data);
      fs.writeFileSync(filePath, minified);

      optimizedBytes += Buffer.byteLength(minified, 'utf-8');

      // Crear entrada de índice
      const slug = file.replace('.json', '');
      const identifier =
        data.isbn ||
        data.upc ||
        data.id ||
        data.imdbID ||
        slug;

      indexEntries.push({
        title: data.title,
        slug,
        identifier,
      });

      if ((i + 1) % 5000 === 0 || i + 1 === totalFiles) {
        const percent = (((i + 1) / totalFiles) * 100).toFixed(1);
        console.log(`  Procesados ${i + 1}/${totalFiles} (${percent}%)...`);
      }
    } catch (err) {
      console.error(`  Error procesando ${file}:`, err.message);
    }
  }

  // Guardar index.json minificado
  const indexPath = path.join(categoryDir, 'index.json');
  const minifiedIndex = JSON.stringify(indexEntries);
  fs.writeFileSync(indexPath, minifiedIndex);

  const savedBytes = originalBytes - optimizedBytes;
  const reduction = originalBytes > 0
    ? ((savedBytes / originalBytes) * 100).toFixed(1)
    : 0;

  console.log(`✓ ${category} completado:`);
  console.log(`  - Archivos: ${totalFiles}`);
  console.log(`  - Tamaño original: ${formatBytes(originalBytes)}`);
  console.log(`  - Tamaño optimizado: ${formatBytes(optimizedBytes)}`);
  console.log(`  - Ahorro: ${formatBytes(savedBytes)} (${reduction}%)`);
  console.log(`  - Índice: ${indexPath} (${indexEntries.length} entradas)`);

  return { filesCount: totalFiles, originalBytes, optimizedBytes };
}

async function main() {
  console.log('🚀 Iniciando optimización automática del catálogo...');
  const startTime = Date.now();

  let totalFiles = 0;
  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const cat of CATEGORIES) {
    const res = await optimizeCategory(cat);
    totalFiles += res.filesCount;
    totalOriginal += res.originalBytes;
    totalOptimized += res.optimizedBytes;
  }

  const totalSaved = totalOriginal - totalOptimized;
  const totalReduction = totalOriginal > 0
    ? ((totalSaved / totalOriginal) * 100).toFixed(1)
    : 0;
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n========================================`);
  console.log(`✨ OPTIMIZACIÓN COMPLETADA en ${elapsed}s`);
  console.log(`========================================`);
  console.log(`Total archivos procesados: ${totalFiles}`);
  console.log(`Espacio original:          ${formatBytes(totalOriginal)}`);
  console.log(`Espacio optimizado:        ${formatBytes(totalOptimized)}`);
  console.log(`Ahorro total de disco:     ${formatBytes(totalSaved)} (-${totalReduction}%)`);
  console.log(`========================================\n`);
}

main().catch((err) => {
  console.error('Error fatal durante la optimización:', err);
  process.exit(1);
});
