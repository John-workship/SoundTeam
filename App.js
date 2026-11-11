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
} from "react-native";
import { supabase, isSupabaseConfigured } from "./supabase";

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
  const [semitonos, setSemitonos] = useState(0);
  const [modoNashville, setModoNashville] = useState(false);
  const [sedeIdSeleccionada, setSedeIdSeleccionada] = useState("general");
  const [integrantes, setIntegrantes] = useState([]);
  const [usuario, setUsuario] = useState("");
  const [usuarioId, setUsuarioId] = useState(null);
  const [rolUsuario, setRolUsuario] = useState("miembro");
  const [rolesMusicalesUsuario, setRolesMusicalesUsuario] = useState([]);
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [cargandoAuth, setCargandoAuth] = useState(false);
  const [errorAuth, setErrorAuth] = useState("");
  const [errorDatos, setErrorDatos] = useState("");

  const sincronizarDatosApp = async () => {
    const { data: dataInt, error } = await supabase
      .from("integrantes")
      .select("*")
      .order("nombre", { ascending: true });
    if (error) {
      setErrorDatos(`No se pudieron cargar los integrantes: ${error.message}`);
      return false;
    }
    setIntegrantes((dataInt || []).map((m) => ({
      id: m.id,
      nombre: m.nombre || "",
      email: m.email ? m.email.trim().toLowerCase() : "",
      sedeId: (m.sede_id || "general").toLowerCase(),
      rolAcceso: (m.rol_acceso || m.rol || "miembro").toLowerCase(),
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
      setUsuarioId(null);
      setRolUsuario("miembro");
      return;
    }

    // Vincula el perfil previamente creado por un administrador con la cuenta autenticada.
    const { error: claimError } = await supabase.rpc("claim_soundteam_profile");
    if (claimError) {
      setErrorAuth(`No se pudo validar tu perfil en SoundTeam: ${claimError.message}`);
      setSesionIniciada(false);
      return;
    }

    const { data: perfil, error: perfilError } = await supabase
      .from("integrantes")
      .select("id, nombre, email, sede_id, rol_acceso, roles_musicales, user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (perfilError || !perfil) {
      setErrorAuth(perfilError?.message || "Tu cuenta inició sesión, pero todavía no tiene un perfil autorizado en SoundTeam. Solicita al administrador que registre tu correo.");
      setSesionIniciada(false);
      return;
    }

    setErrorAuth("");
    setUsuario(perfil.nombre || session.user.email);
    setUsuarioId(session.user.id);
    setRolUsuario((perfil.rol_acceso || "miembro").toLowerCase());
    setSedeIdSeleccionada(perfil.sede_id || "general");
    setSesionIniciada(true);
    await sincronizarDatosApp();
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setErrorAuth("Configura las variables públicas de Supabase para iniciar SoundTeam.");
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setErrorAuth(`Error de sesión: ${error.message}`);
      else verificarSesionActiva(data.session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Evita ejecutar consultas de Supabase dentro del callback síncrono de Auth.
      Promise.resolve().then(() => {
        if (mounted) verificarSesionActiva(session);
      });
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const [pestana, setPestana] = useState("inicio");
  const [nombreTema, setNombreTema] = useState("azul");
  const [nombreTapiz, setNombreTapiz] = useState("ninguno");
  const [mostrarMenuPersonalizacion, setMostrarMenuPersonalizacion] = useState(false);

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
        voces: s.voces || { principal: "Sin asignar", coros: "Sin asignar" },
        instrumentos: s.instrumentos || { piano: "Sin asignar", guitarra: "Sin asignar", bajo: "Sin asignar", bateria: "Sin asignar" },
        sedeId: s.sede_id,
      })));
    } else {
      setServicios([]);
    }
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
  const [setlistEnVivoActual, setSetlistEnVivoActual] = useState([]);
  const [metronomoActivo, setMetronomoActivo] = useState(false);
  const [pulsoActivo, setPulsoActivo] = useState(false);
  const [bpmClick, setBpmClick] = useState(120);
  const [compasClick, setCompasClick] = useState("4/4");
  const [volumenClick, setVolumenClick] = useState(70);
  const [paneoClick, setPaneoClick] = useState(0);
  const [errorClick, setErrorClick] = useState("");

  const audioContextRef = useRef(null);
  const schedulerClickRef = useRef(null);
  const siguientePulsoRef = useRef(0);
  const numeroPulsoRef = useRef(0);
  const pulsoVisualTimeoutRef = useRef(null);
  const [avanceAutomaticoActivo, setAvanceAutomaticoActivo] = useState(false);
  const [semitonosEnVivo, setSemitonosEnVivo] = useState(0);
  const [modoNashvilleEnVivo, setModoNashvilleEnVivo] = useState(false);

  useEffect(() => {
    setSemitonosEnVivo(0);
    setModoNashvilleEnVivo(false);
  }, [indiceCancionEnVivo]);

  // Carga el BPM de la canción seleccionada como punto de partida.
  useEffect(() => {
    const cancion = setlistEnVivoActual[indiceCancionEnVivo] || {};
    const bpm = parseInt(cancion.bpm, 10);
    setBpmClick(Number.isFinite(bpm) ? Math.min(300, Math.max(30, bpm)) : 120);
  }, [indiceCancionEnVivo, setlistEnVivoActual]);

  // El audio se crea al pulsar Iniciar, respetando las restricciones del navegador.
  const alternarMetronomo = async () => {
    if (metronomoActivo) {
      setMetronomoActivo(false);
      setPulsoActivo(false);
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
      setErrorClick("");
      setMetronomoActivo(true);
    } catch (error) {
      setErrorClick("No se pudo iniciar el audio. Comprueba los permisos del navegador.");
      console.error("Error iniciando metrónomo:", error);
    }
  };

  // Scheduler con anticipación para evitar pulsos irregulares.
  useEffect(() => {
    if (!metronomoActivo || !audioContextRef.current) return;

    const contexto = audioContextRef.current;
    const pulsosPorCompas = compasClick === "2/4" ? 2 :
      compasClick === "3/4" ? 3 :
      compasClick === "6/8" ? 6 : 4;

    const programarSonido = (tiempo, esAcento) => {
      const oscilador = contexto.createOscillator();
      const ganancia = contexto.createGain();

      oscilador.type = "sine";
      oscilador.frequency.setValueAtTime(esAcento ? 1250 : 850, tiempo);

      const nivel = Math.max(0.0001, (volumenClick / 100) * (esAcento ? 0.9 : 0.65));
      ganancia.gain.setValueAtTime(0.0001, tiempo);
      ganancia.gain.linearRampToValueAtTime(nivel, tiempo + 0.005);
      ganancia.gain.exponentialRampToValueAtTime(0.0001, tiempo + 0.075);

      if (contexto.createStereoPanner) {
        const paneador = contexto.createStereoPanner();
        paneador.pan.setValueAtTime(paneoClick, tiempo);
        oscilador.connect(ganancia);
        ganancia.connect(paneador);
        paneador.connect(contexto.destination);
      } else {
        oscilador.connect(ganancia);
        ganancia.connect(contexto.destination);
      }

      oscilador.start(tiempo);
      oscilador.stop(tiempo + 0.08);

      const demora = Math.max(0, (tiempo - contexto.currentTime) * 1000);
      setTimeout(() => {
        setPulsoActivo(true);
        if (pulsoVisualTimeoutRef.current) clearTimeout(pulsoVisualTimeoutRef.current);
        pulsoVisualTimeoutRef.current = setTimeout(() => setPulsoActivo(false), 110);
      }, demora);
    };

    const revisarAgenda = () => {
      if (contexto.state !== "running") return;

      while (siguientePulsoRef.current < contexto.currentTime + 0.12) {
        const esAcento = numeroPulsoRef.current === 0;
        programarSonido(siguientePulsoRef.current, esAcento);

        const duracionPulso = 60 / bpmClick;
        siguientePulsoRef.current += duracionPulso;
        numeroPulsoRef.current = (numeroPulsoRef.current + 1) % pulsosPorCompas;
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
  }, [metronomoActivo, bpmClick, compasClick, volumenClick, paneoClick]);

  // Limpieza de recursos de audio al salir de la pantalla.
  useEffect(() => {
    return () => {
      if (schedulerClickRef.current) clearInterval(schedulerClickRef.current);
      if (pulsoVisualTimeoutRef.current) clearTimeout(pulsoVisualTimeoutRef.current);
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

  const [repertorio, setRepertorio] = useState([]);

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
  const [nuevoTipoSetCancion, setNuevoTipoSetCancion] = useState("lenta");
  const [nuevaLetraCancion, setNuevaLetraCancion] = useState("");
  const [etiquetasActuales, setEtiquetasActuales] = useState([]);

  const [canalChatActivo, setCanalChatActivo] = useState("finsemana");
  const [mensajesChat, setMensajesChat] = useState([]);
  const [nuevoMensajeTexto, setNuevoMensajeTexto] = useState("");
  const [idMensajeEditando, setIdMensajeEditando] = useState(null);

  const cargarMensajesSupabase = async () => {
    if (!sesionIniciada) return;
    const { data, error } = await supabase
      .from("mensajes")
      .select("*")
      .eq("canal", canalChatActivo)
      .eq("sede", sedeIdSeleccionada)
      .order("created_at", { ascending: true });
    if (error) {
      setErrorDatos(`No se pudieron cargar los mensajes: ${error.message}`);
      return;
    }
    setMensajesChat(data || []);
  };

  useEffect(() => {
    if (sesionIniciada) cargarMensajesSupabase();
  }, [canalChatActivo, sedeIdSeleccionada, sesionIniciada]);

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

  const recargarDatosApp = async () => {
    setErrorDatos("");
    await verificarSesionActiva();
    await Promise.all([
      cargarServiciosSupabase(),
      cargarRepertorioSupabase(),
      cargarMensajesSupabase(),
    ]);
  };

  const esAdmin = rolUsuario === "admin";
  const esAdminOLider = rolUsuario === "admin" || rolUsuario === "lider";
  const puedeGestionarRepertorio = esAdminOLider || rolesMusicalesUsuario.some(r => ["piano", "guitarra", "bajo", "bateria"].includes(String(r).toLowerCase()));

  const enviarOActualizarMensajeChat = async () => {
    if (nuevoMensajeTexto.trim() !== "") {
      const horaActual = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (idMensajeEditando !== null) {
        const { error } = await supabase.from("mensajes").update({ texto: nuevoMensajeTexto.trim(), editado: true }).eq("id", Number(idMensajeEditando));
        if (error) { alert(`No se pudo corregir el mensaje: ${error.message}`); return; }
        setIdMensajeEditando(null);
        setNuevoMensajeTexto("");
        await cargarMensajesSupabase();
      } else {
        const mensaje = {
          autor: usuario,
          texto: nuevoMensajeTexto.trim(),
          hora: horaActual,
          canal: canalChatActivo,
          sede: sedeIdSeleccionada,
          editado: false,
        };
        const { error } = await supabase.from("mensajes").insert([{ ...mensaje, user_id: usuarioId }]);
        if (error) { alert(`No se pudo enviar el mensaje: ${error.message}`); return; }
        setNuevoMensajeTexto("");
        await cargarMensajesSupabase();
      }
    }
  };

  const limpiarHistorialChat = async () => {
    if (!esAdminOLider) { alert("⚠️ Solo Administradores y Líderes pueden limpiar el chat."); return; }
    if (confirm(`¿Deseas borrar el historial del chat de ${canalChatActivo.toUpperCase()} para esta sede (${sedeActual.nombre})?`)) {
      const { error } = await supabase.from("mensajes").delete().eq("canal", canalChatActivo).eq("sede", sedeIdSeleccionada);
      if (error) { alert(`No se pudo limpiar el chat: ${error.message}`); return; }
      setMensajesChat([]);
      alert("Chat de la sede limpiado con éxito.");
    }
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
      tipo_set: nuevoTipoSetCancion,
      etiquetas: etiquetasActuales,
      letra: nuevaLetraCancion || "",
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
      setIdCancionEditando(null);
    setCancionSeleccionadaDetalle(null);
    setNuevoTituloCancion("");
    setNuevoArtistaCancion("");
    setNuevoTonoCancion("C");
    setNuevoBpmCancion("120");
    setNuevoTipoSetCancion("lenta");
    setNuevaLetraCancion("");
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

  if (!sesionIniciada) {
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

          <Text style={[styles.inputLabel, { color: t.textMain }]}>🔑 Contraseña</Text>
          <TextInput
            style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
            placeholder="Tu contraseña"
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
              <Text style={styles.loginButtonText}>{cargandoAuth ? "Verificando..." : "Iniciar sesión"}</Text>
            </TouchableOpacity>

            {!!errorAuth && (
              <Text accessibilityRole="alert" style={{ color: "#EF4444", fontSize: 12, marginTop: 8 }}>
                {errorAuth}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }, tapizActual.css]}>
      {!!errorDatos && (
        <TouchableOpacity onPress={() => setErrorDatos("")} style={{ padding: 8, backgroundColor: "#7F1D1D" }}>
          <Text style={{ color: "#FFFFFF", fontSize: 12 }}>{errorDatos} · Toca para cerrar</Text>
        </TouchableOpacity>
      )}
      {modoEnVivoActivo ? (
        <View style={[styles.teleprompterContainer, { backgroundColor: "#0B0F19" }]}>
          <View style={styles.teleprompterTopBar}>
            <TouchableOpacity 
              style={styles.teleprompterExitBtn}
              onPress={() => { setModoEnVivoActivo(false); setMetronomoActivo(false); setAvanceAutomaticoActivo(false); }}
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
                    Tono: {transponerTono((setlistEnVivoActual[indiceCancionEnVivo] || {}).tono || "C", semitonosEnVivo)}
                  </Text>
                </View>
              </View>

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

            <View style={styles.teleprompterLyricsBox}>
              <Text style={styles.teleprompterLyricsText}>
                {(() => {
                  const cancionActual = setlistEnVivoActual[indiceCancionEnVivo] || {};
                  const objetoRepo = repertorio.find(r => r.titulo && cancionActual.titulo && r.titulo.toLowerCase() === cancionActual.titulo.toLowerCase()) || {};
                  const letraBase = objetoRepo.letra || cancionActual.letra || "[INTRO]\\nLetra no disponible en biblioteca.";
                    const tonoActual = transponerTono(cancionActual.tono || objetoRepo.tono || "C", semitonosEnVivo);
                    const letraTranspuesta = transponerLetra(letraBase, semitonosEnVivo);
                    return modoNashvilleEnVivo
                      ? convertirANashville(letraTranspuesta, tonoActual)
                      : letraTranspuesta;
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

                      
                       <Text style={[styles.inputLabel, { color: t.textMain, fontWeight: "bold", marginTop: 8 }]}>Organización del Setlist</Text>
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
                              };
                              if (idServicioEditando !== null) {
                                const { error } = await supabase.from("servicios").update({ titulo: nombreEvento.trim(), observaciones, setlist: setlistActivo }).eq("id", idServicioEditando);
                                if (error) { alert(`No se pudo actualizar el servicio: ${error.message}`); return; }
                              } else {
                                const { error } = await supabase.from("servicios").insert([{ ...nuevoServicioObj, paleta_seleccionada: null }]);
                                if (error) { alert(`No se pudo crear el servicio: ${error.message}`); return; }
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
                                  const { error } = await supabase.from("servicios").delete().eq("id", serv.id);
                                  if (error) { alert(`No se pudo eliminar el servicio: ${error.message}`); return; }
                                  await cargarServiciosSupabase();
                                }}
                              >
                                <Text style={{ fontSize: 10, color: "#FFFFFF", fontWeight: "bold" }}>🗑️ Eliminar</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                        <Text style={{ color: t.textSub, fontSize: 11, marginTop: 2, marginBottom: 4 }}>Observaciones: {serv.observaciones}</Text>
                        <View style={{ marginTop: 10, marginBottom: 10, padding: 9, borderRadius: 8, backgroundColor: t.bg, borderWidth: 1, borderColor: t.border }}>
                          <Text style={{ color: t.textMain, fontSize: 12, fontWeight: "bold", marginBottom: 9 }}>👥 OCUPACIÓN DE PUESTOS</Text>
                          <View style={{ flexDirection: "row", gap: 10 }}>
                            <View style={{ flex: 1, minWidth: 0 }}>
                              <Text style={{ color: t.primary, fontSize: 12, fontWeight: "bold", marginBottom: 7 }}>🎤 VOCES</Text>
                              {[
                                { key: "vozPrincipal", label: "Voz principal", personas: serv.voces?.principal && serv.voces.principal !== "Sin asignar" ? [serv.voces.principal] : [] },
                                { key: "coros", label: "Coros", personas: (serv.voces?.coros || "Sin asignar").split(",").map((x) => x.trim()).filter((x) => x && x !== "Sin asignar") },
                              ].map((puesto) => (
                                <View key={puesto.key} style={{ marginBottom: 9 }}>
                                  <Text style={{ color: t.textSub, fontSize: 11, fontWeight: "bold", marginBottom: 3 }}>{puesto.label} ({puesto.personas.length}/{puesto.key === "coros" ? 3 : 1})</Text>
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
                            <View style={{ flex: 1, minWidth: 0, borderLeftWidth: 1, borderLeftColor: t.border, paddingLeft: 9 }}>
                              <Text style={{ color: t.primary, fontSize: 12, fontWeight: "bold", marginBottom: 7 }}>🎸 INSTRUMENTOS</Text>
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


                        <Text style={{ color: t.primary, fontSize: 11, fontWeight: "bold", marginTop: 4, marginBottom: 4 }}>🎵 SETLIST ({serv.setlist?.length || 0}):</Text>
                        {serv.setlist && serv.setlist.length > 0 ? (
                          ["lenta", "rapida"].map((tipo) => {
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
                                  <View key={`${tipo}-${i}`} style={{ backgroundColor: t.bg, padding: 6, borderRadius: 6, borderWidth: 1, borderColor: t.border, marginBottom: 4 }}>
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
                            style={{ backgroundColor: "#2563EB", padding: 8, borderRadius: 6, alignItems: "center", marginTop: 6, marginBottom: 6 }}
                            onPress={() => {
                              setSetlistEnVivoActual(serv.setlist);
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
                              style={{ padding: 8, borderRadius: 7, borderWidth: 1, borderColor: activo ? t.primary : t.border, backgroundColor: activo ? t.primary : t.cardBg }}
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
                                style={{ flex: 1, padding: 9, borderRadius: 7, borderWidth: 1, borderColor: rolAccesoNuevo === op.key ? t.primary : t.border, backgroundColor: rolAccesoNuevo === op.key ? t.primary : t.cardBg }}
                              >
                                <Text style={{ color: rolAccesoNuevo === op.key ? "#FFFFFF" : t.textMain, textAlign: "center", fontWeight: "bold" }}>{op.label}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </>
                      )}
                      <Text style={{ color: t.textSub, fontSize: 11, marginBottom: 8 }}>
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
                    <View key={int.id} style={[styles.memberCard, { backgroundColor: t.bg, borderColor: t.border }]}>
                      <View style={styles.memberHeaderRow}>
                        <Text style={[styles.memberTitle, { color: t.textMain }]}>👤 {int.nombre}</Text>
                        <View style={{ flexDirection: "row", gap: 6 }}>
                          {(int.rolAcceso !== "admin" && (esAdmin || int.rolAcceso === "miembro")) && (
                            <TouchableOpacity
                              style={{ backgroundColor: t.primary, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 4 }}
                              onPress={() => {
                                setIdMiembroEditando(int.id);
                                setNombreNuevoMiembro(int.nombre || "");
                                setEmailNuevoMiembro(int.email || "");
                                setRolAccesoNuevo(int.rolAcceso === "lider" ? "lider" : "miembro");
                                setRolesMusicalesNuevo(Array.isArray(int.rolesMusicales) ? int.rolesMusicales : []);
                                setModalMiembroVisible(true);
                              }}
                            >
                              <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "bold" }}>✏️ Editar</Text>
                            </TouchableOpacity>
                          )}
                          {(esAdmin || String(int.email || "").trim().toLowerCase() !== "johnbocal31@gmail.com") && (
<TouchableOpacity
                          style={{ backgroundColor: "#EF4444", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 }}
                          onPress={async () => {
                            const { error } = await supabase.from("integrantes").delete().eq("id", int.id);
                            if (error) { alert(`No se pudo eliminar el integrante: ${error.message}`); return; }
                            await sincronizarDatosApp();
                          }}
                        >
                          <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "bold" }}>🗑️ Eliminar</Text>
                          </TouchableOpacity>
                          )}
                        </View>
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
                        onPress={() => { setSemitonos(0); setModoNashville(false); setCancionSeleccionadaDetalle(null); }}
                      >
                        <Text style={{ color: t.textMain, fontSize: 12, fontWeight: "bold" }}>← Volver al repertorio</Text>
                      </TouchableOpacity>
                      {puedeGestionarRepertorio && (
                        <TouchableOpacity
                          style={{ backgroundColor: t.primary, padding: 9, borderRadius: 6, marginBottom: 12, alignSelf: "flex-start" }}
                          onPress={() => {
                            const c = cancionSeleccionadaDetalle;
                            setNuevoTituloCancion(c.titulo || "");
                            setNuevoArtistaCancion(c.artista || "");
                            setNuevoTonoCancion(c.tono || "C");
                            setNuevoBpmCancion(String(c.bpm || "120"));
                            setNuevoTipoSetCancion(c.tipoSet || c.tipo_set || "lenta");
                            setNuevaLetraCancion(c.letra || "");
                            setEtiquetasActuales(c.etiquetas || []);
                            setIdCancionEditando(c.id);
                            setModoEdicionCancion(true);
                            setCancionSeleccionadaDetalle(null);
                          }}
                        >
                          <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 12 }}>✏️ Editar canción</Text>
                        </TouchableOpacity>
                      )}
                      {puedeGestionarRepertorio && (
                        <TouchableOpacity
                          style={{ backgroundColor: "#B91C1C", padding: 9, borderRadius: 6, marginBottom: 12, alignSelf: "flex-start" }}
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
                      <View style={{ backgroundColor: t.bg, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: t.border }}>
                        <Text style={{ color: t.textMain, fontSize: 14, lineHeight: 22 }}>{modoNashville
                          ? convertirANashville(
                              transponerLetra(cancionSeleccionadaDetalle.letra || "", semitonos),
                              transponerTono(cancionSeleccionadaDetalle.tono, semitonos)
                            )
                          : transponerLetra(cancionSeleccionadaDetalle.letra || "", semitonos)
                        }</Text>
                      </View>
                    </View>
                  ) : (
                    <>
                    {puedeGestionarRepertorio && (
                      <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border, marginBottom: 12 }]}>
                        <Text style={[styles.cardTitle, { color: t.textMain, fontSize: 16, marginBottom: 12 }]}>{modoEdicionCancion ? "✏️ Editar canción" : "➕ Agregar nueva canción"}</Text>
                        <TextInput style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain, marginBottom: 8 }]} placeholder="Título de la canción" placeholderTextColor={t.textSub} value={nuevoTituloCancion} onChangeText={setNuevoTituloCancion} />
                        <TextInput style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain, marginBottom: 8 }]} placeholder="Artista o autor" placeholderTextColor={t.textSub} value={nuevoArtistaCancion} onChangeText={setNuevoArtistaCancion} />
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <TextInput style={[styles.loginInput, { flex: 1, backgroundColor: t.bg, borderColor: t.border, color: t.textMain, marginBottom: 8 }]} placeholder="Tono (C, G...)" placeholderTextColor={t.textSub} value={nuevoTonoCancion} onChangeText={setNuevoTonoCancion} />
                          <TextInput style={[styles.loginInput, { flex: 1, backgroundColor: t.bg, borderColor: t.border, color: t.textMain, marginBottom: 8 }]} placeholder="BPM" placeholderTextColor={t.textSub} keyboardType="numeric" value={nuevoBpmCancion} onChangeText={setNuevoBpmCancion} />
                        </View>
                        <Text style={[styles.inputLabel, { color: t.textMain }]}>Tipo de set</Text>
                        <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
                          {[{key:"lenta",label:"🕯️ Lentas"},{key:"rapida",label:"⚡ Rápidas"}].map(op => (
                            <TouchableOpacity key={op.key} onPress={() => setNuevoTipoSetCancion(op.key)} style={{ flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: nuevoTipoSetCancion === op.key ? t.primary : t.border, backgroundColor: nuevoTipoSetCancion === op.key ? t.primary : t.bg }}>
                              <Text style={{ color: nuevoTipoSetCancion === op.key ? "#FFF" : t.textMain, textAlign: "center", fontWeight: "bold" }}>{op.label}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                        <TextInput style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain, height: 110, textAlignVertical: "top", marginBottom: 10 }]} placeholder="Letra con acordes [C]..." placeholderTextColor={t.textSub} multiline value={nuevaLetraCancion} onChangeText={setNuevaLetraCancion} />
                        <TouchableOpacity style={[styles.loginButton, { backgroundColor: t.primary }]} onPress={guardarOActualizarCancion}>
                          <Text style={styles.loginButtonText}>{modoEdicionCancion ? "Guardar cambios" : "Guardar en repertorio"}</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                      <Text style={[styles.cardTitle, { color: t.textMain, fontSize: 16, marginBottom: 14 }]}>Repertorio de {sedeActual.nombre} ({repertorio.length})</Text>
                      {repertorio.map((c) => (
                        <TouchableOpacity
                          key={c.id}
                          style={[styles.repertorioItemRowPro, { borderBottomColor: t.border, backgroundColor: t.bg }]}
                          onPress={() => { setSemitonos(0); setModoNashville(false); setCancionSeleccionadaDetalle(c); }}
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
  editServiceBtn: { backgroundColor: "#3B82F6", paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4 },
  deleteServiceBtn: { backgroundColor: "#EF4444", paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4 },
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