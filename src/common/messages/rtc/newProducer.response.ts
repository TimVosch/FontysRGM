import { registerMessage } from "../../decorators/message.decorator";

@registerMessage()
export class ResponseNewProducer {
  id: string;
}
