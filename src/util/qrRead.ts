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
    // スマホデータを更新する
    const body = data.body as QrReaderType;
    const target = connectedUsers.find((user) => user.data.uuid === body.value);
    if (!target) {
      console.log("targetが見つかりません");
      return;
    }
    target.data.zoom = body.size;

    target.ws.send(
      JSON.stringify({
        head: { type: "qrRead" },
        body: {
          zoom: body.size,
        },
      })
    );

    connectedScreens.forEach((screen) => {
      screen.ws.send(
        JSON.stringify({
          head: { type: "spPosition" },
          body: {
            zoom: target.data.zoom,
            value: body.value,
          },
        })
      );
    });
  }
};
