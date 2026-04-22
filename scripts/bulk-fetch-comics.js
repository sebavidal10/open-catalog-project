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

function parseArgs(args) {
  const result = { searchName: '', year: null, month: null };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--year' || arg === '-y') {
      result.year = parseInt(args[++i], 10);
    } else if (arg === '--month' || arg === '-m') {
      result.month = parseInt(args[++i], 10);
    } else if (!arg.startsWith('--')) {
      result.searchName = result.searchName
        ? `${result.searchName} ${arg}`
        : arg;
    }
  }

  return result;
}

async function fetchRecentComics() {
  const args = process.argv.slice(2);
  const { searchName, year, month } = parseArgs(args);

  const params = new URLSearchParams();
  if (searchName) {
    params.set('series_name', searchName);
  }
  if (year) {
    params.set('cover_year', year.toString());
  }
  if (month) {
    params.set('cover_month', month.toString());
  }

  const queryString = params.toString();
  const endpoint = queryString ? `/issue/?${queryString}` : '/issue/';

  if (searchName && year && month) {
    console.log(
      `Fetching comics for series: '${searchName}' (${month}/${year}) from Metron API...`,
    );
  } else if (searchName && year) {
    console.log(
      `Fetching comics for series: '${searchName}' (cover year: ${year}) from Metron API...`,
    );
  } else if (searchName) {
    console.log(`Fetching comics for series: '${searchName}' from Metron API...`);
  } else if (year && month) {
    console.log(`Fetching comics from ${month}/${year} from Metron API...`);
  } else if (year) {
    console.log(`Fetching comics from cover year: ${year} from Metron API...`);
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

        // Identifier rule: UPC, ISBN, or Fallback to Metron ID
        const identifier = fullData.upc || fullData.isbn || `metron-${apiId}`;

        const fileName = `${identifier}.json`;
        const filePath = path.join(DATA_DIR, fileName);

        if (fs.existsSync(filePath)) {
          console.log(`Skipping existing comic: ${identifier}`);
          continue;
        }

        const cleanedData = cleanComicData(fullData);

        fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2));
        console.log(`Saved: ${cleanedData.title} to ${fileName}`);

        // Rate limiting: 2 second delay (previously 1)
        await new Promise((resolve) => setTimeout(resolve, 2000));
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
