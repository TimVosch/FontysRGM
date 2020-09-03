import { registerMessage } from "../../decorators/message.decorator";

@registerMessage()
export class ResponseCreateTransport {
  id: any;
  iceCandidates: any;
  iceParameters: any;
  dtlsParameters: any;
  sctpParameters: any;
}
