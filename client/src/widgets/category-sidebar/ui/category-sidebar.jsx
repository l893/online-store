import { useListCategoriesQuery } from '@entities/categories';
import { Loader } from '@shared/ui';
import styles from './category-sidebar.module.scss';

export const CategorySidebar = ({
  activeCategorySlug,
  onCategorySlugChange,
}) => {
  const { data: categories, isLoading: isCategoriesLoading } =
    useListCategoriesQuery();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.title}>Категории</div>
      {isCategoriesLoading && (
        <Loader className={styles.loader} label="Загружаем категории…" />
      )}
      <ul className={styles.categoryList}>
        <li>
          <button
            className={`${styles.categoryButton} ${
              !activeCategorySlug ? styles.activeCategoryButton : ''
            }`}
            onClick={() => onCategorySlugChange('')}
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
              onClick={() => onCategorySlugChange(category.slug)}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};
