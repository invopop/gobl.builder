import { get } from "svelte/store";
import * as GOBL from "@invopop/gobl-worker";
import { toasts } from "svelte-toasts";
import { envelopeGOBLSchema } from "$lib/helpers/envelope";
import type { BuilderContext } from "$lib/types/editor";
import utf8 from "utf8";
import base64 from "base-64";

export function encodeUTF8ToBase64(value: string): string {
  return base64.encode(utf8.encode(value));
}

// Send a request to the GOBL worker to run the "build" operation using the current
// editor window contents and update with the results.
export async function build(ctx: BuilderContext) {
  if (!get(ctx.validEditor)) {
    return;
  }

  try {
    const sendData = getGOBLPayload(ctx);

    const payload: GOBL.BuildPayload = {
      data: encodeUTF8ToBase64(sendData),
      draft: true,
      envelop: true,
    };
    const rawResult = await GOBL.build({ payload });
    const result = JSON.parse(rawResult);

    ctx.envelope.set(result);
    ctx.goblError.set(null);

    // TODO: With autobuild in place this notification is disabled, find a way to show it manually

    // toasts.add({
    //   type: "success",
    //   description: "Document successfully built.",
    // });

    return { result };
  } catch (e) {
    const goblErr = GOBL.parseGOBLError(e);
    ctx.goblError.set(goblErr);

    return {
      error: goblErr,
    };
  }
}

// Send a request to the GOBL worker to run the "sign" operation using the current
// editor window contents and update with the results.
export async function sign(ctx: BuilderContext) {
  const { keypair } = ctx;
  const keypairValue = get(keypair);

  if (!get(ctx.validEditor) || !keypairValue) {
    return;
  }

  try {
    const sendData = getGOBLPayload(ctx);

    const payload: GOBL.SignPayload = {
      data: encodeUTF8ToBase64(sendData),
      privatekey: keypairValue.private,
    };
    const rawResult = await GOBL.sign({ payload });
    const result = JSON.parse(rawResult);

    ctx.envelope.set(result);
    ctx.goblError.set(null);

    toasts.add({
      type: "success",
      description: "Document successfully signed.",
    });

    return { result };
  } catch (e) {
    const goblErr = GOBL.parseGOBLError(e);
    ctx.goblError.set(goblErr);

    return {
      error: goblErr,
    };
  }
}

// Send a request to the GOBL worker to run the "validate" operation using the current
// editor window contents and update with the results.
export async function validate(ctx: BuilderContext) {
  if (!get(ctx.validEditor) || !get(ctx.envelopeIsSigned)) {
    return;
  }

  try {
    const sendData = getGOBLPayload(ctx);

    const payload: GOBL.ValidatePayload = {
      data: encodeUTF8ToBase64(sendData),
    };
    await GOBL.validate({ payload });

    ctx.goblError.set(null);

    toasts.add({
      type: "success",
      description: "Document successfully validated.",
    });

    return { isValid: true };
  } catch (e) {
    const goblErr = GOBL.parseGOBLError(e);
    ctx.goblError.set(goblErr);

    return {
      isValid: false,
      error: goblErr,
    };
  }
}

// Send a request to the GOBL worker to run the "replicate" operation using the current editor window contents.
export async function replicate(ctx: BuilderContext) {
  if (!get(ctx.validEditor)) {
    return;
  }

  try {
    const sendData = getGOBLPayload(ctx);

    const payload: GOBL.ValidatePayload = {
      data: encodeUTF8ToBase64(sendData),
    };

    const rawResult = await GOBL.replicate({ payload });
    const result = JSON.parse(rawResult);

    return { result };
  } catch (e) {
    const goblErr = GOBL.parseGOBLError(e);
    ctx.goblError.set(goblErr);

    return {
      error: goblErr,
    };
  }
}

// Send a request to the GOBL worker to get the adecuate correction fields using
// editor window contents to read the tax regime.
export async function getCorrectionOptionsSchema(ctx: BuilderContext) {
  if (!get(ctx.validEditor)) {
    return;
  }

  try {
    const sendData = getGOBLPayload(ctx);

    const payload: GOBL.CorrectPayload = {
      data: encodeUTF8ToBase64(sendData),
      schema: true,
    };

    const schema = await GOBL.correct({ payload });

    ctx.goblError.set(null);

    return { schema };
  } catch (e) {
    return { schema: null };
  }
}

// Send a request to the GOBL worker to run the "correct" operation using the current
// editor window contents and update with the results.
export async function correct(options: string, ctx: BuilderContext) {
  if (!get(ctx.validEditor)) {
    return;
  }

  try {
    const sendData = getGOBLPayload(ctx);

    const payload: GOBL.CorrectPayload = {
      data: encodeUTF8ToBase64(sendData),
      options: encodeUTF8ToBase64(options),
    };

    const rawResult = await GOBL.correct({ payload });
    const result = JSON.parse(rawResult);

    ctx.envelope.set(result);
    ctx.goblError.set(null);

    toasts.add({
      type: "success",
      description: "Document successfully corrected.",
    });

    return { result };
  } catch (e) {
    const goblErr = GOBL.parseGOBLError(e);
    ctx.goblError.set(goblErr);

    return {
      error: goblErr,
    };
  }
}

export async function getSchemas() {
  const schemas = await GOBL.schemas();
  return JSON.parse(schemas).list;
}

function getGOBLPayload(ctx: BuilderContext) {
  const editorValue = get(ctx.editor);
  const envelopeValue = get(ctx.envelope);
  const doc = JSON.parse(editorValue.value || "");
  if (doc.$schema == envelopeGOBLSchema) {
    return editorValue.value || ""; // send as-is
  }
  envelopeValue.doc = doc;

  return JSON.stringify(envelopeValue);
}
