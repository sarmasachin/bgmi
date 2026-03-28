type Row = Record<string, string | number>;

type Props = {
  title: string;
  columns: string[];
  rows: Row[];
};

export function AdminTable({ title, columns, rows }: Props) {
  return (
    <section className="admin-section">
      <h1>{title}</h1>
      <div className="admin-actions">
        <button type="button">Create</button>
        <button type="button">Edit</button>
        <button type="button">Delete</button>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column}>{String(row[column] ?? "-")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="admin-pagination">
        <button type="button">Prev</button>
        <span>Page 1</span>
        <button type="button">Next</button>
      </div>
    </section>
  );
}
