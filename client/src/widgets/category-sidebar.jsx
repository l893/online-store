import { useListCategoriesQuery } from '../entities/categories';

export const CategorySidebar = ({ active, onChange }) => {
  const { data, isLoading } = useListCategoriesQuery();
  return (
    <aside className="border rounded-xl p-4 bg-gray-50">
      <div className="font-medium mb-2">Категории</div>
      {isLoading && <div className="text-sm text-gray-500">Загрузка…</div>}
      <ul className="space-y-2">
        <li>
          <button
            className={`text-left ${!active ? 'font-semibold' : ''}`}
            onClick={() => onChange('')}
          >
            Все
          </button>
        </li>
        {data?.map((c) => (
          <li key={c._id}>
            <button
              className={`text-left ${active === c._id ? 'font-semibold' : ''}`}
              onClick={() => onChange(c._id)}
            >
              {c.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};
