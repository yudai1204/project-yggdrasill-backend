import type WebSocket from "ws";
import type {
  MessageType,
  StoredType,
  ScreenType,
  DeviceType,
  UserType,
  ManagerType,
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

export const userUpdate = (props: Props) => {
  const {
    data,
    connectedScreens,
    connectedDevices,
    connectedUsers,
    ws,
    managers,
    connectingCount,
  } = props;

  const target = connectedUsers.find(
    (user) => user.data.uuid === data.body.uuid
  );
  if (data.body.type === "user" && target) {
    target.data = data.body;
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
