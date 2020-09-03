import { registerMessage } from "../../decorators/message.decorator";

@registerMessage()
export class ServerRequestTransport {
  rtpCapabilties: any;
  id: string;
  iceParameters: any;
  iceCandidates: any[];
  dtlsParameters: any;
  sctpParameters: any;
}