import { registerMessage } from "../../decorators/message.decorator";

@registerMessage()
export class ServerRecvTransport {
  id: string;
  iceParameters: any;
  iceCandidates: any[];
  dtlsParameters: any;
  sctpParameters: any;
}
