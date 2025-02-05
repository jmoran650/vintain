// reactQuerySetup.ts
import NetInfo from '@react-native-community/netinfo';
import { onlineManager, focusManager } from '@tanstack/react-query';
import { AppState, Platform, AppStateStatus } from 'react-native';
// Option 1: using NetInfo from '@react-native-community/netinfo'
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

// Option 2: if you prefer expo-network, you could do:
// import * as Network from 'expo-network';
// onlineManager.setEventListener((setOnline) => {
//   return Network.addNetworkStateListener((state) => {
//     setOnline(state.isConnected);
//   });
// });

// Use AppState to update React Query focus (refetch on app focus)
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

const subscription = AppState.addEventListener('change', onAppStateChange);
// (You may also want to remove the listener on unmount in a real app.)