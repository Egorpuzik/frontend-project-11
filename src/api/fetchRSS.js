import axios from 'axios';

const proxy = 'https://allorigins.hexlet.app/get?disableCache=true&url=';

const fetchRSS = (url) => axios
  .get(`${proxy}${encodeURIComponent(url)}`)
  .then((response) => response.data.contents)
  .catch((error) => {
    console.error('Ошибка запроса:', error); // Логируем ошибку
    throw new Error('Ошибка загрузки RSS');
  });

export default fetchRSS;
