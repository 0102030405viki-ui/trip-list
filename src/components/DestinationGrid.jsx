import DestinationCard from "./DestinationCard";
import EmptyState from "./EmptyState";

function DestinationGrid({
  destinations,
  onToggleVisited,
  onToggleWishlist,
  onDelete,
}) {
  if (destinations.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="destination-grid">
      {destinations.map((destination) => (
        <DestinationCard
          key={destination.id}
          destination={destination}
          onToggleVisited={onToggleVisited}
          onToggleWishlist={onToggleWishlist}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default DestinationGrid;
