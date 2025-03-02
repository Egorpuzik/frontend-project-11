import onChange from 'on-change';

const renderError = (elements, error) => {
  const { input, feedback } = elements;
  input.classList.toggle('is-invalid', !!error);
  feedback.textContent = error || '';
};

const renderFeeds = (elements, feeds) => {
  const { feedsContainer } = elements;
  feedsContainer.innerHTML = ''; // Очищаем контейнер перед ререндером

  const list = document.createElement('ul');
  list.classList.add('list-group');

  feeds.forEach(({ title, description }) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item');

    const feedTitle = document.createElement('h3');
    feedTitle.textContent = title;

    const feedDescription = document.createElement('p');
    feedDescription.textContent = description;

    listItem.append(feedTitle, feedDescription);
    list.appendChild(listItem);
  });

  feedsContainer.appendChild(list);
};

const renderPosts = (elements, posts) => {
  const { postsContainer } = elements;
  postsContainer.innerHTML = ''; // Очищаем перед ререндером

  const list = document.createElement('ul');
  list.classList.add('list-group');

  posts.forEach(({ title, link }) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item');

    const postLink = document.createElement('a');
    postLink.href = link;
    postLink.textContent = title;
    postLink.target = '_blank';

    listItem.appendChild(postLink);
    list.appendChild(listItem);
  });

  postsContainer.appendChild(list);
};

export const initView = (state, elements) => {
  return onChange(state, (path, value) => {
    if (path === 'form.error') {
      renderError(elements, value);
    }

    if (path === 'feeds') {
      renderFeeds(elements, value);
    }

    if (path === 'posts') {
      renderPosts(elements, value);
    }
  });
};
