import { useListProductsQuery } from '../../../entities/products';
import { useQueryParams } from '../../../shared/hooks';
import { Loader } from '../../../shared/ui';
import { CategorySidebar } from '../../../widgets/category-sidebar';
import { ProductGrid } from '../../../widgets/product-grid';
import { SearchBar } from '../../../widgets/search-bar';
import { SortControls } from '../../../widgets/sort-controls';
import styles from './catalog-page.module.scss';

export const CatalogPage = () => {
  const [params, setParams] = useQueryParams();
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'price_asc';
  const page = Number(params.get('page') || 1);

  const { data, isLoading, isFetching } = useListProductsQuery({
    search,
    category,
    sort,
    page,
    limit: 10,
  });

  return (
    <div className={styles.catalogLayout}>
      <div className={styles.searchSection}>
        <SearchBar
          value={search}
          onChange={(searchValue) =>
            setParams({ search: searchValue, page: 1 })
          }
        />
      </div>

      <div className={styles.sidebarSection}>
        <CategorySidebar
          active={category}
          onChange={(categoryId) =>
            setParams({ category: categoryId, page: 1 })
          }
        />
      </div>

      <div className={styles.contentSection}>
        <div className={styles.sortPanel}>
          <SortControls
            value={sort}
            onChange={(sortValue) => setParams({ sort: sortValue, page: 1 })}
          />
        </div>

        {(isLoading || isFetching) && (
          <div className={styles.loaderWrapper}>
            <Loader label="Загружаем товары…" />
          </div>
        )}

        {!isLoading && !isFetching && <ProductGrid products={data?.items} />}

        {data?.pages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationButton}
              disabled={page <= 1}
              onClick={() => setParams({ page: page - 1 })}
            >
              Назад
            </button>
            <span className={styles.paginationText}>
              Стр. {page} из {data.pages}
            </span>
            <button
              className={styles.paginationButton}
              disabled={page >= data.pages}
              onClick={() => setParams({ page: page + 1 })}
            >
              Вперёд
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
