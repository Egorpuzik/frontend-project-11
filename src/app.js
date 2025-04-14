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
    elements.feedback.classList.add(type === 'error' ? 'text-danger' : 'text-success');
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
      case 'modal':
        if (value.link) showModal(value.title, value.description, value.link);
        break;
      case 'form.error':
        renderFeedback(value, 'error');
        break;
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
          parseError: 'Ресурс не содержит валидный RSS',
          networkError: 'Ошибка сети',
          invalidUrl: 'Ссылка должна быть валидным URL',
          required: 'Не должно быть пустым',
        },
      },
    },
  });

  const updateFeeds = async () => {
    if (watchedState.feeds.length === 0) {
      setTimeout(updateFeeds, 5000);
      return;
    }

    await Promise.all(watchedState.feeds.map(async (feed) => {
      try {
        const xml = await fetchRSS(feed.link);
        const { posts: newPosts } = parseRSS(xml);

        const existingLinks = new Set(watchedState.posts.map((post) => post.link));
        const freshPosts = newPosts.filter((post) => !existingLinks.has(post.link));

        if (freshPosts.length > 0) {
          watchedState.posts.push(...freshPosts);
        }
      } catch {
        renderFeedback(i18next.t('networkError'), 'error');
      }
    }));

    setTimeout(updateFeeds, 5000);
  };

  const addFeed = async (url) => {
    const alreadyExists = watchedState.feeds.some((feed) => feed.link === url);
    if (alreadyExists) {
      watchedState.form.error = i18next.t('rssExists');
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
      watchedState.form.error = null;

      renderFeedback(i18next.t('rssLoaded'));
      resetInputField(elements.input);

      if (watchedState.feeds.length === 1) {
        updateFeeds();
      }
    } catch (error) {
      const key = error.message === 'ParseError' ? 'parseError' : 'networkError';
      watchedState.form.error = i18next.t(key);
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const url = elements.input.value.trim();

    validateUrl(url, watchedState.feeds)
      .then(() => addFeed(url))
      .catch((error) => {
        const message = i18next.t(error.message) || error.message;
        watchedState.form.error = message;
      });
  };

  const handlePostClick = (event) => {
    if (!event.target.classList.contains('preview-btn')) return;

    const { index } = event.target.dataset;
    const post = watchedState.posts[index];

    watchedState.readPosts.add(post.link);
    watchedState.modal = {
      title: post.title,
      description: post.description,
      link: post.link,
    };
  };

  elements.form.addEventListener('submit', handleFormSubmit);
  elements.postsContainer.addEventListener('click', handlePostClick);

  initView(state, elements);
};
