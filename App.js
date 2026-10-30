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
  let raiz = "";
  if (base.length >= 2 && (base[1] === "#" || base[1] === "b")) {
    raiz = base.substring(0, 2);
  } else {
    raiz = base.substring(0, 1);
  }
  if (NOTAS_BEMOL[raiz]) raiz = NOTAS_BEMOL[raiz];
  let idx = NOTAS_SEMI.indexOf(raiz);
  if (idx === -1) return acorde;
  let nuevoIdx = (idx + semitonos) % 12;
  if (nuevoIdx < 0) nuevoIdx += 12;
  return base.replace(raiz, NOTAS_SEMI[nuevoIdx]);
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
  return textoTranspuesto;
};

export default function App() {
  const [sedeIdSeleccionada, setSedeIdSeleccionada] = useState("general");
  const [esRegistroNuevo, setEsRegistroNuevo] = useState(false);

  const [integrantes, setIntegrantes] = useState(() => {
    if (Platform.OS === "web") {
      try {
        const guardados = localStorage.getItem("soundteam_integrantes_v4");
        return guardados
          ? JSON.parse(guardados)
          : [
              { id: 1, nombre: "Admin", pin: "1234", sedeId: "general", rolAcceso: "admin", rolesMusicales: ["👑 Director"] },
              { id: 2, nombre: "Líder", pin: "1234", sedeId: "general", rolAcceso: "lider", rolesMusicales: ["⭐ Líder de Grupo"] },
              { id: 3, nombre: "Lina", pin: "1234", sedeId: "general", rolAcceso: "miembro", rolesMusicales: ["🎤 Coros"] },
              { id: 4, nombre: "Arley", pin: "1234", sedeId: "general", rolAcceso: "miembro", rolesMusicales: ["🎹 Piano"] },
              { id: 5, nombre: "Alex", pin: "1234", sedeId: "general", rolAcceso: "miembro", rolesMusicales: ["🥁 Batería"] },
            ];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (Platform.OS === "web") {
      try {
        localStorage.setItem("soundteam_integrantes_v4", JSON.stringify(integrantes));
      } catch (e) {}
    }
  }, [integrantes]);

  const [usuario, setUsuario] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [rolUsuario, setRolUsuario] = useState("miembro");
  const [pestana, setPestana] = useState("inicio");
  const [nombreTema, setNombreTema] = useState("azul");
  const [mostrarMenuTemas, setMostrarMenuTemas] = useState(false);

  const t = TEMAS[nombreTema];
  const sedeActual = SEDES_DISPONIBLES.find((s) => s.id === sedeIdSeleccionada) || SEDES_DISPONIBLES[0];

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
  const [idMiembroEditando, setIdMiembroEditando] = useState(null);
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
      etiquetas: ["Adoración"],
      letra: "[INTRO]\nF C Dm\nC Bb F\n\n[VERSO]\n[F] Siento que sin ti\n[Bb] Mi vida es nada",
    },
    {
      id: 2,
      titulo: "Creo en ti",
      artista: "Espíritu y Verdad",
      tono: "C",
      etiquetas: ["Alabanza"],
      letra: "[VERSO]\n[C] Creo en ti, [G] Señor\n[Am] Con todo el corazón",
    },
  ]);

  const [cancionSeleccionadaDetalle, setCancionSeleccionadaDetalle] = useState(null);
  const [semitonosTransposicion, setSemitonosTransposicion] = useState(0);
  const [modoEdicionCancion, setModoEdicionCancion] = useState(false);
  const [nuevoTituloCancion, setNuevoTituloCancion] = useState("");
  const [nuevoArtistaCancion, setNuevoArtistaCancion] = useState("");
  const [nuevoTonoCancion, setNuevoTonoCancion] = useState("");
  const [nuevaLetraCancion, setNuevaLetraCancion] = useState("");

  const [canalChatActivo, setCanalChatActivo] = useState("finsemana");
  const [mensajesChat, setMensajesChat] = useState([]);
  const [nuevoMensajeTexto, setNuevoMensajeTexto] = useState("");
  const [idMensajeEditando, setIdMensajeEditando] = useState(null);
  const [textoOriginalEditando, setTextoOriginalEditando] = useState("");
  const [mostrarSelectorEmojis, setMostrarSelectorEmojis] = useState(false);

  const cargarMensajesSupabase = async () => {
    const { data, error } = await supabase.from("mensajes").select("*").eq("canal", canalChatActivo).order("created_at", { ascending: true });
    if (data && !error) setMensajesChat(data);
    else setMensajesChat([]);
  };

  useEffect(() => {
    cargarMensajesSupabase();
  }, [canalChatActivo]);

  const handleLogin = () => {
    if (usuario.trim() === "" || pinInput.trim() === "") {
      alert("⚠️ Ingresa tu usuario y PIN.");
      return;
    }
    const miembroEncontrado = integrantes.find(
      (m) => m.nombre.trim().toLowerCase() === usuario.trim().toLowerCase() && m.sedeId === sedeIdSeleccionada
    );
    if (miembroEncontrado) {
      if (miembroEncontrado.pin !== pinInput.trim()) {
        alert("⚠️ PIN incorrecto para esta sede.");
        return;
      }
      setRolUsuario(miembroEncontrado.rolAcceso || "miembro");
      setSesionIniciada(true);
    } else {
      alert("⚠️ Usuario no encontrado en esta sede. Regístrate como nuevo.");
    }
  };

  const handleRegistroNuevo = () => {
    if (usuario.trim() === "" || pinInput.trim() === "") {
      alert("⚠️ Completa tu nombre y PIN para registrarte.");
      return;
    }
    const existe = integrantes.some(
      (m) => m.nombre.trim().toLowerCase() === usuario.trim().toLowerCase() && m.sedeId === sedeIdSeleccionada
    );
    if (existe) {
      alert("⚠️ Este usuario ya existe en esta sede. Inicia sesión.");
      return;
    }
    const nuevoMiembro = {
      id: Date.now(),
      nombre: usuario.trim(),
      pin: pinInput.trim(),
      sedeId: sedeIdSeleccionada,
      rolAcceso: "miembro",
      rolesMusicales: ["🎤 Miembro"],
    };
    setIntegrantes([...integrantes, nuevoMiembro]);
    setRolUsuario("miembro");
    setSesionIniciada(true);
    alert(`🎉 ¡Registro exitoso en ${sedeActual.nombre}!`);
  };

  const handleLogout = () => {
    setSesionIniciada(false);
    setUsuario("");
    setPinInput("");
    setRolUsuario("miembro");
    setPestana("inicio");
    setCancionSeleccionadaDetalle(null);
  };

  const esAdmin = rolUsuario === "admin";
  const esAdminOLider = rolUsuario === "admin" || rolUsuario === "lider";
  const miembroActualObj = integrantes.find((m) => m.nombre.trim().toLowerCase() === usuario.trim().toLowerCase());
  const tocaInstrumento = miembroActualObj?.rolesMusicales?.some((r) => /piano|guitarra|bajo|batería|bateria/i.test(r));
  const puedeControlarRepertorio = esAdminOLider || tocaInstrumento;

  const enviarOActualizarMensajeChat = async () => {
    if (nuevoMensajeTexto.trim() !== "") {
      const horaActual = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      await supabase.from("mensajes").insert([{ autor: usuario, texto: nuevoMensajeTexto.trim(), hora: horaActual, canal: canalChatActivo, editado: false }]);
      setNuevoMensajeTexto("");
      cargarMensajesSupabase();
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
      const piano = serv.instrumentos?.piano;
      const guitarra = serv.instrumentos?.guitarra;
      const bajo = serv.instrumentos?.bajo;
      const bateria = serv.instrumentos?.bateria;
      if (vp === usuario || coros.includes(usuario) || piano === usuario || guitarra === usuario || bajo === usuario || bateria === usuario) {
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
      const postulado = usuarioEstaPostuladoEnFecha(claveFecha);
      lista.push({ vacio: false, diaNum: d, postulado: postulado });
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

    const actualizados = servicios.map((s) => (s.id === idServicioPostulando ? { ...s, voces: nVoces, instrumentos: nInst } : s));
    setServicios(actualizados);
    await supabase.from("servicios").update({ voces: nVoces, instrumentos: nInst }).eq("id", idServicioPostulando);
    setModalPostularVisible(false);
    alert(`🚀 Te has postulado exitosamente.`);
  };

  const liberarRol = async (idServicio, categoria) => {
    const servicioObjetivo = servicios.find((s) => s.id === idServicio);
    if (!servicioObjetivo) return;
    let nVoces = { ...servicioObjetivo.voces };
    let nInst = { ...servicioObjetivo.instrumentos };
    if (categoria === "vozPrincipal") nVoces.principal = "Sin asignar";
    else if (categoria === "coros") nVoces.coros = "Sin asignar";
    else if (categoria === "piano") nInst.piano = "Sin asignar";
    else if (categoria === "guitarra") nInst.guitarra = "Sin asignar";
    else if (categoria === "bajo") nInst.bajo = "Sin asignar";
    else if (categoria === "bateria") nInst.bateria = "Sin asignar";

    const actualizados = servicios.map((s) => (s.id === idServicio ? { ...s, voces: nVoces, instrumentos: nInst } : s));
    setServicios(actualizados);
    await supabase.from("servicios").update({ voces: nVoces, instrumentos: nInst }).eq("id", idServicio);
    alert("🔄 Rol liberado exitosamente.");
  };

  if (!sesionIniciada) {
    return (
      <View style={[styles.loginContainer, { backgroundColor: t.bg }]}>
        <View style={[styles.loginCard, { backgroundColor: t.cardBg, borderColor: t.border }]}>
          <Text style={[styles.loginTitle, { color: t.textMain }]}>SoundTeam</Text>
          <Text style={[styles.loginSubtitle, { color: t.textSub }]}>
            {esRegistroNuevo ? "Registro de Usuario Nuevo" : "Inicio de Sesión"}
          </Text>

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

          <Text style={[styles.inputLabel, { color: t.textMain }]}>👤 Usuario o Apodo:</Text>
          <TextInput
            style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
            placeholder="Ej. Alex o Admin"
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

          {esRegistroNuevo ? (
            <View style={{ marginTop: 6 }}>
              <TouchableOpacity style={[styles.loginButton, { backgroundColor: "#22C55E", marginBottom: 10 }]} onPress={handleRegistroNuevo}>
                <Text style={styles.loginButtonText}>Crear Cuenta y Entrar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEsRegistroNuevo(false)}>
                <Text style={{ color: t.primary, textAlign: "center", fontSize: 12 }}>¿Ya estás registrado? Inicia Sesión</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ marginTop: 6 }}>
              <TouchableOpacity style={[styles.loginButton, { backgroundColor: t.primary, marginBottom: 10 }]} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEsRegistroNuevo(true)}>
                <Text style={{ color: t.primary, textAlign: "center", fontSize: 12 }}>¿Eres usuario nuevo? Regístrate</Text>
              </TouchableOpacity>
            </View>
          )}
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
              👤 {usuario} • ROL: {rolUsuario.toUpperCase()}
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
                <Text style={[styles.cardTitle, { color: t.textMain, marginBottom: 10 }]}>💬 Chat de Equipos ({sedeActual.nombre})</Text>
                <View style={{ backgroundColor: t.bg, borderRadius: 8, borderWidth: 1, borderColor: t.border, padding: 10, height: 200, marginBottom: 10 }}>
                  <ScrollView>
                    {mensajesChat.map((m, i) => (
                      <View key={m.id || i} style={{ marginBottom: 6 }}>
                        <Text style={{ color: t.primary, fontWeight: "bold", fontSize: 11 }}>{m.autor}:</Text>
                        <Text style={{ color: t.textMain, fontSize: 12 }}>{m.texto}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <TextInput
                    style={[styles.loginInput, { flex: 1, backgroundColor: t.bg, borderColor: t.border, color: t.textMain, marginBottom: 0, padding: 8 }]}
                    placeholder="Escribe un mensaje..."
                    placeholderTextColor={t.textSub}
                    value={nuevoMensajeTexto}
                    onChangeText={setNuevoMensajeTexto}
                  />
                  <TouchableOpacity style={[styles.loginButton, { backgroundColor: t.primary, paddingVertical: 8, paddingHorizontal: 14 }]} onPress={enviarOActualizarMensajeChat}>
                    <Text style={[styles.loginButtonText, { fontSize: 12 }]}>Enviar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {pestana === "eventos" && (
            <View style={{ width: "100%" }}>
              <View style={styles.monthsRow}>
                {listaMesesDinamicos.map((itemMes) => {
                  const esSeleccionado = mesSeleccionadoObj.key === itemMes.key;
                  return (
                    <TouchableOpacity
                      key={itemMes.key}
                      style={[styles.monthTab, { backgroundColor: t.cardBg, borderColor: t.border }, esSeleccionado && { backgroundColor: t.primary, borderColor: t.primary }]}
                      onPress={() => { setMesSeleccionadoObj(itemMes); setDiaSeleccionado(1); }}
                    >
                      <Text style={[styles.monthText, { color: t.textSub }, esSeleccionado && styles.monthTextActive]}>{itemMes.nombre}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                <Text style={[styles.cardTitle, { color: t.textMain, textAlign: "center" }]}>{mesSeleccionadoObj.nombre} {mesSeleccionadoObj.year}</Text>
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
                <Text style={[styles.serviceSectionTitle, { color: t.textMain }]}>Servicios del Día {diaSeleccionado} de {mesSeleccionadoObj.nombre}</Text>
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
                  <Text style={[styles.cardTitle, { color: t.textMain }]}>Programar Servicio ({diaSeleccionado} {mesSeleccionadoObj.nombre})</Text>
                  <TextInput
                    style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
                    placeholder="Nombre del evento"
                    placeholderTextColor={t.textSub}
                    value={nombreEvento}
                    onChangeText={setNombreEvento}
                  />
                  <TextInput
                    style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
                    placeholder="Observaciones"
                    placeholderTextColor={t.textSub}
                    value={observaciones}
                    onChangeText={setObservaciones}
                  />
                  <TouchableOpacity
                    style={[styles.loginButton, { backgroundColor: t.primary, marginBottom: 8 }]}
                    onPress={async () => {
                      if (nombreEvento.trim() !== "") {
                        const nuevoId = Date.now();
                        const nuevoServicioObj = {
                          id: nuevoId,
                          fecha: fechaActualClave,
                          titulo: nombreEvento,
                          observaciones: observaciones || "Sin observaciones",
                          setlist: [],
                          voces: { principal: "Sin asignar", coros: "Sin asignar" },
                          instrumentos: { piano: "Sin asignar", guitarra: "Sin asignar", bajo: "Sin asignar", bateria: "Sin asignar" },
                        };
                        setServicios([...servicios, nuevoServicioObj]);
                        await supabase.from("servicios").insert([nuevoServicioObj]);
                        setModalProgramarVisible(false);
                        alert("✅ Servicio guardado.");
                      } else {
                        alert("⚠️ Ingresa el nombre del evento.");
                      }
                    }}
                  >
                    <Text style={styles.loginButtonText}>Guardar Servicio</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.loginButton, { backgroundColor: "#EF4444" }]} onPress={() => setModalProgramarVisible(false)}>
                    <Text style={styles.loginButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              )}

              {modalPostularVisible && (
                <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.selectedDay, borderWidth: 2 }]}>
                  <Text style={[styles.cardTitle, { color: t.textMain }]}>✨ Selecciona tu Rol para Postularte</Text>
                  {["vozPrincipal", "coros", "piano", "guitarra", "bajo", "bateria"].map((rolKey) => (
                    <TouchableOpacity
                      key={rolKey}
                      style={[styles.postulateRoleOption, { backgroundColor: t.bg, borderColor: t.border }]}
                      onPress={() => confirmarPostulacionRol(rolKey)}
                    >
                      <Text style={{ color: t.textMain, fontWeight: "bold" }}>Servir en {rolKey.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={[styles.loginButton, { backgroundColor: "#EF4444", padding: 10 }]} onPress={() => setModalPostularVisible(false)}>
                    <Text style={styles.loginButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              )}

              {serviciosDelDia.length > 0 ? (
                serviciosDelDia.map((serv) => (
                  <View key={serv.id} style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                    <Text style={[styles.eventMainTitle, { color: t.textMain }]}>📅 {serv.titulo}</Text>
                    <Text style={{ color: t.textSub, fontSize: 12, marginTop: 4 }}>Obs: {serv.observaciones}</Text>
                    <View style={styles.columnsContainer}>
                      <View style={[styles.columnBox, { backgroundColor: t.bg, borderColor: t.border }]}>
                        <Text style={[styles.columnHeaderTitle, { color: t.primary }]}>🎤 VOCES</Text>
                        <Text style={{ color: t.textMain, fontSize: 11 }}>• Principal: {serv.voces?.principal || "Sin asignar"}</Text>
                        <Text style={{ color: t.textMain, fontSize: 11 }}>• Coros: {serv.voces?.coros || "Sin asignar"}</Text>
                      </View>
                      <View style={[styles.columnBox, { backgroundColor: t.bg, borderColor: t.border }]}>
                        <Text style={[styles.columnHeaderTitle, { color: t.primary }]}>🎸 INSTRUMENTOS</Text>
                        <Text style={{ color: t.textMain, fontSize: 11 }}>• Piano: {serv.instrumentos?.piano || "Sin asignar"}</Text>
                        <Text style={{ color: t.textMain, fontSize: 11 }}>• Guitarra: {serv.instrumentos?.guitarra || "Sin asignar"}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.postulateBtn, { marginTop: 10 }]}
                      onPress={() => {
                        setIdServicioPostulando(serv.id);
                        setModalPostularVisible(true);
                      }}
                    >
                      <Text style={styles.actionBtnText}>Postularme (Confirmar asistencia)</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                  <Text style={{ color: t.textSub, textAlign: "center", padding: 10 }}>No hay servicios programados para este día.</Text>
                </View>
              )}
            </View>
          )}

          {pestana === "equipo" && esAdminOLider && (
            <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border, width: "100%" }]}>
              <Text style={[styles.cardTitle, { color: t.textMain }]}>👥 Miembros de {sedeActual.nombre} ({integrantes.length})</Text>
              {integrantes.map((int) => (
                <View key={int.id} style={[styles.memberCard, { backgroundColor: t.bg, borderColor: t.border }]}>
                  <Text style={[styles.memberTitle, { color: t.textMain }]}>👤 {int.nombre}</Text>
                  <Text style={{ color: t.textSub, fontSize: 11 }}>Acceso: {(int.rolAcceso || "miembro").toUpperCase()}</Text>
                </View>
              ))}
            </View>
          )}

          {pestana === "repertorio" && (
            <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border, width: "100%" }]}>
              <Text style={[styles.cardTitle, { color: t.textMain, fontSize: 16, marginBottom: 14 }]}>Repertorio de {sedeActual.nombre} ({repertorio.length})</Text>
              {repertorio.map((c) => (
                <View key={c.id} style={[styles.repertorioItemRowPro, { borderBottomColor: t.border, backgroundColor: t.bg }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.textMain, fontSize: 15, fontWeight: "bold" }}>{c.titulo}</Text>
                    <Text style={{ color: t.textSub, fontSize: 12 }}>{c.artista} • Tono: {c.tono}</Text>
                  </View>
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
          ...(esAdminOLider ? [{ key: "equipo", label: "👥 Equipo" }] : []),
          { key: "repertorio", label: "🎵 Repertorio" },
        ].map((tab) => (
          <TouchableOpacity key={tab.key} style={styles.tabItem} onPress={() => setPestana(tab.key)}>
            <Text style={[styles.tabText, { color: t.textSub }, pestana === tab.key && { color: t.textMain, fontWeight: "bold" }]}>{tab.label}</Text>
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
  loginTitle: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 4 },
  loginSubtitle: { fontSize: 13, textAlign: "center", marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: "bold", marginBottom: 4 },
  loginInput: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 15 },
  loginButton: { padding: 14, borderRadius: 8, alignItems: "center" },
  loginButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 15 },
  header: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, width: "100%" },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 16, fontWeight: "bold" },
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
  monthsRow: { flexDirection: "row", gap: 6, marginBottom: 10, width: "100%" },
  monthTab: { flex: 1, paddingVertical: 6, alignItems: "center", borderRadius: 8, borderWidth: 1 },
  monthText: { fontSize: 11 },
  monthTextActive: { color: "#FFFFFF", fontWeight: "bold" },
  daysGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4, justifyContent: "flex-start", width: "100%", marginTop: 8 },
  dayCell: { width: "13%", aspectRatio: 1, justifyContent: "center", alignItems: "center", borderRadius: 6, borderWidth: 1, marginBottom: 4 },
  dayCellEmpty: { width: "13%", aspectRatio: 1, marginBottom: 4 },
  dayText: { fontSize: 13, fontWeight: "bold" },
  dayTextSelected: { color: "#FFFFFF", fontWeight: "bold" },
  serviceSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, width: "100%" },
  serviceSectionTitle: { fontSize: 13, fontWeight: "bold", flex: 1 },
  programBtn: { paddingVertical: 5, paddingHorizontal: 8, borderRadius: 6 },
  programBtnText: { color: "#FFFFFF", fontSize: 11, fontWeight: "bold" },
  eventMainTitle: { fontSize: 15, fontWeight: "bold" },
  columnsContainer: { flexDirection: "row", gap: 8, marginTop: 10 },
  columnBox: { flex: 1, padding: 8, borderRadius: 8, borderWidth: 1 },
  columnHeaderTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 6 },
  memberCard: { padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
  memberTitle: { fontSize: 14, fontWeight: "bold" },
  repertorioItemRowPro: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, marginBottom: 6 },
  postulateBtn: { backgroundColor: "#F97316", padding: 10, borderRadius: 8, alignItems: "center" },
  actionBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 13 },
  postulateRoleOption: { padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 6, alignItems: "center" },
  tabBar: { flexDirection: "row", height: 55, borderTopWidth: 1, width: "100%" },
  tabItem: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 2 },
  tabText: { fontSize: 10, textAlign: "center" },
});
