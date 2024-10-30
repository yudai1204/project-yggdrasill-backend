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
import { setMainScreen } from "./setMainScreen";

type Props = {
  data: MessageType;
  ws: WebSocket;
  connectedScreens: StoredType<ScreenType>[];
  connectedDevices: StoredType<DeviceType>[];
  connectedUsers: StoredType<UserType>[];
  qrReaders: StoredType<QrReaderType>[];
  managers: StoredType<ManagerType>[];
  setScreenSize: (width: number, height: number) => void;
  connectingCount: number;
  ip?: string;
};

export const init = (props: Props) => {
  const {
    data,
    connectedScreens,
    connectedDevices,
    connectedUsers,
    qrReaders,
    ws,
    managers,
    setScreenSize,
    connectingCount,
    ip = "",
  } = props;

  if (data.body.type === "screen") {
    data.body.devices = connectedDevices.map((device) => device.data);
    data.body.connectedAt = new Date().getTime();
    data.body.timeOffset.serverTime = new Date().getTime();
    connectedScreens.push({ ws, data: data.body });
    ws.send(
      JSON.stringify({
        head: {
          type: "init",
          index: connectedScreens.length - 1,
        },
        body: data.body,
      })
    );
    if (connectedScreens.length === 1) {
      setMainScreen({
        data,
        connectedScreens,
        connectedDevices,
        ws,
        managers,
        setScreenSize,
      });
    }
  } else if (data.body.type === "device") {
    const newData = {
      ...data.body,
      isConnected: true,
      connectedAt: new Date().getTime(),
      timeOffset: {
        ...data.body.timeOffset,
        serverTime: new Date().getTime(),
      },
    };
    connectedDevices.push({
      ws,
      data: newData,
    });
    ws.send(
      JSON.stringify({
        head: { type: "init", index: connectedDevices.length - 1 },
        body: newData,
      } as MessageType)
    );
    connectedScreens.forEach((screen) => {
      screen.ws.send(
        JSON.stringify({
          head: { type: "devices_update" },
          body: connectedDevices.map((device) => device.data),
        })
      );
    });
  } else if (data.body.type === "manager") {
    const target = managers.find((m) => m.data.uuid === data.body.uuid);
    const newData = {
      ...data.body,
      screens: connectedScreens.map((screen) => screen.data),
      devices: connectedDevices.map((device) => device.data),
    };
    if (target) {
      target.ws = ws;
      target.data = newData;
    } else {
      managers.push({ ws, data: newData });
    }
    getAllData({
      connectedScreens,
      connectedDevices,
      connectedUsers,
      ws,
      connectingCount,
    });
  } else if (data.body.type === "user") {
    const target = connectedUsers.find((u) => u.data.uuid === data.body.uuid);
    const newData = {
      ...data.body,
      connectedAt: new Date().getTime(),
      ip,
      timeOffset: {
        ...data.body.timeOffset,
        serverTime: new Date().getTime(),
      },
    };
    if (target) {
      target.ws = ws;
      target.data = newData;
      target.data.ip = ip;
    } else {
      connectedUsers.push({ ws, data: newData });
    }
    ws.send(
      JSON.stringify({
        head: { type: "init" },
        body: newData,
      })
    );
  } else if (data.body.type === "qrReader") {
    const target = qrReaders.find((qr) => qr.data.uuid === data.body.uuid);
    if (target) {
      target.ws = ws;
    } else {
      qrReaders.push({ ws, data: data.body });
    }
  }

  // manager以外で新規追加があったらmanagerに通知
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
