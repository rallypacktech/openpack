import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			// Cache data for 5 minutes before considering it stale — avoids redundant refetches
			staleTime: 5 * 60 * 1000,
			// Keep unused data in memory for 10 minutes before garbage collecting
			gcTime: 10 * 60 * 1000,
		},
	},
});