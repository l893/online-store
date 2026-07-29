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

  const searchQuery = queryParameters.get('search') || '';
  const categorySlug = queryParameters.get('category') || '';
  const sortValue = queryParameters.get('sort') || 'price_asc';
  const pageNumber = Number(queryParameters.get('page') || 1);

  const {
    data: productsResponse,
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
  } = useListProductsQuery(
    {
      search: searchQuery,
      category: categorySlug,
      sort: sortValue,
      page: pageNumber,
      limit: 10,
    },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    },
  );

  return (
    <div className={styles.catalogLayout}>
      <div className={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChange={(nextSearchQuery) =>
            setQueryParameters({
              search: nextSearchQuery,
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
            sortValue={sortValue}
            onSortChange={(selectedSortValue) =>
              setQueryParameters(
                {
                  sort: selectedSortValue,
                  page: 1,
                },
                {
                  replace: false,
                },
              )
            }
          />
        </div>

        {(isProductsLoading || isProductsFetching) && (
          <div className={styles.loaderWrapper}>
            <Loader label="Загружаем товары…" />
          </div>
        )}

        {!isProductsLoading && !isProductsFetching && (
          <ProductGrid products={productsResponse?.items} />
        )}

        {productsResponse?.pages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationButton}
              disabled={pageNumber <= 1}
              onClick={() =>
                setQueryParameters(
                  {
                    page: pageNumber - 1,
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
              Стр. {pageNumber} из {productsResponse.pages}
            </span>
            <button
              className={styles.paginationButton}
              disabled={pageNumber >= productsResponse.pages}
              onClick={() =>
                setQueryParameters(
                  {
                    page: pageNumber + 1,
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
