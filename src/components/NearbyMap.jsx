import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import useUserLocation from '../hooks/useUserLocation';
import { fetchNearbyPlaces, searchPlacesByName } from '../lib/fetchNearbyPlaces';
import { motion } from 'framer-motion';

// Fix Leaflet icon bug
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

// Category → glow color
const CAT_COLORS = {
  cafe:          '#d97757',
  coffee:        '#d97757',
  bookshop:      '#6b8e23',
  bookstore:     '#6b8e23',
  'flower shop': '#ff69b4',
  florist:       '#ff69b4',
  'art gallery': '#9370db',
  gallery:       '#9370db',
  museum:        '#9370db',
  library:       '#4fc3f7',
  restaurant:    '#e6b422',
  park:          '#66bb6a',
  bar:           '#ff6b6b',
  pub:           '#ff6b6b',
  bakery:        '#f4a261',
  cinema:        '#e879f9',
  theatre:       '#e879f9',
  hotel:         '#38bdf8',
  place:         '#C8A96E',
};

// Placeholder images per category
const CAT_IMAGES = {
  cafe:          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=60',
  coffee:        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=60',
  bookshop:      'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=400&q=60',
  bookstore:     'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=400&q=60',
  'flower shop': 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400&q=60',
  florist:       'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400&q=60',
  'art gallery': 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=400&q=60',
  gallery:       'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=400&q=60',
  museum:        'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=400&q=60',
  library:       'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=60',
  restaurant:    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=60',
  park:          'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&q=60',
  bar:           'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&q=60',
  pub:           'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&q=60',
  bakery:        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=60',
  place:         'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=60',
};

/* ── fly the map to a coordinate ── */
function FlyTo({ pos }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.flyTo(pos, 17, { duration: 0.8 });
  }, [pos, map]);
  return null;
}

/* ── pulsing user dot ── */
function UserDot({ lat, lng }) {
  return (
    <>
      <CircleMarker center={[lat, lng]} radius={8}
        pathOptions={{ fillColor: '#C8A96E', fillOpacity: 0.9, color: '#C8A96E', weight: 2 }}
      >
        <Popup className="drift-popup">
          <div style={{ padding: '10px 14px', background: 'rgba(13,13,13,0.85)', backdropFilter: 'blur(14px)', borderRadius: 10 }}>
            <span style={{ fontFamily: 'var(--font-heading)', color: '#F0EBE1', letterSpacing: '0.05em', fontSize: '0.85rem' }}>You are here</span>
          </div>
        </Popup>
      </CircleMarker>
      <CircleMarker center={[lat, lng]} radius={18}
        pathOptions={{ fillColor: '#C8A96E', fillOpacity: 0.12, color: '#C8A96E', weight: 1, opacity: 0.3 }}
      />
    </>
  );
}

export default function NearbyMap({ userInterests = ['cafe', 'bookshop', 'restaurant', 'park', 'bakery', 'bar', 'library'] }) {
  const { lat, lng, loading: locLoading, error: locError } = useUserLocation();
  const [places, setPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [flyPos, setFlyPos] = useState(null);
  const [mapQuery, setMapQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  // Fetch default interests on mount
  useEffect(() => {
    if (!locLoading && lat && lng) {
      setPlacesLoading(true);
      fetchNearbyPlaces(lat, lng, userInterests, 3000).then(data => {
        setPlaces(data);
        setPlacesLoading(false);
      });
    }
  }, [lat, lng, locLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Search handler
  const handleSearch = async () => {
    if (!mapQuery.trim() || !lat || !lng) return;
    setSearching(true);
    const results = await searchPlacesByName(lat, lng, mapQuery.trim(), 5000);
    if (results.length > 0) {
      setPlaces(results);
      setFlyPos([results[0].lat, results[0].lon]);
    }
    setSearching(false);
  };

  // Search on enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Reset to default interests
  const handleClear = () => {
    setMapQuery('');
    if (lat && lng) {
      setPlacesLoading(true);
      fetchNearbyPlaces(lat, lng, userInterests, 3000).then(data => {
        setPlaces(data);
        setPlacesLoading(false);
        setFlyPos([lat, lng]);
      });
    }
  };

  /* ─── loading state ─── */
  if (locLoading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100vh', gap: 16,
      }}>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'var(--accent-gold)',
            boxShadow: '0 0 20px var(--accent-gold)',
          }}
        />
        <p style={{
          fontFamily: 'var(--font-heading)', fontStyle: 'italic',
          color: 'var(--text-muted)', fontSize: '0.95rem',
        }}>
          Locating you in the world...
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {/* Search bar at the very top */}
      <div style={{
        padding: '24px 16px 12px',
        background: 'var(--bg-primary)',
        zIndex: 1000, position: 'relative',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(240,235,225,0.05)',
          border: '1px solid rgba(240,235,225,0.1)',
          borderRadius: 'var(--radius-pill)', padding: '10px 16px',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search cafes, places, anything..."
            value={mapQuery}
            onChange={e => setMapQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.85rem',
            }}
          />
          {mapQuery ? (
            <button onClick={handleClear} style={{
              background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          ) : null}
          <button onClick={handleSearch} style={{
            background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', padding: '0 0 0 4px',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {searching && (
          <motion.p
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 8, fontStyle: 'italic' }}
          >
            Searching...
          </motion.p>
        )}
        {locError && (
          <p style={{ textAlign: 'center', color: '#d97757', fontSize: '0.65rem', marginTop: 6, fontStyle: 'italic' }}>
            Using fallback location · {locError}
          </p>
        )}
      </div>

      {/* Full map area */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>

        {placesLoading && (
          <div style={{
            position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
            padding: '6px 16px', borderRadius: 'var(--radius-pill)',
            background: 'rgba(13,13,13,0.7)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(240,235,225,0.08)',
          }}>
            <motion.p
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}
            >
              Discovering places...
            </motion.p>
          </div>
        )}

        <MapContainer
          center={[lat, lng]}
          zoom={15}
          zoomControl={false}
          attributionControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <FlyTo pos={flyPos} />

          {/* user glow dot */}
          <UserDot lat={lat} lng={lng} />

          {/* place glow dots */}
          {places.map(place => {
            const col = CAT_COLORS[place.type] || '#C8A96E';
            const isHovered = hoveredId === place.id;
            return (
              <CircleMarker
                key={place.id}
                center={[place.lat, place.lon]}
                radius={isHovered ? 12 : 7}
                pathOptions={{
                  fillColor: col,
                  fillOpacity: isHovered ? 1 : 0.85,
                  color: col,
                  weight: isHovered ? 3 : 1.5,
                  opacity: isHovered ? 1 : 0.6,
                }}
                eventHandlers={{
                  mouseover: () => setHoveredId(place.id),
                  mouseout:  () => setHoveredId(null),
                }}
              >
                <Popup className="drift-popup">
                  <div style={{
                    width: 220, borderRadius: 12, overflow: 'hidden',
                    background: 'rgba(13,13,13,0.85)', backdropFilter: 'blur(14px)',
                    border: '1px solid rgba(240,235,225,0.08)',
                  }}>
                    <div style={{
                      height: 100,
                      backgroundImage: `url(${CAT_IMAGES[place.type] || CAT_IMAGES.place})`,
                      backgroundSize: 'cover', backgroundPosition: 'center',
                    }} />
                    <div style={{ padding: '10px 14px 14px' }}>
                      <p style={{
                        fontFamily: 'var(--font-heading)', fontSize: '0.9rem',
                        color: '#F0EBE1', marginBottom: 6,
                      }}>
                        {place.name}
                      </p>
                      <span style={{
                        display: 'inline-block', fontSize: '0.6rem', textTransform: 'uppercase',
                        letterSpacing: '0.08em', padding: '3px 8px', borderRadius: 999,
                        background: `${col}22`, color: col, border: `1px solid ${col}44`,
                      }}>
                        {place.type}
                      </span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
