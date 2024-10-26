import type WebSocket from "ws";

export type Mode = "Calibration" | "Operation";

export interface DeviceType {
  type: "device";
  connectedAt: number;
  uuid: string;
  size: {
    width: number;
    height: number;
  };
  rotation: number;
  position: {
    x: number;
    y: number;
  };
  zoom: number;
  isConnected: boolean;
}

export interface ScreenType {
  type: "screen";
  connectedAt: number;
  uuid: string;
  size: {
    width: number;
    height: number;
  };
  devices: DeviceType[];
}

export interface ManagerType {
  type: "manager";
  uuid: string;
  screens: ScreenType[];
  devices: DeviceType[];
}

export interface UserType {
  type: "user";
  uuid: string;
  connectedAt: number;
  size: {
    width: number;
    height: number;
  };
  rotation: number;
  position: {
    x: number;
    y: number;
  };
  zoom: number;
}

export interface MessageType {
  head: {
    type: string;
    index?: number;
  };
  body: ScreenType | DeviceType | ManagerType;
}

export interface StoredType<T> {
  ws: WebSocket;
  data: T;
}
