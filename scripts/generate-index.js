import fs from 'fs';
import path from 'path';

const DATA_DIR = './data';
const CATEGORIES = ['movies', 'books', 'comics'];

async function generateIndex() {
  for (const category of CATEGORIES) {
    const categoryDir = path.join(DATA_DIR, category);

    if (!fs.existsSync(categoryDir)) {
      console.log(`Skipping category: ${category} (directory not found)`);
      continue;
    }

    console.log(`Generating index for: ${category}...`);

    const files = fs
      .readdirSync(categoryDir)
      .filter((file) => file.endsWith('.json') && file !== 'index.json');

    const index = files
      .map((file) => {
        const filePath = path.join(categoryDir, file);
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          return {
            title: content.title,
            slug: file.replace('.json', ''),
            // Include ISBN if it exists (for books/comics)
            identifier: content.isbn || file.replace('.json', ''),
          };
        } catch (err) {
          console.error(`Error reading ${file}:`, err.message);
          return null;
        }
      })
      .filter((item) => item !== null);

    const indexPath = path.join(categoryDir, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    console.log(`Created ${indexPath} with ${index.length} items.`);
  }
}

generateIndex().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
