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
};

const SEDES_DISPONIBLES = [
  { id: "general", nombre: "Iglesia General", codigo: "GEN2026" },
  { id: "norte", nombre: "Sede Norte", codigo: "NORTE2026" },
  { id: "sur", nombre: "Sede Sur", codigo: "SUR2026" },
];

export default function App() {
  // --- GESTIÓN DE SEDES Y ACCESOS ---
  const [sedeSeleccionada, setSedeSeleccionada] = useState(SEDES_DISPONIBLES[0]);
  const [esRegistroNuevo, setEsRegistroNuevo] = useState(false);

  const [integrantes, setIntegrantes] = useState(() => {
    if (Platform.OS === "web") {
      try {
        const guardados = localStorage.getItem("soundteam_integrantes_sedes");
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
                nombre: "Admin Norte",
                pin: "1234",
                sedeId: "norte",
                rolAcceso: "admin",
                rolesMusicales: ["👑 Director Norte"],
              },
              {
                id: 3,
                nombre: "Alex",
                pin: "1234",
                sedeId: "general",
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
          "soundteam_integrantes_sedes",
          JSON.stringify(integrantes)
        );
      } catch (e) {}
    }
  }, [integrantes]);

  const [usuario, setUsuario] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [rolUsuario, setRolUsuario] = useState("miembro");
  const [pestana, setPestana] = useState("inicio");
  const [nombreTema, setNombreTema] = useState("azul");
  const t = TEMAS[nombreTema];

  // --- SERVICIOS Y REPERTORIO ---
  const [servicios, setServicios] = useState([]);
  const [repertorio, setRepertorio] = useState([
    {
      id: 1,
      titulo: "Creo en ti",
      artista: "Espíritu y Verdad",
      tono: "C",
      letra: "[C] Creo en ti, [G] Señor",
    },
  ]);

  const handleLogin = () => {
    if (usuario.trim() === "" || pinInput.trim() === "") {
      alert("⚠️ Ingresa tu usuario y PIN.");
      return;
    }

    const miembroEncontrado = integrantes.find(
      (m) =>
        m.nombre.trim().toLowerCase() === usuario.trim().toLowerCase() &&
        m.sedeId === sedeSeleccionada.id
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
      (m) =>
        m.nombre.trim().toLowerCase() === usuario.trim().toLowerCase() &&
        m.sedeId === sedeSeleccionada.id
    );

    if (existe) {
      alert("⚠️ Este usuario ya existe en esta sede. Inicia sesión.");
      return;
    }

    const nuevoMiembro = {
      id: Date.now(),
      nombre: usuario.trim(),
      pin: pinInput.trim(),
      sedeId: sedeSeleccionada.id,
      rolAcceso: "miembro",
      rolesMusicales: ["🎤 Miembro"],
    };

    setIntegrantes([...integrantes, nuevoMiembro]);
    setRolUsuario("miembro");
    setSesionIniciada(true);
    alert(`🎉 ¡Registro exitoso en ${sedeSeleccionada.nombre}!`);
  };

  const handleLogout = () => {
    setSesionIniciada(false);
    setUsuario("");
    setPinInput("");
    setRolUsuario("miembro");
    setPestana("inicio");
  };

  const esAdminOLider = rolUsuario === "admin" || rolUsuario === "lider";

  // --- PANTALLA DE ACCESO / SEDES / REGISTRO ---
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
            Selecciona tu sede y accede a tu espacio
          </Text>

          <Text style={[styles.inputLabel, { color: t.textMain }]}>
            🏛️ Seleccionar Sede:
          </Text>
          <View style={{ flexDirection: "row", gap: 6, marginBottom: 14 }}>
            {SEDES_DISPONIBLES.map((s) => {
              const activa = sedeSeleccionada.id === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.sedeOptionBtn,
                    { backgroundColor: t.bg, borderColor: t.border },
                    activa && {
                      backgroundColor: t.primary,
                      borderColor: t.primary,
                    },
                  ]}
                  onPress={() => setSedeSeleccionada(s)}
                >
                  <Text
                    style={{
                      color: activa ? "#FFF" : t.textMain,
                      fontSize: 11,
                      fontWeight: "bold",
                    }}
                  >
                    {s.nombre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={[
              styles.loginInput,
              {
                backgroundColor: t.bg,
                borderColor: t.border,
                color: t.textMain,
              },
            ]}
            placeholder="Usuario o Apodo"
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

          {esRegistroNuevo ? (
            <View>
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  { backgroundColor: "#22C55E", marginBottom: 8 },
                ]}
                onPress={handleRegistroNuevo}
              >
                <Text style={styles.loginButtonText}>Registrarme Ahora</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEsRegistroNuevo(false)}>
                <Text
                  style={{
                    color: t.primary,
                    textAlign: "center",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  ¿Ya tienes cuenta? Inicia sesión aquí
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  { backgroundColor: t.primary, marginBottom: 8 },
                ]}
                onPress={handleLogin}
              >
                <Text style={styles.loginButtonText}>Entrar a la App</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEsRegistroNuevo(true)}>
                <Text
                  style={{
                    color: t.primary,
                    textAlign: "center",
                    fontSize: 12,
                    marginTop: 4,
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

  // --- APLICACIÓN PRINCIPAL ---
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
              SoundTeam - {sedeSeleccionada.nombre}
            </Text>
            <Text style={[styles.headerSubtitle, { color: t.textSub }]}>
              👤 {usuario} • ROL: {rolUsuario.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {pestana === "inicio" && (
          <View
            style={[
              styles.card,
              { backgroundColor: t.cardBg, borderColor: t.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: t.textMain }]}>
              Bienvenido a la Sede: {sedeSeleccionada.nombre}
            </Text>
            <Text style={{ color: t.textSub, fontSize: 13 }}>
              Aquí gestionarás los servicios y repertorios específicos de tu
              comunidad.
            </Text>
          </View>
        )}
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
  loginCard: {
    width: "100%",
    maxWidth: 400,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },
  inputLabel: { fontSize: 12, fontWeight: "bold", marginBottom: 6 },
  sedeOptionBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
    borderWidth: 1,
  },
  loginInput: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 15,
  },
  loginButton: { padding: 14, borderRadius: 8, alignItems: "center" },
  loginButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 15 },
  header: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "bold" },
  headerSubtitle: { fontSize: 11, marginTop: 2 },
  logoutBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  logoutBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 11 },
  content: { flex: 1, padding: 12 },
  card: { padding: 14, borderRadius: 12, borderwidth: 1, marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 10 },
  tabBar: { flexDirection: "row", height: 55, borderTopWidth: 1 },
  tabItem: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabText: { fontSize: 10 },
});
