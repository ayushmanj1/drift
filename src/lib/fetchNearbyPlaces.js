const INTEREST_MAP = {
  'cafe': 'amenity=cafe',
  'coffee': 'amenity=cafe',
  'bookshop': 'shop=books',
  'bookstore': 'shop=books',
  'flower shop': 'shop=florist',
  'florist': 'shop=florist',
  'library': 'amenity=library',
  'art gallery': 'tourism=gallery',
  'gallery': 'tourism=gallery',
  'museum': 'tourism=museum',
  'restaurant': 'amenity=restaurant',
  'park': 'leisure=park',
  'bar': 'amenity=bar',
  'bakery': 'shop=bakery',
  'pub': 'amenity=pub',
  'theatre': 'amenity=theatre',
  'cinema': 'amenity=cinema',
  'pharmacy': 'amenity=pharmacy',
  'hotel': 'tourism=hotel',
  'fast food': 'amenity=fast_food',
  'ice cream': 'amenity=ice_cream',
  'market': 'shop=supermarket',
  'clothing': 'shop=clothes',
  'gym': 'leisure=fitness_centre',
  'hospital': 'amenity=hospital',
  'school': 'amenity=school',
  'temple': 'amenity=place_of_worship',
  'church': 'amenity=place_of_worship',
  'mosque': 'amenity=place_of_worship',
  'atm': 'amenity=atm',
  'bank': 'amenity=bank',
  'petrol': 'amenity=fuel',
  'gas station': 'amenity=fuel',
};

export async function fetchNearbyPlaces(lat, lng, interests, radius = 3000) {
  if (!lat || !lng || !interests || interests.length === 0) return [];

  // Build the nodes list based on mapped interests
  const nodes = interests
    .map(interest => INTEREST_MAP[interest.toLowerCase()])
    .filter(Boolean)
    .map(tag => {
      const [key, val] = tag.split('=');
      return `node["${key}"="${val}"](around:${radius},${lat},${lng});`;
    })
    .join('\n  ');

  if (!nodes) return [];

  const query = `
[out:json][timeout:15];
(
  ${nodes}
);
out body 80;
  `.trim();

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });

    if (!response.ok) {
      throw new Error('Overpass API error');
    }

    const data = await response.json();
    return data.elements.map(el => {
      // Find the tag that matches one of our interests to use as 'type'
      let type = 'place';
      for (const [key, val] of Object.entries(el.tags || {})) {
        const tagStr = `${key}=${val}`;
        const matchingInterest = Object.keys(INTEREST_MAP).find(
          i => INTEREST_MAP[i] === tagStr
        );
        if (matchingInterest) {
          type = matchingInterest;
          break;
        }
      }

      return {
        id: el.id,
        name: el.tags?.name || 'Unnamed',
        lat: el.lat,
        lon: el.lon,
        type: type
      };
    });
  } catch (err) {
    console.error('Failed to fetch nearby places:', err);
    return [];
  }
}

// Search by name using Nominatim (much better for specific place names)
export async function searchPlacesByName(lat, lng, name, radius = 5000) {
  if (!lat || !lng || !name) return [];

  // Convert radius to a rough bounding box for viewbox biasing
  const delta = radius / 111320; // rough degrees
  const viewbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;

  const params = new URLSearchParams({
    q: name,
    format: 'json',
    limit: '20',
    viewbox: viewbox,
    bounded: '0', // prefer but don't restrict to viewbox
    addressdetails: '1',
  });

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DriftApp/1.0',
        },
      }
    );

    if (!response.ok) throw new Error('Nominatim API error');

    const data = await response.json();
    return data
      .filter(el => el.lat && el.lon)
      .map(el => {
        // Determine type from class/type
        let type = 'place';
        if (el.type === 'cafe' || el.class === 'amenity' && el.type === 'cafe') type = 'cafe';
        else if (el.type === 'restaurant') type = 'restaurant';
        else if (el.type === 'bar' || el.type === 'pub') type = 'bar';
        else if (el.type === 'bakery') type = 'bakery';
        else if (el.type === 'library') type = 'library';
        else if (el.type === 'museum' || el.type === 'gallery') type = 'museum';
        else if (el.type === 'park' || el.type === 'garden') type = 'park';
        else if (el.type === 'cinema' || el.type === 'theatre') type = 'cinema';
        else if (el.type === 'hotel') type = 'hotel';
        else if (el.type === 'books') type = 'bookshop';
        else if (el.type === 'florist') type = 'florist';
        else if (el.class === 'amenity') type = el.type || 'place';
        else if (el.class === 'shop') type = el.type || 'place';
        else if (el.class === 'tourism') type = el.type || 'place';

        return {
          id: el.osm_id || el.place_id,
          name: el.display_name?.split(',')[0] || 'Unnamed',
          lat: parseFloat(el.lat),
          lon: parseFloat(el.lon),
          type,
        };
      });
  } catch (err) {
    console.error('Failed to search places:', err);
    return [];
  }
}
