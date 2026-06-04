import { get } from 'svelte/store'
import * as GOBL from '$lib/gobl/client'
import { envelopeGOBLSchema } from '$lib/helpers/envelope'
import type { Envelope } from '$lib/types/envelope'
import type {
  BuildActionResponse,
  BuilderContext,
  BuildOptions,
  ValidateActionResponse
} from '$lib/types/editor'

// Send a request to the GOBL API to run the "build" operation using the current
// editor window contents and update with the results.
export async function build(
  ctx: BuilderContext,
  options: BuildOptions = {}
): Promise<BuildActionResponse> {
  if (!get(ctx.validEditor)) {
    return {}
  }

  try {
    const sendData = getGOBLPayload(ctx, options)

    const result = await GOBL.build<Envelope>(sendData, { envelop: true })

    ctx.envelope.set(result)
    ctx.goblError.set(null)

    return { result }
  } catch (e) {
    const goblErr = GOBL.parseGOBLError(e)
    ctx.goblError.set(goblErr)

    return {
      error: goblErr
    }
  }
}

// Send a request to the GOBL API to run the "sign" operation using the current
// editor window contents and update with the results.
export async function sign(ctx: BuilderContext): Promise<BuildActionResponse> {
  const { keypair } = ctx
  const keypairValue = get(keypair)

  if (!get(ctx.validEditor) || !keypairValue) {
    return {}
  }

  try {
    const sendData = getGOBLPayload(ctx)

    const result = await GOBL.sign<Envelope>(sendData, keypairValue.private)

    ctx.envelope.set(result)
    ctx.goblError.set(null)

    return { result }
  } catch (e) {
    const goblErr = GOBL.parseGOBLError(e)
    ctx.goblError.set(goblErr)

    return {
      error: goblErr
    }
  }
}

// Send a request to the GOBL API to run the "validate" operation using the current
// editor window contents and update with the results.
export async function validate(ctx: BuilderContext): Promise<ValidateActionResponse> {
  if (!get(ctx.validEditor) || !get(ctx.envelopeIsSigned)) {
    return { isValid: false }
  }

  try {
    const sendData = getGOBLPayload(ctx)

    await GOBL.validate(sendData)

    ctx.goblError.set(null)

    return { isValid: true }
  } catch (e) {
    const goblErr = GOBL.parseGOBLError(e)
    ctx.goblError.set(goblErr)

    return {
      isValid: false,
      error: goblErr
    }
  }
}

// Send a request to the GOBL API to run the "replicate" operation using the current editor window contents.
export async function replicate(ctx: BuilderContext): Promise<BuildActionResponse> {
  if (!get(ctx.validEditor)) {
    return {}
  }

  try {
    const sendData = getGOBLPayload(ctx)

    const result = await GOBL.replicate<Envelope>(sendData)

    return { result }
  } catch (e) {
    const goblErr = GOBL.parseGOBLError(e)
    ctx.goblError.set(goblErr)

    return {
      error: goblErr
    }
  }
}

// Send a request to the GOBL API to get the adecuate correction fields using
// editor window contents to read the tax regime.
export async function getCorrectionOptionsSchema(ctx: BuilderContext) {
  if (!get(ctx.validEditor)) {
    return
  }

  try {
    const sendData = getGOBLPayload(ctx)

    const schema = await GOBL.correctionOptionsSchema(sendData)

    ctx.goblError.set(null)

    return { schema }
  } catch (e) {
    return { schema: null }
  }
}

// Send a request to the GOBL API to run the "correct" operation using the current
// editor window contents and update with the results.
export async function correct(
  options: string,
  ctx: BuilderContext,
  autocorrect = true
): Promise<BuildActionResponse> {
  if (!get(ctx.validEditor)) {
    return {}
  }

  try {
    const sendData = getGOBLPayload(ctx)

    const result = await GOBL.correct<Envelope>(sendData, JSON.parse(options))

    if (autocorrect) {
      ctx.envelope.set(result)
    }

    ctx.goblError.set(null)

    return { result }
  } catch (e) {
    const goblErr = GOBL.parseGOBLError(e)
    ctx.goblError.set(goblErr)

    return {
      error: goblErr
    }
  }
}

export async function getSchemas() {
  return await GOBL.schemas()
}

function getGOBLPayload(ctx: BuilderContext, options: BuildOptions = {}) {
  const editorValue = get(ctx.editor)
  const envelopeValue = get(ctx.envelope)
  const doc = JSON.parse(editorValue.value || '')
  if (options.removeStamps) {
    delete envelopeValue.head?.stamps
  }
  if (options.removeSignatures) {
    delete envelopeValue.sigs
  }
  if (doc.$schema == envelopeGOBLSchema) {
    return doc // send as-is
  }
  envelopeValue.doc = doc

  return envelopeValue
}
