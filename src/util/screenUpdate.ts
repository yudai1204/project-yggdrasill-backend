import type WebSocket from "ws";
import type {
  MessageType,
  StoredType,
  ScreenType,
  DeviceType,
  ManagerType,
  UserType,
} from "./types";
import { getAllData } from "./getAllData";

type Props = {
  data: MessageType;
  connectedScreens: StoredType<ScreenType>[];
  connectedDevices: StoredType<DeviceType>[];
  connectedUsers: StoredType<UserType>[];
  managers: StoredType<ManagerType>[];
  ws: WebSocket;
  connectingCount: number;
};

export const screenUpdate = (props: Props) => {
  const {
    data,
    connectedScreens,
    managers,
    connectedDevices,
    connectedUsers,
    ws,
    connectingCount,
  } = props;
  if (data.body.type === "screen") {
    const newDataBody = data.body as ScreenType;
    connectedScreens.forEach((screen) => {
      if (screen.data.uuid === newDataBody.uuid) {
        screen.data = newDataBody;
      }
    });
  }

  // manager以外で更新があったらmanagerに通知
  if (data.body.type !== "manager") {
    managers.forEach((manager) => {
      getAllData({
        connectedScreens,
        connectedDevices,
        connectedUsers,
        ws: manager.ws,
        connectingCount,
      });
    });
  }
};
