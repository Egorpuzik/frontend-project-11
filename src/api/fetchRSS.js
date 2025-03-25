import axios from 'axios';

const proxy = 'https://allorigins.hexlet.app/get';

const fetchRSS = async (url) => {
  try {
    const apiUrl = new URL(proxy);
    apiUrl.searchParams.append('disableCache', 'true');
    apiUrl.searchParams.append('url', url);

    const response = await axios.get(apiUrl.toString());

    if (response.status !== 200) {
      throw new Error(`Ошибка загрузки: ${response.statusText}`);
    }

    return response.data.contents;
  } catch (error) {
    console.error('Ошибка запроса:', error.message);
    throw new Error('Ошибка загрузки RSS');
  }
};

export default fetchRSS;
