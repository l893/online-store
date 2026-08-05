import { useEffect } from 'react';
import { useListCategoriesQuery } from '../../../entities/categories';
import { useListProductsQuery } from '../../../entities/products';
import { useQueryParams } from '../../../shared/hooks';
import { Loader } from '../../../shared/ui';
import { CategorySidebar } from '../../../widgets/category-sidebar';
import { ProductGrid } from '../../../widgets/product-grid';
import { SearchBar } from '../../../widgets/search-bar';
import { SortControls } from '../../../widgets/sort-controls';
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
    currentData: productsResponse,
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

    if (productsResponse) {
      const maximumPageNumber = Math.max(productsResponse.pages, 1);

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
    pageNumber,
    pageParameterValue,
    productsResponse,
    setQueryParameters,
    sortParameterValue,
    sortValue,
  ]);

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
