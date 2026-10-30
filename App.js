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
  return texto.replace(/\[([^\]]+)\]/g, (match, p1) => {
    return "[" + transponerAcordeCompuesto(p1, semitonos) + "]";
  });
};

export default function App() {
  const [integrantes, setIntegrantes] = useState(() => {
    if (Platform.OS === "web") {
      try {
        const guardados = localStorage.getItem("soundteam_integrantes_v2");
        return guardados
          ? JSON.parse(guardados)
          : [
              {
                id: 1,
                nombre: "Admin",
                pin: "1234",
                rolAcceso: "admin",
                rolesMusicales: ["👑 Director"],
              },
              {
                id: 2,
                nombre: "Líder",
                pin: "1234",
                rolAcceso: "lider",
                rolesMusicales: ["⭐ Líder de Grupo"],
              },
              {
                id: 3,
                nombre: "Lina",
                pin: "1234",
                rolAcceso: "miembro",
                rolesMusicales: ["🎤 Coros"],
              },
              {
                id: 4,
                nombre: "Arley",
                pin: "1234",
                rolAcceso: "miembro",
                rolesMusicales: ["🎹 Piano"],
              },
              {
                id: 5,
                nombre: "Alex",
                pin: "1234",
                rolAcceso: "miembro",
                rolesMusicales: ["🥁 Batería"],
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
          "soundteam_integrantes_v2",
          JSON.stringify(integrantes)
        );
      } catch (e) {}
    }
  }, [integrantes]);

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
            ];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

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

  const [repertorio, setRepertorio] = useState(() => {
    if (Platform.OS === "web") {
      try {
        const guardados = localStorage.getItem("soundteam_repertorio_pro");
        return guardados
          ? JSON.parse(guardados)
          : [
              {
                id: 1,
                titulo: "Creo en ti",
                artista: "Espíritu y Verdad",
                tono: "C",
                etiquetas: ["Alabanza"],
                letra: "[C] Creo en ti, [G] Señor\n[Am] Con todo el corazón",
              },
            ];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [cancionSeleccionadaDetalle, setCancionSeleccionadaDetalle] =
    useState(null);
  const [semitonosTransposicion, setSemitonosTransposicion] = useState(0);
  const [modoEdicionCancion, setModoEdicionCancion] = useState(false);
  const [nuevoTituloCancion, setNuevoTituloCancion] = useState("");
  const [nuevoArtistaCancion, setNuevoArtistaCancion] = useState("");
  const [nuevoTonoCancion, setNuevoTonoCancion] = useState("");
  const [nuevaLetraCancion, setNuevaLetraCancion] = useState("");
  const [etiquetasActuales, setEtiquetasActuales] = useState([]);

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

    if (data && !error) setMensajesChat(data);
    else setMensajesChat([]);
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

  const handleLogin = async () => {
    if (usuario.trim() === "") {
      alert("⚠️ Ingresa un nombre de usuario.");
      return;
    }

    let rolAsignado = "miembro";
    const miembroEncontrado = integrantes.find(
      (m) => m.nombre.trim().toLowerCase() === usuario.trim().toLowerCase()
    );

    if (miembroEncontrado) {
      if (miembroEncontrado.pin !== pinInput.trim()) {
        alert("⚠️ PIN incorrecto.");
        return;
      }
      rolAsignado = miembroEncontrado.rolAcceso || "miembro";
    } else {
      const { data, error } = await supabase.from("usuarios").select("*");
      if (data && !error) {
        const usuarioSupabase = data.find(
          (u) => u.nombre.trim().toLowerCase() === usuario.trim().toLowerCase()
        );
        if (usuarioSupabase) {
          if (usuarioSupabase.pin !== pinInput.trim()) {
            alert("⚠️ PIN incorrecto.");
            return;
          }
          rolAsignado = usuarioSupabase.rol;
        } else {
          alert("⚠️ Usuario no registrado en el sistema.");
          return;
        }
      } else {
        alert("⚠️ Usuario no registrado en el sistema.");
        return;
      }
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
        await supabase
          .from("mensajes")
          .update({ texto: textoModificado, editado: true })
          .eq("id", Number(idMensajeEditando));

        setIdMensajeEditando(null);
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
        await supabase.from("mensajes").insert([mensaje]);
        await cargarMensajesSupabase();
      }
    }
  };

  const limpiarHistorialChat = async () => {
    if (!esAdminOLider) {
      alert("⚠️ Solo Administradores y Líderes pueden limpiar el chat.");
      return;
    }
    if (confirm(`¿Deseas limpiar el historial de ${canalChatActivo}?`)) {
      await supabase.from("mensajes").delete().eq("canal", canalChatActivo);
      setMensajesChat([]);
      alert("🧹 Historial limpiado.");
    }
  };

  const guardarOActualizarCancion = () => {
    if (!puedeControlarRepertorio) {
      alert("⚠️ No tienes permisos para modificar el repertorio.");
      return;
    }
    if (nuevoTituloCancion.trim() !== "") {
      if (cancionSeleccionadaDetalle !== null && modoEdicionCancion) {
        const actualizada = {
          ...cancionSeleccionadaDetalle,
          titulo: nuevoTituloCancion,
          artista: nuevoArtistaCancion || "Sin artista",
          tono: nuevoTonoCancion || "C",
          etiquetas: etiquetasActuales,
          letra: nuevaLetraCancion || "",
        };
        setRepertorio(repertorio.map((c) => (c.id === actualizada.id ? actualizada : c)));
        setCancionSeleccionadaDetalle(actualizada);
        setModoEdicionCancion(false);
      } else {
        const nueva = {
          id: Date.now(),
          titulo: nuevoTituloCancion,
          artista: nuevoArtistaCancion || "Sin artista",
          tono: nuevoTonoCancion || "C",
          etiquetas: ["Adoración"],
          letra: nuevaLetraCancion || "",
        };
        setRepertorio([...repertorio, nueva]);
        setModoEdicionCancion(false);
      }
      setNuevoTituloCancion("");
      setNuevoArtistaCancion("");
      setNuevoTonoCancion("");
      setNuevaLetraCancion("");
    }
  };

  const mesNumStr = String(mesSeleccionadoObj.mesIndex + 1).padStart(2, "0");
  const fechaActualClave = `${mesSeleccionadoObj.year}-${mesNumStr}-${
    diaSeleccionado < 10 ? "0" + diaSeleccionado : diaSeleccionado
  }`;
  const serviciosDelDia = servicios.filter((s) => s.fecha === fechaActualClave);

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
            Ingresa tu usuario y PIN de acceso
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
            placeholder="Usuario"
            placeholderTextColor={t.textSub}
            value={usuario}
            onChangeText={setUsuario}
          />
          <TextInput
            style={[
              styles.loginInput,
              {
                backgroundColor: t.bg,
                borderColor: t.border,
                color: t.textMain,
              },
            ]}
            placeholder="PIN de acceso"
            placeholderTextColor={t.textSub}
            secureTextEntry
            value={pinInput}
            onChangeText={setPinInput}
          />
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: t.primary }]}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Entrar a la App</Text>
          </TouchableOpacity>
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
              SoundTeam
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: t.textSub }]}
              numberOfLines={1}
            >
              👤 {usuario} • ROL: {rolUsuario.toUpperCase()}
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
                <Text
                  style={[
                    styles.cardTitle,
                    { color: t.textMain, marginBottom: 10 },
                  ]}
                >
                  💬 Chat de Equipos
                </Text>
                <View
                  style={{
                    backgroundColor: t.bg,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: t.border,
                    padding: 10,
                    height: 200,
                    marginBottom: 10,
                  }}
                >
                  <ScrollView>
                    {mensajesChat.map((m, i) => (
                      <View key={m.id || i} style={{ marginBottom: 6 }}>
                        <Text
                          style={{
                            color: t.primary,
                            fontWeight: "bold",
                            fontSize: 11,
                          }}
                        >
                          {m.autor}:
                        </Text>
                        <Text style={{ color: t.textMain, fontSize: 12 }}>
                          {m.texto}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>

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
                      },
                    ]}
                    placeholder="Escribe un mensaje..."
                    placeholderTextColor={t.textSub}
                    value={nuevoMensajeTexto}
                    onChangeText={setNuevoMensajeTexto}
                  />
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      {
                        backgroundColor: t.primary,
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                      },
                    ]}
                    onPress={enviarOActualizarMensajeChat}
                  >
                    <Text style={[styles.loginButtonText, { fontSize: 12 }]}>
                      Enviar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {pestana === "repertorio" && (
            <View
              style={[
                styles.card,
                { backgroundColor: t.cardBg, borderColor: t.border },
              ]}
            >
              <Text
                style={[
                  styles.cardTitle,
                  { color: t.textMain, fontSize: 16, marginBottom: 14 },
                ]}
              >
                Repertorio ({repertorio.length})
              </Text>
              {repertorio.map((c) => (
                <View
                  key={c.id}
                  style={[
                    styles.repertorioItemRowPro,
                    {
                      borderBottomColor: t.border,
                      backgroundColor: t.bg,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: t.textMain,
                        fontSize: 15,
                        fontWeight: "bold",
                      }}
                    >
                      {c.titulo}
                    </Text>
                    <Text style={{ color: t.textSub, fontSize: 12 }}>
                      {c.artista} • Tono: {c.tono}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.tabBar,
          { backgroundColor: t.cardBg, borderTopColor: t.border },
        ]}
      >
        {[
          { key: "inicio", label: "🏠 Inicio" },
          { key: "eventos", label: "📅 Eventos" },
          ...(esAdminOLider ? [{ key: "equipo", label: "👥 Equipo" }] : []),
          { key: "repertorio", label: "🎵 Repertorio" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => setPestana(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                { color: t.textSub },
                pestana === tab.key && {
                  color: t.textMain,
                  fontWeight: "bold",
                },
              ]}
            >
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
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: "100%",
    minHeight: "100vh",
  },
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
  repertorioItemRowPro: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, marginBottom: 6 },
  tabBar: { flexDirection: "row", height: 55, borderTopWidth: 1, width: "100%" },
  tabItem: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 2 },
  tabText: { fontSize: 10, textAlign: "center" },
});
