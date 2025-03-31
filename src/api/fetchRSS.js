import axios from 'axios';

const PROXY_URL = 'https://allorigins.hexlet.app/get';

const fetchRSS = async (url) => {
  try {
    const apiUrl = new URL(PROXY_URL);
    apiUrl.searchParams.append('disableCache', 'true');
    apiUrl.searchParams.append('url', encodeURIComponent(url)); 

    console.log("Запрашиваемый URL:", apiUrl.toString()); 

    const response = await axios.get(apiUrl.toString());

    console.log("Ответ от сервера:", response); 

    if (!response.data || !response.data.contents) {
      throw new Error('Ошибка загрузки RSS');
    }

    console.log("Полученный XML:", response.data.contents); 

    return response.data.contents;
  } catch (error) {
    console.error('Ошибка запроса:', error.message);
    throw new Error('Ошибка загрузки RSS');
  }
};

export default fetchRSS;
