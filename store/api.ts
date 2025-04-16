import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a service using a base URL and expected endpoints
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://13.61.61.180:8080/v1' }),
  tagTypes: ['Auth'], // Define tag types if needed for caching
  endpoints: (builder) => ({}), // Endpoints will be injected here
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
// export const { } = apiSlice; // Will export hooks like useLoginMutation etc. later 