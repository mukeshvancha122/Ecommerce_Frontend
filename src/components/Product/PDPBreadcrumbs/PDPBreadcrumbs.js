import "./PDPBreadcrumbs.css";

export default function PDPBreadcrumbs({ items=[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((it, i) => (
          <li key={i}>
            <a href={it.href}>{it.label}</a>
            {i < items.length - 1 && <span aria-hidden>›</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
