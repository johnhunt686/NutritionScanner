import { useNetworkState } from 'expo-network';

const networkState = useNetworkState();

export const useIsOnline = () => {
  return networkState.isInternetReachable;
};
