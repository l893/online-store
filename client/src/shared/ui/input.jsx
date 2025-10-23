export const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full rounded-xl border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 ${className}`}
      {...props}
    />
  );
};
