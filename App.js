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

const SEDES_DISPONIBLES = [
  { id: "general", nombre: "Sede General" },
  { id: "norte", nombre: "Sede Norte" },
  { id: "sur", nombre: "Sede Sur" },
  { id: "occidente", nombre: "Sede Occidente" },
];

const NOTAS_SEMI = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTAS_BEMOL = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" };

const transponerNotaUnica = (acorde, semitonos) => {
  if (!acorde) return "";
  let base = acorde.trim();
  let resto = "";
  let raiz = "";
  if (base.length >= 2 && (base[1] === "#" || base[1] === "b")) {
    raiz = base.substring(0, 2);
    resto = base.substring(2);
  } else {
    raiz = base.substring(0, 1);
    resto = base.substring(1);
  }
  if (NOTAS_BEMOL[raiz]) raiz = NOTAS_BEMOL[raiz];
  let idx = NOTAS_SEMI.indexOf(raiz);
  if (idx === -1) return acorde;
  let nuevoIdx = (idx + semitonos) % 12;
  if (nuevoIdx < 0) nuevoIdx += 12;
  return NOTAS_SEMI[nuevoIdx] + resto;
};

const transponerAcordeCompuesto = (acordeCompuesto, semitonos) => {
  if (semitonos === 0) return acordeCompuesto;
  if (acordeCompuesto.includes("/")) {
    const partes = acordeCompuesto.split("/");
    return transponerNotaUnica(partes[0], semitonos) + "/" + transponerNotaUnica(partes[1], semitonos);
  }
  return transponerNotaUnica(acordeCompuesto, semitonos);
};

const transponerTextoLetra = (texto, semitonos) => {
  if (semitonos === 0 || !texto) return texto;
  let textoTranspuesto = texto.replace(/\[([^\]]+)\]/g, (match, p1) => {
    return "[" + transponerAcordeCompuesto(p1, semitonos) + "]";
  });
  const lineas = textoTranspuesto.split("\n");
  const lineasProcesadas = lineas.map((linea) => {
    if (linea.trim().startsWith("[") && linea.trim().endsWith("]")) return linea;
    const palabras = linea.trim().split(/\s+/);
    const esLineaDeAcordes =
      palabras.length > 0 &&
      palabras.every((p) => {
        const limpia = p.replace(/[^A-G#bm0-9/]/g, "");
        return /^[A-G](#|b)?(m|maj|min|dim|aug|sus|[0-9])*(\/[A-G](#|b)?)?$/.test(limpia);
      });
    if (esLineaDeAcordes) {
      return palabras.map((p) => transponerAcordeCompuesto(p, semitonos)).join("   ");
    }
    return linea;
  });
  return lineasProcesadas.join("\n");
};

export default function App() {
  const [sedeIdSeleccionada, setSedeIdSeleccionada] = useState(() => {
    if (Platform.OS === "web") {
      try { return localStorage.getItem("soundteam_sede_activa") || "general"; } catch (e) { return "general"; }
    }
    return "general";
  });

  useEffect(() => {
    if (Platform.OS === "web") {
      try { localStorage.setItem("soundteam_sede_activa", sedeIdSeleccionada); } catch (e) {}
    }
  }, [sedeIdSeleccionada]);

  const [integrantes, setIntegrantes] = useState([]);

  const cargarIntegrantesSupabase = async () => {
    const { data, error } = await supabase.from("integrantes").select("*");
    if (data && !error && data.length > 0) {
      const formateados = data.map((m) => ({
        id: m.id,
        nombre: m.nombre,
        pin: m.pin,
        sedeId: m.sede_id,
        rolAcceso: m.rol_acceso,
        rolesMusicales: m.roles_musicales || [],
      }));
      setIntegrantes(formateados);
    }
  };

  useEffect(() => {
    cargarIntegrantesSupabase();
    const canalSub = supabase
      .channel("integrantes-cambios")
      .on("postgres_changes", { event: "*", schema: "public", table: "integrantes" }, () => {
        cargarIntegrantesSupabase();
      })
      .subscribe();
    return () => { supabase.removeChannel(canalSub); };
  }, []);

  const [usuario, setUsuario] = useState(() => {
    if (Platform.OS === "web") {
      try { return localStorage.getItem("soundteam_sesion_usuario") || ""; } catch (e) { return ""; }
    }
    return "";
  });

  const [pinInput, setPinInput] = useState("");
  const [sesionIniciada, setSesionIniciada] = useState(() => {
    if (Platform.OS === "web") {
      try { return localStorage.getItem("soundteam_sesion_activa") === "true"; } catch (e) { return false; }
    }
    return false;
  });

  const [rolUsuario, setRolUsuario] = useState(() => {
    if (Platform.OS === "web") {
      try { return localStorage.getItem("soundteam_sesion_rol") || "miembro"; } catch (e) { return "miembro"; }
    }
    return "miembro";
  });

  const [pestana, setPestana] = useState("inicio");
  const [nombreTema, setNombreTema] = useState(() => {
    if (Platform.OS === "web") {
      try { return localStorage.getItem("soundteam_tema_app") || "azul"; } catch (e) { return "azul"; }
    }
    return "azul";
  });
  const [mostrarMenuTemas, setMostrarMenuTemas] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") {
      try { localStorage.setItem("soundteam_tema_app", nombreTema); } catch (e) {}
    }
  }, [nombreTema]);

  const t = TEMAS[nombreTema];
  const sedeActual = SEDES_DISPONIBLES.find((s) => s.id === sedeIdSeleccionada) || SEDES_DISPONIBLES[0];

  const integrantesSeccionEquipo = integrantes.filter((m) => {
    if (sedeIdSeleccionada === "general") return m.sedeId === "general";
    return m.sedeId === sedeIdSeleccionada;
  });

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

  const [paletasCulto, setPaletasCulto] = useState([
    { id: 1, nombre: "Atardecer Violeta", colores: ["#064680", "#31245A", "#AC6DBF", "#2A7CA3", "#588BC2"] },
    { id: 2, nombre: "Tonos Arena", colores: ["#C29B78", "#A17651", "#5C4033", "#222222"] },
    { id: 3, nombre: "Blanco Sacro", colores: ["#748185", "#93afb3", "#456467"] },
    { id: 4, nombre: "Rosa Alba", colores: ["#E29578", "#FFDDD2", "#83C5BE", "#006D77"] },
  ]);

  const [servicios, setServicios] = useState([]);

  const cargarServiciosSupabase = async () => {
    const { data, error } = await supabase.from("servicios").select("*");
    if (data && !error) {
      const formateados = data.map((s) => ({
        id: s.id,
        fecha: s.fecha,
        titulo: s.titulo,
        observaciones: s.observaciones || "Sin observaciones",
        setlist: s.setlist || [],
        paletaSeleccionada: s.paleta_seleccionada || null,
        voces: s.voces || { principal: "Sin asignar", coros: "Sin asignar" },
        instrumentos: s.instrumentos || { piano: "Sin asignar", guitarra: "Sin asignar", bajo: "Sin asignar", bateria: "Sin asignar" },
      }));
      setServicios(formateados);
    }
  };

  useEffect(() => {
    cargarServiciosSupabase();
    const canalSub = supabase
      .channel("servicios-cambios")
      .on("postgres_changes", { event: "*", schema: "public", table: "servicios" }, () => {
        cargarServiciosSupabase();
      })
      .subscribe();
    return () => { supabase.removeChannel(canalSub); };
  }, []);

  const [modalProgramarVisible, setModalProgramarVisible] = useState(false);
  const [modalPostularVisible, setModalPostularVisible] = useState(false);
  const [idServicioEditando, setIdServicioEditando] = useState(null);
  const [idServicioPostulando, setIdServicioPostulando] = useState(null);
  const [nombreEvento, setNombreEvento] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [paletaSeleccionadaModal, setPaletaSeleccionadaModal] = useState(null);
  const [setlistActivo, setSetlistActivo] = useState([]);
  const [indiceParaMover, setIndiceParaMover] = useState(null);

  const [modalMiembroVisible, setModalMiembroVisible] = useState(false);
  const [nombreNuevoMiembro, setNombreNuevoMiembro] = useState("");
  const [pinNuevoMiembro, setPinNuevoMiembro] = useState("1234");
  const [rolAccesoNuevo, setRolAccesoNuevo] = useState("miembro");
  const [rolesMusicalesNuevo, setRolesMusicalesNuevo] = useState([]);

  const [repertorio, setRepertorio] = useState([
    {
      id: 1,
      titulo: "A dónde iré",
      artista: "Verbo y Vida",
      tono: "F",
      etiquetas: ["Adoración", "Entrega"],
      letra: "[INTRO]\nF C Dm\nC Bb F\nGm Bb\n\n[PRIMERA PARTE]\n[F] Siento que sin ti\n[Bb] Mi vida es nada",
    },
    {
      id: 2,
      titulo: "Creo en ti",
      artista: "Espíritu y Verdad",
      tono: "C",
      etiquetas: ["Adoración"],
      letra: "[INTRO]\nC G Am F",
    },
    {
      id: 3,
      titulo: "Digno",
      artista: "Elevation Worship",
      tono: "E",
      etiquetas: ["Adoración"],
      letra: "[INTRO]\nE B C#m A",
    },
  ]);

  const [cancionSeleccionadaDetalle, setCancionSeleccionadaDetalle] = useState(null);
  const [semitonosTransposicion, setSemitonosTransposicion] = useState(0);

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
    cargarMensajesSupabase();
    const canalSub = supabase
      .channel(`chat-${sedeIdSeleccionada}-${canalChatActivo}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "mensajes", filter: `canal=eq.${canalChatActivo}` }, () => {
        cargarMensajesSupabase();
      })
      .subscribe();
    return () => { supabase.removeChannel(canalSub); };
  }, [canalChatActivo, sedeIdSeleccionada]);

  const esAdmin = rolUsuario === "admin";
  const esAdminOLider = rolUsuario === "admin" || rolUsuario === "lider";

  const handleLogin = () => {
    if (usuario.trim() === "" || pinInput.trim() === "") {
      alert("⚠️ Ingresa tu usuario y PIN.");
      return;
    }
    const miembroEncontrado = integrantes.find(
      (m) => m.nombre.trim().toLowerCase() === usuario.trim().toLowerCase() && m.sedeId === sedeIdSeleccionada
    );
    if (!miembroEncontrado) {
      alert(`⚠️ El usuario "${usuario}" no está registrado en ${sedeActual.nombre}.`);
      return;
    }
    if (miembroEncontrado.pin !== pinInput.trim()) {
      alert("⚠️ PIN incorrecto.");
      return;
    }
    const rolAsignado = miembroEncontrado.rolAcceso || "miembro";
    const nombreReal = miembroEncontrado.nombre;

    setUsuario(nombreReal);
    setRolUsuario(rolAsignado);
    setSesionIniciada(true);

    if (Platform.OS === "web") {
      try {
        localStorage.setItem("soundteam_sesion_activa", "true");
        localStorage.setItem("soundteam_sesion_usuario", nombreReal);
        localStorage.setItem("soundteam_sesion_rol", rolAsignado);
      } catch (e) {}
    }
  };

  const handleLogout = () => {
    setSesionIniciada(false);
    setUsuario("");
    setPinInput("");
    setRolUsuario("miembro");
    setPestana("inicio");
    setCancionSeleccionadaDetalle(null);
    if (Platform.OS === "web") {
      try {
        localStorage.removeItem("soundteam_sesion_activa");
        localStorage.removeItem("soundteam_sesion_usuario");
        localStorage.removeItem("soundteam_sesion_rol");
      } catch (e) {}
    }
  };

  const mesNumStr = String(mesSeleccionadoObj.mesIndex + 1).padStart(2, "0");
  const fechaActualClave = `${mesSeleccionadoObj.year}-${mesNumStr}-${diaSeleccionado < 10 ? "0" + diaSeleccionado : diaSeleccionado}`;
  const serviciosDelDia = servicios.filter((s) => s.fecha === fechaActualClave);

  const usuarioEstaPostuladoEnFecha = (fechaStr) => {
    const servs = servicios.filter((s) => s.fecha === fechaStr);
    for (const serv of servs) {
      const vp = serv.voces?.principal;
      const coros = serv.voces?.coros || "";
      const p = serv.instrumentos?.piano;
      const g = serv.instrumentos?.guitarra;
      const b = serv.instrumentos?.bajo;
      const bat = serv.instrumentos?.bateria;
      if (vp === usuario || coros.includes(usuario) || p === usuario || g === usuario || b === usuario || bat === usuario) {
        return true;
      }
    }
    return false;
  };

  const obtenerDiasDelMesDinamico = (mIndex, year) => {
    let totalDias = new Date(year, mIndex + 1, 0).getDate();
    let lista = [];
    let primerDiaIndex = new Date(year, mIndex, 1).getDay();
    for (let i = 0; i < primerDiaIndex; i++) {
      lista.push({ vacio: true, id: `vacio-${i}` });
    }
    for (let d = 1; d <= totalDias; d++) {
      const dStr = d < 10 ? "0" + d : String(d);
      const mStr = String(mIndex + 1).padStart(2, "0");
      const claveFecha = `${year}-${mStr}-${dStr}`;
      lista.push({ vacio: false, diaNum: d, postulado: usuarioEstaPostuladoEnFecha(claveFecha) });
    }
    return lista;
  };

  const confirmarPostulacionRol = async (rol) => {
    if (idServicioPostulando === null) return;
    const servicioObjetivo = servicios.find((s) => s.id === idServicioPostulando);
    if (!servicioObjetivo) return;

    let nuevaVozP = servicioObjetivo.voces?.principal || "Sin asignar";
    let nuevosCoros = servicioObjetivo.voces?.coros ? servicioObjetivo.voces.coros.split(", ").filter((c) => c !== "Sin asignar" && c !== "") : [];
    let nuevoPiano = servicioObjetivo.instrumentos?.piano || "Sin asignar";
    let nuevaGuitarra = servicioObjetivo.instrumentos?.guitarra || "Sin asignar";
    let nuevoBajo = servicioObjetivo.instrumentos?.bajo || "Sin asignar";
    let nuevaBateria = servicioObjetivo.instrumentos?.bateria || "Sin asignar";

    if (rol === "vozPrincipal") nuevaVozP = usuario;
    else if (rol === "coros") nuevosCoros.push(usuario);
    else if (rol === "piano") nuevoPiano = usuario;
    else if (rol === "guitarra") nuevaGuitarra = usuario;
    else if (rol === "bajo") nuevoBajo = usuario;
    else if (rol === "bateria") nuevaBateria = usuario;

    const nVoces = { principal: nuevaVozP, coros: nuevosCoros.length > 0 ? nuevosCoros.join(", ") : "Sin asignar" };
    const nInst = { piano: nuevoPiano, guitarra: nuevaGuitarra, bajo: nuevoBajo, bateria: nuevaBateria };

    setServicios(servicios.map((s) => s.id === idServicioPostulando ? { ...s, voces: nVoces, instrumentos: nInst } : s));
    await supabase.from("servicios").update({ voces: nVoces, instrumentos: nInst }).eq("id", idServicioPostulando);
    setModalPostularVisible(false);
    alert("🚀 Postulación realizada.");
  };

  if (!sesionIniciada) {
    return (
      <View style={[styles.loginContainer, { backgroundColor: t.bg }]}>
        <View style={[styles.loginCard, { backgroundColor: t.cardBg, borderColor: t.border }]}>
          <Text style={[styles.loginTitle, { color: t.textMain }]}>SoundTeam</Text>
          <Text style={[styles.loginSubtitle, { color: t.textSub }]}>Inicio de Sesión</Text>
          
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
                cursor: "pointer",
              }}
            >
              {SEDES_DISPONIBLES.map((s) => (
                <option key={s.id} value={s.id} style={{ backgroundColor: t.cardBg, color: t.textMain }}>{s.nombre}</option>
              ))}
            </select>
          ) : (
            <View style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border }]}><Text style={{ color: t.textMain }}>{sedeActual.nombre}</Text></View>
          )}

          <Text style={[styles.inputLabel, { color: t.textMain }]}>👤 Usuario o Apodo:</Text>
          <TextInput
            style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
            placeholder="Ej. Admin, AdminNorte, Lina..."
            placeholderTextColor={t.textSub}
            value={usuario}
            onChangeText={setUsuario}
          />

          <Text style={[styles.inputLabel, { color: t.textMain }]}>🔑 PIN de Acceso:</Text>
          <TextInput
            style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
            placeholder="Ej. 1234"
            placeholderTextColor={t.textSub}
            secureTextEntry
            value={pinInput}
            onChangeText={setPinInput}
          />

          <TouchableOpacity style={[styles.loginButton, { backgroundColor: t.primary }]} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={[styles.header, { backgroundColor: t.cardBg, borderBottomColor: t.border }]}>
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: t.textMain }]}>SoundTeam • {sedeActual.nombre}</Text>
            <Text style={[styles.headerSubtitle, { color: t.textSub }]} numberOfLines={1}>
              👤 {usuario} • <Text style={{ color: t.primary, fontWeight: "bold" }}>ROL: {rolUsuario.toUpperCase()}</Text>
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginTop: 8 }}>
          <TouchableOpacity
            style={{
              backgroundColor: t.bg,
              borderWidth: 1,
              borderColor: t.border,
              paddingVertical: 5,
              paddingHorizontal: 10,
              borderRadius: 6,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onPress={() => setMostrarMenuTemas(!mostrarMenuTemas)}
          >
            <Text style={{ fontSize: 11, color: t.textMain, fontWeight: "bold" }}>🎨 Tema actual: {t.nombre}</Text>
            <Text style={{ fontSize: 11, color: t.primary, fontWeight: "bold" }}>{mostrarMenuTemas ? "▲ Ocultar" : "▼ Cambiar tema"}</Text>
          </TouchableOpacity>

          {mostrarMenuTemas && (
            <View style={{ marginTop: 4, backgroundColor: t.cardBg, borderRadius: 6, borderWidth: 1, borderColor: t.border, padding: 6, gap: 4 }}>
              {[
                { key: "azul", label: "🔵 Azul" },
                { key: "claro", label: "☀️ Claro" },
                { key: "oscuro", label: "🌙 Oscuro" },
                { key: "rosado", label: "🌸 Rosado" },
                { key: "morado", label: "🟣 Morado" },
                { key: "esmeralda", label: "🟢 Esmeralda" },
                { key: "sunset", label: "🌅 Sunset" },
                { key: "minimal", label: "⬛ Minimal" },
              ].map((itemTema) => {
                const activo = nombreTema === itemTema.key;
                return (
                  <TouchableOpacity
                    key={itemTema.key}
                    style={{ paddingVertical: 6, paddingHorizontal: 8, borderRadius: 4, backgroundColor: activo ? t.primary + "33" : "transparent" }}
                    onPress={() => { setNombreTema(itemTema.key); setMostrarMenuTemas(false); }}
                  >
                    <Text style={{ fontSize: 11, color: activo ? t.primary : t.textMain, fontWeight: activo ? "bold" : "normal" }}>
                      {itemTema.label} {activo ? "✓" : ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
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
                <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
                  {[
                    { key: "martes", label: "🗓️ Martes" },
                    { key: "jueves", label: "🗓️ Jueves" },
                    { key: "finsemana", label: "⛪ Sáb & Dom" },
                  ].map((ch) => (
                    <TouchableOpacity
                      key={ch.key}
                      style={[
                        { flex: 1, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: t.border, backgroundColor: t.bg, alignItems: "center" },
                        canalChatActivo === ch.key && { backgroundColor: t.primary, borderColor: t.primary },
                      ]}
                      onPress={() => setCanalChatActivo(ch.key)}
                    >
                      <Text style={{ fontSize: 11, color: canalChatActivo === ch.key ? "#FFF" : t.textSub }}>{ch.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ backgroundColor: t.bg, borderRadius: 8, borderWidth: 1, borderColor: t.border, padding: 10, height: 200, marginBottom: 10 }}>
                  <ScrollView>
                    {mensajesChat.length === 0 ? (
                      <Text style={{ color: t.textSub, textAlign: "center", marginTop: 20, fontSize: 12 }}>No hay mensajes en este chat.</Text>
                    ) : (
                      mensajesChat.map((m, i) => (
                        <View key={m.id || i} style={{ marginBottom: 6, backgroundColor: t.cardBg, padding: 6, borderRadius: 6 }}>
                          <Text style={{ color: t.primary, fontWeight: "bold", fontSize: 11 }}>{m.autor}</Text>
                          <Text style={{ color: t.textMain, fontSize: 12 }}>{m.texto}</Text>
                        </View>
                      ))
                    )}
                  </ScrollView>
                </View>

                <View style={{ flexDirection: "row", gap: 6 }}>
                  <TextInput
                    style={[styles.loginInput, { flex: 1, backgroundColor: t.bg, borderColor: t.border, color: t.textMain, marginBottom: 0 }]}
                    placeholder="Escribir mensaje..."
                    placeholderTextColor={t.textSub}
                    value={nuevoMensajeTexto}
                    onChangeText={setNuevoMensajeTexto}
                  />
                  <TouchableOpacity
                    style={[styles.loginButton, { backgroundColor: t.primary, justifyContent: "center", paddingVertical: 8, paddingHorizontal: 14 }]}
                    onPress={async () => {
                      if (nuevoMensajeTexto.trim() !== "") {
                        const m = {
                          autor: usuario,
                          texto: nuevoMensajeTexto.trim(),
                          hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                          canal: canalChatActivo,
                          sede: sedeIdSeleccionada,
                        };
                        setNuevoMensajeTexto("");
                        await supabase.from("mensajes").insert([m]);
                        await cargarMensajesSupabase();
                      }
                    }}
                  >
                    <Text style={[styles.loginButtonText, { fontSize: 12 }]}>Enviar</Text>
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
                    style={[styles.monthTab, { backgroundColor: t.cardBg, borderColor: t.border }, mesSeleccionadoObj.key === itemMes.key && { backgroundColor: t.primary, borderColor: t.primary }]}
                    onPress={() => { setMesSeleccionadoObj(itemMes); setDiaSeleccionado(1); }}
                  >
                    <Text style={[styles.monthText, { color: t.textSub }, mesSeleccionadoObj.key === itemMes.key && styles.monthTextActive]}>
                      {itemMes.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.calendarCard, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                <Text style={[styles.calendarHeaderTitle, { color: t.textMain }]}>{mesSeleccionadoObj.nombre} {mesSeleccionadoObj.year}</Text>
                <View style={styles.weekHeaderRow}>
                  {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((dSem, idx) => (
                    <Text key={idx} style={[styles.weekHeaderText, { color: t.textSub }]}>{dSem}</Text>
                  ))}
                </View>
                <View style={styles.daysGrid}>
                  {obtenerDiasDelMesDinamico(mesSeleccionadoObj.mesIndex, mesSeleccionadoObj.year).map((item, index) => {
                    if (item.vacio) return <View key={item.id} style={styles.dayCellEmpty} />;
                    const esSeleccionado = diaSeleccionado === item.diaNum;
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[styles.dayCell, { backgroundColor: t.bg, borderColor: t.border }, esSeleccionado && { backgroundColor: t.selectedDay, borderColor: t.selectedDay }]}
                        onPress={() => setDiaSeleccionado(item.diaNum)}
                      >
                        <Text style={[styles.dayText, { color: t.textMain }, esSeleccionado && styles.dayTextSelected]}>{item.diaNum}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.serviceSectionHeader}>
                <Text style={[styles.serviceSectionTitle, { color: t.textMain }]}>Servicios del Día {diaSeleccionado} ({serviciosDelDia.length})</Text>
                {esAdminOLider && (
                  <TouchableOpacity
                    style={[styles.programBtn, { backgroundColor: t.primary }]}
                    onPress={() => {
                      setIdServicioEditando(null);
                      setNombreEvento(esDomingoSeleccionado ? "Culto Dominical" : "Culto");
                      setObservaciones("");
                      setSetlistActivo([]);
                      setModalProgramarVisible(true);
                    }}
                  >
                    <Text style={styles.programBtnText}>+ Programar</Text>
                  </TouchableOpacity>
                )}
              </View>

              {modalProgramarVisible && (
                <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.primary, borderWidth: 2 }]}>
                  <Text style={[styles.cardTitle, { color: t.textMain }]}>Nuevo Servicio</Text>
                  <TextInput
                    style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
                    placeholder="Nombre del evento"
                    placeholderTextColor={t.textSub}
                    value={nombreEvento}
                    onChangeText={setNombreEvento}
                  />
                  <TouchableOpacity
                    style={[styles.loginButton, { backgroundColor: t.primary, padding: 10 }]}
                    onPress={async () => {
                      if (nombreEvento.trim() !== "") {
                        const nuevoServicio = {
                          id: Date.now(),
                          fecha: fechaActualClave,
                          titulo: nombreEvento,
                          observaciones: observaciones || "Sin observaciones",
                          setlist: [],
                          voces: { principal: "Sin asignar", coros: "Sin asignar" },
                          instrumentos: { piano: "Sin asignar", guitarra: "Sin asignar", bajo: "Sin asignar", bateria: "Sin asignar" },
                        };
                        setServicios([...servicios, nuevoServicio]);
                        await supabase.from("servicios").insert([nuevoServicio]);
                        setModalProgramarVisible(false);
                      }
                    }}
                  >
                    <Text style={styles.loginButtonText}>Guardar Servicio</Text>
                  </TouchableOpacity>
                </View>
              )}

              {serviciosDelDia.map((serv) => (
                <View key={serv.id} style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                  <Text style={[styles.eventMainTitle, { color: t.textMain }]}>📅 {serv.titulo}</Text>
                  <Text style={{ color: t.textSub, fontSize: 12, marginVertical: 4 }}>{serv.observaciones}</Text>
                  <TouchableOpacity
                    style={styles.postulateBtn}
                    onPress={() => { setIdServicioPostulando(serv.id); setModalPostularVisible(true); }}
                  >
                    <Text style={styles.actionBtnText}>Postularme (Confirmar asistencia)</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          {modalPostularVisible && (
            <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.selectedDay, borderWidth: 2 }]}>
              <Text style={[styles.cardTitle, { color: t.textMain }]}>Selecciona tu Rol</Text>
              {["vozPrincipal", "coros", "piano", "guitarra", "bajo", "bateria"].map((rolKey) => (
                <TouchableOpacity
                  key={rolKey}
                  style={[styles.postulateRoleOption, { backgroundColor: t.bg, borderColor: t.border }]}
                  onPress={() => confirmarPostulacionRol(rolKey)}
                >
                  <Text style={{ color: t.textMain, fontWeight: "bold" }}>{rolKey.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {pestana === "equipo" && esAdminOLider && (
            <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={[styles.cardTitle, { color: t.textMain, marginBottom: 0 }]}>👥 Miembros de {sedeActual.nombre} ({integrantesSeccionEquipo.length})</Text>
                <TouchableOpacity style={[styles.programBtn, { backgroundColor: t.primary }]} onPress={() => setModalMiembroVisible(true)}>
                  <Text style={styles.programBtnText}>+ Agregar Miembro</Text>
                </TouchableOpacity>
              </View>

              {modalMiembroVisible && (
                <View style={[styles.card, { backgroundColor: t.bg, borderColor: t.primary, borderWidth: 2 }]}>
                  <TextInput
                    style={[styles.loginInput, { backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain }]}
                    placeholder="Nombre del integrante"
                    placeholderTextColor={t.textSub}
                    value={nombreNuevoMiembro}
                    onChangeText={setNombreNuevoMiembro}
                  />
                  <TouchableOpacity
                    style={[styles.loginButton, { backgroundColor: t.primary, padding: 10 }]}
                    onPress={async () => {
                      if (nombreNuevoMiembro.trim() !== "") {
                        const nuevoInt = {
                          id: Date.now(),
                          nombre: nombreNuevoMiembro.trim(),
                          pin: pinNuevoMiembro,
                          sede_id: sedeIdSeleccionada,
                          rol_acceso: rolAccesoNuevo,
                          roles_musicales: rolesMusicalesNuevo,
                        };
                        await supabase.from("integrantes").insert([nuevoInt]);
                        await cargarIntegrantesSupabase();
                        setModalMiembroVisible(false);
                      }
                    }}
                  >
                    <Text style={styles.loginButtonText}>Guardar Miembro</Text>
                  </TouchableOpacity>
                </View>
              )}

              {integrantesSeccionEquipo.map((int) => (
                <View key={int.id} style={[styles.memberCard, { backgroundColor: t.bg, borderColor: t.border }]}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={[styles.memberTitle, { color: t.textMain }]}>👤 {int.nombre}</Text>
                    <TouchableOpacity
                      style={{ backgroundColor: "#EF4444", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 }}
                      onPress={async () => {
                        setIntegrantes(integrantes.filter((item) => item.id !== int.id));
                        await supabase.from("integrantes").delete().eq("id", int.id);
                      }}
                    >
                      <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "bold" }}>🗑️ Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={{ color: t.primary, fontSize: 12, marginTop: 4 }}>🎵 Roles: {int.rolesMusicales?.join(", ") || "Ninguno"}</Text>
                </View>
              ))}
            </View>
          )}

          {pestana === "repertorio" && (
            <>
              {cancionSeleccionadaDetalle !== null ? (
                <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                  <TouchableOpacity style={styles.backBtn} onPress={() => { setCancionSeleccionadaDetalle(null); setSemitonosTransposicion(0); }}>
                    <Text style={{ color: t.primary, fontWeight: "bold" }}>← Volver al repertorio</Text>
                  </TouchableOpacity>

                  <Text style={{ fontSize: 20, fontWeight: "bold", color: t.textMain, marginTop: 6 }}>{cancionSeleccionadaDetalle.titulo}</Text>
                  <Text style={{ color: t.textSub, fontSize: 12, marginBottom: 10 }}>{cancionSeleccionadaDetalle.artista}</Text>

                  <View style={[styles.lyricsBox, { backgroundColor: t.bg, borderColor: t.border }]}>
                    <Text style={{ color: t.textMain, fontSize: 13, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace", lineHeight: 22 }}>
                      {transponerTextoLetra(cancionSeleccionadaDetalle.letra, semitonosTransposicion)}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                  <Text style={[styles.cardTitle, { color: t.textMain }]}>Repertorio ({repertorio.length})</Text>
                  {repertorio.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.repertorioItemRowPro, { borderBottomColor: t.border, backgroundColor: t.bg }]}
                      onPress={() => { setCancionSeleccionadaDetalle(c); setSemitonosTransposicion(0); }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: t.textMain, fontWeight: "bold", fontSize: 14 }}>{c.titulo}</Text>
                        <Text style={{ color: t.textSub, fontSize: 12 }}>{c.artista}</Text>
                      </View>
                      <View style={[styles.toneBadgeActive, { backgroundColor: t.primary }]}>
                        <Text style={{ color: "#FFF", fontWeight: "bold" }}>{c.tono}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <View style={[styles.tabBar, { backgroundColor: t.cardBg, borderTopColor: t.border }]}>
        {[
          { key: "inicio", label: "🏠 Inicio" },
          { key: "eventos", label: "📅 Eventos" },
          ...(esAdminOLider ? [{ key: "equipo", label: "👥 Equipo" }] : []),
          { key: "repertorio", label: "🎵 Repertorio" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, pestana === tab.key && { borderTopWidth: 3, borderTopColor: t.primary }]}
            onPress={() => { setPestana(tab.key); if (tab.key === "repertorio") setCancionSeleccionadaDetalle(null); }}
          >
            <Text style={[styles.tabText, { color: pestana === tab.key ? t.textMain : t.textSub, fontWeight: pestana === tab.key ? "bold" : "normal" }]} numberOfLines={1}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", height: "100%", minHeight: "100vh" },
  loginContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, width: "100%", minHeight: "100vh" },
  loginCard: { width: "100%", maxWidth: 400, padding: 24, borderRadius: 12, borderWidth: 1 },
  loginTitle: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  loginSubtitle: { fontSize: 13, textAlign: "center", marginBottom: 20 },
  inputLabel: { fontSize: 11, marginBottom: 4, fontWeight: "500" },
  loginInput: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 14, fontSize: 15 },
  loginButton: { padding: 14, borderRadius: 8, alignItems: "center" },
  loginButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
  header: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, width: "100%" },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  headerSubtitle: { fontSize: 11, marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 6 },
  logoutBtn: { backgroundColor: "#EF4444", paddingVertical: 5, paddingHorizontal: 8, borderRadius: 6 },
  logoutBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 11 },
  content: { flex: 1, padding: 12, width: "100%" },
  mainWrapper: { width: "100%", maxWidth: 650 },
  card: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 14, width: "100%" },
  cardTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 10 },
  welcomeBanner: { padding: 16, borderRadius: 12, marginBottom: 14, width: "100%" },
  welcomeTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "bold", marginBottom: 6 },
  welcomeBannerText: { color: "#E2E8F0", fontSize: 14, fontStyle: "italic" },
  monthsRow: { flexDirection: "row", gap: 6, marginBottom: 10, width: "100%" },
  monthTab: { flex: 1, paddingVertical: 6, alignItems: "center", borderRadius: 8, borderWidth: 1 },
  monthText: { fontSize: 11 },
  monthTextActive: { color: "#FFFFFF", fontWeight: "bold" },
  calendarCard: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 14, width: "100%", alignItems: "center" },
  calendarHeaderTitle: { fontSize: 14, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  weekHeaderRow: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginBottom: 6 },
  weekHeaderText: { fontSize: 11, fontWeight: "bold", width: "13%", textAlign: "center" },
  daysGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4, justifyContent: "flex-start", width: "100%" },
  dayCell: { width: "13%", aspectRatio: 1, justifyContent: "center", alignItems: "center", borderRadius: 6, borderWidth: 1, marginBottom: 4 },
  dayCellEmpty: { width: "13%", aspectRatio: 1, marginBottom: 4 },
  dayText: { fontSize: 13, fontWeight: "bold" },
  dayTextSelected: { color: "#FFFFFF", fontWeight: "bold" },
  serviceSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, width: "100%" },
  serviceSectionTitle: { fontSize: 13, fontWeight: "bold", flex: 1 },
  programBtn: { paddingVertical: 5, paddingHorizontal: 8, borderRadius: 6 },
  programBtnText: { color: "#FFFFFF", fontSize: 11, fontWeight: "bold" },
  eventMainTitle: { fontSize: 15, fontWeight: "bold" },
  backBtn: { paddingVertical: 6, marginBottom: 6 },
  toneBadgeActive: { backgroundColor: "#2563EB", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  lyricsBox: { padding: 12, borderRadius: 8, borderWidth: 1, marginTop: 8 },
  repertorioItemRowPro: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 6 },
  tabBar: { flexDirection: "row", height: 55, borderTopWidth: 1, width: "100%" },
  tabItem: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabText: { fontSize: 11 },
  memberCard: { padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
  memberTitle: { fontSize: 14, fontWeight: "bold" },
  postulateBtn: { backgroundColor: "#F97316", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 8 },
  actionBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },
  postulateRoleOption: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 8, alignItems: "center" },
});