import { createClient } from "jsr:@supabase/supabase-js@2";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
const VAPID_SUBJECT = "mailto:craigcdw@gmail.com";

function base64urlToUint8(s) {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

function uint8ToBase64url(buf) {
  return btoa(String.fromCharCode(...buf)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function makeVapidJwt(audience) {
  const header = uint8ToBase64url(new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = uint8ToBase64url(new TextEncoder().encode(JSON.stringify({
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: VAPID_SUBJECT,
  })));
  const msg = new TextEncoder().encode(`${header}.${payload}`);
  const raw = base64urlToUint8(VAPID_PRIVATE_KEY);
  const prefix = new Uint8Array([0x30, 0x41, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, 0x04, 0x27, 0x30, 0x25, 0x02, 0x01, 0x01, 0x04, 0x20]);
  const combined = new Uint8Array(prefix.length + raw.length);
  combined.set(prefix); combined.set(raw, prefix.length);
  const key = await crypto.subtle.importKey(
    "pkcs8",
    combined.buffer,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
  const sig = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, msg));
  return `${header}.${payload}.${uint8ToBase64url(sig)}`;
}

async function sendPush(sub, title, body) {
  const url = new URL(sub.endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const jwt = await makeVapidJwt(audience);

  const payload = JSON.stringify({ title, body, tag: "focal-event" });

  const authSecret = base64urlToUint8(sub.keys.auth);
  const receiverPublicKey = base64urlToUint8(sub.keys.p256dh);

  const senderKey = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey", "deriveBits"]);
  const senderPublicKeyRaw = new Uint8Array(await crypto.subtle.exportKey("raw", senderKey.publicKey));

  const receiverKey = await crypto.subtle.importKey("raw", receiverPublicKey, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const sharedBits = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: receiverKey }, senderKey.privateKey, 256));

  const salt = crypto.getRandomValues(new Uint8Array(16));

  async function hkdfExtract(saltBytes, ikm) {
    const key = await crypto.subtle.importKey("raw", saltBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return new Uint8Array(await crypto.subtle.sign("HMAC", key, ikm));
  }
  async function hkdfExpand(prk, info, len) {
    const key = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const t = new Uint8Array(await crypto.subtle.sign("HMAC", key, new Uint8Array([...info, 1])));
    return t.slice(0, len);
  }

  const prkCombined = await hkdfExtract(authSecret, sharedBits);
  const authInfo = new TextEncoder().encode("Content-Encoding: auth\0");
  const ikm = await hkdfExpand(prkCombined, authInfo, 32);

  const prk = await hkdfExtract(salt, ikm);
  const cekInfo = new Uint8Array([...new TextEncoder().encode("Content-Encoding: aesgcm\0"), ...new Uint8Array([0, 65]), ...senderPublicKeyRaw, ...new Uint8Array([0, 65]), ...receiverPublicKey]);
  const nonceInfo = new Uint8Array([...new TextEncoder().encode("Content-Encoding: nonce\0"), ...new Uint8Array([0, 65]), ...senderPublicKeyRaw, ...new Uint8Array([0, 65]), ...receiverPublicKey]);

  const cek = await hkdfExpand(prk, cekInfo, 16);
  const nonce = await hkdfExpand(prk, nonceInfo, 12);

  const aesKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
  const paddedPayload = new Uint8Array([0, 0, ...new TextEncoder().encode(payload)]);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, paddedPayload));

  const res = await fetch(sub.endpoint, {
    method: "POST",
    headers: {
      "Authorization": `vapid t=${jwt},k=${VAPID_PUBLIC_KEY}`,
      "Content-Encoding": "aesgcm",
      "Content-Type": "application/octet-stream",
      "Encryption": `salt=${uint8ToBase64url(salt)}`,
      "Crypto-Key": `dh=${uint8ToBase64url(senderPublicKeyRaw)};p256ecdsa=${VAPID_PUBLIC_KEY}`,
      "TTL": "86400",
    },
    body: encrypted,
  });

  return res.status;
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  );

  const now = new Date();
  const windowEnd = new Date(now.getTime() + 16 * 60 * 1000);

  const { data: events } = await supabase
    .from("calendar_events")
    .select("id, title, start_date, user_id, reminder_enabled")
    .gte("start_date", now.toISOString())
    .lte("start_date", windowEnd.toISOString())
    .eq("reminder_enabled", true);

  if (!events || events.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { headers: { "Content-Type": "application/json" } });
  }

  let sent = 0;
  for (const event of events) {
    const { data: subRow } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", event.user_id)
      .maybeSingle();

    if (!subRow?.subscription) continue;

    const minsUntil = Math.round((new Date(event.start_date).getTime() - now.getTime()) / 60000);
    const label = minsUntil <= 1 ? "starting now" : `in ${minsUntil} minutes`;

    try {
      const status = await sendPush(
        subRow.subscription,
        `⏰ ${event.title}`,
        `Starting ${label}`
      );
      if (status < 300) sent++;
    } catch (e) {
      console.error("Push failed for event", event.id, e);
    }
  }

  return new Response(JSON.stringify({ sent, total: events.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
