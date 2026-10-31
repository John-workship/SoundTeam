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

// --- MOTOR DE TRANSPOSICIÓN Y CONVERSIÓN ARMÓNICA ---
const NOTAS_SEMI = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTAS_BEMOL = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" };

const MAPA_NASHVILLE = {
  0: "1", 1: "1#", 2: "2", 3: "2#", 4: "3", 5: "4", 6: "4#", 7: "5", 8: "5#", 9: "6", 10: "6#", 11: "7"
};

const MAPA_ROMANOS = {
  0: "I", 1: "I#", 2: "ii", 3: "iii♭", 4: "iii", 5: "IV", 6: "IV#", 7: "V", 8: "VI♭", 9: "vi", 10: "VII♭", 11: "vii°"
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

const convertirAcordeAModo = (acorde, semitonos, tonoBase = "G", modo = "Acordes") => {
  if (!acorde) return "";
  let acordeTranspuesto = transponerNotaUnica(acorde, semitonos);
  if (modo === "Acordes") return acordeTranspuesto;

  let raiz = acordeTranspuesto.length >= 2 && (acordeTranspuesto[1] === "#" || acordeTranspuesto[1] === "b") 
    ? acordeTranspuesto.substring(0, 2) 
    : acordeTranspuesto.substring(0, 1);
  let resto = acordeTranspuesto.substring(raiz.length);

  if (NOTAS_BEMOL[raiz]) raiz = NOTAS_BEMOL[raiz];
  let raizTonoBase = NOTAS_BEMOL[tonoBase] || tonoBase;
  
  let idxTono = NOTAS_SEMI.indexOf(raizTonoBase);
  let idxAcorde = NOTAS_SEMI.indexOf(raiz);

  if (idxTono === -1 || idxAcorde === -1) return acordeTranspuesto;

  let diff = (idxAcorde - idxTono + 12) % 12;

  if (modo === "Nashville") {
    return (MAPA_NASHVILLE[diff] || raiz) + resto;
  } else if (modo === "Romanos") {
    return (MAPA_ROMANOS[diff] || raiz) + resto;
  }
  return acordeTranspuesto;
};

const transponerTextoLetraAvanzado = (texto, semitonos, tonoBase, modo) => {
  if (!texto) return texto;

  return texto.replace(/\[([^\]]+)\]/g, (match, p1) => {
    let acordesProcesados = p1.split("/").map(a => convertirAcordeAModo(a, semitonos, tonoBase, modo)).join("/");
    return "[" + acordesProcesados + "]";
  });
};

export default function App() {
  const [sedeIdSeleccionada, setSedeIdSeleccionada] = useState(() => {
    if (Platform.OS === "web") {
      try {
        return localStorage.getItem("soundteam_sede_activa") || "general";
      } catch (e) {
        return "general";
      }
    }
    return "general";
  });

  useEffect(() => {
    if (Platform.OS === "web") {
      try {
        localStorage.setItem("soundteam_sede_activa", sedeIdSeleccionada);
      } catch (e) {}
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

  const t = TEMAS[nombreTema];
  const sedeActual = SEDES_DISPONIBLES.find((s) => s.id === sedeIdSeleccionada) || SEDES_DISPONIBLES[0];

  const [repertorio, setRepertorio] = useState([
    {
      id: 1,
      titulo: "A tus pies",
      artista: "Miel San Marcos",
      tono: "G",
      tonoDetectado: "C",
      publicado: false,
      etiquetas: ["Adoración", "Gracia y perdón", "Entrega"],
      letra: `[INTRO]\n[G] [C] [G] [C]\n\n[PRIMERA PARTE]\n[G] A tus pies arde mi [D] corazón\n[Em] A tus pies entrego [C] lo que soy\n[G] Es el lugar de mi [D] seguridad\n[Em] Donde nadie me puede [C] señalar\n\n[PRE-ESTRIBILLO]\nMe perdonaste, me acercaste a tu [D] presencia\nMe levantaste, hoy me postro a [D] adorarte\n\n[ESTRIBILLO]\nNo hay lugar más alto, más [C] grande\nQue estar a tus pies, que [D] estar a tus [G] pies`,
    },
    {
      id: 2,
      titulo: "A dónde iré",
      artista: "Verbo y Vida",
      tono: "F",
      tonoDetectado: "F",
      publicado: true,
      etiquetas: ["Adoración", "Entrega"],
      letra: `[INTRO]\n[F] [C] [Dm]\n[C] [Bb] [F]\n[Gm] [Bb]\n\n[PRIMERA PARTE]\n[F] Siento que sin ti\n[Bb] Mi vida es nada`,
    },
  ]);

  const [cancionSeleccionadaDetalle, setCancionSeleccionadaDetalle] = useState(null);
  const [semitonosTransposicion, setSemitonosTransposicion] = useState(0);
  const [modoNotacion, setModoNotacion] = useState("Acordes");

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

    setUsuario(miembroEncontrado.nombre);
    setRolUsuario(miembroEncontrado.rolAcceso || "miembro");
    setSesionIniciada(true);
  };

  if (!sesionIniciada) {
    return (
      <View style={[styles.loginContainer, { backgroundColor: t.bg }]}>
        <View style={[styles.loginCard, { backgroundColor: t.cardBg, borderColor: t.border }]}>
          <Text style={[styles.loginTitle, { color: t.textMain }]}>SoundTeam</Text>
          <Text style={[styles.loginSubtitle, { color: t.textSub }]}>Inicio de Sesión</Text>
          <TextInput
            style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
            placeholder="Usuario"
            placeholderTextColor={t.textSub}
            value={usuario}
            onChangeText={setUsuario}
          />
          <TextInput
            style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
            placeholder="PIN"
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
        <Text style={[styles.headerTitle, { color: t.textMain }]}>SoundTeam • {sedeActual.nombre}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40, alignItems: "center" }}>
        <View style={styles.mainWrapper}>
          {pestana === "repertorio" && (
            <>
              {cancionSeleccionadaDetalle !== null ? (
                <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                  <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => {
                      setCancionSeleccionadaDetalle(null);
                      setSemitonosTransposicion(0);
                    }}
                  >
                    <Text style={{ color: t.textMain, fontWeight: "bold" }}>← {cancionSeleccionadaDetalle.titulo}</Text>
                  </TouchableOpacity>

                  {/* Etiquetas */}
                  <View style={{ flexDirection: "row", gap: 6, marginVertical: 8 }}>
                    <View style={styles.tagChipActive}>
                      <Text style={{ color: "#FFF", fontSize: 11 }}>Acordes escritos en {cancionSeleccionadaDetalle.tono}</Text>
                    </View>
                    {cancionSeleccionadaDetalle.etiquetas?.map((tag, idx) => (
                      <View key={idx} style={styles.tagChip}>
                        <Text style={{ color: t.textSub, fontSize: 11 }}>{tag}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Banner de Revisión */}
                  {!cancionSeleccionadaDetalle.publicado && (
                    <View style={styles.revisionBanner}>
                      <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 12 }}>
                        Pendiente de revisión: esta canción aún no es visible para la banda.
                      </Text>
                      <Text style={{ color: "#CBD5E1", fontSize: 11, marginTop: 4 }}>
                        ¿En qué tono están escritos estos acordes?
                      </Text>
                      <View style={{ flexDirection: "row", gap: 6, marginVertical: 6 }}>
                        <TouchableOpacity style={styles.toneBadgeActive}><Text style={{ color: "#FFF", fontWeight: "bold" }}>{cancionSeleccionadaDetalle.tono}</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.toneBadge}><Text style={{ color: "#FFF" }}>{cancionSeleccionadaDetalle.tonoDetectado}</Text></TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        style={styles.publishBtn}
                        onPress={() => {
                          setRepertorio(repertorio.map(c => c.id === cancionSeleccionadaDetalle.id ? { ...c, publicado: true } : c));
                          setCancionSeleccionadaDetalle({ ...cancionSeleccionadaDetalle, publicado: true });
                          alert("Aprobado y publicado para la banda.");
                        }}
                      >
                        <Text style={{ color: "#FFF", fontWeight: "bold", textAlign: "center" }}>✓ Aprobar y publicar</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Panel de Análisis Armónico */}
                  <View style={[styles.analysisCard, { borderColor: t.border }]}>
                    <Text style={{ color: t.textMain, fontWeight: "bold", fontSize: 12 }}>🎵 ANÁLISIS ARMÓNICO</Text>
                    <Text style={{ color: t.textSub, fontSize: 11, marginTop: 4 }}>
                      Acordes escritos en (detectado): <Text style={{ color: t.primary, fontWeight: "bold" }}>{cancionSeleccionadaDetalle.tonoDetectado}</Text>
                    </Text>
                    {cancionSeleccionadaDetalle.tono !== cancionSeleccionadaDetalle.tonoDetectado && (
                      <Text style={{ color: "#EF4444", fontSize: 11, marginTop: 2, fontWeight: "bold" }}>
                        La fuente indicaba {cancionSeleccionadaDetalle.tono}, pero los acordes están en {cancionSeleccionadaDetalle.tonoDetectado}.
                      </Text>
                    )}
                  </View>

                  {/* Selector de Modo y Transposición */}
                  <View style={styles.controlsRow}>
                    <View style={styles.notationToggleGroup}>
                      {["Acordes", "Nashville", "Romanos"].map((modo) => (
                        <TouchableOpacity
                          key={modo}
                          style={[styles.toggleOption, modoNotacion === modo && styles.toggleOptionActive]}
                          onPress={() => setModoNotacion(modo)}
                        >
                          <Text style={{ color: modoNotacion === modo ? "#FFF" : t.textSub, fontSize: 11, fontWeight: "bold" }}>{modo}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={styles.transposerGroup}>
                      <TouchableOpacity style={styles.stepBtn} onPress={() => setSemitonosTransposicion(prev => prev - 1)}>
                        <Text style={{ color: "#FFF", fontWeight: "bold" }}>-</Text>
                      </TouchableOpacity>
                      <Text style={{ color: t.textMain, fontWeight: "bold", paddingHorizontal: 8, fontSize: 12 }}>
                        {transponerNotaUnica(cancionSeleccionadaDetalle.tono, semitonosTransposicion)}
                      </Text>
                      <TouchableOpacity style={styles.stepBtn} onPress={() => setSemitonosTransposicion(prev => prev + 1)}>
                        <Text style={{ color: "#FFF", fontWeight: "bold" }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Letra y Acordes Renderizados */}
                  <View style={[styles.lyricsBox, { backgroundColor: t.bg, borderColor: t.border }]}>
                    <Text style={{ color: t.textMain, fontSize: 13, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace", lineHeight: 22 }}>
                      {transponerTextoLetraAvanzado(
                        cancionSeleccionadaDetalle.letra,
                        semitonosTransposicion,
                        cancionSeleccionadaDetalle.tono,
                        modoNotacion
                      )}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                  <Text style={[styles.cardTitle, { color: t.textMain }]}>Canciones ({repertorio.length})</Text>
                  {repertorio.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.repertorioItemRowPro, { borderBottomColor: t.border, backgroundColor: t.bg }]}
                      onPress={() => setCancionSeleccionadaDetalle(c)}
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

      {/* Navegación Inferior Actualizada */}
      <View style={[styles.tabBar, { backgroundColor: t.cardBg, borderTopColor: t.border }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setPestana("inicio")}>
          <Text style={[styles.tabText, { color: pestana === "inicio" ? t.primary : t.textSub }]}>🏠 Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setPestana("eventos")}>
          <Text style={[styles.tabText, { color: pestana === "eventos" ? t.primary : t.textSub }]}>📅 Eventos</Text>
        </TouchableOpacity>
        {esAdminOLider && (
          <TouchableOpacity style={styles.tabItem} onPress={() => setPestana("equipo")}>
            <Text style={[styles.tabText, { color: pestana === "equipo" ? t.primary : t.textSub }]}>👥 Equipo</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.tabItem} onPress={() => setPestana("repertorio")}>
          <Text style={[styles.tabText, { color: pestana === "repertorio" ? t.primary : t.textSub, fontWeight: "bold" }]}>
            🎵 Canciones
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", height: "100%", minHeight: "100vh" },
  loginContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loginCard: { width: "100%", maxWidth: 360, padding: 20, borderRadius: 12, borderWidth: 1 },
  loginTitle: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 6 },
  loginSubtitle: { fontSize: 12, textAlign: "center", marginBottom: 16 },
  loginInput: { borderWidth: 1, padding: 10, borderRadius: 6, marginBottom: 10 },
  loginButton: { padding: 12, borderRadius: 6, alignItems: "center" },
  loginButtonText: { color: "#FFF", fontWeight: "bold" },
  header: { padding: 12, borderBottomWidth: 1, width: "100%" },
  headerTitle: { fontSize: 16, fontWeight: "bold" },
  content: { flex: 1, padding: 12, width: "100%" },
  mainWrapper: { width: "100%", maxWidth: 650 },
  card: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  backBtn: { paddingVertical: 6 },
  tagChip: { backgroundColor: "#1E293B", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  tagChipActive: { backgroundColor: "#1E40AF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  revisionBanner: { backgroundColor: "#0F172A", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#1E3A8A", marginVertical: 8 },
  publishBtn: { backgroundColor: "#2563EB", padding: 8, borderRadius: 6, marginTop: 6 },
  toneBadge: { backgroundColor: "#334155", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  toneBadgeActive: { backgroundColor: "#2563EB", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  analysisCard: { borderLeftWidth: 3, borderLeftColor: "#3B82F6", padding: 8, backgroundColor: "#0F172A", marginVertical: 8, borderRadius: 4 },
  controlsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 10 },
  notationToggleGroup: { flexDirection: "row", backgroundColor: "#0F172A", borderRadius: 6, padding: 2 },
  toggleOption: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  toggleOptionActive: { backgroundColor: "#2563EB" },
  transposerGroup: { flexDirection: "row", alignItems: "center", backgroundColor: "#0F172A", borderRadius: 6, padding: 2 },
  stepBtn: { backgroundColor: "#1E293B", width: 28, height: 28, borderRadius: 4, justifyContent: "center", alignItems: "center" },
  lyricsBox: { padding: 12, borderRadius: 8, borderWidth: 1, marginTop: 8 },
  repertorioItemRowPro: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 6 },
  tabBar: { flexDirection: "row", height: 55, borderTopWidth: 1, width: "100%" },
  tabItem: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabText: { fontSize: 11 },
});