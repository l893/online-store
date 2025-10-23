export const Button = ({ className = '', ...props }) => {
  return (
    <button
      className={`rounded-2xl px-4 py-2 shadow-sm border bg-amber-100 hover:bg-amber-200 transition ${className}`}
      {...props}
    />
  );
};
