import styles from './not-found-page.module.scss';

export const NotFoundPage = () => {
  return (
    <div className={styles.notFoundPage}>
      <h1 className={styles.title}>404 — Страница не найдена</h1>
      <p className={styles.message}>
        Такой страницы не существует. Проверьте адрес.
      </p>
    </div>
  );
};
