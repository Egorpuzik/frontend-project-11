import { fetchRSS, parseRSS } from './rssParser.js';

export const checkForUpdates = async (feeds, state) => {
  const checkNewPosts = async (url) => {
    try {
      const rssData = await fetchRSS(url);
      const { posts } = parseRSS(rssData);

      const newPosts = posts.filter(
        (post) => !state.posts.some((existingPost) => existingPost.link === post.link),
      );

      if (newPosts.length > 0) {
        state.posts.push(...newPosts);
      }
    } catch (error) {
      console.error(`Ошибка при проверке обновлений для ${url}: ${error.message}`);
    }
  };

  feeds.forEach((url) => {
    checkNewPosts(url);
  });
};

export const startUpdateChecking = (feeds, state) => {
  const checkUpdates = () => {
    checkForUpdates(feeds, state);
    setTimeout(checkUpdates, 5000);
  };

  checkUpdates();
};
