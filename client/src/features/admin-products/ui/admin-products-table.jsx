import { Button } from '@shared/ui';
import styles from './admin-products-table.module.scss';

export const AdminProductsTable = ({
  products = [],
  onEditProduct,
  onDeleteProduct,
}) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.productsTable}>
        <thead className={styles.tableHeader}>
          <tr>
            <th className={`${styles.tableHeadCell} ${styles.leftCell}`}>
              Название
            </th>
            <th className={styles.tableHeadCell}>Цена</th>
            <th className={styles.tableHeadCell}>Категория</th>
            <th className={styles.tableHeadCell}>Ост.</th>
            <th className={styles.tableHeadCell}>Действия</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product._id} className={styles.tableRow}>
              <td className={styles.tableCell}>
                {product.title}
                <div className={styles.productSlug}>{product.slug}</div>
              </td>

              <td className={`${styles.tableCell} ${styles.centerCell}`}>
                {product.price} ₽
              </td>

              <td className={`${styles.tableCell} ${styles.centerCell}`}>
                {product.categoryName || ''}
              </td>

              <td className={`${styles.tableCell} ${styles.centerCell}`}>
                {product.stock ?? 0}
              </td>

              <td className={`${styles.tableCell} ${styles.actionsCell}`}>
                <div className={styles.actions}>
                  <Button type="button" onClick={() => onEditProduct(product)}>
                    Ред.
                  </Button>

                  <Button
                    type="button"
                    color="error"
                    onClick={(event) => onDeleteProduct(event, product._id)}
                  >
                    Удалить
                  </Button>
                </div>
              </td>
            </tr>
          ))}

          {products.length === 0 && (
            <tr>
              <td className={styles.emptyCell} colSpan={5}>
                Нет данных
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
