function SearchBar({ value, onChange, onAdd, loading }) {
  function handleSubmit(event) {
    event.preventDefault();

    if (!value.trim() || loading) {
      return;
    }

    onAdd(value.trim());
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <span className="search-icon">⌕</span>

        <input
          type="text"
          placeholder="Search for a country..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner"></span>
            Searching...
          </>
        ) : (
          <>+ Add destination</>
        )}
      </button>
    </form>
  );
}

export default SearchBar;
