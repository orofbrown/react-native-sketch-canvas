// @flow
import { PermissionsAndroid, Platform } from "react-native";

export const requestPermissions = (
  permissionDialogTitle: string,
  permissionDialogMessage: string
): Promise<boolean> =>
  PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    {
      title: permissionDialogTitle,
      message: permissionDialogMessage,
    }
  )
    .then((granted) => granted === PermissionsAndroid.RESULTS.GRANTED)
    .catch((err) => {
      console.error("Error requesting file permissions: ", err);
    });
