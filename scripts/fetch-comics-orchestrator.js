import fs from 'fs';
import path from 'path';
import { fetchMetronData } from '../src/utils/api.js';
import { cleanComicData } from '../src/models/comic.js';
import { fileURLToPath } from 'url';

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

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
const LOGS_DIR = path.resolve(process.cwd(), 'logs');
const CHARACTERS_FILE = path.resolve(process.cwd(), 'data/characters.json');

const RATE_LIMIT_MS = 3000;
const MAX_YEAR = new Date().getFullYear();
const LAST_MONTH = new Date().getMonth() + 1;
const START_YEAR = 1950;

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function updateReviewedAtForRange(searchTerm, year, month) {
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
  const searchLower = searchTerm.toLowerCase();
  const targetDate = `${year}-${month.toString().padStart(2, '0')}`;

  for (const file of files) {
    try {
      const filePath = path.join(DATA_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const comic = JSON.parse(content);

      const titleMatch =
        comic.title && comic.title.toLowerCase().includes(searchLower);
      const subjectsMatch =
        comic.subjects &&
        comic.subjects.some((s) => s.toLowerCase().includes(searchLower));

      if ((titleMatch || subjectsMatch) && !comic.reviewed_at) {
        const publishDate = comic.publish_date;
        if (publishDate && publishDate.startsWith(targetDate.substring(0, 7))) {
          comic.reviewed_at = targetDate + '-01';
          fs.writeFileSync(filePath, JSON.stringify(comic, null, 2));
        }
      }
    } catch (e) {
      // Skip invalid files
    }
  }
}

function getLastProcessedForCharacter(searchTerm) {
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));

  let lastYear = START_YEAR - 1;
  let lastMonth = 0;

  const searchLower = searchTerm.toLowerCase();

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
      const comic = JSON.parse(content);

      const titleMatch =
        comic.title && comic.title.toLowerCase().includes(searchLower);
      const subjectsMatch =
        comic.subjects &&
        comic.subjects.some((s) => s.toLowerCase().includes(searchLower));

      if ((titleMatch || subjectsMatch)) {
        const reviewedAt = comic.reviewed_at;
        
        if (reviewedAt && reviewedAt.length >= 7) {
          const year = parseInt(reviewedAt.substring(0, 4), 10);
          const month = parseInt(reviewedAt.substring(5, 7), 10);

          if (year > lastYear || (year === lastYear && month > lastMonth)) {
            lastYear = year;
            lastMonth = month;
          }
        }
      }
    } catch (e) {
      // Skip invalid files
    }
  }

  return { year: lastYear, month: lastMonth };
}

async function fetchForCharacter(
  searchTerm,
  fromYear,
  fromMonth,
  toYear,
  toMonth,
) {
  console.log(
    `\n▶ Processing: "${searchTerm}" (from ${fromYear}/${fromMonth})`,
  );

  let totalSaved = 0;
  let currentYear = fromYear;

  while (currentYear <= toYear) {
    const lastMonthForYear = currentYear === toYear ? toMonth : 12;
    const startMonthForYear = currentYear === fromYear ? fromMonth : 1;

    const paramsCheck = new URLSearchParams();
    paramsCheck.set('series_name', searchTerm);
    paramsCheck.set('cover_year', currentYear.toString());
    const endpointCheck = `/issue/?${paramsCheck.toString()}`;

    let hasAnyInYear = false;
    try {
      const responseCheck = await fetchMetronData(endpointCheck);
      hasAnyInYear = (responseCheck.results || []).length > 0;
    } catch (e) {}

    if (!hasAnyInYear) {
      console.log(`  ${currentYear}: no comics, skipping year`);
      currentYear++;
      continue;
    }

    console.log(`  ${currentYear}: processing...`);

    let currentMonth = startMonthForYear;
    while (currentMonth <= lastMonthForYear) {
      const params = new URLSearchParams();
      params.set('series_name', searchTerm);
      params.set('cover_year', currentYear.toString());
      params.set('cover_month', currentMonth.toString());

      const endpoint = `/issue/?${params.toString()}`;

      try {
        const response = await fetchMetronData(endpoint);
        const issues = response.results || [];

        if (issues.length === 0) {
          currentMonth++;
          await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS));
          continue;
        }

        console.log(
          `    ${currentYear}-${currentMonth.toString().padStart(2, '0')}: ${issues.length} found`,
        );

        let saved = 0;
        for (const issueSummary of issues) {
          const apiId = issueSummary.id;

          try {
            const fullData = await fetchMetronData(`/issue/${apiId}/`);
            const identifier = fullData.upc || fullData.isbn || `metron-${apiId}`;
            const filePath = path.join(DATA_DIR, `${identifier}.json`);

            if (fs.existsSync(filePath)) {
              continue;
            }

const cleanedData = cleanComicData(fullData);
          
          if (!cleanedData) {
            continue;
          }

          fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2));
            saved++;
            totalSaved++;

            await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS));
          } catch (error) {
            if (error.message.includes('429')) {
              console.log('      Rate limited, waiting 5s...');
              await new Promise((resolve) => setTimeout(resolve, 5000));
            }
          }
        }

        console.log(`      → ${saved} new comics saved`);

        if (saved > 0) {
          updateReviewedAtForRange(searchTerm, currentYear, currentMonth);
        }
      } catch (error) {
        console.log(`    ${currentYear}-${currentMonth}: ERROR - ${error.message}`);
      }

      currentMonth++;
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS));
    }

    currentYear++;
  }

  console.log(`✓ Done: "${searchTerm}" - ${totalSaved} total new comics`);
  return totalSaved;
}

async function main() {
  console.log('='.repeat(50));
  console.log('Fetch Comics Orchestrator');
  console.log('='.repeat(50));

  if (!fs.existsSync(CHARACTERS_FILE)) {
    console.error(`Characters file not found: ${CHARACTERS_FILE}`);
    process.exit(1);
  }

  const characters = JSON.parse(fs.readFileSync(CHARACTERS_FILE, 'utf-8'));
  console.log(`Loaded ${characters.length} characters\n`);

  const endYear = MAX_YEAR;
  const endMonth = LAST_MONTH - 1;

  const totalEndMonth = endMonth === 0 ? 11 : endMonth;
  const totalEndYear = endMonth === 0 ? endYear - 1 : endYear;

  for (const char of characters) {
    console.log(`\n${'='.repeat(30)}`);
    console.log(`Character: ${char.search}`);
    console.log('='.repeat(30));

    const lastProcessed = getLastProcessedForCharacter(char.search);
    const fromYear =
      lastProcessed.year >= START_YEAR ? lastProcessed.year : START_YEAR;
    const fromMonth =
      lastProcessed.year >= START_YEAR ? lastProcessed.month + 1 : 1;

    if (fromYear > endYear || (fromYear === endYear && fromMonth > endMonth)) {
      console.log('Already up to date, skipping.');
      continue;
    }

    console.log(`Starting from: ${fromYear}/${fromMonth}`);
    console.log(`Target: ${endYear}/${endMonth}`);

    await fetchForCharacter(
      char.search,
      fromYear,
      fromMonth,
      endYear,
      endMonth,
    );
  }

  console.log('\n' + '='.repeat(50));
  console.log('All characters processed!');
  console.log('='.repeat(50));
}

if (isMainModule) {
  main().catch(console.error);
}
