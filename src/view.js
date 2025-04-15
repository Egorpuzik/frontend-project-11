import { Modal } from 'bootstrap';
import onChange from 'on-change';
import i18next from 'i18next';

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

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18next.t('feeds');

  cardBody.appendChild(cardTitle);
  card.appendChild(cardBody);

  const list = createList(feeds, ({ title, description }) => {
    const item = document.createElement('li');
    item.classList.add('list-group-item', 'border-0', 'border-end-0');

    const feedTitle = document.createElement('h3');
    feedTitle.classList.add('h6', 'm-0');
    feedTitle.textContent = title;

    const feedDescription = document.createElement('p');
    feedDescription.classList.add('m-0', 'small', 'text-black-50');
    feedDescription.textContent = description;

    item.append(feedTitle, feedDescription);
    return item;
  });

  if (list) {
    list.classList.add('list-group', 'border-0', 'rounded-0');
    card.appendChild(list);
  }

  newContainer.appendChild(card);
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

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18next.t('posts');

  cardBody.appendChild(cardTitle);
  card.appendChild(cardBody);

  const list = createList(posts, ({ title, description, link }) => {
    const item = document.createElement('li');
    item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const postLink = document.createElement('a');
    postLink.href = link;
    postLink.textContent = title;
    postLink.target = '_blank';
    postLink.rel = 'noopener noreferrer';
    postLink.classList.add('fw-bold');
    if (readPosts.has(link)) {
      postLink.classList.remove('fw-bold');
      postLink.classList.add('fw-normal', 'link-secondary');
    }

    const previewBtn = document.createElement('button');
    previewBtn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    previewBtn.textContent = i18next.t('preview');

    previewBtn.addEventListener('click', () => {
      showModal(title, description, link);
      readPosts.add(link);
      postLink.classList.remove('fw-bold');
      postLink.classList.add('fw-normal', 'link-secondary');
    });

    item.append(postLink, previewBtn);
    return item;
  });

  if (list) {
    list.classList.add('list-group', 'border-0', 'rounded-0');
    card.appendChild(list);
  }

  newContainer.appendChild(card);
  postsContainer.replaceWith(newContainer);
};

export const resetInputField = (input) => {
  const newInput = input.cloneNode(true);
  newInput.value = '';
  newInput.focus();
  input.replaceWith(newInput);
};

export const initView = (state, elements) => onChange(state, (path) => {
  if (path === 'form.error') {
    renderError(elements.input, elements.feedback, state.form.error);
  }

  if (path === 'feeds') {
    renderFeeds(elements.feedsContainer, state.feeds);
  }

  if (path === 'posts' || path === 'readPosts') {
    renderPosts(elements.postsContainer, state.posts, state.readPosts);
  }
});
