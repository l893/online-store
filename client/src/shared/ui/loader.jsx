export const Loader = ({ className = '', label = 'Loading…' }) => {
  const baseClassName = 'inline-flex items-center gap-2 text-sm text-gray-500';
  const mergedClassName = className
    ? `${baseClassName} ${className}`
    : baseClassName;

  return (
    <div className={mergedClassName}>
      <span className="inline-block h-4 w-4 rounded-full border border-gray-300 border-t-transparent animate-spin" />
      <span className="animate-pulse">{label}</span>
    </div>
  );
};

{
  /* <Loader /> */
} // дефолтный вариант
{
  /* <Loader className="justify-center" /> */
} // центрируем
{
  /* <Loader label="Загружаем товары…" /> */
} // меняем подпись
