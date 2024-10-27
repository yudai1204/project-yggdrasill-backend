import type {
  DeviceType,
  MessageType,
  ScreenType,
  StoredType,
  UserType,
  QrReaderType,
} from "./types";

type Props = {
  data: MessageType;
  connectedScreens: StoredType<ScreenType>[];
  connectedDevices: StoredType<DeviceType>[];
  connectedUsers: StoredType<UserType>[];
};
export const qrRead = (props: Props) => {
  const { data, connectedScreens, connectedDevices, connectedUsers } = props;
  console.log("QRコード読み取り: ", data.body.type);
  if (data.body.type === "qrReader") {
    const newBody = data.body as QrReaderType;
    connectedScreens.forEach((screen) => {
      screen.ws.send(
        JSON.stringify({
          head: { type: "spPosition" },
          body: {
            size: newBody.size,
            value: newBody.value,
          },
        })
      );
    });
  }
};
