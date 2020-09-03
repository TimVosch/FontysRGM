import { registerMessage } from "../../decorators/message.decorator";

@registerMessage()
export class ServerSendTransport {
  id: string;
  iceParameters: any;
  iceCandidates: any[];
  dtlsParameters: any;
  sctpParameters: any;
}
