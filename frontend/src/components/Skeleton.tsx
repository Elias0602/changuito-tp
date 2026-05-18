interface Props {
  count?: number;
}

export function ProductCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-line" style={{ width: "85%" }} />
        <div className="skeleton skeleton-line" style={{ width: "60%" }} />
        <div className="skeleton skeleton-line" style={{ height: 22, width: "50%", marginTop: 10 }} />
        <div className="skeleton skeleton-line" style={{ height: 34, marginTop: 12 }} />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 10 }: Props) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
