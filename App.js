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
  ipuc: { 
    nombre: "⛪ IPUC", 
    css: Platform.OS === "web" ? { backgroundImage: `url('https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1200&auto=format&fit=crop')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" } : {} 
  },
  patronMusical: { 
    nombre: "🎵 Notas Musicales", 
    css: Platform.OS === "web" ? { backgroundImage: `url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" } : {} 
  },
  eventos: { 
    nombre: "📷 Eventos", 
    css: Platform.OS === "web" ? { backgroundImage: `url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" } : {} 
  },
  maderaAcustica: { 
    nombre: "🪵 Madera Estudio", 
    css: Platform.OS === "web" ? { backgroundImage: `url('https://images.unsplash.com/photo-1546484475-7f7bd55792da?q=80&w=1200&auto=format&fit=crop')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" } : {} 
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
  let resto = "", raiz = "";
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
    const esLineaDeAcordes = palabras.length > 0 && palabras.every((p) => {
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

  const [paletasCulto, setPaletasCulto] = useState(() => {
    if (Platform.OS === "web") {
      try {
        const guardados = localStorage.getItem("soundteam_paletas_culto");
        return guardados ? JSON.parse(guardados) : [
          { id: 1, nombre: "Atardecer Violeta", colores: ["#064680", "#31245A", "#AC6DBF", "#2A7CA3", "#588BC2"] },
          { id: 2, nombre: "Tonos Arena", colores: ["#C29B78", "#A17651", "#5C4033", "#222222"] },
          { id: 3, nombre: "Blanco Sacro", colores: ["#748185", "#93afb3", "#456467"] },
          { id: 4, nombre: "Rosa Alba", colores: ["#E29578", "#FFDDD2", "#83C5BE", "#006D77"] },
        ];
      } catch (e) { return []; }
    }
    return [];
  });

  useEffect(() => {
    if (Platform.OS === "web") {
      try { localStorage.setItem("soundteam_paletas_culto", JSON.stringify(paletasCulto)); } catch (e) {}
    }
  }, [paletasCulto]);

  const [servicios, setServicios] = useState([]);

  const cargarServiciosSupabase = async () => {
    const { data, error } = await supabase
      .from("servicios")
      .select("*")
      .eq("sede_id", sedeIdSeleccionada);

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
  const [paletaSeleccionadaModal, setPaletaSeleccionadaModal] = useState(null);
  const [setlistActivo, setSetlistActivo] = useState([]);
  const [cancionLentaSeleccionada, setCancionLentaSeleccionada] = useState("");
  const [cancionRapidaSeleccionada, setCancionRapidaSeleccionada] = useState("");

  const [modoEnVivoActivo, setModoEnVivoActivo] = useState(false);
  const [indiceCancionEnVivo, setIndiceCancionEnVivo] = useState(0);
  const [setlistEnVivoActual, setSetlistEnVivoActual] = useState([]);
  const [metronomoActivo, setMetronomoActivo] = useState(false);
  const [pulsoActivo, setPulsoActivo] = useState(false);
  const [avanceAutomaticoActivo, setAvanceAutomaticoActivo] = useState(false);

  const moverCancionArriba = (index) => {
    if (index <= 0) return;
    const nuevoSetlist = [...setlistActivo];
    const temp = nuevoSetlist[index];
    nuevoSetlist[index] = nuevoSetlist[index - 1];
    nuevoSetlist[index - 1] = temp;
    setSetlistActivo(nuevoSetlist);
  };

  const moverCancionAbajo = (index) => {
    if (index >= setlistActivo.length - 1) return;
    const nuevoSetlist = [...setlistActivo];
    const temp = nuevoSetlist[index];
    nuevoSetlist[index] = nuevoSetlist[index + 1];
    nuevoSetlist[index + 1] = temp;
    setSetlistActivo(nuevoSetlist);
  };

  const [modalMiembroVisible, setModalMiembroVisible] = useState(false);
  const [idMiembroEditando, setIdMiembroEditando] = useState(null);
  const [nombreNuevoMiembro, setNombreNuevoMiembro] = useState("");
  const [pinNuevoMiembro, setPinNuevoMiembro] = useState("1234");
  const [rolAccesoNuevo, setRolAccesoNuevo] = useState("miembro");
  const [rolesMusicalesNuevo, setRolesMusicalesNuevo] = useState([]);

  const [repertorio, setRepertorio] = useState([]);

  const cargarRepertorioSupabase = async () => {
    const { data, error } = await supabase
      .from("repertorio")
      .select("*")
      .eq("sede_id", sedeIdSeleccionada);

    if (data && !error) {
      const formateados = data.map((c) => ({
        id: c.id,
        titulo: c.titulo,
        artista: c.artista || "Sin artista",
        tono: c.tono || "C",
        bpm: c.bpm || "120",
        tipoSet: (c.tipo_set || c.tiposet || c.tipoSet || (parseInt(c.bpm || "120", 10) < 110 ? "lenta" : "rapida")).toLowerCase(),
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
  const [semitonosTransposicion, setSemitonosTransposicion] = useState(0);
  const [modoVisualizacionRepertorio, setModoVisualizacionRepertorio] = useState("Acordes");
  const [modoEdicionCancion, setModoEdicionCancion] = useState(false);
  const [nuevoTituloCancion, setNuevoTituloCancion] = useState("");
  const [nuevoArtistaCancion, setNuevoArtistaCancion] = useState("");
  const [nuevoTonoCancion, setNuevoTonoCancion] = useState("");
  const [nuevoBpmCancion, setNuevoBpmCancion] = useState("120");
  const [nuevoTipoSetCancion, setNuevoTipoSetCancion] = useState("lenta");
  const [nuevaLetraCancion, setNuevaLetraCancion] = useState("");
  const [etiquetasActuales, setEtiquetasActuales] = useState([]);

  useEffect(() => {
    let intervalo = null;
    if (modoEnVivoActivo && metronomoActivo && setlistEnVivoActual.length > 0) {
      const cancionActual = setlistEnVivoActual[indiceCancionEnVivo];
      const objetoRepo = repertorio.find(r => r.titulo.toLowerCase() === cancionActual?.titulo.toLowerCase());
      const bpmNum = parseInt(objetoRepo?.bpm || cancionActual?.bpm || "120", 10) || 120;
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
      const cancionActual = setlistEnVivoActual[indiceCancionEnVivo];
      const objetoRepo = repertorio.find(r => r.titulo.toLowerCase() === cancionActual?.titulo.toLowerCase());
      const bpmNum = parseInt(objetoRepo?.bpm || cancionActual?.bpm || "120", 10) || 120;
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

  const [canalChatActivo, setCanalChatActivo] = useState("finsemana");
  const [mensajesChat, setMensajesChat] = useState([]);
  const [nuevoMensajeTexto, setNuevoMensajeTexto] = useState("");
  const [idMensajeEditando, setIdMensajeEditando] = useState(null);
  const [textoOriginalEditando, setTextoOriginalEditando] = useState("");

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

  const handleLogin = () => {
    if (usuario.trim() === "" || pinInput.trim() === "") {
      alert("⚠️ Ingresa tu usuario y PIN.");
      return;
    }
    const miembroEncontrado = integrantes.find(
      (m) => m.nombre.trim().toLowerCase() === usuario.trim().toLowerCase() && m.sedeId === sedeIdSeleccionada
    );
    if (!miembroEncontrado) {
      alert(`⚠️ El usuario "${usuario}" no está registrado o no tiene acceso a la ${sedeActual.nombre}.`);
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
        
        const tapizPerfilSede = localStorage.getItem(`soundteam_tapiz_${nombreReal}_${sedeIdSeleccionada}`) || "ninguno";
        setNombreTapiz(tapizPerfilSede);
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
        setTextoOriginalEditando("");
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
        const { error } = await supabase.from("mensajes").insert([mensaje]);
        if (error) { alert(`⚠️ No se pudo enviar el mensaje: ${error.message}.`); }
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

  const guardarOActualizarCancion = async () => {
    if (!puedeControlarRepertorio) { alert("⚠️ No tienes permisos suficientes para modificar el repertorio."); return; }
    if (nuevoTituloCancion.trim() !== "") {
      const tituloTrimmed = nuevoTituloCancion.trim().toLowerCase();

      if (cancionSeleccionadaDetalle !== null && modoEdicionCancion) {
        const duplicada = repertorio.some(
          (c) => c.titulo.trim().toLowerCase() === tituloTrimmed && c.id !== cancionSeleccionadaDetalle.id
        );
        if (duplicada) {
          alert(`⚠️ Ya existe otra canción con el título "${nuevoTituloCancion.trim()}" en ${sedeActual.nombre}.`);
          return;
        }

        const cancionActualizada = {
          titulo: nuevoTituloCancion.trim(),
          artista: nuevoArtistaCancion || "Sin artista",
          tono: nuevoTonoCancion || "C",
          bpm: nuevoBpmCancion || "120",
          tipo_set: nuevoTipoSetCancion,
          tiposet: nuevoTipoSetCancion,
          etiquetas: etiquetasActuales,
          letra: nuevaLetraCancion || "",
          sede_id: sedeIdSeleccionada,
        };
        
        let res = await supabase.from("repertorio").update(cancionActualizada).eq("id", cancionSeleccionadaDetalle.id);
        if (res.error) {
          alert(`⚠️ Error al actualizar: ${res.error.message}`);
          return;
        }

        await cargarRepertorioSupabase();
        setModoEdicionCancion(false);
        setSemitonosTransposicion(0);
        setCancionSeleccionadaDetalle(null);
        alert("🎵 Canción actualizada en " + sedeActual.nombre + ".");
      } else {
        const duplicada = repertorio.some(
          (c) => c.titulo.trim().toLowerCase() === tituloTrimmed
        );
        if (duplicada) {
          alert(`⚠️ La canción "${nuevoTituloCancion.trim()}" ya se encuentra registrada en el repertorio de ${sedeActual.nombre}. No se permiten duplicados.`);
          return;
        }

        const nuevoId = Date.now();
        const nuevaCancion = {
          id: nuevoId,
          titulo: nuevoTituloCancion.trim(),
          artista: nuevoArtistaCancion || "Sin artista",
          tono: nuevoTonoCancion || "C",
          bpm: nuevoBpmCancion || "120",
          tipo_set: nuevoTipoSetCancion,
          tiposet: nuevoTipoSetCancion,
          etiquetas: etiquetasActuales.length > 0 ? etiquetasActuales : ["Adoración"],
          letra: nuevaLetraCancion || "",
          sede_id: sedeIdSeleccionada,
        };

        let res = await supabase.from("repertorio").insert([nuevaCancion]);

        if (res.error) {
          alert(`⚠️ Error al guardar en Supabase: ${res.error.message}`);
          return;
        }

        await cargarRepertorioSupabase();
        setModoEdicionCancion(false);
        alert("🎵 Canción guardada en " + sedeActual.nombre + ".");
      }
      setNuevoTituloCancion("");
      setNuevoArtistaCancion("");
      setNuevoTonoCancion("");
      setNuevoBpmCancion("120");
      setNuevoTipoSetCancion("lenta");
      setNuevaLetraCancion("");
      setEtiquetasActuales([]);
    } else { alert("⚠️ Completa el título de la canción."); }
  };

  const eliminarCancionRepertorio = async (id) => {
    if (!puedeControlarRepertorio) { alert("⚠️ Sin permisos para borrar canciones."); return; }
    if (confirm("¿Deseas eliminar esta canción del repertorio de esta sede?")) {
      await supabase.from("repertorio").delete().eq("id", id);
      await cargarRepertorioSupabase();
      setCancionSeleccionadaDetalle(null);
      alert("🗑️ Canción eliminada.");
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
      servicio.setlist.forEach((s, i) => { texto += `${i + 1}. ${s.titulo} (Tono: ${s.tono} | ${s.bpm || "120"} BPM)\n`; });
    } else { texto += `Sin canciones asignadas.\n`; }
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    Linking.openURL(url).catch(() => { alert("No se pudo abrir WhatsApp."); });
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

    const yaEstaPostulado = nuevaVozP === usuario || nuevosCoros.includes(usuario) || nuevoPiano === usuario || nuevaGuitarra === usuario || nuevoBajo === usuario || nuevaBateria === usuario;
    if (yaEstaPostulado) { alert(`⚠️ Ya estás postulado en este servicio.`); setModalPostularVisible(false); return; }

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

  const liberarRol = async (idServicio, categoria) => {
    if (!esAdminOLider) { alert("⚠️ No tienes permisos para liberar esta postulación."); return; }
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

    const actualizados = servicios.map((s) => s.id === idServicio ? { ...s, voces: nVoces, instrumentos: nInst } : s);
    setServicios(actualizados);
    await supabase.from("servicios").update({ voces: nVoces, instrumentos: nInst }).eq("id", idServicio);
    alert("🔄 Rol liberado.");
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
            placeholder="Ej. Admin, Lina..."
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

          <View style={{ marginTop: 6 }}>
            <TouchableOpacity style={[styles.loginButton, { backgroundColor: t.primary, marginBottom: 10 }]} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
            <Text style={{ color: t.textSub, textAlign: "center", fontSize: 11, marginTop: 6 }}>
              ℹ️ Los nuevos usuarios deben ser creados por el Líder o Administrador desde la pestaña de equipo.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // MODO EN VIVO (ESTILO TELEPROMPTER ADAPTABLE A CUALQUIER PANTALLA)
  if (modoEnVivoActivo) {
    const cancionActualEnVivo = setlistEnVivoActual[indiceCancionEnVivo];
    const objetoRepertorioEnVivo = repertorio.find(r => r.titulo.toLowerCase() === cancionActualEnVivo?.titulo.toLowerCase());
    const letraMostrar = objetoRepertorioEnVivo ? objetoRepertorioEnVivo.letra : "[INTRO]\nLetra no disponible en biblioteca.";
    const bpmActual = objetoRepertorioEnVivo?.bpm || cancionActualEnVivo?.bpm || "120";

    return (
      <View style={[styles.teleprompterContainer, { backgroundColor: "#0B0F19" }]}>
        <View style={styles.teleprompterTopBar}>
          <TouchableOpacity 
            style={styles.teleprompterExitBtn}
            onPress={() => { setModoEnVivoActivo(false); setMetronomoActivo(false); setAvanceAutomaticoActivo(false); }}
          >
            <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 13 }}>✕ Salir de Escenario</Text>
          </TouchableOpacity>
          <Text style={{ color: "#94A3B8", fontSize: 14, fontWeight: "bold" }}>
            Canción {indiceCancionEnVivo + 1} de {setlistEnVivoActual.length}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.teleprompterScrollContent}>
          <View style={styles.teleprompterCard}>
            <View style={styles.teleprompterHeaderRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ color: "#38BDF8", fontSize: 11, fontWeight: "bold", marginBottom: 2 }}>EN VIVO:</Text>
                <Text style={styles.teleprompterSongTitle} numberOfLines={1}>{cancionActualEnVivo?.titulo}</Text>
              </View>
              <View style={styles.teleprompterToneBox}>
                <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "bold" }}>Tono: {cancionActualEnVivo?.tono}</Text>
              </View>
            </View>

            <View style={styles.teleprompterControlsRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: pulsoActivo ? "#22C55E" : "#64748B" }} />
                <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "bold" }}>⚡ {bpmActual} BPM</Text>
              </View>

              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                <TouchableOpacity
                  style={[styles.teleprompterActionBtn, { backgroundColor: metronomoActivo ? "#EF4444" : "#22C55E" }]}
                  onPress={() => setMetronomoActivo(!metronomoActivo)}
                >
                  <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 12 }}>
                    {metronomoActivo ? "⏹️ Detener Click" : "▶️ Iniciar Click"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.teleprompterActionBtn, { backgroundColor: avanceAutomaticoActivo ? "#F97316" : "#334155" }]}
                  onPress={() => setAvanceAutomaticoActivo(!avanceAutomaticoActivo)}
                >
                  <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 12 }}>
                    {avanceAutomaticoActivo ? "⏱️ Auto: ON" : "⏱️ Auto: OFF"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.teleprompterLyricsBox}>
            <Text style={styles.teleprompterLyricsText}>
              {transponerTextoLetra(letraMostrar, 0)}
            </Text>
          </View>

          <View style={styles.teleprompterNavRow}>
            <TouchableOpacity
              style={[
                styles.teleprompterNavBtn,
                { backgroundColor: "#334155" },
                indiceCancionEnVivo === 0 && { opacity: 0.4 }
              ]}
              disabled={indiceCancionEnVivo === 0}
              onPress={() => setIndiceCancionEnVivo(prev => Math.max(0, prev - 1))}
            >
              <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 14 }}>← Anterior</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.teleprompterNavBtn,
                { backgroundColor: "#3B82F6" },
                indiceCancionEnVivo >= setlistEnVivoActual.length - 1 && { opacity: 0.4 }
              ]}
              disabled={indiceCancionEnVivo >= setlistEnVivoActual.length - 1}
              onPress={() => setIndiceCancionEnVivo(prev => Math.min(setlistEnVivoActual.length - 1, prev + 1))}
            >
              <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 14 }}>Siguiente →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }, tapizActual.css]}>
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
                      style={{ paddingVertical: 4, paddingHorizontal: 6, borderRadius: 4, backgroundColor: activo ? t.primary : t.bg, borderWidth: 1, borderColor: t.border }}
                      onPress={() => setNombreTema(itemTema.key)}
                    >
                      <Text style={{ fontSize: 10, color: activo ? "#FFFFFF" : t.textMain, fontWeight: activo ? "bold" : "normal" }}>
                        {itemTema.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={{ fontSize: 11, color: t.textSub, fontWeight: "bold", marginTop: 4 }}>Tapiz:</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                {Object.keys(PAPELES_TAPIZ).map((keyTapiz) => {
                  const activoTapiz = nombreTapiz === keyTapiz;
                  const tapizObj = PAPELES_TAPIZ[keyTapiz];
                  return (
                    <TouchableOpacity
                      key={keyTapiz}
                      style={{ paddingVertical: 4, paddingHorizontal: 6, borderRadius: 4, backgroundColor: activoTapiz ? t.primary : t.bg, borderWidth: 1, borderColor: t.border }}
                      onPress={() => setNombreTapiz(keyTapiz)}
                    >
                      <Text style={{ fontSize: 10, color: activoTapiz ? "#FFFFFF" : t.textMain, fontWeight: activoTapiz ? "bold" : "normal" }}>
                        {tapizObj.nombre}
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
                                      setTextoOriginalEditando(m.texto);
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

                {idMensajeEditando !== null && (
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6, backgroundColor: t.primary + "33", padding: 6, borderRadius: 4 }}>
                    <Text style={{ color: t.textMain, fontSize: 11 }}>✏️ Corrigiendo tu mensaje (Ortografía):</Text>
                    <TouchableOpacity onPress={() => { setIdMensajeEditando(null); setTextoOriginalEditando(""); setNuevoMensajeTexto(""); }}>
                      <Text style={{ color: "#EF4444", fontSize: 11, fontWeight: "bold" }}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={{ flexDirection: "row", gap: 6 }}>
                  <TextInput
                    style={[styles.loginInput, { flex: 1, backgroundColor: t.bg, borderColor: t.border, color: t.textMain, marginBottom: 0, padding: 8, fontSize: 13 }]}
                    placeholder={idMensajeEditando !== null ? "Corrige tu mensaje aquí..." : `Escribir en el chat de ${sedeActual.nombre}...`}
                    placeholderTextColor={t.textSub}
                    value={nuevoMensajeTexto}
                    onChangeText={setNuevoMensajeTexto}
                  />
                  <TouchableOpacity
                    style={[styles.loginButton, { backgroundColor: idMensajeEditando !== null ? "#22C55E" : t.primary, justifyContent: "center", paddingVertical: 8, paddingHorizontal: 14 }]}
                    onPress={enviarOActualizarMensajeChat}
                  >
                    <Text style={[styles.loginButtonText, { fontSize: 12 }]}>{idMensajeEditando !== null ? "Actualizar" : "Enviar"}</Text>
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
                        {item.postulado && <View style={{ position: "absolute", top: 2, right: 2, backgroundColor: "#22C55E", width: 6, height: 6, borderRadius: 3 }} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.serviceSectionHeader}>
                <Text style={[styles.serviceSectionTitle, { color: t.textMain }]}>
                  Servicios de {sedeActual.nombre} - Día {diaSeleccionado} de {mesSeleccionadoObj.nombre} ({serviciosDelDia.length})
                </Text>

                {esAdminOLider && (
                  <TouchableOpacity
                    style={[styles.programBtn, { backgroundColor: t.primary }]}
                    onPress={() => {
                      setIdServicioEditando(null);
                      setNombreEvento(esDomingoSeleccionado ? "Culto Dominical" : "Culto");
                      setObservaciones("");
                      setPaletaSeleccionadaModal(null);
                      setSetlistActivo([]);
                      setCancionLentaSeleccionada("");
                      setCancionRapidaSeleccionada("");
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

                  <Text style={[styles.inputLabel, { color: t.textMain }]}>Nombre del evento / servicio</Text>
                  <TextInput
                    style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
                    placeholder="Ej. Culto Dominical"
                    placeholderTextColor={t.textSub}
                    value={nombreEvento}
                    onChangeText={setNombreEvento}
                  />

                  <Text style={[styles.inputLabel, { color: t.textMain }]}>Observaciones Técnicas</Text>
                  <TextInput
                    style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
                    placeholder="Ej. Prueba de sonido a las 8:00 AM"
                    placeholderTextColor={t.textSub}
                    value={observaciones}
                    onChangeText={setObservaciones}
                  />

                  {esDomingoSeleccionado && (
                    <View style={{ marginBottom: 12 }}>
                      <Text style={[styles.inputLabel, { color: t.textMain, fontWeight: "bold" }]}>🎨 Seleccionar Paleta para este Servicio:</Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                        {paletasCulto.map((p) => {
                          const esSeleccionadaModal = paletaSeleccionadaModal?.id === p.id;
                          return (
                            <TouchableOpacity
                              key={p.id}
                              style={[
                                { width: "48%", padding: 8, borderRadius: 6, borderWidth: 1, borderColor: t.border, backgroundColor: t.bg },
                                esSeleccionadaModal && { borderColor: t.primary, borderWidth: 2 },
                              ]}
                              onPress={() => setPaletaSeleccionadaModal(p)}
                            >
                              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                <Text style={{ color: t.textMain, fontSize: 11, fontWeight: "bold" }}>{p.nombre}</Text>
                                {esSeleccionadaModal && <Text style={{ color: t.primary, fontSize: 10, fontWeight: "bold" }}>✓</Text>}
                              </View>
                              <View style={{ flexDirection: "row", height: 12, borderRadius: 2, overflow: "hidden" }}>
                                {p.colores.map((hex, idx) => <View key={idx} style={{ flex: 1, backgroundColor: hex }} />)}
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  <Text style={[styles.inputLabel, { color: t.textMain, fontWeight: "bold", marginTop: 8 }]}>Organización del Setlist</Text>
                  <Text style={[styles.inputLabel, { color: t.textSub, fontSize: 12, marginBottom: 4 }]}>Setlist Activo ({setlistActivo.length}):</Text>

                  {setlistActivo.length === 0 ? (
                    <Text style={{ color: t.textSub, fontSize: 12, fontStyle: "italic", marginBottom: 10 }}>No hay canciones en el setlist. Selecciona de las listas inferiores.</Text>
                  ) : (
                    setlistActivo.map((cancion, index) => (
                      <View key={cancion.id || index} style={[styles.setlistItemRow, { backgroundColor: t.bg, borderColor: t.border }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: t.textMain, fontSize: 13, fontWeight: "bold" }}>{index + 1}. {cancion.titulo}</Text>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <Text style={{ color: t.textSub, fontSize: 11 }}>T:</Text>
                          <TextInput
                            style={{
                              backgroundColor: t.cardBg,
                              color: t.textMain,
                              borderWidth: 1,
                              borderColor: t.border,
                              borderRadius: 4,
                              width: 32,
                              height: 30,
                              textAlign: "center",
                              fontSize: 11,
                              fontWeight: "bold",
                            }}
                            value={cancion.tono}
                            onChangeText={(nuevoTono) => {
                              const actualizado = [...setlistActivo];
                              actualizado[index].tono = nuevoTono;
                              setSetlistActivo(actualizado);
                            }}
                          />
                          <Text style={{ color: t.textSub, fontSize: 11, marginLeft: 4 }}>BPM:</Text>
                          <TextInput
                            style={{
                              backgroundColor: t.cardBg,
                              color: t.textMain,
                              borderWidth: 1,
                              borderColor: t.border,
                              borderRadius: 4,
                              width: 38,
                              height: 30,
                              textAlign: "center",
                              fontSize: 11,
                              fontWeight: "bold",
                            }}
                            value={cancion.bpm || "120"}
                            onChangeText={(nuevoBpm) => {
                              const actualizado = [...setlistActivo];
                              actualizado[index].bpm = nuevoBpm;
                              setSetlistActivo(actualizado);
                            }}
                          />

                          <TouchableOpacity 
                            style={[styles.smallButton, { backgroundColor: t.cardBg, borderColor: t.border }]} 
                            onPress={() => moverCancionArriba(index)}
                          >
                            <Text style={[styles.smallButtonText, { color: t.primary }]}>▲</Text>
                          </TouchableOpacity>

                          <TouchableOpacity 
                            style={[styles.smallButton, { backgroundColor: t.cardBg, borderColor: t.border }]} 
                            onPress={() => moverCancionAbajo(index)}
                          >
                            <Text style={[styles.smallButtonText, { color: t.primary }]}>▼</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={{ backgroundColor: "#EF4444", width: 30, height: 30, borderRadius: 6, justifyContent: "center", alignItems: "center" }}
                            onPress={() => {
                              const filtrado = setlistActivo.filter((_, i) => i !== index);
                              setSetlistActivo(filtrado);
                            }}
                          >
                            <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "bold" }}>X</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}

                  {/* BLOQUE DE SELECTORES LENTAS Y RÁPIDAS CORREGIDO */}
                  {(() => {
                    const titulosEnSetlist = setlistActivo.map(s => s.titulo.toLowerCase());
                    const cancionesDisponibles = repertorio
                      .filter(c => !titulosEnSetlist.includes(c.titulo.toLowerCase()))
                      .sort((a, b) => a.titulo.localeCompare(b.titulo));

                    const lentasDisponibles = cancionesDisponibles.filter(c => {
                      const tSet = (c.tipoSet || "").toLowerCase();
                      return tSet === "lenta";
                    });

                    const rapidasDisponibles = cancionesDisponibles.filter(c => {
                      const tSet = (c.tipoSet || "").toLowerCase();
                      return tSet === "rapida" || tSet === "";
                    });

                    return (
                      <View style={{ marginTop: 10, gap: 10 }}>
                        {/* SELECTOR 1: SET LENTAS */}
                        <View style={{ backgroundColor: t.bg, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: t.border }}>
                          <Text style={[styles.inputLabel, { color: t.textMain, fontWeight: "bold", marginBottom: 6 }]}>🕯️ Set Lentas:</Text>
                          {lentasDisponibles.length === 0 ? (
                            <Text style={{ color: t.textSub, fontSize: 12, fontStyle: "italic" }}>No hay canciones lentas disponibles.</Text>
                          ) : (
                            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                              {Platform.OS === "web" ? (
                                <select
                                  value={cancionLentaSeleccionada}
                                  onChange={(e) => setCancionLentaSeleccionada(e.target.value)}
                                  style={{
                                    flex: 1,
                                    backgroundColor: t.cardBg,
                                    color: t.textMain,
                                    borderColor: t.border,
                                    borderWidth: "1px",
                                    borderRadius: "8px",
                                    padding: "8px",
                                    fontSize: "13px",
                                    outline: "none",
                                    cursor: "pointer",
                                  }}
                                >
                                  <option value="" disabled style={{ backgroundColor: t.cardBg, color: t.textSub }}>
                                    -- Selecciona canción lenta --
                                  </option>
                                  {lentasDisponibles.map((c) => (
                                    <option key={c.id} value={c.titulo} style={{ backgroundColor: t.cardBg, color: t.textMain }}>
                                      {c.titulo} ({c.tono} • {c.bpm || "120"} BPM)
                                    </option>
                                  ))}
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
                              <TouchableOpacity
                                style={[styles.loginButton, { backgroundColor: t.primary, paddingVertical: 8, paddingHorizontal: 12 }]}
                                onPress={() => {
                                  let target = cancionLentaSeleccionada;
                                  if (!target && lentasDisponibles.length > 0) target = lentasDisponibles[0].titulo;
                                  if (target) {
                                    const obj = repertorio.find(r => r.titulo.toLowerCase() === target.toLowerCase());
                                    setSetlistActivo([...setlistActivo, { titulo: target, tono: obj ? obj.tono : "C", bpm: obj ? (obj.bpm || "90") : "90" }]);
                                    setCancionLentaSeleccionada("");
                                  } else {
                                    alert("⚠️ Selecciona una canción lenta.");
                                  }
                                }}
                              >
                                <Text style={[styles.loginButtonText, { fontSize: 12 }]}>+ Agregar</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>

                        {/* SELECTOR 2: SET RÁPIDAS */}
                        <View style={{ backgroundColor: t.bg, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: t.border }}>
                          <Text style={[styles.inputLabel, { color: t.textMain, fontWeight: "bold", marginBottom: 6 }]}>⚡ Set Rápidas:</Text>
                          {rapidasDisponibles.length === 0 ? (
                            <Text style={{ color: t.textSub, fontSize: 12, fontStyle: "italic" }}>No hay canciones rápidas disponibles.</Text>
                          ) : (
                            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                              {Platform.OS === "web" ? (
                                <select
                                  value={cancionRapidaSeleccionada}
                                  onChange={(e) => setCancionRapidaSeleccionada(e.target.value)}
                                  style={{
                                    flex: 1,
                                    backgroundColor: t.cardBg,
                                    color: t.textMain,
                                    borderColor: t.border,
                                    borderWidth: "1px",
                                    borderRadius: "8px",
                                    padding: "8px",
                                    fontSize: "13px",
                                    outline: "none",
                                    cursor: "pointer",
                                  }}
                                >
                                  <option value="" disabled style={{ backgroundColor: t.cardBg, color: t.textSub }}>
                                    -- Selecciona canción rápida --
                                  </option>
                                  {rapidasDisponibles.map((c) => (
                                    <option key={c.id} value={c.titulo} style={{ backgroundColor: t.cardBg, color: t.textMain }}>
                                      {c.titulo} ({c.tono} • {c.bpm || "120"} BPM)
                                    </option>
                                  ))}
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
                              <TouchableOpacity
                                style={[styles.loginButton, { backgroundColor: t.primary, paddingVertical: 8, paddingHorizontal: 12 }]}
                                onPress={() => {
                                  let target = cancionRapidaSeleccionada;
                                  if (!target && rapidasDisponibles.length > 0) target = rapidasDisponibles[0].titulo;
                                  if (target) {
                                    const obj = repertorio.find(r => r.titulo.toLowerCase() === target.toLowerCase());
                                    setSetlistActivo([...setlistActivo, { titulo: target, tono: obj ? obj.tono : "C", bpm: obj ? (obj.bpm || "120") : "120" }]);
                                    setCancionRapidaSeleccionada("");
                                  } else {
                                    alert("⚠️ Selecciona una canción rápida.");
                                  }
                                }}
                              >
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
                          const [yS, mS, dS] = fechaActualClave.split("-").map(Number);
                          const esDomingoReal = new Date(yS, mS - 1, dS).getDay() === 0;
                          const paletaFinal = esDomingoReal ? paletaSeleccionadaModal : null;

                          if (idServicioEditando !== null) {
                            const actualizados = servicios.map((s) =>
                              s.id === idServicioEditando
                                ? { ...s, titulo: nombreEvento, observaciones: observaciones || "Sin observaciones", setlist: setlistActivo, paletaSeleccionada: paletaFinal }
                                : s
                            );
                            setServicios(actualizados);
                            await supabase.from("servicios").update({
                              titulo: nombreEvento,
                              observaciones: observaciones || "Sin observaciones",
                              setlist: setlistActivo,
                              paleta_seleccionada: paletaFinal,
                            }).eq("id", idServicioEditando);
                            alert("✅ Servicio actualizado con éxito.");
                          } else {
                            const nuevoId = Date.now();
                            const nuevoServicioObj = {
                              id: nuevoId,
                              fecha: fechaActualClave,
                              titulo: nombreEvento,
                              observaciones: observaciones || "Sin observaciones",
                              setlist: setlistActivo,
                              paletaSeleccionada: paletaFinal,
                              voces: { principal: "Sin asignar", coros: "Sin asignar" },
                              instrumentos: { piano: "Sin asignar", guitarra: "Sin asignar", bajo: "Sin asignar", bateria: "Sin asignar" },
                              sede_id: sedeIdSeleccionada,
                            };
                            setServicios([...servicios, nuevoServicioObj]);
                            await supabase.from("servicios").insert([{
                              id: nuevoId,
                              fecha: fechaActualClave,
                              titulo: nombreEvento,
                              observaciones: observaciones || "Sin observaciones",
                              setlist: setlistActivo,
                              paleta_seleccionada: paletaFinal,
                              voces: { principal: "Sin asignar", coros: "Sin asignar" },
                              instrumentos: { piano: "Sin asignar", guitarra: "Sin asignar", bajo: "Sin asignar", bateria: "Sin asignar" },
                              sede_id: sedeIdSeleccionada,
                            }]);
                            alert(`✅ Nuevo servicio programado en ${sedeActual.nombre}.`);
                          }
                          setModalProgramarVisible(false);
                          setIdServicioEditando(null);
                        } else { alert("⚠️ Por favor ingresa el nombre del evento."); }
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
                  <Text style={[styles.cardTitle, { color: t.textMain, fontSize: 17, marginBottom: 6 }]}>✨ Selecciona tu Rol para Postularte</Text>
                  <Text style={{ color: t.textSub, fontSize: 12, marginBottom: 14 }}>Elige en qué posición deseas servir en este servicio:</Text>

                  {[
                    { key: "vozPrincipal", label: "🎤 Voz Principal (Máx. 1)" },
                    { key: "coros", label: "👥 Coros (Máx. 3)" },
                    { key: "piano", label: "🎹 Piano (Máx. 1)" },
                    { key: "guitarra", label: "🎸 Guitarra (Máx. 1)" },
                    { key: "bajo", label: "🎸 Bajo (Máx. 1)" },
                    { key: "bateria", label: "🥁 Batería (Máx. 1)" },
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
                serviciosDelDia.map((serv) => {
                  const [yS, mS, dS] = serv.fecha.split("-").map(Number);
                  const esDomingoServicio = new Date(yS, mS - 1, dS).getDay() === 0;

                  return (
                    <View key={serv.id} style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border, marginBottom: 16 }]}>
                      <View style={styles.eventCardHeaderRow}>
                        <Text style={[styles.eventMainTitle, { color: t.textMain }]}>📅 {serv.titulo}</Text>
                        {esAdminOLider && (
                          <View style={{ flexDirection: "row", gap: 6 }}>
                            <TouchableOpacity
                              style={styles.editServiceBtn}
                              onPress={() => {
                                setIdServicioEditando(serv.id);
                                setNombreEvento(serv.titulo);
                                setObservaciones(serv.observaciones);
                                setPaletaSeleccionadaModal(serv.paletaSeleccionada || paletasCulto[0] || null);
                                setSetlistActivo(serv.setlist || []);
                                setCancionLentaSeleccionada("");
                                setCancionRapidaSeleccionada("");
                                setModalProgramarVisible(true);
                              }}
                            >
                              <Text style={{ fontSize: 11, color: "#FFFFFF", fontWeight: "bold" }}>✏️ Modificar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.deleteServiceBtn}
                              onPress={async () => {
                                setServicios(servicios.filter((s) => s.id !== serv.id));
                                await supabase.from("servicios").delete().eq("id", serv.id);
                              }}
                            >
                              <Text style={{ fontSize: 11, color: "#FFFFFF", fontWeight: "bold" }}>🗑️ Eliminar</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                      <Text style={{ color: t.textSub, fontSize: 12, marginTop: 4, marginBottom: 4 }}>Observaciones: {serv.observaciones}</Text>

                      {esDomingoServicio && serv.paletaSeleccionada && (
                        <View style={{ marginVertical: 8, padding: 8, backgroundColor: t.bg, borderRadius: 6, borderWidth: 1, borderColor: t.border }}>
                          <Text style={{ color: t.textMain, fontSize: 11, fontWeight: "bold", marginBottom: 4 }}>🎨 Paleta del Culto: {serv.paletaSeleccionada.nombre}</Text>
                          <View style={{ flexDirection: "row", height: 14, borderRadius: 3, overflow: "hidden" }}>
                            {serv.paletaSeleccionada.colores.map((hex, idx) => <View key={idx} style={{ flex: 1, backgroundColor: hex }} />)}
                          </View>
                        </View>
                      )}

                      <Text style={{ color: t.primary, fontSize: 13, fontWeight: "bold", marginTop: 6, marginBottom: 6 }}>🎵 SETLIST ({serv.setlist?.length || 0}):</Text>
                      {serv.setlist && serv.setlist.length > 0 ? (
                        serv.setlist.map((s, i) => (
                          <View key={i} style={{ backgroundColor: t.bg, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: t.border, marginBottom: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Text style={{ color: t.textMain, fontSize: 13, fontWeight: "bold" }}>
                              {i + 1}. {s.titulo} <Text style={{ color: t.textSub, fontWeight: "normal" }}>(Tono: {s.tono} | {s.bpm || "120"} BPM)</Text>
                            </Text>
                          </View>
                        ))
                      ) : (
                        <Text style={{ color: t.textSub, fontSize: 12, marginLeft: 8, fontStyle: "italic" }}>Sin canciones agregadas al setlist.</Text>
                      )}

                      {serv.setlist && serv.setlist.length > 0 && (
                        <TouchableOpacity
                          style={{ backgroundColor: "#2563EB", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 8, marginBottom: 10 }}
                          onPress={() => {
                            setSetlistEnVivoActual(serv.setlist);
                            setIndiceCancionEnVivo(0);
                            setModoEnVivoActivo(true);
                            setMetronomoActivo(false);
                            setAvanceAutomaticoActivo(false);
                          }}
                        >
                          <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 15 }}>▶️ Modo en vivo</Text>
                        </TouchableOpacity>
                      )}

                      <View style={styles.columnsContainer}>
                        <View style={[styles.columnBox, { backgroundColor: t.bg, borderColor: t.border }]}>
                          <Text style={[styles.columnHeaderTitle, { color: t.primary }]}>🎤 VOCES</Text>
                          <View style={styles.roleRowClean}>
                            <Text style={{ color: t.textMain, fontSize: 11 }} numberOfLines={1}>
                              • Principal: <Text style={{ fontWeight: "bold" }}>{serv.voces?.principal || "Sin asignar"}</Text>
                            </Text>
                            {serv.voces?.principal && serv.voces?.principal !== "Sin asignar" && esAdminOLider && (
                              <TouchableOpacity onPress={() => liberarRol(serv.id, "vozPrincipal")}>
                                <Text style={{ color: "#EF4444", fontSize: 10, fontWeight: "bold" }}>❌</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                          <View style={styles.roleRowClean}>
                            <Text style={{ color: t.textMain, fontSize: 11 }} numberOfLines={1}>
                              • Coros: <Text style={{ fontWeight: "bold" }}>{serv.voces?.coros || "Sin asignar"}</Text>
                            </Text>
                            {serv.voces?.coros && serv.voces?.coros !== "Sin asignar" && esAdminOLider && (
                              <TouchableOpacity onPress={() => liberarRol(serv.id, "coros")}>
                                <Text style={{ color: "#EF4444", fontSize: 10, fontWeight: "bold" }}>❌</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>

                        <View style={[styles.columnBox, { backgroundColor: t.bg, borderColor: t.border }]}>
                          <Text style={[styles.columnHeaderTitle, { color: t.primary }]}>🎸 INSTRUMENTOS</Text>
                          {["piano", "guitarra", "bajo", "bateria"].map((instKey) => {
                            const valInst = serv.instrumentos?.[instKey] || "Sin asignar";
                            return (
                              <View key={instKey} style={styles.roleRowClean}>
                                <Text style={{ color: t.textMain, fontSize: 11 }} numberOfLines={1}>
                                  • {instKey.charAt(0).toUpperCase() + instKey.slice(1)}: <Text style={{ fontWeight: "bold" }}>{valInst}</Text>
                                </Text>
                                {valInst !== "Sin asignar" && esAdminOLider && (
                                  <TouchableOpacity onPress={() => liberarRol(serv.id, instKey)}>
                                    <Text style={{ color: "#EF4444", fontSize: 10, fontWeight: "bold" }}>❌</Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            );
                          })}
                        </View>
                      </View>

                      <View style={{ marginTop: 14, gap: 8 }}>
                        <TouchableOpacity style={styles.whatsappBtn} onPress={() => enviarPorWhatsApp(serv)}>
                          <Text style={styles.actionBtnText}>🚀 Enviar setlist por WhatsApp</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.postulateBtn}
                          onPress={() => { setIdServicioPostulando(serv.id); setModalPostularVisible(true); }}
                        >
                          <Text style={styles.actionBtnText}>Postularme (Confirmar asistencia)</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
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
                    {idMiembroEditando !== null ? "✏️ Modificar Miembro" : `➕ Nuevo Miembro en ${sedeActual.nombre}`}
                  </Text>

                  <Text style={[styles.inputLabel, { color: t.textMain }]}>Nombre del integrante</Text>
                  <TextInput
                    style={[styles.loginInput, { backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain, marginBottom: 10 }]}
                    placeholder="Ej. Lina"
                    placeholderTextColor={t.textSub}
                    value={nombreNuevoMiembro}
                    onChangeText={setNombreNuevoMiembro}
                  />

                  <Text style={[styles.inputLabel, { color: t.textMain }]}>PIN de acceso a la app</Text>
                  <TextInput
                    style={[styles.loginInput, { backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain, marginBottom: 10 }]}
                    placeholder="Ej. 1234"
                    placeholderTextColor={t.textSub}
                    value={pinNuevoMiembro}
                    onChangeText={setPinNuevoMiembro}
                  />

                  <Text style={[styles.inputLabel, { color: t.textMain }]}>Rol en el sistema (Permisos):</Text>
                  <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
                    {[
                      ...(esAdmin ? [{ key: "admin", label: "👑 Admin" }] : []),
                      ...(esAdmin ? [{ key: "lider", label: "⭐ Líder" }] : []),
                      { key: "miembro", label: "👤 General" },
                    ].map((rObj) => {
                      const seleccionado = rolAccesoNuevo === rObj.key;
                      return (
                        <TouchableOpacity
                          key={rObj.key}
                          style={[
                            { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 6, borderWidth: 1, borderColor: t.border, backgroundColor: t.cardBg },
                            seleccionado && { backgroundColor: t.primary, borderColor: t.primary },
                          ]}
                          onPress={() => setRolAccesoNuevo(rObj.key)}
                        >
                          <Text style={{ color: seleccionado ? "#FFF" : t.textMain, fontSize: 11, fontWeight: "bold" }}>{rObj.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={[styles.inputLabel, { color: t.textMain }]}>Roles Musicales (Instrumentos / Voces):</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                    {["🎤 Voz Principal", "🎤 Coros", "🎹 Piano", "🎸 Guitarra", "🎸 Bajo", "🥁 Batería"].map((rolM) => {
                      const seleccionado = rolesMusicalesNuevo.includes(rolM);
                      return (
                        <TouchableOpacity
                          key={rolM}
                          style={[
                            styles.chipRole,
                            { backgroundColor: t.cardBg, borderColor: t.border },
                            seleccionado && { backgroundColor: t.primary, borderColor: t.primary },
                          ]}
                          onPress={() => {
                            if (seleccionado) {
                              setRolesMusicalesNuevo(rolesMusicalesNuevo.filter((r) => r !== rolM));
                            } else {
                              setRolesMusicalesNuevo([...rolesMusicalesNuevo, rolM]);
                            }
                          }}
                        >
                          <Text style={{ color: seleccionado ? "#FFF" : t.textMain, fontSize: 11 }}>{rolM}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      style={[styles.loginButton, { flex: 1, backgroundColor: t.primary, padding: 10 }]}
                      onPress={async () => {
                        if (nombreNuevoMiembro.trim() !== "") {
                          if (idMiembroEditando !== null) {
                            const actualizado = {
                              nombre: nombreNuevoMiembro.trim(),
                              pin: pinNuevoMiembro.trim() || "1234",
                              sede_id: sedeIdSeleccionada,
                              rol_acceso: rolAccesoNuevo,
                              roles_musicales: rolesMusicalesNuevo,
                            };
                            const { error } = await supabase.from("integrantes").update(actualizado).eq("id", idMiembroEditando);
                            if (!error) {
                              alert("✅ Miembro actualizado correctamente.");
                              await cargarIntegrantesSupabase();
                              setModalMiembroVisible(false);
                              setIdMiembroEditando(null);
                            } else { alert(`⚠️ Error al actualizar: ${error.message}`); }
                          } else {
                            const nuevoId = Date.now();
                            const nuevoIntegranteObj = {
                              id: nuevoId,
                              nombre: nombreNuevoMiembro.trim(),
                              pin: pinNuevoMiembro.trim() || "1234",
                              sede_id: sedeIdSeleccionada,
                              rol_acceso: rolAccesoNuevo,
                              roles_musicales: rolesMusicalesNuevo,
                            };
                            const { error } = await supabase.from("integrantes").insert([nuevoIntegranteObj]);
                            if (!error) {
                              alert(`✅ Miembro agregado con éxito en ${sedeActual.nombre}.`);
                              await cargarIntegrantesSupabase();
                              setModalMiembroVisible(false);
                            } else { alert(`⚠️ Error al guardar en Supabase: ${error.message}`); }
                          }
                        } else { alert("⚠️ Ingresa el nombre del integrante."); }
                      }}
                    >
                      <Text style={[styles.loginButtonText, { fontSize: 13 }]}>Guardar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.loginButton, { flex: 1, backgroundColor: "#EF4444", padding: 10 }]}
                      onPress={() => { setModalMiembroVisible(false); setIdMiembroEditando(null); }}
                    >
                      <Text style={[styles.loginButtonText, { fontSize: 13 }]}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {integrantesSeccionEquipo.map((int) => {
                const esAdminOEsLiderObjetivo = int.rolAcceso === "admin" || int.rolAcceso === "lider";
                const puedeModificarEste = esAdmin || !esAdminOEsLiderObjetivo;

                return (
                  <View key={int.id} style={[styles.memberCard, { backgroundColor: t.bg, borderColor: t.border }]}>
                    <View style={styles.memberHeaderRow}>
                      <Text style={[styles.memberTitle, { color: t.textMain }]}>
                        👤 {int.nombre} {int.sedeId !== "general" ? `(${int.sedeId.toUpperCase()})` : "(GENERAL)"}
                      </Text>
                      {puedeModificarEste && (
                        <View style={{ flexDirection: "row", gap: 6 }}>
                          <TouchableOpacity
                            style={{ backgroundColor: "#3B82F6", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 }}
                            onPress={() => {
                              setIdMiembroEditando(int.id);
                              setNombreNuevoMiembro(int.nombre);
                              setPinNuevoMiembro(int.pin || "1234");
                              setRolAccesoNuevo(int.rolAcceso || "miembro");
                              setRolesMusicalesNuevo(int.rolesMusicales || []);
                              setModalMiembroVisible(true);
                            }}
                          >
                            <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "bold" }}>✏️ Modificar</Text>
                          </TouchableOpacity>
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
                      )}
                    </View>
                    <Text style={{ color: t.primary, fontSize: 12, marginBottom: 2 }}>
                      🎵 Roles: {int.rolesMusicales ? int.rolesMusicales.join(", ") : "Sin rol musical"}
                    </Text>
                    <Text style={{ color: t.textSub, fontSize: 11 }}>
                      🔑 Acceso: <Text style={{ fontWeight: "bold", color: t.textMain }}>{(int.rolAcceso || "miembro").toUpperCase()}</Text> (PIN: {int.pin || "1234"})
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {pestana === "repertorio" && (
            <>
              {cancionSeleccionadaDetalle !== null ? (
                <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <TouchableOpacity
                      style={{ backgroundColor: t.bg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: t.border }}
                      onPress={() => {
                        setCancionSeleccionadaDetalle(null);
                        setModoEdicionCancion(false);
                        setSemitonosTransposicion(0);
                        setModoVisualizacionRepertorio("Acordes");
                      }}
                    >
                      <Text style={{ color: t.textMain, fontSize: 12, fontWeight: "bold" }}>← Volver al repertorio</Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: t.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: t.border }}>
                      <Text style={{ color: t.textSub, fontSize: 11 }}>Tono:</Text>
                      <TouchableOpacity style={{ padding: 4 }} onPress={() => setSemitonosTransposicion(prev => prev - 1)}>
                        <Text style={{ color: t.primary, fontWeight: "bold", fontSize: 16 }}>-</Text>
                      </TouchableOpacity>
                      <Text style={{ color: t.textMain, fontWeight: "bold", fontSize: 13 }}>
                        {transponerNotaUnica(cancionSeleccionadaDetalle.tono || "C", semitonosTransposicion)}
                      </Text>
                      <TouchableOpacity style={{ padding: 4 }} onPress={() => setSemitonosTransposicion(prev => prev + 1)}>
                        <Text style={{ color: t.primary, fontWeight: "bold", fontSize: 16 }}>+</Text>
                      </TouchableOpacity>
                    </View>

                    {puedeControlarRepertorio && (
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        <TouchableOpacity
                          style={{ backgroundColor: "#3B82F6", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
                          onPress={() => {
                            setModoEdicionCancion(true);
                            setNuevoTituloCancion(cancionSeleccionadaDetalle.titulo);
                            setNuevoArtistaCancion(cancionSeleccionadaDetalle.artista);
                            setNuevoTonoCancion(cancionSeleccionadaDetalle.tono);
                            setNuevoBpmCancion(cancionSeleccionadaDetalle.bpm || "120");
                            setNuevoTipoSetCancion(cancionSeleccionadaDetalle.tipoSet || "lenta");
                            setNuevaLetraCancion(cancionSeleccionadaDetalle.letra || "");
                            setEtiquetasActuales(cancionSeleccionadaDetalle.etiquetas || []);
                          }}
                        >
                          <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "bold" }}>✏️ Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{ backgroundColor: "#EF4444", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
                          onPress={() => eliminarCancionRepertorio(cancionSeleccionadaDetalle.id)}
                        >
                          <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "bold" }}>🗑️ Eliminar</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {modoEdicionCancion ? (
                    <View>
                      <Text style={[styles.cardTitle, { color: t.textMain, fontSize: 18, marginBottom: 14 }]}>✏️ Editar Canción</Text>
                      <Text style={[styles.inputLabel, { color: t.textMain }]}>Título</Text>
                      <TextInput
                        style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
                        value={nuevoTituloCancion}
                        onChangeText={setNuevoTituloCancion}
                      />
                      <Text style={[styles.inputLabel, { color: t.textMain }]}>Artista o autor</Text>
                      <TextInput
                        style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
                        value={nuevoArtistaCancion}
                        onChangeText={setNuevoArtistaCancion}
                      />
                      <View style={{ flexDirection: "row", gap: 10 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.inputLabel, { color: t.textMain }]}>Tonalidad</Text>
                          <TextInput
                            style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
                            value={nuevoTonoCancion}
                            onChangeText={setNuevoTonoCancion}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.inputLabel, { color: t.textMain }]}>BPM (Pulso)</Text>
                          <TextInput
                            style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
                            value={nuevoBpmCancion}
                            onChangeText={setNuevoBpmCancion}
                            keyboardType="numeric"
                          />
                        </View>
                      </View>

                      <Text style={[styles.inputLabel, { color: t.textMain }]}>Clasificación de Set:</Text>
                      <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
                        {[
                          { key: "lenta", label: "🕯️ Set Lentas" },
                          { key: "rapida", label: "⚡ Set Rápidas" },
                        ].map((sObj) => {
                          const activo = nuevoTipoSetCancion === sObj.key;
                          return (
                            <TouchableOpacity
                              key={sObj.key}
                              style={[
                                { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: t.border, backgroundColor: t.bg },
                                activo && { backgroundColor: t.primary, borderColor: t.primary },
                              ]}
                              onPress={() => setNuevoTipoSetCancion(sObj.key)}
                            >
                              <Text style={{ color: activo ? "#FFF" : t.textMain, fontWeight: "bold", fontSize: 12 }}>{sObj.label}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      <Text style={[styles.inputLabel, { color: t.textMain }]}>Letra con acordes [G]</Text>
                      <TextInput
                        style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain, height: 160, textAlignVertical: "top" }]}
                        value={nuevaLetraCancion}
                        onChangeText={setNuevaLetraCancion}
                        multiline
                      />
                      <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                        <TouchableOpacity style={[styles.loginButton, { flex: 1, backgroundColor: t.primary, padding: 12 }]} onPress={guardarOActualizarCancion}>
                          <Text style={styles.loginButtonText}>Guardar Cambios</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.loginButton, { flex: 1, backgroundColor: "#EF4444", padding: 12 }]} onPress={() => setModoEdicionCancion(false)}>
                          <Text style={styles.loginButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View>
                      <View style={{ marginBottom: 12 }}>
                        <Text style={{ fontSize: 22, fontWeight: "bold", color: t.textMain, marginBottom: 2 }}>{cancionSeleccionadaDetalle.titulo}</Text>
                        <Text style={{ color: t.textSub, fontSize: 13 }}>
                          {cancionSeleccionadaDetalle.artista} • Tonalidad: <Text style={{ color: t.primary, fontWeight: "bold" }}>{transponerNotaUnica(cancionSeleccionadaDetalle.tono || "C", semitonosTransposicion)}</Text> • ⚡ {cancionSeleccionadaDetalle.bpm || "120"} BPM ({cancionSeleccionadaDetalle.tipoSet === "lenta" ? "🕯️ Lenta" : "⚡ Rápida"})
                        </Text>
                      </View>

                      <View style={{ flexDirection: "row", gap: 6, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: t.border, paddingBottom: 8 }}>
                        {["Acordes", "Nashville"].map((modoVista) => {
                          const activo = modoVisualizacionRepertorio === modoVista;
                          return (
                            <TouchableOpacity
                              key={modoVista}
                              style={{
                                paddingVertical: 6,
                                paddingHorizontal: 14,
                                borderRadius: 6,
                                backgroundColor: activo ? t.primary : t.bg,
                                borderWidth: 1,
                                borderColor: t.border,
                              }}
                              onPress={() => setModoVisualizacionRepertorio(modoVista)}
                            >
                              <Text style={{ color: activo ? "#FFF" : t.textSub, fontSize: 12, fontWeight: "bold" }}>
                                {modoVista}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      <View style={{ backgroundColor: t.bg, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: t.border }}>
                        <Text style={{ color: t.textMain, fontSize: 14, lineHeight: 22, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" }}>
                          {transponerTextoLetra(cancionSeleccionadaDetalle.letra || "Sin letra registrada.", semitonosTransposicion)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <>
                  {puedeControlarRepertorio && (
                    <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                      <Text style={[styles.cardTitle, { color: t.textMain, fontSize: 16, marginBottom: 10 }]}>➕ Agregar Nueva Canción en {sedeActual.nombre}</Text>
                      <View style={{ gap: 8 }}>
                        <TextInput
                          style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain, marginBottom: 0 }]}
                          placeholder="Título de la canción"
                          placeholderTextColor={t.textSub}
                          value={nuevoTituloCancion}
                          onChangeText={setNuevoTituloCancion}
                        />
                        <TextInput
                          style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain, marginBottom: 0 }]}
                          placeholder="Artista o autor"
                          placeholderTextColor={t.textSub}
                          value={nuevoArtistaCancion}
                          onChangeText={setNuevoArtistaCancion}
                        />
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <TextInput
                            style={[styles.loginInput, { flex: 1, backgroundColor: t.bg, borderColor: t.border, color: t.textMain, marginBottom: 0 }]}
                            placeholder="Tono (Ej. C, G)"
                            placeholderTextColor={t.textSub}
                            value={nuevoTonoCancion}
                            onChangeText={setNuevoTonoCancion}
                          />
                          <TextInput
                            style={[styles.loginInput, { flex: 1, backgroundColor: t.bg, borderColor: t.border, color: t.textMain, marginBottom: 0 }]}
                            placeholder="BPM (Ej. 120)"
                            placeholderTextColor={t.textSub}
                            value={nuevoBpmCancion}
                            onChangeText={setNuevoBpmCancion}
                            keyboardType="numeric"
                          />
                        </View>

                        {/* SELECTOR DE SET AL CREAR CANCIÓN */}
                        <Text style={[styles.inputLabel, { color: t.textMain, marginTop: 4 }]}>Seleccionar tipo de Set:</Text>
                        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
                          {[
                            { key: "lenta", label: "🕯️ Set Lentas" },
                            { key: "rapida", label: "⚡ Set Rápidas" },
                          ].map((sObj) => {
                            const activo = nuevoTipoSetCancion === sObj.key;
                            return (
                              <TouchableOpacity
                                key={sObj.key}
                                style={[
                                  { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: t.border, backgroundColor: t.bg },
                                  activo && { backgroundColor: t.primary, borderColor: t.primary },
                                ]}
                                onPress={() => setNuevoTipoSetCancion(sObj.key)}
                              >
                                <Text style={{ color: activo ? "#FFF" : t.textMain, fontWeight: "bold", fontSize: 12 }}>{sObj.label}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        <TextInput
                          style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain, height: 70, textAlignVertical: "top", marginBottom: 0 }]}
                          placeholder="Letra con acordes entre corchetes [C]..."
                          placeholderTextColor={t.textSub}
                          value={nuevaLetraCancion}
                          onChangeText={setNuevaLetraCancion}
                          multiline
                        />
                        <TouchableOpacity style={[styles.loginButton, { backgroundColor: t.primary, padding: 10 }]} onPress={guardarOActualizarCancion}>
                          <Text style={styles.loginButtonText}>Guardar en Repertorio de Sede</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                    <Text style={[styles.cardTitle, { color: t.textMain, fontSize: 16, marginBottom: 14 }]}>Repertorio de {sedeActual.nombre} ({repertorio.length})</Text>
                    {repertorio.map((c) => (
                      <TouchableOpacity
                        key={c.id}
                        style={[styles.repertorioItemRowPro, { borderBottomColor: t.border, backgroundColor: t.bg }]}
                        onPress={() => { setCancionSeleccionadaDetalle(c); setSemitonosTransposicion(0); setModoVisualizacionRepertorio("Acordes"); }}
                      >
                        <View style={{ flex: 1, paddingVertical: 4 }}>
                          <Text style={{ color: t.textMain, fontSize: 15, fontWeight: "bold", marginBottom: 2 }}>{c.titulo}</Text>
                          <Text style={{ color: t.textSub, fontSize: 12 }}>{c.artista || "Sin artista"} • ⚡ {c.bpm || "120"} BPM ({c.tipoSet === "lenta" ? "🕯️ Lenta" : "⚡ Rápida"})</Text>
                        </View>
                        <View style={{ backgroundColor: t.primary, width: 34, height: 34, borderRadius: 6, justifyContent: "center", alignItems: "center" }}>
                          <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 13 }}>{c.tono || "C"}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
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
            onPress={() => {
              setPestana(tab.key);
              if (tab.key === "repertorio") { setCancionSeleccionadaDetalle(null); setSemitonosTransposicion(0); setModoVisualizacionRepertorio("Acordes"); }
            }}
          >
            <Text style={[styles.tabText, { color: t.textSub }, pestana === tab.key && { color: t.textMain, fontWeight: "bold" }]} numberOfLines={1}>
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
  monthsRow: { flexDirection: "row", gap: 6, marginBottom: 10, width: "100%" },
  monthTab: { flex: 1, paddingVertical: 6, alignItems: "center", borderRadius: 8, borderWidth: 1 },
  monthText: { fontSize: 11 },
  monthTextActive: { color: "#FFFFFF", fontWeight: "bold" },
  calendarCard: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 14, width: "100%", alignItems: "center" },
  calendarHeaderTitle: { fontSize: 14, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  weekHeaderRow: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginBottom: 6 },
  weekHeaderText: { fontSize: 11, fontWeight: "bold", width: "13%", textAlign: "center" },
  daysGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4, justifyContent: "flex-start", width: "100%" },
  dayCell: { width: "13%", aspectRatio: 1, justifyContent: "center", alignItems: "center", borderRadius: 6, borderWidth: 1, marginBottom: 4, position: "relative" },
  dayCellEmpty: { width: "13%", aspectRatio: 1, marginBottom: 4 },
  dayText: { fontSize: 13, fontWeight: "bold" },
  dayTextSelected: { color: "#FFFFFF", fontWeight: "bold" },
  serviceSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, width: "100%" },
  serviceSectionTitle: { fontSize: 13, fontWeight: "bold", flex: 1 },
  programBtn: { paddingVertical: 5, paddingHorizontal: 8, borderRadius: 6 },
  programBtnText: { color: "#FFFFFF", fontSize: 11, fontWeight: "bold" },
  eventCardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  eventMainTitle: { fontSize: 15, fontWeight: "bold" },
  editServiceBtn: { backgroundColor: "#3B82F6", paddingVertical: 3, paddingHorizontal: 6, borderRadius: 4 },
  deleteServiceBtn: { backgroundColor: "#EF4444", paddingVertical: 3, paddingHorizontal: 6, borderRadius: 4 },
  columnsContainer: { flexDirection: "row", gap: 8, marginTop: 10 },
  columnBox: { flex: 1, padding: 8, borderRadius: 8, borderWidth: 1 },
  columnHeaderTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 6 },
  roleRowClean: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  repertorioItemRowPro: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, marginBottom: 6 },
  tabBar: { flexDirection: "row", height: 55, borderTopWidth: 1, width: "100%" },
  tabItem: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 2 },
  tabText: { fontSize: 10, textAlign: "center" },
  memberCard: { padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
  memberHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignContent: "center", alignItems: "center", marginBottom: 4 },
  memberTitle: { fontSize: 14, fontWeight: "bold" },
  setlistItemRow: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 6 },
  libSongRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1 },
  addSongBtn: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  chipRole: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1 },
  whatsappBtn: { backgroundColor: "#22C55E", padding: 12, borderRadius: 8, alignItems: "center" },
  postulateBtn: { backgroundColor: "#F97316", padding: 12, borderRadius: 8, alignItems: "center" },
  actionBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },
  postulateRoleOption: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 8, alignItems: "center" },
  smallButton: { width: 30, height: 30, borderRadius: 6, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  smallButtonText: { fontSize: 11, fontWeight: "bold" },
  teleprompterContainer: { flex: 1, width: "100%", height: "100%", minHeight: "100vh", padding: 12 },
  teleprompterTopBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottomWidth: 1, borderBottomColor: "#1E293B", paddingBottom: 10, width: "100%" },
  teleprompterExitBtn: { backgroundColor: "#1E293B", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  teleprompterScrollContent: { paddingBottom: 60, alignItems: "center", width: "100%" },
  teleprompterCard: { width: "100%", maxWidth: 900, backgroundColor: "#1E293B", padding: 16, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: "#334155" },
  teleprompterHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 },
  teleprompterSongTitle: { color: "#FFF", fontSize: 26, fontWeight: "bold" },
  teleprompterToneBox: { backgroundColor: "#3B82F6", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  teleprompterControlsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#334155", paddingTop: 10, flexWrap: "wrap", gap: 10 },
  teleprompterActionBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 },
  teleprompterLyricsBox: { width: "100%", maxWidth: 900, backgroundColor: "#0F172A", padding: 24, borderRadius: 12, borderWidth: 1, borderColor: "#1E293B", marginBottom: 20 },
  teleprompterLyricsText: { color: "#F8FAFC", fontSize: 22, lineHeight: 36, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace", textAlign: "left" },
  teleprompterNavRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", maxWidth: 900, gap: 12 },
  teleprompterNavBtn: { flex: 1, padding: 16, borderRadius: 10, alignItems: "center" },
});