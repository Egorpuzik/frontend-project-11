import { Modal } from 'bootstrap';

import onChange from 'on-change';

const renderError = (elements, error) => {
  const { input, feedback } = elements;
  input.classList.toggle('is-invalid', !!error);
  feedback.textContent = error || '';
};

const createList = (items, createItem) => {
  if (items.length === 0) return null;
  const list = document.createElement('ul');
  list.classList.add('list-group');

  items.forEach((item) => {
    const listItem = createItem(item);
    list.appendChild(listItem);
  });

  return list;
};

const renderFeeds = (elements, feeds) => {
  const { feedsContainer } = elements;
  feedsContainer.innerHTML = '';

  const list = createList(feeds, ({ title, description }) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item');

    const feedTitle = document.createElement('h3');
    feedTitle.textContent = title;

    const feedDescription = document.createElement('p');
    feedDescription.textContent = description;

    listItem.append(feedTitle, feedDescription);
    return listItem;
  });

  if (list) feedsContainer.appendChild(list);
};

const renderPosts = (elements, posts) => {
  const { postsContainer } = elements;
  postsContainer.innerHTML = '';

  const list = createList(posts, ({ title, link }) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item');

    const postLink = document.createElement('a');
    postLink.href = link;
    postLink.textContent = title;
    postLink.target = '_blank';

    listItem.appendChild(postLink);
    return listItem;
  });

  if (list) postsContainer.appendChild(list);
};

export const initView = (state, elements) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.error':
      renderError(elements, value);
      break;
    case 'feeds':
      renderFeeds(elements, value);
      break;
    case 'posts':
      renderPosts(elements, value);
      break;
    default:
      break;
  }
});

export const openModal = (title, description, link) => {
  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');
  const modalLink = document.querySelector('.full-article');

  modalTitle.textContent = title;
  modalBody.textContent = description;
  modalLink.setAttribute('href', link);

  const modal = new Modal(document.getElementById('modal'));
  modal.show();
};

export const hideModal = () => {
  const modal = new Modal(document.getElementById('modal'));
  modal.hide();
};

export const showModal = (title, description, link) => {
  openModal(title, description, link);
};
