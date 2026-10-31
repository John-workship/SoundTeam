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
    nombre: "Azul",
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
    nombre: "Claro",
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
    nombre: "Oscuro",
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
    nombre: "Rosado",
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
    nombre: "Morado",
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
    nombre: "Esmeralda",
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
    nombre: "Sunset",
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
    nombre: "Minimal",
  },
};

// --- MOTOR DE TRANSPOSICIÓN MUSICAL INTELIGENTE ---
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

export default function App() {
  // --- ESTADOS PRINCIPALES ---
  const [integrantes, setIntegrantes] = useState([
    { id: 1, nombre: "Admin", pin: "1234", rolAcceso: "admin", rolesMusicales: ["Director"] },
    { id: 2, nombre: "Lider", pin: "1234", rolAcceso: "lider", rolesMusicales: ["Líder de Grupo"] },
  ]);

  const [usuario, setUsuario] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [rolUsuario, setRolUsuario] = useState("miembro");
  const [pestana, setPestana] = useState("inicio");
  const [nombreTema, setNombreTema] = useState("azul");
  const [mostrarMenuTemas, setMostrarMenuTemas] = useState(false);

  const t = TEMAS[nombreTema] || TEMAS.azul;

  // --- CALENDARIO Y SERVICIOS ---
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

  const [paletasCulto, setPaletasCulto] = useState([
    { id: 1, nombre: "Atardecer Violeta", colores: ["#064680", "#31245A", "#AC6DBF", "#2A7CA3", "#588BC2"] },
    { id: 2, nombre: "Tonos Arena", colores: ["#C29B78", "#A17651", "#5C4033", "#222222"] },
  ]);

  const [servicios, setServicios] = useState([]);

  // --- MODAL DE PROGRAMAR / EDITAR SERVICIO ---
  const [modalProgramarVisible, setModalProgramarVisible] = useState(false);
  const [idServicioEditando, setIdServicioEditando] = useState(null);
  const [nombreEvento, setNombreEvento] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [paletaSeleccionadaModal, setPaletaSeleccionadaModal] = useState(null);
  const [setlistActivo, setSetlistActivo] = useState([]);

  // --- REPERTORIO ---
  const [repertorio, setRepertorio] = useState([
    { id: 1, titulo: "A dónde iré", artista: "Verbo y Vida", tono: "F", etiquetas: ["Adoración"], letra: "[INTRO]\n[F] Siento que sin ti..." },
    { id: 2, titulo: "Creo en ti", artista: "Espíritu y Verdad", tono: "C", etiquetas: ["Alabanza"], letra: "[VERSO]\n[C] Creo en ti, [G] Señor..." },
    { id: 3, titulo: "Digno", artista: "Elevation Worship", tono: "E", etiquetas: ["Adoración"], letra: "[VERSO]\n[E] Digno eres Señor..." },
  ]);
  const [cancionSeleccionadaDetalle, setCancionSeleccionadaDetalle] = useState(null);
  const [semitonosTransposicion, setSemitonosTransposicion] = useState(0);

  // --- CHATS ---
  const [canalChatActivo, setCanalChatActivo] = useState("finsemana");
  const [mensajesChat, setMensajesChat] = useState([]);
  const [nuevoMensajeTexto, setNuevoMensajeTexto] = useState("");

  // --- FUNCIONES DE REORDENAR SETLIST (SUBIR / BAJAR) ---
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

  // --- CARGA DE SUPABASE ---
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

  const handleLogin = () => {
    if (!usuario.trim()) {
      alert("Ingresa un nombre de usuario.");
      return;
    }
    setSesionIniciada(true);
    setRolUsuario("admin");
  };

  const handleLogout = () => {
    setSesionIniciada(false);
    setUsuario("");
    setPinInput("");
    setRolUsuario("miembro");
    setPestana("inicio");
  };

  // --- RENDERIZADO CONDICIONAL DE PANTALLAS ---
  if (!sesionIniciada) {
    return (
      <View style={[styles.container, { backgroundColor: t.bg, justifyContent: "center", padding: 20 }]}>
        <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
          <Text style={[styles.title, { color: t.textMain, textAlign: "center" }]}>SoundTeam</Text>
          <TextInput
            style={[styles.inputField, { backgroundColor: t.bg, color: t.textMain, borderColor: t.border }]}
            placeholder="Usuario o Nombre"
            placeholderTextColor={t.textSub}
            value={usuario}
            onChangeText={setUsuario}
          />
          <TextInput
            style={[styles.inputField, { backgroundColor: t.bg, color: t.textMain, borderColor: t.border }]}
            placeholder="PIN de Acceso"
            placeholderTextColor={t.textSub}
            secureTextEntry
            value={pinInput}
            onChangeText={setPinInput}
          />
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: t.primary }]} onPress={handleLogin}>
            <Text style={[styles.actionBtnText, { color: t.bg }]}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      {/* CABECERA */}
      <View style={[styles.topHeader, { backgroundColor: t.cardBg, borderBottomColor: t.border }]}>
        <View style={styles.logoRow}>
          <View style={[styles.statusDot, { backgroundColor: t.primary }]} />
          <Text style={[styles.logoText, { color: t.textMain }]}>SoundTeam • Sede General</Text>
        </View>
        <TouchableOpacity style={[styles.adminAccessBtn, { backgroundColor: t.bg, borderColor: t.border }]} onPress={handleLogout}>
          <Text style={[styles.adminAccessText, { color: t.primary }]}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENIDO PRINCIPAL */}
      <ScrollView style={styles.content}>
        <Text style={[styles.title, { color: t.textMain }]}>Panel de Control ({pestana.toUpperCase()})</Text>

        {/* EJEMPLO DE MODAL / VISTA DE PROGRAMAR O EDITAR */}
        <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.border }]}>
          <Text style={[styles.cardHeader, { color: t.primary }]}>Organización del Setlist</Text>
          <Text style={[styles.textSub, { color: t.textSub }]}>Setlist Activo ({setlistActivo.length}):</Text>

          {setlistActivo.length === 0 ? (
            <Text style={[styles.textSub, { color: t.textSub, marginVertical: 10 }]}>No hay canciones en el setlist. Agrega desde abajo.</Text>
          ) : (
            setlistActivo.map((cancion, index) => (
              <View key={cancion.id || index} style={[styles.sedeCard, { backgroundColor: t.bg, borderColor: t.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.textMainBold, { color: t.textMain }]}>{index + 1}. {cancion.titulo}</Text>
                  <Text style={[styles.textSub, { color: t.textSub }]}>Tono: {cancion.tono}</Text>
                </View>

                {/* BOTONES DE SUBIR, BAJAR Y ELIMINAR */}
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <TouchableOpacity style={[styles.smallButton, { backgroundColor: t.cardBg, borderColor: t.border }]} onPress={() => moverCancionArriba(index)}>
                    <Text style={[styles.smallButtonText, { color: t.primary }]}>▲</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.smallButton, { backgroundColor: t.cardBg, borderColor: t.border }]} onPress={() => moverCancionAbajo(index)}>
                    <Text style={[styles.smallButtonText, { color: t.primary }]}>▼</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.deleteButtonSmall} onPress={() => {
                    const filtrado = setlistActivo.filter((_, i) => i !== index);
                    setSetlistActivo(filtrado);
                  }}>
                    <Text style={styles.deleteButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <Text style={[styles.subtitle, { color: t.textMain, marginTop: 15 }]}>Biblioteca de canciones (Toca para agregar):</Text>
          {repertorio.map((song) => (
            <TouchableOpacity key={song.id} style={[styles.sedeCard, { backgroundColor: t.bg, borderColor: t.border, marginTop: 6 }]} onPress={() => {
              setSetlistActivo([...setlistActivo, song]);
            }}>
              <Text style={[styles.textMain, { color: t.textMain }]}>{song.titulo} ({song.tono})</Text>
              <Text style={{ color: t.primary, fontWeight: 'bold' }}>+ Agregar</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* BARRA DE NAVEGACIÓN INFERIOR */}
      <View style={[styles.bottomNav, { backgroundColor: t.cardBg, borderTopColor: t.border }]}>
        {['inicio', 'evento', 'equipo', 'repertorio'].map((tab) => (
          <TouchableOpacity key={tab} style={[styles.navTab, pestana === tab && { borderTopWidth: 2, borderTopColor: t.primary, backgroundColor: t.bg }]} onPress={() => setPestana(tab)}>
            <Text style={[styles.navLabel, pestana === tab && { color: t.primary, fontWeight: 'bold' }]}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  logoText: { fontSize: 16, fontWeight: 'bold' },
  adminAccessBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1 },
  adminAccessText: { fontWeight: '600', fontSize: 13 },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 16, fontWeight: '600', marginVertical: 8 },
  card: { borderRadius: 10, padding: 16, marginBottom: 16, borderWidth: 1 },
  cardHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  sedeCard: { borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textMain: { fontSize: 14, marginBottom: 4 },
  textMainBold: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  textSub: { fontSize: 12 },
  inputField: { borderRadius: 8, paddingHorizontal: 12, height: 42, marginBottom: 10, borderWidth: 1 },
  actionBtn: { padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  actionBtnText: { fontWeight: 'bold', fontSize: 14 },
  bottomNav: { flexDirection: 'row', height: 60, borderTopWidth: 1 },
  navTab: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navLabel: { fontSize: 12, fontWeight: '500' },
  smallButton: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 4, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  smallButtonText: { fontSize: 12, fontWeight: 'bold' },
  deleteButtonSmall: { backgroundColor: '#FF3860', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  deleteButtonText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' }
});