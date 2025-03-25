import axios from 'axios';

const proxy = 'https://allorigins.hexlet.app/get?disableCache=true&url=';

const fetchRSS = async (url) => {
  try {
    const apiUrl = `${proxy}${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);

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
