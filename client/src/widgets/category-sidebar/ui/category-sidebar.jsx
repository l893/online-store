import { useListCategoriesQuery } from '../../../entities/categories';
import { Loader } from '../../../shared/ui';
import styles from './category-sidebar.module.scss';

export const CategorySidebar = ({ activeCategorySlug, onCategoryChange }) => {
  const { data: categories, isLoading } = useListCategoriesQuery();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.title}>Категории</div>
      {isLoading && (
        <Loader className={styles.loader} label="Загружаем категории…" />
      )}
      <ul className={styles.categoryList}>
        <li>
          <button
            className={`${styles.categoryButton} ${
              !activeCategorySlug ? styles.activeCategoryButton : ''
            }`}
            onClick={() => onCategoryChange('')}
          >
            Все
          </button>
        </li>
        {categories?.map((category) => (
          <li key={category._id}>
            <button
              className={`${styles.categoryButton} ${
                activeCategorySlug === category.slug
                  ? styles.activeCategoryButton
                  : ''
              }`}
              onClick={() => onCategoryChange(category.slug)}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};
