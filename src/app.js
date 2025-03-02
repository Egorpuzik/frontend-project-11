import { validateUrl } from './validation.js';
import { initView } from './view.js';
import { fetchRSS, parseRSS } from './api/rssParser.js';
import { checkForUpdates } from './api/updateChecker.js';  // Импортируем функцию проверки обновлений

export default () => {
  const state = {
    form: { error: null },
    feeds: [],
    posts: [],
  };

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
  };

  const watchedState = initView(state, elements);

  // Функция добавления нового потока
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
      })
      .catch((err) => {
        watchedState.form.error = err.message;
      });
  };

  // Отслеживание обновлений
  const startUpdateChecker = () => {
    setInterval(() => {
      state.feeds.forEach((feed) => {
        checkForUpdates(feed.link).then((newPosts) => {
          if (newPosts.length > 0) {
            state.posts.unshift(...newPosts);  // Добавляем новые посты в начало списка
          }
        });
      });
    }, 5000); // Проверка каждые 5 секунд
  };

  // Обработчик формы
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.input.value.trim();

    validateUrl(url, state.feeds)
      .then(() => {
        addFeed(url); // Добавляем новый поток
        startUpdateChecker(); // Запускаем проверку обновлений
      })
      .catch((err) => {
        watchedState.form.error = err.message;
      });
  });
};
