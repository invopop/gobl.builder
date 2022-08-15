import GoblWorker from "./worker?worker";
import { createNotification, Notification } from "../notifications";
import type { GOBLError } from "../stores";

type BaseBulkRequest = {
  req_id?: string;
  indent?: boolean;
};

type BulkRequest =
  | VerifyRequest
  | ValidateRequest
  | BuildRequest
  | SignRequest
  | KeygenRequest
  | PingRequest
  | SleepRequest;

export type BuildPayload = {
  template?: string;
  data: string;
  privatekey: Keypair["private"];
  type?: string;
};

export type ValidatePayload = {
  data: string;
};

export type VerifyRequest = BaseBulkRequest & {
  action: "verify";
  payload: {
    data: string;
    publickey: Keypair["public"];
  };
};

export type ValidateRequest = BaseBulkRequest & {
  action: "validate";
  payload: ValidatePayload;
};

export type BuildRequest = BaseBulkRequest & {
  action: "build";
  payload: BuildPayload;
};

export type SignRequest = BaseBulkRequest & {
  action: "sign";
  payload: BuildPayload;
};

export type KeygenRequest = BaseBulkRequest & {
  action: "keygen";
};

export type PingRequest = BaseBulkRequest & {
  action: "ping";
};

export type SleepRequest = BaseBulkRequest & {
  action: "sleep";
  payload: string; // Go `time` duration string. See: https://pkg.go.dev/time#ParseDuration
};

export type BulkResponse = {
  req_id: string;
  error: string;
  payload: string;
};

export type ReadyMessage = {
  ready: true;
};

type InFlightBulkRequest = {
  resolve: (value: string | PromiseLike<string>) => void;
  reject: (reason?: unknown) => void;
};

const queue: BulkRequest[] = [];
const inFlight: Record<string, InFlightBulkRequest> = {};
const worker = new GoblWorker();

let reqId = 0;
let ready = false;

worker.onmessage = ({ data }: MessageEvent<ReadyMessage | Notification | BulkResponse>) => {
  if ("ready" in data) {
    console.log("GoblWorker is ready ...");
    ready = true;
    for (let i = 0; i < queue.length; i++) {
      worker.postMessage(queue[i]);
    }
    return true;
  }

  if ("message" in data) {
    createNotification(data);
    return true;
  }

  const waiting = inFlight[data.req_id];
  delete inFlight[data.req_id];

  if (!waiting) {
    console.error(`Received response for an unregistered request (req_id: ${data.req_id}).`, { data });
    return true;
  }

  if (data.error) {
    console.error(data.error);
    waiting.reject(data.error);
    return true;
  }

  waiting.resolve(data.payload);
};

async function sendMessage(data: BulkRequest): Promise<string> {
  if (!data.req_id) {
    data.req_id = `req${++reqId}`;
  }

  const promise = new Promise<string>((resolve, reject) => {
    inFlight[data.req_id as string] = {
      resolve,
      reject,
    };
  });

  if (!ready) {
    queue.push(data);
    return promise;
  }

  worker.postMessage(data);

  return promise;
}

export async function build({ payload, indent }: Pick<BuildRequest, "payload" | "indent">) {
  // TODO(?): Parse JSON response before returning.
  return sendMessage({
    action: "build",
    payload,
    indent,
  });
}

export async function sign({ payload, indent }: Pick<SignRequest, "payload" | "indent">) {
  // TODO(?): Parse JSON response before returning.
  return sendMessage({
    action: "sign",
    payload,
    indent,
  });
}

export async function validate({ payload, indent }: Pick<ValidateRequest, "payload" | "indent">) {
  // TODO(?): Parse JSON response before returning.
  return sendMessage({
    action: "validate",
    payload,
    indent,
  });
}

export async function verify({ payload, indent }: Pick<VerifyRequest, "payload" | "indent">) {
  // TODO(?): Parse JSON response before returning.
  return sendMessage({
    action: "verify",
    payload,
    indent,
  });
}

export type Keypair = {
  private: JsonWebKey;
  public: Omit<JsonWebKey, "d">;
};

export async function keygen(opts?: { indent: KeygenRequest["indent"] }): Promise<Keypair> {
  return JSON.parse(
    await sendMessage({
      action: "keygen",
      indent: opts?.indent,
    })
  );
}

export async function ping(opts?: { indent: PingRequest["indent"] }) {
  return sendMessage({
    action: "ping",
    indent: opts?.indent,
  });
}

export async function sleep({
  duration,
  indent,
}: {
  duration: SleepRequest["payload"];
  indent?: SleepRequest["indent"];
}) {
  return sendMessage({
    action: "sleep",
    payload: duration,
    indent,
  });
}

const goblErrorRegexp = /^code=(\d+), message=(.+)$/;

export function parseGOBLError(err: unknown): GOBLError {
  if (typeof err !== "string") {
    throw err;
  }
  const result = err.match(goblErrorRegexp);
  return {
    message: (result && result[2]) || err,
    code: (result && +result[1]) || 0,
  };
}
