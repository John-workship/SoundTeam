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

const NOTAS_ESCALA = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const TONOS_EQUIVALENTES = { "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#" };

export default function App() {
  const [sedeIdSeleccionada, setSedeIdSeleccionada] = useState("general");
  const [integrantes, setIntegrantes] = useState([]);
  const [repertorio, setRepertorio] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [mensajesChat, setMensajesChat] = useState([]);

  // Acceso maestro admin incondicional
  const [usuario, setUsuario] = useState("Alex");
  const [rolUsuario, setRolUsuario] = useState("admin");
  const [sesionIniciada, setSesionIniciada] = useState(true);

  const sincronizarDatosApp = async () => {
    const { data: dataInt } = await supabase.from("integrantes").select("*");
    if (dataInt) {
      setIntegrantes(dataInt.map(m => ({
        id: m.id,
        nombre: m.nombre,
        pin: m.pin || "1234",
        email: m.email ? m.email.trim().toLowerCase() : "",
        sedeId: (m.sede_id || "general").toLowerCase(),
        rolAcceso: (m.rol_acceso || m.rol || "miembro").toLowerCase(),
      })));
    }

    const { data: dataRep } = await supabase.from("repertorio").select("*").eq("sede_id", sedeIdSeleccionada);
    if (dataRep) {
      setRepertorio(dataRep.map(c => ({
        id: c.id,
        titulo: c.titulo,
        artista: c.artista || "Sin artista",
        tono: c.tono || "C",
        bpm: c.bpm || "120",
        letra: c.letra || "",
        sedeId: c.sede_id,
      })));
    }

    const { data: dataServ } = await supabase.from("servicios").select("*").eq("sede_id", sedeIdSeleccionada);
    if (dataServ) {
      setServicios(dataServ.map(s => ({
        id: s.id,
        fecha: s.fecha,
        titulo: s.titulo,
        observaciones: s.observaciones || "Sin observaciones",
        setlist: s.setlist || [],
        voces: s.voces || { principal: "Sin asignar", coros: "Sin asignar" },
        instrumentos: s.instrumentos || { piano: "Sin asignar", guitarra: "Sin asignar", bajo: "Sin asignar", bateria: "Sin asignar" },
        sedeId: s.sede_id,
      })));
    }
  };

  useEffect(() => {
    sincronizarDatosApp();
  }, [sedeIdSeleccionada]);

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

  // Gestión de Miembros
  const [modalMiembroVisible, setModalMiembroVisible] = useState(false);
  const [idMiembroEditando, setIdMiembroEditando] = useState(null);
  const [nombreNuevoMiembro, setNombreNuevoMiembro] = useState("");
  const [pinNuevoMiembro, setPinNuevoMiembro] = useState("1234");
  const [emailNuevoMiembro, setEmailNuevoMiembro] = useState("");
  const [rolAccesoNuevo, setRolAccesoNuevo] = useState("miembro");

  const guardarONuevoMiembro = async () => {
    if (!nombreNuevoMiembro.trim()) { alert("⚠️ Ingresa el nombre."); return; }
    const payload = {
      nombre: nombreNuevoMiembro.trim(),
      pin: pinNuevoMiembro.trim() || "1234",
      email: emailNuevoMiembro.trim().toLowerCase() || null,
      sede_id: sedeIdSeleccionada,
      rol_acceso: rolAccesoNuevo,
      rol: rolAccesoNuevo,
    };

    if (idMiembroEditando !== null) {
      await supabase.from("integrantes").update(payload).eq("id", idMiembroEditando);
    } else {
      await supabase.from("integrantes").insert([payload]);
    }

    setModalMiembroVisible(false);
    setNombreNuevoMiembro(""); setEmailNuevoMiembro(""); setIdMiembroEditando(null);
    await sincronizarDatosApp();
  };

  // Gestión de Repertorio y Transpositor
  const [modalCancionVisible, setModalCancionVisible] = useState(false);
  const [idCancionEditando, setIdCancionEditando] = useState(null);
  const [tituloCancion, setTituloCancion] = useState("");
  const [artistaCancion, setArtistaCancion] = useState("");
  const [tonoCancion, setTonoCancion] = useState("C");
  const [bpmCancion, setBpmCancion] = useState("120");
  const [letraCancion, setLetraCancion] = useState("");
  const [busquedaRepertorio, setBusquedaRepertorio] = useState("");
  const [cancionSeleccionadaDetalle, setCancionSeleccionadaDetalle] = useState(null);
  const [tonoTransposicion, setTonoTransposicion] = useState(null);

  const guardarONuevaCancion = async () => {
    if (!tituloCancion.trim()) { alert("⚠️ Ingresa el título de la canción."); return; }
    const payload = {
      titulo: tituloCancion.trim(),
      artista: artistaCancion.trim() || "Sin artista",
      tono: tonoCancion.trim() || "C",
      bpm: bpmCancion.trim() || "120",
      letra: letraCancion.trim(),
      sede_id: sedeIdSeleccionada,
    };

    if (idCancionEditando !== null) {
      await supabase.from("repertorio").update(payload).eq("id", idCancionEditando);
    } else {
      await supabase.from("repertorio").insert([payload]);
    }

    setModalCancionVisible(false);
    setIdCancionEditando(null);
    setTituloCancion(""); setArtistaCancion(""); setLetraCancion("");
    await sincronizarDatosApp();
  };

  const transponerAcorde = (acorde, semitonos) => {
    let limpio = acorde.trim();
    let raiz = limpio.match(/^[A-G](?:#|b)?/);
    if (!raiz) return acorde;
    let notaOriginal = raiz[0];
    if (TONOS_EQUIVALENTES[notaOriginal]) notaOriginal = TONOS_EQUIVALENTES[notaOriginal];
    let index = NOTAS_ESCALA.indexOf(notaOriginal);
    if (index === -1) return acorde;
    let nuevoIndex = (index + semitonos + 12) % 12;
    let nuevaNota = NOTAS_ESCALA[nuevoIndex];
    return limpio.replace(notaOriginal, nuevaNota);
  };

  const procesarLetraConTransposicion = (letraOriginal, tonoBase, tonoDeseado) => {
    if (!letraOriginal) return "";
    let base = TONOS_EQUIVALENTES[tonoBase] || tonoBase;
    let deseado = TONOS_EQUIVALENTES[tonoDeseado] || tonoDeseado;
    let idxBase = NOTAS_ESCALA.indexOf(base);
    let idxDeseado = NOTAS_ESCALA.indexOf(deseado);
    if (idxBase === -1 || idxDeseado === -1) return letraOriginal;
    let semitonos = idxDeseado - idxBase;

    return letraOriginal.replace(/\[([A-G](?:#|b)?[\w/]*)\]/g, (match, acorde) => {
      return `[${transponerAcorde(acorde, semitonos)}]`;
    });
  };

  const esAdminOLider = true;

  return (
    <View style={[styles.container, { backgroundColor: t.bg }, tapizActual.css]}>
      <View style={[styles.header, { backgroundColor: t.cardBg, borderBottomColor: t.border }]}>
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: t.textMain }]}>SoundTeam • {sedeActual.nombre}</Text>
            <Text style={[styles.headerSubtitle, { color: t.textSub }]}>👤 {usuario} • <Text style={{ color: t.primary, fontWeight: "bold" }}>ROL: {rolUsuario.toUpperCase()}</Text></Text>
          </View>
          <TouchableOpacity style={{ backgroundColor: t.primary, paddingVertical: 5, paddingHorizontal: 8, borderRadius: 6 }} onPress={sincronizarDatosApp}>
            <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 11 }}>🔄 Refrescar</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 8 }}>
          {Platform.OS === "web" && (
            <select value={sedeIdSeleccionada} onChange={(e) => setSedeIdSeleccionada(e.target.value)} style={{ backgroundColor: t.bg, color: t.textMain, borderColor: t.border, borderWidth: "1px", borderRadius: "6px", padding: "6px", marginBottom: "8px", width: "100%", outline: "none", cursor: "pointer" }}>
              {SEDES_DISPONIBLES.map((s) => (<option key={s.id} value={s.id}>🏛️ Sede: {s.nombre}</option>))}
            </select>
          )}

          <TouchableOpacity style={{ backgroundColor: t.bg, borderWidth: 1, borderColor: t.border, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }} onPress={() => setMostrarMenuPersonalizacion(!mostrarMenuPersonalizacion)}>
            <Text style={{ fontSize: 11, color: t.textMain, fontWeight: "bold" }}>🎨 Tema: {t.nombre} | Tapiz: {tapizActual.nombre}</Text>
            <Text style={{ fontSize: 11, color: t.primary, fontWeight: "bold" }}>{mostrarMenuPersonalizacion ? "▲ Ocultar" : "▼ Personalizar"}</Text>
          </TouchableOpacity>

          {mostrarMenuPersonalizacion && (
            <View style={{ marginTop: 6, backgroundColor: t.cardBg, borderRadius: 6, borderWidth: 1, borderColor: t.border, padding: 8, gap: 8 }}>
              <Text style={{ fontSize: 11, color: t.textSub, fontWeight: "bold" }}>Temas:</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                {Object.keys(TEMAS).map((keyTema) => (
                  <TouchableOpacity key={keyTema} style={{ paddingVertical: 4, paddingHorizontal: 6, borderRadius: 4, backgroundColor: nombreTema === keyTema ? t.primary : t.bg, borderWidth: 1, borderColor: t.border }} onPress={() => setNombreTema(keyTema)}>
                    <Text style={{ fontSize: 10, color: nombreTema === keyTema ? "#FFFFFF" : t.textMain }}>{TEMAS[keyTema].nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={{ fontSize: 11, color: t.textSub, fontWeight: "bold", marginTop: 4 }}>Tapiz:</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                {Object.keys(PAPELES_TAPIZ).map((keyTapiz) => (
                  <TouchableOpacity key={keyTapiz} style={{ paddingVertical: 4, paddingHorizontal: 6, borderRadius: 4, backgroundColor: nombreTapiz === keyTapiz ? t.primary : t.bg, borderWidth: 1, borderColor: t.border }} onPress={() => setNombreTapiz(keyTapiz)}>
                    <Text style={{ fontSize: 10, color: nombreTapiz === keyTapiz ? "#FFFFFF" : t.textMain }}>{PAPELES_TAPIZ[keyTapiz].nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40, alignItems: "center" }}>
        <View style={styles.mainWrapper}>
          {pestana === "inicio" && (
            <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
              <Text style={[styles.cardTitle, { color: t.textMain }]}>✨ Panel Principal de Administrador</Text>
              <Text style={{ color: t.textSub, fontSize: 13 }}>Bienvenido Alex. Tienes control total de sedes, miembros, eventos y repertorio con transposición de notas en vivo.</Text>
            </View>
          )}

          {pestana === "equipo" && (
            <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={[styles.cardTitle, { color: t.textMain, marginBottom: 0 }]}>👥 Miembros ({integrantesSeccionEquipo.length})</Text>
                <TouchableOpacity style={[styles.programBtn, { backgroundColor: t.primary }]} onPress={() => { setIdMiembroEditando(null); setNombreNuevoMiembro(""); setEmailNuevoMiembro(""); setPinNuevoMiembro("1234"); setModalMiembroVisible(true); }}>
                  <Text style={styles.programBtnText}>+ Agregar Miembro</Text>
                </TouchableOpacity>
              </View>

              {modalMiembroVisible && (
                <View style={[styles.card, { backgroundColor: t.bg, borderColor: t.primary, borderWidth: 2, marginBottom: 14 }]}>
                  <Text style={[styles.cardTitle, { color: t.textMain, fontSize: 15 }]}>{idMiembroEditando !== null ? "✏️ Modificar Miembro" : "➕ Nuevo Miembro"}</Text>
                  <TextInput style={[styles.loginInput, { backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain }]} placeholder="Nombre" placeholderTextColor={t.textSub} value={nombreNuevoMiembro} onChangeText={setNombreNuevoMiembro} />
                  <TextInput style={[styles.loginInput, { backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain }]} placeholder="Correo" placeholderTextColor={t.textSub} value={emailNuevoMiembro} onChangeText={setEmailNuevoMiembro} />
                  <TextInput style={[styles.loginInput, { backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain }]} placeholder="PIN" placeholderTextColor={t.textSub} value={pinNuevoMiembro} onChangeText={setPinNuevoMiembro} />
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <TouchableOpacity style={[styles.loginButton, { flex: 1, backgroundColor: t.primary, padding: 10 }]} onPress={guardarONuevoMiembro}><Text style={styles.loginButtonText}>Guardar</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.loginButton, { flex: 1, backgroundColor: "#EF4444", padding: 10 }]} onPress={() => setModalMiembroVisible(false)}><Text style={styles.loginButtonText}>Cancelar</Text></TouchableOpacity>
                  </View>
                </View>
              )}

              {integrantesSeccionEquipo.map((int) => (
                <View key={int.id} style={[styles.memberCard, { backgroundColor: t.bg, borderColor: t.border }]}>
                  <View style={styles.memberHeaderRow}>
                    <Text style={[styles.memberTitle, { color: t.textMain }]}>👤 {int.nombre}</Text>
                    <View style={{ flexDirection: "row", gap: 6 }}>
                      <TouchableOpacity style={{ backgroundColor: "#3B82F6", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 }} onPress={() => { setIdMiembroEditando(int.id); setNombreNuevoMiembro(int.nombre); setEmailNuevoMiembro(int.email); setPinNuevoMiembro(int.pin); setModalMiembroVisible(true); }}>
                        <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "bold" }}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={{ backgroundColor: "#EF4444", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 }} onPress={async () => { await supabase.from("integrantes").delete().eq("id", int.id); sincronizarDatosApp(); }}>
                        <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "bold" }}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={{ color: t.textSub, fontSize: 11 }}>Correo: {int.email || "N/A"} | Acceso: {int.rolAcceso}</Text>
                </View>
              ))}
            </View>
          )}

          {pestana === "repertorio" && (
            <>
              {cancionSeleccionadaDetalle !== null ? (
                <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <TouchableOpacity style={{ backgroundColor: t.bg, padding: 6, borderRadius: 6, borderWidth: 1, borderColor: t.border }} onPress={() => setCancionSeleccionadaDetalle(null)}>
                      <Text style={{ color: t.textMain, fontSize: 11, fontWeight: "bold" }}>← Volver</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: "row", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                      <Text style={{ color: t.textSub, fontSize: 11 }}>Tono:</Text>
                      {NOTAS_ESCALA.slice(0, 7).map((nota) => {
                        const tonoActual = tonoTransposicion || cancionSeleccionadaDetalle.tono;
                        const activo = tonoActual === nota;
                        return (
                          <TouchableOpacity key={nota} style={{ paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, backgroundColor: activo ? t.primary : t.bg, borderWidth: 1, borderColor: t.border }} onPress={() => setTonoTransposicion(nota)}>
                            <Text style={{ color: activo ? "#FFF" : t.textMain, fontSize: 10, fontWeight: "bold" }}>{nota}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <Text style={{ fontSize: 20, fontWeight: "bold", color: t.textMain, marginBottom: 2 }}>{cancionSeleccionadaDetalle.titulo}</Text>
                  <Text style={{ color: t.textSub, fontSize: 12, marginBottom: 10 }}>{cancionSeleccionadaDetalle.artista} • Tono original: {cancionSeleccionadaDetalle.tono}</Text>

                  <View style={{ backgroundColor: t.bg, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: t.border }}>
                    <Text style={{ color: t.textMain, fontSize: 13, lineHeight: 20 }}>
                      {procesarLetraConTransposicion(cancionSeleccionadaDetalle.letra, cancionSeleccionadaDetalle.tono, tonoTransposicion || cancionSeleccionadaDetalle.tono)}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <Text style={[styles.cardTitle, { color: t.textMain, marginBottom: 0 }]}>Repertorio ({repertorio.length})</Text>
                    <TouchableOpacity style={[styles.programBtn, { backgroundColor: t.primary }]} onPress={() => { setIdCancionEditando(null); setTituloCancion(""); setArtistaCancion(""); setTonoCancion("C"); setBpmCancion("120"); setLetraCancion(""); setModalCancionVisible(true); }}>
                      <Text style={styles.programBtnText}>+ Nueva Canción</Text>
                    </TouchableOpacity>
                  </View>

                  <TextInput style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain, marginBottom: 10, padding: 8, fontSize: 13 }]} placeholder="🔍 Buscar canción..." placeholderTextColor={t.textSub} value={busquedaRepertorio} onChangeText={setBusquedaRepertorio} />

                  {modalCancionVisible && (
                    <View style={[styles.card, { backgroundColor: t.bg, borderColor: t.primary, borderWidth: 2, marginBottom: 12 }]}>
                      <Text style={[styles.cardTitle, { color: t.textMain, fontSize: 15 }]}>{idCancionEditando !== null ? "✏️ Modificar Canción" : "➕ Nueva Canción"}</Text>
                      <TextInput style={[styles.loginInput, { backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain }]} placeholder="Título" placeholderTextColor={t.textSub} value={tituloCancion} onChangeText={setTituloCancion} />
                      <TextInput style={[styles.loginInput, { backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain }]} placeholder="Artista" placeholderTextColor={t.textSub} value={artistaCancion} onChangeText={setArtistaCancion} />
                      <TextInput style={[styles.loginInput, { backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain }]} placeholder="Tono (Ej. C, G)" placeholderTextColor={t.textSub} value={tonoCancion} onChangeText={setTonoCancion} />
                      <TextInput style={[styles.loginInput, { backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain }]} placeholder="BPM" placeholderTextColor={t.textSub} value={bpmCancion} onChangeText={setBpmCancion} />
                      <TextInput style={[styles.loginInput, { backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain, height: 70 }]} placeholder="Letra con acordes [C], [G]..." placeholderTextColor={t.textSub} multiline value={letraCancion} onChangeText={setLetraCancion} />
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        <TouchableOpacity style={[styles.loginButton, { flex: 1, backgroundColor: t.primary, padding: 10 }]} onPress={guardarONuevaCancion}><Text style={styles.loginButtonText}>Guardar</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.loginButton, { flex: 1, backgroundColor: "#EF4444", padding: 10 }]} onPress={() => setModalCancionVisible(false)}><Text style={styles.loginButtonText}>Cancelar</Text></TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {repertorio.filter(c => c.titulo.toLowerCase().includes(busquedaRepertorio.toLowerCase())).map((c) => (
                    <View key={c.id} style={[styles.repertorioItemRowPro, { borderBottomColor: t.border, backgroundColor: t.bg }]}>
                      <TouchableOpacity style={{ flex: 1, paddingVertical: 4 }} onPress={() => { setCancionSeleccionadaDetalle(c); setTonoTransposicion(null); }}>
                        <Text style={{ color: t.textMain, fontSize: 14, fontWeight: "bold" }}>{c.titulo}</Text>
                        <Text style={{ color: t.textSub, fontSize: 11 }}>{c.artista}</Text>
                      </TouchableOpacity>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <TouchableOpacity style={{ backgroundColor: t.primary, width: 30, height: 30, borderRadius: 6, justifyContent: "center", alignItems: "center" }} onPress={() => { setCancionSeleccionadaDetalle(c); setTonoTransposicion(null); }}>
                          <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 12 }}>{c.tono}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ backgroundColor: "#3B82F6", padding: 6, borderRadius: 6 }} onPress={() => { setIdCancionEditando(c.id); setTituloCancion(c.titulo); setArtistaCancion(c.artista); setTonoCancion(c.tono); setBpmCancion(c.bpm); setLetraCancion(c.letra); setModalCancionVisible(true); }}>
                          <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "bold" }}>✏️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <View style={[styles.tabBar, { backgroundColor: t.cardBg, borderTopColor: t.border }]}>
        {[{ key: "inicio", label: "🏠 Inicio" }, { key: "equipo", label: "👥 Equipo" }, { key: "repertorio", label: "🎵 Repertorio" }].map((tab) => (
          <TouchableOpacity key={tab.key} style={[styles.tabItem, pestana === tab.key && { borderTopWidth: 3, borderTopColor: t.primary }]} onPress={() => setPestana(tab.key)}>
            <Text style={[styles.tabText, { color: t.textSub }, pestana === tab.key && { color: t.textMain, fontWeight: "bold" }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", height: "100%", minHeight: "100vh" },
  header: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, width: "100%" },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  headerSubtitle: { fontSize: 11, marginTop: 2 },
  content: { flex: 1, padding: 12, width: "100%" },
  mainWrapper: { width: "100%", maxWidth: 650 },
  card: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 14, width: "100%" },
  cardTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 10 },
  programBtn: { paddingVertical: 5, paddingHorizontal: 8, borderRadius: 6 },
  programBtnText: { color: "#FFFFFF", fontSize: 11, fontWeight: "bold" },
  tabBar: { flexDirection: "row", height: 55, borderTopWidth: 1, width: "100%" },
  tabItem: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabText: { fontSize: 10, textAlign: "center" },
  memberCard: { padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
  memberHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  memberTitle: { fontSize: 14, fontWeight: "bold" },
  repertorioItemRowPro: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, marginBottom: 6 },
  loginInput: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 14, fontSize: 15 },
  loginButton: { padding: 12, borderRadius: 8, alignItems: "center" },
  loginButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },
});