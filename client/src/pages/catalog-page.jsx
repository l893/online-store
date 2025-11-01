import { useListProductsQuery } from '../entities/products';
import { useQueryParams } from '../shared/hooks';
import {
  SearchBar,
  SortControls,
  CategorySidebar,
  ProductGrid,
} from '../widgets';

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
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <SearchBar
          value={search}
          onChange={(v) => setParams({ search: v, page: 1 })}
        />
      </div>

      <div className="col-span-12 md:col-span-3">
        <CategorySidebar
          active={category}
          onChange={(v) => setParams({ category: v, page: 1 })}
        />
      </div>

      <div className="col-span-12 md:col-span-9 space-y-4">
        <div className="border rounded-xl p-3 bg-gray-50">
          <SortControls
            value={sort}
            onChange={(v) => setParams({ sort: v, page: 1 })}
          />
        </div>

        {(isLoading || isFetching) && (
          <div className="text-sm text-gray-500">Загрузка…</div>
        )}
        <ProductGrid items={data?.items} />

        {data?.pages > 1 && (
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border rounded"
              disabled={page <= 1}
              onClick={() => setParams({ page: page - 1 })}
            >
              Назад
            </button>
            <span className="text-sm text-gray-600">
              Стр. {page} из {data.pages}
            </span>
            <button
              className="px-3 py-1 border rounded"
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
