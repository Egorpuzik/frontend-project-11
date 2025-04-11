import { Modal } from 'bootstrap';
import onChange from 'on-change';

const renderError = (input, feedback, error) => {
  const feedbackElement = feedback.cloneNode(true);
  feedbackElement.textContent = error || '';
  input.classList.toggle('is-invalid', !!error);
  feedback.replaceWith(feedbackElement);
};

const createList = (items, createItem) => {
  if (items.length === 0) return null;
  const list = document.createElement('ul');
  list.classList.add('list-group');
  items.forEach((item) => list.append(createItem(item)));
  return list;
};

const renderFeeds = (feedsContainer, feeds) => {
  const newContainer = feedsContainer.cloneNode(false);
  const list = createList(feeds, ({ title, description }) => {
    const item = document.createElement('li');
    item.classList.add('list-group-item');
    item.innerHTML = `<h3>${title}</h3><p>${description}</p>`;
    return item;
  });

  if (list) newContainer.appendChild(list);
  feedsContainer.replaceWith(newContainer);
};

export const showModal = (title, description, link) => {
  const modalElement = document.getElementById('modal');
  if (!modalElement) {
    console.error('Modal element not found');
    return;
  }

  document.querySelector('.modal-title').textContent = title;
  document.querySelector('.modal-body').textContent = description;
  document.querySelector('.full-article').href = link;

  const modal = new Modal(modalElement);
  modal.show();
};

const renderPosts = (postsContainer, posts, readPosts) => {
  const newContainer = postsContainer.cloneNode(false);
  const list = createList(posts, ({ title, link }) => {
    const item = document.createElement('li');
    item.classList.add('list-group-item', 'd-flex', 'justify-content-between');

    const postLink = document.createElement('a');
    postLink.href = link;
    postLink.textContent = title;
    postLink.target = '_blank';
    postLink.classList.toggle('fw-bold', !readPosts.has(link));

    const previewBtn = document.createElement('button');
    previewBtn.classList.add('btn', 'btn-link', 'preview-btn');
    previewBtn.textContent = 'Предпросмотр';

    previewBtn.addEventListener('click', () => {
      showModal(title, '', link);
      readPosts.add(link);
      postLink.classList.remove('fw-bold');
    });

    item.append(postLink, previewBtn);
    return item;
  });

  if (list) newContainer.appendChild(list);
  postsContainer.replaceWith(newContainer);
};

export const resetInputField = (input) => {
  const newInput = input.cloneNode(true);
  newInput.value = '';
  newInput.focus();
  input.replaceWith(newInput);
};

export const initView = (state, elements) => onChange(state, (path) => {
  if (path === 'form.error') renderError(elements.input, elements.feedback, state.form.error);
  if (path === 'feeds') renderFeeds(elements.feedsContainer, state.feeds);
  if (path === 'posts' || path === 'readPosts') renderPosts(elements.postsContainer, state.posts, state.readPosts);
});
