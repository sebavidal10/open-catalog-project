import fs from 'fs';
import path from 'path';

export function saveFile(directory, filename, data) {
  const dirPath = path.join(process.cwd(), directory);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  const filePath = path.join(dirPath, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Successfully saved file: ${filePath}`);
}
