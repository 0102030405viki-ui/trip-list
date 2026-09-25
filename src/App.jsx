import { useEffect, useState } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import DestinationGrid from "./components/DestinationGrid";
import Filters from "./components/Filters";
import "./App.css";

const COUNTRY_API = "https://countries.dev/countries";

function App() {
  const [destinations, setDestinations] = useState(() => {
    const savedDestinations = localStorage.getItem("tripList");

    return savedDestinations ? JSON.parse(savedDestinations) : [];
  });

  const [countries, setCountries] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [loadingCountries, setLoadingCountries] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get all countries when the app starts
  useEffect(() => {
    async function getCountries() {
      try {
        const response = await fetch(COUNTRY_API);

        if (!response.ok) {
          throw new Error("Could not load countries");
        }

        const data = await response.json();

        setCountries(data.data || data.countries || data);
      } catch (error) {
        console.error(error);

        setError("We couldn't load the country database.");
      } finally {
        setLoadingCountries(false);
      }
    }

    getCountries();
  }, []);

  // Save destinations
  useEffect(() => {
    localStorage.setItem("tripList", JSON.stringify(destinations));
  }, [destinations]);

  async function addDestination(countryName) {
    setLoading(true);
    setError("");

    try {
      // Find the country from our country list
      const matchingCountry = countries.find((country) => {
        const name = country.name?.common || country.name || "";

        return name.toLowerCase() === countryName.toLowerCase();
      });

      if (!matchingCountry) {
        throw new Error("Country not found");
      }

      const country = matchingCountry;

      const countryDisplayName = country.name?.common || country.name;

      // Check duplicates
      const alreadyExists = destinations.some(
        (destination) =>
          destination.name.toLowerCase() === countryDisplayName.toLowerCase(),
      );

      if (alreadyExists) {
        setError("This destination is already on your list.");
        return;
      }

      // Get Unsplash photo
      let image = "";
      let photoAuthor = "";
      let photoAuthorUrl = "";

      const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

      if (accessKey) {
        const photoResponse = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            `${countryDisplayName} travel`,
          )}&per_page=10&orientation=landscape`,
          {
            headers: {
              Authorization: `Client-ID ${accessKey}`,
            },
          },
        );

        if (photoResponse.ok) {
          const photoData = await photoResponse.json();

          const photo = photoData.results?.[0];

          if (photo) {
            image = photo.urls.regular;

            photoAuthor = photo.user.name;

            photoAuthorUrl = photo.user.links.html;
          }
        }
      }

      const newDestination = {
        id: crypto.randomUUID(),

        name: countryDisplayName,

        officialName: country.name?.official || countryDisplayName,

        capital: country.capital || "No capital",

        region: country.region || "Unknown",

        subregion: country.subregion || "Unknown",

        population: country.population || 0,

        flag: country.flags?.svg || country.flags?.png || "",

        image,

        photoAuthor,

        photoAuthorUrl,

        visited: false,
        wishlist: true,
      };

      setDestinations((prev) => [...prev, newDestination]);

      setSearch("");
    } catch (error) {
      console.error(error);

      setError("We couldn't find that country. Try another name.");
    } finally {
      setLoading(false);
    }
  }

  function toggleWishlist(id) {
    setDestinations((prev) =>
      prev.map((destination) =>
        destination.id === id
          ? {
              ...destination,
              wishlist: !destination.wishlist,
            }
          : destination,
      ),
    );
  }

  function toggleVisited(id) {
    setDestinations((prev) =>
      prev.map((destination) =>
        destination.id === id
          ? {
              ...destination,
              visited: !destination.visited,
            }
          : destination,
      ),
    );
  }

  function deleteDestination(id) {
    setDestinations((prev) =>
      prev.filter((destination) => destination.id !== id),
    );
  }

  const filteredDestinations = destinations.filter((destination) => {
    const matchesSearch = destination.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "visited" && destination.visited) ||
      (filter === "wishlist" && !destination.visited);

    return matchesSearch && matchesFilter;
  });

  const visitedCount = destinations.filter(
    (destination) => destination.visited,
  ).length;

  const wishlistCount = destinations.filter(
    (destination) => destination.wishlist,
  ).length;

  return (
    <div className="app">
      <Header />

      <main>
        <section className="hero">
          <div className="hero-badge">
            <span>✈</span>
            MY TRAVEL JOURNEY
          </div>

          <h1>
            Where will you go
            <em> next?</em>
          </h1>

          <p className="hero-description">
            Create your personal travel bucket list, discover new destinations
            and keep track of the places you've explored.
          </p>

          <SearchBar
            value={search}
            onChange={setSearch}
            onAdd={addDestination}
            loading={loading || loadingCountries}
          />

          {error && <p className="error-message">{error}</p>}
        </section>

        <section className="stats">
          <div className="stat">
            <span className="stat-number">{destinations.length}</span>

            <span className="stat-label">Total destinations</span>
          </div>

          <div className="stat">
            <span className="stat-number">{wishlistCount}</span>

            <span className="stat-label">On wishlist</span>
          </div>

          <div className="stat">
            <span className="stat-number">{visitedCount}</span>

            <span className="stat-label">Places visited</span>
          </div>
        </section>

        <section className="bucket-section" id="bucket">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">YOUR COLLECTION</p>

              <h2>My bucket list</h2>

              <p className="destination-count">
                {destinations.length === 1
                  ? "1 destination"
                  : `${destinations.length} destinations`}
              </p>
            </div>

            <Filters filter={filter} setFilter={setFilter} />
          </div>

          <DestinationGrid
            destinations={filteredDestinations}
            onToggleVisited={toggleVisited}
            onToggleWishlist={toggleWishlist}
            onDelete={deleteDestination}
          />
        </section>
      </main>

      <footer>
        <p>Wanderlist · Built with React</p>
      </footer>
    </div>
  );
}

export default App;
