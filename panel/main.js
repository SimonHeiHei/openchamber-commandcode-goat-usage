(() => {
  // node_modules/@openchamber/sdk/dist/api-version.js
  var OPENCHAMBER_SDK_CHANNEL = "openchamber.sdk";
  var OPENCHAMBER_SDK_API_VERSION = 1;

  // node_modules/@openchamber/sdk/dist/scrollbar-style.js
  var GUEST_SCROLLBAR_CSS = `
:root {
  --oc-scrollbar-thumb: color-mix(in srgb, var(--oc-muted, currentColor) 40%, transparent);
  --oc-scrollbar-thumb-hover: color-mix(in srgb, var(--oc-muted, currentColor) 65%, transparent);
  scrollbar-gutter: stable;
}
* {
  scrollbar-width: thin;
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  * { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  :root::-webkit-scrollbar, body::-webkit-scrollbar { background: var(--oc-bg, inherit); }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: var(--oc-scrollbar-thumb);
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  * { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;

  // node_modules/@openchamber/sdk/dist/workspace.js
  var GUEST_STORAGE_KEY_MAX = 128;
  var GUEST_STORAGE_VALUE_BYTES = 65536;

  // node_modules/@openchamber/sdk/dist/contract.js
  var GUEST_FILE_STAT_KINDS = ["file", "directory", "other", "missing"];
  var isStartSessionResult = (value) => Boolean(value && "sessionId" in value);
  var isPromptResult = (value) => Boolean(value && "sent" in value && !("sessionId" in value));
  var GUEST_COMPOSE_TEXT_MAX = 16e3;
  var GUEST_ATTACH_ID_MAX = 128;
  var GUEST_ATTACH_TITLE_MAX = 200;
  var GUEST_ATTACH_URL_MAX = 2e3;
  var GUEST_ATTACH_TEXT_MAX = 16e3;
  var GUEST_ATTACH_AUTHOR_MAX = 80;
  var GUEST_ATTACH_BRANCH_MAX = 200;
  var GUEST_ATTACH_DATA_MAX = 16e3;
  var GUEST_REQUEST_PATH_MAX = 2e3;
  var GUEST_REQUEST_TIMEOUT_MS = 2e4;
  var GUEST_FILE_PATH_MAX = 1024;
  var GUEST_FILE_CONTENT_MAX = 2e6;
  var GUEST_GENERATE_PROMPT_MAX = 64e3;
  var GUEST_GENERATE_SYSTEM_MAX = 8e3;
  var GUEST_GENERATE_OUTPUT_TOKENS_MAX = 4e3;
  var GUEST_GENERATE_TIMEOUT_MS = 9e4;
  var GUEST_BADGE_MAX = 999;
  var GUEST_RESOLVE_ERROR_MAX = 500;
  var HOST_REQUEST_ERROR_CODES = [
    "HOST_UNAVAILABLE",
    "HOST_TIMEOUT",
    "HOST_REJECTED",
    "DISCONNECTED",
    "DISABLED",
    "BAD_PATH",
    "NO_INTEGRATION",
    "NO_SERVICE",
    "SERVICE_FAILED",
    "NO_SESSION",
    "SESSION_BUSY",
    "NOT_GRANTED",
    "NO_DIRECTORY",
    "NOT_FOUND",
    "FILE_TOO_LARGE",
    "DENIED",
    "NO_MODEL",
    "MODEL_FAILED"
  ];
  var SERVICE_STATUS_VALUES = ["stopped", "starting", "ready", "failed"];
  var hostRequestErrorCodeSet = new Set(HOST_REQUEST_ERROR_CODES);
  var isHostRequestErrorCode = (value) => hostRequestErrorCodeSet.has(value);
  var resolveHostRequestErrorCode = (value) => value && isHostRequestErrorCode(value) ? value : "HOST_REJECTED";
  var isJsonValue = (value) => {
    if (value === void 0)
      return false;
    if (value === null || value === true || value === false)
      return true;
    if (String(value) === value)
      return true;
    if (Number(value) === value)
      return Number.isFinite(value);
    if (Array.isArray(value))
      return value.every(isJsonValue);
    if (Object(value) === value)
      return Object.values(value).every(isJsonValue);
    return false;
  };
  var isAttachData = (value) => isJsonValue(value) && JSON.stringify(value).length <= GUEST_ATTACH_DATA_MAX;
  var clampBranch = (value) => value?.trim().slice(0, GUEST_ATTACH_BRANCH_MAX) ?? "";
  var clampAttachRequest = (request) => {
    const id = request.id.trim().slice(0, GUEST_ATTACH_ID_MAX);
    const title = request.title.trim().slice(0, GUEST_ATTACH_TITLE_MAX);
    const url = request.url.trim().slice(0, GUEST_ATTACH_URL_MAX);
    const text = request.text?.trim().slice(0, GUEST_ATTACH_TEXT_MAX);
    const author = request.author?.trim().slice(0, GUEST_ATTACH_AUTHOR_MAX);
    const kind = request.kind === "pull" ? "pull" : "issue";
    const next = {
      providerId: request.providerId.trim(),
      id,
      title: title || id,
      url,
      kind
    };
    if (text) {
      next.text = text;
    }
    if (author) {
      next.author = author;
    }
    if (kind === "pull") {
      const head = clampBranch(request.branches?.head);
      const base = clampBranch(request.branches?.base);
      if (head && base) {
        next.branches = { head, base };
      }
    }
    if (isAttachData(request.data)) {
      next.data = request.data;
    }
    return next;
  };
  var clampStartSessionRequest = (request) => {
    const next = clampAttachRequest(request);
    if (request.projectId)
      next.projectId = request.projectId;
    if (request.navigation)
      next.navigation = request.navigation;
    if (request.worktree) {
      next.worktree = request.worktree;
    }
    return next;
  };
  var clampPromptRequest = (request) => {
    const next = {
      text: request.text.trim().slice(0, GUEST_COMPOSE_TEXT_MAX)
    };
    if (request.send) {
      next.send = true;
    }
    return next;
  };
  var clampBadgeCount = (count) => {
    if (count === null || !Number.isFinite(count))
      return null;
    return Math.min(GUEST_BADGE_MAX, Math.max(0, Math.round(count)));
  };
  var isGuestFilePath = (value) => value.length > 0 && value.length <= GUEST_FILE_PATH_MAX && !value.includes("\0") && !value.includes("\\");
  var isGuestRequestPath = (value) => {
    if (!value.startsWith("/") || value.includes("\0") || value.includes("\\") || value.includes("://")) {
      return false;
    }
    if (value.length > GUEST_REQUEST_PATH_MAX) {
      return false;
    }
    const segments = value.split("/");
    return !segments.some((segment) => segment === "." || segment === "..");
  };
  var serviceStatusSet = new Set(SERVICE_STATUS_VALUES);
  var isServiceStatusResult = (value) => Boolean(value && "status" in value && serviceStatusSet.has(String(value.status)) && !("body" in value));
  var isGuestRequestResult = (value) => Boolean(value && "status" in value && "body" in value && Number.isInteger(value.status));
  var isFileReadResult = (value) => Boolean(value && "content" in value && String(value.content) === value.content);
  var isFileWriteResult = (value) => Boolean(value && "written" in value && value.written === true);
  var isFileListResult = (value) => Boolean(value && "entries" in value && Array.isArray(value.entries));
  var fileStatKindSet = new Set(GUEST_FILE_STAT_KINDS);
  var isFileStatResult = (value) => Boolean(value && "kind" in value && "size" in value && fileStatKindSet.has(String(value.kind)) && Number.isFinite(value.size));
  var isGenerateResult = (value) => Boolean(value && "text" in value && String(value.text) === value.text && !("status" in value));
  var HOST_PUSH_TYPES = /* @__PURE__ */ new Set([
    "workspace",
    "ready",
    "directory",
    "session",
    "connection",
    "settings",
    "session-lifecycle",
    "item",
    "resolve"
  ]);
  var asWireRecord = (data) => Object(data) === data ? data : null;
  var isNonEmptyString = (value) => String(value) === value && value.length > 0;
  var readResultMessage = (wire) => {
    if (!isNonEmptyString(wire.id))
      return null;
    if (wire.ok === true) {
      const message = {
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "result",
        id: wire.id,
        ok: true
      };
      if (Object(wire.payload) === wire.payload) {
        message.payload = wire.payload;
      }
      return message;
    }
    if (wire.ok === false && isNonEmptyString(wire.error)) {
      return {
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "result",
        id: wire.id,
        ok: false,
        error: wire.error,
        code: resolveHostRequestErrorCode(isNonEmptyString(wire.code) ? wire.code : void 0)
      };
    }
    return null;
  };
  var readHostMessage = (data) => {
    const wire = asWireRecord(data);
    if (!wire || wire.channel !== OPENCHAMBER_SDK_CHANNEL || wire.v !== OPENCHAMBER_SDK_API_VERSION)
      return null;
    if (wire.type === "result")
      return readResultMessage(wire);
    if (!HOST_PUSH_TYPES.has(String(wire.type)) || Object(wire.payload) !== wire.payload)
      return null;
    return wire;
  };

  // node_modules/@openchamber/sdk/dist/host.js
  var HostRequestError = class extends Error {
    code;
    constructor(code, message) {
      super(message);
      this.name = "HostRequestError";
      this.code = code;
    }
  };
  var rejectBadPath = () => Promise.reject(new HostRequestError("BAD_PATH", 'Request path must start with "/" and stay on the declared origin.'));
  var rejectBadFilePath = () => Promise.reject(new HostRequestError("BAD_PATH", `File path must be 1 to ${GUEST_FILE_PATH_MAX} characters without NUL or backslash.`));
  var nextId = (n) => {
    n.value += 1;
    return `oc-${n.value}`;
  };
  var connectHost = (options = {}) => {
    const target = options.target ?? ("window" in globalThis ? window : null);
    if (!target) {
      throw new HostRequestError("HOST_UNAVAILABLE", "No window. connectHost runs in a browser frame.");
    }
    const acceptSource = options.acceptSource ?? ((source) => source === target.parent);
    const requestTimeoutMs = options.requestTimeoutMs ?? GUEST_REQUEST_TIMEOUT_MS;
    const readyListeners = /* @__PURE__ */ new Set();
    const directoryListeners = /* @__PURE__ */ new Set();
    const sessionListeners = /* @__PURE__ */ new Set();
    const lifecycleListeners = /* @__PURE__ */ new Set();
    const connectionListeners = /* @__PURE__ */ new Set();
    const settingsListeners = /* @__PURE__ */ new Set();
    const itemListeners = /* @__PURE__ */ new Set();
    let resolveHandler = null;
    const pending = /* @__PURE__ */ new Map();
    const workspaceListeners = /* @__PURE__ */ new Map();
    let disposed = false;
    const ids = { value: 0 };
    let lastReady = null;
    let lastLifecycle = null;
    const lifecycleFromSession = (session) => {
      if (!session)
        return null;
      return {
        sessionId: session.id,
        phase: session.busy ? "started" : "completed"
      };
    };
    const post = (message) => {
      target.parent.postMessage(message, "*");
    };
    const emit = (listeners, value) => {
      for (const listener of listeners) {
        try {
          listener(value);
        } catch (error) {
          console.error(error);
        }
      }
    };
    const onMessage = (event) => {
      if (!(event instanceof MessageEvent))
        return;
      if (!acceptSource(event.source))
        return;
      const message = readHostMessage(event.data);
      if (!message)
        return;
      if (message.type === "workspace") {
        const listener = workspaceListeners.get(message.payload.subscriptionId);
        if (listener)
          emit([listener], message.payload.snapshot);
        return;
      }
      if (message.type === "ready") {
        lastReady = message.payload;
        lastLifecycle = lifecycleFromSession(message.payload.session);
        emit(readyListeners, message.payload);
        emit(directoryListeners, message.payload.directory);
        emit(sessionListeners, message.payload.session);
        if (lastLifecycle) {
          emit(lifecycleListeners, lastLifecycle);
        }
        emit(connectionListeners, message.payload.connection);
        emit(settingsListeners, message.payload.settings);
        emit(itemListeners, message.payload.item);
        return;
      }
      if (message.type === "directory") {
        if (lastReady) {
          lastReady = { ...lastReady, directory: message.payload.directory };
        }
        emit(directoryListeners, message.payload.directory);
        return;
      }
      if (message.type === "session") {
        if (lastReady) {
          lastReady = { ...lastReady, session: message.payload.session };
        }
        if (!message.payload.session) {
          lastLifecycle = null;
        } else if (lastLifecycle?.sessionId !== message.payload.session.id) {
          lastLifecycle = lifecycleFromSession(message.payload.session);
        }
        emit(sessionListeners, message.payload.session);
        return;
      }
      if (message.type === "session-lifecycle") {
        lastLifecycle = message.payload;
        emit(lifecycleListeners, message.payload);
        return;
      }
      if (message.type === "connection") {
        if (lastReady) {
          lastReady = { ...lastReady, connection: message.payload.connection };
        }
        emit(connectionListeners, message.payload.connection);
        return;
      }
      if (message.type === "settings") {
        if (lastReady) {
          lastReady = { ...lastReady, settings: message.payload.settings };
        }
        emit(settingsListeners, message.payload.settings);
        return;
      }
      if (message.type === "item") {
        if (lastReady) {
          lastReady = { ...lastReady, item: message.payload.item };
        }
        emit(itemListeners, message.payload.item);
        return;
      }
      if (message.type === "resolve") {
        const answer = (payload) => {
          post({
            channel: OPENCHAMBER_SDK_CHANNEL,
            v: OPENCHAMBER_SDK_API_VERSION,
            type: "resolve-result",
            id: message.id,
            payload
          });
        };
        const handler = resolveHandler;
        if (!handler) {
          answer({ error: "This extension does not resolve commands." });
          return;
        }
        Promise.resolve().then(() => handler(message.payload)).then((item) => answer({ item: item ? clampAttachRequest(item) : null }), (error) => {
          const text = (error instanceof Error ? error.message : String(error)).trim();
          answer({ error: (text || "Command failed.").slice(0, GUEST_RESOLVE_ERROR_MAX) });
        });
        return;
      }
      const waiter = pending.get(message.id);
      if (!waiter)
        return;
      clearTimeout(waiter.timer);
      pending.delete(message.id);
      if (message.ok) {
        waiter.resolve(message.payload);
        return;
      }
      waiter.reject(new HostRequestError(message.code, message.error));
    };
    target.addEventListener("message", onMessage);
    post({
      channel: OPENCHAMBER_SDK_CHANNEL,
      v: OPENCHAMBER_SDK_API_VERSION,
      type: "hello"
    });
    const send = (message, timeoutMs = requestTimeoutMs) => {
      if (disposed || target.parent === target) {
        return Promise.reject(new HostRequestError("HOST_UNAVAILABLE", "No host frame. This page is not in an iframe."));
      }
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(message.id);
          reject(new HostRequestError("HOST_TIMEOUT", "Host did not answer in time."));
        }, timeoutMs);
        pending.set(message.id, { resolve, reject, timer });
        post(message);
      });
    };
    const request = (message) => send(message).then(() => void 0);
    const envelope = { channel: OPENCHAMBER_SDK_CHANNEL, v: OPENCHAMBER_SDK_API_VERSION };
    const requireIdentity = (value, maximum = 1024) => {
      if (!value.trim() || value.length > maximum)
        throw new HostRequestError("HOST_REJECTED", `Identity must contain 1 to ${maximum} characters.`);
    };
    const readWorkspace = async (query) => {
      if (query.kind !== "projects")
        requireIdentity(query.projectId);
      const result = await send({ ...envelope, type: "workspace-read", id: nextId(ids), payload: query });
      if (!result || !("kind" in result) || !("state" in result) || result.kind !== query.kind) {
        throw new HostRequestError("HOST_REJECTED", "Host did not return workspace data.");
      }
      return result;
    };
    const subscribeWorkspace = async (query, listener) => {
      if (query.kind !== "projects")
        requireIdentity(query.projectId);
      const subscriptionId = nextId(ids);
      workspaceListeners.set(subscriptionId, listener);
      try {
        await request({ ...envelope, type: "workspace-subscribe", id: nextId(ids), payload: { subscriptionId, query } });
      } catch (error) {
        workspaceListeners.delete(subscriptionId);
        if (!disposed)
          post({ ...envelope, type: "workspace-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
        throw error;
      }
      return () => {
        if (!workspaceListeners.delete(subscriptionId) || disposed)
          return;
        post({ ...envelope, type: "workspace-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
      };
    };
    const storage = async (payload) => {
      if ("key" in payload && (payload.key.length === 0 || payload.key.length > GUEST_STORAGE_KEY_MAX)) {
        throw new HostRequestError("HOST_REJECTED", "Storage key must contain 1 to 128 characters.");
      }
      if (payload.op === "set" && !isJsonValue(payload.value)) {
        throw new HostRequestError("HOST_REJECTED", "Storage values must be JSON.");
      }
      if (payload.op === "set" && new TextEncoder().encode(JSON.stringify(payload.value)).length > GUEST_STORAGE_VALUE_BYTES) {
        throw new HostRequestError("HOST_REJECTED", "Storage value exceeds 64 KiB.");
      }
      const result = await send({ ...envelope, type: "storage", id: nextId(ids), payload });
      if (!result || !("storage" in result) || result.op !== payload.op)
        throw new HostRequestError("HOST_REJECTED", "Host did not return storage data.");
      return result;
    };
    return {
      listProjects: async () => {
        const result = await readWorkspace({ kind: "projects" });
        if (result.kind !== "projects")
          throw new HostRequestError("HOST_REJECTED", "Expected projects.");
        return result;
      },
      listWorktrees: async (projectId) => {
        const result = await readWorkspace({ kind: "worktrees", projectId });
        if (result.kind !== "worktrees")
          throw new HostRequestError("HOST_REJECTED", "Expected worktrees.");
        return result;
      },
      listSessions: async (projectId) => {
        const result = await readWorkspace({ kind: "sessions", projectId });
        if (result.kind !== "sessions")
          throw new HostRequestError("HOST_REJECTED", "Expected sessions.");
        return result;
      },
      onProjects: (listener) => subscribeWorkspace({ kind: "projects" }, (snapshot) => {
        if (snapshot.kind === "projects")
          listener(snapshot);
      }),
      onWorktrees: (projectId, listener) => subscribeWorkspace({ kind: "worktrees", projectId }, (snapshot) => {
        if (snapshot.kind === "worktrees")
          listener(snapshot);
      }),
      onSessions: (projectId, listener) => subscribeWorkspace({ kind: "sessions", projectId }, (snapshot) => {
        if (snapshot.kind === "sessions")
          listener(snapshot);
      }),
      openSession: async (sessionId) => {
        requireIdentity(sessionId);
        await request({ ...envelope, type: "open-session", id: nextId(ids), payload: { sessionId } });
      },
      storage: {
        get: async (key) => {
          const result = await storage({ op: "get", key });
          return result.op === "get" && result.found ? result.value : void 0;
        },
        set: async (key, value) => {
          await storage({ op: "set", key, value });
        },
        delete: async (key) => {
          await storage({ op: "delete", key });
        },
        keys: async () => {
          const result = await storage({ op: "keys" });
          if (result.op !== "keys")
            throw new HostRequestError("HOST_REJECTED", "Expected storage keys.");
          return result.keys;
        }
      },
      onReady: (listener) => {
        readyListeners.add(listener);
        if (lastReady)
          listener(lastReady);
        return () => {
          readyListeners.delete(listener);
        };
      },
      onDirectory: (listener) => {
        directoryListeners.add(listener);
        if (lastReady)
          listener(lastReady.directory);
        return () => {
          directoryListeners.delete(listener);
        };
      },
      onSession: (listener) => {
        sessionListeners.add(listener);
        if (lastReady)
          listener(lastReady.session);
        return () => {
          sessionListeners.delete(listener);
        };
      },
      onSessionLifecycle: (listener) => {
        lifecycleListeners.add(listener);
        if (lastLifecycle)
          listener(lastLifecycle);
        return () => {
          lifecycleListeners.delete(listener);
        };
      },
      onConnection: (listener) => {
        connectionListeners.add(listener);
        if (lastReady)
          listener(lastReady.connection);
        return () => {
          connectionListeners.delete(listener);
        };
      },
      onSettings: (listener) => {
        settingsListeners.add(listener);
        if (lastReady)
          listener(lastReady.settings);
        return () => {
          settingsListeners.delete(listener);
        };
      },
      onItem: (listener) => {
        itemListeners.add(listener);
        if (lastReady)
          listener(lastReady.item);
        return () => {
          itemListeners.delete(listener);
        };
      },
      onResolve: (handler) => {
        resolveHandler = handler;
        return () => {
          if (resolveHandler === handler)
            resolveHandler = null;
        };
      },
      toast: (payload) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "toast",
        id: nextId(ids),
        payload
      }),
      openUrl: (url) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "open-url",
        id: nextId(ids),
        payload: { url }
      }),
      openSurface: (surfaceId) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "open-surface",
        id: nextId(ids),
        payload: { surfaceId }
      }),
      writeClipboard: (text) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "clipboard-write",
        id: nextId(ids),
        payload: { text }
      }),
      compose: (payload) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "compose",
        id: nextId(ids),
        payload
      }),
      attach: (payload) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "attach",
        id: nextId(ids),
        payload: clampAttachRequest(payload)
      }),
      startSession: async (payload) => {
        if (payload.projectId !== void 0)
          requireIdentity(payload.projectId);
        const worktree = payload.worktree;
        if (worktree && worktree !== true) {
          if (worktree.kind === "existing")
            requireIdentity(worktree.directory);
          else {
            if (worktree.name !== void 0)
              requireIdentity(worktree.name, 200);
            if (worktree.baseBranch !== void 0)
              requireIdentity(worktree.baseBranch, 200);
          }
        }
        const result = await send({
          channel: OPENCHAMBER_SDK_CHANNEL,
          v: OPENCHAMBER_SDK_API_VERSION,
          type: "start-session",
          id: nextId(ids),
          payload: clampStartSessionRequest(payload)
        }, options.requestTimeoutMs ?? 18e4);
        if (!isStartSessionResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return a session.");
        }
        return result;
      },
      prompt: (payload) => send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "prompt",
        id: nextId(ids),
        payload: clampPromptRequest(payload)
      }).then((result) => {
        if (!isPromptResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return a prompt result.");
        }
        return result;
      }),
      sessionLink: (payload) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "session-link",
        id: nextId(ids),
        payload: clampAttachRequest(payload)
      }),
      close: () => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "close",
        id: nextId(ids)
      }),
      oauthStart: () => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "oauth-start",
        id: nextId(ids)
      }),
      oauthDisconnect: () => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "oauth-disconnect",
        id: nextId(ids)
      }),
      request: (payload) => (isGuestRequestPath(payload.path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "request",
        id: nextId(ids),
        payload
      }) : rejectBadPath()).then((result) => {
        if (!isGuestRequestResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host request result was empty.");
        }
        return result;
      }),
      serviceRequest: (payload) => (isGuestRequestPath(payload.path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "service-request",
        id: nextId(ids),
        payload
      }) : rejectBadPath()).then((result) => {
        if (!isGuestRequestResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host service request result was empty.");
        }
        return result;
      }),
      serviceStatus: () => send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "service-status",
        id: nextId(ids)
      }).then((result) => {
        if (!isServiceStatusResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return service status.");
        }
        return result;
      }),
      readFile: (path) => (isGuestFilePath(path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "file-read",
        id: nextId(ids),
        payload: { path }
      }) : rejectBadFilePath()).then((result) => {
        if (!isFileReadResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return file content.");
        }
        return result;
      }),
      writeFile: (path, content) => {
        if (!isGuestFilePath(path)) {
          return rejectBadFilePath();
        }
        if (content.length > GUEST_FILE_CONTENT_MAX) {
          return Promise.reject(new HostRequestError("FILE_TOO_LARGE", `Content is over ${GUEST_FILE_CONTENT_MAX} characters.`));
        }
        return send({
          channel: OPENCHAMBER_SDK_CHANNEL,
          v: OPENCHAMBER_SDK_API_VERSION,
          type: "file-write",
          id: nextId(ids),
          payload: { path, content }
        }).then((result) => {
          if (!isFileWriteResult(result)) {
            throw new HostRequestError("HOST_REJECTED", "Host did not confirm the write.");
          }
          return result;
        });
      },
      listDir: (path) => (isGuestFilePath(path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "file-list",
        id: nextId(ids),
        payload: { path }
      }) : rejectBadFilePath()).then((result) => {
        if (!isFileListResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return directory entries.");
        }
        return result;
      }),
      stat: (path) => (isGuestFilePath(path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "file-stat",
        id: nextId(ids),
        payload: { path }
      }) : rejectBadFilePath()).then((result) => {
        if (!isFileStatResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return file status.");
        }
        return result;
      }),
      generate: (input) => {
        const prompt = input.prompt.trim();
        const system = input.system?.trim();
        if (prompt.length === 0 || prompt.length > GUEST_GENERATE_PROMPT_MAX) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", `Prompt must be 1 to ${GUEST_GENERATE_PROMPT_MAX} characters.`));
        }
        if (system !== void 0 && (system.length === 0 || system.length > GUEST_GENERATE_SYSTEM_MAX)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", `System prompt must be 1 to ${GUEST_GENERATE_SYSTEM_MAX} characters.`));
        }
        const maxOutputTokens = input.maxOutputTokens === void 0 ? void 0 : Math.min(GUEST_GENERATE_OUTPUT_TOKENS_MAX, Math.max(1, Math.floor(input.maxOutputTokens)));
        if (maxOutputTokens !== void 0 && !Number.isFinite(maxOutputTokens)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", "maxOutputTokens must be a number."));
        }
        const payload = { prompt };
        if (system !== void 0)
          payload.system = system;
        if (maxOutputTokens !== void 0)
          payload.maxOutputTokens = maxOutputTokens;
        return send({
          channel: OPENCHAMBER_SDK_CHANNEL,
          v: OPENCHAMBER_SDK_API_VERSION,
          type: "generate",
          id: nextId(ids),
          payload
        }, options.requestTimeoutMs ?? GUEST_GENERATE_TIMEOUT_MS).then((result) => {
          if (!isGenerateResult(result)) {
            throw new HostRequestError("HOST_REJECTED", "Host did not return generated text.");
          }
          return result;
        });
      },
      setBadge: (count) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "badge",
        id: nextId(ids),
        payload: { count: clampBadgeCount(count) }
      }),
      dispose: () => {
        for (const subscriptionId of workspaceListeners.keys()) {
          post({ ...envelope, type: "workspace-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
        }
        workspaceListeners.clear();
        disposed = true;
        resolveHandler = null;
        target.removeEventListener("message", onMessage);
        for (const waiter of pending.values()) {
          clearTimeout(waiter.timer);
          waiter.reject(new HostRequestError("HOST_UNAVAILABLE", "Host client was disposed."));
        }
        pending.clear();
        readyListeners.clear();
        directoryListeners.clear();
        sessionListeners.clear();
        lifecycleListeners.clear();
        connectionListeners.clear();
        settingsListeners.clear();
        itemListeners.clear();
      }
    };
  };

  // node_modules/@openchamber/sdk/dist/ui/theme.js
  var TOKEN_VARS = [
    ["--oc-bg", "background"],
    ["--oc-elevated", "elevated"],
    ["--oc-fg", "foreground"],
    ["--oc-muted", "muted"],
    ["--oc-subtle", "subtle"],
    ["--oc-border", "border"],
    ["--oc-hover", "hover"],
    ["--oc-selection", "selection"],
    ["--oc-focus", "focus"],
    ["--oc-primary", "primary"],
    ["--oc-muted-surface", "mutedSurface"],
    ["--oc-elevated-fg", "elevatedForeground"],
    ["--oc-active", "active"],
    ["--oc-selection-fg", "selectionForeground"],
    ["--oc-primary-fg", "primaryForeground"],
    ["--oc-primary-text", "primaryText"],
    ["--oc-success-text", "successText"],
    ["--oc-warning-text", "warningText"],
    ["--oc-error-text", "errorText"],
    ["--oc-info-text", "infoText"],
    ["--oc-success", "success"],
    ["--oc-warning", "warning"],
    ["--oc-error", "error"],
    ["--oc-info", "info"],
    ["--oc-font", "font"],
    ["--oc-mono", "mono"],
    ["--oc-radius", "radius"],
    ["--surface-background", "background"],
    ["--surface-elevated", "elevated"],
    ["--surface-foreground", "foreground"],
    ["--surface-muted-foreground", "muted"],
    ["--surface-subtle", "subtle"],
    ["--interactive-border", "border"],
    ["--interactive-hover", "hover"],
    ["--interactive-selection", "selection"],
    ["--interactive-focus-ring", "focus"],
    ["--primary", "primary"],
    ["--surface-muted", "mutedSurface"],
    ["--surface-elevated-foreground", "elevatedForeground"],
    ["--interactive-active", "active"],
    ["--interactive-selection-foreground", "selectionForeground"],
    ["--primary-foreground", "primaryForeground"],
    ["--primary-text", "primaryText"],
    ["--success-text", "successText"],
    ["--warning-text", "warningText"],
    ["--error-text", "errorText"],
    ["--info-text", "infoText"],
    ["--status-success", "success"],
    ["--status-warning", "warning"],
    ["--status-error", "error"],
    ["--status-info", "info"],
    ["--font-sans", "font"],
    ["--font-mono", "mono"],
    ["--radius", "radius"]
  ];
  var applyHostTheme = (theme, root) => {
    root.style.colorScheme = theme.mode;
    for (const [name, key] of TOKEN_VARS) {
      root.style.setProperty(name, theme.tokens[key]);
    }
    root.style.setProperty("font-family", theme.tokens.font);
    root.style.setProperty("font-size", "0.875rem");
    root.style.setProperty("line-height", "1.45");
    root.style.setProperty("color", theme.tokens.foreground);
  };
  var applyHostReady = (ctx, root) => {
    applyHostTheme(ctx.theme, root);
    if (root.dataset) {
      root.dataset.ocSurface = ctx.surface;
      root.dataset.ocTheme = ctx.theme.mode;
    }
  };

  // node_modules/@openchamber/sdk/dist/ui/dom.js
  var STYLE_ID = "oc-sdk-ui-style";
  var clearNode = (node) => {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  };
  var ensureStyle = (css) => {
    const existing = document.getElementById(STYLE_ID);
    if (existing instanceof HTMLStyleElement) {
      if (existing.textContent !== css) {
        existing.textContent = css;
      }
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  };
  var el = (tag, className) => {
    const node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    return node;
  };
  var button = (className) => {
    const node = el("button", className);
    node.type = "button";
    return node;
  };
  var setText = (node, text) => {
    const next = text ?? "";
    if (node.textContent !== next) {
      node.textContent = next;
    }
  };
  var setAttr = (node, name, value) => {
    if (value === void 0 || value === null || value === "") {
      node.removeAttribute(name);
    } else if (node.getAttribute(name) !== value) {
      node.setAttribute(name, value);
    }
  };

  // node_modules/@openchamber/sdk/dist/ui/style.js
  var OC_ALIAS = {
    "surface-background": "bg",
    "surface-elevated": "elevated",
    "surface-elevated-foreground": "elevated-fg",
    "surface-foreground": "fg",
    "surface-muted-foreground": "muted",
    "surface-muted": "muted-surface",
    "surface-subtle": "subtle",
    "interactive-border": "border",
    "interactive-hover": "hover",
    "interactive-active": "active",
    "interactive-selection": "selection",
    "interactive-selection-foreground": "selection-fg",
    "interactive-focus-ring": "focus",
    "primary": "primary",
    "primary-foreground": "primary-fg",
    "primary-text": "primary-text",
    "success-text": "success-text",
    "warning-text": "warning-text",
    "error-text": "error-text",
    "info-text": "info-text",
    "status-success": "success",
    "status-warning": "warning",
    "status-error": "error",
    "status-info": "info",
    "font-sans": "font",
    "font-mono": "mono",
    "radius": "radius"
  };
  var v = (name, fallback) => `var(--${name}, var(--oc-${OC_ALIAS[name]}, ${fallback}))`;
  var bg = v("surface-background", "transparent");
  var elevated = v("surface-elevated", "transparent");
  var elevatedFg = v("surface-elevated-foreground", "inherit");
  var fg = v("surface-foreground", "inherit");
  var muted = v("surface-muted-foreground", "gray");
  var secondary = v("surface-muted", "transparent");
  var border = v("interactive-border", "currentColor");
  var hover = v("interactive-hover", "transparent");
  var active = v("interactive-active", "transparent");
  var selection = v("interactive-selection", "transparent");
  var selectionFg = v("interactive-selection-foreground", "inherit");
  var focus = v("interactive-focus-ring", "currentColor");
  var primary = v("primary", "currentColor");
  var primaryText = v("primary-text", "inherit");
  var errorText = v("error-text", "inherit");
  var font = v("font-sans", "inherit");
  var mono = v("font-mono", "monospace");
  var radius = v("radius", "9px");
  var mix = (color, pct, base = "transparent") => `color-mix(in srgb, ${color} ${pct}%, ${base})`;
  var focusRing = `box-shadow: 0 0 0 2px ${focus};`;
  var tone = (name) => {
    const color = v(`status-${name}`, "currentColor");
    return `
.oc-sdk[data-tone="${name}"], .oc-sdk [data-tone="${name}"] { --oc-sdk-tone: ${color}; --oc-sdk-tone-text: ${v(`${name}-text`, "inherit")}; }`;
  };
  var UI_CSS = `
${GUEST_SCROLLBAR_CSS}
.oc-sdk { box-sizing: border-box; color: ${fg}; font-family: ${font}; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }
.oc-sdk :focus-visible { outline: none; ${focusRing} }
.oc-sdk-mono { font-family: ${mono}; }
.oc-sdk-muted { color: ${muted}; }
${tone("success")}${tone("warning")}${tone("error")}${tone("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${primary}; --oc-sdk-tone-text: ${primaryText}; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 36px; padding: 0 14px; border: 1px solid transparent; border-radius: ${radius}; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="sm"] { height: 32px; padding: 0 10px; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { height: 24px; padding: 0 8px; font-size: 0.75rem; border-radius: 6px; }
.oc-sdk-btn[data-variant="default"] { color: ${primaryText}; background: ${mix(primary, 10, bg)}; border-color: ${mix(primary, 12)}; }
.oc-sdk-btn[data-variant="default"]:hover { background: ${mix(primary, 16, bg)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${mix(primary, 22, bg)}; }
.oc-sdk-btn[data-variant="secondary"] { background: ${secondary}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${hover}, ${hover}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${active}, ${active}); }
.oc-sdk-btn[data-variant="outline"] { background: ${elevated}; color: ${elevatedFg}; border-color: ${border}; }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${hover}, ${hover}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${active}, ${active}); }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${hover}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${active}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${v("status-error", "red")}; color: ${errorText}; background: ${mix("var(--oc-sdk-tone)", 7, bg)}; border-color: ${mix("var(--oc-sdk-tone)", 12)}; }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${mix("var(--oc-sdk-tone)", 9, bg)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${mix("var(--oc-sdk-tone)", 11, bg)}; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: 14px; height: 14px; }

.oc-sdk-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; color: ${muted}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${errorText}; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: 36px; padding: 0 12px; border: 0; border-radius: ${radius}; background: ${elevated}; color: ${elevatedFg}; font-size: 0.875rem; line-height: 1.45; appearance: none; box-shadow: inset 0 0 0 1px ${mix(border, 60)}; transition: background 150ms ease-out, box-shadow 150ms ease-out; }
textarea.oc-sdk-input { height: auto; padding: 8px 12px; resize: vertical; }
.oc-sdk-input::placeholder { color: ${muted}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${hover}, ${hover}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { box-shadow: inset 0 0 0 2px ${focus}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input { box-shadow: inset 0 0 0 1px ${v("status-error", "red")}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { box-shadow: inset 0 0 0 2px ${v("status-error", "red")}; }
.oc-sdk-input[data-mono="true"] { font-family: ${mono}; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: 34px; padding-right: 34px; }
.oc-sdk-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: ${muted}; pointer-events: none; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${primary}; }
.oc-sdk-search-clear { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; color: ${muted}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }
.oc-sdk-search-clear:hover { background: ${hover}; color: ${fg}; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: 6px; width: 100%; min-width: 0; height: 32px; padding: 0 8px 0 10px; border: 1px solid ${border}; border-radius: 6px; background: ${elevated}; color: ${elevatedFg}; font-size: 0.8125rem; text-align: left; transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${hover}, ${hover}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${active}, ${active}); }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-value[data-empty="true"] { color: ${muted}; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; color: ${muted}; }
.oc-sdk-popup { --surface-foreground: ${elevatedFg}; position: fixed; z-index: 50; display: flex; flex-direction: column; gap: 2px; min-width: 160px; max-width: calc(100vw - 16px); max-height: min(320px, calc(100vh - 16px)); overflow: auto; padding: 4px; border: 1px solid ${mix(border, 60)}; border-radius: 12px; background: ${elevated}; color: ${elevatedFg}; box-shadow: 0 8px 24px ${mix(fg, 12)}; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: 2px 2px 4px; }
.oc-sdk-popup-search .oc-sdk-input { height: 32px; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; border-radius: 8px; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option[data-active="true"] { background: ${hover}; }
.oc-sdk-option[aria-selected="true"] { background: ${selection}; color: ${selectionFg}; }
.oc-sdk-option[data-destructive="true"] { color: ${errorText}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${mix(v("status-error", "red"), 10)}; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; color: ${muted}; }
.oc-sdk-option-check { flex: 0 0 auto; width: 12px; }
.oc-sdk-popup-empty { padding: 8px; font-size: 0.8125rem; color: ${muted}; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: 8px; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; margin-top: 3px; border: 1px solid ${border}; border-radius: 4px; color: ${primary}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${mix(primary, 65, border)}; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: 36px; height: 20px; border-radius: 9999px; background: ${border}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 9999px; background: ${bg}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${primary}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${focusRing} }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; color: ${muted}; }

.oc-sdk-tabs { display: inline-flex; gap: 2px; padding: 2px; border-radius: 10px; max-width: 100%; overflow: auto; }
.oc-sdk-tabs[data-track="true"] { background: ${mix(fg, 4)}; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border: 1px solid transparent; border-radius: 8px; font-size: 0.8125rem; font-weight: 500; color: ${muted}; white-space: nowrap; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${fg}; }
.oc-sdk-tab[aria-selected="true"] { color: ${selectionFg}; background: ${selection}; border-color: ${border}; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; color: ${muted}; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: 1px 6px; border-radius: 9999px; font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap; background: ${hover}; color: ${muted}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${mix("var(--oc-sdk-tone)", 15)}; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; border-radius: 6px; text-align: left; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${hover}; }
.oc-sdk-row[aria-selected="true"] { background: ${selection}; color: ${selectionFg}; }
.oc-sdk-row-lead { flex: 0 0 auto; width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: ${mono}; font-size: 0.75rem; color: ${muted}; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; color: ${muted}; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; color: ${muted}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { padding: 16px 8px; text-align: center; font-size: 0.8125rem; color: ${muted}; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 40px 16px; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; color: ${muted}; }
.oc-sdk-empty-action { margin-top: 12px; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: ${muted}; }
.oc-sdk-spinner-ring { width: 16px; height: 16px; border: 2px solid ${border}; border-top-color: ${primary}; border-radius: 9999px; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: 12px; height: 12px; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: 12px; padding: 8px 12px; border: 1px solid ${mix("var(--oc-sdk-tone)", 40)}; border-radius: 8px; background: ${mix("var(--oc-sdk-tone)", 10)}; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { font-size: 0.8125rem; color: ${muted}; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: 8px; width: 100%; margin: 8px 0; font-size: 0.75rem; color: ${muted}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; background: ${mix(border, 40)}; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: 4px 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; color: ${muted}; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: 6px; border-radius: 9999px; background: ${border}; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; border-radius: 9999px; background: var(--oc-sdk-tone, ${primary}); transform-origin: left; transition: transform 200ms ease-out; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text a { color: ${primaryText}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { display: block; max-width: 100%; margin: 8px 0; border-radius: 8px; border: 1px solid ${mix(border, 60)}; }
`;

  // node_modules/@openchamber/sdk/dist/ui/button.js
  var ring = () => {
    const spinner = document.createElement("span");
    spinner.className = "oc-sdk-spinner-ring";
    spinner.setAttribute("aria-hidden", "true");
    return spinner;
  };
  var mountButton = (root, initial) => {
    ensureStyle(UI_CSS);
    let props = initial;
    const node = button("oc-sdk oc-sdk-btn");
    const spinner = ring();
    const label = document.createElement("span");
    node.append(label);
    root.append(node);
    const paint = () => {
      node.dataset.variant = props.variant ?? "default";
      node.dataset.size = props.size ?? "default";
      node.disabled = Boolean(props.disabled) || Boolean(props.loading);
      node.dataset.loading = props.loading ? "true" : "false";
      node.setAttribute("aria-busy", props.loading ? "true" : "false");
      if (props.loading && spinner.parentNode !== node) {
        node.prepend(spinner);
      } else if (!props.loading && spinner.parentNode === node) {
        spinner.remove();
      }
      setText(label, props.label);
    };
    const onClick = () => {
      if (props.disabled || props.loading) {
        return;
      }
      props.onClick();
    };
    node.addEventListener("click", onClick);
    paint();
    return {
      update: (next) => {
        props = { ...props, ...next };
        paint();
      },
      dispose: () => {
        node.removeEventListener("click", onClick);
        node.remove();
      }
    };
  };

  // node_modules/@openchamber/sdk/dist/ui/navigation.js
  var navigationKey = (event, axis = "vertical") => {
    const [next, previous] = axis === "vertical" ? ["ArrowDown", "ArrowUp"] : ["ArrowRight", "ArrowLeft"];
    if (event.key === next || event.ctrlKey && event.key.toLowerCase() === "n")
      return "next";
    if (event.key === previous || event.ctrlKey && event.key.toLowerCase() === "p")
      return "previous";
    if (event.key === "Home")
      return "first";
    if (event.key === "End")
      return "last";
    return null;
  };
  var moveListSelection = (items, currentId, key) => {
    const enabled = items.filter((item) => !item.disabled);
    if (enabled.length === 0) {
      return null;
    }
    const first = enabled[0];
    const last = enabled[enabled.length - 1];
    if (key === "first" || !first || !last) {
      return first?.id ?? null;
    }
    if (key === "last") {
      return last.id;
    }
    const index = enabled.findIndex((item) => item.id === currentId);
    if (index === -1) {
      return key === "next" ? first.id : last.id;
    }
    const target = enabled[Math.min(enabled.length - 1, Math.max(0, index + (key === "next" ? 1 : -1)))];
    return target?.id ?? null;
  };

  // node_modules/@openchamber/sdk/dist/ui/tabs.js
  var mountTabs = (root, initial) => {
    ensureStyle(UI_CSS);
    let props = initial;
    const track = el("div", "oc-sdk oc-sdk-tabs");
    track.setAttribute("role", "tablist");
    root.append(track);
    const paint = () => {
      clearNode(track);
      track.dataset.track = props.trackBackground ? "true" : "false";
      for (const item of props.items) {
        const tab = button("oc-sdk-tab");
        tab.setAttribute("role", "tab");
        const active2 = item.id === props.activeId;
        tab.setAttribute("aria-selected", active2 ? "true" : "false");
        tab.tabIndex = active2 ? 0 : -1;
        tab.dataset.id = item.id;
        const label = el("span");
        label.textContent = item.label;
        tab.append(label);
        if (item.count !== void 0) {
          const count = el("span", "oc-sdk-tab-count");
          count.textContent = String(item.count);
          tab.append(count);
        }
        tab.addEventListener("click", () => {
          if (item.id !== props.activeId)
            props.onChange(item.id);
        });
        track.append(tab);
      }
    };
    const onKeyDown = (event) => {
      const step = navigationKey(event, "horizontal");
      if (!step) {
        return;
      }
      const next = moveListSelection(props.items, props.activeId, step);
      if (next && next !== props.activeId) {
        event.preventDefault();
        props.onChange(next);
        const tab = track.querySelector(`[data-id="${CSS.escape(next)}"]`);
        if (tab instanceof HTMLElement)
          tab.focus();
      }
    };
    track.addEventListener("keydown", onKeyDown);
    paint();
    return {
      update: (next) => {
        props = { ...props, ...next };
        paint();
      },
      dispose: () => {
        track.removeEventListener("keydown", onKeyDown);
        track.remove();
      }
    };
  };

  // node_modules/@openchamber/sdk/dist/ui/badge.js
  var applyTone = (node, tone2) => {
    setAttr(node, "data-tone", tone2 && tone2 !== "neutral" ? tone2 : null);
  };
  var mountBadge = (root, initial) => {
    ensureStyle(UI_CSS);
    let props = initial;
    const node = el("span", "oc-sdk oc-sdk-badge");
    root.append(node);
    const paint = () => {
      setText(node, props.label);
      applyTone(node, props.tone);
    };
    paint();
    return {
      update: (next) => {
        props = { ...props, ...next };
        paint();
      },
      dispose: () => {
        node.remove();
      }
    };
  };

  // node_modules/@openchamber/sdk/dist/ui/empty.js
  var mountEmpty = (root, initial) => {
    ensureStyle(UI_CSS);
    let props = initial;
    const shell = el("div", "oc-sdk oc-sdk-empty");
    const title = el("h2", "oc-sdk-empty-title");
    const body = el("p", "oc-sdk-empty-body");
    const slot = el("div", "oc-sdk-empty-action");
    shell.append(title, body, slot);
    root.append(shell);
    let action = null;
    const paint = () => {
      setText(title, props.title);
      setText(body, props.body);
      body.hidden = !props.body;
      slot.hidden = !props.action;
      if (!props.action) {
        action?.dispose();
        action = null;
        return;
      }
      const next = { label: props.action.label, onClick: props.action.onClick };
      if (action) {
        action.update(next);
      } else {
        action = mountButton(slot, { ...next, variant: "outline", size: "sm" });
      }
    };
    paint();
    return {
      update: (next) => {
        props = { ...props, ...next };
        paint();
      },
      dispose: () => {
        action?.dispose();
        action = null;
        shell.remove();
      }
    };
  };

  // node_modules/@openchamber/sdk/dist/ui/spinner.js
  var mountSpinner = (root, initial = {}) => {
    ensureStyle(UI_CSS);
    let props = initial;
    const node = el("span", "oc-sdk oc-sdk-spinner");
    node.setAttribute("role", "status");
    const ring2 = el("span", "oc-sdk-spinner-ring");
    ring2.setAttribute("aria-hidden", "true");
    const label = el("span");
    node.append(ring2, label);
    root.append(node);
    const paint = () => {
      node.dataset.size = props.size ?? "default";
      setText(label, props.label);
      label.hidden = !props.label;
      node.setAttribute("aria-label", props.label ?? "Loading");
    };
    paint();
    return {
      update: (next) => {
        props = { ...props, ...next };
        paint();
      },
      dispose: () => {
        node.remove();
      }
    };
  };

  // node_modules/@openchamber/sdk/dist/ui/banner.js
  var mountBanner = (root, initial) => {
    ensureStyle(UI_CSS);
    let props = initial;
    const node = el("div", "oc-sdk oc-sdk-banner");
    const text = el("div", "oc-sdk-banner-text");
    const title = el("div", "oc-sdk-banner-title");
    const body = el("div", "oc-sdk-banner-body");
    const slot = el("div", "oc-sdk-banner-action");
    text.append(title, body);
    node.append(text, slot);
    root.append(node);
    let action = null;
    const paint = () => {
      node.dataset.tone = props.tone;
      node.setAttribute("role", props.tone === "error" || props.tone === "warning" ? "alert" : "status");
      setText(title, props.title);
      setText(body, props.body);
      body.hidden = !props.body;
      slot.hidden = !props.action;
      if (!props.action) {
        action?.dispose();
        action = null;
        return;
      }
      const next = { label: props.action.label, onClick: props.action.onClick };
      if (action) {
        action.update(next);
      } else {
        action = mountButton(slot, { ...next, variant: "outline", size: "xs" });
      }
    };
    paint();
    return {
      update: (next) => {
        props = { ...props, ...next };
        paint();
      },
      dispose: () => {
        action?.dispose();
        action = null;
        node.remove();
      }
    };
  };

  // node_modules/@openchamber/sdk/dist/ui/separator.js
  var mountSeparator = (root, initial = {}) => {
    ensureStyle(UI_CSS);
    let props = initial;
    const node = el("div", "oc-sdk oc-sdk-separator");
    node.setAttribute("role", "separator");
    const label = el("span");
    node.append(label);
    root.append(node);
    const paint = () => {
      setText(label, props.label);
      label.hidden = !props.label;
      node.dataset.labeled = props.label ? "true" : "false";
    };
    paint();
    return {
      update: (next) => {
        props = { ...props, ...next };
        paint();
      },
      dispose: () => {
        node.remove();
      }
    };
  };

  // node_modules/@openchamber/sdk/dist/ui/progress.js
  var clampProgress = (value) => Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : 0;
  var mountProgress = (root, initial) => {
    ensureStyle(UI_CSS);
    let props = initial;
    const node = el("div", "oc-sdk oc-sdk-progress");
    const caption = el("div", "oc-sdk-progress-label");
    const label = el("span");
    const percent = el("span");
    caption.append(label, percent);
    const track = el("div", "oc-sdk-progress-track");
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "100");
    const fill = el("div", "oc-sdk-progress-fill");
    track.append(fill);
    node.append(caption, track);
    root.append(node);
    const paint = () => {
      const value = clampProgress(props.value);
      applyTone(fill, props.tone);
      fill.style.transform = `scaleX(${value / 100})`;
      track.setAttribute("aria-valuenow", String(value));
      if (props.label)
        track.setAttribute("aria-label", props.label);
      else
        track.removeAttribute("aria-label");
      setText(label, props.label);
      setText(percent, `${value}%`);
      caption.hidden = !props.label;
    };
    paint();
    return {
      update: (next) => {
        props = { ...props, ...next };
        paint();
      },
      dispose: () => {
        node.remove();
      }
    };
  };

  // panel/src/main.js
  var host = connectHost();
  var SERVICE_CODES = /* @__PURE__ */ new Set([
    "NO_SERVICE",
    "SERVICE_FAILED",
    "NOT_GRANTED",
    "DISABLED",
    "HOST_UNAVAILABLE",
    "HOST_TIMEOUT"
  ]);
  var MESSAGES = {
    zh: {
      docTitle: "Goat \u7528\u91CF",
      retry: "\u91CD\u8BD5",
      loading: "\u6B63\u5728\u8BFB\u53D6\u7528\u91CF\u2026",
      refresh: "\u5237\u65B0",
      planFallback: "Goat \u8BA2\u9605",
      periodUnavailable: "\u8BA1\u8D39\u5468\u671F\u4E0D\u53EF\u7528",
      barFiveHour: "5 \u5C0F\u65F6\u7A97\u53E3",
      barWeekly: "\u6BCF\u5468\u7A97\u53E3",
      barMonthly: "\u672C\u6708\u6C60",
      remaining: "\u5269\u4F59",
      used: "\u5DF2\u7528",
      resetSoon: "\u5373\u5C06\u91CD\u7F6E",
      resetUnknown: "\u91CD\u7F6E\u65F6\u95F4\u672A\u77E5",
      resetInDays: (day, hour) => `${day} \u5929 ${hour} \u5C0F\u65F6\u540E\u91CD\u7F6E`,
      resetInHours: (hour) => `${hour} \u5C0F\u65F6\u540E\u91CD\u7F6E`,
      resetInMinutes: (minute) => `${minute} \u5206\u949F\u540E\u91CD\u7F6E`,
      periodEnds: "\u5468\u671F\u81F3",
      cardRequests: "\u8BF7\u6C42",
      cardSuccess: "\u6210\u529F\u7387",
      cardCost: "\u82B1\u8D39",
      cardTokens: "Token",
      cardFailed: (count) => `\u5931\u8D25 ${count}`,
      creditsLabel: "credits",
      metaTurns: (count) => `${count} \u8F6E`,
      metaSessions: (count) => `${count} \u5BF9\u8BDD`,
      metaTokens: (value) => `${value} tokens`,
      metaCached: (pct) => `\u7F13\u5B58 ${pct}`,
      metaSep: " \xB7 ",
      statSessions: "\u5BF9\u8BDD",
      statFailed: "\u5931\u8D25",
      localCost: "\u672C\u5730\u6210\u672C",
      tabToday: "\u4ECA\u65E5",
      tabWeek: "\u672C\u5468",
      tabMonth: "\u672C\u6708",
      tabAll: "\u5168\u90E8",
      statTurns: "\u8F6E\u6B21",
      statTokens: "Token",
      statCost: "\u6210\u672C",
      tokensIn: "\u5165",
      tokensOut: "\u51FA",
      tokensReasoning: "\u601D\u8003",
      tokensCache: "\u7F13\u5B58",
      sepByDay: "\u6309\u5929",
      sepByModel: "\u6309\u6A21\u578B",
      ariaByDay: "\u6309\u5929\u7EDF\u8BA1",
      ariaByModel: "\u6309\u6A21\u578B\u7EDF\u8BA1",
      noActivity: "\u8BE5\u533A\u95F4\u6682\u65E0\u672C\u5730\u6D3B\u52A8",
      recordUnavailable: "\u672C\u5730\u8BB0\u5F55\u4E0D\u53EF\u7528",
      other: "\u5176\u4ED6",
      emptyDash: "\u2014",
      weekdays: ["\u5468\u65E5", "\u5468\u4E00", "\u5468\u4E8C", "\u5468\u4E09", "\u5468\u56DB", "\u5468\u4E94", "\u5468\u516D"],
      unknownModel: "\u672A\u77E5\u6A21\u578B",
      updatedPrefix: "\u66F4\u65B0\u4E8E",
      updatedUnknown: "\u66F4\u65B0\u65F6\u95F4\u672A\u77E5",
      noticePartial: (count) => `\u90E8\u5206\u6570\u636E\u4E0D\u53EF\u7528\uFF08${count}\uFF09`,
      noticeMissingPrefix: "\u90E8\u5206\u6570\u636E\u7F3A\u5931\uFF1A",
      missingPlan: "\u8BA2\u9605",
      missingQuota: "\u989D\u5EA6",
      missingPeriodUsage: "\u5468\u671F\u7528\u91CF",
      missingLocal: "\u672C\u5730\u8BB0\u5F55",
      listSep: "\u3001",
      errorSep: "\uFF1B",
      unknownError: "\u672A\u77E5\u9519\u8BEF",
      dataReadFailed: "\u6570\u636E\u8BFB\u53D6\u5931\u8D25",
      serviceNotReady: "\u672C\u5730\u670D\u52A1\u672A\u5C31\u7EEA",
      serviceHint: "\u8BF7\u5728 \u8BBE\u7F6E \u2192 \u6269\u5C55 \u4E2D\u5141\u8BB8 cc-goat \u7684\u672C\u5730\u670D\u52A1\uFF0C\u9762\u677F\u624D\u80FD\u8BFB\u53D6 CommandCode \u7528\u91CF\u4E0E\u672C\u5730\u6210\u672C\u3002",
      httpReturned: "\u672C\u5730\u670D\u52A1\u8FD4\u56DE",
      badResponse: "\u672C\u5730\u670D\u52A1\u8FD4\u56DE\u4E86\u65E0\u6CD5\u89E3\u6790\u7684\u54CD\u5E94",
      serviceUnavailable: "\u672C\u5730\u670D\u52A1\u4E0D\u53EF\u7528",
      readFailed: "\u8BFB\u53D6\u5931\u8D25"
    },
    en: {
      docTitle: "Goat Usage",
      retry: "Retry",
      loading: "Reading usage\u2026",
      refresh: "Refresh",
      planFallback: "Goat subscription",
      periodUnavailable: "Billing period unavailable",
      barFiveHour: "5h window",
      barWeekly: "Weekly window",
      barMonthly: "Monthly pool",
      remaining: "remaining",
      used: "used",
      resetSoon: "resetting soon",
      resetUnknown: "reset time unknown",
      resetInDays: (day, hour) => `resets in ${day}d ${hour}h`,
      resetInHours: (hour) => `resets in ${hour}h`,
      resetInMinutes: (minute) => `resets in ${minute}m`,
      periodEnds: "period ends",
      cardRequests: "Requests",
      cardSuccess: "Success",
      cardCost: "Cost",
      cardTokens: "Tokens",
      cardFailed: (count) => `${count} failed`,
      creditsLabel: "credits",
      metaTurns: (count) => `${count} turns`,
      metaSessions: (count) => `${count} sessions`,
      metaTokens: (value) => `${value} tokens`,
      metaCached: (pct) => `${pct} cached`,
      metaSep: " \xB7 ",
      statSessions: "Sessions",
      statFailed: "Failed",
      localCost: "Local cost",
      tabToday: "Today",
      tabWeek: "Week",
      tabMonth: "Month",
      tabAll: "All",
      statTurns: "Turns",
      statTokens: "Tokens",
      statCost: "Cost",
      tokensIn: "in",
      tokensOut: "out",
      tokensReasoning: "reasoning",
      tokensCache: "cache",
      sepByDay: "By day",
      sepByModel: "By model",
      ariaByDay: "By-day stats",
      ariaByModel: "By-model stats",
      noActivity: "No local activity in this range",
      recordUnavailable: "Local record unavailable",
      other: "Other",
      emptyDash: "\u2014",
      weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      unknownModel: "Unknown model",
      updatedPrefix: "Updated",
      updatedUnknown: "Update time unknown",
      noticePartial: (count) => `partial data unavailable (${count})`,
      noticeMissingPrefix: "missing data: ",
      missingPlan: "plan",
      missingQuota: "quota",
      missingPeriodUsage: "period usage",
      missingLocal: "local records",
      listSep: ", ",
      errorSep: "; ",
      unknownError: "unknown error",
      dataReadFailed: "Could not read data",
      serviceNotReady: "Local service not ready",
      serviceHint: "Allow the cc-goat local service in Settings \u2192 Extensions so the panel can read CommandCode usage and local cost.",
      httpReturned: "local service returned",
      badResponse: "local service returned an unparseable response",
      serviceUnavailable: "local service unavailable",
      readFailed: "read failed"
    }
  };
  var lang = "en";
  var resolveLang = (locale) => typeof locale === "string" && locale.trim().toLowerCase().startsWith("zh") ? "zh" : "en";
  var t = (key) => MESSAGES[lang][key] ?? MESSAGES.en[key] ?? key;
  var RANGE_TABS = [
    { id: "today", key: "tabToday" },
    { id: "week", key: "tabWeek" },
    { id: "month", key: "tabMonth" },
    { id: "all", key: "tabAll" }
  ];
  var TOP_MODELS = 5;
  var MODEL_COLORS = [
    "var(--oc-primary)",
    "var(--oc-info)",
    "var(--oc-success)",
    "var(--oc-warning)",
    "var(--oc-error)",
    "color-mix(in oklab, var(--oc-muted) 45%, var(--oc-elevated))"
  ];
  var OTHER_SLOT = TOP_MODELS;
  var BAR_ROWS = 10;
  var COLUMN_COUNT = 7;
  var CALENDAR_CELLS = 42;
  var PLOT_PX = 96;
  var PLOT_INNER_PX = PLOT_PX - 1;
  var SEG_MIN_PX = 4;
  var TIP_GAP = 12;
  var TIP_PAD = 8;
  var HEAT_MIN_MIX = 10;
  var HEAT_MAX_MIX = 60;
  var state = { range: "today", dataRange: null, data: null, loading: false, problem: null };
  var cache = /* @__PURE__ */ new Map();
  var ui = null;
  var fetchSeq = 0;
  var mounted = false;
  var isObj = (v2) => Boolean(v2) && typeof v2 === "object" && !Array.isArray(v2);
  var isNum = (v2) => typeof v2 === "number" && Number.isFinite(v2);
  var num = (v2) => isNum(v2) ? v2 : null;
  var int = (v2) => isNum(v2) ? Math.round(v2).toLocaleString("en-US") : "\u2014";
  var money = (v2) => isNum(v2) ? `$${v2.toFixed(2)}` : "\u2014";
  var mtok = (v2) => {
    if (!isNum(v2)) return "\u2014";
    const m = v2 / 1e6;
    return `${m >= 1 ? m.toFixed(1) : m.toFixed(2)}M`;
  };
  var pctText = (v2) => isNum(v2) ? `${v2.toFixed(1).replace(/\.0$/, "")}%` : "\u2014";
  var plainInt = (v2) => isNum(v2) ? String(Math.round(v2)) : "\u2014";
  var money4 = (v2) => isNum(v2) ? `$${v2.toFixed(4)}` : "\u2014";
  var tokenKeys = ["input", "output", "reasoning", "cache_read", "cache_write"];
  var tokenTotal = (row) => tokenKeys.reduce((sum, key) => sum + (num(row[key]) ?? 0), 0);
  var cacheHitRate = (row) => {
    const fresh = num(row.input) ?? 0, read = num(row.cache_read) ?? 0;
    const denom = fresh + read;
    return denom > 0 ? read / denom : null;
  };
  var cachePctText = (row) => {
    const rate = cacheHitRate(row);
    return rate === null ? t("emptyDash") : `${Math.round(rate * 100)}%`;
  };
  var toneFor = (pct) => pct >= 90 ? "error" : pct >= 60 ? "warning" : void 0;
  var pctOf = (win) => {
    const pct = isObj(win) ? num(win.pct) : null;
    if (pct !== null) return pct;
    const used = isObj(win) ? num(win.used) : null;
    const cap = isObj(win) ? num(win.cap) : null;
    if (used === null || cap === null) return null;
    return cap > 0 ? used / cap * 100 : 0;
  };
  var pad2 = (n) => String(n).padStart(2, "0");
  var asDate = (v2) => {
    const d = v2 instanceof Date ? v2 : new Date(v2);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  var dateText = (v2) => {
    const d = asDate(v2);
    return d ? `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` : "\u2014";
  };
  var timeText = (v2) => {
    const d = asDate(v2);
    return d ? `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}` : "\u2014";
  };
  var shortDay = (day) => typeof day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day) ? day.slice(5) : String(day ?? "\u2014");
  var countdownText = (resetAt) => {
    const at = num(resetAt);
    if (at === null) return t("resetUnknown");
    const ms = at - Date.now();
    if (ms <= 0) return t("resetSoon");
    const day = Math.floor(ms / 864e5), hour = Math.floor(ms % 864e5 / 36e5);
    const minute = Math.floor(ms % 36e5 / 6e4);
    if (day > 0) return t("resetInDays")(day, hour);
    return hour > 0 ? t("resetInHours")(hour) : t("resetInMinutes")(Math.max(1, minute));
  };
  var el2 = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== void 0) node.textContent = text;
    return node;
  };
  var costOf = (row) => isObj(row) ? num(row.cost) ?? 0 : 0;
  var sortModels = (rows) => (Array.isArray(rows) ? rows.filter(isObj) : []).slice().sort((a, b) => costOf(b) - costOf(a));
  var shortModel = (id) => {
    const raw = typeof id === "string" && id ? id : "";
    if (!raw) return t("unknownModel");
    const slash = raw.lastIndexOf("/");
    return slash >= 0 && slash < raw.length - 1 ? raw.slice(slash + 1) : raw;
  };
  var rankModels = (rows) => {
    const rank = /* @__PURE__ */ new Map();
    rows.forEach((row, i) => {
      if (typeof row.model === "string" && row.model && !rank.has(row.model)) rank.set(row.model, i);
    });
    return rank;
  };
  var slotFor = (rank, id) => {
    const index = typeof id === "string" ? rank.get(id) : void 0;
    return isNum(index) && index < TOP_MODELS ? index : OTHER_SLOT;
  };
  var localDate = (key) => {
    if (typeof key !== "string") return null;
    const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
    if (!parts) return null;
    const d = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  };
  var dayKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  var windowDays = (from, to, fallback) => {
    const start = localDate(from), end = localDate(to);
    if (!start || !end || end < start) return fallback;
    const days = [];
    const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    while (cur <= end && days.length < 31) {
      days.push(dayKey(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return days.length > 0 ? days : fallback;
  };
  var fitHeights = (values, total) => {
    const used = values.filter((v2) => v2 > 0).length;
    const sum = values.reduce((a, b) => a + b, 0);
    if (used === 0 || !(total > 0) || !(sum > 0)) return values.map(() => 0);
    if (used * SEG_MIN_PX >= total) return values.map((v2) => v2 > 0 ? Math.floor(total / used) : 0);
    const rest = total - used * SEG_MIN_PX;
    return values.map((v2) => v2 > 0 ? Math.floor(SEG_MIN_PX + v2 / sum * rest) : 0);
  };
  function buildBar(name) {
    const box = el2("div", "cg-bar"), progressSlot = el2("div");
    const sub = el2("div", "cg-bar-sub"), note = el2("div", "cg-bar-sub");
    box.append(progressSlot, sub, note);
    return { box, progress: mountProgress(progressSlot, { value: 0, label: name }), sub, note };
  }
  function buildStat(label) {
    const box = el2("div", "cg-stat"), value = el2("span", "cg-stat-value", "\u2014");
    box.append(el2("span", "cg-stat-label", label), value);
    return { box, value };
  }
  function buildCard(label) {
    const box = el2("div", "cg-card");
    const value = el2("div", "cg-card-value", "\u2014");
    const sub = el2("div", "cg-card-sub");
    sub.hidden = true;
    box.append(el2("div", "cg-card-label", label), value, sub);
    return { box, value, sub };
  }
  function refreshIcon() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "14");
    svg.setAttribute("height", "14");
    svg.setAttribute("fill", "currentColor");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M5.463 4.433A9.961 9.961 0 0 1 12 2c5.523 0 10 4.477 10 10 0 2.136-.67 4.116-1.81 5.74L17 12h3A8 8 0 0 0 6.46 6.228l-.997-1.795Zm13.074 15.134A9.961 9.961 0 0 1 12 22C6.477 22 2 17.523 2 12c0-2.136.67-4.116 1.81-5.74L7 12H4a8 8 0 0 0 13.54 5.772l.997 1.795Z");
    svg.append(path);
    return svg;
  }
  function buildRefreshButton(slot) {
    const node = el2("button", "cg-iconbtn");
    node.type = "button";
    const icon2 = refreshIcon();
    const ring2 = el2("span", "cg-iconbtn-ring");
    ring2.hidden = true;
    node.append(icon2, ring2);
    const sync = (loading) => {
      node.disabled = Boolean(loading);
      node.setAttribute("aria-busy", loading ? "true" : "false");
      ring2.hidden = !loading;
      icon2.hidden = Boolean(loading);
    };
    const label = t("refresh");
    node.setAttribute("aria-label", label);
    node.title = label;
    node.addEventListener("click", () => {
      if (!node.disabled) void manualRefresh();
    });
    slot.append(node);
    sync(false);
    return { node, update: (next) => sync(next.loading) };
  }
  var tip = { box: null, head: null, model: null, stat: null, tokens: null };
  var tipSegNode = null;
  function ensureTip() {
    if (tip.box) return tip.box;
    const box = el2("div", "cg-tip");
    const head = el2("div", "cg-tip-head");
    const model = el2("div", "cg-tip-model");
    const stat = el2("div", "cg-tip-line");
    const tokens = el2("div", "cg-tip-line");
    box.append(head, model, stat, tokens);
    box.hidden = true;
    document.body.append(box);
    Object.assign(tip, { box, head, model, stat, tokens });
    return box;
  }
  function tipLines(seg) {
    const weekday = seg.date ? t("weekdays")[seg.date.getDay()] : "";
    return [
      weekday ? `${seg.day} ${weekday}` : String(seg.day ?? ""),
      seg.label,
      `${money4(seg.cost)} \xB7 ${t("metaTurns")(int(num(seg.turns)))} \xB7 ${t("metaSessions")(int(num(seg.sessions)))}`,
      `${mtok(num(seg.input))} ${t("tokensIn")} / ${mtok(num(seg.output))} ${t("tokensOut")}`
    ];
  }
  function positionTip(x, y) {
    const box = tip.box;
    const width = box.offsetWidth, height = box.offsetHeight;
    const maxLeft = Math.max(TIP_PAD, window.innerWidth - width - TIP_PAD);
    const maxTop = Math.max(TIP_PAD, window.innerHeight - height - TIP_PAD);
    let left = x + TIP_GAP;
    if (left > maxLeft) left = x - TIP_GAP - width;
    let top = y + TIP_GAP;
    if (top > maxTop) top = y - TIP_GAP - height;
    box.style.left = `${Math.round(Math.min(Math.max(TIP_PAD, left), maxLeft))}px`;
    box.style.top = `${Math.round(Math.min(Math.max(TIP_PAD, top), maxTop))}px`;
  }
  function showTip(node, x, y) {
    const seg = node.cgSeg;
    if (!seg) return;
    const lines = tipLines(seg);
    ensureTip();
    tip.head.textContent = lines[0];
    tip.model.textContent = lines[1];
    tip.stat.textContent = lines[2];
    tip.tokens.textContent = lines[3];
    tip.box.hidden = false;
    tipSegNode = node;
    positionTip(x, y);
  }
  function hideTip() {
    if (!tip.box || tip.box.hidden) return;
    tip.box.hidden = true;
    tipSegNode = null;
  }
  function segAt(target, stack) {
    const node = target instanceof Element ? target.closest(".cg-seg") : null;
    return node && node.cgSeg && stack.contains(node) ? node : null;
  }
  function buildLegend() {
    const box = el2("div", "cg-legend");
    const items = [];
    for (let i = 0; i < MODEL_COLORS.length; i++) {
      const item = el2("span", "cg-lg-item");
      item.style.setProperty("--cg-color", MODEL_COLORS[i]);
      item.hidden = true;
      box.append(item);
      items.push(item);
    }
    return { box, items };
  }
  function buildColumns() {
    const box = el2("div", "cg-chart");
    box.style.setProperty("--cg-plot", `${PLOT_PX}px`);
    const legend = buildLegend();
    const row = el2("div", "cg-cols");
    const cols = [];
    for (let i = 0; i < COLUMN_COUNT; i++) {
      const col = el2("div", "cg-col");
      const stack = el2("div", "cg-stack");
      stack.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch") return;
        const node = segAt(event.target, stack);
        if (!node) {
          hideTip();
          return;
        }
        if (tipSegNode !== node) showTip(node, event.clientX, event.clientY);
        else positionTip(event.clientX, event.clientY);
      });
      stack.addEventListener("pointerleave", (event) => {
        if (event.pointerType !== "touch") hideTip();
      });
      stack.addEventListener("pointerdown", (event) => {
        const node = segAt(event.target, stack);
        if (!node) {
          hideTip();
          return;
        }
        if (event.pointerType === "touch") {
          if (tipSegNode === node) hideTip();
          else showTip(node, event.clientX, event.clientY);
        }
      });
      const value = el2("span", "cg-col-value");
      const day = el2("span", "cg-col-day");
      col.append(stack, value, day);
      col.hidden = true;
      row.append(col);
      cols.push({ col, stack, value, day, segs: [] });
    }
    box.append(legend.box, row);
    return { box, legend, row, cols };
  }
  function buildCalendar() {
    const box = el2("div", "cg-chart");
    const head = el2("div", "cg-cal-head");
    const heads = [];
    for (let i = 0; i < COLUMN_COUNT; i++) {
      const cell = el2("span", "cg-cal-dow");
      head.append(cell);
      heads.push(cell);
    }
    const grid = el2("div", "cg-cal");
    const cells = [];
    for (let i = 0; i < CALENDAR_CELLS; i++) {
      const cell = el2("div", "cg-cell");
      cell.hidden = true;
      grid.append(cell);
      cells.push(cell);
    }
    box.append(head, grid);
    return { box, heads, cells };
  }
  function buildModels() {
    const box = el2("div", "cg-models");
    const rows = [];
    for (let i = 0; i < BAR_ROWS + 1; i++) {
      const row = el2("div", "cg-model");
      const top = el2("div", "cg-model-top");
      const name = el2("span", "cg-model-name");
      const cost = el2("span", "cg-model-cost");
      top.append(name, cost);
      const meta = el2("div", "cg-model-meta");
      const track = el2("div", "cg-model-track");
      const fill = el2("div", "cg-model-fill");
      track.append(fill);
      row.append(top, meta, track);
      row.hidden = true;
      box.append(row);
      rows.push({ row, name, cost, meta, fill });
    }
    return { box, rows };
  }
  function buildUi() {
    const root = document.getElementById("root");
    const retry = { label: t("retry"), onClick: () => void manualRefresh() };
    const spinnerWrap = el2("div", "cg-state");
    mountSpinner(spinnerWrap, { label: t("loading") });
    const emptyWrap = el2("div", "cg-state");
    emptyWrap.hidden = true;
    const empty = mountEmpty(emptyWrap, { title: "", action: retry });
    const content = el2("div", "cg-shell");
    content.hidden = true;
    const planName = el2("span", "cg-plan", "\u2014"), badgeSlot = el2("span");
    const periodLine = el2("div", "cg-period", "\u2014");
    const refreshSlot = el2("span", "cg-refresh");
    const headTop = el2("div", "cg-head-top");
    headTop.append(planName, badgeSlot, el2("span", "cg-spacer"), refreshSlot);
    const head = el2("header", "cg-head");
    head.append(headTop, periodLine);
    const bannerSlot = el2("div");
    bannerSlot.hidden = true;
    const banner = mountBanner(bannerSlot, { tone: "warning", title: "" });
    const cards = el2("div", "cg-cards");
    const cardRequests = buildCard(t("cardRequests"));
    const cardSuccess = buildCard(t("cardSuccess"));
    const cardCost = buildCard(t("cardCost"));
    const cardTokens = buildCard(t("cardTokens"));
    cards.append(cardRequests.box, cardSuccess.box, cardCost.box, cardTokens.box);
    const bars = el2("div", "cg-bars");
    const fiveHour = buildBar(t("barFiveHour"));
    const weekly = buildBar(t("barWeekly"));
    const monthly = buildBar(t("barMonthly"));
    bars.append(fiveHour.box, weekly.box, monthly.box);
    const localRange = el2("span", "cg-sec-note", "");
    const localHead = el2("div", "cg-sec-head");
    localHead.append(el2("span", "cg-sec-title", t("localCost")), localRange);
    const tabsSlot = el2("div", "cg-tabs");
    const tabs = mountTabs(tabsSlot, {
      items: RANGE_TABS.map(({ id, key }) => ({ id, label: t(key) })),
      activeId: state.range,
      trackBackground: true,
      onChange: (next) => {
        if (next !== state.range) selectRange(next);
      }
    });
    const stats = el2("div", "cg-stats");
    const statTurns = buildStat(t("statTurns")), statTokens = buildStat(t("statTokens")), statCost = buildStat(t("statCost"));
    stats.append(statTurns.box, statTokens.box, statCost.box);
    const statsNote = el2("div", "cg-stats-note", "");
    const localNote = el2("div", "cg-note", "");
    localNote.hidden = true;
    const daySepSlot = el2("div");
    mountSeparator(daySepSlot, { label: t("sepByDay") });
    const dayChartSlot = el2("div");
    dayChartSlot.setAttribute("role", "group");
    dayChartSlot.setAttribute("aria-label", t("ariaByDay"));
    const columns = buildColumns();
    const calendar = buildCalendar();
    dayChartSlot.append(columns.box, calendar.box);
    columns.box.hidden = true;
    calendar.box.hidden = true;
    const modelSepSlot = el2("div");
    mountSeparator(modelSepSlot, { label: t("sepByModel") });
    const models = buildModels();
    models.box.setAttribute("role", "group");
    models.box.setAttribute("aria-label", t("ariaByModel"));
    const localSection = el2("section", "cg-section");
    localSection.append(
      localHead,
      tabsSlot,
      stats,
      statsNote,
      localNote,
      daySepSlot,
      dayChartSlot,
      modelSepSlot,
      models.box
    );
    const updatedLine = el2("span", "cg-foot-note", "\u2014");
    const footRow = el2("div", "cg-foot-row");
    footRow.append(updatedLine);
    const foot = el2("footer", "cg-foot");
    foot.append(footRow);
    const badge = mountBadge(badgeSlot, { label: "" });
    badgeSlot.hidden = true;
    const refreshButton = buildRefreshButton(refreshSlot);
    content.append(head, cards, bannerSlot, bars, localSection, foot);
    root.append(spinnerWrap, emptyWrap, content);
    ui = {
      spinnerWrap,
      emptyWrap,
      empty,
      content,
      planName,
      badgeSlot,
      badge,
      periodLine,
      bannerSlot,
      banner,
      cards: { requests: cardRequests, success: cardSuccess, cost: cardCost, tokens: cardTokens },
      fiveHour,
      weekly,
      monthly,
      tabs,
      localRange,
      statTurns,
      statTokens,
      statCost,
      statsNote,
      localNote,
      daySepSlot,
      dayChartSlot,
      columns,
      calendar,
      modelSepSlot,
      models,
      updatedLine,
      refreshButton
    };
  }
  function updateLegend(chart, models) {
    for (let i = 0; i < TOP_MODELS; i++) {
      const row = models[i];
      const item = chart.legend.items[i];
      item.hidden = !row;
      if (row) item.textContent = shortModel(row.model);
    }
    const tail = chart.legend.items[OTHER_SLOT];
    tail.hidden = models.length <= TOP_MODELS;
    tail.textContent = t("other");
  }
  function paintStack(cell, segs, heights) {
    while (cell.segs.length < segs.length) {
      const node = el2("div", "cg-seg");
      node.setAttribute("role", "img");
      cell.stack.append(node);
      cell.segs.push(node);
    }
    const topIndex = heights.reduce((acc, height, i) => height > 0 ? i : acc, -1);
    cell.segs.forEach((node, i) => {
      const seg = segs[i];
      if (!seg) {
        node.hidden = true;
        node.cgSeg = null;
        node.removeAttribute("aria-label");
        return;
      }
      node.hidden = false;
      node.cgSeg = seg;
      node.classList.toggle("is-top", i === topIndex);
      node.style.setProperty("--cg-color", MODEL_COLORS[seg.slot] ?? MODEL_COLORS[OTHER_SLOT]);
      node.style.height = `${heights[i]}px`;
      node.setAttribute("aria-label", tipLines(node.cgSeg).join(" \xB7 "));
    });
  }
  function updateColumns(chart, local, models, rank, byDay) {
    hideTip();
    const lookup = /* @__PURE__ */ new Map();
    const fallback = [];
    for (const row of byDay) {
      if (typeof row.day !== "string") continue;
      lookup.set(row.day, row);
      fallback.push(row.day);
    }
    const days = windowDays(local.from, local.to, fallback).slice(-COLUMN_COUNT);
    const prepared = days.map((key) => {
      const row = lookup.get(key);
      const groups = /* @__PURE__ */ new Map();
      if (row && Array.isArray(row.models)) {
        for (const item of row.models.filter(isObj)) {
          const cost = Math.max(0, costOf(item));
          if (cost <= 0) continue;
          const slot = slotFor(rank, item.model);
          const agg = groups.get(slot) ?? {
            count: 0,
            cost: 0,
            turns: 0,
            input: 0,
            output: 0,
            reasoning: 0,
            cache_read: 0,
            cache_write: 0,
            sessions: 0,
            model: null
          };
          agg.count += 1;
          agg.cost += cost;
          agg.turns += num(item.turns) ?? 0;
          agg.input += num(item.input) ?? 0;
          agg.output += num(item.output) ?? 0;
          agg.reasoning += num(item.reasoning) ?? 0;
          agg.cache_read += num(item.cache_read) ?? 0;
          agg.cache_write += num(item.cache_write) ?? 0;
          agg.sessions += num(item.sessions) ?? 0;
          agg.model = typeof item.model === "string" && item.model ? item.model : agg.model;
          groups.set(slot, agg);
        }
      }
      const declared = row ? num(row.cost) : null;
      const total = Math.max(0, declared ?? [...groups.values()].reduce((acc, agg) => acc + agg.cost, 0));
      if (groups.size === 0 && total > 0) {
        groups.set(OTHER_SLOT, {
          count: 0,
          cost: total,
          turns: 0,
          input: 0,
          output: 0,
          reasoning: 0,
          cache_read: 0,
          cache_write: 0,
          sessions: 0,
          model: null
        });
      }
      const date = localDate(key);
      const segs = [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([slot, agg]) => ({
        slot,
        cost: agg.cost,
        day: key,
        date,
        label: agg.count > 1 ? t("other") : agg.model ? shortModel(agg.model) : t("unknownModel"),
        turns: agg.count > 0 ? agg.turns : null,
        sessions: agg.count === 1 ? num(agg.sessions) : null,
        input: agg.input,
        output: agg.output
      }));
      return { key, date, total, segs, hasActivity: Boolean(row) };
    });
    const max = prepared.reduce((acc, day) => Math.max(acc, day.total), 0);
    const weekdays = t("weekdays");
    chart.cols.forEach((cell, i) => {
      const day = prepared[i];
      if (!day) {
        cell.col.hidden = true;
        return;
      }
      cell.col.hidden = false;
      const budget = max > 0 ? Math.round(day.total / max * PLOT_INNER_PX) : 0;
      paintStack(cell, day.segs, fitHeights(day.segs.map((seg) => seg.cost), budget));
      cell.value.textContent = day.hasActivity ? money(day.total) : t("emptyDash");
      cell.value.classList.toggle("is-zero", day.hasActivity && day.total <= 0);
      cell.day.textContent = day.date ? weekdays[day.date.getDay()] ?? shortDay(day.key) : shortDay(day.key);
    });
    updateLegend(chart, models);
  }
  function updateCalendar(chart, local, byDay) {
    const base = localDate(local.from) ?? (byDay[0] ? localDate(byDay[0].day) : null);
    if (!base) return;
    const year = base.getFullYear(), month = base.getMonth();
    const count = new Date(year, month + 1, 0).getDate();
    const leading = new Date(year, month, 1).getDay();
    const lookup = /* @__PURE__ */ new Map();
    for (const row of byDay) if (typeof row.day === "string") lookup.set(row.day, row);
    const costs = [];
    for (let d = 1; d <= count; d++) {
      const row = lookup.get(`${year}-${pad2(month + 1)}-${pad2(d)}`);
      costs.push(row ? Math.max(0, costOf(row)) : 0);
    }
    const max = costs.reduce((a, b) => Math.max(a, b), 0);
    const weekdays = t("weekdays");
    chart.heads.forEach((node, i) => {
      node.textContent = weekdays[i] ?? "";
    });
    chart.cells.forEach((cell, i) => {
      const offset = i - leading;
      if (offset < 0 || offset >= count) {
        cell.hidden = true;
        return;
      }
      cell.hidden = false;
      cell.style.gridColumn = String(i % COLUMN_COUNT + 1);
      cell.style.gridRow = String(Math.floor(i / COLUMN_COUNT) + 1);
      const cost = costs[offset];
      cell.dataset.day = String(offset + 1);
      if (cost > 0 && max > 0) {
        const ratio = Math.min(1, cost / max) ** 0.7;
        const mix2 = (HEAT_MIN_MIX + (HEAT_MAX_MIX - HEAT_MIN_MIX) * ratio).toFixed(1);
        cell.dataset.cost = money(cost);
        cell.style.background = `color-mix(in oklab, var(--oc-primary) ${mix2}%, var(--oc-elevated))`;
      } else {
        cell.dataset.cost = t("emptyDash");
        cell.style.background = "";
      }
    });
  }
  var metaText = (row) => [
    t("metaTurns")(int(num(row.turns))),
    t("metaSessions")(int(num(row.sessions))),
    t("metaTokens")(mtok(tokenTotal(row))),
    t("metaCached")(cachePctText(row))
  ].join(t("metaSep"));
  function updateModels(chart, models) {
    const top = models.slice(0, BAR_ROWS);
    const rest = models.slice(BAR_ROWS);
    const max = top.length > 0 ? costOf(top[0]) : 0;
    const rows = top.map((row, i) => ({
      name: shortModel(row.model),
      cost: costOf(row),
      slot: i < TOP_MODELS ? i : OTHER_SLOT,
      meta: metaText(row)
    }));
    if (rest.length > 0) {
      const tail = { turns: 0, cost: 0, input: 0, output: 0, reasoning: 0, cache_read: 0, cache_write: 0, sessions: null };
      for (const row of rest) {
        tail.turns += num(row.turns) ?? 0;
        tail.cost += costOf(row);
        for (const key of tokenKeys) tail[key] += num(row[key]) ?? 0;
      }
      rows.push({ name: t("other"), cost: tail.cost, slot: OTHER_SLOT, meta: metaText(tail) });
    }
    chart.rows.forEach((cell, i) => {
      const row = rows[i];
      if (!row) {
        cell.row.hidden = true;
        return;
      }
      cell.row.hidden = false;
      cell.row.style.setProperty("--cg-color", MODEL_COLORS[row.slot] ?? MODEL_COLORS[OTHER_SLOT]);
      cell.name.textContent = row.name;
      cell.cost.textContent = money(row.cost);
      cell.meta.textContent = row.meta;
      cell.fill.style.width = max > 0 ? `${(Math.min(1, row.cost / max) * 100).toFixed(1)}%` : "0%";
    });
  }
  function renderHeader(d) {
    const plan = isObj(d.plan) ? d.plan : null;
    const planId = plan && typeof plan.planId === "string" && plan.planId ? plan.planId : null;
    const status = plan && typeof plan.status === "string" && plan.status ? plan.status : null;
    const start = plan ? plan.periodStart : null;
    const end = plan ? plan.periodEnd : null;
    ui.planName.textContent = planId ?? t("planFallback");
    ui.badgeSlot.hidden = !status;
    if (status) ui.badge.update({ label: status, tone: status === "active" ? "success" : "warning" });
    ui.periodLine.textContent = start && end ? `${dateText(start)} \u2192 ${dateText(end)}` : t("periodUnavailable");
  }
  function fillWindowBar(bar, name, win) {
    const pct = pctOf(win);
    if (pct === null) {
      bar.box.hidden = true;
      return;
    }
    const cap = num(win.cap);
    const used = num(win.used);
    const remaining = cap !== null && used !== null ? Math.max(0, cap - used) : null;
    bar.box.hidden = false;
    bar.progress.update({ value: pct, label: `${name} \xB7 ${pctText(pct)}`, tone: toneFor(pct) });
    bar.sub.textContent = `${t("remaining")} ${money(remaining)} \xB7 ${countdownText(win.resetAt)}`;
    bar.sub.hidden = false;
    bar.note.hidden = true;
  }
  function fillMonthlyBar(d) {
    const bar = ui.monthly;
    const credits = isObj(d.credits) ? d.credits : null;
    const usage = isObj(d.periodUsage) ? d.periodUsage : null;
    const used = usage ? num(usage.totalCost) : null;
    const remaining = credits ? num(credits.monthlyRemaining) : null;
    const total = used !== null && remaining !== null ? used + remaining : null;
    if (total === null) {
      bar.box.hidden = true;
      return;
    }
    const pct = total > 0 ? used / total * 100 : 0;
    const end = isObj(d.plan) ? d.plan.periodEnd : null;
    bar.box.hidden = false;
    bar.progress.update({ value: pct, label: `${t("barMonthly")} \xB7 ${pctText(pct)}`, tone: toneFor(pct) });
    bar.sub.textContent = `${t("used")} ${money(used)} / ${money(total)} \xB7 ${t("remaining")} ${money(remaining)}`;
    bar.sub.hidden = false;
    bar.note.textContent = end ? `${t("periodEnds")} ${dateText(end)}` : "";
    bar.note.hidden = !end;
  }
  function renderBars(d) {
    const windows = isObj(d.windows) ? d.windows : null;
    fillWindowBar(ui.fiveHour, t("barFiveHour"), windows && isObj(windows.fiveHour) ? windows.fiveHour : null);
    fillWindowBar(ui.weekly, t("barWeekly"), windows && isObj(windows.weekly) ? windows.weekly : null);
    fillMonthlyBar(d);
  }
  function renderCards(d) {
    const usage = isObj(d.periodUsage) ? d.periodUsage : null;
    const cards = ui.cards;
    const all = [cards.requests, cards.success, cards.cost, cards.tokens];
    if (!usage) {
      for (const card of all) {
        card.value.textContent = t("emptyDash");
        card.sub.textContent = "";
        card.sub.hidden = true;
      }
      return;
    }
    cards.requests.value.textContent = plainInt(num(usage.totalCount));
    cards.requests.sub.textContent = t("cardFailed")(plainInt(num(usage.failedCount)));
    cards.requests.sub.hidden = false;
    const rate = num(usage.successRate);
    cards.success.value.textContent = isNum(rate) ? `${rate.toFixed(2)}%` : t("emptyDash");
    cards.success.sub.hidden = true;
    cards.cost.value.textContent = money4(num(usage.totalCost));
    cards.cost.sub.textContent = `${money(num(usage.totalCredits))} ${t("creditsLabel")}`;
    cards.cost.sub.hidden = false;
    cards.tokens.value.textContent = mtok(num(usage.tokens));
    cards.tokens.sub.textContent = `${mtok(num(usage.tokensIn))} ${t("tokensIn")} / ${mtok(num(usage.tokensOut))} ${t("tokensOut")}`;
    cards.tokens.sub.hidden = false;
  }
  function renderLocal(d) {
    hideTip();
    const local = isObj(d.local) ? d.local : null;
    const totals = local && isObj(local.totals) ? local.totals : null;
    const from = local && typeof local.from === "string" ? local.from : null;
    const to = local && typeof local.to === "string" ? local.to : null;
    ui.localRange.textContent = from && to ? from === to ? shortDay(from) : `${shortDay(from)} ~ ${shortDay(to)}` : "";
    if (totals) {
      const counters = tokenKeys.map((key) => num(totals[key]) ?? 0);
      ui.statTurns.value.textContent = int(num(totals.turns));
      ui.statTokens.value.textContent = mtok(counters.reduce((a, b) => a + b, 0));
      ui.statCost.value.textContent = money(num(totals.cost));
      ui.statsNote.textContent = [
        `${t("tokensIn")} ${mtok(counters[0])}`,
        `${t("tokensOut")} ${mtok(counters[1])}`,
        `${t("tokensReasoning")} ${mtok(counters[2])}`,
        `${t("tokensCache")} ${mtok(counters[3] + counters[4])}`,
        `${t("statSessions")} ${int(num(totals.sessions))}`,
        `${t("statFailed")} ${int(num(totals.failed))}`
      ].join(t("metaSep"));
    } else {
      const dash = t("emptyDash");
      ui.statTurns.value.textContent = dash;
      ui.statTokens.value.textContent = dash;
      ui.statCost.value.textContent = dash;
      ui.statsNote.textContent = t("recordUnavailable");
    }
    const byDay = local && Array.isArray(local.byDay) ? local.byDay.filter(isObj) : [];
    const models = local ? sortModels(local.byModel) : [];
    const rank = rankModels(models);
    const hasData = Boolean(local) && (byDay.length > 0 || models.length > 0);
    const view = state.dataRange ?? state.range;
    ui.localNote.hidden = hasData;
    ui.localNote.textContent = local ? t("noActivity") : t("recordUnavailable");
    const showDay = hasData && (view === "week" || view === "month") && byDay.length > 0;
    ui.daySepSlot.hidden = !showDay;
    ui.dayChartSlot.hidden = !showDay;
    ui.modelSepSlot.hidden = !hasData;
    ui.models.box.hidden = !hasData;
    if (showDay) {
      const isMonth = view === "month";
      ui.columns.box.hidden = isMonth;
      ui.calendar.box.hidden = !isMonth;
      if (isMonth) updateCalendar(ui.calendar, local, byDay);
      else updateColumns(ui.columns, local, models, rank, byDay);
    }
    if (hasData) updateModels(ui.models, models);
  }
  function renderFooter(d) {
    ui.updatedLine.textContent = d.generatedAt ? `${t("updatedPrefix")} ${timeText(d.generatedAt)}` : t("updatedUnknown");
  }
  function renderNotice(d) {
    const errors = d && Array.isArray(d.errors) ? d.errors.filter(isObj) : [];
    const missing = !d ? [] : [
      !isObj(d.plan) ? t("missingPlan") : null,
      !isObj(d.windows) && !isObj(d.credits) ? t("missingQuota") : null,
      !isObj(d.periodUsage) ? t("missingPeriodUsage") : null,
      !isObj(d.local) ? t("missingLocal") : null
    ].filter(Boolean);
    if (errors.length > 0) {
      const body = errors.map((e) => `${typeof e.source === "string" ? `${e.source}: ` : ""}${typeof e.message === "string" ? e.message : t("unknownError")}`).join(t("errorSep"));
      ui.banner.update({ tone: "warning", title: t("noticePartial")(errors.length), body });
      ui.bannerSlot.hidden = false;
      return;
    }
    if (missing.length > 0) {
      ui.banner.update({ tone: "warning", title: `${t("noticeMissingPrefix")}${missing.join(t("listSep"))}`, body: "" });
      ui.bannerSlot.hidden = false;
      return;
    }
    if (state.problem && state.problem.kind === "data") {
      ui.banner.update({ tone: "error", title: t("dataReadFailed"), body: state.problem.message });
      ui.bannerSlot.hidden = false;
      return;
    }
    ui.bannerSlot.hidden = true;
  }
  function pushBadge(d) {
    const weekly = d && isObj(d.windows) && isObj(d.windows.weekly) ? d.windows.weekly : null;
    const pct = weekly ? pctOf(weekly) : null;
    const count = isNum(pct) ? Math.max(0, Math.min(999, Math.round(100 - pct))) : null;
    host.setBadge(count).catch(() => {
    });
  }
  function render() {
    const d = isObj(state.data) ? state.data : null;
    const serviceDown = Boolean(state.problem && state.problem.kind === "service");
    const dataDown = Boolean(state.problem && state.problem.kind === "data" && !d);
    if (serviceDown) ui.empty.update({ title: t("serviceNotReady"), body: t("serviceHint") });
    else if (dataDown) ui.empty.update({ title: t("dataReadFailed"), body: state.problem.message });
    ui.emptyWrap.hidden = !(serviceDown || dataDown);
    ui.content.hidden = serviceDown || dataDown || !d;
    ui.spinnerWrap.hidden = !(state.loading && !d && !serviceDown && !dataDown);
    ui.refreshButton.update({ loading: state.loading });
    if (d) {
      renderHeader(d);
      renderCards(d);
      renderBars(d);
      renderLocal(d);
      renderFooter(d);
    }
    renderNotice(d);
    pushBadge(d);
  }
  function parsePayload(body) {
    let value = body;
    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch {
        return null;
      }
    }
    return isObj(value) ? value : null;
  }
  var showCached = (range) => {
    const payload = cache.get(range);
    if (!payload) return false;
    fetchSeq += 1;
    state.loading = false;
    state.problem = null;
    state.data = payload;
    state.dataRange = range;
    render();
    return true;
  };
  function selectRange(next) {
    state.range = next;
    ui.tabs.update({ activeId: next });
    if (!showCached(next)) void refresh();
  }
  function manualRefresh() {
    cache.clear();
    void refresh(true);
  }
  async function refresh(fresh = false) {
    const range = state.range;
    const seq = ++fetchSeq;
    state.loading = true;
    render();
    try {
      const query = fresh ? { range, fresh: "1" } : { range };
      const result = await host.serviceRequest({ method: "GET", path: "/summary", query });
      if (seq !== fetchSeq) return;
      if (!result || !isNum(result.status) || result.status !== 200) {
        state.data = null;
        state.dataRange = null;
        state.problem = { kind: "service", message: `${t("httpReturned")} HTTP ${result && result.status}` };
        return;
      }
      const payload = parsePayload(result.body);
      if (!payload) {
        state.problem = { kind: "data", message: t("badResponse") };
        return;
      }
      state.data = payload;
      state.dataRange = range;
      state.problem = null;
      cache.set(range, payload);
    } catch (error) {
      if (seq !== fetchSeq) return;
      const code = error && error.code;
      if (SERVICE_CODES.has(code)) {
        state.data = null;
        state.dataRange = null;
        state.problem = { kind: "service", message: error.message || t("serviceUnavailable") };
      } else {
        state.problem = { kind: "data", message: error && error.message ? error.message : t("readFailed") };
      }
    } finally {
      if (seq === fetchSeq) {
        state.loading = false;
        render();
      }
    }
  }
  host.onReady((ctx) => {
    applyHostReady(ctx, document.documentElement);
    const next = resolveLang(ctx && ctx.locale);
    const switched = next !== lang;
    lang = next;
    document.title = t("docTitle");
    document.documentElement.lang = next;
    if (!mounted) {
      mounted = true;
      buildUi();
      if (!showCached(state.range)) void refresh();
      return;
    }
    if (switched) {
      document.getElementById("root").replaceChildren();
      buildUi();
      render();
    }
  });
  window.setInterval(() => {
    if (state.data) renderBars(state.data);
  }, 3e4);
  document.addEventListener("pointerdown", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target || !target.closest(".cg-seg")) hideTip();
  }, true);
  window.addEventListener("scroll", hideTip, { capture: true, passive: true });
})();
