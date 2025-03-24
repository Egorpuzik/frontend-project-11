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

  const updatePromises = feeds.map((url) => checkNewPosts(url));
  await Promise.all(updatePromises);
};

export const startUpdateChecking = (feeds, state) => {
  const checkUpdates = async () => {
    try {
      await checkForUpdates(feeds, state);
    } catch (error) {
      console.error('Ошибка при обновлении фидов:', error);
    } finally {
      setTimeout(checkUpdates, 5000);
    }
  };

  checkUpdates();
};
