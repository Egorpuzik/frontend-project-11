import onChange from 'on-change';

const renderError = (elements, error) => {
  const { input, feedback } = elements;
  input.classList.toggle('is-invalid', !!error);
  feedback.textContent = error || '';
};

export const initView = (state, elements) => {
  return onChange(state, (path, value) => {
    if (path === 'form.error') {
      renderError(elements, value);
    }
  });
};
