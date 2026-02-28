import fs from 'fs';
import path from 'path';
import { fetchMetronData } from '../src/utils/api.js';
import { cleanComicData } from '../src/models/comic.js';
import { fileURLToPath } from 'url';

// ESM Check for direct execution
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

// Load .env manually if it exists (avoids dependencies)
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach((line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const DATA_DIR = path.resolve(process.cwd(), 'data/comics');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function fetchRecentComics() {
  const args = process.argv.slice(2);
  const searchName = args.join(' ');

  let endpoint = '/issue/';
  if (searchName) {
    console.log(
      `Fetching comics for series: '${searchName}' from Metron API...`,
    );
    endpoint += `?series_name=${encodeURIComponent(searchName)}`;
  } else {
    console.log('Fetching latest comics from Metron API...');
  }

  try {
    const response = await fetchMetronData(endpoint);
    const issues = response.results || [];

    console.log(`Found ${issues.length} issues in results.`);

    for (const issueSummary of issues) {
      const apiId = issueSummary.id;

      try {
        console.log(`Fetching full details for issue ID: ${apiId}`);
        const fullData = await fetchMetronData(`/issue/${apiId}/`);

        // Strict identification rule: must have UPC or ISBN
        const identifier = fullData.upc || fullData.isbn;

        if (!identifier) {
          console.log(`Skipping issue ${apiId}: No UPC or ISBN found.`);
          continue;
        }

        const fileName = `${identifier}.json`;
        const filePath = path.join(DATA_DIR, fileName);

        if (fs.existsSync(filePath)) {
          console.log(`Skipping existing comic: ${identifier}`);
          continue;
        }

        const cleanedData = cleanComicData(fullData);

        fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2));
        console.log(`Saved: ${cleanedData.title} to ${fileName}`);

        // Rate limiting: 1 second delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing issue ${apiId}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Fatal error during bulk fetch:', error.message);
  }
}

if (isMainModule) {
  fetchRecentComics().then(() => {
    console.log('Bulk comic fetch completed.');
  });
}
