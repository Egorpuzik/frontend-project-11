import { validateUrl } from './validation.js';
import { initView } from './view.js';
import { fetchRSS, parseRSS } from './api/rssParser.js';
import { checkForUpdates } from './api/updateChecker.js';
import { showModal } from './components/Modal.js'; 

export default () => {
    const state = {
      form: { error: null },
      feeds: [],
      posts: [],
      readPosts: new Set(),
      isUpdating: false, // Флаг для предотвращения дублирующихся таймеров
    };
  
    const elements = {
      form: document.querySelector('form'),
      input: document.querySelector('input'),
      feedback: document.querySelector('.feedback'),
      postsContainer: document.querySelector('.posts'),
    };
  
    const watchedState = initView(state, elements);
  
    const addFeed = (url) => {
      if (state.feeds.some((feed) => feed.link === url)) {
        watchedState.form.error = 'RSS уже существует';
        return;
      }
  
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
  
          if (!state.isUpdating) {
            startUpdateChecker();
            state.isUpdating = true;
          }
        })
        .catch((err) => {
          watchedState.form.error = err.message;
        });
    };
  
    const renderPosts = () => {
      const postsHtml = state.posts.map((post, index) => {
        const isRead = state.readPosts.has(post.link);
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
  
          showModal(post.title, post.description, post.link);
          state.readPosts.add(post.link);
  
          renderPosts();
        });
      });
    };
  
    const startUpdateChecker = () => {
      setInterval(() => {
        state.feeds.forEach((feed) => {
          checkForUpdates(feed.link).then((newPosts) => {
            const uniquePosts = newPosts.filter((post) =>
              !state.posts.some((existing) => existing.link === post.link)
            );
  
            if (uniquePosts.length > 0) {
              state.posts.unshift(...uniquePosts);
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
        .then(() => addFeed(url))
        .catch((err) => {
          watchedState.form.error = err.message;
        });
    });
  };
  