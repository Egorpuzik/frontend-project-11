import i18next from 'i18next';
import onChange from 'on-change';
import validateUrl from './validation.js';
import { initView, showModal } from './view.js';
import { fetchRSS, parseRSS } from './api/rssParser.js';
import { checkForUpdates } from './api/updateChecker.js';

export default () => {
  i18next.init({
    lng: 'ru',
    resources: {
      ru: { translation: { preview: 'Предпросмотр', rssExists: 'RSS уже существует' } },
      en: { translation: { preview: 'Preview', rssExists: 'RSS already exists' } },
    },
  });

  const state = {
    form: { error: null },
    feeds: [],
    posts: [],
    readPosts: new Set(),
    isUpdating: false,
  };

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
    postsContainer: document.querySelector('.posts'),
  };

  const renderPosts = () => {
    const updatedHTML = state.posts
      .map((post, index) => {
        const isRead = state.readPosts.has(post.link);
        return `
          <div class="post ${isRead ? 'fw-normal' : 'fw-bold'}">
            <a href="${post.link}" target="_blank">${post.title}</a>
            <button class="btn btn-link preview-btn" data-index="${index}">
              ${i18next.t('preview')}
            </button>
          </div>
        `.trim();
      })
      .join('');

    elements.postsContainer.innerHTML = updatedHTML;

    document.querySelectorAll('.preview-btn').forEach((button) => {
      button.addEventListener('click', (e) => {
        const { index } = e.target.dataset;
        const post = state.posts[index];
        showModal(post.title, post.description, post.link);
        state.readPosts.add(post.link);
      });
    });
  };

  const watchedState = onChange(state, () => {
    renderPosts();
  });

  initView(watchedState, elements);

  const startUpdateChecker = () => {
    const updateFeeds = async () => {
      try {
        const updatePromises = state.feeds.map((feed) => checkForUpdates(feed.link)
          .then((newPosts) => {
            const existingLinks = new Set(state.posts.map((p) => p.link));
            const uniquePosts = newPosts.filter((post) => !existingLinks.has(post.link));

            if (uniquePosts.length > 0) {
              state.posts.push(...uniquePosts);
            }
          }));
        await Promise.all(updatePromises);
      } catch (error) {
        console.error('Error updating feeds:', error);
      } finally {
        setTimeout(updateFeeds, 5000);
      }
    };
    updateFeeds();
  };

  const addFeed = (url) => {
    if (state.feeds.some((feed) => feed.link === url)) {
      watchedState.form.error = i18next.t('rssExists');
      return;
    }

    fetchRSS(url)
      .then((xmlDoc) => {
        const feed = {
          title: xmlDoc.querySelector('title')?.textContent || 'No title',
          link: url,
        };
        const posts = parseRSS(xmlDoc);

        watchedState.feeds.push(feed);
        watchedState.posts.push(...posts);
        watchedState.form.error = null;

        elements.input.value = '';
        elements.input.focus();

        if (!state.isUpdating) {
          state.isUpdating = true;
          startUpdateChecker();
        }
      })
      .catch((err) => {
        watchedState.form.error = err.message;
      });
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.input.value.trim();

    validateUrl(url, state.feeds)
      .then(() => addFeed(url))
      .catch((err) => {
        watchedState.form.error = err.message;
      });
  });
};
