import { encodeUTF8ToBase64 } from "../lib/encodeUTF8ToBase64";
import type * as GOBL from "../lib/gobl";
import { envelope, editor, goblError, Envelope } from "../stores";

export async function runBuildCommand(
  envelopeValue: Envelope | null,
  editorValue: string,
  keypair: GOBL.Keypair,
  goblFn: (params: { payload: GOBL.BuildPayload; indent: boolean }) => Promise<string>
) {
  let sendData: string;

  // If a (previously set) envelope exists, replace its `doc` property with
  // the editor contents. If not, send the editor contents as-is. In either case,
  // the GOBL command response will be an an enveloped document.
  if (envelopeValue) {
    envelopeValue.doc = JSON.parse(editorValue);
    sendData = JSON.stringify(envelopeValue);
  } else {
    sendData = editorValue;
  }

  const payload: GOBL.BuildPayload = {
    data: encodeUTF8ToBase64(sendData),
    privatekey: keypair.private,
  };
  const rawResult = await goblFn({ payload, indent: true });
  const result = JSON.parse(rawResult);

  if (result.$schema === "https://gobl.org/draft-0/envelope") {
    // Set new editor value *first*, because when the envelope is set, the Monaco
    // editor if the envelope contains signatures.
    editor.set(JSON.stringify(result.doc, null, 4));
    envelope.set(result);
  } else {
    editor.set(JSON.stringify(result, null, 4));
  }

  goblError.set(null);
}
