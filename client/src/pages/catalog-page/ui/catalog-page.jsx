import { useListProductsQuery } from '../../../entities/products';
import { useQueryParams } from '../../../shared/hooks';
import { Loader } from '../../../shared/ui';
import { CategorySidebar } from '../../../widgets/category-sidebar';
import { ProductGrid } from '../../../widgets/product-grid';
import { SearchBar } from '../../../widgets/search-bar';
import { SortControls } from '../../../widgets/sort-controls';
import styles from './catalog-page.module.scss';

export const CatalogPage = () => {
  const [queryParameters, setQueryParameters] = useQueryParams();

  const search = queryParameters.get('search') || '';
  const categorySlug = queryParameters.get('category') || '';
  const sort = queryParameters.get('sort') || 'price_asc';
  const page = Number(queryParameters.get('page') || 1);

  const { data, isLoading, isFetching } = useListProductsQuery({
    search,
    category: categorySlug,
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
            setQueryParameters({
              search: searchValue,
              page: 1,
            })
          }
        />
      </div>

      <div className={styles.sidebarSection}>
        <CategorySidebar
          activeCategorySlug={categorySlug}
          onCategoryChange={(selectedCategorySlug) =>
            setQueryParameters(
              {
                category: selectedCategorySlug,
                page: 1,
              },
              {
                replace: false,
              },
            )
          }
        />
      </div>

      <div className={styles.contentSection}>
        <div className={styles.sortPanel}>
          <SortControls
            value={sort}
            onChange={(sortValue) =>
              setQueryParameters(
                {
                  sort: sortValue,
                  page: 1,
                },
                {
                  replace: false,
                },
              )
            }
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
              onClick={() =>
                setQueryParameters(
                  {
                    page: page - 1,
                  },
                  {
                    replace: false,
                  },
                )
              }
            >
              Назад
            </button>
            <span className={styles.paginationText}>
              Стр. {page} из {data.pages}
            </span>
            <button
              className={styles.paginationButton}
              disabled={page >= data.pages}
              onClick={() =>
                setQueryParameters(
                  {
                    page: page + 1,
                  },
                  {
                    replace: false,
                  },
                )
              }
            >
              Вперёд
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
