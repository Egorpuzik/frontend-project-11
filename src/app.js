import { validateUrl } from './validation.js';
import { initView } from './view.js';

export default () => {
  const state = {
    form: { error: null },
    feeds: [],
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
      .then(() => {
        state.feeds.push(url);
        watchedState.form.error = null;
        elements.input.value = '';
        elements.input.focus();
      })
      .catch((err) => {
        watchedState.form.error = err.message;
      });
  });
};
