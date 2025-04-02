import { Modal } from 'bootstrap';
import onChange from 'on-change';

const renderError = (input, feedback, error) => {
  const feedbackElement = feedback;
  input.classList.toggle('is-invalid', !!error);
  feedbackElement.textContent = error || '';
};

const createList = (items, createItem) => {
  if (items.length === 0) return null;
  const list = document.createElement('ul');
  list.classList.add('list-group');
  items.forEach((item) => list.append(createItem(item)));
  return list;
};

const renderFeeds = (container, feeds) => {
  const feedsContainer = container;
  feedsContainer.innerHTML = '';
  const list = createList(feeds, ({ title, description }) => {
    const item = document.createElement('li');
    item.classList.add('list-group-item');
    item.innerHTML = `<h3>${title}</h3><p>${description}</p>`;
    return item;
  });
  if (list) feedsContainer.appendChild(list);
};

export const showModal = (title, description, link) => {
  const modal = new Modal(document.getElementById('modal'));
  document.querySelector('.modal-title').textContent = title;
  document.querySelector('.modal-body').textContent = description;
  document.querySelector('.full-article').href = link;
  modal.show();
};

const renderPosts = (container, posts, readPosts) => {
  const postsContainer = container;
  postsContainer.innerHTML = '';
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
  if (list) postsContainer.appendChild(list);
};

export const resetInputField = (field) => {
  const input = field;
  input.value = '';
  input.focus();
};

export const initView = (state, elements) => onChange(state, (path) => {
  if (path === 'form.error') renderError(elements.input, elements.feedback, state.form.error);
  if (path === 'feeds') renderFeeds(elements.feedsContainer, state.feeds);
  if (path === 'posts' || path === 'readPosts') renderPosts(elements.postsContainer, state.posts, state.readPosts);
});
