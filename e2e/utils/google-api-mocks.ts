import { Page, Route } from '@playwright/test';

/**
 * Mock responses for Google Maps Geocoding API
 */
export const mockGeocodeResponse = {
  OK: (address: string, lat: number = 35.9940, lng: number = -78.8986) => ({
    status: 'OK',
    results: [
      {
        formatted_address: address,
        geometry: {
          location: {
            lat,
            lng,
          },
        },
      },
    ],
  }),
  ZERO_RESULTS: {
    status: 'ZERO_RESULTS',
    results: [],
  },
  ERROR: {
    status: 'REQUEST_DENIED',
    error_message: 'The provided API key is invalid.',
    results: [],
  },
};

/**
 * Mock responses for Google Places API (Place Details)
 */
export const mockPlaceDetailsResponse = {
  OK: (placeId: string, name: string = 'Test Place', address: string = '123 Test St, Durham, NC 27701') => ({
    status: 'OK',
    result: {
      place_id: placeId,
      name,
      formatted_address: address,
      geometry: {
        location: {
          lat: 35.9940,
          lng: -78.8986,
        },
      },
      website: 'https://example.com',
      formatted_phone_number: '(919) 555-1234',
      rating: 4.5,
      types: ['restaurant', 'food', 'point_of_interest', 'establishment'],
    },
  }),
  NOT_FOUND: {
    status: 'NOT_FOUND',
    result: null,
  },
  ERROR: {
    status: 'REQUEST_DENIED',
    error_message: 'The provided API key is invalid.',
    result: null,
  },
};

/**
 * Setup Google API mocks for a Playwright page
 */
export async function setupGoogleApiMocks(page: Page) {
  // Mock Google Geocoding API
  await page.route('https://maps.googleapis.com/maps/api/geocode/json**', async (route: Route) => {
    const url = new URL(route.request().url());
    const address = url.searchParams.get('address');
    const latlng = url.searchParams.get('latlng');

    if (address) {
      // Forward geocoding
      const response = mockGeocodeResponse.OK(address);
      await route.fulfill({ json: response });
    } else if (latlng) {
      // Reverse geocoding
      const [lat, lng] = latlng.split(',').map(Number);
      const response = mockGeocodeResponse.OK(`Mock Address at ${lat}, ${lng}`, lat, lng);
      await route.fulfill({ json: response });
    } else {
      await route.fulfill({ json: mockGeocodeResponse.ERROR });
    }
  });

  // Mock Google Places API (Place Details)
  await page.route('https://maps.googleapis.com/maps/api/place/details/json**', async (route: Route) => {
    const url = new URL(route.request().url());
    const placeId = url.searchParams.get('place_id');

    if (placeId) {
      const response = mockPlaceDetailsResponse.OK(placeId);
      await route.fulfill({ json: response });
    } else {
      await route.fulfill({ json: mockPlaceDetailsResponse.ERROR });
    }
  });

  // Mock Google Places API (Text Search)
  await page.route('https://maps.googleapis.com/maps/api/place/textsearch/json**', async (route: Route) => {
    const url = new URL(route.request().url());
    const query = url.searchParams.get('query');

    if (query) {
      const response = {
        status: 'OK',
        results: [
          {
            place_id: `mock-place-id-${query.replace(/\s+/g, '-').toLowerCase()}`,
            name: query,
            formatted_address: `Mock Address for ${query}`,
            geometry: {
              location: {
                lat: 35.9940,
                lng: -78.8986,
              },
            },
          },
        ],
      };
      await route.fulfill({ json: response });
    } else {
      await route.fulfill({ json: { status: 'INVALID_REQUEST', results: [] } });
    }
  });

  // Mock Google Maps JavaScript API script loading
  await page.route('https://maps.googleapis.com/maps/api/js**', async (route: Route) => {
    // Return a minimal mock script that provides the Google Maps API
    const mockScript = `
      window.google = window.google || {};
      window.google.maps = window.google.maps || {};
      window.google.maps.Map = class MockMap {
        constructor(container, options) {
          this.container = container;
          this.options = options;
        }
        setCenter(center) { this.center = center; }
        setZoom(zoom) { this.zoom = zoom; }
      };
      window.google.maps.Marker = class MockMarker {
        constructor(options) {
          this.position = options.position;
          this.map = options.map;
          this.title = options.title;
        }
        setMap(map) { this.map = map; }
      };
      window.google.maps.LatLng = function(lat, lng) {
        this.lat = lat;
        this.lng = lng;
      };
      window.google.maps.event = {
        addListener: () => {},
        removeListener: () => {},
      };
      if (window.googleMapsLoaded) {
        window.googleMapsLoaded();
      }
    `;
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: mockScript,
    });
  });
}

/**
 * Mock a specific geocode response (for testing error cases)
 */
export async function mockGeocodeError(page: Page, errorType: 'ZERO_RESULTS' | 'ERROR' = 'ERROR') {
  await page.route('https://maps.googleapis.com/maps/api/geocode/json**', async (route: Route) => {
    const response = errorType === 'ZERO_RESULTS' 
      ? mockGeocodeResponse.ZERO_RESULTS 
      : mockGeocodeResponse.ERROR;
    await route.fulfill({ json: response });
  });
}

/**
 * Mock a specific place details response (for testing error cases)
 */
export async function mockPlaceDetailsError(page: Page, errorType: 'NOT_FOUND' | 'ERROR' = 'ERROR') {
  await page.route('https://maps.googleapis.com/maps/api/place/details/json**', async (route: Route) => {
    const response = errorType === 'NOT_FOUND'
      ? mockPlaceDetailsResponse.NOT_FOUND
      : mockPlaceDetailsResponse.ERROR;
    await route.fulfill({ json: response });
  });
}
