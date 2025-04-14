import i18next from 'i18next';
import onChange from 'on-change';
import validateUrl from './validation.js';
import { initView, showModal, resetInputField } from './view.js';
import parseRSS from './api/rssParser.js';
import fetchRSS from './api/fetchRSS.js';

export default () => {
  const state = {
    form: { error: null },
    feeds: [],
    posts: [],
    readPosts: new Set(),
    feedAddingStatus: 'idle',
    modal: { title: '', description: '', link: null },
  };

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
  };

  const renderFeeds = () => {
    elements.feedsContainer.innerHTML = `
      <h2>${i18next.t('feeds')}</h2>
      <ul class="list-group mb-3">
        ${state.feeds.map((feed) => `
          <li class="list-group-item">
            <h3 class="h6">${feed.title}</h3>
          </li>
        `).join('')}
      </ul>
    `;
  };

  const renderPosts = () => {
    elements.postsContainer.innerHTML = `
      <h2>${i18next.t('posts')}</h2>
      <ul class="list-group">
        ${state.posts.map((post, index) => {
    const isRead = state.readPosts.has(post.link);
    return `
            <li class="list-group-item d-flex justify-content-between align-items-start">
              <a href="${post.link}" class="${isRead ? 'fw-normal' : 'fw-bold'}" target="_blank">${post.title}</a>
              <button type="button" class="btn btn-outline-primary btn-sm preview-btn" data-index="${index}">
                ${i18next.t('preview')}
              </button>
            </li>
          `;
  }).join('')}
      </ul>
    `;
  };

  const renderFeedback = (message, type = 'success') => {
    elements.feedback.textContent = message;
    elements.feedback.classList.remove('text-success', 'text-danger');

    if (type === 'success') {
      elements.feedback.classList.add('text-success');
    } else {
      elements.feedback.classList.add('text-danger');
    }
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'feeds':
        renderFeeds();
        break;
      case 'posts':
      case 'readPosts':
        renderPosts();
        break;
      case 'modal': {
        const { title, description, link } = value;
        if (link) showModal(title, description, link);
        break;
      }
      default:
        break;
    }
  });

  i18next.init({
    lng: 'ru',
    resources: {
      ru: {
        translation: {
          preview: 'Предпросмотр',
          rssExists: 'RSS уже существует',
          noTitle: 'Без названия',
          rssLoaded: 'RSS успешно загружен',
          feeds: 'Фиды',
          posts: 'Посты',
          parseError: 'Ошибка парсинга RSS',
          networkError: 'Ошибка сети',
        },
      },
    },
  });

  const updateFeeds = async () => {
    if (watchedState.feeds.length === 0) {
      setTimeout(updateFeeds, 5000);
      return;
    }

    await Promise.all(
      watchedState.feeds.map(async (feed) => {
        try {
          const xmlDoc = await fetchRSS(feed.link);
          const { posts } = parseRSS(xmlDoc);

          const existingLinks = new Set(watchedState.posts.map((p) => p.link));
          const newPosts = posts.filter((post) => !existingLinks.has(post.link));

          if (newPosts.length > 0) watchedState.posts.push(...newPosts);
        } catch (error) {
          console.error(`Ошибка обновления фида ${feed.link}:`, error);
        }
      }),
    );

    setTimeout(updateFeeds, 5000);
  };

  const addFeed = async (url) => {
    watchedState.feedAddingStatus = 'pending';

    const feedExists = watchedState.feeds.some((feed) => feed.link === url);
    if (feedExists) {
      watchedState.form.error = i18next.t('rssExists');
      watchedState.feedAddingStatus = 'error';
      renderFeedback(watchedState.form.error, 'error');
      return;
    }

    try {
      const xmlDoc = await fetchRSS(url);
      const { feed, posts } = parseRSS(xmlDoc);

      watchedState.feeds.push({
        title: feed.title || i18next.t('noTitle'),
        link: url,
      });
      watchedState.posts.push(...posts);

      watchedState.form.error = null;
      watchedState.feedAddingStatus = 'success';

      renderFeedback(i18next.t('rssLoaded'), 'success');
      resetInputField(elements.input);

      if (watchedState.feeds.length === 1) updateFeeds();
    } catch (error) {
      const errorKey = error.message === 'ParseError' ? 'parseError' : 'networkError';
      const message = i18next.t(errorKey);

      watchedState.form.error = message;
      watchedState.feedAddingStatus = 'error';

      renderFeedback(message, 'error');
    }
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.input.value.trim();

    validateUrl(url, watchedState.feeds)
      .then(() => addFeed(url))
      .catch((err) => {
        watchedState.form.error = err.message;
        watchedState.feedAddingStatus = 'error';
        renderFeedback(err.message, 'error');
      });
  });

  elements.postsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('preview-btn')) {
      const { index } = e.target.dataset;
      const post = watchedState.posts[index];

      watchedState.modal = {
        title: post.title,
        description: post.description,
        link: post.link,
      };

      watchedState.readPosts.add(post.link);
    }
  });

  initView(state, elements);
};
