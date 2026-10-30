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

// --- MOTOR DE TRANSPOSICIÓN MUSICAL INTELIGENTE ---
const NOTAS_SEMI = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const NOTAS_BEMOL = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
};

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
    return (
      transponerNotaUnica(partes[0], semitonos) +
      "/" +
      transponerNotaUnica(partes[1], semitonos)
    );
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
    if (linea.trim().startsWith("[") && linea.trim().endsWith("]")) {
      return linea;
    }

    const palabras = linea.trim().split(/\s+/);
    const esLineaDeAcordes =
      palabras.length > 0 &&
      palabras.every((p) => {
        const limpia = p.replace(/[^A-G#bm0-9/]/g, "");
        return /^[A-G](#|b)?(m|maj|min|dim|aug|sus|[0-9])*(\/[A-G](#|b)?)?$/.test(
          limpia
        );
      });

    if (esLineaDeAcordes) {
      return palabras
        .map((p) => transponerAcordeCompuesto(p, semitonos))
        .join("   ");
    }

    return linea;
  });

  return lineasProcesadas.join("\n");
};

export default function App() {
  const [sedeIdSeleccionada, setSedeIdSeleccionada] = useState("general");
  const [esRegistroNuevo, setEsRegistroNuevo] = useState(false);

  // --- GESTIÓN DE INTEGRANTES Y ACCESOS UNIFICADA ---
  const [integrantes, setIntegrantes] = useState(() => {
    if (Platform.OS === "web") {
      try {
        const guardados = localStorage.getItem("soundteam_integrantes_sedes_v5");
        return guardados
          ? JSON.parse(guardados)
          : [
              {
                id: 1,
                nombre: "Admin",
                pin: "1234",
                sedeId: "general",
                rolAcceso: "admin",
                rolesMusicales: ["👑 Director"],
              },
              {
                id: 2,
                nombre: "Líder",
                pin: "1234",
                sedeId: "general",
                rolAcceso: "lider",
                rolesMusicales: ["⭐ Líder de Grupo"],
              },
              {
                id: 3,
                nombre: "Lina",
                pin: "1234",
                sedeId: "general",
                rolAcceso: "miembro",
                rolesMusicales: ["🎤 Coros"],
              },
              {
                id: 4,
                nombre: "Arley",
                pin: "1234",
                sedeId: "general",
                rolAcceso: "miembro",
                rolesMusicales: ["🎹 Piano"],
              },
              {
                id: 5,
                nombre: "Alex",
                pin: "1234",
                sedeId: "general",
                rolAcceso: "miembro",
                rolesMusicales: ["🥁 Batería"],
              },
              {
                id: 6,
                nombre: "Heidy",
                pin: "1234",
                sedeId: "general",
                rolAcceso: "miembro",
                rolesMusicales: ["🎤 Coros"],
              },
              {
                id: 7,
                nombre: "Juan",
                pin: "1234",
                sedeId: "general",
                rolAcceso: "miembro",
                rolesMusicales: ["🎸 Guitarra"],
              },
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
        localStorage.setItem(
          "soundteam_integrantes_sedes_v5",
          JSON.stringify(integrantes)
        );
      } catch (e) {}
    }
  }, [integrantes]);

  // --- PERSISTENCIA DE SESIÓN ---
  const [usuario, setUsuario] = useState(() => {
    if (Platform.OS === "web") {
      try {
        return localStorage.getItem("soundteam_sesion_usuario") || "";
      } catch (e) {
        return "";
      }
    }
    return "";
  });

  const [pinInput, setPinInput] = useState("");

  const [sesionIniciada, setSesionIniciada] = useState(() => {
    if (Platform.OS === "web") {
      try {
        return localStorage.getItem("soundteam_sesion_activa") === "true";
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  const [rolUsuario, setRolUsuario] = useState(() => {
    if (Platform.OS === "web") {
      try {
        return localStorage.getItem("soundteam_sesion_rol") || "miembro";
      } catch (e) {
        return "miembro";
      }
    }
    return "miembro";
  });

  const [pestana, setPestana] = useState("inicio");

  const [nombreTema, setNombreTema] = useState(() => {
    if (Platform.OS === "web") {
      try {
        return localStorage.getItem("soundteam_tema_app") || "azul";
      } catch (e) {
        return "azul";
      }
    }
    return "azul";
  });

  const [mostrarMenuTemas, setMostrarMenuTemas] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") {
      try {
        localStorage.setItem("soundteam_tema_app", nombreTema);
      } catch (e) {}
    }
  }, [nombreTema]);

  const t = TEMAS[nombreTema];
  const sedeActual = SEDES_DISPONIBLES.find((s) => s.id === sedeIdSeleccionada) || SEDES_DISPONIBLES[0];

  const nombresMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const fechaActualObj = new Date();
  const listaMesesDinamicos = [];

  for (let i = 0; i < 4; i++) {
    const dTarget = new Date(
      fechaActualObj.getFullYear(),
      fechaActualObj.getMonth() + i,
      1
    );
    listaMesesDinamicos.push({
      nombre: nombresMeses[dTarget.getMonth()],
      mesIndex: dTarget.getMonth(),
      year: dTarget.getFullYear(),
      key: `${dTarget.getFullYear()}-${dTarget.getMonth()}`,
    });
  }

  const [mesSeleccionadoObj, setMesSeleccionadoObj] = useState(
    listaMesesDinamicos[0]
  );
  const [diaSeleccionado, setDiaSeleccionado] = useState(
    fechaActualObj.getDate()
  );

  const esDomingoSeleccionado =
    new Date(
      mesSeleccionadoObj.year,
      mesSeleccionadoObj.mesIndex,
      diaSeleccionado
    ).getDay() === 0;

  const [paletasCulto, setPaletasCulto] = useState(() => {
    if (Platform.OS === "web") {
      try {
        const guardados = localStorage.getItem("soundteam_paletas_culto");
        return guardados
          ? JSON.parse(guardados)
          : [
              {
                id: 1,
                nombre: "Atardecer Violeta",
                colores: [
                  "#064680",
                  "#31245A",
                  "#AC6DBF",
                  "#2A7CA3",
                  "#588BC2",
                ],
              },
              {
                id: 2,
                nombre: "Tonos Arena",
                colores: ["#C29B78", "#A17651", "#5C4033", "#222222"],
              },
              {
                id: 3,
                nombre: "Blanco Sacro",
                colores: ["#748185", "#93afb3", "#456467"],
              },
              {
                id: 4,
                nombre: "Rosa Alba",
                colores: ["#E29578", "#FFDDD2", "#83C5BE", "#006D77"],
              },
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
        localStorage.setItem(
          "soundteam_paletas_culto",
          JSON.stringify(paletasCulto)
        );
      } catch (e) {}
    }
  }, [paletasCulto]);

  // --- SERVICIOS CON SUPABASE Y RESPALDO LOCAL ---
  const [servicios, setServicios] = useState(() => {
    if (Platform.OS === "web") {
      try {
        const guardados = localStorage.getItem("soundteam_servicios_v3");
        return guardados ? JSON.parse(guardados) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

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
        instrumentos: s.instrumentos || {
          piano: "Sin asignar",
          guitarra: "Sin asignar",
          bajo: "Sin asignar",
          bateria: "Sin asignar",
        },
      }));
      setServicios(formateados);
    }
  };

  useEffect(() => {
    cargarServiciosSupabase();

    const canalSub = supabase
      .channel("servicios-cambios")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "servicios" },
        () => {
          cargarServiciosSupabase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canalSub);
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      try {
        localStorage.setItem(
          "soundteam_servicios_v3",
          JSON.stringify(servicios)
        );
      } catch (e) {}
    }
  }, [servicios]);

  const [modalProgramarVisible, setModalProgramarVisible] = useState(false);
  const [modalPostularVisible, setModalPostularVisible] = useState(false);
  const [idServicioEditando, setIdServicioEditando] = useState(null);
  const [idServicioPostulando, setIdServicioPostulando] = useState(null);

  const [nombreEvento, setNombreEvento] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [paletaSeleccionadaModal, setPaletaSeleccionadaModal] =
    useState(null);

  const [setlistActivo, setSetlistActivo] = useState([]);
  const [indiceParaMover, setIndiceParaMover] = useState(null);

  const [modalMiembroVisible, setModalMiembroVisible] = useState(false);
  const [idMiembroEditando, setIdMiembroEditando] = useState(null);
  const [nombreNuevoMiembro, setNombreNuevoMiembro] = useState("");
  const [pinNuevoMiembro, setPinNuevoMiembro] = useState("1234");
  const [rolAccesoNuevo, setRolAccesoNuevo] = useState("miembro");
  const [rolesMusicalesNuevo, setRolesMusicalesNuevo] = useState([]);

  // --- REPERTORIO AVANZADO ---
  const [repertorio, setRepertorio] = useState(() => {
    if (Platform.OS === "web") {
      try {
        const guardados = localStorage.getItem("soundteam_repertorio_pro");
        return guardados
          ? JSON.parse(guardados)
          : [
              {
                id: 1,
                titulo: "A dónde iré",
                artista: "Verbo y Vida",
                tono: "F",
                etiquetas: ["Adoración", "Entrega"],
                letra:
                  "[INTRO]\nF C Dm\nC Bb F\nGm Bb\n\n[PRIMERA PARTE]\n[F] Siento que sin ti\n[Bb] Mi vida es nada\n[C/E] Y que sin tu [Bb/D] amor no vi[F/C]viré [A/C#]\n[Dm7] Y que sin tu [Dm9/C] amor no vi[G/B]viré\n[Bb/F] Estoy confu[F/E]ndida a tal ma[Gm/D]nera [C]\n[Bb] Quisiera ahora mismo te pudiera ver",
              },
              {
                id: 2,
                titulo: "Creo en ti",
                artista: "Espíritu y Verdad",
                tono: "C",
                etiquetas: ["Alabanza"],
                letra:
                  "[VERSO]\n[C] Creo en ti, [G] Señor\n[Am] Con todo el cora[F]zón\n\n[CORO]\n[C] Eres digno de adora[G]ción\n[Am] Mi salvador y rey [F] eterno",
              },
              {
                id: 3,
                titulo: "Digno",
                artista: "Elevation Worship",
                tono: "E",
                etiquetas: ["Adoración"],
                letra:
                  "[VERSO]\n[E] Digno eres Señor\n[B] De recibir la gloria\n[A] La honra y el poder",
              },
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
        localStorage.setItem(
          "soundteam_repertorio_pro",
          JSON.stringify(repertorio)
        );
      } catch (e) {}
    }
  }, [repertorio]);

  const [cancionSeleccionadaDetalle, setCancionSeleccionadaDetalle] =
    useState(null);
  const [semitonosTransposicion, setSemitonosTransposicion] = useState(0);

  const [modoEdicionCancion, setModoEdicionCancion] = useState(false);
  const [nuevoTituloCancion, setNuevoTituloCancion] = useState("");
  const [nuevoArtistaCancion, setNuevoArtistaCancion] = useState("");
  const [nuevoTonoCancion, setNuevoTonoCancion] = useState("");
  const [nuevaLetraCancion, setNuevaLetraCancion] = useState("");
  const [etiquetasActuales, setEtiquetasActuales] = useState([]);

  // --- LÓGICA CHATS POR CANAL ---
  const [canalChatActivo, setCanalChatActivo] = useState("finsemana");
  const [mensajesChat, setMensajesChat] = useState([]);
  const [nuevoMensajeTexto, setNuevoMensajeTexto] = useState("");
  const [idMensajeEditando, setIdMensajeEditando] = useState(null);
  const [textoOriginalEditando, setTextoOriginalEditando] = useState("");
  const [mostrarSelectorEmojis, setMostrarSelectorEmojis] = useState(false);

  const cargarMensajesSupabase = async () => {
    const { data, error } = await supabase
      .from("mensajes")
      .select("*")
      .eq("canal", canalChatActivo)
      .order("created_at", { ascending: true });

    if (data && !error) {
      setMensajesChat(data);
    } else {
      setMensajesChat([]);
    }
  };

  useEffect(() => {
    cargarMensajesSupabase();

    const canalSub = supabase
      .channel(`chat-realtime-${canalChatActivo}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mensajes",
          filter: `canal=eq.${canalChatActivo}`,
        },
        () => {
          cargarMensajesSupabase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canalSub);
    };
  }, [canalChatActivo]);

  const handleLogin = () => {
    if (usuario.trim() === "" || pinInput.trim() === "") {
      alert("⚠️ Ingresa tu usuario y PIN.");
      return;
    }

    const miembroEncontrado = integrantes.find(
      (m) =>
        m.nombre.trim().toLowerCase() === usuario.trim().toLowerCase() &&
        (m.sedeId === sedeIdSeleccionada || !m.sedeId)
    );

    let rolAsignado = "miembro";

    if (miembroEncontrado) {
      if (miembroEncontrado.pin !== pinInput.trim()) {
        alert("⚠️ PIN incorrecto.");
        return;
      }
      rolAsignado = miembroEncontrado.rolAcceso || "miembro";
    } else {
      // Si no está en el arreglo local, validamos un acceso genérico o permitimos entrar
      rolAsignado = usuario.trim().toLowerCase() === "admin" ? "admin" : "miembro";
    }

    const nombreReal = miembroEncontrado ? miembroEncontrado.nombre : usuario;
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

  const handleRegistroNuevo = () => {
    if (usuario.trim() === "" || pinInput.trim() === "") {
      alert("⚠️ Completa tu nombre y PIN para registrarte.");
      return;
    }

    const existe = integrantes.some(
      (m) =>
        m.nombre.trim().toLowerCase() === usuario.trim().toLowerCase() &&
        (m.sedeId === sedeIdSeleccionada || !m.sedeId)
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
    await cargarMensajesSupabase();
    alert("🔄 ¡Datos actualizados desde la nube correctamente!");
  };

  const esAdmin = rolUsuario === "admin";
  const esAdminOLider = rolUsuario === "admin" || rolUsuario === "lider";

  const miembroActualObj = integrantes.find(
    (m) => m.nombre.trim().toLowerCase() === usuario.trim().toLowerCase()
  );

  const tocaInstrumento =
    miembroActualObj &&
    miembroActualObj.rolesMusicales &&
    miembroActualObj.rolesMusicales.some((rol) => {
      const rLower = rol.toLowerCase();
      return (
        rLower.includes("piano") ||
        rLower.includes("guitarra") ||
        rLower.includes("bajo") ||
        rLower.includes("batería") ||
        rLower.includes("bateria")
      );
    });

  const puedeControlarRepertorio = esAdminOLider || tocaInstrumento;

  const enviarOActualizarMensajeChat = async () => {
    if (nuevoMensajeTexto.trim() !== "") {
      const horaActual = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (idMensajeEditando !== null) {
        const textoModificado = nuevoMensajeTexto.trim();
        const idNumerico = Number(idMensajeEditando);

        const { error } = await supabase
          .from("mensajes")
          .update({ texto: textoModificado, editado: true })
          .eq("id", idNumerico);

        if (error) {
          alert(
            `⚠️ No se pudo actualizar el mensaje en la nube: ${error.message}`
          );
          return;
        }

        const mensajeAuditoria = {
          autor: "🛡️ [SISTEMA ADMIN]",
          texto: `${usuario} editó un mensaje.\n• Antes: "${textoOriginalEditando}"\n• Ahora: "${textoModificado}"`,
          hora: horaActual,
          canal: canalChatActivo,
          editado: false,
        };

        await supabase.from("mensajes").insert([mensajeAuditoria]);

        setIdMensajeEditando(null);
        setTextoOriginalEditando("");
        setNuevoMensajeTexto("");
        await cargarMensajesSupabase();
      } else {
        const mensaje = {
          autor: usuario,
          texto: nuevoMensajeTexto.trim(),
          hora: horaActual,
          canal: canalChatActivo,
          editado: false,
        };

        setNuevoMensajeTexto("");
        const { error } = await supabase.from("mensajes").insert([mensaje]);
        if (error) {
          alert(`⚠️ No se pudo enviar el mensaje: ${error.message}`);
        }
        await cargarMensajesSupabase();
      }
    }
  };

  const limpiarHistorialChat = async () => {
    if (!esAdminOLider) {
      alert(
        "⚠️ Solo Administradores y Líderes pueden limpiar el historial del chat."
      );
      return;
    }

    if (
      confirm(
        `¿Estás seguro de que deseas eliminar el historial del chat de ${canalChatActivo.toUpperCase()}?`
      )
    ) {
      const { error } = await supabase
        .from("mensajes")
        .delete()
        .eq("canal", canalChatActivo);

      if (!error) {
        setMensajesChat([]);
        alert("🧹 Historial de este canal eliminado con éxito.");
      } else {
        alert("⚠️ No se pudo limpiar el historial.");
      }
    }
  };

  const guardarOActualizarCancion = () => {
    if (!puedeControlarRepertorio) {
      alert(
        "⚠️ No tienes permisos de instrumentista o líder para modificar el repertorio."
      );
      return;
    }

    if (nuevoTituloCancion.trim() !== "") {
      if (cancionSeleccionadaDetalle !== null && modoEdicionCancion) {
        const cancionActualizada = {
          ...cancionSeleccionadaDetalle,
          titulo: nuevoTituloCancion,
          artista: nuevoArtistaCancion || "Sin artista",
          tono: nuevoTonoCancion || "C",
          etiquetas: etiquetasActuales,
          letra: nuevaLetraCancion || "",
        };
        setRepertorio(
          repertorio.map((c) =>
            c.id === cancionActualizada.id ? cancionActualizada : c
          )
        );
        setCancionSeleccionadaDetalle(cancionActualizada);
        setModoEdicionCancion(false);
        setSemitonosTransposicion(0);
        alert("🎵 Canción actualizada exitosamente.");
      } else {
        const nuevaCancion = {
          id: Date.now(),
          titulo: nuevoTituloCancion,
          artista: nuevoArtistaCancion || "Sin artista",
          tono: nuevoTonoCancion || "C",
          etiquetas:
            etiquetasActuales.length > 0 ? etiquetasActuales : ["Adoración"],
          letra: nuevaLetraCancion || "",
        };
        setRepertorio([...repertorio, nuevaCancion]);
        setModoEdicionCancion(false);
        alert("🎵 Canción guardada exitosamente.");
      }
      setNuevoTituloCancion("");
      setNuevoArtistaCancion("");
      setNuevoTonoCancion("");
      setNuevaLetraCancion("");
      setEtiquetasActuales([]);
    } else {
      alert("⚠️ Ingresa al menos el título de la canción.");
    }
  };

  const eliminarCancionRepertorio = (id) => {
    if (!puedeControlarRepertorio) {
      alert("⚠️ No tienes permisos para eliminar canciones.");
      return;
    }
    if (confirm("¿Estás seguro de eliminar esta canción del repertorio?")) {
      setRepertorio(repertorio.filter((c) => c.id !== id));
      setCancionSeleccionadaDetalle(null);
    }
  };

  const mesNumStr = String(mesSeleccionadoObj.mesIndex + 1).padStart(2, "0");
  const fechaActualClave = `${mesSeleccionadoObj.year}-${mesNumStr}-${
    diaSeleccionado < 10 ? "0" + diaSeleccionado : diaSeleccionado
  }`;

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

      if (
        vp === usuario ||
        coros.includes(usuario) ||
        piano === usuario ||
        guitarra === usuario ||
        bajo === usuario ||
        bateria === usuario
      ) {
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

      lista.push({
        vacio: false,
        diaNum: d,
        postulado: postulado,
      });
    }
    return lista;
  };

  const enviarPorWhatsApp = (servicio) => {
    let texto = `🎵 *Setlist - ${servicio.titulo}* (${diaSeleccionado} de ${mesSeleccionadoObj.nombre} ${mesSeleccionadoObj.year})\n\n`;
    if (servicio.setlist && servicio.setlist.length > 0) {
      servicio.setlist.forEach((s, i) => {
        texto += `${i + 1}. ${s.titulo} (Tono: ${s.tono})\n`;
      });
    } else {
      texto += `Sin canciones asignadas.\n`;
    }

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      texto
    )}`;
    Linking.openURL(url).catch(() => {
      alert("No se pudo abrir WhatsApp.");
    });
  };

  const confirmarPostulacionRol = async (rol) => {
    if (idServicioPostulando === null) return;
    const servicioObjetivo = servicios.find(
      (s) => s.id === idServicioPostulando
    );
    if (!servicioObjetivo) return;

    let nuevaVozP = servicioObjetivo.voces?.principal || "Sin asignar";
    let nuevosCoros = servicioObjetivo.voces?.coros
      ? servicioObjetivo.voces.coros
          .split(", ")
          .filter((c) => c !== "Sin asignar" && c !== "")
      : [];
    let nuevoPiano = servicioObjetivo.instrumentos?.piano || "Sin asignar";
    let nuevaGuitarra =
      servicioObjetivo.instrumentos?.guitarra || "Sin asignar";
    let nuevoBajo = servicioObjetivo.instrumentos?.bajo || "Sin asignar";
    let nuevaBateria = servicioObjetivo.instrumentos?.bateria || "Sin asignar";

    const yaEstaPostulado =
      nuevaVozP === usuario ||
      nuevosCoros.includes(usuario) ||
      nuevoPiano === usuario ||
      nuevaGuitarra === usuario ||
      nuevoBajo === usuario ||
      nuevaBateria === usuario;

    if (yaEstaPostulado) {
      alert(`⚠️ Ya estás postulado en este servicio.`);
      setModalPostularVisible(false);
      return;
    }

    if (rol === "vozPrincipal") {
      if (nuevaVozP !== "Sin asignar") {
        alert("⚠️ La Voz Principal ya está ocupada.");
        return;
      }
      nuevaVozP = usuario;
    } else if (rol === "coros") {
      if (nuevosCoros.length >= 3) {
        alert("⚠️ Los coros ya tienen el límite de 3 personas.");
        return;
      }
      nuevosCoros.push(usuario);
    } else if (rol === "piano") {
      if (nuevoPiano !== "Sin asignar") {
        alert("⚠️ El Piano ya está ocupado.");
        return;
      }
      nuevoPiano = usuario;
    } else if (rol === "guitarra") {
      if (nuevaGuitarra !== "Sin asignar") {
        alert("⚠️ La Guitarra ya está ocupada.");
        return;
      }
      nuevaGuitarra = usuario;
    } else if (rol === "bajo") {
      if (nuevoBajo !== "Sin asignar") {
        alert("⚠️ El Bajo ya está ocupado.");
        return;
      }
      nuevoBajo = usuario;
    } else if (rol === "bateria") {
      if (nuevaBateria !== "Sin asignar") {
        alert("⚠️ La Batería ya está ocupada.");
        return;
      }
      nuevaBateria = usuario;
    }

    const nVoces = {
      principal: nuevaVozP,
      coros: nuevosCoros.length > 0 ? nuevosCoros.join(", ") : "Sin asignar",
    };
    const nInst = {
      piano: nuevoPiano,
      guitarra: nuevaGuitarra,
      bajo: nuevoBajo,
      bateria: nuevaBateria,
    };

    const actualizados = servicios.map((s) =>
      s.id === idServicioPostulando
        ? { ...s, voces: nVoces, instrumentos: nInst }
        : s
    );
    setServicios(actualizados);

    await supabase
      .from("servicios")
      .update({ voces: nVoces, instrumentos: nInst })
      .eq("id", idServicioPostulando);

    setModalPostularVisible(false);
    alert(`🚀 Te has postulado exitosamente.`);
  };

  const liberarRol = async (idServicio, categoria) => {
    if (!esAdminOLider) {
      alert("⚠️ No tienes permisos para liberar o eliminar esta postulación.");
      return;
    }

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

    const actualizados = servicios.map((s) =>
      s.id === idServicio ? { ...s, voces: nVoces, instrumentos: nInst } : s
    );
    setServicios(actualizados);

    await supabase
      .from("servicios")
      .update({ voces: nVoces, instrumentos: nInst })
      .eq("id", idServicio);

    alert("🔄 Rol liberado exitosamente.");
  };

  // --- PANTALLA DE LOGUEO / REGISTRO CON LISTA DESPLEGABLE DE SEDES ---
  if (!sesionIniciada) {
    return (
      <View style={[styles.loginContainer, { backgroundColor: t.bg }]}>
        <View
          style={[
            styles.loginCard,
            { backgroundColor: t.cardBg, borderColor: t.border },
          ]}
        >
          <Text style={[styles.loginTitle, { color: t.textMain }]}>
            SoundTeam
          </Text>
          <Text style={[styles.loginSubtitle, { color: t.textSub }]}>
            {esRegistroNuevo ? "Registro de Usuario Nuevo" : "Inicio de Sesión"}
          </Text>

          <Text style={[styles.inputLabel, { color: t.textMain }]}>
            🏛️ Selecciona tu Sede:
          </Text>

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
                <option
                  key={s.id}
                  value={s.id}
                  style={{ backgroundColor: t.cardBg, color: t.textMain }}
                >
                  {s.nombre}
                </option>
              ))}
            </select>
          ) : (
            <View
              style={[
                styles.loginInput,
                { backgroundColor: t.bg, borderColor: t.border },
              ]}
            >
              <Text style={{ color: t.textMain }}>{sedeActual.nombre}</Text>
            </View>
          )}

          <Text style={[styles.inputLabel, { color: t.textMain }]}>
            👤 Usuario o Apodo:
          </Text>
          <TextInput
            style={[
              styles.loginInput,
              {
                backgroundColor: t.bg,
                borderColor: t.border,
                color: t.textMain,
              },
            ]}
            placeholder="Ej. Admin o Alex"
            placeholderTextColor={t.textSub}
            value={usuario}
            onChangeText={setUsuario}
          />

          <Text style={[styles.inputLabel, { color: t.textMain }]}>
            🔑 PIN de Acceso:
          </Text>
          <TextInput
            style={[
              styles.loginInput,
              {
                backgroundColor: t.bg,
                borderColor: t.border,
                color: t.textMain,
              },
            ]}
            placeholder="Ej. 1234"
            placeholderTextColor={t.textSub}
            secureTextEntry
            value={pinInput}
            onChangeText={setPinInput}
          />

          {esRegistroNuevo ? (
            <View style={{ marginTop: 6 }}>
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  { backgroundColor: "#22C55E", marginBottom: 10 },
                ]}
                onPress={handleRegistroNuevo}
              >
                <Text style={styles.loginButtonText}>Crear Cuenta y Entrar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEsRegistroNuevo(false)}>
                <Text
                  style={{
                    color: t.primary,
                    textAlign: "center",
                    fontSize: 12,
                  }}
                >
                  ¿Ya estás registrado? Inicia Sesión
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ marginTop: 6 }}>
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  { backgroundColor: t.primary, marginBottom: 10 },
                ]}
                onPress={handleLogin}
              >
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEsRegistroNuevo(true)}>
                <Text
                  style={{
                    color: t.primary,
                    textAlign: "center",
                    fontSize: 12,
                  }}
                >
                  ¿Eres usuario nuevo? Regístrate
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: t.cardBg, borderBottomColor: t.border },
        ]}
      >
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: t.textMain }]}>
              SoundTeam • {sedeActual.nombre}
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: t.textSub }]}
              numberOfLines={1}
            >
              👤 {usuario} •{" "}
              <Text style={{ color: t.primary, fontWeight: "bold" }}>
                ROL: {rolUsuario.toUpperCase()}
              </Text>
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={{
                backgroundColor: t.primary,
                paddingVertical: 5,
                paddingHorizontal: 8,
                borderRadius: 6,
                marginRight: 4,
              }}
              onPress={recargarDatosApp}
            >
              <Text
                style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 11 }}
              >
                🔄 Refrescar
              </Text>
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
            onPress={() => setMostrarMenuTemas(!mostrarMenuTemas)}
          >
            <Text
              style={{ fontSize: 11, color: t.textMain, fontWeight: "bold" }}
            >
              🎨 Tema actual: {t.nombre}
            </Text>
            <Text
              style={{ fontSize: 11, color: t.primary, fontWeight: "bold" }}
            >
              {mostrarMenuTemas ? "▲ Ocultar" : "▼ Cambiar tema"}
            </Text>
          </TouchableOpacity>

          {mostrarMenuTemas && (
            <View
              style={{
                marginTop: 4,
                backgroundColor: t.cardBg,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: t.border,
                padding: 6,
                gap: 4,
              }}
            >
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
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 8,
                      borderRadius: 4,
                      backgroundColor: activo
                        ? t.primary + "33"
                        : "transparent",
                    }}
                    onPress={() => {
                      setNombreTema(itemTema.key);
                      setMostrarMenuTemas(false);
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: activo ? t.primary : t.textMain,
                        fontWeight: activo ? "bold" : "normal",
                      }}
                    >
                      {itemTema.label} {activo ? "✓" : ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40, alignItems: "center" }}
      >
        <View style={styles.mainWrapper}>
          {pestana === "inicio" && (
            <View style={{ width: "100%" }}>
              <View
                style={[styles.welcomeBanner, { backgroundColor: t.banner }]}
              >
                <Text style={styles.welcomeTitle}>✨ Colosenses 3:23</Text>
                <Text style={styles.welcomeBannerText}>
                  "Y todo lo que hagan, háganlo de corazón, como para el Señor y
                  no para los hombres."
                </Text>
              </View>

              <View
                style={[
                  styles.card,
                  { backgroundColor: t.cardBg, borderColor: t.border },
                ]}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: t.textMain, marginBottom: 0 },
                    ]}
                  >
                    💬 Chat de Equipos ({sedeActual.nombre})
                  </Text>

                  {esAdminOLider && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#EF4444",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                      }}
                      onPress={limpiarHistorialChat}
                    >
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 11,
                          fontWeight: "bold",
                        }}
                      >
                        🗑️ Limpiar
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View
                  style={{ flexDirection: "row", gap: 6, marginBottom: 12 }}
                >
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
                          {
                            flex: 1,
                            paddingVertical: 6,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: t.border,
                            backgroundColor: t.bg,
                            alignItems: "center",
                          },
                          estaActivo && {
                            backgroundColor: t.primary,
                            borderColor: t.primary,
                          },
                        ]}
                        onPress={() => setCanalChatActivo(ch.key)}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: estaActivo ? "bold" : "normal",
                            color: estaActivo ? "#FFF" : t.textSub,
                          }}
                        >
                          {ch.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text
                  style={[
                    styles.welcomeText,
                    { color: t.textSub, marginBottom: 8, fontSize: 11 },
                  ]}
                >
                  Mensajes privados del equipo:{" "}
                  <Text style={{ color: t.primary, fontWeight: "bold" }}>
                    {canalChatActivo.toUpperCase()}
                  </Text>
                </Text>

                <View
                  style={{
                    backgroundColor: t.bg,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: t.border,
                    padding: 10,
                    height: 240,
                    marginBottom: 10,
                  }}
                >
                  <ScrollView>
                    {mensajesChat.length === 0 ? (
                      <Text
                        style={{
                          color: t.textSub,
                          textAlign: "center",
                          marginTop: 20,
                          fontStyle: "italic",
                          fontSize: 12,
                        }}
                      >
                        No hay mensajes en este chat. ¡Sé el primero en
                        escribir!
                      </Text>
                    ) : (
                      mensajesChat.map((m, i) => {
                        const esMio = m.autor === usuario;
                        const esAuditoriaSistema =
                          m.autor.includes("SISTEMA ADMIN");

                        return (
                          <View
                            key={m.id || i}
                            style={{
                              marginBottom: 8,
                              backgroundColor: esAuditoriaSistema
                                ? "#F59E0B22"
                                : esMio
                                ? t.primary + "22"
                                : t.cardBg,
                              padding: 8,
                              borderRadius: 6,
                              borderWidth: 1,
                              borderColor: esAuditoriaSistema
                                ? "#F59E0B"
                                : t.border,
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginBottom: 2,
                              }}
                            >
                              <Text
                                style={{
                                  color: esAuditoriaSistema
                                    ? "#F59E0B"
                                    : t.primary,
                                  fontWeight: "bold",
                                  fontSize: 11,
                                }}
                              >
                                {m.autor} {m.editado ? "(editado)" : ""}
                              </Text>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <Text style={{ color: t.textSub, fontSize: 9 }}>
                                  {m.hora}
                                </Text>
                                {esMio && !esAuditoriaSistema && (
                                  <TouchableOpacity
                                    onPress={() => {
                                      setIdMensajeEditando(m.id);
                                      setTextoOriginalEditando(m.texto);
                                      setNuevoMensajeTexto(m.texto);
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: t.primary,
                                        fontSize: 10,
                                        fontWeight: "bold",
                                      }}
                                    >
                                      ✏️ Editar
                                    </Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            </View>
                            <Text style={{ color: t.textMain, fontSize: 12 }}>
                              {m.texto}
                            </Text>
                          </View>
                        );
                      })
                    )}
                  </ScrollView>
                </View>

                <View style={{ marginBottom: 8 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: t.bg,
                      borderWidth: 1,
                      borderColor: t.border,
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 6,
                      alignSelf: "flex-start",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                    onPress={() =>
                      setMostrarSelectorEmojis(!mostrarSelectorEmojis)
                    }
                  >
                    <Text
                      style={{
                        color: t.textMain,
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      {mostrarSelectorEmojis
                        ? "🔽 Ocultar Emojis"
                        : "😀 Emojis (Desplegar)"}
                    </Text>
                  </TouchableOpacity>

                  {mostrarSelectorEmojis && (
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 6,
                        marginTop: 6,
                        backgroundColor: t.bg,
                        padding: 8,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: t.border,
                      }}
                    >
                      {[
                        "😀",
                        "😢",
                        "❤️",
                        "🏃‍♂️",
                        "🔥",
                        "🙏",
                        "🎸",
                        "🎹",
                        "🥁",
                        "🙌",
                        "✨",
                        "⭐",
                        "💡",
                        "✅",
                        "❌",
                        "💬",
                        "🎵",
                      ].map((emoji) => (
                        <TouchableOpacity
                          key={emoji}
                          style={{
                            backgroundColor: t.cardBg,
                            borderWidth: 1,
                            borderColor: t.border,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 4,
                          }}
                          onPress={() => {
                            setNuevoMensajeTexto((prev) => prev + emoji);
                            setMostrarSelectorEmojis(false);
                          }}
                        >
                          <Text style={{ fontSize: 16 }}>{emoji}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {idMensajeEditando !== null && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                      backgroundColor: t.primary + "33",
                      padding: 6,
                      borderRadius: 4,
                    }}
                  >
                    <Text style={{ color: t.textMain, fontSize: 11 }}>
                      ✏️ Estás editando un mensaje:
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setIdMensajeEditando(null);
                        setTextoOriginalEditando("");
                        setNuevoMensajeTexto("");
                      }}
                    >
                      <Text
                        style={{
                          color: "#EF4444",
                          fontSize: 11,
                          fontWeight: "bold",
                        }}
                      >
                        Cancelar edición
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={{ flexDirection: "row", gap: 6 }}>
                  <TextInput
                    style={[
                      styles.loginInput,
                      {
                        flex: 1,
                        backgroundColor: t.bg,
                        borderColor: t.border,
                        color: t.textMain,
                        marginBottom: 0,
                        padding: 8,
                        fontSize: 13,
                      },
                    ]}
                    placeholder={
                      idMensajeEditando !== null
                        ? "Edita tu mensaje aquí..."
                        : `Escribir en el chat de ${canalChatActivo}...`
                    }
                    placeholderTextColor={t.textSub}
                    value={nuevoMensajeTexto}
                    onChangeText={setNuevoMensajeTexto}
                  />
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      {
                        backgroundColor:
                          idMensajeEditando !== null ? "#22C55E" : t.primary,
                        justifyContent: "center",
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                      },
                    ]}
                    onPress={enviarOActualizarMensajeChat}
                  >
                    <Text style={[styles.loginButtonText, { fontSize: 12 }]}>
                      {idMensajeEditando !== null ? "Guardar" : "Enviar"}
                    </Text>
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
                      style={[
                        styles.monthTab,
                        { backgroundColor: t.cardBg, borderColor: t.border },
                        esSeleccionado && {
                          backgroundColor: t.primary,
                          borderColor: t.primary,
                        },
                      ]}
                      onPress={() => {
                        setMesSeleccionadoObj(itemMes);
                        setDiaSeleccionado(1);
                      }}
                    >
                      <Text
                        style={[
                          styles.monthText,
                          { color: t.textSub },
                          esSeleccionado && styles.monthTextActive,
                        ]}
                      >
                        {itemMes.nombre} {itemMes.year}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View
                style={[
                  styles.calendarCard,
                  { backgroundColor: t.cardBg, borderColor: t.border },
                ]}
              >
                <Text
                  style={[styles.calendarHeaderTitle, { color: t.textMain }]}
                >
                  {mesSeleccionadoObj.nombre} {mesSeleccionadoObj.year}
                </Text>

                <View style={styles.weekHeaderRow}>
                  {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(
                    (dSem, idx) => (
                      <Text
                        key={idx}
                        style={[styles.weekHeaderText, { color: t.textSub }]}
                      >
                        {dSem}
                      </Text>
                    )
                  )}
                </View>

                <View style={styles.daysGrid}>
                  {obtenerDiasDelMesDinamico(
                    mesSeleccionadoObj.mesIndex,
                    mesSeleccionadoObj.year
                  ).map((item, index) => {
                    if (item.vacio) {
                      return <View key={item.id} style={styles.dayCellEmpty} />;
                    }

                    const esSeleccionado = diaSeleccionado === item.diaNum;
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dayCell,
                          { backgroundColor: t.bg, borderColor: t.border },
                          esSeleccionado && {
                            backgroundColor: t.selectedDay,
                            borderColor: t.selectedDay,
                          },
                        ]}
                        onPress={() => setDiaSeleccionado(item.diaNum)}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            { color: t.textMain },
                            esSeleccionado && styles.dayTextSelected,
                          ]}
                        >
                          {item.diaNum}
                        </Text>

                        {item.postulado && (
                          <View
                            style={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              backgroundColor: "#22C55E",
                              width: 6,
                              height: 6,
                              borderRadius: 3,
                            }}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.serviceSectionHeader}>
                <Text
                  style={[styles.serviceSectionTitle, { color: t.textMain }]}
                >
                  Servicios del Día {diaSeleccionado} de{" "}
                  {mesSeleccionadoObj.nombre} {mesSeleccionadoObj.year} (
                  {serviciosDelDia.length})
                </Text>

                {esAdminOLider && (
                  <TouchableOpacity
                    style={[styles.programBtn, { backgroundColor: t.primary }]}
                    onPress={() => {
                      setIdServicioEditando(null);
                      setNombreEvento(
                        esDomingoSeleccionado ? "Culto Dominical" : "Culto"
                      );
                      setObservaciones("");
                      setPaletaSeleccionadaModal(null);
                      setSetlistActivo([]);
                      setIndiceParaMover(null);
                      setModalProgramarVisible(true);
                    }}
                  >
                    <Text style={styles.programBtnText}>
                      + Programar Servicio
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {modalProgramarVisible && (
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: t.cardBg,
                      borderColor: t.primary,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: t.textMain, fontSize: 17, marginBottom: 12 },
                    ]}
                  >
                    {idServicioEditando !== null
                      ? "✏️ Modificar Servicio"
                      : "➕ Nuevo Servicio"}{" "}
                    ({mesSeleccionadoObj.nombre} {diaSeleccionado})
                  </Text>

                  <Text style={[styles.inputLabel, { color: t.textMain }]}>
                    Nombre del evento / servicio
                  </Text>
                  <TextInput
                    style={[
                      styles.loginInput,
                      {
                        backgroundColor: t.bg,
                        borderColor: t.border,
                        color: t.textMain,
                      },
                    ]}
                    placeholder="Ej. Culto Dominical"
                    placeholderTextColor={t.textSub}
                    value={nombreEvento}
                    onChangeText={setNombreEvento}
                  />

                  <Text style={[styles.inputLabel, { color: t.textMain }]}>
                    Observaciones Técnicas
                  </Text>
                  <TextInput
                    style={[
                      styles.loginInput,
                      {
                        backgroundColor: t.bg,
                        borderColor: t.border,
                        color: t.textMain,
                      },
                    ]}
                    placeholder="Ej. Prueba de sonido a las 8:00 AM"
                    placeholderTextColor={t.textSub}
                    value={observaciones}
                    onChangeText={setObservaciones}
                  />

                  {esDomingoSeleccionado && (
                    <View style={{ marginBottom: 12 }}>
                      <Text
                        style={[
                          styles.inputLabel,
                          { color: t.textMain, fontWeight: "bold" },
                        ]}
                      >
                        🎨 Seleccionar Paleta para este Servicio:
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 6,
                          marginTop: 4,
                        }}
                      >
                        {paletasCulto.map((p) => {
                          const esSeleccionadaModal =
                            paletaSeleccionadaModal?.id === p.id;
                          return (
                            <TouchableOpacity
                              key={p.id}
                              style={[
                                {
                                  width: "48%",
                                  padding: 8,
                                  borderRadius: 6,
                                  borderWidth: 1,
                                  borderColor: t.border,
                                  backgroundColor: t.bg,
                                },
                                esSeleccionadaModal && {
                                  borderColor: t.primary,
                                  borderWidth: 2,
                                },
                              ]}
                              onPress={() => setPaletaSeleccionadaModal(p)}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginBottom: 4,
                                }}
                              >
                                <Text
                                  style={{
                                    color: t.textMain,
                                    fontSize: 11,
                                    fontWeight: "bold",
                                  }}
                                >
                                  {p.nombre}
                                </Text>
                                {esSeleccionadaModal && (
                                  <Text
                                    style={{
                                      color: t.primary,
                                      fontSize: 10,
                                      fontWeight: "bold",
                                    }}
                                  >
                                    ✓
                                  </Text>
                                )}
                              </View>
                              <View
                                style={{
                                  flexDirection: "row",
                                  height: 12,
                                  borderRadius: 2,
                                  overflow: "hidden",
                                }}
                              >
                                {p.colores.map((hex, idx) => (
                                  <View
                                    key={idx}
                                    style={{ flex: 1, backgroundColor: hex }}
                                  />
                                ))}
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  <Text
                    style={[
                      styles.inputLabel,
                      { color: t.textMain, fontWeight: "bold", marginTop: 8 },
                    ]}
                  >
                    Organización del Setlist
                  </Text>

                  {setlistActivo.length > 0 && (
                    <View style={{ marginBottom: 10 }}>
                      <Text
                        style={{
                          color: t.primary,
                          fontSize: 12,
                          fontWeight: "bold",
                          marginBottom: 4,
                        }}
                      >
                        Setlist Activo ({setlistActivo.length}):
                      </Text>
                      {setlistActivo.map((item, idx) => {
                        const estaSeleccionadoParaMover =
                          indiceParaMover === idx;
                        return (
                          <View
                            key={idx}
                            style={[
                              styles.setlistItemRow,
                              { backgroundColor: t.bg, borderColor: t.border },
                              estaSeleccionadoParaMover && {
                                borderColor: t.primary,
                                borderWidth: 2,
                              },
                            ]}
                          >
                            <TouchableOpacity
                              style={{
                                flex: 1,
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                              onPress={() => {
                                if (indiceParaMover === null) {
