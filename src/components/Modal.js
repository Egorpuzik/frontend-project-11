// Функция для открытия модального окна
export const openModal = (title, description, link) => {
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    const modalLink = document.querySelector('.full-article');
  
    modalTitle.textContent = title;
    modalBody.textContent = description;
    modalLink.setAttribute('href', link);
  
    const modal = new bootstrap.Modal(document.getElementById('modal'));
    modal.show();
  };
  
  // Экспорты для использования в других частях приложения
  export const hideModal = () => {
    const modal = new bootstrap.Modal(document.getElementById('modal'));
    modal.hide();
  };
  
  export const showModal = (title, description, link) => {
    openModal(title, description, link);
  };
  