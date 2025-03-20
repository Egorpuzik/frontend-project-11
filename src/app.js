import validateUrl from './validation.js';
import { initView, showModal } from './view.js';
import { fetchRSS, parseRSS } from './api/rssParser.js';
import { checkForUpdates } from './api/updateChecker.js';

export default () => {
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

  const watchedState = initView(state, elements);

  const renderPosts = (localState) => {
    const updatedHTML = localState.posts
      .map((post, index) => {
        const isRead = localState.readPosts.has(post.link);
        return `
          <div class="post ${isRead ? 'fw-normal' : 'fw-bold'}">
            <a href="${post.link}" target="_blank">${post.title}</a>
            <button class="btn btn-link preview-btn" data-index="${index}">
              Предпросмотр
            </button>
          </div>
        `;
      })
      .join('');

    elements.postsContainer.innerHTML = updatedHTML;

    document.querySelectorAll('.preview-btn').forEach((button) => {
      button.addEventListener('click', (e) => {
        const { index } = e.target.dataset;
        const post = localState.posts[index];

        showModal(post.title, post.description, post.link);
        localState.readPosts.add(post.link);

        renderPosts(localState);
      });
    });
  };

  const startUpdateChecker = (localState, renderFunction) => {
    setInterval(() => {
      localState.feeds.forEach((feed) => {
        checkForUpdates(feed.link).then((newPosts) => {
          const existingLinks = new Set(localState.posts.map((p) => p.link));
          const uniquePosts = newPosts.filter((post) => !existingLinks.has(post.link));
          if (uniquePosts.length > 0) {
            localState.posts.push(...uniquePosts);
            renderFunction(localState);
          }
        });
      });
    }, 5000);
  };

  const addFeed = (url, localState, localWatchedState) => {
    if (localState.feeds.some((feed) => feed.link === url)) {
      Object.assign(localWatchedState.form, { error: 'RSS уже существует' });
      return;
    }

    fetchRSS(url)
      .then((xmlDoc) => {
        const feed = {
          title: xmlDoc.querySelector('title')?.textContent || 'Без названия',
          link: url,
        };
        const posts = parseRSS(xmlDoc);

        localState.feeds.push(feed);
        localState.posts.push(...posts);
        Object.assign(localWatchedState.form, { error: null });

        const inputElement = elements.input;
        inputElement.value = '';
        inputElement.focus();

        renderPosts(localState);

        if (!localState.isUpdating) {
          Object.assign(localState, { isUpdating: true });
          startUpdateChecker(localState, renderPosts);
        }
      })
      .catch((err) => {
        Object.assign(localWatchedState.form, { error: err.message });
      });
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.input.value.trim();

    validateUrl(url, state.feeds)
      .then(() => addFeed(url, state, watchedState))
      .catch((err) => {
        Object.assign(watchedState.form, { error: err.message });
      });
  });
};
