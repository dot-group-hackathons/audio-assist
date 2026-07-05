import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, 
    shouldShowList: true
  }),
});

export function useNotifications() {
  useEffect(() => {
    (async () => {
      await Notifications.requestPermissionsAsync();

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('alerts', {
          name: 'Sound Alerts',
          importance: Notifications.AndroidImportance.HIGH,
          enableVibrate: false
        });
      }
    })();
  }, []);
}