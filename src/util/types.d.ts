import type WebSocket from "ws";

export interface DeviceType {
  type: "user" | "device";
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
  uuid: string;
  size: {
    width: number;
    height: number;
  };
  devices: DeviceType[];
}

export interface MessageType {
  head: {
    type: string;
    index?: number;
  };
  body: ScreenType | DeviceType;
}

export interface StoredType<T> {
  ws: WebSocket;
  data: T;
}
