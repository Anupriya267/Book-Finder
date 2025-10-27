import React, { useEffect, useState, useRef } from "react";

const coverUrl = (cover_i, size = "M") =>
  cover_i ? `https://covers.openlibrary.org/b/id/${cover_i}-${size}.jpg` : null;

export default function App() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState([]);
  const [numFound, setNumFound] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setNumFound(0);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchResults(query, page);
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, page]);

  async function fetchResults(q, p = 1) {
    try {
      setLoading(true);
      const encoded = encodeURIComponent(q);
      const url = `https://openlibrary.org/search.json?title=${encoded}&page=${p}&limit=10`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Network error: ${res.status}`);
      const data = await res.json();
      setResults(data.docs || []);
      setNumFound(data.numFound || 0);
    } catch (err) {
      setError(err.message || "Unknown error");
      setResults([]);
      setNumFound(0);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(numFound / 100) || 1;

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>Book Finder</h1>
        <p style={styles.subtitle}>
          Search books using Open Library — beginner-friendly React app
        </p>
      </header>

      <main style={styles.main}>
        <div style={styles.searchRow}>
          <input
            style={styles.input}
            placeholder="Search by book title (e.g. 'Pride and Prejudice')"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
          <div style={styles.smallHelp}>
            <strong>Tip:</strong> Try "harry potter", "tolkien", or "machine learning".
          </div>
        </div>

        <div style={styles.controlRow}>
          <div>
            <small>{loading ? "Searching..." : `${numFound} results`}</small>
          </div>
          <div>
            <button
              style={{ ...styles.btn, marginRight: 8 }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              Prev
            </button>
            <span style={{ marginRight: 8 }}>Page {page}</span>
            <button
              style={styles.btn}
              onClick={() => setPage((p) => p + 1)}
              disabled={loading}
            >
              Next
            </button>
          </div>
        </div>

        {error && <div style={styles.error}>Error: {error}</div>}

        {!loading && results.length === 0 && query.trim() !== "" && (
          <div style={styles.empty}>No results found. Try a different title.</div>
        )}

        <div style={styles.grid}>
          {results.map((book) => (
            <div key={book.key} style={styles.card}>
              <div style={styles.coverWrapper}>
                {book.cover_i ? (
                  <img src={coverUrl(book.cover_i)} alt={book.title} style={styles.cover} />
                ) : (
                  <div style={styles.noCover}>No cover</div>
                )}
              </div>
              <div style={styles.cardBody}>
                <div style={styles.bookTitle}>{book.title}</div>
                <div style={styles.bookMeta}>
                  {(book.author_name || []).slice(0, 2).join(", ")}
                </div>
                <div style={styles.bookMetaSmall}>
                  First published: {book.first_publish_year || "-"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && <div style={styles.loading}>Loading...</div>}
      </main>
    </div>
  );
}

const styles = {
  app: {
    fontFamily:
      "Inter, Roboto, system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial",
    maxWidth: 960,
    margin: "18px auto",
    padding: 18,
  },
  header: { marginBottom: 14 },
  title: { margin: 0, fontSize: 28 },
  subtitle: { margin: 0, color: "#555", fontSize: 13 },
  main: {
    background: "#fff",
    padding: 16,
    borderRadius: 10,
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  },
  searchRow: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 },
  input: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 16,
    width: "100%",
  },
  smallHelp: { color: "#666", fontSize: 12 },
  controlRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  btn: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#f7f7f8",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 12,
  },
  card: {
    cursor: "pointer",
    borderRadius: 10,
    overflow: "hidden",
    border: "1px solid #eee",
    display: "flex",
    flexDirection: "column",
    background: "#fff",
  },
  coverWrapper: {
    height: 220,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fafafa",
  },
  cover: { maxHeight: "100%", maxWidth: "100%", objectFit: "contain" },
  noCover: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#888",
    fontSize: 13,
    padding: 12,
  },
  cardBody: { padding: 10 },
  bookTitle: { fontWeight: 600 },
  bookMeta: { color: "#666", fontSize: 13 },
  bookMetaSmall: { color: "#999", fontSize: 12 },
  loading: { textAlign: "center", padding: 12, color: "#666" },
  error: { padding: 12, background: "#fee", color: "#900", borderRadius: 8 },
  empty: { padding: 12, color: "#666" },
};
