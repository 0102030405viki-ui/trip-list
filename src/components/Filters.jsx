function Filters({ filter, setFilter }) {
  return (
    <div className="filters">
      <button
        className={filter === "all" ? "filter-button active" : "filter-button"}
        onClick={() => setFilter("all")}
      >
        All
      </button>

      <button
        className={
          filter === "wishlist" ? "filter-button active" : "filter-button"
        }
        onClick={() => setFilter("wishlist")}
      >
        Wishlist
      </button>

      <button
        className={
          filter === "visited" ? "filter-button active" : "filter-button"
        }
        onClick={() => setFilter("visited")}
      >
        Visited
      </button>
    </div>
  );
}

export default Filters;
