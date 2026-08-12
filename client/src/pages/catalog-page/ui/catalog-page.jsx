import { useEffect } from 'react';
import { useListCategoriesQuery } from '@entities/categories';
import { useListProductsQuery } from '@entities/products';
import { useQueryParams } from '@shared/hooks';
import { Loader } from '@shared/ui';
import { CategorySidebar } from '@widgets/category-sidebar';
import { ProductGrid } from '@widgets/product-grid';
import { SearchBar } from '@widgets/search-bar';
import { SortControls } from '@widgets/sort-controls';
import {
  isKnownCatalogCategorySlug,
  normalizeCatalogCategorySlug,
  normalizeCatalogPageNumber,
  normalizeCatalogSortValue,
} from '../model/catalog-query-parameters';
import styles from './catalog-page.module.scss';

export const CatalogPage = () => {
  const [queryParameters, setQueryParameters] = useQueryParams();

  const searchQuery = queryParameters.get('search') || '';
  const categoryParameterValue = queryParameters.get('category');
  const sortParameterValue = queryParameters.get('sort');
  const pageParameterValue = queryParameters.get('page');

  const categorySlug = normalizeCatalogCategorySlug(categoryParameterValue);
  const sortValue = normalizeCatalogSortValue(sortParameterValue);
  const pageNumber = normalizeCatalogPageNumber(pageParameterValue);

  const { data: categories = [], isSuccess: areCategoriesLoaded } =
    useListCategoriesQuery();

  const {
    data: displayedProductsResponse,
    currentData: currentProductsResponse,
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

  useEffect(() => {
    const queryParameterUpdates = {};

    if (
      pageParameterValue !== null &&
      pageParameterValue !== String(pageNumber)
    ) {
      queryParameterUpdates.page = pageNumber;
    }

    if (sortParameterValue !== null && sortParameterValue !== sortValue) {
      queryParameterUpdates.sort = sortValue;
      queryParameterUpdates.page = 1;
    }

    if (
      categoryParameterValue !== null &&
      categoryParameterValue !== categorySlug
    ) {
      queryParameterUpdates.category = categorySlug || null;
      queryParameterUpdates.page = 1;
    }

    if (
      areCategoriesLoaded &&
      !isKnownCatalogCategorySlug(categorySlug, categories)
    ) {
      queryParameterUpdates.category = null;
      queryParameterUpdates.page = 1;
    }

    if (currentProductsResponse) {
      const maximumPageNumber = Math.max(currentProductsResponse.pages, 1);

      if (pageNumber > maximumPageNumber) {
        queryParameterUpdates.page = maximumPageNumber;
      }
    }

    if (Object.keys(queryParameterUpdates).length > 0) {
      setQueryParameters(queryParameterUpdates, {
        replace: true,
      });
    }
  }, [
    areCategoriesLoaded,
    categories,
    categoryParameterValue,
    categorySlug,
    currentProductsResponse,
    pageNumber,
    pageParameterValue,
    setQueryParameters,
    sortParameterValue,
    sortValue,
  ]);

  const isInitialProductsLoading =
    isProductsLoading && !displayedProductsResponse;
  const isProductsRefreshing =
    isProductsFetching && Boolean(displayedProductsResponse);

  function handlePageChange(nextPageNumber) {
    setQueryParameters(
      {
        page: nextPageNumber,
      },
      {
        replace: false,
        navigationState: {
          shouldScrollToTop: true,
        },
      },
    );
  }

  return (
    <div className={styles.catalogLayout}>
      <div className={styles.searchSection}>
        <SearchBar
          searchQuery={searchQuery}
          onSearchQueryChange={(nextSearchQuery) =>
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
          onCategorySlugChange={(selectedCategorySlug) =>
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

        <div className={styles.productResults} aria-busy={isProductsFetching}>
          {isInitialProductsLoading ? (
            <div className={styles.initialLoaderWrapper}>
              <Loader label="Загружаем товары…" />
            </div>
          ) : (
            <ProductGrid products={displayedProductsResponse?.items} />
          )}

          {isProductsRefreshing && (
            <div
              className={styles.refreshIndicator}
              role="status"
              aria-live="polite"
            >
              <Loader label="Обновляем товары…" />
            </div>
          )}
        </div>

        {displayedProductsResponse?.pages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationButton}
              disabled={pageNumber <= 1}
              onClick={() => handlePageChange(pageNumber - 1)}
            >
              Назад
            </button>
            <span className={styles.paginationText}>
              Стр. {pageNumber} из {displayedProductsResponse.pages}
            </span>
            <button
              className={styles.paginationButton}
              disabled={pageNumber >= displayedProductsResponse.pages}
              onClick={() => handlePageChange(pageNumber + 1)}
            >
              Вперёд
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
