import { fetchRSS, parseRSS } from './rssParser.js';

export const checkForUpdates = async (state) => {
  const { feeds, posts } = state;

  const checkNewPosts = async (feed) => {
    try {
      const rssData = await fetchRSS(feed.link);
      const { posts: newPosts } = parseRSS(rssData);

      const existingLinks = new Set(posts.map((post) => post.link));
      const uniquePosts = newPosts.filter((post) => !existingLinks.has(post.link));

      if (uniquePosts.length > 0) {
        state.posts.push(...uniquePosts);
      }
    } catch (error) {
      console.error(`Ошибка при проверке обновлений для ${feed.link}: ${error.message}`);
    }
  };

  await Promise.all(feeds.map(checkNewPosts));
};

export const startUpdateChecking = (state) => {
  const checkUpdates = async () => {
    await checkForUpdates(state);
    setTimeout(checkUpdates, 5000);
  };

  checkUpdates();
};
