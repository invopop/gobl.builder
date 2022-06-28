import GoblWorker from "./worker?worker";

type BaseBulkRequest = {
  req_id?: string;
  indent?: boolean;
};

type BulkRequest = VerifyRequest | BuildRequest | EnvelopRequest | KeygenRequest | PingRequest | SleepRequest;

type VerifyRequest = BaseBulkRequest & {
  action: "verify";
  payload: {
    data: string;
    publickey: string;
  };
};

type BuildRequest = BaseBulkRequest & {
  action: "build";
  payload: {
    template: string;
    data: string;
    privatekey: string;
    type: string;
  };
};

type EnvelopRequest = BaseBulkRequest & {
  action: "envelop";
  payload: {
    template: string;
    data: string;
    privatekey: string;
    type: string;
  };
};

type KeygenRequest = BaseBulkRequest & {
  action: "keygen";
};

type PingRequest = BaseBulkRequest & {
  action: "ping";
};

type SleepRequest = BaseBulkRequest & {
  action: "sleep";
  payload: string; // Go `time` duration string. See: https://pkg.go.dev/time#ParseDuration
};

type BulkResponse = {
  req_id: string;
  error: string;
  payload: string;
};

type ReadyMessage = {
  ready: true;
};

type InFlightBulkRequest = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

const queue: BulkRequest[] = [];
const inFlight: Record<string, InFlightBulkRequest> = {};
const worker = new GoblWorker();

let reqId = 0;
let ready = false;

worker.onmessage = ({ data }: MessageEvent<ReadyMessage | BulkResponse>) => {
  if ("ready" in data) {
    console.log("GoblWorker is ready ...");
    ready = true;
    for (let i = 0; i < queue.length; i++) {
      worker.postMessage(queue[i]);
    }
    return true;
  }

  const waiting = inFlight[data.req_id];
  delete inFlight[data.req_id];

  if (!waiting) {
    console.log(`Received response for an unregistered request (req_id: ${data.req_id}).`, { data });
    return true;
  }

  if (data.error) {
    waiting.reject(data.error);
    return true;
  }

  waiting.resolve(data.payload);
};

async function sendMessage<T>(data: BulkRequest): Promise<T> {
  if (!data.req_id) {
    data.req_id = `req${++reqId}`;
  }

  const promise = new Promise<T>((resolve, reject) => {
    inFlight[data.req_id] = {
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

async function build({ payload, indent }: Pick<BuildRequest, "payload" | "indent">) {
  return sendMessage({
    action: "build",
    payload,
    indent,
  });
}

async function verify({ payload, indent }: Pick<VerifyRequest, "payload" | "indent">) {
  return sendMessage({
    action: "verify",
    payload,
    indent,
  });
}

async function envelop({ payload, indent }: Pick<EnvelopRequest, "payload" | "indent">) {
  return sendMessage({
    action: "envelop",
    payload,
    indent,
  });
}

type Keypair = {
  private: JsonWebKey;
  public: Omit<JsonWebKey, "d">;
};

async function keygen(opts?: { indent: KeygenRequest["indent"] }): Promise<Keypair> {
  return JSON.parse(
    await sendMessage({
      action: "keygen",
      indent: opts?.indent,
    })
  );
}

async function ping(opts?: { indent: PingRequest["indent"] }) {
  return sendMessage({
    action: "ping",
    indent: opts?.indent,
  });
}

async function sleep({ duration, indent }: { duration: SleepRequest["payload"]; indent?: SleepRequest["indent"] }) {
  return sendMessage({
    action: "sleep",
    payload: duration,
    indent,
  });
}

export { build, verify, envelop, keygen, ping, sleep };
