export function cleanServiceData(data) {
  if (!data.name) {
    throw new Error('Service name is required');
  }

  const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-');

  return {
    name: data.name,
    slug: slug,
    category: data.category || 'other',
    description: data.description || '',
    color: data.color || '#000000',
    icon_url: data.icon_url || '',
    website: data.website || '',
    fetched_at: new Date().toISOString(),
  };
}
