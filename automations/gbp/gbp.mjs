#!/usr/bin/env node
/**
 * Minimal, dependency-free Google Business Profile CLI.
 *
 * Scope: https://www.googleapis.com/auth/business.manage
 *
 * Commands are limited to what this business needs:
 *   auth, status, accounts, locations, get, patch, posts, post, media
 *
 * Nothing runs against Google until the GBP API access request is approved.
 * Use --dry-run to inspect the exact request without a token.
 */

import http from "node:http";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import readline from "node:readline/promises";

const SCOPE = "https://www.googleapis.com/auth/business.manage";
const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const ACCOUNT_API = "https://mybusinessaccountmanagement.googleapis.com/v1";
const INFO_API = "https://mybusinessbusinessinformation.googleapis.com/v1";
const V4_API = "https://mybusiness.googleapis.com/v4";

const LOCATION_FIELDS = [
  "name",
  "title",
  "storefrontAddress",
  "phoneNumbers",
  "websiteUri",
  "regularHours",
  "profile",
  "categories",
  "serviceArea",
].join(",");

const MEDIA_CATEGORIES = new Set([
  "COVER",
  "PROFILE",
  "LOGO",
  "EXTERIOR",
  "INTERIOR",
  "PRODUCT",
  "AT_WORK",
  "FOOD_AND_DRINK",
  "MENU",
  "COMMON_AREA",
  "ROOMS",
  "TEAM",
  "ADDITIONAL",
]);

const CTA_TYPES = new Set(["BOOK", "ORDER", "SHOP", "LEARN_MORE", "SIGN_UP", "CALL"]);
const BOOLEAN_FLAGS = new Set([
  "json",
  "dry-run",
  "validate-only",
  "print-url",
  "no-browser",
  "help",
]);

const HELP = `Sug's Property Services — Google Business Profile CLI

Usage:
  node automations/gbp/gbp.mjs <command> [options]

Commands:
  auth                      Authorize with Google (loopback OAuth, PKCE)
  status                    Show config/token state (no network)
  accounts                  List GBP accounts you manage
  locations                 List locations (needs --account if more than one)
  get --location ID         Read one location
  patch --location ID ...   Edit location fields
  posts --location ID       List local posts
  post --location ID ...    Create a local post
  media --location ID ...   Add a photo from a public URL

Global options:
  --json                    Print raw JSON instead of a table
  --dry-run                 Print the HTTP request and exit (no token needed)
  --account ID              GBP account ID or accounts/ID
  --help                    Show this help

Auth:
  --client-id ID            OAuth client ID (or GBP_CLIENT_ID)
  --client-secret SECRET    OAuth client secret (or GBP_CLIENT_SECRET)
  --print-url               Print the consent URL and exit (smoke test)
  --no-browser              Do not try to open a browser

get/locations:
  --read-mask FIELDS        Override the default readMask

patch:
  --description TEXT        Update profile.description
  --phone NUMBER            Update phoneNumbers.primaryPhone
  --website URL             Update websiteUri
  --payload FILE            JSON body (use - for stdin)
  --update-mask FIELDS      Required with --payload, e.g. profile.description
  --validate-only           Test the edit without applying it

post:
  --summary TEXT            Post text (required, max 1500 chars)
  --cta TYPE                BOOK|ORDER|SHOP|LEARN_MORE|SIGN_UP|CALL
  --url URL                 Destination for the CTA button
  --photo URL               Publicly reachable photo URL
  --topic TYPE              STANDARD (default), EVENT, or OFFER
  --language CODE           Default en-US

media:
  --url URL                 Publicly reachable photo URL (required)
  --category NAME           COVER|EXTERIOR|AT_WORK|TEAM|... (default ADDITIONAL)

Examples:
  node automations/gbp/gbp.mjs auth
  node automations/gbp/gbp.mjs accounts
  node automations/gbp/gbp.mjs locations --account 123456789
  node automations/gbp/gbp.mjs get --location locations/987654321 --json
  node automations/gbp/gbp.mjs patch --location locations/987654321 \\
    --description "Owner-operated lawn care in Victorville." --validate-only
  node automations/gbp/gbp.mjs post --location locations/987654321 \\
    --summary "Fresh cut in Hesperia this morning." \\
    --cta LEARN_MORE --url https://sugspropertyservices.com/ \\
    --photo https://sugspropertyservices.com/images/front-lawn-palms-960.webp

Config lives in ~/.config/sugs-gbp (override with GBP_CONFIG_DIR).
Files are chmod 0600. Never commit them.
`;

function configDir() {
  if (process.env.GBP_CONFIG_DIR) return process.env.GBP_CONFIG_DIR;
  const base = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
  return path.join(base, "sugs-gbp");
}

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function writeJson(file, value) {
  const dir = path.dirname(file);
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  await fs.chmod(dir, 0o700).catch(() => {});
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  await fs.chmod(file, 0o600).catch(() => {});
}

const clientFile = () => path.join(configDir(), "client.json");
const tokenFile = () => path.join(configDir(), "token.json");

async function loadClient(options = {}) {
  const envId = process.env.GBP_CLIENT_ID;
  const envSecret = process.env.GBP_CLIENT_SECRET;

  if (options["client-id"] && options["client-secret"]) {
    return {
      clientId: String(options["client-id"]),
      clientSecret: String(options["client-secret"]),
    };
  }

  if (envId && envSecret) {
    return { clientId: envId, clientSecret: envSecret };
  }

  const saved = await readJson(clientFile());
  if (saved && saved.clientId && saved.clientSecret) return saved;

  return null;
}

async function getAccessToken(force = false) {
  const token = await readJson(tokenFile());
  if (!token || !token.refreshToken) {
    throw new Error("Not authorized. Run: node automations/gbp/gbp.mjs auth");
  }

  if (!force && token.accessToken && token.expiresAt > Date.now() + 30_000) {
    return token.accessToken;
  }

  const client = await loadClient();
  if (!client) {
    throw new Error("OAuth client missing. Re-run auth with --client-id/--client-secret.");
  }

  const form = new URLSearchParams({
    client_id: client.clientId,
    refresh_token: token.refreshToken,
    grant_type: "refresh_token",
  });
  if (client.clientSecret) form.set("client_secret", client.clientSecret);

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error_description || data.error || `HTTP ${response.status}`;
    if (data.error === "invalid_grant") {
      throw new Error(`${message}. The refresh token was revoked or expired; run auth again.`);
    }
    throw new Error(`Token refresh failed: ${message}`);
  }

  token.accessToken = data.access_token;
  token.expiresAt = Date.now() + Number(data.expires_in || 3600) * 1000;
  token.scope = data.scope || token.scope;
  if (data.refresh_token) token.refreshToken = data.refresh_token;
  await writeJson(tokenFile(), token);

  return token.accessToken;
}

async function request(url, { method = "GET", body, token, headers = {} } = {}) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    const message =
      data?.error?.message || data?.error_description || text.slice(0, 500) || `HTTP ${response.status}`;
    const error = new Error(`${response.status}: ${message}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function api(url, options = {}) {
  let token = await getAccessToken();
  try {
    return await request(url, { ...options, token });
  } catch (error) {
    if (error.status !== 401) throw error;
    token = await getAccessToken(true);
    return request(url, { ...options, token });
  }
}

function normalizeAccount(value) {
  const match = String(value).match(/(\d+)$/);
  if (!match) throw new Error(`Invalid account: ${value}. Use 123456789 or accounts/123456789.`);
  return match[1];
}

function locationId(value) {
  const match = String(value).match(/(\d+)$/);
  if (!match) throw new Error(`Invalid location: ${value}. Use locations/123 or 123.`);
  return match[1];
}

async function resolveAccount(explicit) {
  if (explicit) return normalizeAccount(explicit);

  const data = await api(`${ACCOUNT_API}/accounts?pageSize=100`);
  const accounts = data.accounts || [];

  if (accounts.length === 0) {
    throw new Error("No GBP accounts returned for this login.");
  }
  if (accounts.length > 1) {
    const options = accounts
      .map((account) => `${account.name} (${account.accountName || "unnamed"})`)
      .join(", ");
    throw new Error(`Multiple GBP accounts; pass --account. Options: ${options}`);
  }

  return normalizeAccount(accounts[0].name);
}

function printAccounts(data) {
  const accounts = data.accounts || [];
  if (!accounts.length) {
    console.log("No accounts.");
    return;
  }
  for (const account of accounts) {
    console.log(`${account.name}  ${account.accountName || "(no name)"}`);
    if (account.type) console.log(`  type: ${account.type}`);
    if (account.role) console.log(`  role: ${account.role}`);
  }
}

function printLocations(data) {
  const locations = data.locations || [];
  if (!locations.length) {
    console.log("No locations.");
    return;
  }
  for (const location of locations) {
    const address = location.storefrontAddress;
    const addressLine = address
      ? [...(address.addressLines || []), address.locality, address.administrativeArea, address.postalCode]
          .filter(Boolean)
          .join(", ")
      : "(service-area business)";
    console.log(`${location.name}  ${location.title || "(no title)"}`);
    console.log(`  address: ${addressLine}`);
    if (location.phoneNumbers?.primaryPhone) {
      console.log(`  phone:   ${location.phoneNumbers.primaryPhone}`);
    }
    if (location.websiteUri) console.log(`  website: ${location.websiteUri}`);
    const description = location.profile?.description;
    if (description) console.log(`  about:   ${description.slice(0, 90)}${description.length > 90 ? "…" : ""}`);
  }
}

function printPosts(data) {
  const posts = data.localPosts || [];
  if (!posts.length) {
    console.log("No local posts.");
    return;
  }
  for (const post of posts) {
    const state = post.state || "UNKNOWN";
    console.log(`${post.name}  [${state}]`);
    console.log(`  ${(post.summary || "").replace(/\s+/g, " ").slice(0, 120)}`);
    if (post.createTime) console.log(`  created: ${post.createTime}`);
  }
}

async function cmdAuth(options) {
  let client = await loadClient(options);

  if (!client && process.stdin.isTTY) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      console.log("No OAuth client saved. Create a Desktop app client in Google Cloud Console.");
      const clientId = (await rl.question("Client ID: ")).trim();
      const clientSecret = (await rl.question("Client secret: ")).trim();
      if (clientId && clientSecret) client = { clientId, clientSecret };
    } finally {
      rl.close();
    }
  }

  if (!client) {
    throw new Error(
      "No OAuth client. Pass --client-id/--client-secret, set GBP_CLIENT_ID/GBP_CLIENT_SECRET, or run auth from an interactive terminal."
    );
  }

  const state = crypto.randomBytes(16).toString("hex");
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");

  const server = http.createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const redirectUri = `http://127.0.0.1:${port}`;

  const authUrl = new URL(AUTH_ENDPOINT);
  authUrl.search = new URLSearchParams({
    client_id: client.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  }).toString();

  if (options["print-url"]) {
    console.log(authUrl.toString());
    server.close();
    return;
  }

  const codePromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      server.close();
      reject(new Error("Authorization timed out after 5 minutes."));
    }, 5 * 60 * 1000);

    server.on("request", (req, res) => {
      const url = new URL(req.url, redirectUri);
      if (url.pathname !== "/") {
        res.writeHead(404).end();
        return;
      }

      const error = url.searchParams.get("error");
      const code = url.searchParams.get("code");
      const returnedState = url.searchParams.get("state");

      if (error) {
        res.writeHead(400, { "Content-Type": "text/plain" }).end(`Authorization failed: ${error}`);
        clearTimeout(timer);
        server.close();
        reject(new Error(`Authorization denied: ${error}`));
        return;
      }

      if (returnedState !== state) {
        res.writeHead(400, { "Content-Type": "text/plain" }).end("State mismatch. Try again.");
        return;
      }

      if (!code) {
        res.writeHead(400, { "Content-Type": "text/plain" }).end("Missing authorization code.");
        return;
      }

      res.writeHead(200, { "Content-Type": "text/html" }).end(
        "<!doctype html><meta charset=utf-8><title>Authorized</title><body style=\"font-family:system-ui;padding:3rem\"><h1>Authorized</h1><p>You can close this tab and return to the terminal.</p>"
      );
      clearTimeout(timer);
      resolve(code);
    });
  });

  console.log("Opening Google consent. If no browser appears, open:");
  console.log(`  ${authUrl.toString()}`);

  if (!options["no-browser"]) {
    execFile("xdg-open", [authUrl.toString()], () => {});
  }

  const code = await codePromise;
  server.close();

  const form = new URLSearchParams({
    code,
    client_id: client.clientId,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
    code_verifier: verifier,
  });
  if (client.clientSecret) form.set("client_secret", client.clientSecret);

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${data.error_description || data.error || response.status}`);
  }
  if (!data.refresh_token) {
    throw new Error("No refresh_token returned. Re-run with prompt=consent (the CLI already does this).");
  }

  await writeJson(clientFile(), {
    clientId: client.clientId,
    clientSecret: client.clientSecret,
  });
  await writeJson(tokenFile(), {
    refreshToken: data.refresh_token,
    accessToken: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000,
    scope: data.scope || SCOPE,
    savedAt: new Date().toISOString(),
  });

  console.log(`Authorized. Token saved to ${tokenFile()}`);
  console.log("Next: node automations/gbp/gbp.mjs accounts");
}

async function cmdStatus() {
  const client = await loadClient();
  const token = await readJson(tokenFile());

  console.log(`config dir:    ${configDir()}`);
  console.log(`oauth client:  ${client ? "configured" : "missing"}`);
  console.log(`token:         ${token?.refreshToken ? "present" : "missing"}`);
  if (token?.savedAt) console.log(`authorized:    ${token.savedAt}`);
  if (token?.scope) console.log(`scope:         ${token.scope}`);
  console.log("access:        see automations/gbp/README.md (60-day gate)");
}

async function cmdAccounts(options) {
  const data = await api(`${ACCOUNT_API}/accounts?pageSize=100`);
  if (options.json) return console.log(JSON.stringify(data, null, 2));
  printAccounts(data);
}

async function cmdLocations(options) {
  const account = await resolveAccount(options.account);
  const mask = options["read-mask"] || LOCATION_FIELDS;
  const url = `${INFO_API}/accounts/${account}/locations?readMask=${encodeURIComponent(mask)}&pageSize=100`;
  const data = await api(url);
  if (options.json) return console.log(JSON.stringify(data, null, 2));
  printLocations(data);
}

async function cmdGet(options) {
  if (!options.location) throw new Error("get requires --location.");
  const id = locationId(options.location);
  const mask = options["read-mask"] || LOCATION_FIELDS;
  const data = await api(`${INFO_API}/locations/${id}?readMask=${encodeURIComponent(mask)}`);
  console.log(JSON.stringify(data, null, 2));
}

async function readPayload(file) {
  const raw = file === "-" ? await new Promise((resolve, reject) => {
    let input = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (input += chunk));
    process.stdin.on("end", () => resolve(input));
    process.stdin.on("error", reject);
  }) : await fs.readFile(file, "utf8");

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Payload is not valid JSON: ${file}`);
  }
}

async function cmdPatch(options) {
  if (!options.location) throw new Error("patch requires --location.");
  const id = locationId(options.location);

  let body;
  const masks = [];

  if (options.payload) {
    body = await readPayload(options.payload);
    if (!options["update-mask"]) {
      throw new Error("patch with --payload requires --update-mask.");
    }
    masks.push(...String(options["update-mask"]).split(",").map((field) => field.trim()).filter(Boolean));
  } else {
    body = {};
    if (options.description !== undefined) {
      body.profile = { ...(body.profile || {}), description: String(options.description) };
      masks.push("profile.description");
    }
    if (options.phone !== undefined) {
      body.phoneNumbers = { ...(body.phoneNumbers || {}), primaryPhone: String(options.phone) };
      masks.push("phoneNumbers.primaryPhone");
    }
    if (options.website !== undefined) {
      body.websiteUri = String(options.website);
      masks.push("websiteUri");
    }
    if (masks.length === 0) {
      throw new Error("patch needs --description, --phone, --website, or --payload with --update-mask.");
    }
  }

  const updateMask = masks.join(",");
  const validateOnly = options["validate-only"] ? "true" : "false";
  const url = `${INFO_API}/locations/${id}?updateMask=${encodeURIComponent(updateMask)}&validateOnly=${validateOnly}`;

  if (options["dry-run"]) {
    console.log(JSON.stringify({ method: "PATCH", url, body }, null, 2));
    return;
  }

  const data = await api(url, { method: "PATCH", body });
  console.log(JSON.stringify(data, null, 2));
}

async function cmdPosts(options) {
  if (!options.location) throw new Error("posts requires --location.");
  const id = locationId(options.location);
  const account = await resolveAccount(options.account);
  const data = await api(`${V4_API}/accounts/${account}/locations/${id}/localPosts?pageSize=100`);
  if (options.json) return console.log(JSON.stringify(data, null, 2));
  printPosts(data);
}

async function cmdPost(options) {
  if (!options.location) throw new Error("post requires --location.");
  if (!options.summary) throw new Error("post requires --summary.");
  if (String(options.summary).length > 1500) throw new Error("summary must be 1500 characters or fewer.");

  const id = locationId(options.location);
  const account = options.account ? normalizeAccount(options.account) : "ACCOUNT";

  const body = {
    languageCode: options.language || "en-US",
    summary: String(options.summary),
    topicType: options.topic || "STANDARD",
  };

  if (options.cta) {
    const cta = String(options.cta).toUpperCase();
    if (!CTA_TYPES.has(cta)) throw new Error(`Unknown --cta ${cta}. Use ${[...CTA_TYPES].join("|")}.`);
    if (!options.url) throw new Error(`--cta ${cta} requires --url.`);
    body.callToAction = { actionType: cta, url: String(options.url) };
  } else if (options.url) {
    body.callToAction = { actionType: "LEARN_MORE", url: String(options.url) };
  }

  if (options.photo) {
    body.media = [{ mediaFormat: "PHOTO", sourceUrl: String(options.photo) }];
  }

  const url = `${V4_API}/accounts/${account}/locations/${id}/localPosts`;

  if (options["dry-run"]) {
    console.log(JSON.stringify({ method: "POST", url, body }, null, 2));
    return;
  }

  const data = await api(url, { method: "POST", body });
  console.log(JSON.stringify(data, null, 2));
}

async function cmdMedia(options) {
  if (!options.location) throw new Error("media requires --location.");
  if (!options.url) throw new Error("media requires --url (a publicly reachable image).");

  const id = locationId(options.location);
  const account = options.account ? normalizeAccount(options.account) : "ACCOUNT";
  const category = String(options.category || "ADDITIONAL").toUpperCase();

  if (!MEDIA_CATEGORIES.has(category)) {
    throw new Error(`Unknown --category ${category}. Use ${[...MEDIA_CATEGORIES].join("|")}.`);
  }

  const body = {
    mediaFormat: "PHOTO",
    locationAssociation: { category },
    sourceUrl: String(options.url),
  };
  const url = `${V4_API}/accounts/${account}/locations/${id}/media`;

  if (options["dry-run"]) {
    console.log(JSON.stringify({ method: "POST", url, body }, null, 2));
    return;
  }

  const data = await api(url, { method: "POST", body });
  console.log(JSON.stringify(data, null, 2));
}

function parseArgs(argv) {
  const options = { _: [] };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (!arg.startsWith("--")) {
      options._.push(arg);
      continue;
    }

    const body = arg.slice(2);
    const eq = body.indexOf("=");

    if (eq !== -1) {
      options[body.slice(0, eq)] = body.slice(eq + 1);
      continue;
    }

    if (BOOLEAN_FLAGS.has(body)) {
      options[body] = true;
      continue;
    }

    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith("--")) {
      options[body] = next;
      i += 1;
    } else {
      options[body] = true;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help || !options._.length) {
    console.log(HELP);
    return;
  }

  const command = options._[0];

  switch (command) {
    case "auth":
      await cmdAuth(options);
      break;
    case "status":
      await cmdStatus();
      break;
    case "accounts":
      await cmdAccounts(options);
      break;
    case "locations":
      await cmdLocations(options);
      break;
    case "get":
      await cmdGet(options);
      break;
    case "patch":
      await cmdPatch(options);
      break;
    case "posts":
      await cmdPosts(options);
      break;
    case "post":
      await cmdPost(options);
      break;
    case "media":
      await cmdMedia(options);
      break;
    default:
      throw new Error(`Unknown command: ${command}. Run with --help.`);
  }
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  if (error.status === 403 && /quota|access|permission/i.test(error.message)) {
    console.error("Hint: the GBP API access request may not be approved yet (0 QPM means not approved).");
  }
  process.exitCode = 1;
});
