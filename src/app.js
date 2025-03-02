import { validateUrl } from './validation.js';
import { initView } from './view.js';
import { fetchRSS, parseRSS } from './api/rssParser.js';

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

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.input.value.trim();

    validateUrl(url, state.feeds)
      .then(() => fetchRSS(url))
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
  });
};
