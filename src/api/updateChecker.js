import { fetchRSS, parseRSS } from './rssParser.js';

// Эта функция будет проверять обновления для всех фидов
export const checkForUpdates = async (feeds, state) => {
  const checkNewPosts = async (url) => {
    try {
      const rssData = await fetchRSS(url);
      const { posts } = parseRSS(rssData);

      // Проверка наличия новых постов (сравниваем с уже загруженными)
      const newPosts = posts.filter((post) => {
        return !state.posts.some((existingPost) => existingPost.link === post.link);
      });

      // Если новые посты есть, добавляем их в список
      if (newPosts.length > 0) {
        state.posts.push(...newPosts);
      }
    } catch (error) {
      console.error(`Ошибка при проверке обновлений для ${url}: ${error.message}`);
    }
  };

  // Проходим по всем фидам и проверяем их на новые посты
  feeds.forEach((url) => {
    checkNewPosts(url);
  });
};

// Функция для запуска проверки через setTimeout
export const startUpdateChecking = (feeds, state) => {
  const checkUpdates = () => {
    checkForUpdates(feeds, state);
    setTimeout(checkUpdates, 5000); // Пауза 5 секунд, чтобы проверить снова
  };
  checkUpdates();
};
