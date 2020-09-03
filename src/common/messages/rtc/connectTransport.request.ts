import { registerMessage } from "../../decorators/message.decorator";

@registerMessage()
export class RequestConnectTransport {
  id: string;
  dtlsParameters: any;
}
