import axios from 'axios';

const PROXY_URL = 'https://allorigins.hexlet.app/get';

const fetchRSS = async (url) => {
  try {
    const apiUrl = new URL(PROXY_URL);
    apiUrl.searchParams.append('disableCache', 'true');
    apiUrl.searchParams.append('url', url);

    const response = await axios.get(apiUrl.toString());

    if (!response.data || !response.data.contents) {
      throw new Error('Ошибка загрузки RSS');
    }

    return response.data.contents;
  } catch (error) {
    console.error('Ошибка запроса:', error.message);
    throw new Error('Ошибка загрузки RSS');
  }
};

export default fetchRSS;
