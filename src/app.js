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
              <a href="${post.link}" class="${isRead ? 'fw-normal' : 'fw-bold'}" target="_blank" rel="noopener noreferrer">
                ${post.title}
              </a>
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
    elements.feedback.classList.add(type === 'success' ? 'text-success' : 'text-danger');
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
          invalidUrl: 'Ссылка должна быть валидным URL',
          required: 'Не должно быть пустым',
        },
      },
    },
  });

  const updateFeeds = async () => {
    const { feeds, posts } = watchedState;
    if (feeds.length === 0) {
      setTimeout(updateFeeds, 5000);
      return;
    }

    await Promise.all(feeds.map(async (feed) => {
      try {
        const xml = await fetchRSS(feed.link);
        const { posts: newPosts } = parseRSS(xml);

        const existingLinks = new Set(posts.map((post) => post.link));
        const freshPosts = newPosts.filter((p) => !existingLinks.has(p.link));

        if (freshPosts.length > 0) {
          watchedState.posts.push(...freshPosts);
        }
      } catch (err) {
        console.error(`Ошибка обновления RSS: ${feed.link}`, err);
      }
    }));

    setTimeout(updateFeeds, 5000);
  };

  const addFeed = async (url) => {
    watchedState.feedAddingStatus = 'pending';

    const alreadyExists = watchedState.feeds.some((feed) => feed.link === url);
    if (alreadyExists) {
      const message = i18next.t('rssExists');
      watchedState.form.error = message;
      watchedState.feedAddingStatus = 'error';
      renderFeedback(message, 'error');
      return;
    }

    try {
      const xml = await fetchRSS(url);
      const { feed, posts } = parseRSS(xml);

      watchedState.feeds.push({
        title: feed.title || i18next.t('noTitle'),
        link: url,
      });

      watchedState.posts.push(...posts);
      watchedState.feedAddingStatus = 'success';
      watchedState.form.error = null;

      renderFeedback(i18next.t('rssLoaded'), 'success');
      resetInputField(elements.input);

      if (watchedState.feeds.length === 1) {
        updateFeeds();
      }
    } catch (error) {
      const key = error.message === 'ParseError' ? 'parseError' : 'networkError';
      const message = i18next.t(key);
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
        const message = i18next.t(err.message) || err.message;
        watchedState.form.error = message;
        watchedState.feedAddingStatus = 'error';
        renderFeedback(message, 'error');
      });
  });

  elements.postsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('preview-btn')) {
      const { index } = e.target.dataset;
      const post = watchedState.posts[index];

      watchedState.readPosts.add(post.link);
      watchedState.modal = {
        title: post.title,
        description: post.description,
        link: post.link,
      };
    }
  });

  initView(state, elements);
};
