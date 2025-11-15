import { useCallback } from "react";
import { PERMISSIONS, RESULTS, request } from "react-native-permissions";
import { isAndroid, isIos } from "../utils/helpers";

export type TUsePermissionsReturnType = {
  isError?: boolean;
  type: (typeof RESULTS)[keyof typeof RESULTS];
  errorMessage?: string;
};

export enum EPermissionTypes {
  CAMERA = "camera",
}

export const usePermissions = (typeOfPermission: EPermissionTypes) => {
  const getPermission = useCallback(() => {
    if (
      !typeOfPermission ||
      !Object.values(EPermissionTypes).includes(typeOfPermission)
    ) {
      throw new Error("Unsupported Type of permission.");
    }

    if (isIos) {
      switch (typeOfPermission) {
        case EPermissionTypes.CAMERA:
          return PERMISSIONS.IOS.CAMERA;
      }
    }

    if (isAndroid) {
      switch (typeOfPermission) {
        case EPermissionTypes.CAMERA:
          return PERMISSIONS.ANDROID.CAMERA;
      }
    }

    throw new Error("Unsupported Operating System.");
  }, [typeOfPermission]);

  const askPermissions = useCallback(async (): Promise<TUsePermissionsReturnType> => {
    try {
      const result = await request(getPermission());

      switch (result) {
        case RESULTS.UNAVAILABLE:
          return { type: RESULTS.UNAVAILABLE };
        case RESULTS.DENIED:
          return { type: RESULTS.DENIED };
        case RESULTS.GRANTED:
          return { type: RESULTS.GRANTED };
        case RESULTS.BLOCKED:
          return { type: RESULTS.BLOCKED };
        case RESULTS.LIMITED:
          return { type: RESULTS.LIMITED };
      }
    } catch (e: any) {
      return {
        isError: true,
        type: RESULTS.DENIED,
        errorMessage:
          e?.data?.message ||
          e?.message ||
          "Something went wrong while asking for permissions.",
      };
    }
  }, [getPermission]);

  return { askPermissions };
};
