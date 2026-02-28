import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data/comics');

function cleanup() {
  if (!fs.existsSync(DATA_DIR)) {
    console.log('Data directory not found.');
    return;
  }

  const files = fs.readdirSync(DATA_DIR);
  console.log(`Scanning ${files.length} files in ${DATA_DIR}...`);

  let deletedCount = 0;

  files.forEach((file) => {
    if (!file.endsWith('.json')) return;

    const basename = file.replace('.json', '');

    // Rule: Must be strictly numerical (UPC or ISBN)
    // UPC is usually 12-15 digits, ISBN 10 or 13.
    // We allow 10 to 18 digits just to be safe but strictly numbers.
    const isNumerical = /^\d{10,18}$/.test(basename);

    if (!isNumerical || basename === 'null' || basename === 'undefined') {
      console.log(`Deleting invalid file: ${file}`);
      fs.unlinkSync(path.join(DATA_DIR, file));
      deletedCount++;
    }
  });

  console.log(`Cleanup completed. Deleted ${deletedCount} invalid files.`);
}

cleanup();
