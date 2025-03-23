import axios from 'axios';

export const fetchRSS = async (url) => {
  try {
    const rssUrl = new URL(url);
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl.href)}`;

    const response = await axios.get(proxyUrl);
    return response.data.contents;
  } catch (error) {
    console.error(`Ошибка загрузки RSS: ${error.message}`);
    throw new Error('Ошибка загрузки RSS');
  }
};

export const parseRSS = (xmlString) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

  if (xmlDoc.querySelector('parsererror')) {
    throw new Error('Ошибка парсинга RSS');
  }

  const feed = {
    title: xmlDoc.querySelector('channel > title')?.textContent?.trim() || 'Без названия',
    description: xmlDoc.querySelector('channel > description')?.textContent?.trim() || '',
  };

  const items = xmlDoc.querySelectorAll('item');
  const posts = Array.from(items).map((item) => ({
    title: item.querySelector('title')?.textContent?.trim() || 'Без заголовка',
    link: item.querySelector('link')?.textContent?.trim() || '#',
    description: item.querySelector('description')?.textContent?.trim() || '',
  }));

  return { feed, posts };
};
