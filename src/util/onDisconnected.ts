import type WebSocket from "ws";
import type {
  MessageType,
  StoredType,
  ScreenType,
  DeviceType,
  ManagerType,
  UserType,
  QrReaderType,
} from "./types";
import { getAllData } from "./getAllData";

type Props = {
  ws: WebSocket;
  connectedScreens: StoredType<ScreenType>[];
  connectedDevices: StoredType<DeviceType>[];
  connectedUsers: StoredType<UserType>[];
  managers: StoredType<ManagerType>[];
  qrReaders: StoredType<QrReaderType>[];
};

export const onDisconnected = (props: Props) => {
  const {
    ws,
    connectedScreens,
    connectedDevices,
    connectedUsers,
    managers,
    qrReaders,
  } = props;

  qrReaders.forEach((qrReader) => {
    if (qrReader.ws === ws) {
      qrReaders.splice(qrReaders.indexOf(qrReader), 1);
    }
  });

  managers.forEach((manager) => {
    if (manager.ws === ws) {
      managers.splice(managers.indexOf(manager), 1);
    }
    return;
  });

  connectedUsers.forEach((user) => {
    if (user.ws === ws) {
      connectedUsers.splice(connectedUsers.indexOf(user), 1);
    }
  });

  connectedDevices.forEach((device) => {
    if (device.ws === ws) {
      device.data.isConnected = false;
      connectedScreens.forEach((screen) => {
        screen.ws.send(
          JSON.stringify({
            head: {
              type: "devices_update",
              index: connectedScreens.indexOf(screen),
            },
            body: connectedDevices.map((device) => device.data),
          })
        );
      });
    }
  });
  connectedScreens.forEach((screen) => {
    if (screen.ws === ws) {
      connectedScreens.splice(connectedScreens.indexOf(screen), 1);
      console.log("connectedScreens: ", connectedScreens.length);
      connectedScreens.forEach((s) => {
        s.ws.send(
          JSON.stringify({
            head: {
              type: "devices_update",
              index: connectedScreens.indexOf(s),
            },
            body: connectedDevices.map((device) => device.data),
          })
        );
      });
    }
  });

  // managerに通知
  managers.forEach((manager) => {
    getAllData({
      connectedScreens,
      connectedDevices,
      connectedUsers,
      ws: manager.ws,
    });
  });
};
