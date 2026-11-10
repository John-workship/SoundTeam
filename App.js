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
};

const SEDES_DISPONIBLES = [
  { id: "general", nombre: "Sede General" },
  { id: "norte", nombre: "Sede Norte" },
  { id: "sur", nombre: "Sede Sur" },
  { id: "occidente", nombre: "Sede Occidente" },
];

export default function App() {
  const [sedeIdSeleccionada, setSedeIdSeleccionada] = useState("general");
  const [integrantes, setIntegrantes] = useState([]);
  const [usuario, setUsuario] = useState("Alex");
  const [rolUsuario, setRolUsuario] = useState("admin");
  const [sesionIniciada, setSesionIniciada] = useState(true);

  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [cargandoAuth, setCargandoAuth] = useState(false);

  const sincronizarDatosApp = async () => {
    const { data, error } = await supabase.from("integrantes").select("*");
    if (data && !error) {
      setIntegrantes(data.map(m => ({
        id: m.id,
        nombre: m.nombre,
        pin: m.pin || "1234",
        email: m.email ? m.email.trim().toLowerCase() : "",
        sedeId: (m.sede_id || "general").toLowerCase(),
        rolAcceso: (m.rol_acceso || m.rol || "miembro").toLowerCase(),
        rolesMusicales: m.roles_musicales || [],
      })));
    }
  };

  useEffect(() => {
    sincronizarDatosApp();
  }, [sedeIdSeleccionada]);

  const [pestana, setPestana] = useState("inicio");
  const [nombreTema, setNombreTema] = useState("azul");
  const t = TEMAS[nombreTema];
  const sedeActual = SEDES_DISPONIBLES.find((s) => s.id === sedeIdSeleccionada) || SEDES_DISPONIBLES[0];

  const integrantesSeccionEquipo = integrantes.filter((m) => {
    if (sedeIdSeleccionada === "general") return m.sedeId === "general";
    return m.sedeId === sedeIdSeleccionada;
  });

  const [modalMiembroVisible, setModalMiembroVisible] = useState(false);
  const [idMiembroEditando, setIdMiembroEditando] = useState(null);
  const [nombreNuevoMiembro, setNombreNuevoMiembro] = useState("");
  const [pinNuevoMiembro, setPinNuevoMiembro] = useState("1234");
  const [emailNuevoMiembro, setEmailNuevoMiembro] = useState("");
  const [rolAccesoNuevo, setRolAccesoNuevo] = useState("miembro");

  // FUNCIÓN DE CREACIÓN DIRECTA Y CORREGIDA
  const guardarONuevoMiembro = async () => {
    if (!nombreNuevoMiembro.trim()) {
      alert("⚠️ Ingresa el nombre del integrante.");
      return;
    }

    const nuevoIntegrante = {
      nombre: nombreNuevoMiembro.trim(),
      pin: pinNuevoMiembro.trim() || "1234",
      email: emailNuevoMiembro.trim().toLowerCase() || null,
      sede_id: sedeIdSeleccionada,
      rol_acceso: rolAccesoNuevo,
      rol: rolAccesoNuevo,
    };

    if (idMiembroEditando !== null) {
      const { error } = await supabase.from("integrantes").update(nuevoIntegrante).eq("id", idMiembroEditando);
      if (error) {
        alert(" Error al actualizar en Supabase: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("integrantes").insert([nuevoIntegrante]);
      if (error) {
        alert(" Error al crear usuario en Supabase: " + error.message);
        return;
      }
    }

    alert(" Integral/Usuario guardado correctamente.");
    setModalMiembroVisible(false);
    setNombreNuevoMiembro("");
    setEmailNuevoMiembro("");
    setPinNuevoMiembro("1234");
    setIdMiembroEditando(null);
    await sincronizarDatosApp();
  };

  const handleLogin = async () => {
    const inputClean = emailInput.trim().toLowerCase();
    if ((inputClean === "admin" || inputClean === "musicalpucmosquera3ra@gmail.com") && passwordInput === "1234") {
      setUsuario("Alex");
      setRolUsuario("admin");
      setSesionIniciada(true);
      return;
    }
    setCargandoAuth(true);
    const { error } = await supabase.auth.signInWithPassword({ email: inputClean, password: passwordInput });
    setCargandoAuth(false);
    if (error) {
      alert(`⚠️ Error: ${error.message}`);
      return;
    }
    setSesionIniciada(true);
  };

  const esAdminOLider = rolUsuario === "admin" || rolUsuario === "lider";

  if (!sesionIniciada) {
    return (
      <View style={[styles.loginContainer, { backgroundColor: t.bg }]}>
        <View style={[styles.loginCard, { backgroundColor: t.cardBg, borderColor: t.border }]}>
          <Text style={[styles.loginTitle, { color: t.textMain }]}>SoundTeam</Text>
          <Text style={[styles.loginSubtitle, { color: t.textSub }]}>Inicio de Sesión</Text>
          
          <Text style={[styles.inputLabel, { color: t.textMain }]}>📧 Usuario / Correo</Text>
          <TextInput
            style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
            placeholder="Admin o correo@ejemplo.com"
            placeholderTextColor={t.textSub}
            autoCapitalize="none"
            value={emailInput}
            onChangeText={setEmailInput}
          />

          <Text style={[styles.inputLabel, { color: t.textMain }]}>🔑 Contraseña</Text>
          <TextInput
            style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
            placeholder="1234"
            placeholderTextColor={t.textSub}
            secureTextEntry
            value={passwordInput}
            onChangeText={setPasswordInput}
          />

          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: t.primary, marginTop: 10 }]} 
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>{cargandoAuth ? "Cargando..." : "Entrar"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={[styles.header, { backgroundColor: t.cardBg, borderBottomColor: t.border }]}>
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: t.textMain }]}>SoundTeam • {sedeActual.nombre}</Text>
            <Text style={[styles.headerSubtitle, { color: t.textSub }]}>
              👤 {usuario} • <Text style={{ color: t.primary, fontWeight: "bold" }}>ROL: {rolUsuario.toUpperCase()}</Text>
            </Text>
          </View>
          <TouchableOpacity style={{ backgroundColor: t.primary, paddingVertical: 5, paddingHorizontal: 8, borderRadius: 6 }} onPress={sincronizarDatosApp}>
            <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 11 }}>🔄 Refrescar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40, alignItems: "center" }}>
        <View style={styles.mainWrapper}>
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
                    setModalMiembroVisible(true);
                  }}
                >
                  <Text style={styles.programBtnText}>+ Agregar Miembro</Text>
                </TouchableOpacity>
              </View>

              {modalMiembroVisible && (
                <View style={[styles.card, { backgroundColor: t.bg, borderColor: t.primary, borderWidth: 2, marginBottom: 14 }]}>
                  <Text style={[styles.cardTitle, { color: t.textMain, fontSize: 16 }]}>
                    {idMiembroEditando !== null ? "✏️ Modificar Miembro" : "➕ Nuevo Miembro"}
                  </Text>
                  
                  <Text style={[styles.inputLabel, { color: t.textMain }]}>Nombre Completo *</Text>
                  <TextInput
                    style={[styles.loginInput, { backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain }]}
                    placeholder="Ej. Juan Pérez"
                    placeholderTextColor={t.textSub}
                    value={nombreNuevoMiembro}
                    onChangeText={setNombreNuevoMiembro}
                  />

                  <Text style={[styles.inputLabel, { color: t.textMain }]}>Correo Electrónico (Opcional)</Text>
                  <TextInput
                    style={[styles.loginInput, { backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain }]}
                    placeholder="correo@ejemplo.com"
                    placeholderTextColor={t.textSub}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={emailNuevoMiembro}
                    onChangeText={setEmailNuevoMiembro}
                  />

                  <Text style={[styles.inputLabel, { color: t.textMain }]}>PIN de Acceso</Text>
                  <TextInput
                    style={[styles.loginInput, { backgroundColor: t.cardBg, borderColor: t.border, color: t.textMain }]}
                    placeholder="1234"
                    placeholderTextColor={t.textSub}
                    value={pinNuevoMiembro}
                    onChangeText={setPinNuevoMiembro}
                  />

                  <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                    <TouchableOpacity
                      style={[styles.loginButton, { flex: 1, backgroundColor: t.primary, padding: 12 }]}
                      onPress={guardarONuevoMiembro}
                    >
                      <Text style={styles.loginButtonText}>Guardar Integrante</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.loginButton, { flex: 1, backgroundColor: "#EF4444", padding: 12 }]}
                      onPress={() => setModalMiembroVisible(false)}
                    >
                      <Text style={styles.loginButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {integrantesSeccionEquipo.map((int) => (
                <View key={int.id} style={[styles.memberCard, { backgroundColor: t.bg, borderColor: t.border }]}>
                  <View style={styles.memberHeaderRow}>
                    <Text style={[styles.memberTitle, { color: t.textMain }]}>👤 {int.nombre}</Text>
                    <TouchableOpacity
                      style={{ backgroundColor: "#EF4444", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 }}
                      onPress={async () => {
                        await supabase.from("integrantes").delete().eq("id", int.id);
                        sincronizarDatosApp();
                      }}
                    >
                      <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "bold" }}>🗑️ Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={{ color: t.textSub, fontSize: 11 }}>Correo: {int.email || "No registrado"} | PIN: {int.pin}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.tabBar, { backgroundColor: t.cardBg, borderTopColor: t.border }]}>
        {[{ key: "inicio", label: "🏠 Inicio" }, { key: "equipo", label: "👥 Equipo" }, { key: "repertorio", label: "🎵 Repertorio" }].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, pestana === tab.key && { borderTopWidth: 3, borderTopColor: t.primary }]}
            onPress={() => setPestana(tab.key)}
          >
            <Text style={[styles.tabText, { color: t.textSub }, pestana === tab.key && { color: t.textMain, fontWeight: "bold" }]}>
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
  content: { flex: 1, padding: 12, width: "100%" },
  mainWrapper: { width: "100%", maxWidth: 650 },
  card: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 14, width: "100%" },
  cardTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 10 },
  inputLabel: { fontSize: 11, marginBottom: 4, fontWeight: "500" },
  programBtn: { paddingVertical: 5, paddingHorizontal: 8, borderRadius: 6 },
  programBtnText: { color: "#FFFFFF", fontSize: 11, fontWeight: "bold" },
  tabBar: { flexDirection: "row", height: 55, borderTopWidth: 1, width: "100%" },
  tabItem: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabText: { fontSize: 10, textAlign: "center" },
  memberCard: { padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
  memberHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  memberTitle: { fontSize: 14, fontWeight: "bold" },
});