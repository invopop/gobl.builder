import { get } from "svelte/store";
import * as GOBL from "@invopop/gobl-worker";
import { encodeUTF8ToBase64 } from "$lib/encodeUTF8ToBase64.js";
import { Severity, createNotification } from "$lib/notifications/index.js";
import { validEditor, envelope, goblError, keypair, envelopeIsSigned, editor, envelopeGOBLSchema } from "$lib/editor/stores"

export async function build() {
    if (!get(validEditor)) {
      return;
    }
  
    try {
      const sendData = getGOBLPayload();
  
      const payload: GOBL.BuildPayload = {
        data: encodeUTF8ToBase64(sendData),
        draft: true,
        envelop: true,
      };
      const rawResult = await GOBL.build({ payload });
      const result = JSON.parse(rawResult);
  
      envelope.set(result);
      goblError.set(null);
  
      createNotification({
        severity: Severity.Success,
        message: "Document successfully built.",
      });
  
      return { result };
    } catch (e) {
      const goblErr = GOBL.parseGOBLError(e);
      goblError.set(goblErr);
  
      return {
        error: goblErr,
      };
    }
  }
  
  export async function sign() {
    const keypairValue = get(keypair);
  
    if (!get(validEditor) || !keypairValue) {
      return;
    }
  
    try {
      const sendData = getGOBLPayload();
  
      const payload: GOBL.SignPayload = {
        data: encodeUTF8ToBase64(sendData),
        privatekey: keypairValue.private,
      };
      const rawResult = await GOBL.sign({ payload });
      const result = JSON.parse(rawResult);
  
      envelope.set(result);
      goblError.set(null);
  
      createNotification({
        severity: Severity.Success,
        message: "Document successfully signed.",
      });
  
      return { result };
    } catch (e) {
      const goblErr = GOBL.parseGOBLError(e);
      goblError.set(goblErr);
  
      return {
        error: goblErr,
      };
    }
  }
  
  export async function validate() {
    if (!get(validEditor) || !get(envelopeIsSigned)) {
      return;
    }
  
    try {
      const sendData = getGOBLPayload();
  
      const payload: GOBL.ValidatePayload = {
        data: encodeUTF8ToBase64(sendData),
      };
      await GOBL.validate({ payload });
  
      goblError.set(null);
  
      createNotification({
        severity: Severity.Success,
        message: "Document successfully validated.",
      });
  
      return { isValid: true };
    } catch (e) {
      const goblErr = GOBL.parseGOBLError(e);
      goblError.set(goblErr);
  
      return {
        isValid: false,
        error: goblErr,
      };
    }
  }
  
  function getGOBLPayload() {
    const editorValue = get(editor);
    const envelopeValue = get(envelope);
    const doc = JSON.parse(editorValue || "");
    if (doc.$schema == envelopeGOBLSchema) {
      return editorValue || ""; // send as-is
    }
    envelopeValue.doc = doc;
  
    return JSON.stringify(envelopeValue);
  }