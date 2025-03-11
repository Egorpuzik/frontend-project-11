import * as yup from 'yup';

const validateUrl = (url, existingFeeds) => {
  const schema = yup.string()
    .url('Некорректный URL')
    .notOneOf(existingFeeds, 'RSS уже добавлен')
    .required('URL обязателен');

  return schema.validate(url);
};

export default validateUrl;
