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
        email: m.email || "",
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
      .on("postgres_changes", { event: "*", schema: "public", table: "integrantes" }, () => { cargarIntegrantesSupabase(); })
      .subscribe();
    return () => { supabase.removeChannel(canalSub); };
  }, []);

  const [usuario, setUsuario] = useState(() => {
    if (Platform.OS === "web") {
      try { return localStorage.getItem("soundteam_sesion_usuario") || ""; } catch (e) { return ""; }
    }
    return "";
  });

  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [cargandoAuth, setCargandoAuth] = useState(false);

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

  useEffect(() => {
    const verificarSesionSupabase = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const correoUser = session.user.email.trim().toLowerCase();
        const miembroEncontrado = integrantes.find(
          (m) => m.email && m.email.trim().toLowerCase() === correoUser
        );
        if (miembroEncontrado) {
          setUsuario(miembroEncontrado.nombre);
          setRolUsuario(miembroEncontrado.rolAcceso || "miembro");
          if (miembroEncontrado.sedeId) {
            setSedeIdSeleccionada(miembroEncontrado.sedeId);
          }
          setSesionIniciada(true);
        } else {
          setUsuario(session.user.email);
          setRolUsuario("miembro");
          setSesionIniciada(true);
        }
      }
    };
    verificarSesionSupabase();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user?.email) {
        const correoUser = session.user.email.trim().toLowerCase();
        const miembroEncontrado = integrantes.find(
          (m) => m.email && m.email.trim().toLowerCase() === correoUser
        );
        if (miembroEncontrado) {
          setUsuario(miembroEncontrado.nombre);
          setRolUsuario(miembroEncontrado.rolAcceso || "miembro");
          if (miembroEncontrado.sedeId) {
            setSedeIdSeleccionada(miembroEncontrado.sedeId);
          }
          setSesionIniciada(true);
        } else {
          setUsuario(session.user.email);
          setRolUsuario("miembro");
          setSesionIniciada(true);
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [integrantes]);

  const [pestana, setPestana] = useState("inicio");
  const [nombreTema, setNombreTema] = useState(() => {
    if (Platform.OS === "web") {
      try { return localStorage.getItem("soundteam_tema_app") || "azul"; } catch (e) { return "azul"; }
    }
    return "azul";
  });

  const [nombreTapiz, setNombreTapiz] = useState(() => {
    if (Platform.OS === "web" && usuario) {
      try { return localStorage.getItem(`soundteam_tapiz_${usuario}_${sedeIdSeleccionada}`) || "ninguno"; } catch (e) { return "ninguno"; }
    }
    return "ninguno";
  });

  useEffect(() => {
    if (Platform.OS === "web" && usuario) {
      try {
        const tapizPerfilSede = localStorage.getItem(`soundteam_tapiz_${usuario}_${sedeIdSeleccionada}`) || "ninguno";
        setNombreTapiz(tapizPerfilSede);
      } catch (e) {}
    }
  }, [usuario, sedeIdSeleccionada]);

  const [mostrarMenuPersonalizacion, setMostrarMenuPersonalizacion] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") {
      try { localStorage.setItem("soundteam_tema_app", nombreTema); } catch (e) {}
    }
  }, [nombreTema]);

  useEffect(() => {
    if (Platform.OS === "web" && usuario) {
      try { localStorage.setItem(`soundteam_tapiz_${usuario}_${sedeIdSeleccionada}`, nombreTapiz); } catch (e) {}
    }
  }, [nombreTapiz, usuario, sedeIdSeleccionada]);

  const t = TEMAS[nombreTema];
  const tapizActual = PAPELES_TAPIZ[nombreTapiz] || PAPELES_TAPIZ.ninguno;
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

  const [servicios, setServicios] = useState([]);

  const cargarServiciosSupabase = async () => {
    const { data, error } = await supabase.from("servicios").select("*").eq("sede_id", sedeIdSeleccionada);
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
        sedeId: s.sede_id,
      }));
      setServicios(formateados);
    } else {
      setServicios([]);
    }
  };

  useEffect(() => {
    cargarServiciosSupabase();
    const canalSub = supabase
      .channel(`servicios-cambios-${sedeIdSeleccionada}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "servicios", filter: `sede_id=eq.${sedeIdSeleccionada}` }, () => { cargarServiciosSupabase(); })
      .subscribe();
    return () => { supabase.removeChannel(canalSub); };
  }, [sedeIdSeleccionada]);

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
  const [metronomoActivo, setMetronomoActivo] = useState(false);
  const [pulsoActivo, setPulsoActivo] = useState(false);
  const [avanceAutomaticoActivo, setAvanceAutomaticoActivo] = useState(false);

  const [modalMiembroVisible, setModalMiembroVisible] = useState(false);
  const [idMiembroEditando, setIdMiembroEditando] = useState(null);
  const [nombreNuevoMiembro, setNombreNuevoMiembro] = useState("");
  const [pinNuevoMiembro, setPinNuevoMiembro] = useState("1234");
  const [emailNuevoMiembro, setEmailNuevoMiembro] = useState("");
  const [rolAccesoNuevo, setRolAccesoNuevo] = useState("miembro");
  const [rolesMusicalesNuevo, setRolesMusicalesNuevo] = useState([]);

  const [repertorio, setRepertorio] = useState([]);

  const cargarRepertorioSupabase = async () => {
    const { data, error } = await supabase.from("repertorio").select("*").eq("sede_id", sedeIdSeleccionada);
    if (data && !error) {
      const formateados = data.map((c) => ({
        id: c.id,
        titulo: c.titulo,
        artista: c.artista || "Sin artista",
        tono: c.tono || "C",
        bpm: c.bpm || "120",
        tipoSet: (c.tipo_set || (parseInt(c.bpm || "120", 10) < 110 ? "lenta" : "rapida")).toLowerCase(),
        etiquetas: c.etiquetas || [],
        letra: c.letra || "",
        sedeId: c.sede_id,
      }));
      setRepertorio(formateados);
    } else {
      setRepertorio([]);
    }
  };

  useEffect(() => {
    cargarRepertorioSupabase();
    const canalSub = supabase
      .channel(`repertorio-cambios-${sedeIdSeleccionada}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "repertorio", filter: `sede_id=eq.${sedeIdSeleccionada}` }, () => { cargarRepertorioSupabase(); })
      .subscribe();
    return () => { supabase.removeChannel(canalSub); };
  }, [sedeIdSeleccionada]);

  const [cancionSeleccionadaDetalle, setCancionSeleccionadaDetalle] = useState(null);
  const [canalChatActivo, setCanalChatActivo] = useState("finsemana");
  const [mensajesChat, setMensajesChat] = useState([]);
  const [nuevoMensajeTexto, setNuevoMensajeTexto] = useState("");
  const [idMensajeEditando, setIdMensajeEditando] = useState(null);

  const cargarMensajesSupabase = async () => {
    const { data, error } = await supabase
      .from("mensajes")
      .select("*")
      .eq("canal", canalChatActivo)
      .eq("sede", sedeIdSeleccionada)
      .order("created_at", { ascending: true });
    if (data && !error) { setMensajesChat(data); } else { setMensajesChat([]); }
  };

  useEffect(() => {
    cargarMensajesSupabase();
    const canalSub = supabase
      .channel(`chat-realtime-${sedeIdSeleccionada}-${canalChatActivo}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "mensajes", filter: `canal=eq.${canalChatActivo}` }, () => { cargarMensajesSupabase(); })
      .subscribe();
    return () => { supabase.removeChannel(canalSub); };
  }, [canalChatActivo, sedeIdSeleccionada]);

  useEffect(() => {
    let intervalo = null;
    if (modoEnVivoActivo && metronomoActivo && setlistEnVivoActual.length > 0) {
      const cancionActual = setlistEnVivoActual[indiceCancionEnVivo] || {};
      const objetoRepo = repertorio.find(r => r.titulo && cancionActual.titulo && r.titulo.toLowerCase() === cancionActual.titulo.toLowerCase()) || {};
      const bpmNum = parseInt(objetoRepo.bpm || cancionActual.bpm || "120", 10) || 120;
      const msPorBeat = (60 / bpmNum) * 1000;
      intervalo = setInterval(() => {
        setPulsoActivo(prev => !prev);
      }, msPorBeat / 2);
    } else {
      setPulsoActivo(false);
    }
    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [modoEnVivoActivo, metronomoActivo, indiceCancionEnVivo, setlistEnVivoActual, repertorio]);

  useEffect(() => {
    let timerAvance = null;
    if (modoEnVivoActivo && avanceAutomaticoActivo && setlistEnVivoActual.length > 0) {
      const cancionActual = setlistEnVivoActual[indiceCancionEnVivo] || {};
      const objetoRepo = repertorio.find(r => r.titulo && cancionActual.titulo && r.titulo.toLowerCase() === cancionActual.titulo.toLowerCase()) || {};
      const bpmNum = parseInt(objetoRepo.bpm || cancionActual.bpm || "120", 10) || 120;
      const tiempoEstimadoMs = (240000 * 120) / bpmNum;
      timerAvance = setTimeout(() => {
        if (indiceCancionEnVivo < setlistEnVivoActual.length - 1) {
          setIndiceCancionEnVivo(prev => prev + 1);
        } else {
          setAvanceAutomaticoActivo(false);
        }
      }, tiempoEstimadoMs);
    }
    return () => {
      if (timerAvance) clearTimeout(timerAvance);
    };
  }, [modoEnVivoActivo, avanceAutomaticoActivo, indiceCancionEnVivo, setlistEnVivoActual, repertorio]);

  const handleLogin = async () => {
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
      return;
    }

    if (data?.user) {
      const correoUser = data.user.email.trim().toLowerCase();
      const miembroEncontrado = integrantes.find(
        (m) => m.email && m.email.trim().toLowerCase() === correoUser
      );

      const nombreReal = miembroEncontrado ? miembroEncontrado.nombre : data.user.email;
      const rolAsignado = miembroEncontrado ? (miembroEncontrado.rolAcceso || "miembro") : "miembro";

      if (miembroEncontrado && miembroEncontrado.sedeId) {
        setSedeIdSeleccionada(miembroEncontrado.sedeId);
      }

      setUsuario(nombreReal);
      setRolUsuario(rolAsignado);
      setSesionIniciada(true);

      if (Platform.OS === "web") {
        try {
          localStorage.setItem("soundteam_sesion_activa", "true");
          localStorage.setItem("soundteam_sesion_usuario", nombreReal);
          localStorage.setItem("soundteam_sesion_rol", rolAsignado);
          const tapizPerfilSede = localStorage.getItem(`soundteam_tapiz_${nombreReal}_${sedeIdSeleccionada}`) || "ninguno";
          setNombreTapiz(tapizPerfilSede);
        } catch (e) {}
      }
    }
  };

  const handleGoogleLogin = async () => {
    setCargandoAuth(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: Platform.OS === 'web' ? window.location.origin : undefined,
      },
    });
    setCargandoAuth(false);

    if (error) {
      alert(`⚠️ Error con Google: ${error.message}`);
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
    setCancionSeleccionadaDetalle(null);
    setModoEnVivoActivo(false);
    setMetronomoActivo(false);
    setAvanceAutomaticoActivo(false);
    if (Platform.OS === "web") {
      try {
        localStorage.removeItem("soundteam_sesion_activa");
        localStorage.removeItem("soundteam_sesion_usuario");
        localStorage.removeItem("soundteam_sesion_rol");
      } catch (e) {}
    }
  };

  const recargarDatosApp = async () => {
    await cargarServiciosSupabase();
    await cargarRepertorioSupabase();
    await cargarMensajesSupabase();
    await cargarIntegrantesSupabase();
    if (Platform.OS === "web") {
      window.location.reload(true);
    }
  };

  const esAdmin = rolUsuario === "admin";
  const esAdminOLider = rolUsuario === "admin" || rolUsuario === "lider";
  const miembroActualObj = integrantes.find((m) => m.nombre.trim().toLowerCase() === usuario.trim().toLowerCase());
  const tocaInstrumento = miembroActualObj && miembroActualObj.rolesMusicales && miembroActualObj.rolesMusicales.some((rol) => {
    const rLower = rol.toLowerCase();
    return rLower.includes("piano") || rLower.includes("guitarra") || rLower.includes("bajo") || rLower.includes("batería") || rLower.includes("bateria");
  });
  const puedeControlarRepertorio = esAdminOLider || tocaInstrumento;

  const enviarOActualizarMensajeChat = async () => {
    if (nuevoMensajeTexto.trim() !== "") {
      const horaActual = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (idMensajeEditando !== null) {
        const textoModificado = nuevoMensajeTexto.trim();
        const idNumerico = Number(idMensajeEditando);
        const { error } = await supabase.from("mensajes").update({ texto: textoModificado, editado: true }).eq("id", idNumerico);
        if (error) { alert(`⚠️ No se pudo corregir el mensaje: ${error.message}`); return; }
        setIdMensajeEditando(null);
        setNuevoMensajeTexto("");
        await cargarMensajesSupabase();
        alert("✏️ Mensaje corregido con éxito.");
      } else {
        const mensaje = {
          autor: usuario,
          texto: nuevoMensajeTexto.trim(),
          hora: horaActual,
          canal: canalChatActivo,
          sede: sedeIdSeleccionada,
          editado: false,
        };
        setNuevoMensajeTexto("");
        await supabase.from("mensajes").insert([mensaje]);
        await cargarMensajesSupabase();
      }
    }
  };

  const limpiarHistorialChat = async () => {
    if (!esAdminOLider) { alert("⚠️ Solo Administradores y Líderes pueden limpiar el chat."); return; }
    if (confirm(`¿Deseas borrar el historial del chat de ${canalChatActivo.toUpperCase()} para esta sede (${sedeActual.nombre})?`)) {
      const { error } = await supabase.from("mensajes").delete().eq("canal", canalChatActivo).eq("sede", sedeIdSeleccionada);
      if (!error) { setMensajesChat([]); alert("🧹 Chat de la sede limpiado con éxito."); } else { alert("⚠️ No se pudo limpiar el chat."); }
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
    let texto = `🎵 *Setlist - ${servicio.titulo}* (${diaSeleccionado} de ${mesSeleccionadoObj.nombre} ${mesSeleccionadoObj.year})\n\n`;
    if (servicio.setlist && servicio.setlist.length > 0) {
      servicio.setlist.forEach((s, i) => {
        texto += `${i + 1}. ${s.titulo} (Tono: ${s.tono} | ${s.bpm || "120"} BPM)\n`;
      });
    } else {
      texto += `Sin canciones asignadas.\n`;
    }
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
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
    else if (rol === "coros") { if (nuevosCoros.length >= 3) { alert("⚠️ Coros al límite (3 personas)."); return; } nuevosCoros.push(usuario); }
    else if (rol === "piano") { if (nuevoPiano !== "Sin asignar") { alert("⚠️ Piano ocupado."); return; } nuevoPiano = usuario; }
    else if (rol === "guitarra") { if (nuevaGuitarra !== "Sin asignar") { alert("⚠️ Guitarra ocupada."); return; } nuevaGuitarra = usuario; }
    else if (rol === "bajo") { if (nuevoBajo !== "Sin asignar") { alert("⚠️ Bajo ocupado."); return; } nuevoBajo = usuario; }
    else if (rol === "bateria") { if (nuevaBateria !== "Sin asignar") { alert("⚠️ Batería ocupada."); return; } nuevaBateria = usuario; }

    const nVoces = { principal: nuevaVozP, coros: nuevosCoros.length > 0 ? nuevosCoros.join(", ") : "Sin asignar" };
    const nInst = { piano: nuevoPiano, guitarra: nuevaGuitarra, bajo: nuevoBajo, bateria: nuevaBateria };

    const actualizados = servicios.map((s) => s.id === idServicioPostulando ? { ...s, voces: nVoces, instrumentos: nInst } : s);
    setServicios(actualizados);
    await supabase.from("servicios").update({ voces: nVoces, instrumentos: nInst }).eq("id", idServicioPostulando);
    setModalPostularVisible(false);
    alert(`🚀 Postulación realizada.`);
  };

  if (!sesionIniciada) {
    return (
      <View style={[styles.loginContainer, { backgroundColor: t.bg }]}>
        <View style={[styles.loginCard, { backgroundColor: t.cardBg, borderColor: t.border }]}>
          <Text style={[styles.loginTitle, { color: t.textMain }]}>SoundTeam</Text>
          <Text style={[styles.loginSubtitle, { color: t.textSub }]}>Inicio de Sesión</Text>
          
          <Text style={[styles.inputLabel, { color: t.textMain }]}>📧 Correo Electrónico</Text>
          <TextInput
            style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
            placeholder="correo@ejemplo.com"
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

          <View style={{ marginTop: 6 }}>
            <TouchableOpacity 
              style={[styles.loginButton, { backgroundColor: t.primary, marginBottom: 10 }]} 
              onPress={handleLogin}
              disabled={cargandoAuth}
            >
              <Text style={styles.loginButtonText}>{cargandoAuth ? "Verificando..." : "Iniciar Sesión"}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginButton, { backgroundColor: "#DB4437" }]} 
              onPress={handleGoogleLogin}
              disabled={cargandoAuth}
            >
              <Text style={styles.loginButtonText}>🌐 Iniciar sesión con Google</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }, tapizActual.css]}>
      {modoEnVivoActivo ? (
        <View style={[styles.teleprompterContainer, { backgroundColor: "#0B0F19" }]}>
          <View style={styles.teleprompterTopBar}>
            <TouchableOpacity 
              style={styles.teleprompterExitBtn}
              onPress={() => { 
                setModoEnVivoActivo(false); 
                setMetronomoActivo(false); 
                setAvanceAutomaticoActivo(false); 
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 11 }}>✕ Salir</Text>
            </TouchableOpacity>
            <Text style={{ color: "#94A3B8", fontSize: 12, fontWeight: "bold" }}>
              Canción {indiceCancionEnVivo + 1} de {setlistEnVivoActual.length}
            </Text>
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
                    Tono: {(setlistEnVivoActual[indiceCancionEnVivo] || {}).tono || "C"}
                  </Text>
                </View>
              </View>

              <View style={styles.teleprompterControlsRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: pulsoActivo ? "#22C55E" : "#64748B" }} />
                  <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "bold" }}>
                    ⚡ {(setlistEnVivoActual[indiceCancionEnVivo] || {}).bpm || "120"} BPM
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 5, flexWrap: "wrap" }}>
                  <TouchableOpacity
                    style={[styles.teleprompterActionBtn, { backgroundColor: metronomoActivo ? "#EF4444" : "#22C55E" }]}
                    onPress={() => setMetronomoActivo(!metronomoActivo)}
                  >
                    <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 10 }}>
                      {metronomoActivo ? "⏹️ Detener Click" : "▶️ Iniciar Click"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.teleprompterActionBtn, { backgroundColor: avanceAutomaticoActivo ? "#F97316" : "#334155" }]}
                    onPress={() => setAvanceAutomaticoActivo(!avanceAutomaticoActivo)}
                  >
                    <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 10 }}>
                      {avanceAutomaticoActivo ? "⏱️ Auto: ON" : "⏱️ Auto: OFF"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.teleprompterLyricsBox}>
              <Text style={styles.teleprompterLyricsText}>
                {(() => {
                  const cancionActual = setlistEnVivoActual[indiceCancionEnVivo] || {};
                  const objetoRepo = repertorio.find(r => r.titulo && cancionActual.titulo && r.titulo.toLowerCase() === cancionActual.titulo.toLowerCase()) || {};
                  return objetoRepo.letra || cancionActual.letra || "[INTRO]\nLetra no disponible en biblioteca.";
                })()}
              </Text>
            </View>

            <View style={styles.teleprompterNavRow}>
              <TouchableOpacity
                style={[styles.teleprompterNavBtn, { backgroundColor: "#334155" }, indiceCancionEnVivo === 0 && { opacity: 0.4 }]}
                disabled={indiceCancionEnVivo === 0}
                onPress={() => setIndiceCancionEnVivo(prev => Math.max(0, prev - 1))}
              >
                <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 12 }}>← Anterior</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.teleprompterNavBtn, { backgroundColor: "#3B82F6" }, indiceCancionEnVivo >= setlistEnVivoActual.length - 1 && { opacity: 0.4 }]}
                disabled={indiceCancionEnVivo >= setlistEnVivoActual.length - 1}
                onPress={() => setIndiceCancionEnVivo(prev => prev + 1)}
              >
                <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 12 }}>Siguiente →</Text>
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
                <Text style={[styles.headerSubtitle, { color: t.textSub }]} numberOfLines={1}>
                  👤 {usuario} • <Text style={{ color: t.primary, fontWeight: "bold" }}>ROL: {rolUsuario.toUpperCase()}</Text>
                </Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity style={{ backgroundColor: t.primary, paddingVertical: 5, paddingHorizontal: 8, borderRadius: 6, marginRight: 4 }} onPress={recargarDatosApp}>
                  <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 11 }}>🔄 Refrescar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                  <Text style={styles.logoutBtnText}>Salir</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginTop: 8 }}>
              {esAdminOLider && Platform.OS === "web" ? (
                <select
                  value={sedeIdSeleccionada}
                  onChange={(e) => setSedeIdSeleccionada(e.target.value)}
                  style={{
                    backgroundColor: t.bg,
                    color: t.textMain,
                    borderColor: t.border,
                    borderWidth: "1px",
                    borderRadius: "6px",
                    padding: "8px",
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
                onPress={() => setMostrarMenuPersonalizacion(!mostrarMenuPersonalizacion)}
              >
                <Text style={{ fontSize: 11, color: t.textMain, fontWeight: "bold" }}>
                  🎨 Tema: {t.nombre} | Tapiz: {tapizActual.nombre}
                </Text>
                <Text style={{ fontSize: 11, color: t.primary, fontWeight: "bold" }}>{mostrarMenuPersonalizacion ? "▲ Ocultar" : "▼ Personalizar"}</Text>
              </TouchableOpacity>

              {mostrarMenuPersonalizacion && (
                <View style={{ marginTop: 6, backgroundColor: t.cardBg, borderRadius: 6, borderWidth: 1, borderColor: t.border, padding: 8, gap: 8 }}>
                  <Text style={{ fontSize: 11, color: t.textSub, fontWeight: "bold" }}>Temas:</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                    {Object.keys(TEMAS).map((keyTema) => {
                      const activo = nombreTema === keyTema;
                      return (
                        <TouchableOpacity
                          key={keyTema}
                          style={{ paddingVertical: 4, paddingHorizontal: 6, borderRadius: 4, backgroundColor: activo ? t.primary : t.bg, borderWidth: 1, borderColor: t.border }}
                          onPress={() => setNombreTema(keyTema)}
                        >
                          <Text style={{ fontSize: 10, color: activo ? "#FFFFFF" : t.textMain, fontWeight: activo ? "bold" : "normal" }}>
                            {TEMAS[keyTema].nombre}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={{ fontSize: 11, color: t.textSub, fontWeight: "bold", marginTop: 4 }}>Tapiz:</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                    {Object.keys(PAPELES_TAPIZ).map((keyTapiz) => {
                      const activoTapiz = nombreTapiz === keyTapiz;
                      return (
                        <TouchableOpacity
                          key={keyTapiz}
                          style={{ paddingVertical: 4, paddingHorizontal: 6, borderRadius: 4, backgroundColor: activoTapiz ? t.primary : t.bg, borderWidth: 1, borderColor: t.border }}
                          onPress={() => setNombreTapiz(keyTapiz)}
                        >
                          <Text style={{ fontSize: 10, color: activoTapiz ? "#FFFFFF" : t.textMain, fontWeight: activoTapiz ? "bold" : "normal" }}>
                            {PAPELES_TAPIZ[keyTapiz].nombre}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
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
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <Text style={[styles.cardTitle, { color: t.textMain, marginBottom: 0 }]}>💬 Chat de {sedeActual.nombre}</Text>
                      {esAdminOLider && (
                        <TouchableOpacity style={{ backgroundColor: "#EF4444", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }} onPress={limpiarHistorialChat}>
                          <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "bold" }}>🗑️ Limpiar</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={{ flexDirection: "row", gap: 6, marginBottom: 12 }}>
                      {[
                        { key: "martes", label: "🗓️ Martes" },
                        { key: "jueves", label: "🗓️ Jueves" },
                        { key: "finsemana", label: "⛪ Sáb & Dom" },
                      ].map((ch) => {
                        const estaActivo = canalChatActivo === ch.key;
                        return (
                          <TouchableOpacity
                            key={ch.key}
                            style={[
                              { flex: 1, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: t.border, backgroundColor: t.bg, alignItems: "center" },
                              estaActivo && { backgroundColor: t.primary, borderColor: t.primary },
                            ]}
                            onPress={() => setCanalChatActivo(ch.key)}
                          >
                            <Text style={{ fontSize: 11, fontWeight: estaActivo ? "bold" : "normal", color: estaActivo ? "#FFF" : t.textSub }}>
                              {ch.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <View style={{ backgroundColor: t.bg, borderRadius: 8, borderWidth: 1, borderColor: t.border, padding: 10, height: 240, marginBottom: 10 }}>
                      <ScrollView>
                        {mensajesChat.length === 0 ? (
                          <Text style={{ color: t.textSub, textAlign: "center", marginTop: 20, fontStyle: "italic", fontSize: 12 }}>
                            No hay mensajes en este chat para {sedeActual.nombre}. ¡Sé el primero en escribir!
                          </Text>
                        ) : (
                          mensajesChat.map((m, i) => {
                            const esMio = m.autor === usuario;
                            return (
                              <View
                                key={m.id || i}
                                style={{
                                  marginBottom: 8,
                                  backgroundColor: esMio ? t.primary + "22" : t.cardBg,
                                  padding: 8,
                                  borderRadius: 6,
                                  borderWidth: 1,
                                  borderColor: t.border,
                                }}
                              >
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                                  <Text style={{ color: t.primary, fontWeight: "bold", fontSize: 11 }}>
                                    {m.autor} {m.editado ? "(corregido)" : ""}
                                  </Text>
                                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                    <Text style={{ color: t.textSub, fontSize: 9 }}>{m.hora}</Text>
                                    {esMio && (
                                      <TouchableOpacity
                                        onPress={() => {
                                          setIdMensajeEditando(m.id);
                                          setNuevoMensajeTexto(m.texto);
                                        }}
                                      >
                                        <Text style={{ color: t.primary, fontSize: 10, fontWeight: "bold" }}>✏️ Corregir</Text>
                                      </TouchableOpacity>
                                    )}
                                  </View>
                                </View>
                                <Text style={{ color: t.textMain, fontSize: 12 }}>{m.texto}</Text>
                              </View>
                            );
                          })
                        )}
                      </ScrollView>
                    </View>

                    <View style={{ flexDirection: "row", gap: 6 }}>
                      <TextInput
                        style={[styles.loginInput, { flex: 1, backgroundColor: t.bg, borderColor: t.border, color: t.textMain, marginBottom: 0, padding: 8, fontSize: 13 }]}
                        placeholder={`Escribir en el chat de ${sedeActual.nombre}...`}
                        placeholderTextColor={t.textSub}
                        value={nuevoMensajeTexto}
                        onChangeText={setNuevoMensajeTexto}
                      />
                      <TouchableOpacity
                        style={[styles.loginButton, { backgroundColor: t.primary, justifyContent: "center", paddingVertical: 8, paddingHorizontal: 14 }]}
                        onPress={enviarOActualizarMensajeChat}
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

                  <View style={[styles.calendarCard, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                    <Text style={[styles.calendarHeaderTitle, { color: t.textMain }]}>
                      {mesSeleccionadoObj.nombre} {mesSeleccionadoObj.year}
                    </Text>

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
                            {item.postulado && <View style={{ position: "absolute", top: 1, right: 1, backgroundColor: "#22C55E", width: 3, height: 3, borderRadius: 1.5 }} />}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.serviceSectionHeader}>
                    <Text style={[styles.serviceSectionTitle, { color: t.textMain }]}>
                      Servicios de {sedeActual.nombre} - Día {diaSeleccionado} ({serviciosDelDia.length})
                    </Text>
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
                        <Text style={styles.programBtnText}>+ Programar Servicio</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {modalProgramarVisible && (
                    <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.primary, borderWidth: 2 }]}>
                      <Text style={[styles.cardTitle, { color: t.textMain, fontSize: 17, marginBottom: 12 }]}>
                        {idServicioEditando !== null ? "✏️ Modificar Servicio" : "➕ Nuevo Servicio"} en {sedeActual.nombre}
                      </Text>

                      <Text style={[styles.inputLabel, { color: t.textMain }]}>Nombre del evento</Text>
                      <TextInput
                        style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
                        placeholder="Ej. Culto Dominical"
                        placeholderTextColor={t.textSub}
                        value={nombreEvento}
                        onChangeText={setNombreEvento}
                      />

                      <Text style={[styles.inputLabel, { color: t.textMain }]}>Observaciones</Text>
                      <TextInput
                        style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
                        placeholder="Ej. Prueba a las 8:00 AM"
                        placeholderTextColor={t.textSub}
                        value={observaciones}
                        onChangeText={setObservaciones}
                      />

                      <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
                        <TouchableOpacity
                          style={[styles.loginButton, { flex: 1, backgroundColor: t.primary, padding: 12 }]}
                          onPress={async () => {
                            if (nombreEvento.trim() !== "") {
                              const nuevoId = idServicioEditando !== null ? idServicioEditando : Date.now();
                              const nuevoServicioObj = {
                                id: nuevoId,
                                fecha: fechaActualClave,
                                titulo: nombreEvento,
                                observaciones: observaciones || "Sin observaciones",
                                setlist: setlistActivo,
                                paletaSeleccionada: null,
                                voces: { principal: "Sin asignar", coros: "Sin asignar" },
                                instrumentos: { piano: "Sin asignar", guitarra: "Sin asignar", bajo: "Sin asignar", bateria: "Sin asignar" },
                                sede_id: sedeIdSeleccionada,
                              };
                              if (idServicioEditando !== null) {
                                setServicios(servicios.map((s) => s.id === idServicioEditando ? nuevoServicioObj : s));
                                await supabase.from("servicios").update({ titulo: nombreEvento, observaciones, setlist: setlistActivo }).eq("id", idServicioEditando);
                              } else {
                                setServicios([...servicios, nuevoServicioObj]);
                                await supabase.from("servicios").insert([{ ...nuevoServicioObj, paleta_seleccionada: null }]);
                              }
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
                      <View key={serv.id} style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border, marginBottom: 16, padding: 10 }]}>
                        <View style={styles.eventCardHeaderRow}>
                          <Text style={[styles.eventMainTitle, { color: t.textMain, fontSize: 13 }]}>📅 {serv.titulo}</Text>
                          {esAdminOLider && (
                            <View style={{ flexDirection: "row", gap: 4 }}>
                              <TouchableOpacity
                                style={[styles.editServiceBtn, { paddingVertical: 2, paddingHorizontal: 5 }]}
                                onPress={() => {
                                  setIdServicioEditando(serv.id);
                                  setNombreEvento(serv.titulo);
                                  setObservaciones(serv.observaciones);
                                  setSetlistActivo(serv.setlist || []);
                                  setModalProgramarVisible(true);
                                }}
                              >
                                <Text style={{ fontSize: 10, color: "#FFFFFF", fontWeight: "bold" }}>✏️ Modificar</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[styles.deleteServiceBtn, { paddingVertical: 2, paddingHorizontal: 5 }]}
                                onPress={async () => {
                                  setServicios(servicios.filter((s) => s.id !== serv.id));
                                  await supabase.from("servicios").delete().eq("id", serv.id);
                                }}
                              >
                                <Text style={{ fontSize: 10, color: "#FFFFFF", fontWeight: "bold" }}>🗑️ Eliminar</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                        <Text style={{ color: t.textSub, fontSize: 11, marginTop: 2, marginBottom: 4 }}>Observaciones: {serv.observaciones}</Text>

                        <Text style={{ color: t.primary, fontSize: 11, fontWeight: "bold", marginTop: 4, marginBottom: 4 }}>🎵 SETLIST ({serv.setlist?.length || 0}):</Text>
                        {serv.setlist && serv.setlist.length > 0 ? (
                          serv.setlist.map((s, i) => (
                            <View key={i} style={{ backgroundColor: t.bg, padding: 6, borderRadius: 6, borderWidth: 1, borderColor: t.border, marginBottom: 4 }}>
                              <Text style={{ color: t.textMain, fontSize: 11, fontWeight: "bold" }}>
                                {i + 1}. {s.titulo} <Text style={{ color: t.textSub, fontWeight: "normal", fontSize: 10 }}>(Tono: {s.tono} | {s.bpm || "120"} BPM)</Text>
                              </Text>
                            </View>
                          ))
                        ) : (
                          <Text style={{ color: t.textSub, fontSize: 11, marginLeft: 6, fontStyle: "italic" }}>Sin canciones agregadas al setlist.</Text>
                        )}

                        {serv.setlist && serv.setlist.length > 0 && (
                          <TouchableOpacity
                            style={{ backgroundColor: "#2563EB", padding: 8, borderRadius: 6, alignItems: "center", marginTop: 6, marginBottom: 6 }}
                            onPress={() => {
                              setSetlistEnVivoActual(serv.setlist);
                              setIndiceCancionEnVivo(0);
                              setModoEnVivoActivo(true);
                              setMetronomoActivo(false);
                              setAvanceAutomaticoActivo(false);
                            }}
                          >
                            <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 12 }}>▶️ Modo en vivo</Text>
                          </TouchableOpacity>
                        )}

                        <View style={{ marginTop: 8, gap: 6 }}>
                          <TouchableOpacity style={[styles.whatsappBtn, { padding: 8 }]} onPress={() => enviarPorWhatsApp(serv)}>
                            <Text style={[styles.actionBtnText, { fontSize: 12 }]}>🚀 Enviar setlist por WhatsApp</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.postulateBtn, { padding: 8 }]}
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

              {pestana === "equipo" && esAdminOLider && (
                <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <Text style={[styles.cardTitle, { color: t.textMain, marginBottom: 0 }]}>
                      👥 Miembros de {sedeActual.nombre} ({integrantesSeccionEquipo.length})
                    </Text>
                    <TouchableOpacity
                      style={[styles.programBtn, { backgroundColor: t.primary }]}
                      onPress={() => {
                        setIdMiembroEditando(null);
                        setNombreNuevoMiembro("");
                        setPinNuevoMiembro("1234");
                        setEmailNuevoMiembro("");
                        setRolAccesoNuevo("miembro");
                        setRolesMusicalesNuevo([]);
                        setModalMiembroVisible(true);
                      }}
                    >
                      <Text style={styles.programBtnText}>+ Agregar Miembro</Text>
                    </TouchableOpacity>
                  </View>

                  {modalMiembroVisible && (
                    <View style={[styles.card, { backgroundColor: t.bg, borderColor: t.primary, borderWidth: 2, marginBottom: 14 }]}>
                      <Text style={[styles.cardTitle, { color: t.textMain, fontSize: 16 }]}>
                        {idMiembroEditando !== null ? "✏️ Modificar Miembro" : `➕ Nuevo Miembro`}
                      </Text>
                      <TextInput
                        style={[styles.loginInput, { backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain }]}
                        placeholder="Nombre"
                        placeholderTextColor={t.textSub}
                        value={nombreNuevoMiembro}
                        onChangeText={setNombreNuevoMiembro}
                      />
                      <TextInput
                        style={[styles.loginInput, { backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain }]}
                        placeholder="Correo electrónico"
                        placeholderTextColor={t.textSub}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={emailNuevoMiembro}
                        onChangeText={setEmailNuevoMiembro}
                      />
                      <TextInput
                        style={[styles.loginInput, { backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain }]}
                        placeholder="PIN (Opcional)"
                        placeholderTextColor={t.textSub}
                        value={pinNuevoMiembro}
                        onChangeText={setPinNuevoMiembro}
                      />
                      <TouchableOpacity
                        style={[styles.loginButton, { backgroundColor: t.primary, padding: 10, marginTop: 6 }]}
                        onPress={async () => {
                          if (nombreNuevoMiembro.trim() !== "") {
                            const nuevoId = idMiembroEditando !== null ? idMiembroEditando : Date.now();
                            const integranteObj = {
                              id: nuevoId,
                              nombre: nombreNuevoMiembro.trim(),
                              pin: pinNuevoMiembro.trim() || "1234",
                              email: emailNuevoMiembro.trim() || "",
                              sede_id: sedeIdSeleccionada,
                              rol_acceso: rolAccesoNuevo,
                              roles_musicales: rolesMusicalesNuevo,
                            };
                            if (idMiembroEditando !== null) {
                              setIntegrantes(integrantes.map(i => i.id === idMiembroEditando ? integranteObj : i));
                              await supabase.from("integrantes").update(integranteObj).eq("id", idMiembroEditando);
                            } else {
                              setIntegrantes([...integrantes, integranteObj]);
                              await supabase.from("integrantes").insert([integranteObj]);
                            }
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
                    <View key={int.id} style={[styles.memberCard, { backgroundColor: t.bg, borderColor: t.border }]}>
                      <View style={styles.memberHeaderRow}>
                        <Text style={[styles.memberTitle, { color: t.textMain }]}>👤 {int.nombre}</Text>
                        <TouchableOpacity
                          style={{ backgroundColor: "#EF4444", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 }}
                          onPress={async () => {
                            setIntegrantes(integrantes.filter((item) => item.id !== int.id));
                            await supabase.from("integrantes").delete().eq("id", int.id);
                          }}
                        >
                          <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "bold" }}>🗑️ Eliminar</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={{ color: t.textSub, fontSize: 11 }}>Correo: {int.email || "No registrado"} | Acceso: {int.rolAcceso}</Text>
                    </View>
                  ))}
                </View>
              )}

              {pestana === "repertorio" && (
                <>
                  {cancionSeleccionadaDetalle !== null ? (
                    <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                      <TouchableOpacity
                        style={{ backgroundColor: t.bg, padding: 8, borderRadius: 6, borderWidth: 1, borderColor: t.border, marginBottom: 12, alignSelf: "flex-start" }}
                        onPress={() => setCancionSeleccionadaDetalle(null)}
                      >
                        <Text style={{ color: t.textMain, fontSize: 12, fontWeight: "bold" }}>← Volver al repertorio</Text>
                      </TouchableOpacity>
                      <Text style={{ fontSize: 22, fontWeight: "bold", color: t.textMain, marginBottom: 4 }}>{cancionSeleccionadaDetalle.titulo}</Text>
                      <Text style={{ color: t.textSub, fontSize: 13, marginBottom: 12 }}>{cancionSeleccionadaDetalle.artista} • Tono: {cancionSeleccionadaDetalle.tono}</Text>
                      <View style={{ backgroundColor: t.bg, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: t.border }}>
                        <Text style={{ color: t.textMain, fontSize: 14, lineHeight: 22 }}>{cancionSeleccionadaDetalle.letra || "Sin letra registrada."}</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                      <Text style={[styles.cardTitle, { color: t.textMain, fontSize: 16, marginBottom: 14 }]}>Repertorio de {sedeActual.nombre} ({repertorio.length})</Text>
                      {repertorio.map((c) => (
                        <TouchableOpacity
                          key={c.id}
                          style={[styles.repertorioItemRowPro, { borderBottomColor: t.border, backgroundColor: t.bg }]}
                          onPress={() => setCancionSeleccionadaDetalle(c)}
                        >
                          <View style={{ flex: 1, paddingVertical: 4 }}>
                            <Text style={{ color: t.textMain, fontSize: 15, fontWeight: "bold", marginBottom: 2 }}>{c.titulo}</Text>
                            <Text style={{ color: t.textSub, fontSize: 12 }}>{c.artista || "Sin artista"}</Text>
                          </View>
                          <View style={{ backgroundColor: t.primary, width: 34, height: 34, borderRadius: 6, justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 13 }}>{c.tono || "C"}</Text>
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
                onPress={() => { setPestana(tab.key); setCancionSeleccionadaDetalle(null); }}
              >
                <Text style={[styles.tabText, { color: t.textSub }, pestana === tab.key && { color: t.textMain, fontWeight: "bold" }]} numberOfLines={1}>
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
  loginTitle: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  loginSubtitle: { fontSize: 13, textAlign: "center", marginBottom: 20 },
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
  inputLabel: { fontSize: 11, marginBottom: 4, fontWeight: "500" },
  monthsRow: { flexDirection: "row", gap: 6, marginBottom: 8, width: "100%" },
  monthTab: { flex: 1, paddingVertical: 5, alignItems: "center", borderRadius: 6, borderWidth: 1 },
  monthText: { fontSize: 11 },
  monthTextActive: { color: "#FFFFFF", fontWeight: "bold" },
  
  calendarCard: { padding: 6, borderRadius: 8, borderWidth: 1, marginBottom: 12, width: "100%", maxWidth: 360, alignSelf: "center", alignItems: "center" },
  calendarHeaderTitle: { fontSize: 12, fontWeight: "bold", textAlign: "center", marginBottom: 4 },
  weekHeaderRow: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginBottom: 3 },
  weekHeaderText: { fontSize: 9, fontWeight: "bold", width: "13%", textAlign: "center" },
  daysGrid: { flexDirection: "row", flexWrap: "wrap", gap: 2, justifyContent: "flex-start", width: "100%" },
  dayCell: { width: "13%", aspectRatio: 1.2, justifyContent: "center", alignItems: "center", borderRadius: 3, borderWidth: 1, marginBottom: 2, position: "relative" },
  dayCellEmpty: { width: "13%", aspectRatio: 1.2, marginBottom: 2 },
  dayText: { fontSize: 10, fontWeight: "bold" },
  dayTextSelected: { color: "#FFFFFF", fontWeight: "bold" },

  serviceSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, width: "100%" },
  serviceSectionTitle: { fontSize: 13, fontWeight: "bold", flex: 1 },
  programBtn: { paddingVertical: 5, paddingHorizontal: 8, borderRadius: 6 },
  programBtnText: { color: "#FFFFFF", fontSize: 11, fontWeight: "bold" },
  eventCardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  eventMainTitle: { fontSize: 15, fontWeight: "bold" },
  editServiceBtn: { backgroundColor: "#3B82F6", paddingVertical: 3, paddingHorizontal: 6, borderRadius: 4 },
  deleteServiceBtn: { backgroundColor: "#EF4444", paddingVertical: 3, paddingHorizontal: 6, borderRadius: 4 },
  repertorioItemRowPro: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, marginBottom: 6 },
  tabBar: { flexDirection: "row", height: 55, borderTopWidth: 1, width: "100%" },
  tabItem: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 2 },
  tabText: { fontSize: 10, textAlign: "center" },
  memberCard: { padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
  memberHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  memberTitle: { fontSize: 14, fontWeight: "bold" },
  whatsappBtn: { backgroundColor: "#22C55E", padding: 12, borderRadius: 8, alignItems: "center" },
  postulateBtn: { backgroundColor: "#F97316", padding: 12, borderRadius: 8, alignItems: "center" },
  actionBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },
  postulateRoleOption: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 8, alignItems: "center" },
  
  teleprompterContainer: { flex: 1, width: "100%", height: "100%", minHeight: "100vh", padding: 8 },
  teleprompterTopBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6, borderBottomWidth: 1, borderBottomColor: "#1E293B", paddingBottom: 6, width: "100%" },
  teleprompterExitBtn: { backgroundColor: "#1E293B", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 5 },
  teleprompterScrollContent: { paddingBottom: 30, alignItems: "center", width: "100%" },
  teleprompterCard: { width: "100%", maxWidth: 800, backgroundColor: "#1E293B", padding: 8, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: "#334155" },
  teleprompterHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 4 },
  teleprompterSongTitle: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  teleprompterToneBox: { backgroundColor: "#3B82F6", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, alignItems: "center" },
  teleprompterControlsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#334155", paddingTop: 6, flexWrap: "wrap", gap: 6 },
  teleprompterActionBtn: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 5 },
  teleprompterLyricsBox: { width: "100%", maxWidth: 800, backgroundColor: "#0F172A", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#1E293B", marginBottom: 10 },
  teleprompterLyricsText: { color: "#F8FAFC", fontSize: 13, lineHeight: 21, textAlign: "left" },
  teleprompterNavRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", maxWidth: 800, gap: 8 },
  teleprompterNavBtn: { flex: 1, padding: 10, borderRadius: 6, alignItems: "center" },
});