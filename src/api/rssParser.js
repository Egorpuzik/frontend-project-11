const parseRSS = (xmlString) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

  if (xmlDoc.querySelector('parsererror')) {
    throw new Error('Ошибка парсинга RSS');
  }

  const feed = {
    title: xmlDoc.querySelector('channel > title')?.textContent || 'Без названия',
    description: xmlDoc.querySelector('channel > description')?.textContent || '',
  };

  const items = xmlDoc.querySelectorAll('item');
  const posts = Array.from(items).map((item) => ({
    title: item.querySelector('title')?.textContent || 'Без заголовка',
    link: item.querySelector('link')?.textContent || '#',
    description: item.querySelector('description')?.textContent || '',
  }));

  return { feed, posts };
};

export default parseRSS;
