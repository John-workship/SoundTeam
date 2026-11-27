import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
  Image,
  useWindowDimensions,
} from "react-native";
import { supabase, isSupabaseConfigured } from "./supabase";
import * as ImagePicker from "expo-image-picker";

const TEMAS = {
  azul: {
    bg: "#070B19",
    cardBg: "#101A32",
    border: "#2A3C66",
    primary: "#8B7CFF",
    textMain: "#F5F7FF",
    textSub: "#A7B5D8",
    banner: "#30266D",
    selectedDay: "#328BFF",
    nombre: "🌌 Futurista",
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


const CANCIONES_CONGREGACIONALES_INICIALES = [
  { titulo: "Santo, Santo, Santo", artista: "Reginald Heber / John B. Dykes", tono: "D", bpm: "92", compas: "4/4", tipo_set: "lenta" },
  { titulo: "Cuán grande es Él", artista: "Carl Boberg / Stuart K. Hine", tono: "G", bpm: "76", compas: "4/4", tipo_set: "lenta" },
  { titulo: "Sublime gracia", artista: "John Newton", tono: "G", bpm: "74", compas: "3/4", tipo_set: "lenta" },
  { titulo: "Grande es tu fidelidad", artista: "Thomas O. Chisholm / William M. Runyan", tono: "D", bpm: "78", compas: "3/4", tipo_set: "lenta" },
  { titulo: "A Dios sea la gloria", artista: "Andraé Crouch", tono: "G", bpm: "112", compas: "4/4", tipo_set: "rapida" },
  { titulo: "Hay poder en Jesús", artista: "Lewis E. Jones", tono: "G", bpm: "118", compas: "4/4", tipo_set: "rapida" },
  { titulo: "Oh qué amigo nos es Cristo", artista: "Joseph M. Scriven / Charles C. Converse", tono: "C", bpm: "84", compas: "4/4", tipo_set: "lenta" },
  { titulo: "En el monte Calvario", artista: "George Bennard", tono: "G", bpm: "78", compas: "4/4", tipo_set: "lenta" },
  { titulo: "Tal como soy", artista: "Charlotte Elliott / William B. Bradbury", tono: "D", bpm: "72", compas: "4/4", tipo_set: "lenta" },
  { titulo: "Castillo fuerte es nuestro Dios", artista: "Martín Lutero", tono: "C", bpm: "108", compas: "4/4", tipo_set: "rapida" },
  { titulo: "Firmes y adelante", artista: "Sabine Baring-Gould / Arthur S. Sullivan", tono: "G", bpm: "116", compas: "4/4", tipo_set: "rapida" },
  { titulo: "Cuando allá se pase lista", artista: "James M. Black", tono: "G", bpm: "104", compas: "4/4", tipo_set: "rapida" },
  { titulo: "Más cerca, oh Dios, de ti", artista: "Sarah F. Adams / Lowell Mason", tono: "C", bpm: "72", compas: "4/4", tipo_set: "lenta" },
  { titulo: "Roca de la eternidad", artista: "Augustus M. Toplady / Thomas Hastings", tono: "D", bpm: "76", compas: "4/4", tipo_set: "lenta" },
  { titulo: "La roca firme", artista: "Edward Mote / William B. Bradbury", tono: "G", bpm: "88", compas: "4/4", tipo_set: "lenta" },
  { titulo: "Victoria en Jesús", artista: "E. M. Bartlett", tono: "G", bpm: "116", compas: "4/4", tipo_set: "rapida" },
  { titulo: "Yo tengo un amigo que me ama", artista: "Coro congregacional tradicional", tono: "C", bpm: "112", compas: "4/4", tipo_set: "rapida" },
  { titulo: "Cristo no está muerto", artista: "Coro congregacional tradicional", tono: "G", bpm: "124", compas: "4/4", tipo_set: "rapida" },
  { titulo: "Jehová es mi guerrero", artista: "Coro congregacional tradicional", tono: "Em", bpm: "126", compas: "4/4", tipo_set: "rapida" },
  { titulo: "Yo celebraré", artista: "Coro congregacional tradicional", tono: "G", bpm: "120", compas: "4/4", tipo_set: "rapida" },
  { titulo: "Este es el día", artista: "Salmo 118:24 / coro congregacional", tono: "D", bpm: "116", compas: "4/4", tipo_set: "rapida" },
  { titulo: "Mi pensamiento eres tú, Señor", artista: "Coro congregacional tradicional", tono: "C", bpm: "88", compas: "4/4", tipo_set: "lenta" },
  { titulo: "Te alabaré, mi buen Jesús", artista: "Danilo Montero", tono: "G", bpm: "82", compas: "4/4", tipo_set: "lenta" },
  { titulo: "Tu fidelidad", artista: "Marcos Witt", tono: "D", bpm: "74", compas: "4/4", tipo_set: "lenta" },
  { titulo: "Abre mis ojos, oh Cristo", artista: "Paul Baloche", tono: "E", bpm: "76", compas: "4/4", tipo_set: "lenta" },
  { titulo: "Eres todopoderoso", artista: "Danilo Montero", tono: "A", bpm: "118", compas: "4/4", tipo_set: "rapida" },
  { titulo: "Quiero levantar mis manos", artista: "Danny Berrios", tono: "G", bpm: "78", compas: "4/4", tipo_set: "lenta" },
  { titulo: "El poder de tu amor", artista: "Geoff Bullock", tono: "G", bpm: "72", compas: "4/4", tipo_set: "lenta" },
  { titulo: "Renuévame", artista: "Marcos Witt", tono: "D", bpm: "76", compas: "4/4", tipo_set: "lenta" },
  { titulo: "Alabaré", artista: "Coro congregacional tradicional", tono: "G", bpm: "120", compas: "4/4", tipo_set: "rapida" },
]; 

const NOTAS_CROMATICAS = [
  "C", "C#", "D", "D#", "E", "F",
  "F#", "G", "G#", "A", "A#", "B"
];

const obtenerNota = (nota, semitonos = 0) => {
  const equivalencias = { Db: 1, Eb: 3, Gb: 6, Ab: 8, Bb: 10 };
  const indice = equivalencias[nota] !== undefined
    ? equivalencias[nota]
    : NOTAS_CROMATICAS.indexOf(nota);

  if (indice < 0) return nota;
  return NOTAS_CROMATICAS[(indice + semitonos + 120) % 12];
};

const transponerAcorde = (acorde, semitonos) => {
  return acorde.split("/").map(parte => {
    const coincidencia = parte.match(/^([A-G](?:#|b)?)(.*)$/);
    if (!coincidencia) return parte;
    return obtenerNota(coincidencia[1], semitonos) + coincidencia[2];
  }).join("/");
};

const transponerLetra = (letra, semitonos) => {
  if (!letra || semitonos === 0) return letra || "";
  return letra.replace(/\[([^\]]+)\]/g, (completo, acorde) =>
    `[${transponerAcorde(acorde, semitonos)}]`
  );
};

const transponerTono = (tono, semitonos) => {
  const coincidencia = (tono || "C").match(/^([A-G](?:#|b)?)(.*)$/);
  if (!coincidencia) return tono || "C";
  return obtenerNota(coincidencia[1], semitonos) + coincidencia[2];
};

const convertirANashville = (letra, tono) => {
  if (!letra) return "";

  const notas = {
    C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3,
    E: 4, F: 5, "F#": 6, Gb: 6, G: 7,
    "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11
  };

  const grados = ["1", "b2", "2", "b3", "3", "4",
    "b5", "5", "b6", "6", "b7", "7"];

  const coincidencia = (tono || "C").match(/^([A-G](?:#|b)?)/);
  const base = coincidencia && notas[coincidencia[1]] !== undefined
    ? notas[coincidencia[1]] : 0;

  const convertirAcorde = acorde => acorde.split("/").map(parte => {
    const match = parte.match(/^([A-G](?:#|b)?)(.*)$/);
    if (!match || notas[match[1]] === undefined) return parte;
    const intervalo = (notas[match[1]] - base + 12) % 12;
    return grados[intervalo] + match[2];
  }).join("/");

  return letra.replace(/\[([^\]]+)\]/g, (completo, acorde) =>
    `[${convertirAcorde(acorde)}]`
  );
};

export default function App() {
  const idProyeccionURL = Platform.OS === "web" && typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("soundTeamProjection")
    : null;
  const esModoProyeccion = !!idProyeccionURL;
  const [datosProyeccion, setDatosProyeccion] = useState(null);
  const googleLoginEnCursoRef = useRef(false);
  const { width: anchoVentana } = useWindowDimensions();
  const esEscritorio = anchoVentana >= 1024;
  const esTablet = anchoVentana >= 600 && anchoVentana < 1024;
  const esMovil = anchoVentana < 600;
  const [semitonos, setSemitonos] = useState(0);
  const [modoNashville, setModoNashville] = useState(false);
  const [sedeIdSeleccionada, setSedeIdSeleccionada] = useState("general");
  const [integrantes, setIntegrantes] = useState([]);
  const [usuario, setUsuario] = useState("");
  const [emailUsuario, setEmailUsuario] = useState("");
  const [usuarioId, setUsuarioId] = useState(null);
  const [rolUsuario, setRolUsuario] = useState("miembro");
  const [rolesMusicalesUsuario, setRolesMusicalesUsuario] = useState([]);
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [modoRecuperacionPassword, setModoRecuperacionPassword] = useState(false);
  const [cambioPasswordTemporal, setCambioPasswordTemporal] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarNuevaPassword, setConfirmarNuevaPassword] = useState("");
  const [mensajeAuth, setMensajeAuth] = useState("");
  const [cargandoAuth, setCargandoAuth] = useState(false);
  const [errorAuth, setErrorAuth] = useState("");
  const [errorDatos, setErrorDatos] = useState("");

  const sincronizarDatosApp = async () => {
    const { data: dataInt, error } = await supabase
      .rpc("soundteam_listar_integrantes_visibilidad")
      .order("nombre", { ascending: true });
    if (error) {
      setErrorDatos(`No se pudieron cargar los integrantes: ${error.message}`);
      return false;
    }
    setIntegrantes((dataInt || []).map((m) => ({
      id: m.id,
      userId: m.user_id || null,
      nombre: m.nombre || "",
      email: m.email ? m.email.trim().toLowerCase() : "",
      sedeId: (m.sede_id || "general").toLowerCase(),
      rolAcceso: (m.rol_acceso || "miembro").toLowerCase(),
      rolesMusicales: m.roles_musicales || [],
    })));
    return true;
  };

  const verificarSesionActiva = async (sessionRecibida = undefined) => {
    if (!isSupabaseConfigured) {
      setErrorAuth("Falta configurar EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY en el entorno de despliegue.");
      return;
    }

    let session = sessionRecibida;
    if (sessionRecibida === undefined) {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setErrorAuth(`No se pudo comprobar la sesión: ${error.message}`);
        return;
      }
      session = data.session;
    }

    if (!session?.user?.id || !session.user.email) {
      setSesionIniciada(false);
      setUsuario("");
      setEmailUsuario("");
      setUsuarioId(null);
      setRolUsuario("miembro");
      return;
    }

    const appMetadata = session.user.app_metadata || {};
    if (appMetadata.soundteam_must_change_password) {
      const vence = Date.parse(appMetadata.soundteam_temp_password_expires_at || "");
      if (!Number.isFinite(vence) || vence <= Date.now()) {
        await supabase.auth.signOut();
        setSesionIniciada(false);
        setModoRecuperacionPassword(false);
        setCambioPasswordTemporal(false);
        setErrorAuth("Tu contraseña temporal venció. Solicita al administrador una nueva clave temporal.");
        return;
      }
      setCambioPasswordTemporal(true);
      setModoRecuperacionPassword(true);
      setSesionIniciada(false);
      setErrorAuth("");
      setMensajeAuth("Tu administrador te asignó una contraseña temporal. Debes cambiarla para ingresar a SoundTeam.");
      return;
    }
    setCambioPasswordTemporal(false);

    // Vincula el perfil previamente creado por un administrador con la cuenta autenticada.
    const { error: claimError } = await supabase.rpc("claim_soundteam_profile");
    if (claimError) {
      setErrorAuth(`No se pudo validar tu perfil en SoundTeam: ${claimError.message}`);
      setSesionIniciada(false);
      return;
    }

    const { data: perfil, error: perfilError } = await supabase
      .from("integrantes")
      .select("id, nombre, nombre_perfil, sede_id, rol_acceso, roles_musicales, user_id, avatar_url")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (perfilError || !perfil) {
      setErrorAuth(perfilError?.message || "Tu cuenta inició sesión, pero todavía no tiene un perfil autorizado en SoundTeam. Solicita al administrador que registre tu correo.");
      setSesionIniciada(false);
      return;
    }

    setErrorAuth("");
    setUsuario(perfil.nombre_perfil || perfil.nombre || session.user.email);
    setNombrePerfilInput(perfil.nombre_perfil || perfil.nombre || session.user.email);
    let rutaAvatar = perfil.avatar_url || null;
    if (rutaAvatar && rutaAvatar.includes("/storage/v1/object/public/avatars/")) {
      rutaAvatar = decodeURIComponent(rutaAvatar.split("/avatars/").pop().split("?")[0]);
    }
    setFotoPerfilRuta(rutaAvatar);
    if (rutaAvatar) {
      const { data: avatarFirmado } = await supabase.storage.from("avatars").createSignedUrl(rutaAvatar, 3600);
      setFotoPerfil(avatarFirmado?.signedUrl || null);
    } else {
      setFotoPerfil(null);
    }
    setUsuarioId(session.user.id);
    setEmailUsuario(session.user.email.trim().toLowerCase());
    setRolUsuario((perfil.rol_acceso || "miembro").toLowerCase());
    setSedeIdSeleccionada(perfil.sede_id || "general");
    setSesionIniciada(true);
    await sincronizarDatosApp();
  };

  useEffect(() => {
    if (esModoProyeccion) return;
    if (!isSupabaseConfigured) {
      setErrorAuth("Configura las variables públicas de Supabase para iniciar SoundTeam.");
      return;
    }

    let mounted = true;
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      Promise.resolve().then(() => {
        if (!mounted) return;
        if (_event === "PASSWORD_RECOVERY") {
          setCambioPasswordTemporal(session?.user?.app_metadata?.soundteam_must_change_password === true);
          setModoRecuperacionPassword(true);
          setSesionIniciada(false);
          setErrorAuth("");
          setMensajeAuth("");
          return;
        }
        verificarSesionActiva(session);
      });
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const [pestana, setPestana] = useState("inicio");
  const [nombreTema, setNombreTema] = useState("azul");
  const [nombrePerfilInput, setNombrePerfilInput] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [fotoPerfilRuta, setFotoPerfilRuta] = useState(null);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  const t = TEMAS[nombreTema];
  const sedeActual = SEDES_DISPONIBLES.find((s) => s.id === sedeIdSeleccionada) || SEDES_DISPONIBLES[0];

  const integrantesSeccionEquipo = integrantes.filter((m) => {
    if (sedeIdSeleccionada === "general") return m.sedeId === "general";
    return m.sedeId === sedeIdSeleccionada;
  });

  const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const fechaActualObj = new Date();
  const fechaHoyLocal = `${fechaActualObj.getFullYear()}-${String(fechaActualObj.getMonth() + 1).padStart(2, "0")}-${String(fechaActualObj.getDate()).padStart(2, "0")}`;
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
  const [serviciosChatFuente, setServiciosChatFuente] = useState([]);
  const serviciosProximos = servicios
    .filter((serv) => String(serv.fecha || "") >= fechaHoyLocal)
    .sort((a, b) => String(a.fecha || "").localeCompare(String(b.fecha || "")))
    .slice(0, 3);

  const cargarServiciosSupabase = async () => {
    if (!sesionIniciada) return;
    const { data, error } = await supabase.from("servicios").select("*").eq("sede_id", sedeIdSeleccionada);
    if (error) {
      setErrorDatos(`No se pudieron cargar los servicios: ${error.message}`);
      return;
    }
    if (data) {
      setServicios(data.map((s) => ({
        id: s.id,
        fecha: s.fecha,
        titulo: s.titulo,
        observaciones: s.observaciones || "Sin observaciones",
        setlist: s.setlist || [],
        cuposCoros: Number(s.cupos_coros ?? 3),
        ordenBloquesSetlist: s.orden_bloques_setlist || "lenta-rapida",
        voces: s.voces || { principal: "Sin asignar", coros: "Sin asignar" },
        instrumentos: s.instrumentos || { piano: "Sin asignar", guitarra: "Sin asignar", bajo: "Sin asignar", bateria: "Sin asignar" },
        sedeId: s.sede_id,
      })));
    } else {
      setServicios([]);
    }
  };
  
  // Lista independiente para Chat. Supabase RLS restringe miembros y líderes
  // a su sede y permite al administrador global consultar todas las sedes.
  const cargarServiciosChatSupabase = async () => {
    if (!sesionIniciada) return;
    const { data, error } = await supabase
      .from("servicios")
      .select("id, fecha, titulo, sede_id, voces, instrumentos");
    if (error) {
      setErrorDatos(`No se pudieron cargar los chats: ${error.message}`);
      return;
    }
    setServiciosChatFuente((data || []).map((s) => ({
      id: s.id,
      fecha: s.fecha,
      titulo: s.titulo,
      sedeId: s.sede_id,
      voces: s.voces || {},
      instrumentos: s.instrumentos || {},
    })));
  };

  useEffect(() => {
    if (sesionIniciada) cargarServiciosSupabase();
  }, [sedeIdSeleccionada, sesionIniciada]);

  useEffect(() => {
    if (sesionIniciada) cargarServiciosChatSupabase();
    else setServiciosChatFuente([]);
  }, [sesionIniciada]);

  const [modalProgramarVisible, setModalProgramarVisible] = useState(false);
  const [modalPostularVisible, setModalPostularVisible] = useState(false);
  const [idServicioEditando, setIdServicioEditando] = useState(null);
  const [idServicioPostulando, setIdServicioPostulando] = useState(null);
  const [nombreEvento, setNombreEvento] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [setlistActivo, setSetlistActivo] = useState([]);
  const [cuposCorosEditando, setCuposCorosEditando] = useState("3");
  const [ordenBloquesEditando, setOrdenBloquesEditando] = useState("lenta-rapida");
  const [cancionLentaSeleccionada, setCancionLentaSeleccionada] = useState("");
  const [cancionRapidaSeleccionada, setCancionRapidaSeleccionada] = useState("");

  const moverCancionArriba = (index) => {
    if (index <= 0) return;
    const actualizado = [...setlistActivo];
    [actualizado[index - 1], actualizado[index]] = [actualizado[index], actualizado[index - 1]];
    setSetlistActivo(actualizado);
  };

  const moverCancionAbajo = (index) => {
    if (index >= setlistActivo.length - 1) return;
    const actualizado = [...setlistActivo];
    [actualizado[index], actualizado[index + 1]] = [actualizado[index + 1], actualizado[index]];
    setSetlistActivo(actualizado);
  };


  const [modoEnVivoActivo, setModoEnVivoActivo] = useState(false);
  const [indiceCancionEnVivo, setIndiceCancionEnVivo] = useState(0);
  const [indiceSeccionEnVivo, setIndiceSeccionEnVivo] = useState(0);
  const [proyeccionAbierta, setProyeccionAbierta] = useState(false);
  const [enlaceProyeccion, setEnlaceProyeccion] = useState("");
  const [mensajeProyeccion, setMensajeProyeccion] = useState("");
  const canalProyeccionRef = useRef(null);
  const scrollProyeccionRef = useRef(null);
  const posicionScrollProyeccionRef = useRef(0);
  const indiceCancionProyectadaRef = useRef(null);
  const ventanaProyeccionRef = useRef(null);
  const idProyeccionRef = useRef(null);
  const estadoProyeccionRef = useRef({ modoActivo: false, payload: { letra: "" } });
  const [setlistEnVivoActual, setSetlistEnVivoActual] = useState([]);
  const [metronomoActivo, setMetronomoActivo] = useState(false);
  const [pulsoActivo, setPulsoActivo] = useState(false);
  const [bpmClick, setBpmClick] = useState(120);
  const [compasClick, setCompasClick] = useState("4/4");
  const [volumenClick, setVolumenClick] = useState(70);
  const [paneoClick, setPaneoClick] = useState(0);
  const [errorClick, setErrorClick] = useState("");
  const [cuentaEntrada, setCuentaEntrada] = useState(null);

  const audioContextRef = useRef(null);
  const schedulerClickRef = useRef(null);
  const siguientePulsoRef = useRef(0);
  const numeroPulsoRef = useRef(0);
  const pulsoVisualTimeoutRef = useRef(null);
  const sonidosProgramadosRef = useRef(new Set());
  const [avanceAutomaticoActivo, setAvanceAutomaticoActivo] = useState(false);
  const [semitonosEnVivo, setSemitonosEnVivo] = useState(0);
  const [modoNashvilleEnVivo, setModoNashvilleEnVivo] = useState(false);

  useEffect(() => {
    setIndiceSeccionEnVivo(0);
  }, [indiceCancionEnVivo]);

  useEffect(() => {
    setSemitonosEnVivo(0);
    setModoNashvilleEnVivo(false);
  }, [indiceCancionEnVivo]);


    // Parámetros sincronizados sin reiniciar el scheduler al cambiar controles.
    const parametrosClickRef = useRef({
      bpm: 120,
      compas: "4/4",
      volumen: 70,
      paneo: 0
    });
    const transicionClickRef = useRef(null);

    parametrosClickRef.current = {
      bpm: bpmClick,
      compas: compasClick,
      volumen: volumenClick,
      paneo: paneoClick
    };

    const obtenerPulsosPorCompas = (compas) =>
      compas === "2/4" ? 2 :
      compas === "3/4" ? 3 :
      compas === "6/8" ? 6 : 4;

    const obtenerParametrosCancion = (cancion = {}) => {
      const bpmLeido = parseInt(cancion.bpm, 10);
      const compasLeido = ["2/4", "3/4", "4/4", "6/8"].includes(cancion.compas)
        ? cancion.compas
        : "4/4";

      return {
        bpm: Number.isFinite(bpmLeido)
          ? Math.min(300, Math.max(30, bpmLeido))
          : 120,
        compas: compasLeido
      };
    };

    // Cancela únicamente sonidos que todavía no han comenzado.
    const cancelarSonidosFuturos = () => {
      const contexto = audioContextRef.current;
      if (!contexto) return;

      const ahora = contexto.currentTime;

      Array.from(sonidosProgramadosRef.current).forEach(sonido => {
        if (sonido.tiempo > ahora) {
          if (sonido.timeoutVisual) clearTimeout(sonido.timeoutVisual);
          if (sonido.timeoutApagar) clearTimeout(sonido.timeoutApagar);

          try {
            sonido.oscilador.stop();
          } catch (_) {}

          sonidosProgramadosRef.current.delete(sonido);
        }
      });
    };

    // Anterior y Siguiente usan la misma lógica de transición.
    const cambiarCancionEnVivo = (direccion) => {
      const nuevoIndice = Math.max(
        0,
        Math.min(
          setlistEnVivoActual.length - 1,
          indiceCancionEnVivo + direccion
        )
      );

      if (nuevoIndice === indiceCancionEnVivo) return;

      const destino = setlistEnVivoActual[nuevoIndice] || {};
      const parametrosDestino = obtenerParametrosCancion(destino);
      const parametrosActuales = parametrosClickRef.current;

      const cambiaRitmo =
        parametrosDestino.bpm !== parametrosActuales.bpm ||
        parametrosDestino.compas !== parametrosActuales.compas;

      if (transicionClickRef.current) return;

      if (metronomoActivo && cambiaRitmo) {
        cancelarSonidosFuturos();

        const contextoAudio = audioContextRef.current;
        if (contextoAudio && contextoAudio.state === "running") {
          siguientePulsoRef.current = contextoAudio.currentTime + 0.08;
        }
        const totalPulsos = obtenerPulsosPorCompas(parametrosDestino.compas);
        transicionClickRef.current = {
          restantes: totalPulsos,
          total: totalPulsos,
          destinoIndice: nuevoIndice
        };
        setCuentaEntrada(null);
        numeroPulsoRef.current = 0;
      } else {
        transicionClickRef.current = null;
        setCuentaEntrada(null);
        setIndiceCancionEnVivo(nuevoIndice);
      }

      parametrosClickRef.current = {
        ...parametrosClickRef.current,
        ...parametrosDestino
      };

      setBpmClick(parametrosDestino.bpm);
      setCompasClick(parametrosDestino.compas);
    };

    // Carga BPM y compás de la canción seleccionada.
    useEffect(() => {
      const cancion = setlistEnVivoActual[indiceCancionEnVivo] || {};
      const parametros = obtenerParametrosCancion(cancion);

      setBpmClick(parametros.bpm);
      setCompasClick(parametros.compas);
    }, [indiceCancionEnVivo, setlistEnVivoActual]);

    // El audio se crea al pulsar Iniciar, respetando las restricciones del navegador.
    const alternarMetronomo = async () => {
      if (metronomoActivo) {
        setMetronomoActivo(false);
        setPulsoActivo(false);
        if (transicionClickRef.current?.destinoIndice != null) {
          setIndiceCancionEnVivo(transicionClickRef.current.destinoIndice);
        }
        transicionClickRef.current = null;
        setCuentaEntrada(null);
        if (audioContextRef.current) {
          try { await audioContextRef.current.suspend(); } catch (_) {}
        }
        return;
      }

      if (Platform.OS !== "web" || typeof window === "undefined") {
        setErrorClick("El sonido del click está disponible en la versión web.");
        return;
      }

      try {
        const AudioContextWeb = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextWeb) {
          setErrorClick("Este navegador no admite el audio necesario para el metrónomo.");
          return;
        }

        if (!audioContextRef.current || audioContextRef.current.state === "closed") {
          audioContextRef.current = new AudioContextWeb();
        }

        await audioContextRef.current.resume();
        siguientePulsoRef.current = audioContextRef.current.currentTime + 0.05;
        numeroPulsoRef.current = 0;
        transicionClickRef.current = null;
        setCuentaEntrada(null);
        setErrorClick("");
        setMetronomoActivo(true);
      } catch (error) {
        setErrorClick("No se pudo iniciar el audio. Comprueba los permisos del navegador.");
        console.error("Error iniciando metrónomo:", error);
      }
    };

    // Scheduler estable: los cambios de BPM, compás, volumen y paneo no lo reinician.
    useEffect(() => {
      if (!metronomoActivo || !audioContextRef.current) return;

      const contexto = audioContextRef.current;

      const programarSonido = (tiempo, esAcento, parametros) => {
        const oscilador = contexto.createOscillator();
        const ganancia = contexto.createGain();

        oscilador.type = "sine";
        oscilador.frequency.setValueAtTime(esAcento ? 1250 : 850, tiempo);

        const nivel = Math.max(
          0.0001,
          (parametros.volumen / 100) * (esAcento ? 0.9 : 0.65)
        );
        ganancia.gain.setValueAtTime(0.0001, tiempo);
        ganancia.gain.linearRampToValueAtTime(nivel, tiempo + 0.005);
        ganancia.gain.exponentialRampToValueAtTime(0.0001, tiempo + 0.075);

        if (contexto.createStereoPanner) {
          const paneador = contexto.createStereoPanner();
          paneador.pan.setValueAtTime(parametros.paneo, tiempo);
          oscilador.connect(ganancia);
          ganancia.connect(paneador);
          paneador.connect(contexto.destination);
        } else {
          oscilador.connect(ganancia);
          ganancia.connect(contexto.destination);
        }

        const sonidoProgramado = {
          oscilador,
          tiempo,
          timeoutVisual: null,
          timeoutApagar: null
        };

        sonidosProgramadosRef.current.add(sonidoProgramado);

        oscilador.onended = () => {
          sonidosProgramadosRef.current.delete(sonidoProgramado);
        };

        oscilador.start(tiempo);
        oscilador.stop(tiempo + 0.08);

        const demora = Math.max(0, (tiempo - contexto.currentTime) * 1000);
        sonidoProgramado.timeoutVisual = setTimeout(() => {
          sonidoProgramado.timeoutVisual = null;
          setPulsoActivo(true);

          if (pulsoVisualTimeoutRef.current) {
            clearTimeout(pulsoVisualTimeoutRef.current);
          }

          sonidoProgramado.timeoutApagar = setTimeout(() => {
            setPulsoActivo(false);
            sonidoProgramado.timeoutApagar = null;
          }, 110);

          pulsoVisualTimeoutRef.current = sonidoProgramado.timeoutApagar;
        }, demora);
      };

      const revisarAgenda = () => {
        if (contexto.state !== "running") return;

        while (siguientePulsoRef.current < contexto.currentTime + 0.12) {
          const parametros = parametrosClickRef.current;
          const pulsosPorCompas = obtenerPulsosPorCompas(parametros.compas);
          const esAcento = numeroPulsoRef.current === 0;

          programarSonido(siguientePulsoRef.current, esAcento, parametros);

          const transicion = transicionClickRef.current;
          if (transicion) {
            const numeroCuenta = transicion.total - transicion.restantes + 1;
            setCuentaEntrada({ actual: numeroCuenta, total: transicion.total });
            transicion.restantes -= 1;

            if (transicion.restantes <= 0) {
              const destinoIndice = transicion.destinoIndice;
              const tiempoInicioCancion = siguientePulsoRef.current + (60 / parametros.bpm);
              const demoraInicio = Math.max(
                0,
                (tiempoInicioCancion - contexto.currentTime) * 1000
              );

              transicionClickRef.current = null;
              numeroPulsoRef.current = 0;

              setTimeout(() => {
                setIndiceCancionEnVivo(destinoIndice);
                setCuentaEntrada(null);
              }, demoraInicio);
            } else {
              numeroPulsoRef.current =
                (numeroPulsoRef.current + 1) % pulsosPorCompas;
            }
          } else {
            numeroPulsoRef.current =
              (numeroPulsoRef.current + 1) % pulsosPorCompas;
          }

          siguientePulsoRef.current += 60 / parametros.bpm;
        }
      };

      revisarAgenda();
      schedulerClickRef.current = setInterval(revisarAgenda, 25);

      return () => {
        if (schedulerClickRef.current) {
          clearInterval(schedulerClickRef.current);
          schedulerClickRef.current = null;
        }
      };
    }, [metronomoActivo]);
  // Limpieza de recursos de audio al salir de la pantalla.
  useEffect(() => {
    return () => {
      if (schedulerClickRef.current) clearInterval(schedulerClickRef.current);
      if (pulsoVisualTimeoutRef.current) clearTimeout(pulsoVisualTimeoutRef.current);
      sonidosProgramadosRef.current.forEach(sonido => {
        if (sonido.timeoutVisual) clearTimeout(sonido.timeoutVisual);
        if (sonido.timeoutApagar) clearTimeout(sonido.timeoutApagar);
        try {
          sonido.oscilador.stop();
        } catch (_) {}
      });
      sonidosProgramadosRef.current.clear();

      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);



  const [modalMiembroVisible, setModalMiembroVisible] = useState(false);
  const [idMiembroEditando, setIdMiembroEditando] = useState(null);
  const [nombreNuevoMiembro, setNombreNuevoMiembro] = useState("");
  const [emailNuevoMiembro, setEmailNuevoMiembro] = useState("");
  const [rolAccesoNuevo, setRolAccesoNuevo] = useState("miembro");
  const [rolesMusicalesNuevo, setRolesMusicalesNuevo] = useState([]);
  const [generandoClaveTemporalId, setGenerandoClaveTemporalId] = useState(null);

  const [repertorio, setRepertorio] = useState([]);
  const [importandoCancionesCongregacionales, setImportandoCancionesCongregacionales] = useState(false);
  const [notasRepertorioAbiertas, setNotasRepertorioAbiertas] = useState({});
  const [busquedaRepertorio, setBusquedaRepertorio] = useState("");
  const [filtroTipoRepertorio, setFiltroTipoRepertorio] = useState("todos");

  const obtenerSeccionesEnVivo = (letra) => {
    const encabezado = /^\s*\[(INTRO(?:DUCCIÓN)?|V\s*\d+|ESTROFA(?:\s*\d+)?|VERSO(?:\s*\d+)?|CORO(?:\s*\d+)?|ESTRIBILLO|PRE[- ]?CORO|POST[- ]?CORO|PUENTE(?:\s*\d+)?|INTERLUDIO|INSTRUMENTAL|FINAL|OUTRO|CODA|VUELTA|VAMP|BREAKDOWN|TAG)\]\s*$/i;
    const lineas = String(letra || "").replace(/\r/g, "").split("\n");
    const secciones = [];
    let actual = { titulo: "Canción completa", lineas: [] };

    lineas.forEach(linea => {
      const match = linea.trim().match(encabezado);
      if (match) {
        if (actual.lineas.length || actual.titulo !== "Canción completa") secciones.push(actual);
        actual = { titulo: match[1].replace(/\s+/g, " ").toUpperCase(), lineas: [] };
      } else {
        actual.lineas.push(linea);
      }
    });

    if (actual.lineas.length || secciones.length === 0) secciones.push(actual);

    return secciones.map((seccion, index) => {
      const titulo = seccion.titulo.toUpperCase();
      let abreviatura = titulo.slice(0, 3);
      if (/^(ESTROFA|VERSO|V)\s*(\d+)?$/.test(titulo)) abreviatura = "V" + ((titulo.match(/\d+/) || [index + 1])[0]);
      else if (/CORO|ESTRIBILLO/.test(titulo)) abreviatura = "C";
      else if (/PRE/.test(titulo)) abreviatura = "PC";
      else if (/POST/.test(titulo)) abreviatura = "PoC";
      else if (/PUENTE/.test(titulo)) abreviatura = "P";
      else if (/INTRO/.test(titulo)) abreviatura = "IN";
      else if (/INTERLUDIO/.test(titulo)) abreviatura = "INT";
      else if (/INSTRUMENTAL/.test(titulo)) abreviatura = "I";
      else if (/OUTRO/.test(titulo)) abreviatura = "O";
      else if (/FINAL/.test(titulo)) abreviatura = "F";
      else if (/CODA/.test(titulo)) abreviatura = "T";
      else if (/VUELTA/.test(titulo)) abreviatura = "Vu";
      else if (/VAMP/.test(titulo)) abreviatura = "Va";
      else if (/BREAKDOWN/.test(titulo)) abreviatura = "BD";
      return { ...seccion, abreviatura, letra: seccion.lineas.join("\n").trim() };
    });
  };

  const construirEstadoProyeccion = () => {
    const cancionActual = setlistEnVivoActual[indiceCancionEnVivo] || {};
    const objetoRepo = repertorio.find(r =>
      r.titulo && cancionActual.titulo &&
      r.titulo.toLowerCase() === cancionActual.titulo.toLowerCase()
    ) || {};
    const letraBase = objetoRepo.letra || cancionActual.letra || "[INTRO]\nLetra no disponible en biblioteca.";
    const tonoActual = transponerTono(
      cancionActual.tono || objetoRepo.tono || "C",
      semitonosEnVivo
    );
    const letraTranspuesta = transponerLetra(letraBase, semitonosEnVivo);
    const letraFormateada = modoNashvilleEnVivo ? convertirANashville(letraTranspuesta, tonoActual) : letraTranspuesta;
    const secciones = obtenerSeccionesEnVivo(letraFormateada);
    const seccionActual = secciones[Math.min(indiceSeccionEnVivo, secciones.length - 1)] || secciones[0];

    return {
      letra: secciones.length > 1 ? (seccionActual?.letra || "") : letraFormateada,
      seccion: seccionActual?.titulo || "",
      indiceSeccion: indiceSeccionEnVivo,
      totalSecciones: secciones.length,
      indiceCancion: indiceCancionEnVivo
    };
  };

  estadoProyeccionRef.current = {
    modoActivo: modoEnVivoActivo,
    payload: construirEstadoProyeccion()
  };

  const publicarEstadoProyeccion = (canal = canalProyeccionRef.current) => {
    const estadoActual = estadoProyeccionRef.current;
    if (!canal || !estadoActual.modoActivo) return;
    canal.send({
      type: "broadcast",
      event: "actualizacion",
      payload: estadoActual.payload
    });
  };

  useEffect(() => {
    if (!esModoProyeccion || !isSupabaseConfigured) return;

    let mounted = true;
    const canal = supabase.channel(`soundteam-proyeccion-${idProyeccionURL}`);

    canal.on("broadcast", { event: "actualizacion" }, ({ payload }) => {
      if (!mounted) return;
      const nuevoIndice = payload?.indiceCancion ?? null;
      if (nuevoIndice !== indiceCancionProyectadaRef.current) {
        indiceCancionProyectadaRef.current = nuevoIndice;
        posicionScrollProyeccionRef.current = 0;
        requestAnimationFrame(() => {
          scrollProyeccionRef.current?.scrollTo({ y: 0, animated: false });
        });
      }
      setDatosProyeccion(payload || null);
    });

    canal.on("broadcast", { event: "desplazar" }, ({ payload }) => {
      if (!mounted) return;
      const delta = Number(payload?.delta) || 0;
      const nuevaPosicion = Math.max(0, posicionScrollProyeccionRef.current + delta);
      posicionScrollProyeccionRef.current = nuevaPosicion;
      scrollProyeccionRef.current?.scrollTo({ y: nuevaPosicion, animated: true });
    });

    canal.on("broadcast", { event: "inicio_letra" }, () => {
      if (!mounted) return;
      posicionScrollProyeccionRef.current = 0;
      scrollProyeccionRef.current?.scrollTo({ y: 0, animated: true });
    });

    canal.on("broadcast", { event: "cerrar" }, () => {
      if (mounted) setDatosProyeccion(null);
    });

    canal.subscribe(status => {
      if (status === "SUBSCRIBED") {
        canal.send({
          type: "broadcast",
          event: "solicitar_estado",
          payload: {}
        });
      }
    });

    return () => {
      mounted = false;
      supabase.removeChannel(canal);
    };
  }, [esModoProyeccion, idProyeccionURL]);

  useEffect(() => {
    if (!modoEnVivoActivo || !proyeccionAbierta) return;
    publicarEstadoProyeccion();
  }, [
    modoEnVivoActivo,
    proyeccionAbierta,
    setlistEnVivoActual,
    indiceCancionEnVivo,
    repertorio,
    semitonosEnVivo,
    modoNashvilleEnVivo,
    indiceSeccionEnVivo
  ]);

  const cargarRepertorioSupabase = async () => {
    if (!sesionIniciada) return;
    const { data, error } = await supabase.from("repertorio").select("*").eq("sede_id", sedeIdSeleccionada);
    if (error) {
      setErrorDatos(`No se pudo cargar el repertorio: ${error.message}`);
      return;
    }
    if (data) {
      setRepertorio(data.map((c) => ({
        id: c.id,
        titulo: c.titulo,
        artista: c.artista || "Sin artista",
        tono: c.tono || "C",
        bpm: c.bpm || "120",
        compas: c.compas || "4/4",
        tipoSet: (c.tipo_set || (parseInt(c.bpm || "120", 10) < 110 ? "lenta" : "rapida")).toLowerCase(),
        letra: c.letra || "",
        sedeId: c.sede_id,
      })));
    } else {
      setRepertorio([]);
    }
  };

  useEffect(() => {
    if (sesionIniciada) cargarRepertorioSupabase();
  }, [sedeIdSeleccionada, sesionIniciada]);

  const [cancionSeleccionadaDetalle, setCancionSeleccionadaDetalle] = useState(null);

  const [modoEdicionCancion, setModoEdicionCancion] = useState(false);
  const [idCancionEditando, setIdCancionEditando] = useState(null);
  const [nuevoTituloCancion, setNuevoTituloCancion] = useState("");
  const [nuevoArtistaCancion, setNuevoArtistaCancion] = useState("");
  const [nuevoTonoCancion, setNuevoTonoCancion] = useState("C");
  const [nuevoBpmCancion, setNuevoBpmCancion] = useState("120");
  const [nuevoCompasCancion, setNuevoCompasCancion] = useState("4/4");
  const [nuevoTipoSetCancion, setNuevoTipoSetCancion] = useState("lenta");
  const [nuevaLetraCancion, setNuevaLetraCancion] = useState("");
  const [etiquetasActuales, setEtiquetasActuales] = useState([]);
  const [mostrarFormularioCancion, setMostrarFormularioCancion] = useState(false);
  const [seccionCancionActiva, setSeccionCancionActiva] = useState(0);
  const [seccionesEditorCancion, setSeccionesEditorCancion] = useState([{ id: 1, titulo: "ESTROFA 1", letra: "" }]);
  const scrollLetraRef = useRef(null);
  const posicionesSeccionesRef = useRef({});
  const siguienteIdSeccion = useRef(2);

  const [idServicioChatActivo, setIdServicioChatActivo] = useState(null);
  const [mostrarDetalleChatMovil, setMostrarDetalleChatMovil] = useState(false);
  const [mensajesChat, setMensajesChat] = useState([]);
  const [nuevoMensajeTexto, setNuevoMensajeTexto] = useState("");
  const [idMensajeEditando, setIdMensajeEditando] = useState(null);

  const cargarMensajesSupabase = async () => {
    if (!sesionIniciada || idServicioChatActivo === null) {
      setMensajesChat([]);
      return;
    }
    const { data, error } = await supabase
      .from("mensajes")
      .select("*")
      .eq("servicio_id", idServicioChatActivo)
      .order("created_at", { ascending: true });
    if (error) {
      setErrorDatos(`No se pudieron cargar los mensajes: ${error.message}`);
      return;
    }
    setMensajesChat(data || []);
  };

  useEffect(() => {
    if (sesionIniciada && pestana === "chat") cargarMensajesSupabase();
  }, [idServicioChatActivo, sesionIniciada, pestana]);

  const handleLogin = async () => {
    const email = emailInput.trim().toLowerCase();
    if (!email || !passwordInput) {
      setErrorAuth("Ingresa tu correo electrónico y contraseña.");
      return;
    }
    if (!isSupabaseConfigured) {
      setErrorAuth("Supabase no está configurado. Revisa las variables de entorno.");
      return;
    }

    setCargandoAuth(true);
    setErrorAuth("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: passwordInput });
      if (error) setErrorAuth(`No se pudo iniciar sesión: ${error.message}`);
    } catch (error) {
      setErrorAuth(`Error inesperado al iniciar sesión: ${error.message}`);
    } finally {
      setCargandoAuth(false);
    }
  };

  const handleRecuperarPassword = async () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) {
      setErrorAuth("Escribe tu correo electrónico para enviarte el enlace.");
      return;
    }
    setCargandoAuth(true);
    setErrorAuth("");
    setMensajeAuth("");
    try {
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) setErrorAuth(`No se pudo enviar el enlace: ${error.message}`);
      else setMensajeAuth("Si el correo está registrado, recibirás un enlace. Revisa también la carpeta de spam.");
    } catch (error) {
      setErrorAuth(`Error al recuperar la contraseña: ${error.message}`);
    } finally {
      setCargandoAuth(false);
    }
  };

  const handleActualizarPassword = async () => {
    if (nuevaPassword.length < 12 || nuevaPassword.length > 128 ||
        !/[a-z]/.test(nuevaPassword) || !/[A-Z]/.test(nuevaPassword) ||
        !/[0-9]/.test(nuevaPassword) || !/[^A-Za-z0-9]/.test(nuevaPassword)) {
      setErrorAuth("Usa una contraseña de 12 a 128 caracteres con mayúsculas, minúsculas, números y símbolos.");
      return;
    }
    if (nuevaPassword !== confirmarNuevaPassword) {
      setErrorAuth("Las contraseñas no coinciden.");
      return;
    }
    setCargandoAuth(true);
    setErrorAuth("");
    setMensajeAuth("");
    try {
      if (cambioPasswordTemporal) {
        const { error } = await supabase.functions.invoke("soundteam-password-admin", {
          body: { action: "complete", newPassword: nuevaPassword }
        });
        if (error) {
          setErrorAuth(`No se pudo cambiar la contraseña temporal: ${error.message}`);
          return;
        }
      } else {
        const { error } = await supabase.auth.updateUser({ password: nuevaPassword });
        if (error) {
          setErrorAuth(`No se pudo actualizar la contraseña: ${error.message}`);
          return;
        }
      }
      await supabase.auth.signOut();
      setModoRecuperacionPassword(false);
      setCambioPasswordTemporal(false);
      setNuevaPassword("");
      setConfirmarNuevaPassword("");
      setPasswordInput("");
      setMensajeAuth("Contraseña actualizada. Ya puedes iniciar sesión.");
    } catch (error) {
      setErrorAuth(`Error al actualizar la contraseña: ${error.message}`);
    } finally {
      setCargandoAuth(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      setErrorAuth("Supabase no está configurado.");
      return;
    }
    if (googleLoginEnCursoRef.current) return;
    googleLoginEnCursoRef.current = true;
    setCargandoAuth(true);
    setErrorAuth("");
    try {
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/` : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo }
      });
      if (error) setErrorAuth(`No se pudo iniciar sesión con Google: ${error.message}`);
    } catch (error) {
      setErrorAuth(`Error al conectar con Google: ${error.message}`);
    } finally {
      googleLoginEnCursoRef.current = false;
      setCargandoAuth(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErrorAuth(`No se pudo cerrar la sesión: ${error.message}`);
      return;
    }
    setSesionIniciada(false);
    setUsuario("");
    setUsuarioId(null);
    setEmailInput("");
    setPasswordInput("");
    setRolUsuario((perfil.rol_acceso || "miembro").toLowerCase());
    setRolesMusicalesUsuario(Array.isArray(perfil.roles_musicales) ? perfil.roles_musicales : []);
    setPestana("inicio");
    setErrorAuth("");
    setErrorDatos("");
  };

  const guardarPerfilPersonal = async (nuevoNombre = nombrePerfilInput, nuevaFoto = fotoPerfilRuta) => {
    if (!usuarioId) return false;
    const nombreLimpio = String(nuevoNombre || "").trim();
    if (!nombreLimpio) { alert("Escribe tu nombre."); return false; }
    setGuardandoPerfil(true);
    let fotoVisible = null;
    if (nuevaFoto) {
      const { data: avatarFirmado, error: avatarError } = await supabase.storage.from("avatars").createSignedUrl(nuevaFoto, 3600);
      if (avatarError) { setGuardandoPerfil(false); alert(`No se pudo preparar la foto privada: ${avatarError.message}`); return false; }
      fotoVisible = avatarFirmado?.signedUrl || null;
    }
    const { error } = await supabase.rpc("soundteam_actualizar_perfil", { p_nombre: nombreLimpio, p_avatar_url: nuevaFoto || null });
    setGuardandoPerfil(false);
    if (error) { alert(`No se pudo guardar tu perfil: ${error.message}`); return false; }
    setUsuario(nombreLimpio);
    setNombrePerfilInput(nombreLimpio);
    setFotoPerfilRuta(nuevaFoto || null);
    setFotoPerfil(fotoVisible);
    alert("Perfil actualizado.");
    return true;
  };

  const seleccionarFotoPerfil = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) { alert("Necesitamos permiso para acceder a tus fotos."); return; }
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.82 });
    if (resultado.canceled || !resultado.assets?.[0]) return;
    const asset = resultado.assets[0];
    try {
      setGuardandoPerfil(true);
      const extension = (asset.fileName || asset.uri.split(".").pop() || "jpg").split(".").pop().toLowerCase();
      const ruta = `${usuarioId}/avatar-${Date.now()}.${extension}`;
      const respuesta = await fetch(asset.uri);
      const archivo = await respuesta.blob();
      const { error: uploadError } = await supabase.storage.from("avatars").upload(ruta, archivo, { upsert: true, contentType: asset.mimeType || "image/jpeg" });
      if (uploadError) throw uploadError;
      const guardado = await guardarPerfilPersonal(nombrePerfilInput, ruta);
      if (!guardado) setGuardandoPerfil(false);
    } catch (error) {
      setGuardandoPerfil(false);
      alert(`No se pudo cargar la foto: ${error.message}`);
    }
  };

  const quitarFotoPerfil = async () => {
    await guardarPerfilPersonal(nombrePerfilInput, null);
  };

  const recargarDatosApp = async () => {
    setErrorDatos("");
    await verificarSesionActiva();
    await Promise.all([
      cargarServiciosSupabase(),
      cargarRepertorioSupabase(),
      cargarMensajesSupabase(),
    ]);
  };

  const esAdmin = emailUsuario === "johnbocal31@gmail.com";
  const esAdminOLider = esAdmin || rolUsuario === "lider";

  const generarClaveTemporal = async (integrante) => {
    if (!esAdminOLider) return;
    if (!integrante?.userId) {
      alert("Este integrante todavía no ha vinculado su cuenta de acceso. Primero debe completar su registro con el correo asignado.");
      return;
    }
    if (!confirm(`¿Generar una nueva contraseña temporal para ${integrante.nombre}? La contraseña actual dejará de funcionar.`)) return;
    setGenerandoClaveTemporalId(integrante.id);
    try {
      const { data, error } = await supabase.functions.invoke("soundteam-password-admin", {
        body: { action: "reset", memberId: integrante.id }
      });
      if (error) throw error;
      if (!data?.temporaryPassword) throw new Error("El servidor no devolvió la contraseña temporal.");
      alert(`Contraseña temporal para ${integrante.nombre}:\n\n${data.temporaryPassword}\n\nVálida hasta: ${new Date(data.expiresAt).toLocaleString()}\n\nEntrégala directamente al integrante. Si tenía una sesión abierta, debe cerrarla e ingresar de nuevo. Al ingresar deberá crear su propia contraseña.`);
    } catch (error) {
      alert(`No se pudo generar la contraseña temporal: ${error.message}`);
    } finally {
      setGenerandoClaveTemporalId(null);
    }
  };
  const servicioIncluyeUsuario = (serv) => {
    const voces = serv?.voces || {};
    const instrumentos = serv?.instrumentos || {};
    const nombreNormalizado = String(usuario || "").trim().toLowerCase();
    const nombreUnicoEnSede = integrantes.filter(m =>
      m.sedeId === serv.sedeId &&
      String(m.nombre || "").trim().toLowerCase() === nombreNormalizado
    ).length === 1;
    const esPrincipalPorId = !!usuarioId && String(voces.principal_user_id || "") === String(usuarioId);
    const esPrincipalLegacy = !voces.principal_user_id && nombreUnicoEnSede &&
      String(voces.principal || "").trim() === usuario;
    const esCoro = nombreUnicoEnSede &&
      String(voces.coros || "").split(",").map(n => n.trim()).includes(usuario);
    const esInstrumentista = nombreUnicoEnSede &&
      ["piano", "guitarra", "bajo", "bateria"].some(rol => String(instrumentos[rol] || "").trim() === usuario);
    return esPrincipalPorId || esPrincipalLegacy || esCoro || esInstrumentista;
  };
  const serviciosChatDisponibles = serviciosChatFuente
    .filter(serv => esAdminOLider || servicioIncluyeUsuario(serv))
    .sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")));
  const servicioChatActual = serviciosChatDisponibles.find(
    serv => String(serv.id) === String(idServicioChatActivo)
  ) || null;

  useEffect(() => {
    if (serviciosChatDisponibles.length === 0) {
      setIdServicioChatActivo(null);
      setMensajesChat([]);
      return;
    }
    if (!serviciosChatDisponibles.some(serv => String(serv.id) === String(idServicioChatActivo))) {
      setIdServicioChatActivo(serviciosChatDisponibles[0].id);
    }
  }, [serviciosChatFuente, usuario, usuarioId, esAdminOLider]);
  const esVozPrincipalDeServicio = (serv) =>
    !!usuarioId &&
    String(serv?.voces?.principal_user_id || "") === String(usuarioId);

  const servicioEditandoActual = servicios.find(
    (s) => String(s.id) === String(idServicioEditando)
  );
  const esVozPrincipalEditando =
    !!servicioEditandoActual &&
    esVozPrincipalDeServicio(servicioEditandoActual) &&
    !esAdminOLider;
  const puedeGestionarRepertorio = esAdminOLider || rolesMusicalesUsuario.some(r => ["piano", "guitarra", "bajo", "bateria"].includes(String(r).toLowerCase()));

  const importarCancionesCongregacionales = async () => {
    if (!puedeGestionarRepertorio || importandoCancionesCongregacionales) return;
    const confirmado = confirm(
      `Se preparó un lote de 30 canciones congregacionales para ${sedeActual.nombre}.\\n\\nSe omitirán las que ya existan en esta sede. Los tonos y BPM son valores iniciales sugeridos y podrás editarlos. Las letras quedarán vacías para que agregues material propio o autorizado.\\n\\n¿Continuar?`
    );
    if (!confirmado) return;

    setImportandoCancionesCongregacionales(true);
    try {
      const { data: existentes, error: errorConsulta } = await supabase
        .from("repertorio")
        .select("titulo")
        .eq("sede_id", sedeIdSeleccionada);

      if (errorConsulta) {
        alert(`No se pudo comprobar el repertorio actual: ${errorConsulta.message}`);
        return;
      }

      const normalizarTitulo = valor => String(valor || "")
        .normalize("NFD")
        .replace(/[\\u0300-\\u036f]/g, "")
        .trim()
        .toLowerCase();

      const titulosExistentes = new Set((existentes || []).map(c => normalizarTitulo(c.titulo)));
      const pendientes = CANCIONES_CONGREGACIONALES_INICIALES
        .filter(c => !titulosExistentes.has(normalizarTitulo(c.titulo)))
        .map(c => ({
          ...c,
          etiquetas: ["Congregacional", "Tono y BPM sugeridos"],
          letra: "",
          sede_id: sedeIdSeleccionada,
        }));

      if (pendientes.length === 0) {
        alert("Estas 30 canciones ya están registradas en esta sede. No se hicieron cambios.");
        return;
      }

      const { data: insertadas, error: errorInsercion } = await supabase
        .from("repertorio")
        .insert(pendientes)
        .select("id");

      if (errorInsercion) {
        alert(`No se pudo completar la importación: ${errorInsercion.message}`);
        return;
      }

      await cargarRepertorioSupabase();
      alert(`Importación completada. Se agregaron ${insertadas?.length || 0} canciones nuevas. Se omitieron ${30 - pendientes.length} que ya estaban registradas. Revisa y ajusta los tonos y BPM según la versión que usa tu congregación.`);
    } catch (error) {
      alert(`Ocurrió un error durante la importación: ${error.message}`);
    } finally {
      setImportandoCancionesCongregacionales(false);
    }
  };


  const enviarOActualizarMensajeChat = async () => {
    if (idServicioChatActivo === null || !nuevoMensajeTexto.trim()) return;
    const horaActual = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (idMensajeEditando !== null) {
      const { error } = await supabase.from("mensajes")
        .update({ texto: nuevoMensajeTexto.trim(), editado: true })
        .eq("id", Number(idMensajeEditando))
        .eq("servicio_id", idServicioChatActivo);
      if (error) { alert(`No se pudo corregir el mensaje: ${error.message}`); return; }
      setIdMensajeEditando(null);
    } else {
      const mensaje = {
        autor: usuario,
        texto: nuevoMensajeTexto.trim(),
        hora: horaActual,
        canal: "servicio",
        servicio_id: idServicioChatActivo,
        sede: sedeIdSeleccionada,
        editado: false,
        user_id: usuarioId,
      };
      const { error } = await supabase.from("mensajes").insert([mensaje]);
      if (error) { alert(`No se pudo enviar el mensaje: ${error.message}`); return; }
    }
    setNuevoMensajeTexto("");
    await cargarMensajesSupabase();
  };

  const limpiarHistorialChat = async () => {
    if (!esAdminOLider || idServicioChatActivo === null) {
      alert("Solo Administradores y Líderes pueden limpiar el chat de un servicio.");
      return;
    }
    const servicio = servicios.find(s => String(s.id) === String(idServicioChatActivo));
    if (!servicio) return;
    if (!confirm(`¿Borrar todos los mensajes del chat de "${servicio.titulo || "Servicio"}" del ${servicio.fecha}? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabase.from("mensajes").delete().eq("servicio_id", idServicioChatActivo);
    if (error) { alert(`No se pudo limpiar el chat: ${error.message}`); return; }
    setMensajesChat([]);
    alert("Historial de este servicio limpiado.");
  };


  const guardarOActualizarCancion = async () => {
    if (!puedeGestionarRepertorio) {
      alert("No tienes permisos para modificar el repertorio.");
      return;
    }
    if (!nuevoTituloCancion.trim()) {
      alert("Completa el título de la canción.");
      return;
    }

    const cancion = {
      titulo: nuevoTituloCancion.trim(),
      artista: nuevoArtistaCancion.trim() || "Sin artista",
      tono: nuevoTonoCancion.trim() || "C",
      bpm: nuevoBpmCancion.trim() || "120",
      compas: nuevoCompasCancion,
      tipo_set: nuevoTipoSetCancion,
      etiquetas: etiquetasActuales,
      letra: seccionesEditorCancion.map(s => `[${s.titulo.trim().toUpperCase() || "SECCIÓN"}]\n${s.letra || ""}`).join("\n\n"),
      sede_id: sedeIdSeleccionada,
    };

    const resultado = modoEdicionCancion && idCancionEditando !== null
      ? await supabase.from("repertorio").update(cancion).eq("id", idCancionEditando).eq("sede_id", sedeIdSeleccionada).select("id")
      : await supabase.from("repertorio").insert([cancion]).select("id");

    if (resultado.error) {
      alert(`No se pudo guardar la canción: ${resultado.error.message}`);
      return;
    }

    if (!resultado.data || resultado.data.length === 0) {
      alert(modoEdicionCancion
        ? `No se actualizó ninguna canción. ID: ${idCancionEditando}. Revisa los permisos de actualización (RLS) en Supabase.`
        : "No se confirmó el registro de la canción.");
      return;
    }

    await cargarRepertorioSupabase();
    setModoEdicionCancion(false);
    setMostrarFormularioCancion(false);
    setIdCancionEditando(null);
    setCancionSeleccionadaDetalle(null);
    setNuevoTituloCancion("");
    setNuevoArtistaCancion("");
    setNuevoTonoCancion("C");
    setNuevoBpmCancion("120");
    setNuevoCompasCancion("4/4");
    setNuevoTipoSetCancion("lenta");
    setNuevaLetraCancion("");
    setSeccionesEditorCancion([{ id: siguienteIdSeccion.current++, titulo: "ESTROFA 1", letra: "" }]);
    setEtiquetasActuales([]);
    alert(modoEdicionCancion ? "Canción actualizada." : "Canción guardada.");
  };

  const eliminarCancionRepertorio = async (id) => {
    if (!puedeGestionarRepertorio) {
      alert("No tienes permisos para eliminar canciones.");
      return;
    }
    if (!confirm("¿Deseas eliminar esta canción del repertorio?")) return;

    const { error } = await supabase.from("repertorio")
      .delete().eq("id", id).eq("sede_id", sedeIdSeleccionada);

    if (error) {
      alert(`No se pudo eliminar la canción: ${error.message}`);
      return;
    }
    await cargarRepertorioSupabase();
    setCancionSeleccionadaDetalle(null);
    alert("Canción eliminada.");
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
    for (let i = 0; i < primerDiaIndex; i++) { lista.push({ vacio: true, id: `vacio-${i}` }); }
    for (let d = 1; d <= totalDias; d++) {
      const dStr = d < 10 ? "0" + d : String(d);
      const mStr = String(mIndex + 1).padStart(2, "0");
      const claveFecha = `${year}-${mStr}-${dStr}`;
      const postulado = usuarioEstaPostuladoEnFecha(claveFecha);
      lista.push({ vacio: false, diaNum: d, postulado: postulado });
    }
    return lista;
  };

  const enviarPorWhatsApp = (servicio) => {
    const canciones = servicio.setlist || [];
    const obtenerTipo = (c) => (
      c.tipoSet ||
      repertorio.find((r) => r.titulo?.toLowerCase() === (c.titulo || "").toLowerCase())?.tipoSet ||
      "lenta"
    ).toLowerCase();

    const orden = servicio.ordenBloquesSetlist === "rapida-lenta"
      ? ["rapida", "lenta"]
      : ["lenta", "rapida"];

    let texto = `🎵 *${servicio.titulo}* (${diaSeleccionado} de ${mesSeleccionadoObj.nombre} ${mesSeleccionadoObj.year})\n\n`;

    orden.forEach((tipo) => {
      const grupo = canciones.filter((c) => obtenerTipo(c) === tipo);
      if (!grupo.length) return;

      texto += `*SETLIST (${grupo.length}):*\n`;
      texto += tipo === "lenta" ? "🕯️ *LENTAS*\n" : "⚡ *RÁPIDAS*\n";

      grupo.forEach((c, i) => {
        texto += `${i + 1}. ${c.titulo} (Tono: ${c.tono || "C"} | ${c.bpm || "120"} BPM)\n`;
      });
      texto += "\n";
    });

    if (!canciones.length) texto += "Sin canciones asignadas.\n";

    const url = "https://api.whatsapp.com/send?text=" + encodeURIComponent(texto);
    Linking.openURL(url).catch(() => { alert("No se pudo abrir WhatsApp."); });
  };

  const confirmarPostulacionRol = async (rol) => {
    if (idServicioPostulando === null) return;
    const servicioObjetivo = servicios.find((s) => s.id === idServicioPostulando);
    if (!servicioObjetivo) return;

    let nuevaVozP = servicioObjetivo.voces?.principal || "Sin asignar";
    let nuevosCoros = servicioObjetivo.voces?.coros ? servicioObjetivo.voces.coros.split(", ").map(c => c.trim()).filter((c) => c !== "Sin asignar" && c !== "") : [];
    let nuevoPiano = servicioObjetivo.instrumentos?.piano || "Sin asignar";
    let nuevaGuitarra = servicioObjetivo.instrumentos?.guitarra || "Sin asignar";
    let nuevoBajo = servicioObjetivo.instrumentos?.bajo || "Sin asignar";
    let nuevaBateria = servicioObjetivo.instrumentos?.bateria || "Sin asignar";

    if (rol === "vozPrincipal") { if (nuevaVozP !== "Sin asignar") { alert("⚠️ Voz Principal ocupada."); return; } nuevaVozP = usuario; }
    else if (rol === "coros") { if (nuevosCoros.length >= Number(servicioObjetivo.cuposCoros ?? 3)) { alert("⚠️ No hay más espacio en los coros."); return; } nuevosCoros.push(usuario); }
    else if (rol === "piano") { if (nuevoPiano !== "Sin asignar") { alert("⚠️ Piano ocupado."); return; } nuevoPiano = usuario; }
    else if (rol === "guitarra") { if (nuevaGuitarra !== "Sin asignar") { alert("⚠️ Guitarra ocupada."); return; } nuevaGuitarra = usuario; }
    else if (rol === "bajo") { if (nuevoBajo !== "Sin asignar") { alert("⚠️ Bajo ocupado."); return; } nuevoBajo = usuario; }
    else if (rol === "bateria") { if (nuevaBateria !== "Sin asignar") { alert("⚠️ Batería ocupada."); return; } nuevaBateria = usuario; }

    const nVoces = { principal: nuevaVozP, coros: nuevosCoros.length > 0 ? nuevosCoros.join(", ") : "Sin asignar" };
    const nInst = { piano: nuevoPiano, guitarra: nuevaGuitarra, bajo: nuevoBajo, bateria: nuevaBateria };

    const { error } = await supabase.rpc("postularse_servicio", {
      p_servicio_id: idServicioPostulando,
      p_rol: rol,
    });
    if (error) {
      alert(`No se pudo registrar la postulación: ${error.message}`);
      return;
    }
    await cargarServiciosSupabase();
    setModalPostularVisible(false);
    alert("Postulación realizada correctamente.");
  };


  const retirarPostulacion = async (servicioId, rol, integrante) => {
    if (!esAdminOLider) {
      alert("No tienes permiso para retirar integrantes.");
      return;
    }

    if (!confirm(`¿Retirar a ${integrante} de este puesto?`)) return;

    const { error } = await supabase.rpc("retirar_postulacion_servicio", {
      p_servicio_id: servicioId,
      p_rol: rol,
      p_integrante: integrante,
    });

    if (error) {
      alert(`No se pudo retirar la postulación: ${error.message}`);
      return;
    }

    await cargarServiciosSupabase();
    alert(`${integrante} fue retirado del puesto.`);
  };

  const abrirProyeccion = () => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      setMensajeProyeccion("Abre SoundTeam desde Safari o un navegador para crear la pantalla de proyección.");
      return;
    }

    if (canalProyeccionRef.current) {
      canalProyeccionRef.current.send({ type: "broadcast", event: "cerrar", payload: {} });
      supabase.removeChannel(canalProyeccionRef.current);
      canalProyeccionRef.current = null;
    }
    if (ventanaProyeccionRef.current && !ventanaProyeccionRef.current.closed) {
      ventanaProyeccionRef.current.close();
    }

    const id = window.crypto && typeof window.crypto.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const url = new URL(window.location.href);
    url.searchParams.set("soundTeamProjection", id);
    url.hash = "";

    idProyeccionRef.current = id;
    setEnlaceProyeccion(url.toString());

    const ventana = window.open(
      url.toString(),
      `soundteam-proyeccion-${id}`,
      "popup=yes,width=1280,height=800"
    );
    ventanaProyeccionRef.current = ventana || null;

    const canal = supabase.channel(`soundteam-proyeccion-${id}`);
    canalProyeccionRef.current = canal;

    canal.on("broadcast", { event: "solicitar_estado" }, () => {
      publicarEstadoProyeccion(canal);
    });

    canal.subscribe(status => {
      if (status === "SUBSCRIBED") {
        setProyeccionAbierta(true);
        publicarEstadoProyeccion(canal);
        setMensajeProyeccion(
          ventana
            ? "Proyección conectada. Puedes mover esa ventana a la pantalla externa."
            : "Sesión creada. Si el navegador bloqueó la ventana, copia el enlace para abrirlo en la pantalla externa."
        );
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        setProyeccionAbierta(false);
        setMensajeProyeccion("No se pudo conectar la proyección. Revisa la conexión e inténtalo de nuevo.");
      }
    });
  };

  const cerrarProyeccion = async () => {
    const canal = canalProyeccionRef.current;
    if (canal) {
      try {
        await canal.send({ type: "broadcast", event: "cerrar", payload: {} });
      } catch (_) {}
      await supabase.removeChannel(canal);
    }

    const ventana = ventanaProyeccionRef.current;
    if (ventana && !ventana.closed) ventana.close();

    canalProyeccionRef.current = null;
    ventanaProyeccionRef.current = null;
    idProyeccionRef.current = null;
    setProyeccionAbierta(false);
    setEnlaceProyeccion("");
    setMensajeProyeccion("");
  };

  const desplazarLetraProyectada = (direccion) => {
    const canal = canalProyeccionRef.current;
    if (!canal || !proyeccionAbierta) return;
    canal.send({
      type: "broadcast",
      event: "desplazar",
      payload: { delta: direccion * 360 }
    });
  };

  const volverAlInicioDeProyeccion = () => {
    const canal = canalProyeccionRef.current;
    if (!canal || !proyeccionAbierta) return;
    canal.send({ type: "broadcast", event: "inicio_letra", payload: {} });
  };

  const copiarEnlaceProyeccion = async () => {
    if (!enlaceProyeccion || typeof navigator === "undefined") {
      setMensajeProyeccion("No se pudo preparar el enlace de proyección.");
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Proyección de SoundTeam",
          url: enlaceProyeccion
        });
        setMensajeProyeccion("Enlace compartido con el equipo de proyección.");
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(enlaceProyeccion);
        setMensajeProyeccion("Enlace copiado. Ábrelo en el navegador del equipo conectado al videobeam.");
        return;
      } catch (_) {}
    }

    setMensajeProyeccion("Copia manualmente el enlace que aparece debajo.");
  };

  if (!sesionIniciada && !esModoProyeccion) {
    return (
      <View style={[styles.loginContainer, { backgroundColor: t.bg }]}>
        <View style={[styles.loginCard, { backgroundColor: t.cardBg, borderColor: t.border }]}>
          <Text style={[styles.loginTitle, { color: t.textMain }]}>SoundTeam</Text>
          <Text style={[styles.loginSubtitle, { color: t.textSub }]}>Inicio de Sesión</Text>
          
          <Text style={[styles.inputLabel, { color: t.textMain }]}>📧 Usuario / Correo</Text>
          <TextInput
            style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={t.textSub}
            autoCapitalize="none"
            value={emailInput}
            onChangeText={setEmailInput}
          />

{!modoRecuperacionPassword && (
          <>
          <Text style={[styles.inputLabel, { color: t.textMain }]}>🔑 Contraseña</Text>
          <TextInput
            style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
            placeholder="Tu contraseña"
            placeholderTextColor={t.textSub}
            secureTextEntry
            value={passwordInput}
            onChangeText={setPasswordInput}
          />
          </>
          )}

{!modoRecuperacionPassword && (
          <View style={{ marginTop: 6 }}>
            <TouchableOpacity
              onPress={handleRecuperarPassword}
              disabled={cargandoAuth}
              style={{ alignSelf: "flex-end", paddingVertical: 8 }}
            >
              <Text style={{ color: t.primary, fontSize: 13, fontWeight: "bold" }}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.loginButton, { backgroundColor: t.primary, marginBottom: 10 }]} 
              onPress={handleLogin}
              disabled={cargandoAuth}
            >
              <Text style={styles.loginButtonText}>{cargandoAuth ? "Verificando..." : "Iniciar sesión"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D1D5DB", marginTop: 4 }]}
              onPress={handleGoogleLogin}
              disabled={cargandoAuth}
            >
              <Text style={{ color: "#202124", fontSize: 14, fontWeight: "bold", textAlign: "center" }}>
                G  Iniciar sesión con Google
              </Text>
            </TouchableOpacity>

            {!!mensajeAuth && (
              <Text style={{ color: "#16A34A", fontSize: 12, marginTop: 8 }}>{mensajeAuth}</Text>
            )}
            {!!errorAuth && (
              <Text accessibilityRole="alert" style={{ color: "#EF4444", fontSize: 12, marginTop: 8 }}>
                {errorAuth}
              </Text>
            )}
          </View>
          )}
          {modoRecuperacionPassword && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: t.textSub, fontSize: 12, lineHeight: 18, marginBottom: 10 }}>{cambioPasswordTemporal ? "Por seguridad, esta contraseña temporal solo permite ingresar una vez y tiene una vigencia máxima de 24 horas. Define ahora tu contraseña personal." : "Define una nueva contraseña para recuperar el acceso."}</Text>
              {!!mensajeAuth && <Text style={{ color: "#16A34A", fontSize: 12, marginBottom: 8 }}>{mensajeAuth}</Text>}
              {!!errorAuth && <Text accessibilityRole="alert" style={{ color: "#EF4444", fontSize: 12, marginBottom: 8 }}>{errorAuth}</Text>}
              <Text style={[styles.inputLabel, { color: t.textMain }]}>Nueva contraseña</Text>
              <TextInput
                style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor={t.textSub}
                secureTextEntry
                value={nuevaPassword}
                onChangeText={setNuevaPassword}
              />
              <Text style={[styles.inputLabel, { color: t.textMain }]}>Confirmar contraseña</Text>
              <TextInput
                style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
                placeholder="Repite la contraseña"
                placeholderTextColor={t.textSub}
                secureTextEntry
                value={confirmarNuevaPassword}
                onChangeText={setConfirmarNuevaPassword}
              />
              <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: t.primary, marginTop: 10 }]}
                onPress={handleActualizarPassword}
                disabled={cargandoAuth}
              >
                <Text style={styles.loginButtonText}>{cargandoAuth ? "Actualizando..." : "Guardar nueva contraseña"}</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: esModoProyeccion ? "#000000" : t.bg }]}>
      {esModoProyeccion ? (
        <View style={{ flex: 1, width: "100%", minHeight: "100vh", backgroundColor: "#000000" }}>
          <ScrollView
            ref={scrollProyeccionRef}
            onScroll={event => {
              posicionScrollProyeccionRef.current = event.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: Math.max(24, anchoVentana * 0.06),
              paddingVertical: 36
            }}
          >
            {!!datosProyeccion?.seccion && datosProyeccion?.totalSecciones > 1 && <Text style={{ color: "#94A3B8", fontSize: Math.max(14, Math.min(24, anchoVentana * 0.018)), fontWeight: "800", textAlign: "center", marginBottom: 18, letterSpacing: 2 }}>{datosProyeccion.seccion}</Text>}
            <Text
              selectable
              style={{
                color: "#FFFFFF",
                fontSize: Math.max(26, Math.min(64, anchoVentana * 0.045)),
                lineHeight: Math.max(39, Math.min(88, anchoVentana * 0.063)),
                fontWeight: "600",
                textAlign: "center",
                width: "100%",
                maxWidth: 1600
              }}
            >
              {datosProyeccion?.letra || ""}
            </Text>
          </ScrollView>
        </View>
      ) : (
        <>
      {!!errorDatos && (
        <TouchableOpacity onPress={() => setErrorDatos("")} style={{ padding: 8, backgroundColor: "#7F1D1D" }}>
          <Text style={{ color: "#FFFFFF", fontSize: 12 }}>{errorDatos} · Toca para cerrar</Text>
        </TouchableOpacity>
      )}
      {modoEnVivoActivo ? (
        <View style={[styles.teleprompterContainer, { backgroundColor: "#0B0F19" }]}>
          <View style={[styles.teleprompterTopBar, { backgroundColor: "#0F172A", borderBottomWidth: 1, borderBottomColor: "#263449", paddingVertical: 12 }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
              <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: "#22C55E" }} />
              <View>
                <Text style={{ color: "#F8FAFC", fontSize: 12, fontWeight: "900", letterSpacing: 1 }}>SOUNDTEAM · EN VIVO</Text>
                <Text style={{ color: "#94A3B8", fontSize: 10, marginTop: 2 }}>{proyeccionAbierta ? "Pantalla externa conectada" : "Consola de dirección"}</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text style={{ color: "#94A3B8", fontSize: 11, fontWeight: "800" }}>
                {indiceCancionEnVivo + 1} / {setlistEnVivoActual.length}
              </Text>
              <TouchableOpacity
                style={[styles.teleprompterExitBtn, { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 9 }]}
                onPress={() => { cerrarProyeccion(); setModoEnVivoActivo(false); setMetronomoActivo(false); setAvanceAutomaticoActivo(false); }}
              >
                <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 11 }}>✕ Salir</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ backgroundColor: "#111827", paddingHorizontal: 14, paddingTop: 11, paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: "#334155" }}>
            <Text style={{ color: "#94A3B8", fontSize: 9, fontWeight: "900", letterSpacing: 1.4, marginBottom: 8 }}>CONTROL DE CANCIÓN · SIEMPRE DISPONIBLE</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <TouchableOpacity
                style={[styles.teleprompterNavBtn, { flex: 1, minWidth: 0, minHeight: 48, backgroundColor: "#334155", borderRadius: 11 }, indiceCancionEnVivo === 0 && { opacity: 0.35 }]}
                disabled={indiceCancionEnVivo === 0}
                onPress={() => cambiarCancionEnVivo(-1)}
              >
                <Text style={{ color: "#FFF", fontWeight: "900", fontSize: 13 }}>← Anterior</Text>
              </TouchableOpacity>
              <View style={{ flex: 1.35, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 }}>
                <Text numberOfLines={1} style={{ color: "#F8FAFC", fontSize: 12, fontWeight: "900", textAlign: "center" }}>
                  {(setlistEnVivoActual[indiceCancionEnVivo] || {}).titulo || "Sin canción"}
                </Text>
                <Text style={{ color: "#94A3B8", fontSize: 10, marginTop: 3 }}>Toca para avanzar desde aquí</Text>
              </View>
              <TouchableOpacity
                style={[styles.teleprompterNavBtn, { flex: 1, minWidth: 0, minHeight: 48, backgroundColor: "#2563EB", borderRadius: 11 }, indiceCancionEnVivo >= setlistEnVivoActual.length - 1 && { opacity: 0.35 }]}
                disabled={indiceCancionEnVivo >= setlistEnVivoActual.length - 1}
                onPress={() => cambiarCancionEnVivo(1)}
              >
                <Text style={{ color: "#FFF", fontWeight: "900", fontSize: 13 }}>Siguiente →</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.teleprompterScrollContent}>
            <View style={styles.teleprompterCard}>
              <View style={styles.teleprompterHeaderRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ color: "#38BDF8", fontSize: 9, fontWeight: "bold", marginBottom: 1 }}>EN VIVO:</Text>
                  <Text style={styles.teleprompterSongTitle} numberOfLines={1}>
                    {(setlistEnVivoActual[indiceCancionEnVivo] || {}).titulo || "Sin título"}
                  </Text>
                </View>
                <View style={styles.teleprompterToneBox}>
                  <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "bold" }}>
                    Tono: {transponerTono((setlistEnVivoActual[indiceCancionEnVivo] || {}).tono || "C", semitonosEnVivo)}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                <TouchableOpacity
                  onPress={abrirProyeccion}
                  style={{ backgroundColor: proyeccionAbierta ? "#166534" : "#0E7490", paddingVertical: 9, paddingHorizontal: 13, borderRadius: 8 }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 11 }}>
                    {proyeccionAbierta ? "✓ Proyección activa" : "↗ Abrir pantalla de proyección"}
                  </Text>
                </TouchableOpacity>
                {!!enlaceProyeccion && (
                  <TouchableOpacity
                    onPress={copiarEnlaceProyeccion}
                    style={{ backgroundColor: "#334155", paddingVertical: 9, paddingHorizontal: 13, borderRadius: 8 }}
                  >
                    <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 11 }}>Copiar enlace para otra pantalla</Text>
                  </TouchableOpacity>
                )}
                {proyeccionAbierta && (
                  <TouchableOpacity
                    onPress={cerrarProyeccion}
                    style={{ backgroundColor: "#7F1D1D", paddingVertical: 9, paddingHorizontal: 13, borderRadius: 8 }}
                  >
                    <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 11 }}>Cerrar proyección</Text>
                  </TouchableOpacity>
                )}
              </View>
              {proyeccionAbierta && (
                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                  <TouchableOpacity
                    onPress={() => desplazarLetraProyectada(-1)}
                    style={{ backgroundColor: "#334155", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}
                  >
                    <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 12 }}>↑ Subir letra</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={volverAlInicioDeProyeccion}
                    style={{ backgroundColor: "#475569", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}
                  >
                    <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 12 }}>↥ Inicio</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => desplazarLetraProyectada(1)}
                    style={{ backgroundColor: "#0284C7", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}
                  >
                    <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 12 }}>↓ Bajar letra</Text>
                  </TouchableOpacity>
                </View>
              )}
              {!!mensajeProyeccion && (
                <Text style={{ color: "#7DD3FC", fontSize: 10, textAlign: "center", marginBottom: 10 }}>
                  {mensajeProyeccion}
                </Text>
              )}
              {!!enlaceProyeccion && (
                <Text
                  selectable
                  style={{ color: "#94A3B8", fontSize: 9, textAlign: "center", marginBottom: 10 }}
                >
                  {enlaceProyeccion}
                </Text>
              )}

              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginBottom: 12 }}>
                <TouchableOpacity onPress={() => setSemitonosEnVivo(v => v - 1)} style={{ backgroundColor: "#1E293B", padding: 10, borderRadius: 7, margin: 3 }}>
                  <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>− Tono</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSemitonosEnVivo(v => v + 1)} style={{ backgroundColor: "#1E293B", padding: 10, borderRadius: 7, margin: 3 }}>
                  <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>+ Tono</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModoNashvilleEnVivo(v => !v)} style={{ backgroundColor: "#1D4ED8", padding: 10, borderRadius: 7, margin: 3 }}>
                  <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>{modoNashvilleEnVivo ? "Ver acordes" : "Nashville"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setSemitonosEnVivo(0); setModoNashvilleEnVivo(false); }} style={{ backgroundColor: "#475569", padding: 10, borderRadius: 7, margin: 3 }}>
                  <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>Original</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.teleprompterControlsRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: pulsoActivo ? "#22C55E" : "#64748B" }} />
                  <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "bold" }}>
                    ⚡ {bpmClick} BPM
                  </Text>
                  {cuentaEntrada && (
                    <Text style={{ color: "#FDE68A", fontSize: 11, fontWeight: "900" }}>
                      ENTRADA {cuentaEntrada.actual}/{cuentaEntrada.total}
                    </Text>
                  )}
                </View>

                <View style={{ flexDirection: "row", gap: 5, flexWrap: "wrap" }}>
                  <TouchableOpacity
                    style={[styles.teleprompterActionBtn, { backgroundColor: metronomoActivo ? "#EF4444" : "#22C55E" }]}
                    onPress={alternarMetronomo}
                  >
                    <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 10 }}>
                      {metronomoActivo ? "⏹️ Detener Click" : "▶️ Iniciar Click"}
                    </Text>
                  </TouchableOpacity>

                </View>
              </View>
            </View>


                  <View style={{ backgroundColor: "#0F172A", borderRadius: 10, padding: 10, marginTop: 10, gap: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <Text style={{ color: "#CBD5E1", fontSize: 11, fontWeight: "bold" }}>VELOCIDAD</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <TouchableOpacity
                          style={styles.teleprompterActionBtn}
                          onPress={() => setBpmClick(v => Math.max(30, v - 1))}
                        >
                          <Text style={{ color: "#FFF", fontWeight: "bold" }}>−</Text>
                        </TouchableOpacity>
                        <TextInput
                          value={String(bpmClick)}
                          onChangeText={v => {
                            const n = parseInt(v, 10);
                            if (Number.isFinite(n)) setBpmClick(Math.min(300, Math.max(30, n)));
                          }}
                          keyboardType="numeric"
                          selectTextOnFocus
                          style={{ color: "#FFF", backgroundColor: "#1E293B", borderRadius: 6, minWidth: 55, textAlign: "center", padding: 6, fontWeight: "bold" }}
                        />
                        <Text style={{ color: "#94A3B8", fontSize: 10 }}>BPM</Text>
                        <TouchableOpacity
                          style={styles.teleprompterActionBtn}
                          onPress={() => setBpmClick(v => Math.min(300, v + 1))}
                        >
                          <Text style={{ color: "#FFF", fontWeight: "bold" }}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                      <Text style={{ color: "#CBD5E1", fontSize: 11, fontWeight: "bold", marginRight: 4 }}>COMPÁS</Text>
                      {["2/4", "3/4", "4/4", "6/8"].map(compas => (
                        <TouchableOpacity
                          key={compas}
                          onPress={() => setCompasClick(compas)}
                          style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: compasClick === compas ? "#0284C7" : "#334155" }}
                        >
                          <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "bold" }}>{compas}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 7 }}>
                      <Text style={{ color: "#CBD5E1", fontSize: 11, fontWeight: "bold" }}>VOLUMEN</Text>
                      <TouchableOpacity style={styles.teleprompterActionBtn} onPress={() => setVolumenClick(v => Math.max(0, v - 10))}>
                        <Text style={{ color: "#FFF" }}>−</Text>
                      </TouchableOpacity>
                      <Text style={{ color: "#FFF", fontSize: 11, minWidth: 38, textAlign: "center" }}>{volumenClick}%</Text>
                      <TouchableOpacity style={styles.teleprompterActionBtn} onPress={() => setVolumenClick(v => Math.min(100, v + 10))}>
                        <Text style={{ color: "#FFF" }}>+</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                      <Text style={{ color: "#CBD5E1", fontSize: 11, fontWeight: "bold", marginRight: 4 }}>PANEО</Text>
                      {[
                        { label: "Izquierda", value: -1 },
                        { label: "Centro", value: 0 },
                        { label: "Derecha", value: 1 }
                      ].map(opcion => (
                        <TouchableOpacity
                          key={opcion.label}
                          onPress={() => setPaneoClick(opcion.value)}
                          style={{ paddingVertical: 6, paddingHorizontal: 9, borderRadius: 6, backgroundColor: paneoClick === opcion.value ? "#0284C7" : "#334155" }}
                        >
                          <Text style={{ color: "#FFF", fontSize: 10 }}>{opcion.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={{ color: "#64748B", fontSize: 10 }}>
                      El primer pulso de cada compás lleva acento. En 6/8 se cuentan seis pulsos por compás.
                    </Text>
                    {!!errorClick && <Text style={{ color: "#FCA5A5", fontSize: 11 }}>{errorClick}</Text>}
                  </View>

            {(() => {
              const cancionActual = setlistEnVivoActual[indiceCancionEnVivo] || {};
              const objetoRepo = repertorio.find(r => r.titulo && cancionActual.titulo && r.titulo.toLowerCase() === cancionActual.titulo.toLowerCase()) || {};
              const letraBase = objetoRepo.letra || cancionActual.letra || "[INTRO]\\nLetra no disponible en biblioteca.";
              const tonoActual = transponerTono(cancionActual.tono || objetoRepo.tono || "C", semitonosEnVivo);
              const letraTranspuesta = transponerLetra(letraBase, semitonosEnVivo);
              const letraVista = modoNashvilleEnVivo ? convertirANashville(letraTranspuesta, tonoActual) : letraTranspuesta;
              const secciones = obtenerSeccionesEnVivo(letraVista);
              const seccionActual = secciones[Math.min(indiceSeccionEnVivo, secciones.length - 1)] || secciones[0];
              return <>
                {secciones.length > 1 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8, paddingHorizontal: 2 }}>
                  {secciones.map((seccion, index) => <TouchableOpacity key={index} onPress={() => setIndiceSeccionEnVivo(index)} style={{ paddingHorizontal: 15, paddingVertical: 10, borderRadius: 22, backgroundColor: index === indiceSeccionEnVivo ? "#8B78FF" : "#1E293B", borderWidth: 1, borderColor: index === indiceSeccionEnVivo ? "#A99BFF" : "#334155" }}>
                    <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 13 }}>{seccion.abreviatura}</Text>
                  </TouchableOpacity>)}
                </ScrollView>}
                <View style={styles.teleprompterLyricsBox}>
                  {secciones.length > 1 && <Text style={{ color: "#8B78FF", fontSize: 13, fontWeight: "900", marginBottom: 10 }}>{seccionActual?.titulo}</Text>}
                  <Text style={styles.teleprompterLyricsText}>{secciones.length > 1 ? (seccionActual?.letra || "") : letraVista}</Text>
                </View>
              </>;
            })()}

          </ScrollView>
        </View>
      ) : (
        <View style={{ flex: 1, flexDirection: esEscritorio ? "row" : "column", width: "100%", height: "100vh", minHeight: "100vh" }}>
          {esEscritorio && (
            <View style={{ width: 264, backgroundColor: t.cardBg, borderRightWidth: 1, borderRightColor: t.border, paddingHorizontal: 18, paddingTop: 28, paddingBottom: 22, shadowColor: "#18213B", shadowOpacity: 0.05, shadowRadius: 18, shadowOffset: { width: 4, height: 0 }, elevation: 2 }}>
              <View style={{ paddingHorizontal: 10, paddingBottom: 26, borderBottomWidth: 1, borderBottomColor: t.border, marginBottom: 24 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: t.primary, alignItems: "center", justifyContent: "center", shadowColor: t.primary, shadowOpacity: 0.22, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}>
                    <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "900" }}>S</Text>
                  </View>
                  <View>
                    <Text style={{ color: t.textMain, fontSize: 18, fontWeight: "900", letterSpacing: 0.2 }}>SoundTeam</Text>
                    <Text style={{ color: t.textSub, fontSize: 10, fontWeight: "700", letterSpacing: 1.1 }}>GESTIÓN MUSICAL</Text>
                  </View>
                </View>
                <Text style={{ color: t.textSub, fontSize: 11, marginTop: 3 }} numberOfLines={1}>{sedeActual.nombre}</Text>
              </View>
              <Text style={{ color: t.textSub, fontSize: 10, fontWeight: "800", letterSpacing: 1.5, paddingHorizontal: 10, marginBottom: 10 }}>MENÚ PRINCIPAL</Text>
              {[
                { key: "inicio", label: "Inicio", icon: "⌂" },
                { key: "chat", label: "Chat", icon: "▤" },
                { key: "eventos", label: "Eventos y calendario", icon: "▦" },
                { key: "repertorio", label: "Repertorio", icon: "♫" },
                { key: "ajustes", label: "Ajustes", icon: "⚙" },
              ].map((tab) => {
                const activo = pestana === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => { setPestana(tab.key); setCancionSeleccionadaDetalle(null); if (tab.key === "chat") setMostrarDetalleChatMovil(false); }}
                    style={{ flexDirection: "row", alignItems: "center", paddingVertical: 13, paddingHorizontal: 12, borderRadius: 12, marginBottom: 7, backgroundColor: activo ? t.primary : "transparent", borderWidth: 1, borderColor: activo ? t.primary : "transparent", shadowColor: t.primary, shadowOpacity: activo ? 0.18 : 0, shadowRadius: 9, shadowOffset: { width: 0, height: 4 }, elevation: activo ? 2 : 0 }}
                  >
                    <Text style={{ width: 27, color: activo ? "#FFFFFF" : t.textSub, fontSize: 19, fontWeight: "800" }}>{tab.icon}</Text>
                    <Text style={{ color: activo ? "#FFFFFF" : t.textSub, fontSize: 13, fontWeight: activo ? "800" : "600" }}>{tab.label}</Text>
                  </TouchableOpacity>
                );
              })}
              <View style={{ flex: 1 }} />
              <View style={{ backgroundColor: t.bg, borderRadius: 16, borderWidth: 1, borderColor: t.border, padding: 15 }}>
                <Text style={{ color: t.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 }}>TU COMUNIDAD</Text>
                <Text style={{ color: t.textMain, fontSize: 12, fontWeight: "700", marginTop: 7 }} numberOfLines={1}>{usuario}</Text>
                <Text style={{ color: t.textSub, fontSize: 10, marginTop: 4 }}>ROL: {rolUsuario.toUpperCase()}</Text>
              </View>
            </View>
          )}
          <View style={{ flex: 1, minWidth: 0, width: esEscritorio ? undefined : "100%", height: esEscritorio ? "100%" : undefined, position: "relative" }}>
          <View style={[styles.header, esMovil && styles.headerMobile, esTablet && styles.headerTablet, { backgroundColor: t.cardBg, borderBottomColor: t.border }]}>
            <View style={styles.headerTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { color: t.textMain }]}>SoundTeam • {sedeActual.nombre}</Text>
                <Text style={[styles.headerSubtitle, { color: t.textSub }]} numberOfLines={1}>
                  👤 {usuario} • <Text style={{ color: t.primary, fontWeight: "bold" }}>ROL: {rolUsuario.toUpperCase()}</Text>
                </Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity style={{ backgroundColor: t.primary, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 9, minHeight: 34, justifyContent: "center" }} onPress={recargarDatosApp}>
                  <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>↻ Refrescar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                  <Text style={styles.logoutBtnText}>Salir</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginTop: 8 }}>
              {esAdmin && Platform.OS === "web" ? (
                <select
                  value={sedeIdSeleccionada}
                  onChange={(e) => setSedeIdSeleccionada(e.target.value)}
                  style={{
                    backgroundColor: t.bg,
                    color: t.textMain,
                    borderColor: t.border,
                    borderWidth: "1px",
                    borderRadius: "9px",
                    padding: "10px 12px",
                    fontSize: "13px",
                    marginBottom: "8px",
                    width: "100%",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  {SEDES_DISPONIBLES.map((s) => (
                    <option key={s.id} value={s.id} style={{ backgroundColor: t.cardBg, color: t.textMain }}>
                      🏛️ Sede: {s.nombre}
                    </option>
                  ))}
                </select>
              ) : null}

            </View>
          </View>

          <ScrollView style={[styles.content, { flex: 1 }, esMovil && styles.contentMobile, esTablet && styles.contentTablet]} contentContainerStyle={{ paddingBottom: (esMovil || esTablet) ? 110 : 40, alignItems: "center" }}>
            <View style={[styles.mainWrapper, esMovil && styles.mainWrapperMobile, esTablet && styles.mainWrapperTablet]}>
              {pestana === "inicio" && (
                <View style={{ width: "100%" }}>
                  <View style={{ backgroundColor: t.banner, borderColor: t.banner, borderWidth: 1, borderRadius: esMovil ? 19 : 26, padding: esMovil ? 18 : esTablet ? 22 : 28, marginBottom: 18, overflow: "hidden", shadowColor: t.banner, shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 4 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: esMovil ? 18 : 24, gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#DCDFFF", fontSize: 10, fontWeight: "900", letterSpacing: 1.7 }}>SOUNDTEAM · PANEL PRINCIPAL</Text>
                        <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700", marginTop: 5 }}>{sedeActual.nombre}</Text>
                      </View>
                      <View style={{ backgroundColor: "#FFFFFF20", paddingHorizontal: 11, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: "#FFFFFF30" }}>
                        <Text style={{ color: "#FFFFFF", fontSize: 9, fontWeight: "900", letterSpacing: 0.5 }}>● SESIÓN ACTIVA</Text>
                      </View>
                    </View>
                    <Text style={{ color: "#FFFFFF", fontSize: esMovil ? 25 : esTablet ? 29 : 34, fontWeight: "900", lineHeight: esMovil ? 31 : 40, marginBottom: 9 }}>Una sola música.{"\n"}Una misma misión.</Text>
                    <Text style={{ color: "#E8EAFE", fontSize: 13, lineHeight: 20, marginBottom: 20, maxWidth: 560 }}>Hola, {usuario}. Este es tu espacio para coordinar al equipo, preparar los servicios y servir con excelencia.</Text>
                    <View style={{ backgroundColor: "#FFFFFF18", borderRadius: 14, padding: esMovil ? 12 : 15, borderLeftWidth: 3, borderLeftColor: "#FFFFFF", borderWidth: 1, borderColor: "#FFFFFF22" }}>
                      <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "900", marginBottom: 6, letterSpacing: 0.8 }}>✨ COLOSENSES 3:23</Text>
                      <Text style={{ color: "#FFFFFF", fontSize: 12, lineHeight: 19, fontStyle: "italic" }}>"Y todo lo que hagan, háganlo de corazón, como para el Señor y no para los hombres."</Text>
                    </View>
                  </View>

                  {esAdminOLider && (
                    <TouchableOpacity onPress={() => setPestana("equipo")} style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.primary, borderWidth: 1, padding: esMovil ? 16 : 20, marginBottom: 18, flexDirection: "row", alignItems: "center", gap: 14 }]}>
                      <View style={{ width: 48, height: 48, borderRadius: 15, backgroundColor: t.primary + "22", alignItems: "center", justifyContent: "center" }}><Text style={{ color: t.primary, fontSize: 25 }}>👥</Text></View>
                      <View style={{ flex: 1 }}><Text style={{ color: t.textMain, fontSize: 16, fontWeight: "900" }}>Equipo</Text><Text style={{ color: t.textSub, fontSize: 11, marginTop: 4 }}>Personas y permisos · {integrantesSeccionEquipo.length} integrantes</Text></View>
                      <Text style={{ color: t.primary, fontSize: 22, fontWeight: "900" }}>›</Text>
                    </TouchableOpacity>
                  )}

                  <View style={{ flexDirection: "row", gap: esMovil ? 7 : 12, marginBottom: 18 }}>
                    {[
                      { label: "INTEGRANTES", value: integrantesSeccionEquipo.length, icon: "♧", tint: "#5755D9" },
                      { label: "SERVICIOS", value: servicios.length, icon: "▦", tint: "#2563EB" },
                      { label: "CANCIONES", value: repertorio.length, icon: "♫", tint: "#7C3AED" },
                    ].map((dato) => (
                      <View key={dato.label} style={{ flex: 1, minWidth: 0, flexDirection: esMovil ? "column" : "row", alignItems: esMovil ? "flex-start" : "center", justifyContent: esMovil ? "center" : "flex-start", gap: esMovil ? 7 : 12, padding: esMovil ? 11 : 15, minHeight: esMovil ? 91 : 78, borderRadius: 17, borderWidth: 1, borderColor: t.border, backgroundColor: t.cardBg, shadowColor: "#18213B", shadowOpacity: 0.045, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 1 }}>
                        <View style={{ width: esMovil ? 30 : 42, height: esMovil ? 30 : 42, borderRadius: 12, backgroundColor: dato.tint + "18", justifyContent: "center", alignItems: "center" }}>
                          <Text style={{ color: dato.tint, fontSize: esMovil ? 17 : 21, fontWeight: "900" }}>{dato.icon}</Text>
                        </View>
                        <View style={{ minWidth: 0 }}>
                          <Text style={{ color: t.textMain, fontSize: esMovil ? 19 : 22, fontWeight: "900" }}>{dato.value}</Text>
                          <Text numberOfLines={1} style={{ color: t.textSub, fontSize: esMovil ? 8 : 9, fontWeight: "900", letterSpacing: 0.65, marginTop: 2 }}>{dato.label}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  <View style={{ flexDirection: esEscritorio ? "row" : "column", alignItems: "stretch", gap: 16 }}>
                    <View style={{ flex: 1, minWidth: 0, gap: 14 }}>
                      <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border, marginBottom: 0, padding: esMovil ? 15 : 20 }]}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 9, gap: 8 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: t.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 }}>PRÓXIMOS ENCUENTROS</Text>
                            <Text style={{ color: t.textMain, fontSize: 16, fontWeight: "900", marginTop: 4 }}>Agenda de la sede</Text>
                          </View>
                          <TouchableOpacity onPress={() => setPestana("eventos")} style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 9, backgroundColor: t.primary + "18" }}>
                            <Text style={{ color: t.primary, fontSize: 10, fontWeight: "900" }}>Ver todos ›</Text>
                          </TouchableOpacity>
                        </View>
                        {serviciosProximos.map((serv) => (
                          <TouchableOpacity key={serv.id} onPress={() => setPestana("eventos")} style={{ paddingVertical: 11, borderTopWidth: 1, borderTopColor: t.border }}>
                            <Text style={{ color: t.textMain, fontSize: 12, fontWeight: "900" }}>{serv.titulo || "Servicio"}</Text>
                            <Text style={{ color: t.textSub, fontSize: 10, marginTop: 4 }}>{serv.fecha}</Text>
                          </TouchableOpacity>
                        ))}
                        {serviciosProximos.length === 0 && (
                          <Text style={{ color: t.textSub, fontSize: 11, lineHeight: 17, paddingVertical: 10 }}>Todavía no hay servicios próximos programados.</Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {pestana === "chat" && (
                <View style={{ width: "100%" }}>
                  <View style={{ backgroundColor: t.banner, borderRadius: 20, padding: esMovil ? 18 : 24, marginBottom: 16 }}>
                    <Text style={{ color: "#DCE4FF", fontSize: 10, fontWeight: "900", letterSpacing: 1.4 }}>COMUNICACIÓN · SOUNDTEAM</Text>
                    <Text style={{ color: "#FFFFFF", fontSize: esMovil ? 24 : 30, fontWeight: "900", marginTop: 7 }}>Chat por servicio</Text>
                    <Text style={{ color: "#E8EAFE", fontSize: 12, lineHeight: 18, marginTop: 6 }}>Cada conversación es privada para los músicos programados y los responsables autorizados.</Text>
                  </View>
                  <View style={{ flexDirection: esEscritorio ? "row" : "column", gap: 14, alignItems: "stretch" }}>
                    <View style={[styles.card, { display: esMovil && mostrarDetalleChatMovil ? "none" : "flex", width: esEscritorio ? 300 : "100%", backgroundColor: t.cardBg, borderColor: t.border, padding: 14, marginBottom: 0 }]}>
                      <Text style={{ color: t.textMain, fontSize: 15, fontWeight: "900", marginBottom: 10 }}>Tus servicios</Text>
                      {serviciosChatDisponibles.length === 0 ? (
                        <Text style={{ color: t.textSub, fontSize: 12, lineHeight: 18 }}>No tienes servicios asignados con chat disponible.</Text>
                      ) : serviciosChatDisponibles.map(serv => {
                        const activo = String(idServicioChatActivo) === String(serv.id);
                        return (
                          <TouchableOpacity key={serv.id} onPress={() => { setIdServicioChatActivo(serv.id); setMensajesChat([]); setIdMensajeEditando(null); setNuevoMensajeTexto(""); if (esMovil) setMostrarDetalleChatMovil(true); }}
                            style={{ padding: 12, borderRadius: 11, marginBottom: 7, backgroundColor: activo ? t.primary + "18" : t.bg, borderWidth: 1, borderColor: activo ? t.primary : t.border }}>
                            <Text style={{ color: activo ? t.primary : t.textMain, fontSize: 12, fontWeight: "900" }}>{serv.titulo || "Servicio"}</Text>
                            <Text style={{ color: t.textSub, fontSize: 10, marginTop: 4 }}>{serv.fecha}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    <View style={[styles.card, { display: esMovil && !mostrarDetalleChatMovil ? "none" : "flex", flex: 1, minWidth: 0, backgroundColor: t.cardBg, borderColor: t.border, padding: esMovil ? 13 : 18, marginBottom: 0 }]}>
                      {servicioChatActual ? (
                        <>
                          {esMovil && <TouchableOpacity onPress={() => setMostrarDetalleChatMovil(false)} style={{ alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 11, borderRadius: 9, backgroundColor: t.bg, borderWidth: 1, borderColor: t.border, marginBottom: 10 }}><Text style={{ color: t.primary, fontSize: 12, fontWeight: "900" }}>‹ Volver a mis chats</Text></TouchableOpacity>}
                          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 12 }}>
                            <View style={{ flex: 1 }}>
                              <Text style={{ color: t.textMain, fontSize: 16, fontWeight: "900" }}>{servicioChatActual.titulo || "Servicio"}</Text>
                              <Text style={{ color: t.textSub, fontSize: 11, marginTop: 3 }}>{servicioChatActual.fecha}</Text>
                            </View>
                            {esAdminOLider && <TouchableOpacity onPress={limpiarHistorialChat} style={{ backgroundColor: "#FEE2E2", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 9 }}><Text style={{ color: "#B91C1C", fontSize: 10, fontWeight: "800" }}>Limpiar chat</Text></TouchableOpacity>}
                          </View>
                          <View style={{ backgroundColor: t.bg, borderRadius: 13, borderWidth: 1, borderColor: t.border, padding: 10, minHeight: 260, maxHeight: 430, marginBottom: 11 }}>
                            <ScrollView>
                              {mensajesChat.length === 0 ? <Text style={{ color: t.textSub, textAlign: "center", marginTop: 24, fontSize: 12 }}>Aún no hay mensajes. Inicia la conversación del servicio.</Text> : mensajesChat.map((m, i) => {
                                const esMio = m.user_id === usuarioId;
                                return <View key={m.id || i} style={{ marginBottom: 9, padding: 11, borderRadius: 11, backgroundColor: esMio ? t.primary + "18" : t.cardBg, borderWidth: 1, borderColor: t.border }}>
                                  <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                                    <Text style={{ color: t.primary, fontWeight: "800", fontSize: 11, flex: 1 }}>{m.autor}{m.editado ? " · editado" : ""}</Text>
                                    <View style={{ flexDirection: "row", gap: 7, alignItems: "center" }}>
                                      <Text style={{ color: t.textSub, fontSize: 10 }}>{m.hora}</Text>
                                      {esMio && <TouchableOpacity onPress={() => { setIdMensajeEditando(m.id); setNuevoMensajeTexto(m.texto); }}><Text style={{ color: t.primary, fontSize: 10, fontWeight: "800" }}>Editar</Text></TouchableOpacity>}
                                    </View>
                                  </View>
                                  <Text style={{ color: t.textMain, fontSize: 13, lineHeight: 19 }}>{m.texto}</Text>
                                </View>;
                              })}
                            </ScrollView>
                          </View>
                          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                            <TextInput style={[styles.loginInput, { flex: 1, minWidth: 0, backgroundColor: t.bg, borderColor: t.border, color: t.textMain, marginBottom: 0, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, borderRadius: 10, minHeight: 46 }]}
                              placeholder="Escribe un mensaje..." placeholderTextColor={t.textSub} value={nuevoMensajeTexto} onChangeText={setNuevoMensajeTexto} />
                            <TouchableOpacity style={[styles.loginButton, { backgroundColor: t.primary, paddingHorizontal: 16, minHeight: 46, justifyContent: "center" }]} onPress={enviarOActualizarMensajeChat}><Text style={styles.loginButtonText}>{idMensajeEditando !== null ? "Guardar" : "Enviar"}</Text></TouchableOpacity>
                          </View>
                          {idMensajeEditando !== null && <TouchableOpacity onPress={() => { setIdMensajeEditando(null); setNuevoMensajeTexto(""); }} style={{ alignSelf: "flex-start", marginTop: 8 }}><Text style={{ color: t.textSub, fontSize: 11 }}>Cancelar edición</Text></TouchableOpacity>}
                        </>
                      ) : <Text style={{ color: t.textSub, fontSize: 12 }}>Selecciona un servicio para abrir su chat.</Text>}
                    </View>
                  </View>
                </View>
              )}

              {pestana === "eventos" && (
                <>
                  <View style={{ width: "100%", backgroundColor: t.banner, borderRadius: 22, padding: esMovil ? 17 : 24, marginBottom: 18, overflow: "hidden" }}>
                    <Text style={{ color: "#DCDFFF", fontSize: 10, fontWeight: "900", letterSpacing: 1.8 }}>PLANIFICACIÓN · {sedeActual.nombre.toUpperCase()}</Text>
                    <Text style={{ color: "#FFFFFF", fontSize: esMovil ? 23 : 29, fontWeight: "900", marginTop: 8 }}>Eventos y servicios</Text>
                    <Text style={{ color: "#E8EAFE", fontSize: 12, lineHeight: 19, marginTop: 6, maxWidth: 520 }}>Organiza cada encuentro, coordina al equipo y prepara el setlist desde un solo lugar.</Text>
                    <View style={{ flexDirection: "row", gap: 9, marginTop: 18 }}>
                      <View style={{ flex: 1, backgroundColor: "#FFFFFF20", borderRadius: 13, padding: 12 }}>
                        <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "900" }}>{servicios.length}</Text>
                        <Text style={{ color: "#E8EAFE", fontSize: 9, fontWeight: "800", letterSpacing: 0.7 }}>SERVICIOS</Text>
                      </View>
                      <View style={{ flex: 1, backgroundColor: "#FFFFFF20", borderRadius: 13, padding: 12 }}>
                        <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "900" }}>{serviciosProximos.length}</Text>
                        <Text style={{ color: "#E8EAFE", fontSize: 9, fontWeight: "800", letterSpacing: 0.7 }}>PRÓXIMOS</Text>
                      </View>
                      <View style={{ flex: 1, backgroundColor: "#FFFFFF20", borderRadius: 13, padding: 12 }}>
                        <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "900" }}>{serviciosDelDia.length}</Text>
                        <Text style={{ color: "#E8EAFE", fontSize: 9, fontWeight: "800", letterSpacing: 0.7 }}>DEL DÍA</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: t.textMain, fontSize: 17, fontWeight: "900" }}>Calendario de actividades</Text>
                      <Text style={{ color: t.textSub, fontSize: 11, marginTop: 3 }}>Selecciona una fecha para consultar sus servicios.</Text>
                    </View>
                    {esAdminOLider && (
                      <TouchableOpacity
                        style={{ backgroundColor: t.primary, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 11, flexDirection: "row", alignItems: "center", gap: 5 }}
                        onPress={() => {
                          setIdServicioEditando(null);
                          setNombreEvento(esDomingoSeleccionado ? "Culto Dominical" : "Culto");
                          setObservaciones("");
                          setSetlistActivo([]);
                          setCuposCorosEditando("3");
                          setOrdenBloquesEditando("lenta-rapida");
                          setModalProgramarVisible(true);
                        }}
                      >
                        <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "900" }}>+</Text>
                        <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "800" }}>Programar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.monthsRow}>
                    {listaMesesDinamicos.map((itemMes) => {
                      const esSeleccionado = mesSeleccionadoObj.key === itemMes.key;
                      return (
                        <TouchableOpacity
                          key={itemMes.key}
                          style={[styles.monthTab, { backgroundColor: t.cardBg, borderColor: t.border }, esSeleccionado && { backgroundColor: t.primary, borderColor: t.primary }]}
                          onPress={() => { setMesSeleccionadoObj(itemMes); setDiaSeleccionado(1); }}
                        >
                          <Text style={[styles.monthText, { color: t.textSub }, esSeleccionado && styles.monthTextActive]}>
                            {itemMes.nombre} {itemMes.year}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={[styles.calendarCard, { backgroundColor: t.cardBg, borderColor: t.border, borderRadius: 20, padding: esMovil ? 13 : 20, borderWidth: 1, shadowColor: "#18213B", shadowOpacity: 0.04, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 1 }]}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 }}>
                      <View>
                        <Text style={{ color: t.textSub, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 }}>VISTA MENSUAL</Text>
                        <Text style={[styles.calendarHeaderTitle, { color: t.textMain, marginTop: 3 }]}>
                          {mesSeleccionadoObj.nombre} {mesSeleccionadoObj.year}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: t.primary + "16", paddingHorizontal: 11, paddingVertical: 7, borderRadius: 9 }}>
                        <Text style={{ color: t.primary, fontSize: 10, fontWeight: "800" }}>{servicios.length} programados</Text>
                      </View>
                    </View>

                    <View style={styles.weekHeaderRow}>
                      {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((dSem, idx) => (
                        <Text key={idx} style={[styles.weekHeaderText, { color: t.textSub }]}>{dSem}</Text>
                      ))}
                    </View>

                    <View style={styles.daysGrid}>
                      {obtenerDiasDelMesDinamico(mesSeleccionadoObj.mesIndex, mesSeleccionadoObj.year).map((item, index) => {
                        if (item.vacio) { return <View key={item.id} style={styles.dayCellEmpty} />; }
                        const esSeleccionado = diaSeleccionado === item.diaNum;
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[styles.dayCell, { backgroundColor: t.bg, borderColor: t.border }, esSeleccionado && { backgroundColor: t.selectedDay, borderColor: t.selectedDay }]}
                            onPress={() => setDiaSeleccionado(item.diaNum)}
                          >
                            <Text style={[styles.dayText, { color: t.textMain }, esSeleccionado && styles.dayTextSelected]}>
                              {item.diaNum}
                            </Text>
                            {item.postulado && <View style={{ position: "absolute", top: 1, right: 1, backgroundColor: "#22C55E", width: 6, height: 6, borderRadius: 3 }} />}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 22, marginBottom: 12, gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: t.textMain, fontSize: 18, fontWeight: "900" }}>Servicios del día</Text>
                      <Text style={{ color: t.textSub, fontSize: 11, marginTop: 3 }}>{diaSeleccionado} de {mesSeleccionadoObj.nombre} · {sedeActual.nombre}</Text>
                    </View>
                    <View style={{ backgroundColor: t.primary + "16", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}>
                      <Text style={{ color: t.primary, fontSize: 12, fontWeight: "900" }}>{serviciosDelDia.length} {serviciosDelDia.length === 1 ? "servicio" : "servicios"}</Text>
                    </View>
                  </View>

                  {modalProgramarVisible && (
                    <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.primary, borderWidth: 2 }]}>
                      <Text style={[styles.cardTitle, { color: t.textMain, fontSize: 17, marginBottom: 12 }]}>
                        {idServicioEditando !== null ? "✏️ Modificar Servicio" : "➕ Nuevo Servicio"} en {sedeActual.nombre}
                      </Text>

                      <Text style={[styles.inputLabel, { color: t.textMain }]}>Nombre del evento</Text>
                      <TextInput
                        style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain, opacity: esVozPrincipalEditando ? 0.65 : 1 }]}
                        placeholder="Ej. Culto Dominical"
                        placeholderTextColor={t.textSub}
                        value={nombreEvento}
                        onChangeText={setNombreEvento}
                        editable={!esVozPrincipalEditando}
                      />

                      <Text style={[styles.inputLabel, { color: t.textMain }]}>Observaciones</Text>
                      <TextInput
                        style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
                        placeholder="Ej. Prueba a las 8:00 AM"
                        placeholderTextColor={t.textSub}
                        value={observaciones}
                        onChangeText={setObservaciones}
                      />

                      
                       <Text style={[styles.inputLabel, { color: t.textMain, fontWeight: "bold", marginTop: 8 }]}>Organización del Setlist</Text>
                       {(esAdminOLider || esVozPrincipalEditando) && (
                         <View style={{ backgroundColor: t.bg, borderColor: t.border, borderWidth: 1, borderRadius: 9, padding: 10, marginBottom: 10 }}>
                           {esAdminOLider && (
                             <>
                               <Text style={{ color: t.textMain, fontSize: 12, fontWeight: "bold", marginBottom: 5 }}>Cupos para voces de coro</Text>
                               <TextInput
                                 style={[styles.loginInput, { backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain, marginBottom: 10 }]}
                                 value={cuposCorosEditando}
                                 onChangeText={(v) => setCuposCorosEditando(v.replace(/[^0-9]/g, ""))}
                                 keyboardType="numeric"
                                 placeholder="Cantidad de cupos"
                                 placeholderTextColor={t.textSub}
                               />
                             </>
                           )}
                           <Text style={{ color: t.textMain, fontSize: 12, fontWeight: "bold", marginBottom: 6 }}>Orden de bloques del setlist</Text>
                           <View style={{ flexDirection: "row", gap: 8 }}>
                             <TouchableOpacity
                               style={{ flex: 1, padding: 9, borderRadius: 7, backgroundColor: ordenBloquesEditando === "lenta-rapida" ? t.primary : t.cardBg, borderWidth: 1, borderColor: t.border }}
                               onPress={() => setOrdenBloquesEditando("lenta-rapida")}
                             >
                               <Text style={{ color: ordenBloquesEditando === "lenta-rapida" ? "#FFFFFF" : t.textMain, textAlign: "center", fontSize: 11, fontWeight: "bold" }}>🕯️ Lentas primero</Text>
                             </TouchableOpacity>
                             <TouchableOpacity
                               style={{ flex: 1, padding: 9, borderRadius: 7, backgroundColor: ordenBloquesEditando === "rapida-lenta" ? t.primary : t.cardBg, borderWidth: 1, borderColor: t.border }}
                               onPress={() => setOrdenBloquesEditando("rapida-lenta")}
                             >
                               <Text style={{ color: ordenBloquesEditando === "rapida-lenta" ? "#FFFFFF" : t.textMain, textAlign: "center", fontSize: 11, fontWeight: "bold" }}>⚡ Rápidas primero</Text>
                             </TouchableOpacity>
                           </View>
                         </View>
                       )}
                       <Text style={[styles.inputLabel, { color: t.textSub, fontSize: 12, marginBottom: 4 }]}>Setlist Activo ({setlistActivo.length}):</Text>

                       {setlistActivo.length === 0 ? (
                         <Text style={{ color: t.textSub, fontSize: 12, fontStyle: "italic", marginBottom: 10 }}>No hay canciones en el setlist.</Text>
                       ) : (
                         setlistActivo.map((cancion, index) => (
                           <View key={cancion.id || index} style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: t.border, backgroundColor: t.bg, marginBottom: 6 }}>
                             <Text style={{ color: t.textMain, fontSize: 13, fontWeight: "bold", flex: 1, minWidth: 110 }}>{index + 1}. {cancion.titulo}</Text>
                             <Text style={{ color: t.textSub, fontSize: 11 }}>T:</Text>
                             <TextInput
                               style={{ backgroundColor: t.cardBg, color: t.textMain, borderWidth: 1, borderColor: t.border, borderRadius: 4, width: 38, height: 32, textAlign: "center", fontSize: 12 }}
                               value={String(cancion.tono || "C")}
                               onChangeText={(valor) => setSetlistActivo(actual => actual.map((item, i) => i === index ? { ...item, tono: valor } : item))}
                             />
                             <Text style={{ color: t.textSub, fontSize: 11 }}>BPM:</Text>
                             <TextInput
                               style={{ backgroundColor: t.cardBg, color: t.textMain, borderWidth: 1, borderColor: t.border, borderRadius: 4, width: 46, height: 32, textAlign: "center", fontSize: 12 }}
                               value={String(cancion.bpm || "120")}
                               keyboardType="numeric"
                               onChangeText={(valor) => setSetlistActivo(actual => actual.map((item, i) => i === index ? { ...item, bpm: valor } : item))}
                             />
                             <TouchableOpacity style={[styles.smallButton, { backgroundColor: t.cardBg, borderColor: t.border }]} onPress={() => moverCancionArriba(index)}>
                               <Text style={[styles.smallButtonText, { color: t.primary }]}>▲</Text>
                             </TouchableOpacity>
                             <TouchableOpacity style={[styles.smallButton, { backgroundColor: t.cardBg, borderColor: t.border }]} onPress={() => moverCancionAbajo(index)}>
                               <Text style={[styles.smallButtonText, { color: t.primary }]}>▼</Text>
                             </TouchableOpacity>
                             <TouchableOpacity
                               style={{ backgroundColor: "#EF4444", width: 30, height: 30, borderRadius: 6, justifyContent: "center", alignItems: "center" }}
                               onPress={() => setSetlistActivo(actual => actual.filter((_, i) => i !== index))}
                             >
                               <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "bold" }}>X</Text>
                             </TouchableOpacity>
                           </View>
                         ))
                       )}

                       {(() => {
                         const titulos = setlistActivo.map(c => (c.titulo || "").toLowerCase());
                         const disponibles = repertorio
                           .filter(c => c.titulo && !titulos.includes(c.titulo.toLowerCase()))
                           .sort((a, b) => a.titulo.localeCompare(b.titulo));

                         const lentas = disponibles.filter(c => (c.tipoSet || "").toLowerCase() === "lenta");
                         const rapidas = disponibles.filter(c => (c.tipoSet || "").toLowerCase() === "rapida");

                         const agregarCancion = (seleccion, lista, limpiar) => {
                           let titulo = seleccion;
                           if (!titulo && lista.length > 0) titulo = lista[0].titulo;
                           if (!titulo) {
                             alert("Selecciona una canción disponible.");
                             return;
                           }
                           if (titulos.includes(titulo.toLowerCase())) {
                             alert("Esa canción ya está en el setlist.");
                             return;
                           }
                           const existente = repertorio.find(c => c.titulo && c.titulo.toLowerCase() === titulo.toLowerCase());
                           setSetlistActivo(actual => [...actual, {
                             id: existente ? existente.id : undefined,
                             titulo: existente ? existente.titulo : titulo.trim(),
                             tono: existente ? existente.tono : "C",
                             bpm: existente ? (existente.bpm || "120") : "120",
                             compas: existente ? (existente.compas || "4/4") : "4/4",
                             tipoSet: existente ? (existente.tipoSet || "lenta") : (lista === lentas ? "lenta" : "rapida")
                           }]);
                           limpiar("");
                         };

                         const estiloSelector = {
                           flex: 1, minWidth: 0, backgroundColor: t.cardBg,
                           color: t.textMain, borderColor: t.border,
                           borderWidth: "1px", borderRadius: "8px",
                           padding: "8px", fontSize: "13px"
                         };

                         return (
                           <View style={{ marginTop: 10, gap: 10 }}>
                             <View style={{ backgroundColor: t.bg, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: t.border }}>
                               <Text style={[styles.inputLabel, { color: t.textMain, fontWeight: "bold", marginBottom: 6 }]}>🕯️ Set Lentas:</Text>
                               {lentas.length === 0 ? (
                                 <Text style={{ color: t.textSub, fontSize: 12, fontStyle: "italic" }}>No hay canciones lentas disponibles en esta sede.</Text>
                               ) : (
                                 <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                                   {Platform.OS === "web" ? (
                                     <select value={cancionLentaSeleccionada} onChange={e => setCancionLentaSeleccionada(e.target.value)} style={estiloSelector}>
                                       <option value="">-- Selecciona canción lenta --</option>
                                       {lentas.map(c => <option key={c.id} value={c.titulo}>{c.titulo} ({c.tono} • {c.bpm || "120"} BPM)</option>)}
                                     </select>
                                   ) : (
                                     <TextInput
                                       style={[styles.loginInput, { flex: 1, backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain, marginBottom: 0 }]}
                                       placeholder="Canción lenta..."
                                       placeholderTextColor={t.textSub}
                                       value={cancionLentaSeleccionada}
                                       onChangeText={setCancionLentaSeleccionada}
                                     />
                                   )}
                                   <TouchableOpacity style={[styles.loginButton, { backgroundColor: t.primary, paddingVertical: 8, paddingHorizontal: 12 }]} onPress={() => agregarCancion(cancionLentaSeleccionada, lentas, setCancionLentaSeleccionada)}>
                                     <Text style={[styles.loginButtonText, { fontSize: 12 }]}>+ Agregar</Text>
                                   </TouchableOpacity>
                                 </View>
                               )}
                             </View>

                             <View style={{ backgroundColor: t.bg, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: t.border }}>
                               <Text style={[styles.inputLabel, { color: t.textMain, fontWeight: "bold", marginBottom: 6 }]}>⚡ Set Rápidas:</Text>
                               {rapidas.length === 0 ? (
                                 <Text style={{ color: t.textSub, fontSize: 12, fontStyle: "italic" }}>No hay canciones rápidas disponibles en esta sede.</Text>
                               ) : (
                                 <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                                   {Platform.OS === "web" ? (
                                     <select value={cancionRapidaSeleccionada} onChange={e => setCancionRapidaSeleccionada(e.target.value)} style={estiloSelector}>
                                       <option value="">-- Selecciona canción rápida --</option>
                                       {rapidas.map(c => <option key={c.id} value={c.titulo}>{c.titulo} ({c.tono} • {c.bpm || "120"} BPM)</option>)}
                                     </select>
                                   ) : (
                                     <TextInput
                                       style={[styles.loginInput, { flex: 1, backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain, marginBottom: 0 }]}
                                       placeholder="Canción rápida..."
                                       placeholderTextColor={t.textSub}
                                       value={cancionRapidaSeleccionada}
                                       onChangeText={setCancionRapidaSeleccionada}
                                     />
                                   )}
                                   <TouchableOpacity style={[styles.loginButton, { backgroundColor: t.primary, paddingVertical: 8, paddingHorizontal: 12 }]} onPress={() => agregarCancion(cancionRapidaSeleccionada, rapidas, setCancionRapidaSeleccionada)}>
                                     <Text style={[styles.loginButtonText, { fontSize: 12 }]}>+ Agregar</Text>
                                   </TouchableOpacity>
                                 </View>
                               )}
                             </View>
                           </View>
                         );
                       })()}

<View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
                        <TouchableOpacity
                          style={[styles.loginButton, { flex: 1, backgroundColor: t.primary, padding: 12 }]}
                          onPress={async () => {
                            if (nombreEvento.trim() !== "") {
                              const nuevoServicioObj = {
                                fecha: fechaActualClave,
                                titulo: nombreEvento,
                                observaciones: observaciones || "Sin observaciones",
                                setlist: setlistActivo,
                                voces: { principal: "Sin asignar", coros: "Sin asignar" },
                                instrumentos: { piano: "Sin asignar", guitarra: "Sin asignar", bajo: "Sin asignar", bateria: "Sin asignar" },
                                sede_id: sedeIdSeleccionada,
                                cupos_coros: Math.max(1, parseInt(cuposCorosEditando, 10) || 3),
                                orden_bloques_setlist: ordenBloquesEditando,
                              };
                              if (idServicioEditando !== null) {
                                if (esVozPrincipalEditando) {
                                  const { error } = await supabase.rpc("soundteam_actualizar_servicio_asignado", {
                                    p_servicio_id: Number(idServicioEditando),
                                    p_observaciones: observaciones,
                                    p_setlist: setlistActivo
                                  });
                                  if (error) { alert(`No se pudo actualizar el servicio: ${error.message}`); return; }
                                } else {
                                  if (!esAdminOLider) {
                                    alert("No tienes permiso para modificar este servicio.");
                                    return;
                                  }
                                  const { error } = await supabase.from("servicios").update({
                                    titulo: nombreEvento.trim(),
                                    observaciones,
                                    setlist: setlistActivo,
                                    cupos_coros: Math.max(1, parseInt(cuposCorosEditando, 10) || 3)
                                  }).eq("id", idServicioEditando);
                                  if (error) { alert(`No se pudo actualizar el servicio: ${error.message}`); return; }
                                }
                              } else {
                                if (!esAdminOLider) {
                                  alert("No tienes permiso para crear servicios.");
                                  return;
                                }
                                const { error } = await supabase.from("servicios").insert([{ ...nuevoServicioObj, paleta_seleccionada: null }]);
                                if (error) { alert(`No se pudo crear el servicio: ${error.message}`); return; }
                              }
                              if (idServicioEditando !== null) {
                                const { error: errorOrden } = await supabase.rpc("soundteam_actualizar_orden_bloques", {
                                  p_servicio_id: Number(idServicioEditando),
                                  p_orden: ordenBloquesEditando
                                });
                                if (errorOrden) {
                                  alert(`El servicio se guardó, pero no se pudo guardar el orden de bloques: ${errorOrden.message}`);
                                  return;
                                }
                              }
                              await cargarServiciosSupabase();
                              setModalProgramarVisible(false);
                              setIdServicioEditando(null);
                            } else { alert("⚠️ Ingresa el nombre del evento."); }
                          }}
                        >
                          <Text style={[styles.loginButtonText, { fontSize: 14 }]}>Guardar Servicio</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.loginButton, { flex: 1, backgroundColor: "#EF4444", padding: 12 }]}
                          onPress={() => { setModalProgramarVisible(false); setIdServicioEditando(null); }}
                        >
                          <Text style={[styles.loginButtonText, { fontSize: 14 }]}>Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {modalPostularVisible && (
                    <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.selectedDay, borderWidth: 2 }]}>
                      <Text style={[styles.cardTitle, { color: t.textMain, fontSize: 17, marginBottom: 6 }]}>✨ Selecciona tu Rol</Text>
                      {[
                        { key: "vozPrincipal", label: "🎤 Voz Principal" },
                        { key: "coros", label: "👥 Coros" },
                        { key: "piano", label: "🎹 Piano" },
                        { key: "guitarra", label: "🎸 Guitarra" },
                        { key: "bajo", label: "🎸 Bajo" },
                        { key: "bateria", label: "🥁 Batería" },
                      ].map((rolObj) => (
                        <TouchableOpacity
                          key={rolObj.key}
                          style={[styles.postulateRoleOption, { backgroundColor: t.bg, borderColor: t.border }]}
                          onPress={() => confirmarPostulacionRol(rolObj.key)}
                        >
                          <Text style={{ color: t.textMain, fontWeight: "bold" }}>{rolObj.label}</Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity style={[styles.loginButton, { backgroundColor: "#EF4444", padding: 10, marginTop: 10 }]} onPress={() => setModalPostularVisible(false)}>
                        <Text style={[styles.loginButtonText, { fontSize: 13 }]}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {serviciosDelDia.length > 0 ? (
                    serviciosDelDia.map((serv) => (
                      <View key={serv.id} style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border, marginBottom: 18, padding: anchoVentana < 600 ? 12 : 18, borderRadius: 22, borderWidth: 1, shadowColor: "#26345D", shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 3 }]}>
                        <View style={[styles.eventCardHeaderRow, { alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 10 }]}>
                          <View style={{ flex: 1, minWidth: anchoVentana < 600 ? "100%" : 180, backgroundColor: t.primary + "12", borderRadius: 14, padding: 12, borderLeftWidth: 4, borderLeftColor: t.primary }}>
                            <Text style={{ color: t.primary, fontSize: 9, fontWeight: "800", letterSpacing: 1.1, marginBottom: 4 }}>SERVICIO PROGRAMADO</Text>
                            <Text style={[styles.eventMainTitle, { color: t.textMain, fontSize: anchoVentana < 600 ? 17 : 19, lineHeight: 24 }]}>{serv.titulo}</Text>
                            <Text style={{ color: t.textSub, fontSize: 10, marginTop: 4 }}>📅 {fechaActualClave}</Text>
                          </View>
                          {(esAdminOLider || esVozPrincipalDeServicio(serv)) && (
                            <View style={{ flexDirection: "row", gap: 4 }}>
                              <TouchableOpacity
                                style={[styles.editServiceBtn, { paddingVertical: 2, paddingHorizontal: 5 }]}
                                onPress={() => {
                                  setIdServicioEditando(serv.id);
                                  setNombreEvento(serv.titulo);
                                  setObservaciones(serv.observaciones);
                                  setSetlistActivo(serv.setlist || []);
                                  setCuposCorosEditando(String(serv.cuposCoros ?? 3));
                                  setOrdenBloquesEditando(serv.ordenBloquesSetlist || "lenta-rapida");
                                  setModalProgramarVisible(true);
                                }}
                              >
                                <Text style={{ fontSize: 10, color: "#FFFFFF", fontWeight: "bold" }}>✏️ Modificar</Text>
                              </TouchableOpacity>
                              {esAdminOLider && (
                                <TouchableOpacity
                                  style={[styles.deleteServiceBtn, { paddingVertical: 2, paddingHorizontal: 5 }]}
                                  onPress={async () => {
                                    const { error } = await supabase.from("servicios").delete().eq("id", serv.id);
                                    if (error) { alert(`No se pudo eliminar el servicio: ${error.message}`); return; }
                                    await cargarServiciosSupabase();
                                  }}
                                >
                                  <Text style={{ fontSize: 10, color: "#FFFFFF", fontWeight: "bold" }}>🗑️ Eliminar</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          )}
                        </View>
                        {serv.observaciones && serv.observaciones !== "Sin observaciones" && (
                          <View style={{ backgroundColor: t.bg, borderRadius: 10, padding: 10, marginBottom: 8 }}><Text style={{ color: t.textSub, fontSize: 11, lineHeight: 17 }}>📝 {serv.observaciones}</Text></View>
                        )}
                        <View style={{ marginTop: 12, marginBottom: 14, padding: anchoVentana < 600 ? 11 : 14, borderRadius: 16, backgroundColor: t.bg, borderWidth: 1, borderColor: t.border }}>
                          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <Text style={{ color: t.textMain, fontSize: 11, fontWeight: "800", letterSpacing: 0.6 }}>👥 OCUPACIÓN DE PUESTOS</Text>
                            <Text style={{ color: t.textSub, fontSize: 9, fontWeight: "700" }}>DISPONIBILIDAD</Text>
                          </View>
                          <View style={{ flexDirection: "row", alignItems: "stretch", gap: anchoVentana < 600 ? 7 : 12 }}>
                            <View style={{ flex: 1, minWidth: 0 }}>
                              <View style={{ backgroundColor: t.cardBg, borderRadius: 13, padding: 11, borderWidth: 1, borderColor: t.border }}>
                              <Text style={{ color: t.primary, fontSize: 11, fontWeight: "800", marginBottom: 10, letterSpacing: 0.5 }}>🎤 VOCES</Text>
                              {[
                                { key: "vozPrincipal", label: "Voz principal", personas: serv.voces?.principal && serv.voces.principal !== "Sin asignar" ? [serv.voces.principal] : [] },
                                { key: "coros", label: "Coros", personas: (serv.voces?.coros || "Sin asignar").split(",").map((x) => x.trim()).filter((x) => x && x !== "Sin asignar") },
                              ].map((puesto) => (
                                <View key={puesto.key} style={{ marginBottom: 9 }}>
                                  <Text style={{ color: t.textSub, fontSize: 11, fontWeight: "bold", marginBottom: 3 }}>{puesto.label} ({puesto.personas.length}/{puesto.key === "coros" ? Number(serv.cuposCoros ?? 3) : 1})</Text>
                                  {puesto.personas.length > 0 ? puesto.personas.map((persona, index) => (
                                    <View key={`${puesto.key}-${index}`} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 3, marginBottom: 3 }}>
                                      <Text style={{ color: t.textMain, fontSize: 11, flex: 1 }}>• {persona}</Text>
                                      {esAdminOLider && (
                                        <TouchableOpacity onPress={() => retirarPostulacion(serv.id, puesto.key, persona)} style={{ backgroundColor: "#DC2626", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 }}>
                                          <Text style={{ color: "#FFFFFF", fontSize: 9, fontWeight: "bold" }}>Retirar</Text>
                                        </TouchableOpacity>
                                      )}
                                    </View>
                                  )) : (
                                    <Text style={{ color: "#16A34A", fontSize: 11 }}>✓ Disponible</Text>
                                  )}
                                </View>
                              ))}
                              </View>
                            </View>
                            <View style={{ flex: 1, minWidth: 0, borderLeftWidth: 1, borderLeftColor: t.border, paddingLeft: anchoVentana < 600 ? 6 : 9 }}>
                              <View style={{ backgroundColor: t.cardBg, borderRadius: 13, padding: 11, borderWidth: 1, borderColor: t.border }}>
                              <Text style={{ color: t.primary, fontSize: 11, fontWeight: "800", marginBottom: 10, letterSpacing: 0.5 }}>🎸 INSTRUMENTOS</Text>
                              {[
                                { key: "piano", label: "Piano" },
                                { key: "guitarra", label: "Guitarra" },
                                { key: "bajo", label: "Bajo" },
                                { key: "bateria", label: "Batería" },
                              ].map((puesto) => {
                                const persona = serv.instrumentos?.[puesto.key];
                                const ocupado = persona && persona !== "Sin asignar";
                                return (
                                  <View key={puesto.key} style={{ marginBottom: 9 }}>
                                    <Text style={{ color: t.textSub, fontSize: 11, fontWeight: "bold", marginBottom: 3 }}>{puesto.label}</Text>
                                    {ocupado ? (
                                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 3 }}>
                                        <Text style={{ color: t.textMain, fontSize: 11, flex: 1 }}>• {persona}</Text>
                                        {esAdminOLider && (
                                          <TouchableOpacity onPress={() => retirarPostulacion(serv.id, puesto.key, persona)} style={{ backgroundColor: "#DC2626", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 }}>
                                            <Text style={{ color: "#FFFFFF", fontSize: 9, fontWeight: "bold" }}>Retirar</Text>
                                          </TouchableOpacity>
                                        )}
                                      </View>
                                    ) : (
                                      <Text style={{ color: "#16A34A", fontSize: 11 }}>✓ Disponible</Text>
                                    )}
                                  </View>
                                );
                              })}
                            </View>
                            </View>
                          </View>
                        </View>


                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 5, marginBottom: 9 }}>
                          <Text style={{ color: t.textMain, fontSize: 12, fontWeight: "800", letterSpacing: 0.5 }}>🎵 REPERTORIO DEL SERVICIO</Text>
                          <View style={{ backgroundColor: t.primary + "18", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 }}><Text style={{ color: t.primary, fontSize: 10, fontWeight: "800" }}>{serv.setlist?.length || 0} canciones</Text></View>
                        </View>
                        {serv.setlist && serv.setlist.length > 0 ? (
                          (serv.ordenBloquesSetlist === "rapida-lenta" ? ["rapida", "lenta"] : ["lenta", "rapida"]).map((tipo) => {
                            const cancionesTipo = serv.setlist.filter((s) => {
                              const tipoGuardado = (s.tipoSet || repertorio.find((c) => c.titulo?.toLowerCase() === (s.titulo || "").toLowerCase())?.tipoSet || "lenta").toLowerCase();
                              return tipoGuardado === tipo;
                            });
                            if (cancionesTipo.length === 0) return null;
                            return (
                              <View key={tipo} style={{ marginBottom: 8 }}>
                                <Text style={{ color: t.primary, fontSize: 11, fontWeight: "bold", marginBottom: 4 }}>
                                  {tipo === "lenta" ? "🕯️ LENTAS" : "⚡ RÁPIDAS"}
                                </Text>
                                {cancionesTipo.map((s, i) => (
                                  <View key={`${tipo}-${i}`} style={{ backgroundColor: t.bg, padding: 11, borderRadius: 12, borderWidth: 1, borderColor: t.border, marginBottom: 7, borderLeftWidth: 3, borderLeftColor: tipo === "lenta" ? "#8B5CF6" : "#F59E0B" }}>
                                    <Text style={{ color: t.textMain, fontSize: 11, fontWeight: "bold" }}>
                                      {i + 1}. {s.titulo} <Text style={{ color: t.textSub, fontWeight: "normal", fontSize: 10 }}>(Tono: {s.tono} | {s.bpm || "120"} BPM)</Text>
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            );
                          })
                        ) : (
                          <Text style={{ color: t.textSub, fontSize: 11, marginLeft: 6, fontStyle: "italic" }}>Sin canciones agregadas al setlist.</Text>
                        )}

                        {serv.setlist && serv.setlist.length > 0 && (
                          <TouchableOpacity
                            style={{ backgroundColor: "#2563EB", padding: 11, borderRadius: 10, alignItems: "center", marginTop: 8, marginBottom: 8 }}
                            onPress={() => {
                              const setlistPreparado = serv.setlist.map(c => {
                                const deBiblioteca = repertorio.find(r =>
                                  r.titulo && c.titulo &&
                                  r.titulo.toLowerCase() === c.titulo.toLowerCase()
                                ) || {};
                                return {
                                  ...c,
                                  bpm: c.bpm || deBiblioteca.bpm || "120",
                                  compas: c.compas || deBiblioteca.compas || "4/4",
                                  tono: c.tono || deBiblioteca.tono || "C"
                                };
                              });
                              setSetlistEnVivoActual(setlistPreparado);
                              setIndiceCancionEnVivo(0);
                               setSemitonosEnVivo(0);
                               setModoNashvilleEnVivo(false);
                              setModoEnVivoActivo(true);
                              setMetronomoActivo(false);
                              setAvanceAutomaticoActivo(false);
                            }}
                          >
                            <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 12 }}>▶️ Modo en vivo</Text>
                          </TouchableOpacity>
                        )}

                        <View style={{ marginTop: 8, gap: 6 }}>
                          <TouchableOpacity style={[styles.whatsappBtn, { padding: 11, borderRadius: 10 }]} onPress={() => enviarPorWhatsApp(serv)}>
                            <Text style={[styles.actionBtnText, { fontSize: 12 }]}>🚀 Enviar setlist por WhatsApp</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.postulateBtn, { padding: 11, borderRadius: 10 }]}
                            onPress={() => { setIdServicioPostulando(serv.id); setModalPostularVisible(true); }}
                          >
                            <Text style={[styles.actionBtnText, { fontSize: 12 }]}>Postularme (Confirmar asistencia)</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                      <Text style={{ color: t.textSub, textAlign: "center", padding: 10 }}>No hay servicios programados para este día en {sedeActual.nombre}.</Text>
                    </View>
                  )}
                </>
              )}

              {pestana === "ajustes" && (
                <View style={{ width: "100%" }}>
                  <View style={{ backgroundColor: t.banner, borderRadius: esMovil ? 19 : 25, padding: esMovil ? 18 : 26, marginBottom: 18 }}>
                    <Text style={{ color: "#DCDFFF", fontSize: 10, fontWeight: "900", letterSpacing: 1.5 }}>SOUNDTEAM · PREFERENCIAS</Text>
                    <Text style={{ color: "#FFFFFF", fontSize: esMovil ? 25 : 32, fontWeight: "900", marginTop: 8 }}>Ajustes</Text>
                    <Text style={{ color: "#E8EAFE", fontSize: 12, marginTop: 6 }}>Administra tu perfil y la apariencia de tu aplicación.</Text>
                  </View>
                  <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border, padding: esMovil ? 16 : 22 }]}>
                    <Text style={{ color: t.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.2, marginBottom: 14 }}>PERFIL DEL USUARIO</Text>
                    <View style={{ alignItems: "center", marginBottom: 18 }}>
                      {fotoPerfil ? <Image source={{ uri: fotoPerfil }} style={{ width: 104, height: 104, borderRadius: 52, borderWidth: 2, borderColor: t.primary }} /> : <View style={{ width: 104, height: 104, borderRadius: 52, backgroundColor: t.primary, alignItems: "center", justifyContent: "center" }}><Text style={{ color: "#FFFFFF", fontSize: 34, fontWeight: "900" }}>{(usuario || "U").split(" ").map(p => p[0]).join("").slice(0,2).toUpperCase()}</Text></View>}
                      <View style={{ flexDirection: "row", gap: 10, marginTop: 12, flexWrap: "wrap", justifyContent: "center" }}>
                        <TouchableOpacity onPress={seleccionarFotoPerfil} disabled={guardandoPerfil} style={{ backgroundColor: t.primary, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 10 }}><Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "800" }}>＋ Cambiar foto</Text></TouchableOpacity>
                        {!!fotoPerfil && <TouchableOpacity onPress={quitarFotoPerfil} disabled={guardandoPerfil} style={{ backgroundColor: t.bg, borderWidth: 1, borderColor: t.border, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 10 }}><Text style={{ color: t.textMain, fontSize: 11, fontWeight: "800" }}>Quitar foto</Text></TouchableOpacity>}
                      </View>
                    </View>
                    <Text style={[styles.inputLabel, { color: t.textMain }]}>Nombre de perfil</Text>
                    <TextInput value={nombrePerfilInput} onChangeText={setNombrePerfilInput} placeholder="Tu nombre" placeholderTextColor={t.textSub} style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain, borderRadius: 11, marginBottom: 12 }]} />
                    <TouchableOpacity onPress={() => guardarPerfilPersonal()} disabled={guardandoPerfil} style={{ backgroundColor: t.primary, borderRadius: 11, padding: 13, alignItems: "center", opacity: guardandoPerfil ? 0.6 : 1 }}><Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 12 }}>{guardandoPerfil ? "Guardando..." : "Guardar cambios"}</Text></TouchableOpacity>
                    <Text style={{ color: t.textSub, fontSize: 10, lineHeight: 16, marginTop: 10 }}>Este nombre solo cambia cómo aparece tu perfil. No modifica los nombres usados en la programación de servicios ni los datos de otros integrantes.</Text>
                  </View>
                  <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border, padding: esMovil ? 16 : 22 }]}>
                    <Text style={{ color: t.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.2, marginBottom: 5 }}>APARIENCIA</Text>
                    <Text style={{ color: t.textMain, fontSize: 17, fontWeight: "900", marginBottom: 5 }}>Tema de la aplicación</Text>
                    <Text style={{ color: t.textSub, fontSize: 11, marginBottom: 14 }}>Selecciona los colores que prefieras.</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      {Object.keys(TEMAS).map(keyTema => {
                        const activo = nombreTema === keyTema;
                        return <TouchableOpacity key={keyTema} onPress={() => setNombreTema(keyTema)} style={{ paddingVertical: 10, paddingHorizontal: 13, borderRadius: 11, backgroundColor: activo ? t.primary : t.bg, borderWidth: 1, borderColor: activo ? t.primary : t.border }}><Text style={{ color: activo ? "#FFFFFF" : t.textMain, fontSize: 11, fontWeight: activo ? "900" : "600" }}>{TEMAS[keyTema].nombre}</Text></TouchableOpacity>;
                      })}
                    </View>
                  </View>
                </View>
              )}

              {pestana === "equipo" && esAdminOLider && (
                <View style={{ width: "100%" }}>
                  <View style={{ backgroundColor: t.banner, borderRadius: esMovil ? 19 : 25, padding: esMovil ? 18 : 26, marginBottom: 16, overflow: "hidden", shadowColor: t.banner, shadowOpacity: 0.18, shadowRadius: 17, shadowOffset: { width: 0, height: 7 }, elevation: 3 }}>
                    <Text style={{ color: "#DCDFFF", fontSize: 10, fontWeight: "900", letterSpacing: 1.6 }}>SOUNDTEAM · ADMINISTRACIÓN</Text>
                    <Text style={{ color: "#FFFFFF", fontSize: esMovil ? 25 : 32, fontWeight: "900", marginTop: 8 }}>Tu equipo, en sintonía.</Text>
                    <Text style={{ color: "#E8EAFE", fontSize: 12, lineHeight: 19, marginTop: 7, maxWidth: 540 }}>Administra los integrantes, sus permisos musicales y el acceso a la sede {sedeActual.nombre}.</Text>
                    <View style={{ flexDirection: "row", gap: 9, marginTop: 18 }}>
                      <View style={{ flex: 1, backgroundColor: "#FFFFFF20", borderWidth: 1, borderColor: "#FFFFFF25", borderRadius: 13, padding: 12 }}><Text style={{ color: "#FFFFFF", fontSize: 23, fontWeight: "900" }}>{integrantesSeccionEquipo.length}</Text><Text style={{ color: "#E8EAFE", fontSize: 9, fontWeight: "800", letterSpacing: 0.6, marginTop: 3 }}>INTEGRANTES</Text></View>
                      <View style={{ flex: 1, backgroundColor: "#FFFFFF20", borderWidth: 1, borderColor: "#FFFFFF25", borderRadius: 13, padding: 12 }}><Text style={{ color: "#FFFFFF", fontSize: 23, fontWeight: "900" }}>{integrantesSeccionEquipo.filter(m => m.rolAcceso === "lider").length}</Text><Text style={{ color: "#E8EAFE", fontSize: 9, fontWeight: "800", letterSpacing: 0.6, marginTop: 3 }}>LÍDERES</Text></View>
                      <View style={{ flex: 1, backgroundColor: "#FFFFFF20", borderWidth: 1, borderColor: "#FFFFFF25", borderRadius: 13, padding: 12 }}><Text style={{ color: "#FFFFFF", fontSize: 23, fontWeight: "900" }}>{integrantesSeccionEquipo.filter(m => Array.isArray(m.rolesMusicales) && m.rolesMusicales.length > 0).length}</Text><Text style={{ color: "#E8EAFE", fontSize: 9, fontWeight: "800", letterSpacing: 0.6, marginTop: 3 }}>CON ROL MUSICAL</Text></View>
                    </View>
                  </View>
                  <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border, padding: esMovil ? 14 : 22 }]}>
                  <View style={{ flexDirection: esMovil ? "column" : "row", justifyContent: "space-between", alignItems: esMovil ? "stretch" : "center", gap: 12, marginBottom: 16 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: t.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1.4, marginBottom: 5 }}>PERSONAS Y PERMISOS</Text>
                      <Text style={[styles.cardTitle, { color: t.textMain, marginBottom: 0 }]}>Miembros de {sedeActual.nombre}</Text>
                      <Text style={{ color: t.textSub, fontSize: 11, marginTop: 4 }}>{integrantesSeccionEquipo.length} integrantes registrados en esta sede</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.programBtn, { backgroundColor: t.primary }]}
                      onPress={() => {
                        setIdMiembroEditando(null);
                        setNombreNuevoMiembro("");
                        setEmailNuevoMiembro("");
                        setRolAccesoNuevo("miembro");
                        setRolesMusicalesNuevo([]);
                        setModalMiembroVisible(true);
                      }}
                    >
                      <Text style={styles.programBtnText}>＋ Agregar integrante</Text>
                    </TouchableOpacity>
                  </View>


                  {modalMiembroVisible && (
                    <View style={[styles.card, { backgroundColor: t.bg, borderColor: t.primary, borderWidth: 1, borderRadius: 16, padding: 17, marginBottom: 16 }]}>
                      <Text style={[styles.cardTitle, { color: t.textMain, fontSize: 16 }]}>
                        {idMiembroEditando !== null ? "✏️ Modificar Miembro" : `➕ Nuevo Miembro`}
                      </Text>
                      <TextInput
                        style={[styles.loginInput, { backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain, borderRadius: 11, marginBottom: 10, minHeight: 46 }]}
                        placeholder="Nombre"
                        placeholderTextColor={t.textSub}
                        value={nombreNuevoMiembro}
                        onChangeText={setNombreNuevoMiembro}
                      />
                      <TextInput
                        style={[styles.loginInput, { backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain, borderRadius: 11, marginBottom: 10, minHeight: 46 }]}
                        placeholder="Correo electrónico"
                        placeholderTextColor={t.textSub}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={emailNuevoMiembro}
                        onChangeText={setEmailNuevoMiembro}
                      />
                      <Text style={[styles.inputLabel, { color: t.textMain, marginTop: 4 }]}>Permisos musicales</Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
                        {[
                          { key: "vozPrincipal", label: "🎤 Voz principal" },
                          { key: "coros", label: "👥 Coros" },
                          { key: "piano", label: "🎹 Piano" },
                          { key: "guitarra", label: "🎸 Guitarra" },
                          { key: "bajo", label: "🎸 Bajo" },
                          { key: "bateria", label: "🥁 Batería" },
                        ].map((op) => {
                          const activo = rolesMusicalesNuevo.includes(op.key);
                          return (
                            <TouchableOpacity
                              key={op.key}
                              onPress={() => setRolesMusicalesNuevo(actual => activo ? actual.filter(r => r !== op.key) : [...actual, op.key])}
                              style={{ paddingHorizontal: 12, paddingVertical: 10, minHeight: 40, justifyContent: "center", borderRadius: 10, borderWidth: 1, borderColor: activo ? t.primary : t.border, backgroundColor: activo ? t.primary : t.cardBg }}
                            >
                              <Text style={{ color: activo ? "#FFFFFF" : t.textMain, fontSize: 11, fontWeight: "bold" }}>{op.label} {activo ? "✓" : "+"}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                      {esAdmin && (
                        <>
                          <Text style={[styles.inputLabel, { color: t.textMain }]}>Nivel de acceso</Text>
                          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
                            {[
                              { key: "miembro", label: "Miembro" },
                              { key: "lider", label: "Líder" },
                            ].map(op => (
                              <TouchableOpacity
                                key={op.key}
                                onPress={() => setRolAccesoNuevo(op.key)}
                                style={{ flex: 1, padding: 11, minHeight: 44, justifyContent: "center", borderRadius: 10, borderWidth: 1, borderColor: rolAccesoNuevo === op.key ? t.primary : t.border, backgroundColor: rolAccesoNuevo === op.key ? t.primary : t.cardBg }}
                              >
                                <Text style={{ color: rolAccesoNuevo === op.key ? "#FFFFFF" : t.textMain, textAlign: "center", fontWeight: "bold" }}>{op.label}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </>
                      )}
                      <Text style={{ color: t.textSub, fontSize: 11, lineHeight: 17, marginBottom: 10 }}>
                        Para iniciar sesión, la cuenta debe existir también en Supabase → Authentication → Users con este mismo correo.
                      </Text>
                      <TouchableOpacity
                        style={[styles.loginButton, { backgroundColor: t.primary, padding: 10, marginTop: 6 }]}
                        onPress={async () => {
                          if (nombreNuevoMiembro.trim() !== "") {
                            const correoMiembro = emailNuevoMiembro.trim().toLowerCase();
                            if (!correoMiembro) { alert("Ingresa el correo que usará para iniciar sesión."); return; }
                            const integranteObj = {
                              nombre: nombreNuevoMiembro.trim(),
                              email: correoMiembro,
                              sede_id: sedeIdSeleccionada,
                              rol_acceso: esAdmin
                                ? rolAccesoNuevo
                                : (idMiembroEditando !== null
                                  ? (integrantes.find(m => m.id === idMiembroEditando)?.rolAcceso || "miembro")
                                  : "miembro"),
                              roles_musicales: rolesMusicalesNuevo,
                            };
                            if (idMiembroEditando !== null) {
                              const { error } = await supabase.from("integrantes").update(integranteObj).eq("id", idMiembroEditando).eq("sede_id", sedeIdSeleccionada);
                              if (error) { alert(`No se pudo actualizar el integrante: ${error.message}`); return; }
                            } else {
                              const { error } = await supabase.from("integrantes").insert([integranteObj]);
                              if (error) { alert(`No se pudo crear el perfil: ${error.message}`); return; }
                            }
                            await sincronizarDatosApp();
                            setModalMiembroVisible(false);
                            setIdMiembroEditando(null);
                          } else { alert("⚠️ Ingresa el nombre."); }
                        }}
                      >
                        <Text style={styles.loginButtonText}>Guardar</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {integrantesSeccionEquipo.map((int) => (
                    <View key={int.id} style={[styles.memberCard, { backgroundColor: t.cardBg, borderColor: t.border, borderRadius: 16, padding: esMovil ? 13 : 17, marginBottom: 10, borderWidth: 1 }]}>
                      <View style={styles.memberHeaderRow}>
                        <View style={{ flex: 1, minWidth: 0, paddingRight: 8 }}><Text numberOfLines={2} style={[styles.memberTitle, { color: t.textMain, fontSize: 14, fontWeight: "900" }]}>{int.nombre}</Text><Text style={{ color: t.textSub, fontSize: 10, marginTop: 3 }}>{int.rolAcceso === "lider" ? "LÍDER DE SEDE" : int.rolAcceso === "admin" ? "ADMINISTRADOR" : "INTEGRANTE"}</Text></View>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 6 }}>
                          {esAdminOLider && int.userId && int.userId !== usuarioId && String(int.email || "").trim().toLowerCase() !== "johnbocal31@gmail.com" && (
                            <TouchableOpacity
                              disabled={generandoClaveTemporalId === int.id}
                              style={{ backgroundColor: "#2563EB", opacity: generandoClaveTemporalId === int.id ? 0.6 : 1, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 9, minHeight: 34, justifyContent: "center" }}
                              onPress={() => generarClaveTemporal(int)}
                            >
                              <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "bold" }}>{generandoClaveTemporalId === int.id ? "Generando..." : "🔑 Clave temporal"}</Text>
                            </TouchableOpacity>
                          )}
                          {(int.rolAcceso !== "admin" && (esAdmin || int.rolAcceso === "miembro")) && (
                            <TouchableOpacity
                              style={{ backgroundColor: t.primary, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 9, minHeight: 34, justifyContent: "center" }}
                              onPress={() => {
                                setIdMiembroEditando(int.id);
                                setNombreNuevoMiembro(int.nombre || "");
                                setEmailNuevoMiembro(int.email || "");
                                setRolAccesoNuevo(int.rolAcceso === "lider" ? "lider" : "miembro");
                                setRolesMusicalesNuevo(Array.isArray(int.rolesMusicales) ? int.rolesMusicales : []);
                                setModalMiembroVisible(true);
                              }}
                            >
                              <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "bold" }}>✏️ Editar</Text>
                            </TouchableOpacity>
                          )}
                          {String(int.email || "").trim().toLowerCase() !== "johnbocal31@gmail.com" && (esAdmin || int.rolAcceso === "miembro") && (
<TouchableOpacity
                          style={{ backgroundColor: "#EF4444", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 9, minHeight: 34, justifyContent: "center" }}
                          onPress={async () => {
                            const { error } = await supabase.from("integrantes").delete().eq("id", int.id);
                            if (error) { alert(`No se pudo eliminar el integrante: ${error.message}`); return; }
                            await sincronizarDatosApp();
                          }}
                        >
                          <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "bold" }}>🗑️ Eliminar</Text>
                          </TouchableOpacity>
                          )}
                        </View>
                      </View>
                      {esAdminOLider && <Text style={{ color: t.textSub, fontSize: 11, marginTop: 9, lineHeight: 17 }}>{int.email || "Correo no registrado"}</Text>}
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 9 }}>
                        {(Array.isArray(int.rolesMusicales) ? int.rolesMusicales : []).length > 0 ? (Array.isArray(int.rolesMusicales) ? int.rolesMusicales : []).map(rol => {
                          const nombres = { vozPrincipal: "Voz principal", coros: "Coros", piano: "Piano", guitarra: "Guitarra", bajo: "Bajo", bateria: "Batería" };
                          return <View key={rol} style={{ backgroundColor: t.primary + "16", borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5 }}><Text style={{ color: t.primary, fontSize: 9, fontWeight: "800" }}>{nombres[rol] || rol}</Text></View>;
                        }) : <Text style={{ color: t.textSub, fontSize: 10, fontStyle: "italic" }}>Sin permisos musicales asignados</Text>}
                      </View>
                    </View>
                  ))}
                </View>
                </View>
              )}

              {pestana === "repertorio" && (
                <>
                  {cancionSeleccionadaDetalle !== null ? (
                    <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                      <TouchableOpacity
                        style={{ backgroundColor: t.bg, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: t.border, marginBottom: 16, alignSelf: "flex-start" }}
                        onPress={() => { setSemitonos(0); setModoNashville(false); setSeccionCancionActiva(0); setCancionSeleccionadaDetalle(null); }}
                      >
                        <Text style={{ color: t.textMain, fontSize: 12, fontWeight: "bold" }}>← Volver al repertorio</Text>
                      </TouchableOpacity>
                      {puedeGestionarRepertorio && (
                        <TouchableOpacity
                          style={{ backgroundColor: t.primary, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 10, marginBottom: 12, alignSelf: "flex-start" }}
                          onPress={() => {
                            const c = cancionSeleccionadaDetalle;
                            setNuevoTituloCancion(c.titulo || "");
                            setNuevoArtistaCancion(c.artista || "");
                            setNuevoTonoCancion(c.tono || "C");
                            setNuevoBpmCancion(String(c.bpm || "120"));
                            setNuevoCompasCancion(c.compas || "4/4");
                            setNuevoTipoSetCancion(c.tipoSet || c.tipo_set || "lenta");
                            const partes = [];
                            const patron = /^\[(INTRO(?:DUCCIÓN)?|V\s*\d+|ESTROFA(?:\s*\d+)?|VERSO(?:\s*\d+)?|CORO(?:\s*\d+)?|ESTRIBILLO|PRE[- ]?CORO|POST[- ]?CORO|PUENTE(?:\s*\d+)?|INTERLUDIO|INSTRUMENTAL|FINAL|OUTRO|CODA|VUELTA|VAMP|BREAKDOWN|TAG)\]\s*$/i;
                            const lineasLetra = (c.letra || "").split("\n");
                            let parte = { titulo: "ESTROFA 1", letra: [] };
                            lineasLetra.forEach(linea => { const m = linea.match(patron); if (m) { if (parte.letra.length || partes.length) partes.push(parte); parte = { titulo: m[1].toUpperCase(), letra: [] }; } else parte.letra.push(linea); });
                            if (parte.letra.length || !partes.length) partes.push(parte);
                            setSeccionesEditorCancion(partes.map((p, i) => ({ id: siguienteIdSeccion.current++, titulo: p.titulo || `ESTROFA ${i+1}`, letra: p.letra.join("\n").trim() })));
                            setNuevaLetraCancion(c.letra || "");
                            setEtiquetasActuales(c.etiquetas || []);
                            setIdCancionEditando(c.id);
                            setModoEdicionCancion(true);
                            setMostrarFormularioCancion(true);
                            setCancionSeleccionadaDetalle(null);
                          }}
                        >
                          <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 12 }}>✏️ Editar canción</Text>
                        </TouchableOpacity>
                      )}
                      {puedeGestionarRepertorio && (
                        <TouchableOpacity
                          style={{ backgroundColor: "#B91C1C", paddingHorizontal: 14, paddingVertical: 11, borderRadius: 10, marginBottom: 12, alignSelf: "flex-start" }}
                          onPress={() => eliminarCancionRepertorio(cancionSeleccionadaDetalle.id)}
                        >
                          <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 12 }}>🗑️ Eliminar canción</Text>
                        </TouchableOpacity>
                      )}
                      <Text style={{ fontSize: 22, fontWeight: "bold", color: t.textMain, marginBottom: 4 }}>{cancionSeleccionadaDetalle.titulo}</Text>
                      <Text style={{ color: t.textSub, fontSize: 13, marginBottom: 12 }}>{cancionSeleccionadaDetalle.artista} • Tono: {transponerTono(cancionSeleccionadaDetalle.tono, semitonos)}</Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
                        <TouchableOpacity onPress={() => setSemitonos(v => v - 1)} style={{ backgroundColor: t.bg, padding: 9, borderRadius: 6, borderWidth: 1, borderColor: t.border, marginRight: 8, marginBottom: 8 }}>
                          <Text style={{ color: t.textMain, fontWeight: "bold" }}>− Tono</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSemitonos(v => v + 1)} style={{ backgroundColor: t.bg, padding: 9, borderRadius: 6, borderWidth: 1, borderColor: t.border, marginRight: 8, marginBottom: 8 }}>
                          <Text style={{ color: t.textMain, fontWeight: "bold" }}>+ Tono</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModoNashville(v => !v)} style={{ backgroundColor: t.bg, padding: 9, borderRadius: 6, borderWidth: 1, borderColor: t.border, marginRight: 8, marginBottom: 8 }}>
                          <Text style={{ color: t.textMain, fontWeight: "bold" }}>{modoNashville ? "Ver acordes" : "Nashville"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setSemitonos(0); setModoNashville(false); }} style={{ backgroundColor: t.bg, padding: 9, borderRadius: 6, borderWidth: 1, borderColor: t.border, marginBottom: 8 }}>
                          <Text style={{ color: t.textMain, fontWeight: "bold" }}>Original</Text>
                        </TouchableOpacity>
                      </View>
                      {(() => {
                        const letraVista = modoNashville
                          ? convertirANashville(transponerLetra(cancionSeleccionadaDetalle.letra || "", semitonos), transponerTono(cancionSeleccionadaDetalle.tono, semitonos))
                          : transponerLetra(cancionSeleccionadaDetalle.letra || "", semitonos);
                        const lineas = letraVista.split("\n");
                        const secciones = [];
                        let actual = { titulo: "Canción completa", lineas: [] };
                        const encabezado = /^\s*\[(INTRO(?:DUCCIÓN)?|V\s*\d+|ESTROFA(?:\s*\d+)?|VERSO(?:\s*\d+)?|CORO(?:\s*\d+)?|ESTRIBILLO|PRE[- ]?CORO|POST[- ]?CORO|PUENTE(?:\s*\d+)?|INTERLUDIO|INSTRUMENTAL|FINAL|OUTRO|CODA|VUELTA|VAMP|BREAKDOWN|TAG)\]\s*$/i;
                        lineas.forEach(linea => { const match = linea.match(encabezado); if (match) { if (actual.lineas.length) secciones.push(actual); actual = { titulo: match[1].replace(/\s+/g, " ").toUpperCase(), lineas: [] }; } else actual.lineas.push(linea); });
                        if (actual.lineas.length || secciones.length === 0) secciones.push(actual);
                        const abreviatura = (titulo, i) => {
                          const t = titulo.toUpperCase();
                          if (/^(ESTROFA|VERSO|V)\s*(\d+)?$/.test(t)) return `V${(t.match(/\d+/) || [i+1])[0]}`;
                          if (/CORO|ESTRIBILLO/.test(t)) return "C";
                          if (/PRE/.test(t)) return "PC";
                          if (/POST/.test(t)) return "PoC";
                          if (/PUENTE/.test(t)) return "P";
                          if (/INTRO/.test(t)) return "IN";
                          if (/INTERLUDIO/.test(t)) return "INT";
                          if (/INSTRUMENTAL/.test(t)) return "I";
                          if (/OUTRO/.test(t)) return "O";
                          if (/FINAL/.test(t)) return "F";
                          if (/CODA/.test(t)) return "T";
                          if (/VUELTA/.test(t)) return "Vu";
                          if (/VAMP/.test(t)) return "Va";
                          if (/BREAKDOWN/.test(t)) return "BD";
                          return t.slice(0, 3);
                        };
                        return <>
                          {secciones.length > 1 && <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ gap: 7, paddingVertical: 3 }}>
                            {secciones.map((s, i) => <TouchableOpacity key={i} onPress={() => scrollLetraRef.current?.scrollTo({ y: posicionesSeccionesRef.current[i] || 0, animated: true })} style={{ backgroundColor: i === seccionCancionActiva ? t.primary : t.cardBg, borderColor: i === seccionCancionActiva ? t.primary : t.border, borderWidth: 1, borderRadius: 22, paddingHorizontal: 12, paddingVertical: 8 }}>
                              <Text style={{ color: i === seccionCancionActiva ? "#FFFFFF" : t.textMain, fontSize: 12, fontWeight: "900" }}>{abreviatura(s.titulo, i)}</Text>
                            </TouchableOpacity>)}
                          </ScrollView>}
                          <ScrollView ref={scrollLetraRef} nestedScrollEnabled showsVerticalScrollIndicator style={{ maxHeight: 620, backgroundColor: t.bg, borderRadius: 12, borderWidth: 1, borderColor: t.border }} onScroll={e => { const y = e.nativeEvent.contentOffset.y; let active = 0; secciones.forEach((_, i) => { if ((posicionesSeccionesRef.current[i] || 0) <= y + 35) active = i; }); if (active !== seccionCancionActiva) setSeccionCancionActiva(active); }} scrollEventThrottle={100}>
                            {secciones.map((s, index) => <View key={index} onLayout={e => { posicionesSeccionesRef.current[index] = e.nativeEvent.layout.y; }}>
                              <View style={{ flexDirection: "row", alignItems: "center", alignSelf: "flex-start", backgroundColor: index === 0 ? "#A5E9FA" : /CORO|ESTRIBILLO/.test(s.titulo) ? "#FFC3AE" : t.primary, borderRadius: 22, paddingHorizontal: 10, paddingVertical: 5, marginTop: index === 0 ? 8 : 14, marginBottom: 8, marginLeft: 12 }}>
                                <View style={{ width: 25, height: 25, borderRadius: 14, backgroundColor: "#17191D", alignItems: "center", justifyContent: "center", marginRight: 7 }}><Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "900" }}>{abreviatura(s.titulo, index)}</Text></View>
                                <Text style={{ color: "#15171B", fontSize: 12, fontWeight: "900" }}>{s.titulo}</Text>
                              </View>
                              <View style={{ paddingHorizontal: 13, paddingBottom: 10 }}>
                                {s.lineas.map((linea, i) => { const acordes = [...linea.matchAll(/\[([^\]]+)\]/g)].map(m => m[1]); const texto = linea.replace(/\[([^\]]+)\]/g, "").trim(); if (!linea.trim()) return <View key={i} style={{ height: 9 }} />; return <View key={i} style={{ marginBottom: 7 }}>{acordes.length > 0 && <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 18, marginLeft: 4, marginBottom: 1 }}>{acordes.map((acorde, j) => <Text key={j} style={{ color: t.primary, fontSize: 15, fontWeight: "900", minWidth: 22 }}>{acorde}</Text>)}</View>}{!!texto && <Text style={{ color: t.textMain, fontSize: 16, lineHeight: 25 }}>{texto}</Text>}</View>; })}
                              </View>
                            </View>)}
                          </ScrollView>
                        </>;
                      })()}
                    </View>
                  ) : (
                    <>
                    {puedeGestionarRepertorio && (
                      <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border, marginBottom: 12, borderWidth: 1, borderRadius: 16, padding: 17 }]}>
                        <TouchableOpacity onPress={() => { setMostrarFormularioCancion(v => !v); if (mostrarFormularioCancion) { setModoEdicionCancion(false); setIdCancionEditando(null); } }} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: mostrarFormularioCancion ? 14 : 0, paddingVertical: 4 }}>
                          <Text style={[styles.cardTitle, { color: t.textMain, fontSize: 16 }]}>{modoEdicionCancion ? "✏️ Editar canción" : "＋ Agregar nueva canción"}</Text>
                          <Text style={{ color: t.primary, fontSize: 18, fontWeight: "900" }}>{mostrarFormularioCancion ? "−" : "+"}</Text>
                        </TouchableOpacity>
                        {mostrarFormularioCancion && <>
                        <TextInput style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain, marginBottom: 10, borderRadius: 11, minHeight: 46, paddingHorizontal: 13 }]} placeholder="Título de la canción" placeholderTextColor={t.textSub} value={nuevoTituloCancion} onChangeText={setNuevoTituloCancion} />
                        <TextInput style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain, marginBottom: 10, borderRadius: 11, minHeight: 46, paddingHorizontal: 13 }]} placeholder="Artista o autor" placeholderTextColor={t.textSub} value={nuevoArtistaCancion} onChangeText={setNuevoArtistaCancion} />
                        <View style={{ flexDirection: esMovil ? "column" : "row", gap: 8, width: "100%" }}>
                          <TextInput style={[styles.loginInput, { flex: 1, width: esMovil ? "100%" : undefined, backgroundColor: t.bg, borderColor: t.border, color: t.textMain, marginBottom: 10, borderRadius: 11, minHeight: 44, paddingHorizontal: 13 }]} placeholder="Tono (C, G...)" placeholderTextColor={t.textSub} value={nuevoTonoCancion} onChangeText={setNuevoTonoCancion} />
                          <TextInput style={[styles.loginInput, { flex: 1, width: esMovil ? "100%" : undefined, backgroundColor: t.bg, borderColor: t.border, color: t.textMain, marginBottom: 10, borderRadius: 11, minHeight: 44, paddingHorizontal: 13 }]} placeholder="BPM" placeholderTextColor={t.textSub} keyboardType="numeric" value={nuevoBpmCancion} onChangeText={setNuevoBpmCancion} />
                        </View>
                         <Text style={[styles.inputLabel, { color: t.textMain }]}>Compás</Text>
                         <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
                           {["2/4", "3/4", "4/4", "6/8"].map(compas => (
                             <TouchableOpacity
                               key={compas}
                               onPress={() => setNuevoCompasCancion(compas)}
                               style={{ flex: 1, padding: 10, borderRadius: 9, borderWidth: 1, borderColor: nuevoCompasCancion === compas ? t.primary : t.border, backgroundColor: nuevoCompasCancion === compas ? t.primary : t.bg }}
                             >
                               <Text style={{ color: nuevoCompasCancion === compas ? "#FFF" : t.textMain, textAlign: "center", fontWeight: "bold" }}>{compas}</Text>
                             </TouchableOpacity>
                           ))}
                         </View>
                        <Text style={[styles.inputLabel, { color: t.textMain }]}>Tipo de set</Text>
                        <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
                          {[{key:"lenta",label:"🕯️ Lentas"},{key:"rapida",label:"⚡ Rápidas"}].map(op => (
                            <TouchableOpacity key={op.key} onPress={() => setNuevoTipoSetCancion(op.key)} style={{ flex: 1, padding: 12, borderRadius: 10, minHeight: 44, borderWidth: 1, borderColor: nuevoTipoSetCancion === op.key ? t.primary : t.border, backgroundColor: nuevoTipoSetCancion === op.key ? t.primary : t.bg }}>
                              <Text style={{ color: nuevoTipoSetCancion === op.key ? "#FFF" : t.textMain, textAlign: "center", fontWeight: "bold" }}>{op.label}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                        <View style={{ marginTop: 8, marginBottom: 12 }}>
                          <Text style={[styles.inputLabel, { color: t.textMain, marginBottom: 8 }]}>Estructura de la canción · agrega y ordena sus secciones</Text>
                          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
                            {["ESTROFA","CORO","PUENTE","INTRO","OUTRO","FINAL","INSTRUMENTAL","INTERLUDIO","CODA","VUELTA","VAMP","ESTRIBILLO","PRE-CORO","POST-CORO","BREAKDOWN"].map(tipo => (
                              <TouchableOpacity key={tipo} onPress={() => { const n = seccionesEditorCancion.filter(s => s.titulo.toUpperCase().startsWith(tipo)).length + 1; const titulo = tipo === "ESTROFA" ? `ESTROFA ${n}` : n > 1 ? `${tipo} ${n}` : tipo; setSeccionesEditorCancion(prev => [...prev, { id: siguienteIdSeccion.current++, titulo, letra: "" }]); }} style={{ backgroundColor: t.bg, borderColor: t.border, borderWidth: 1, borderRadius: 18, paddingHorizontal: 11, paddingVertical: 8 }}>
                                <Text style={{ color: t.textMain, fontSize: 11, fontWeight: "800" }}>＋ {tipo}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          {seccionesEditorCancion.map((seccion, index) => (
                            <View key={seccion.id} style={{ backgroundColor: t.bg, borderColor: t.border, borderWidth: 1, borderRadius: 12, padding: 11, marginBottom: 9 }}>
                              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                                <TextInput value={seccion.titulo} onChangeText={v => setSeccionesEditorCancion(prev => prev.map(s => s.id === seccion.id ? { ...s, titulo: v } : s))} placeholder="Nombre de sección" placeholderTextColor={t.textSub} style={{ flex: 1, color: t.textMain, fontWeight: "900", borderBottomWidth: 1, borderBottomColor: t.border, paddingVertical: 6 }} />
                                <TouchableOpacity disabled={index === 0} onPress={() => setSeccionesEditorCancion(prev => { const next = [...prev]; [next[index-1], next[index]] = [next[index], next[index-1]]; return next; })} style={{ padding: 7, opacity: index === 0 ? 0.3 : 1 }}><Text style={{ color: t.textMain, fontWeight: "900" }}>↑</Text></TouchableOpacity>
                                <TouchableOpacity disabled={index === seccionesEditorCancion.length-1} onPress={() => setSeccionesEditorCancion(prev => { const next = [...prev]; [next[index+1], next[index]] = [next[index], next[index+1]]; return next; })} style={{ padding: 7, opacity: index === seccionesEditorCancion.length-1 ? 0.3 : 1 }}><Text style={{ color: t.textMain, fontWeight: "900" }}>↓</Text></TouchableOpacity>
                                <TouchableOpacity disabled={seccionesEditorCancion.length === 1} onPress={() => setSeccionesEditorCancion(prev => prev.filter(s => s.id !== seccion.id))} style={{ padding: 7, opacity: seccionesEditorCancion.length === 1 ? 0.3 : 1 }}><Text style={{ color: "#F87171", fontWeight: "900" }}>✕</Text></TouchableOpacity>
                              </View>
                              <TextInput style={{ color: t.textMain, minHeight: 105, textAlignVertical: "top", padding: 10, borderRadius: 9, backgroundColor: t.cardBg }} placeholder="Escribe la letra y coloca los acordes así: [C] [G] [Am]..." placeholderTextColor={t.textSub} multiline value={seccion.letra} onChangeText={v => setSeccionesEditorCancion(prev => prev.map(s => s.id === seccion.id ? { ...s, letra: v } : s))} />
                            </View>
                          ))}
                        </View>
                        <TouchableOpacity style={[styles.loginButton, { backgroundColor: t.primary }]} onPress={guardarOActualizarCancion}>
                          <Text style={styles.loginButtonText}>{modoEdicionCancion ? "Guardar cambios" : "Guardar en repertorio"}</Text>
                        </TouchableOpacity>
                        </>}
                      </View>
                    )}
                    <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border, padding: esMovil ? 13 : 19 }]}>
                      <View style={{ marginBottom: 15 }}>
                        <Text style={{ color: t.textMain, fontSize: 20, fontWeight: "900", marginBottom: 4 }}>Biblioteca musical</Text>
                        <Text style={{ color: t.textSub, fontSize: 12 }}>Canciones de {sedeActual.nombre} · {repertorio.length} en total</Text>
                      </View>
                      <TextInput value={busquedaRepertorio} onChangeText={setBusquedaRepertorio} placeholder="Buscar canción o artista..." placeholderTextColor={t.textSub} style={{ backgroundColor: t.bg, borderColor: t.border, borderWidth: 1, borderRadius: 12, minHeight: 46, paddingHorizontal: 14, color: t.textMain, marginBottom: 12 }} />
                      <View style={{ flexDirection: "row", gap: 8, marginBottom: 15 }}>
                        {[{ key: "todos", label: "Todas" }, { key: "lenta", label: "🕯️ Lentas" }, { key: "rapida", label: "⚡ Rápidas" }].map(op => (
                          <TouchableOpacity key={op.key} onPress={() => setFiltroTipoRepertorio(op.key)} style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 5, borderRadius: 10, borderWidth: 1, borderColor: filtroTipoRepertorio === op.key ? t.primary : t.border, backgroundColor: filtroTipoRepertorio === op.key ? t.primary : t.bg }}>
                            <Text style={{ color: filtroTipoRepertorio === op.key ? "#FFFFFF" : t.textMain, textAlign: "center", fontWeight: "800", fontSize: 11 }}>{op.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
                        {NOTAS_CROMATICAS.map(nota => {
                          const cantidad = repertorio.filter(c => String(c.tono || "C").trim().toUpperCase() === nota).length;
                          return <TouchableOpacity key={nota} onPress={() => setNotasRepertorioAbiertas(actual => ({ ...actual, [nota]: !actual[nota] }))} style={{ paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, backgroundColor: notasRepertorioAbiertas[nota] ? t.primary : t.bg, borderWidth: 1, borderColor: notasRepertorioAbiertas[nota] ? t.primary : t.border }}>
                            <Text style={{ color: notasRepertorioAbiertas[nota] ? "#FFFFFF" : t.textMain, fontSize: 11, fontWeight: "800" }}>{nota} · {cantidad}</Text>
                          </TouchableOpacity>;
                        })}
                      </View>
                      {[...NOTAS_CROMATICAS, "Otros"].map((nota) => {
                         const cancionesNota = repertorio.filter((c) => {
                           const textoBusqueda = busquedaRepertorio.trim().toLowerCase();
                           const coincideTexto = !textoBusqueda || String(c.titulo || "").toLowerCase().includes(textoBusqueda) || String(c.artista || "").toLowerCase().includes(textoBusqueda);
                           const tipo = String(c.tipoSet || c.tipo_set || "lenta").toLowerCase();
                           const coincideTipo = filtroTipoRepertorio === "todos" || tipo === filtroTipoRepertorio;
                           if (!coincideTexto || !coincideTipo) return false;
                           const tono = String(c.tono || "C").trim().toUpperCase();
                           return nota === "Otros" ? !NOTAS_CROMATICAS.includes(tono) : tono === nota;
                         });
                         if (!cancionesNota.length) return null;
                         const abierta = !!busquedaRepertorio.trim() || !!notasRepertorioAbiertas[nota];
                         return (
                           <View key={nota} style={{ marginBottom: 8 }}>
                             <TouchableOpacity
                               onPress={() => setNotasRepertorioAbiertas(actual => ({ ...actual, [nota]: !actual[nota] }))}
                               style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 9, backgroundColor: t.bg, borderWidth: 1, borderColor: t.border }}
                             >
                               <Text style={{ color: t.textMain, fontWeight: "bold", fontSize: 13 }}>{nota} ({cancionesNota.length})</Text>
                               <Text style={{ color: t.primary, fontWeight: "bold" }}>{abierta ? "▲" : "▼"}</Text>
                             </TouchableOpacity>
                             {abierta && (
                               <View style={{ marginTop: 7 }}>
                                 {cancionesNota.map((c) => (
                        <TouchableOpacity
                          key={c.id}
                          style={[styles.repertorioItemRowPro, { borderBottomColor: t.border, backgroundColor: t.bg, borderRadius: 12, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: t.border }]}
                          onPress={() => { setSemitonos(0); setModoNashville(false); setSeccionCancionActiva(0); setCancionSeleccionadaDetalle(c); }}
                        >
                          <View style={{ flex: 1, paddingVertical: 6, paddingRight: 10 }}>
                            <Text style={{ color: t.textMain, fontSize: 15, fontWeight: "bold", marginBottom: 4 }}>{c.titulo}</Text>
                            <Text style={{ color: t.textSub, fontSize: 12 }}>{c.artista || "Sin artista"}</Text>
                            <Text style={{ color: t.textSub, fontSize: 10, marginTop: 5 }}>
                              {c.bpm || "120"} BPM · Compás {c.compas || "4/4"} · {(c.tipoSet || c.tipo_set || "lenta").toLowerCase() === "rapida" ? "Rápida" : "Lenta"}
                            </Text>
                          </View>
                          <View style={{ alignItems: "center", gap: 4 }}>
                            <View style={{ backgroundColor: t.primary, width: 40, height: 40, borderRadius: 11, justifyContent: "center", alignItems: "center" }}>
                              <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 13 }}>{c.tono || "C"}</Text>
                            </View>
                            <Text style={{ color: t.textSub, fontSize: 9, fontWeight: "700" }}>TONO</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                               </View>
                             )}
                           </View>
                         );
                       })}
                    </View>
                    </>
                  )}
                </>
              )}
            </View>
          </ScrollView>

          {!esEscritorio && (
          <View style={[styles.tabBar, esMovil && styles.tabBarMobile, esTablet && styles.tabBarTablet, { backgroundColor: t.cardBg, borderTopColor: t.border }]}>
            {[
              { key: "inicio", label: "🏠 Inicio" },
              { key: "chat", label: "💬 Chat" },
              { key: "eventos", label: "📅 Eventos" },
              { key: "repertorio", label: "🎵 Repertorio" },
              { key: "ajustes", label: "⚙ Ajustes" },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabItem, (esMovil || esTablet) && styles.tabItemCompact, pestana === tab.key && { backgroundColor: t.bg, borderRadius: 12, marginHorizontal: 2, marginVertical: 3 }]}
                onPress={() => { setPestana(tab.key); setCancionSeleccionadaDetalle(null); if (tab.key === "chat") setMostrarDetalleChatMovil(false); }}
              >
                <Text style={[styles.tabText, (esMovil || esTablet) && styles.tabTextCompact, { color: t.textSub }, pestana === tab.key && { color: t.textMain, fontWeight: "bold" }]} numberOfLines={1}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          )}
          </View>
        </View>
      )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", height: "100%", minHeight: "100vh" },
  loginContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, width: "100%", minHeight: "100vh", backgroundColor: "#070B19" },
  loginCard: { width: "100%", maxWidth: 480, padding: 36, borderRadius: 30, borderWidth: 1, shadowColor: "#7867FF", shadowOpacity: 0.34, shadowRadius: 46, shadowOffset: { width: 0, height: 18 }, elevation: 16 },
  loginTitle: { fontSize: 38, fontWeight: "900", textAlign: "center", marginBottom: 10, letterSpacing: 1.5 },
  loginSubtitle: { fontSize: 14, textAlign: "center", marginBottom: 26, lineHeight: 22 },
  loginInput: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, marginBottom: 14, fontSize: 15, minHeight: 54, shadowColor: "#4F6BFF", shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  loginButton: { paddingVertical: 16, paddingHorizontal: 22, borderRadius: 15, alignItems: "center", minHeight: 54, justifyContent: "center", shadowColor: "#7567FF", shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 6 },
  loginButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 18, borderBottomWidth: 1, width: "100%" },
  headerMobile: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10 },
  headerTablet: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 13 },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 },
  headerTitle: { fontSize: 23, fontWeight: "900", letterSpacing: 0.2 },
  headerSubtitle: { fontSize: 12, marginTop: 5 },
  headerActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  logoutBtn: { backgroundColor: "#DC2626", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 9, minHeight: 34, justifyContent: "center" },
  logoutBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
  content: { flex: 1, padding: 26, width: "100%" },
  contentMobile: { padding: 12 },
  contentTablet: { padding: 20 },
  mainWrapper: { width: "100%", maxWidth: 1440, alignSelf: "center" },
  mainWrapperMobile: { maxWidth: 560 },
  mainWrapperTablet: { maxWidth: 1040 },
  card: { padding: 22, borderRadius: 20, borderWidth: 1, marginBottom: 20, width: "100%", shadowColor: "#18213B", shadowOpacity: 0.06, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 2 },
  cardTitle: { fontSize: 19, fontWeight: "900", marginBottom: 16, letterSpacing: 0.1 },
  welcomeBanner: { padding: 26, borderRadius: 24, marginBottom: 20, width: "100%", shadowColor: "#000000", shadowOpacity: 0.2, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  welcomeTitle: { color: "#FFFFFF", fontSize: 19, fontWeight: "bold", marginBottom: 8 },
  welcomeBannerText: { color: "#E2E8F0", fontSize: 14, fontStyle: "italic" },
  inputLabel: { fontSize: 12, marginBottom: 6, fontWeight: "600" },
  monthsRow: { flexDirection: "row", gap: 6, marginBottom: 8, width: "100%" },
  monthTab: { flex: 1, paddingVertical: 9, paddingHorizontal: 3, alignItems: "center", borderRadius: 10, borderWidth: 1, minHeight: 38, justifyContent: "center" },
  monthText: { fontSize: 12, fontWeight: "600" },
  monthTextActive: { color: "#FFFFFF", fontWeight: "bold" },
  
  calendarCard: { padding: 20, borderRadius: 22, borderWidth: 1, marginBottom: 22, width: "100%", maxWidth: 500, alignSelf: "center", alignItems: "center" },
  calendarHeaderTitle: { fontSize: 18, fontWeight: "900", textAlign: "center", marginBottom: 14 },
  weekHeaderRow: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginBottom: 3 },
  weekHeaderText: { fontSize: 12, fontWeight: "700", width: "13%", textAlign: "center", paddingVertical: 6 },
  daysGrid: { flexDirection: "row", flexWrap: "wrap", gap: 2, justifyContent: "flex-start", width: "100%" },
  dayCell: { width: "13%", aspectRatio: 1, justifyContent: "center", alignItems: "center", borderRadius: 10, borderWidth: 1, marginBottom: 4, position: "relative" },
  dayCellEmpty: { width: "13%", aspectRatio: 1, marginBottom: 4 },
  dayText: { fontSize: 13, fontWeight: "700" },
  dayTextSelected: { color: "#FFFFFF", fontWeight: "bold" },

  serviceSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14, width: "100%" },
  serviceSectionTitle: { fontSize: 16, fontWeight: "800", flex: 1 },
  programBtn: { paddingVertical: 11, paddingHorizontal: 14, borderRadius: 10, minHeight: 42, justifyContent: "center" },
  programBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  eventCardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  eventMainTitle: { fontSize: 18, fontWeight: "900" },
  editServiceBtn: { backgroundColor: "#3B82F6", paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4 },
  deleteServiceBtn: { backgroundColor: "#EF4444", paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4 },
  repertorioItemRowPro: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 17, paddingHorizontal: 18, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  tabBar: { position: Platform.OS === "web" ? "fixed" : "absolute", bottom: 0, left: 0, right: 0, flexShrink: 0, zIndex: 100, elevation: 20, flexDirection: "row", minHeight: 82, borderTopWidth: 1, paddingHorizontal: 10, paddingTop: 9, paddingBottom: Platform.OS === "web" ? 9 : 13 },
  tabBarMobile: { minHeight: 62, paddingHorizontal: 3, paddingTop: 4, paddingBottom: Platform.OS === "web" ? 4 : 8 },
  tabBarTablet: { minHeight: 70, paddingHorizontal: 6, paddingTop: 6, paddingBottom: 7 },
  tabItem: { flex: 1, minWidth: 0, justifyContent: "center", alignItems: "center", paddingHorizontal: 5, paddingVertical: 11, minHeight: 58, borderRadius: 15 },
  tabItemCompact: { paddingHorizontal: 1, paddingVertical: 5, minHeight: 48 },
  tabText: { fontSize: 12, textAlign: "center", fontWeight: "800", letterSpacing: 0.1 },
  tabTextCompact: { fontSize: 10, letterSpacing: 0, includeFontPadding: false },
  memberCard: { padding: 19, borderRadius: 20, borderWidth: 1, marginBottom: 15, shadowColor: "#000000", shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  memberHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  memberTitle: { fontSize: 15, fontWeight: "bold" },
  whatsappBtn: { backgroundColor: "#22C55E", padding: 12, borderRadius: 8, alignItems: "center" },
  postulateBtn: { backgroundColor: "#F97316", padding: 12, borderRadius: 8, alignItems: "center" },
  actionBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },
  postulateRoleOption: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 8, alignItems: "center" },
  
  teleprompterContainer: { flex: 1, width: "100%", height: "100%", minHeight: "100vh", padding: 8 },
  teleprompterTopBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6, borderBottomWidth: 1, borderBottomColor: "#1E293B", paddingBottom: 6, width: "100%" },
  teleprompterExitBtn: { backgroundColor: "#1E293B", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 5 },
  teleprompterScrollContent: { paddingBottom: 30, alignItems: "center", width: "100%" },
  teleprompterCard: { width: "100%", maxWidth: 800, backgroundColor: "#1C2541", padding: 14, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: "#3A506B" },
  teleprompterHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 4 },
  teleprompterSongTitle: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  teleprompterToneBox: { backgroundColor: "#3B82F6", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, alignItems: "center" },
  teleprompterControlsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#334155", paddingTop: 6, flexWrap: "wrap", gap: 6 },
  teleprompterActionBtn: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 5 },
  teleprompterLyricsBox: { width: "100%", maxWidth: 800, backgroundColor: "#0F172A", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#1E293B", marginBottom: 10 },
  teleprompterLyricsText: { color: "#F8FAFC", fontSize: 15, lineHeight: 25, textAlign: "left" },
  teleprompterNavRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", maxWidth: 800, gap: 8 },
  teleprompterNavBtn: { flex: 1, padding: 10, borderRadius: 6, alignItems: "center" },
});