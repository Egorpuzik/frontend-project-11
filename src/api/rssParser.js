import axios from 'axios';

export const fetchRSS = async (url) => {
  try {
    const response = await axios.get(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data.contents, 'application/xml');

    if (xmlDoc.querySelector('parsererror')) {
      throw new Error('Ошибка парсинга RSS');
    }

    return xmlDoc;
  } catch (error) {
    console.error('Ошибка загрузки RSS:', error);
    throw new Error('Ошибка загрузки RSS');
  }
};

export const parseRSS = (xmlDoc) => {
  // Получаем информацию о самом RSS-канале
  const feed = {
    title: xmlDoc.querySelector('channel > title')?.textContent || 'Без названия',
    description: xmlDoc.querySelector('channel > description')?.textContent || '',
  };

  // Получаем список постов
  const items = xmlDoc.querySelectorAll('item');
  const posts = Array.from(items).map((item) => ({
    title: item.querySelector('title')?.textContent || 'Без заголовка',
    link: item.querySelector('link')?.textContent || '#',
    description: item.querySelector('description')?.textContent || '',
  }));

  return { feed, posts };
};
