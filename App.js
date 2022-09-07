import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Button, Alert, Platform } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    };
  },
});
/* //Either use the following or the below configurePushNotifications function in useEffect
// For ios grant permission to notifications
const allowsNotificationsAsync = async () => {
  const settings = await Notifications.getPermissionsAsync();
  return (
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
};
// for ios request permission to notifications
const requestPermissionsAsync = async () => {
  return await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncements: true,
    },
  });
}; */

export default function App() {
  // for push notifications
  // check permission status and request permission if not granted
  useEffect(() => {
    // to make an async function in useEffect
    const configurePushNotifications = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;
      if (status !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        Alert.alert("Permission requried", "No permission to notifications");
        return;
      }
      const pushTokenData = await Notifications.getExpoPushTokenAsync();
      // this is device token. So in real scenario save it to database
      // and use it to send push notification to targeted user phone
      console.log(pushTokenData);
      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    };
    configurePushNotifications();
  }, []);

  useEffect(() => {
    // to make it possible to recive notifications
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received: ");
      }
    );
    //handle some events when user click on push notification on the phone screen
    const subscription2 = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("response received: ");
      }
    );
    // clean up subscriptions
    return () => {
      subscription.remove();
      subscription2.remove();
    };
  }, []);

  const scheduleNotificationHandler = async () => {
    // check notification permission onPress or use the above async configurePushNotifications function  approach in useEffect
    /*  // for ios check if permission is granted
    const hasPushNotificationPermissionGranted =
      await allowsNotificationsAsync();
    // for ios request notification permission if not granted
    if (!hasPushNotificationPermissionGranted) {
      await requestPermissionsAsync();
    } */

    Notifications.scheduleNotificationAsync({
      content: {
        title: "Local Notification",
        body: "This is a test LOCAL notification",
        data: { username: "Alper" },
      },
      trigger: {
        seconds: 3,
      },
    });
  };
  // send push notification via Expo HTTP/2 API
  const sendPushNotificationHandler = () => {
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // for demo purpose send notification to Emulator.
        // in real scenario get this token from database saved before.
        to: "ExponentPushToken[YOUR_TOKEN]", //write your own token here!!!
        title: "Push Notification",
        body: "This is a test PUSH notification",
      }),
    });
  };
  return (
    <View style={styles.container}>
      <View style={styles.button}>
        <Button
          title="Send Push Notification"
          onPress={sendPushNotificationHandler}
        />
      </View>
      <View>
        <Button
          title="Schedule Notification"
          onPress={scheduleNotificationHandler}
        />
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    marginVertical: 10,
  },
});
