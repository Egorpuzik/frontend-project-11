import axios from 'axios';

export const fetchRSS = async (url) => {
  try {
    const proxyUrl = new URL('https://api.allorigins.win/get');
    proxyUrl.searchParams.set('url', url);

    const response = await axios.get(proxyUrl.toString());

    if (!response.data || !response.data.contents) {
      throw new Error('Пустой ответ от сервера');
    }

    return response.data.contents;
  } catch (error) {
    console.error('Ошибка загрузки RSS:', error);
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
