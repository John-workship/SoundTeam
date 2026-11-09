import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
} from "react-native";
import { supabase } from "./supabase";

const TEMAS = {
  azul: {
    bg: "#0B132B",
    cardBg: "#1C2541",
    border: "#3A506B",
    primary: "#3B82F6",
    textMain: "#FFFFFF",
    textSub: "#8D99AE",
    banner: "#6D28D9",
    selectedDay: "#F97316",
    nombre: "🔵 Azul",
  },
  claro: {
    bg: "#F1F5F9",
    cardBg: "#FFFFFF",
    border: "#CBD5E1",
    primary: "#2563EB",
    textMain: "#0F172A",
    textSub: "#64748B",
    banner: "#7C3AED",
    selectedDay: "#EA580C",
    nombre: "☀️ Claro",
  },
  oscuro: {
    bg: "#000000",
    cardBg: "#121212",
    border: "#27272A",
    primary: "#6366F1",
    textMain: "#FAFAFA",
    textSub: "#A1A1AA",
    banner: "#4F46E5",
    selectedDay: "#8B5CF6",
    nombre: "🌙 Oscuro",
  },
  rosado: {
    bg: "#1F121A",
    cardBg: "#2D1B26",
    border: "#582B46",
    primary: "#EC4899",
    textMain: "#FFFFFF",
    textSub: "#F472B6",
    banner: "#DB2777",
    selectedDay: "#DB2777",
    nombre: "🌸 Rosado",
  },
  morado: {
    bg: "#141124",
    cardBg: "#1F1A3A",
    border: "#3E356D",
    primary: "#8B5CF6",
    textMain: "#FFFFFF",
    textSub: "#C4B5FD",
    banner: "#7C3AED",
    selectedDay: "#7C3AED",
    nombre: "🟣 Morado",
  },
  esmeralda: {
    bg: "#061A14",
    cardBg: "#0B2E25",
    border: "#134E3F",
    primary: "#10B981",
    textMain: "#FFFFFF",
    textSub: "#6EE7B7",
    banner: "#047857",
    selectedDay: "#059669",
    nombre: "🟢 Esmeralda",
  },
  sunset: {
    bg: "#1A0F0A",
    cardBg: "#2D1911",
    border: "#522C1E",
    primary: "#F97316",
    textMain: "#FFFFFF",
    textSub: "#FDBA74",
    banner: "#C2410C",
    selectedDay: "#EA580C",
    nombre: "🌅 Sunset",
  },
  minimal: {
    bg: "#121212",
    cardBg: "#1E1E1E",
    border: "#333333",
    primary: "#A3A3A3",
    textMain: "#E5E5E5",
    textSub: "#737373",
    banner: "#525252",
    selectedDay: "#737373",
    nombre: "⬛ Minimal",
  },
};

const PAPELES_TAPIZ = {
  ninguno: { nombre: "🎨 Liso", css: {} },
  ipuc: { nombre: "⛪ IPUC", css: Platform.OS === "web" ? { backgroundColor: "#0f172a" } : {} },
  patronMusical: { nombre: "🎵 Notas Musicales", css: Platform.OS === "web" ? { backgroundColor: "#1e1b4b" } : {} },
  eventos: { nombre: "📷 Eventos", css: Platform.OS === "web" ? { backgroundColor: "#311026" } : {} },
  maderaAcustica: { nombre: "🪵 Madera Estudio", css: Platform.OS === "web" ? { backgroundColor: "#1c1917" } : {} },
};

const SEDES_DISPONIBLES = [
  { id: "general", nombre: "Sede General" },
  { id: "norte", nombre: "Sede Norte" },
  { id: "sur", nombre: "Sede Sur" },
  { id: "occidente", nombre: "Sede Occidente" },
];

export default function App() {
  const [sedeIdSeleccionada, setSedeIdSeleccionada] = useState("general");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [usuario, setUsuario] = useState("");
  const [rolUsuario, setRolUsuario] = useState("miembro");
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [cargandoAuth, setCargandoAuth] = useState(false);

  const [integrantes, setIntegrantes] = useState([]);

  const cargarIntegrantesSupabase = async () => {
    const { data, error } = await supabase.from("integrantes").select("*");
    if (data && !error) {
      const formateados = data.map((m) => ({
        id: m.id,
        nombre: m.nombre,
        email: m.email,
        sedeId: m.sede_id,
        rolAcceso: m.rol_acceso || "miembro",
        rolesMusicales: m.roles_musicales || [],
      }));
      setIntegrantes(formateados);
    }
  };

  const cargarPerfilUsuario = async (emailUsuario) => {
    const emailClean = emailUsuario.trim().toLowerCase();
    const { data, error } = await supabase
      .from("integrantes")
      .select("*")
      .eq("email", emailClean);

    if (data && data.length > 0 && !error) {
      const perf = data[0];
      setUsuario(perf.nombre);
      setRolUsuario(perf.rol_acceso || "miembro");
      if (perf.sede_id) setSedeIdSeleccionada(perf.sede_id);
    } else {
      setUsuario(emailClean.split("@")[0]);
      setRolUsuario("miembro");
    }
    setSesionIniciada(true);
  };

  useEffect(() => {
    cargarIntegrantesSupabase();

    const verificarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        cargarPerfilUsuario(session.user.email);
      }
    };
    verificarSesion();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        cargarPerfilUsuario(session.user.email);
      } else {
        setSesionIniciada(false);
        setUsuario("");
      }
    });

    return () => { authListener.subscription.unsubscribe(); };
  }, []);

  const handleLoginSeguro = async () => {
    if (emailInput.trim() === "" || passwordInput.trim() === "") {
      alert("⚠️ Ingresa tu correo electrónico y contraseña.");
      return;
    }
    setCargandoAuth(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailInput.trim(),
      password: passwordInput,
    });
    setCargandoAuth(false);

    if (error) {
      alert(`⚠️ Error de acceso: ${error.message}`);
    } else if (data?.user) {
      await cargarPerfilUsuario(data.user.email);
      setEmailInput("");
      setPasswordInput("");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSesionIniciada(false);
    setUsuario("");
    setEmailInput("");
    setPasswordInput("");
    setRolUsuario("miembro");
    setPestana("inicio");
  };

  const [pestana, setPestana] = useState("inicio");
  const [nombreTema, setNombreTema] = useState("azul");
  const [nombreTapiz, setNombreTapiz] = useState("ninguno");
  const [mostrarMenuPersonalizacion, setMostrarMenuPersonalizacion] = useState(false);

  const t = TEMAS[nombreTema] || TEMAS.azul;
  const tapizActual = PAPELES_TAPIZ[nombreTapiz] || PAPELES_TAPIZ.ninguno;
  const sedeActual = SEDES_DISPONIBLES.find((s) => s.id === sedeIdSeleccionada) || SEDES_DISPONIBLES[0];

  const esAdminOLider = rolUsuario === "admin" || rolUsuario === "lider";

  const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const fechaActualObj = new Date();
  const listaMesesDinamicos = [];

  for (let i = 0; i < 4; i++) {
    const dTarget = new Date(fechaActualObj.getFullYear(), fechaActualObj.getMonth() + i, 1);
    listaMesesDinamicos.push({
      nombre: nombresMeses[dTarget.getMonth()],
      mesIndex: dTarget.getMonth(),
      year: dTarget.getFullYear(),
      key: `${dTarget.getFullYear()}-${dTarget.getMonth()}`,
    });
  }

  const [mesSeleccionadoObj, setMesSeleccionadoObj] = useState(listaMesesDinamicos[0]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(fechaActualObj.getDate());
  const esDomingoSeleccionado = new Date(mesSeleccionadoObj.year, mesSeleccionadoObj.mesIndex, diaSeleccionado).getDay() === 0;

  const [servicios, setServicios] = useState([]);
  const cargarServiciosSupabase = async () => {
    const { data, error } = await supabase.from("servicios").select("*").eq("sede_id", sedeIdSeleccionada);
    if (data && !error) {
      setServicios(data.map((s) => ({
        id: s.id,
        fecha: s.fecha,
        titulo: s.titulo,
        observaciones: s.observaciones || "Sin observaciones",
        setlist: s.setlist || [],
        voces: s.voces || { principal: "Sin asignar", coros: "Sin asignar" },
        instrumentos: s.instrumentos || { piano: "Sin asignar", guitarra: "Sin asignar", bajo: "Sin asignar", bateria: "Sin asignar" },
        sedeId: s.sede_id,
      })));
    } else setServicios([]);
  };

  useEffect(() => {
    if (sesionIniciada) cargarServiciosSupabase();
  }, [sedeIdSeleccionada, sesionIniciada]);

  const [modalProgramarVisible, setModalProgramarVisible] = useState(false);
  const [modalPostularVisible, setModalPostularVisible] = useState(false);
  const [idServicioEditando, setIdServicioEditando] = useState(null);
  const [idServicioPostulando, setIdServicioPostulando] = useState(null);
  const [nombreEvento, setNombreEvento] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [setlistActivo, setSetlistActivo] = useState([]);

  const [modoEnVivoActivo, setModoEnVivoActivo] = useState(false);
  const [indiceCancionEnVivo, setIndiceCancionEnVivo] = useState(0);
  const [setlistEnVivoActual, setSetlistEnVivoActual] = useState([]);

  const [repertorio, setRepertorio] = useState([]);
  const cargarRepertorioSupabase = async () => {
    const { data, error } = await supabase.from("repertorio").select("*").eq("sede_id", sedeIdSeleccionada);
    if (data && !error) {
      setRepertorio(data.map((c) => ({
        id: c.id,
        titulo: c.titulo,
        artista: c.artista || "Sin artista",
        tono: c.tono || "C",
        bpm: c.bpm || "120",
        letra: c.letra || "",
        sedeId: c.sede_id,
      })));
    } else setRepertorio([]);
  };

  useEffect(() => {
    if (sesionIniciada) cargarRepertorioSupabase();
  }, [sedeIdSeleccionada, sesionIniciada]);

  const [cancionSeleccionadaDetalle, setCancionSeleccionadaDetalle] = useState(null);
  const [canalChatActivo, setCanalChatActivo] = useState("finsemana");
  const [mensajesChat, setMensajesChat] = useState([]);
  const [nuevoMensajeTexto, setNuevoMensajeTexto] = useState("");

  const cargarMensajesSupabase = async () => {
    const { data, error } = await supabase
      .from("mensajes")
      .select("*")
      .eq("canal", canalChatActivo)
      .eq("sede", sedeIdSeleccionada)
      .order("created_at", { ascending: true });
    if (data && !error) setMensajesChat(data);
    else setMensajesChat([]);
  };

  useEffect(() => {
    if (sesionIniciada) cargarMensajesSupabase();
  }, [canalChatActivo, sedeIdSeleccionada, sesionIniciada]);

  const enviarMensajeChat = async () => {
    if (nuevoMensajeTexto.trim() !== "") {
      const horaActual = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const mensaje = {
        autor: usuario,
        texto: nuevoMensajeTexto.trim(),
        hora: horaActual,
        canal: canalChatActivo,
        sede: sedeIdSeleccionada,
      };
      setNuevoMensajeTexto("");
      await supabase.from("mensajes").insert([mensaje]);
      await cargarMensajesSupabase();
    }
  };

  const mesNumStr = String(mesSeleccionadoObj.mesIndex + 1).padStart(2, "0");
  const fechaActualClave = `${mesSeleccionadoObj.year}-${mesNumStr}-${diaSeleccionado < 10 ? "0" + diaSeleccionado : diaSeleccionado}`;
  const serviciosDelDia = servicios.filter((s) => s.fecha === fechaActualClave);

  if (!sesionIniciada) {
    return (
      <View style={[styles.loginContainer, { backgroundColor: t.bg }]}>
        <View style={[styles.loginCard, { backgroundColor: t.cardBg, borderColor: t.border }]}>
          <Text style={[styles.loginTitle, { color: t.textMain }]}>SoundTeam</Text>
          <Text style={[styles.loginSubtitle, { color: t.textSub }]}>Inicio de Sesión Seguro</Text>

          <Text style={[styles.inputLabel, { color: t.textMain }]}>🏛️ Selecciona tu Sede:</Text>
          {Platform.OS === "web" ? (
            <select
              value={sedeIdSeleccionada}
              onChange={(e) => setSedeIdSeleccionada(e.target.value)}
              style={{
                backgroundColor: t.bg,
                color: t.textMain,
                borderColor: t.border,
                borderWidth: "1px",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "15px",
                marginBottom: "14px",
                width: "100%",
                outline: "none",
              }}
            >
              {SEDES_DISPONIBLES.map((s) => (
                <option key={s.id} value={s.id} style={{ backgroundColor: t.cardBg, color: t.textMain }}>
                  {s.nombre}
                </option>
              ))}
            </select>
          ) : (
            <View style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border }]}>
              <Text style={{ color: t.textMain }}>{sedeActual.nombre}</Text>
            </View>
          )}

          <Text style={[styles.inputLabel, { color: t.textMain }]}>📧 Correo Electrónico</Text>
          <TextInput
            style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
            placeholder="ejemplo@iglesia.com"
            placeholderTextColor={t.textSub}
            keyboardType="email-address"
            autoCapitalize="none"
            value={emailInput}
            onChangeText={setEmailInput}
          />

          <Text style={[styles.inputLabel, { color: t.textMain }]}>🔑 Contraseña</Text>
          <TextInput
            style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
            placeholder="••••••••"
            placeholderTextColor={t.textSub}
            secureTextEntry
            value={passwordInput}
            onChangeText={setPasswordInput}
          />

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: t.primary, marginTop: 6 }]}
            onPress={handleLoginSeguro}
            disabled={cargandoAuth}
          >
            <Text style={styles.loginButtonText}>{cargandoAuth ? "Ingresando..." : "Iniciar Sesión"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }, tapizActual.css]}>
      {modoEnVivoActivo ? (
        <View style={[styles.teleprompterContainer, { backgroundColor: "#0B0F19" }]}>
          <View style={styles.teleprompterTopBar}>
            <TouchableOpacity style={styles.teleprompterExitBtn} onPress={() => setModoEnVivoActivo(false)}>
              <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 11 }}>✕ Salir</Text>
            </TouchableOpacity>
            <Text style={{ color: "#94A3B8", fontSize: 12, fontWeight: "bold" }}>
              Canción {indiceCancionEnVivo + 1} de {setlistEnVivoActual.length}
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.teleprompterScrollContent}>
            <View style={styles.teleprompterCard}>
              <Text style={styles.teleprompterSongTitle}>
                {(setlistEnVivoActual[indiceCancionEnVivo] || {}).titulo || "Sin título"}
              </Text>
              <Text style={{ color: "#38BDF8", fontSize: 14, marginTop: 4 }}>
                Tono: {(setlistEnVivoActual[indiceCancionEnVivo] || {}).tono || "C"} | BPM: {(setlistEnVivoActual[indiceCancionEnVivo] || {}).bpm || "120"}
              </Text>
            </View>

            <View style={styles.teleprompterLyricsBox}>
              <Text style={styles.teleprompterLyricsText}>
                {(() => {
                  const cancionActual = setlistEnVivoActual[indiceCancionEnVivo] || {};
                  const objetoRepo = repertorio.find(r => r.titulo && cancionActual.titulo && r.titulo.toLowerCase() === cancionActual.titulo.toLowerCase()) || {};
                  return objetoRepo.letra || cancionActual.letra || "Letra no disponible en biblioteca.";
                })()}
              </Text>
            </View>

            <View style={styles.teleprompterNavRow}>
              <TouchableOpacity
                style={[styles.teleprompterNavBtn, { backgroundColor: "#334155" }, indiceCancionEnVivo === 0 && { opacity: 0.4 }]}
                disabled={indiceCancionEnVivo === 0}
                onPress={() => setIndiceCancionEnVivo(prev => Math.max(0, prev - 1))}
              >
                <Text style={{ color: "#FFF", fontWeight: "bold" }}>← Anterior</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.teleprompterNavBtn, { backgroundColor: "#3B82F6" }, indiceCancionEnVivo >= setlistEnVivoActual.length - 1 && { opacity: 0.4 }]}
                disabled={indiceCancionEnVivo >= setlistEnVivoActual.length - 1}
                onPress={() => setIndiceCancionEnVivo(prev => prev + 1)}
              >
                <Text style={{ color: "#FFF", fontWeight: "bold" }}>Siguiente →</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      ) : (
        <>
          <View style={[styles.header, { backgroundColor: t.cardBg, borderBottomColor: t.border }]}>
            <View style={styles.headerTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { color: t.textMain }]}>SoundTeam • {sedeActual.nombre}</Text>
                <Text style={[styles.headerSubtitle, { color: t.textSub }]}>
                  👤 {usuario} • <Text style={{ color: t.primary, fontWeight: "bold" }}>ROL: {rolUsuario.toUpperCase()}</Text>
                </Text>
              </View>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutBtnText}>Salir</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40, alignItems: "center" }}>
            <View style={styles.mainWrapper}>
              {pestana === "inicio" && (
                <View style={{ width: "100%" }}>
                  <View style={[styles.welcomeBanner, { backgroundColor: t.banner }]}>
                    <Text style={styles.welcomeTitle}>✨ Colosenses 3:23</Text>
                    <Text style={styles.welcomeBannerText}>"Y todo lo que hagan, háganlo de corazón, como para el Señor y no para los hombres."</Text>
                  </View>

                  <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                    <Text style={[styles.cardTitle, { color: t.textMain }]}>💬 Chat de {sedeActual.nombre}</Text>
                    <View style={{ backgroundColor: t.bg, borderRadius: 8, borderWidth: 1, borderColor: t.border, padding: 10, height: 220, marginBottom: 10 }}>
                      <ScrollView>
                        {mensajesChat.map((m, i) => (
                          <View key={i} style={{ marginBottom: 6 }}>
                            <Text style={{ color: t.primary, fontWeight: "bold", fontSize: 11 }}>{m.autor} ({m.hora}):</Text>
                            <Text style={{ color: t.textMain, fontSize: 12 }}>{m.texto}</Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                    <View style={{ flexDirection: "row", gap: 6 }}>
                      <TextInput
                        style={[styles.loginInput, { flex: 1, backgroundColor: t.bg, borderColor: t.border, color: t.textMain, marginBottom: 0, padding: 8 }]}
                        placeholder="Escribir mensaje..."
                        placeholderTextColor={t.textSub}
                        value={nuevoMensajeTexto}
                        onChangeText={setNuevoMensajeTexto}
                      />
                      <TouchableOpacity style={[styles.loginButton, { backgroundColor: t.primary, paddingHorizontal: 14 }]} onPress={enviarMensajeChat}>
                        <Text style={styles.loginButtonText}>Enviar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {pestana === "eventos" && (
                <>
                  <View style={styles.monthsRow}>
                    {listaMesesDinamicos.map((itemMes) => (
                      <TouchableOpacity
                        key={itemMes.key}
                        style={[styles.monthTab, { backgroundColor: t.cardBg, borderColor: t.border }, mesSeleccionadoObj.key === itemMes.key && { backgroundColor: t.primary }]}
                        onPress={() => setMesSeleccionadoObj(itemMes)}
                      >
                        <Text style={[styles.monthText, { color: t.textSub }, mesSeleccionadoObj.key === itemMes.key && styles.monthTextActive]}>
                          {itemMes.nombre}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {serviciosDelDia.length > 0 ? (
                    serviciosDelDia.map((serv) => (
                      <View key={serv.id} style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                        <Text style={[styles.eventMainTitle, { color: t.textMain }]}>📅 {serv.titulo}</Text>
                        <Text style={{ color: t.textSub, fontSize: 11, marginBottom: 6 }}>{serv.observaciones}</Text>
                        <TouchableOpacity
                          style={{ backgroundColor: "#2563EB", padding: 8, borderRadius: 6, alignItems: "center" }}
                          onPress={() => {
                            setSetlistEnVivoActual(serv.setlist);
                            setIndiceCancionEnVivo(0);
                            setModoEnVivoActivo(true);
                          }}
                        >
                          <Text style={{ color: "#FFF", fontWeight: "bold" }}>▶️ Modo en vivo</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                      <Text style={{ color: t.textSub, textAlign: "center" }}>Sin servicios programados para este día.</Text>
                    </View>
                  )}
                </>
              )}

              {pestana === "repertorio" && (
                <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                  <Text style={[styles.cardTitle, { color: t.textMain }]}>🎵 Repertorio de {sedeActual.nombre}</Text>
                  {repertorio.map((c) => (
                    <View key={c.id} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: t.border }}>
                      <Text style={{ color: t.textMain, fontWeight: "bold" }}>{c.titulo}</Text>
                      <Text style={{ color: t.textSub, fontSize: 12 }}>{c.artista} • Tono: {c.tono}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={[styles.tabBar, { backgroundColor: t.cardBg, borderTopColor: t.border }]}>
            {[
              { key: "inicio", label: "🏠 Inicio" },
              { key: "eventos", label: "📅 Eventos" },
              { key: "repertorio", label: "🎵 Repertorio" },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabItem, pestana === tab.key && { borderTopWidth: 4, borderTopColor: t.primary }]}
                onPress={() => setPestana(tab.key)}
              >
                <Text style={[styles.tabText, { color: t.textSub }, pestana === tab.key && { color: t.textMain, fontWeight: "bold" }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", height: "100%", minHeight: "100vh" },
  loginContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, width: "100%", minHeight: "100vh" },
  loginCard: { width: "100%", maxWidth: 400, padding: 24, borderRadius: 12, borderWidth: 1 },
  loginTitle: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 6 },
  loginSubtitle: { fontSize: 13, textAlign: "center", marginBottom: 20 },
  loginInput: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 14, fontSize: 15 },
  loginButton: { padding: 14, borderRadius: 8, alignItems: "center" },
  loginButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
  header: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, width: "100%" },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  headerSubtitle: { fontSize: 11, marginTop: 2 },
  logoutBtn: { backgroundColor: "#EF4444", paddingVertical: 5, paddingHorizontal: 8, borderRadius: 6 },
  logoutBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 11 },
  content: { flex: 1, padding: 12, width: "100%" },
  mainWrapper: { width: "100%", maxWidth: 650 },
  card: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 14, width: "100%" },
  cardTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 10 },
  welcomeBanner: { padding: 16, borderRadius: 12, marginBottom: 14, width: "100%" },
  welcomeTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "bold", marginBottom: 6 },
  welcomeBannerText: { color: "#E2E8F0", fontSize: 14, fontStyle: "italic" },
  inputLabel: { fontSize: 11, marginBottom: 4, fontWeight: "500" },
  monthsRow: { flexDirection: "row", gap: 6, marginBottom: 8, width: "100%" },
  monthTab: { flex: 1, paddingVertical: 5, alignItems: "center", borderRadius: 6, borderWidth: 1 },
  monthText: { fontSize: 11 },
  monthTextActive: { color: "#FFFFFF", fontWeight: "bold" },
  eventMainTitle: { fontSize: 15, fontWeight: "bold" },
  tabBar: { flexDirection: "row", height: 65, borderTopWidth: 1, width: "100%", paddingHorizontal: 8, alignItems: "center" },
  tabItem: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 10 },
  tabText: { fontSize: 14, textAlign: "center", fontWeight: "600" },
  teleprompterContainer: { flex: 1, width: "100%", height: "100%", minHeight: "100vh", padding: 8 },
  teleprompterTopBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6, borderBottomWidth: 1, borderBottomColor: "#1E293B", paddingBottom: 6, width: "100%" },
  teleprompterExitBtn: { backgroundColor: "#1E293B", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 5 },
  teleprompterScrollContent: { paddingBottom: 30, alignItems: "center", width: "100%" },
  teleprompterCard: { width: "100%", maxWidth: 800, backgroundColor: "#1E293B", padding: 12, borderRadius: 8, marginBottom: 8 },
  teleprompterSongTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  teleprompterLyricsBox: { width: "100%", maxWidth: 800, backgroundColor: "#0F172A", padding: 12, borderRadius: 8, marginBottom: 10 },
  teleprompterLyricsText: { color: "#F8FAFC", fontSize: 14, lineHeight: 22 },
  teleprompterNavRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", maxWidth: 800, gap: 8 },
  teleprompterNavBtn: { flex: 1, padding: 12, borderRadius: 6, alignItems: "center" },
});