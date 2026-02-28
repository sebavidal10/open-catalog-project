export async function fetchData(url, options = {}) {
  console.log(`Fetching data from: ${url}`);
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw error;
  }
}

export async function fetchMetronData(endpoint) {
  const username = process.env.METRON_USERNAME;
  const password = process.env.METRON_PASSWORD;

  if (!username || !password) {
    throw new Error('METRON_USERNAME and METRON_PASSWORD must be set');
  }

  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  const url = `https://metron.cloud/api${endpoint}`;

  return fetchData(url, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
}
