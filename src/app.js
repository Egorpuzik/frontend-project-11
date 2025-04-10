import i18next from 'i18next';
import onChange from 'on-change';
import validateUrl from './validation.js';
import { initView, showModal, resetInputField } from './view.js';
import parseRSS from './api/rssParser.js';
import fetchRSS from './api/fetchRSS.js';

export default () => {
  i18next.init({
    lng: 'ru',
    resources: {
      ru: { translation: { preview: 'Предпросмотр', rssExists: 'RSS уже существует', noTitle: 'Без названия' } },
      en: { translation: { preview: 'Preview', rssExists: 'RSS already exists', noTitle: 'No title' } },
    },
  });

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
    postsContainer: document.querySelector('.posts'),
  };

  let watchedState;

  const renderPosts = () => {
    elements.postsContainer.innerHTML = state.posts
      .map((post, index) => {
        const isRead = state.readPosts.has(post.link);
        const postTitle = document.createElement('a');
        postTitle.href = post.link;
        postTitle.target = '_blank';
        postTitle.textContent = post.title;

        const previewButton = document.createElement('button');
        previewButton.classList.add('btn', 'btn-link', 'preview-btn');
        previewButton.dataset.index = index;
        previewButton.textContent = i18next.t('preview');

        const postContainer = document.createElement('div');
        postContainer.classList.add('post');
        postContainer.classList.add(isRead ? 'fw-normal' : 'fw-bold');
        postContainer.appendChild(postTitle);
        postContainer.appendChild(previewButton);

        return postContainer.outerHTML;
      })
      .join('');

    document.querySelectorAll('.preview-btn').forEach((button) => {
      button.addEventListener('click', (e) => {
        const { index } = e.target.dataset;
        const post = state.posts[index];

        watchedState.modal = { title: post.title, description: post.description, link: post.link };
        watchedState.readPosts.add(post.link);
      });
    });
  };

  watchedState = onChange(state, (path) => {
    if (path.startsWith('posts') || path === 'readPosts') {
      renderPosts();
    } else if (path === 'modal') {
      const { title, description, link } = watchedState.modal;
      if (link) showModal(title, description, link);
    }
  });

  const updateFeeds = async () => {
    if (watchedState.feeds.length === 0) {
      setTimeout(updateFeeds, 5000);
      return null;
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
    return null;
  };

  const addFeed = async (url) => {
    watchedState.feedAddingStatus = 'pending';

    try {
      const xmlDoc = await fetchRSS(url);
      const { feed, posts } = parseRSS(xmlDoc);

      watchedState.feeds.push({ title: feed.title || i18next.t('noTitle'), link: url });
      watchedState.posts.push(...posts);

      watchedState.form.error = null;
      watchedState.feedAddingStatus = 'success';

      resetInputField(elements);

      if (watchedState.feeds.length === 1) updateFeeds();
    } catch (error) {
      watchedState.form.error = error.message;
      watchedState.feedAddingStatus = 'error';
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
      });
  });

  initView(state, elements);
};
