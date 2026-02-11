export async function fetchData(url) {
  console.log(`Fetching data from: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw error;
  }
}
