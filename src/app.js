import { validateUrl } from './validation.js';
import { initView } from './view.js';
import { fetchRSS, parseRSS } from './api/rssParser.js';
import { checkForUpdates } from './api/updateChecker.js';
import { showModal } from './components/Modal.js'; // Используем showModal

export default () => {
  const state = {
    form: { error: null },
    feeds: [],
    posts: [],
    readPosts: new Set(),
  };

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
    postsContainer: document.querySelector('.posts'),
  };

  const watchedState = initView(state, elements);

  const addFeed = (url) => {
    fetchRSS(url)
      .then((xmlDoc) => {
        const feed = {
          title: xmlDoc.querySelector('title')?.textContent || 'Без названия',
          link: url,
        };
        const posts = parseRSS(xmlDoc);

        state.feeds.push(feed);
        state.posts.push(...posts);
        watchedState.form.error = null;
        elements.input.value = '';
        elements.input.focus();

        renderPosts();
      })
      .catch((err) => {
        watchedState.form.error = err.message;
      });
  };

  const renderPosts = () => {
    const postsHtml = state.posts.map((post, index) => {
      const isRead = state.readPosts.has(index);
      return `
        <div class="post ${isRead ? 'fw-normal' : 'fw-bold'}">
          <a href="${post.link}" target="_blank">${post.title}</a>
          <button class="btn btn-link preview-btn" data-index="${index}">Предпросмотр</button>
        </div>
      `;
    }).join('');

    elements.postsContainer.innerHTML = postsHtml;

    document.querySelectorAll('.preview-btn').forEach((button) => {
      button.addEventListener('click', (e) => {
        const index = e.target.dataset.index;
        const post = state.posts[index];

        showModal(post.title, post.description, post.link); // Открываем модальное окно
        state.readPosts.add(index); // Помечаем пост как прочитанный

        renderPosts();
      });
    });
  };

  const startUpdateChecker = () => {
    setInterval(() => {
      state.feeds.forEach((feed) => {
        checkForUpdates(feed.link).then((newPosts) => {
          if (newPosts.length > 0) {
            state.posts.unshift(...newPosts);
            renderPosts();
          }
        });
      });
    }, 5000);
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.input.value.trim();

    validateUrl(url, state.feeds)
      .then(() => {
        addFeed(url);
        startUpdateChecker();
      })
      .catch((err) => {
        watchedState.form.error = err.message;
      });
  });
};
