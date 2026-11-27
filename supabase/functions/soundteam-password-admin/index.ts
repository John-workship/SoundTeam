import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const allowedOrigin = (origin: string) =>
  origin === "https://soundteam-eta.vercel.app" ||
  origin === "https://soundteam-sound-team.vercel.app" ||
  origin === "http://localhost:8081" ||
  /^https:\/\/soundteam-[a-z0-9-]+-sound-team\.vercel\.app$/.test(origin);

const corsHeadersFor = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && allowedOrigin(origin) ? origin : "https://soundteam-eta.vercel.app",
  "Vary": "Origin",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

const json = (status: number, body: Record<string, unknown>, origin: string | null) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeadersFor(origin), "Content-Type": "application/json" },
  });

const makeTemporaryPassword = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%&*-";
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join("");
};

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  if (origin && !allowedOrigin(origin)) return json(403, { error: "Origen no autorizado." }, origin);
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeadersFor(origin) });
  if (req.method !== "POST") return json(405, { error: "Método no permitido." }, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const readKey = (legacyName: string, pluralName: string) => {
    const legacy = Deno.env.get(legacyName);
    if (legacy) return legacy;
    try {
      const keys = JSON.parse(Deno.env.get(pluralName) || "{}");
      return keys.default || "";
    } catch {
      return "";
    }
  };
  const anonKey = readKey("SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEYS")
    || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
  const serviceRoleKey = readKey("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEYS")
    || Deno.env.get("SUPABASE_SECRET_KEY") || "";
  const authorization = req.headers.get("Authorization") || "";

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !authorization.startsWith("Bearer ")) {
    return json(401, { error: "Sesión no válida." }, origin);
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const accessToken = authorization.replace(/^Bearer\s+/i, "").trim();
  const { data: authData, error: authError } = await callerClient.auth.getUser(accessToken);
  if (authError || !authData.user) return json(401, { error: "Debes iniciar sesión nuevamente." }, origin);

  const caller = authData.user;
  const { data: callerProfile } = await adminClient
    .from("integrantes")
    .select("id, user_id, email, sede_id, rol_acceso")
    .eq("user_id", caller.id)
    .maybeSingle();

  const globalAdmin =
    caller.id === "3be393a8-b6f5-4bf1-b303-961f027e3416" &&
    String(caller.email || "").trim().toLowerCase() === "johnbocal31@gmail.com";

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Solicitud no válida." }, origin);
  }

  if (body.action === "reset") {
    const { data: accessEnabled, error: accessError } = await callerClient.rpc("soundteam_acceso_habilitado");
    if (accessError || accessEnabled !== true) {
      return json(403, { error: "Debes completar el cambio de contraseña antes de administrar otras cuentas." }, origin);
    }
    const memberId = Number(body.memberId);
    if (!Number.isSafeInteger(memberId) || memberId <= 0) {
      return json(400, { error: "Integrante no válido." }, origin);
    }

    const { data: target, error: targetError } = await adminClient
      .from("integrantes")
      .select("id, nombre, email, sede_id, rol_acceso, user_id")
      .eq("id", memberId)
      .maybeSingle();

    if (targetError || !target) return json(404, { error: "No se encontró el integrante." }, origin);

    const isSameSiteLeader =
      !!callerProfile &&
      String(callerProfile.rol_acceso || "").toLowerCase() === "lider" &&
      !!callerProfile.sede_id &&
      callerProfile.sede_id === target.sede_id;

    if (isSameSiteLeader && String(target.rol_acceso || "").toLowerCase() !== "miembro") {
      return json(403, { error: "El líder solo puede restablecer claves de integrantes de su sede." }, origin);
    }

    if (!globalAdmin && !isSameSiteLeader) {
      return json(403, { error: "Solo el administrador global o el líder de la misma sede puede generar esta clave." }, origin);
    }

    if (!target.user_id || !target.email) {
      return json(409, { error: "Este integrante todavía no tiene una cuenta de acceso vinculada." }, origin);
    }

    if (target.user_id === "3be393a8-b6f5-4bf1-b303-961f027e3416" && !globalAdmin) {
      return json(403, { error: "No puedes cambiar la clave del administrador global." }, origin);
    }

    const { data: targetAuth, error: targetAuthError } =
      await adminClient.auth.admin.getUserById(target.user_id);
    if (targetAuthError || !targetAuth.user) {
      return json(404, { error: "No se encontró la cuenta de autenticación." }, origin);
    }

    if (String(targetAuth.user.email || "").trim().toLowerCase() !== String(target.email).trim().toLowerCase()) {
      return json(409, { error: "El correo del perfil no coincide con la cuenta vinculada. Solicita revisión al administrador." }, origin);
    }

    const temporaryPassword = makeTemporaryPassword();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: logError } = await adminClient
      .from("soundteam_claves_temporales")
      .upsert(
        { user_id: target.user_id, expires_at: expiresAt, created_by: caller.id },
        { onConflict: "user_id" },
      );

    if (logError) return json(500, { error: "No se pudo registrar la vigencia de la clave temporal." }, origin);

    const appMetadata = {
      ...(targetAuth.user.app_metadata || {}),
      soundteam_must_change_password: true,
      soundteam_temp_password_expires_at: expiresAt,
    };

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      target.user_id,
      { password: temporaryPassword, app_metadata: appMetadata },
    );

    if (updateError) {
      await adminClient.from("soundteam_claves_temporales").delete().eq("user_id", target.user_id);
      return json(500, { error: "No se pudo actualizar la contraseña de la cuenta." }, origin);
    }

    return json(200, {
      ok: true,
      memberName: target.nombre,
      temporaryPassword,
      expiresAt,
    }, origin);
  }

  if (body.action === "complete") {
    const newPassword = String(body.newPassword || "");
    if (newPassword.length < 12 || newPassword.length > 128 ||
        !/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) ||
        !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      return json(400, { error: "Usa una contraseña de 12 a 128 caracteres con mayúsculas, minúsculas, números y símbolos." }, origin);
    }

    const { data: currentAuth, error: currentAuthError } =
      await adminClient.auth.admin.getUserById(caller.id);
    if (currentAuthError || !currentAuth.user) return json(401, { error: "No se pudo validar la cuenta." }, origin);

    const metadata = currentAuth.user.app_metadata || {};
    if (metadata.soundteam_must_change_password !== true) {
      return json(409, { error: "Esta cuenta no tiene una contraseña temporal pendiente." }, origin);
    }

    const expiresAt = Date.parse(String(metadata.soundteam_temp_password_expires_at || ""));
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      return json(410, { error: "La contraseña temporal venció. Solicita al administrador una nueva clave." }, origin);
    }

    const nextMetadata = { ...metadata };
    delete nextMetadata.soundteam_must_change_password;
    delete nextMetadata.soundteam_temp_password_expires_at;

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      caller.id,
      { password: newPassword, app_metadata: nextMetadata },
    );
    if (updateError) return json(500, { error: "No se pudo guardar la nueva contraseña." }, origin);

    await adminClient.from("soundteam_claves_temporales").delete().eq("user_id", caller.id);
    return json(200, { ok: true }, origin);
  }

  return json(400, { error: "Acción no reconocida." }, origin);
});
