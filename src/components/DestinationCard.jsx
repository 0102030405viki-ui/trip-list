function DestinationCard({
  destination,
  onToggleVisited,
  onToggleWishlist,
  onDelete,
}) {
  return (
    <article className="destination-card">
      <div className="flag-container">
        {destination.image ? (
          <img
            className="destination-image"
            src={destination.image}
            alt={`${destination.name} travel destination`}
          />
        ) : (
          <div className="image-placeholder">
            <span>✈</span>
            <p>{destination.name}</p>
          </div>
        )}

        {destination.flag && (
          <img
            className="country-flag"
            src={destination.flag}
            alt={`${destination.name} flag`}
          />
        )}

        {/* WISHLIST BUTTON */}
        <button
          className={destination.wishlist ? "status wishlist-active" : "status"}
          onClick={() => onToggleWishlist(destination.id)}
        >
          {destination.wishlist ? "♥ Wishlist" : "♡ Wishlist"}
        </button>
      </div>

      <div className="card-content">
        <div className="card-heading">
          <div>
            <h3>{destination.name}</h3>

            <p className="capital">{destination.capital}</p>
          </div>

          <span className="region-tag">{destination.region}</span>
        </div>

        <div className="details">
          <div className="detail">
            <span>REGION</span>

            <strong>{destination.subregion}</strong>
          </div>

          <div className="detail">
            <span>POPULATION</span>

            <strong>
              {destination.population
                ? destination.population.toLocaleString()
                : "Unknown"}
            </strong>
          </div>
        </div>

        <div className="card-actions">
          <button
            className="visited-button"
            onClick={() => onToggleVisited(destination.id)}
          >
            {destination.visited ? "Move to wishlist" : "Mark as visited"}
          </button>

          <button
            className="delete-button"
            onClick={() => onDelete(destination.id)}
            aria-label={`Delete ${destination.name}`}
          >
            ×
          </button>
        </div>
      </div>
    </article>
  );
}

export default DestinationCard;
