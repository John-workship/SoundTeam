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
  azul: { bg: "#0B132B", cardBg: "#1C2541", border: "#3A506B", primary: "#3B82F6", textMain: "#FFFFFF", textSub: "#8D99AE", banner: "#6D28D9", selectedDay: "#F97316", nombre: "🔵 Azul" },
  claro: { bg: "#F1F5F9", cardBg: "#FFFFFF", border: "#CBD5E1", primary: "#2563EB", textMain: "#0F172A", textSub: "#64748B", banner: "#7C3AED", selectedDay: "#EA580C", nombre: "☀️ Claro" },
  oscuro: { bg: "#000000", cardBg: "#121212", border: "#27272A", primary: "#6366F1", textMain: "#FAFAFA", textSub: "#A1A1AA", banner: "#4F46E5", selectedDay: "#8B5CF6", nombre: "🌙 Oscuro" },
};

const SEDES_DISPONIBLES = [
  { id: "general", nombre: "Sede General" },
  { id: "norte", nombre: "Sede Norte" },
  { id: "sur", nombre: "Sede Sur" },
  { id: "occidente", nombre: "Sede Occidente" },
];

export default function App() {
  const [sedeIdSeleccionada, setSedeIdSeleccionada] = useState("general");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [usuario, setUsuario] = useState("");
  const [rolUsuario, setRolUsuario] = useState("miembro");
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [cargandoAuth, setCargandoAuth] = useState(false);
  const [pestana, setPestana] = useState("inicio");

  // Verificar sesión existente en Supabase Auth
  useEffect(() => {
    const verificarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        cargarPerfilUsuario(session.user.email);
      }
    };
    verificarSesion();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        cargarPerfilUsuario(session.user.email);
      } else {
        setSesionIniciada(false);
        setUsuario("");
      }
    });

    return () => { authListener.subscription.unsubscribe(); };
  }, [sedeIdSeleccionada]);

  const cargarPerfilUsuario = async (email) => {
    const { data, error } = await supabase
      .from("integrantes")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (data && !error) {
      setUsuario(data.nombre);
      setRolUsuario(data.rol_acceso || "miembro");
      setSesionIniciada(true);
    } else {
      // Si el usuario existe en Auth pero aún no está en la tabla integrantes
      setUsuario(email.split("@")[0]);
      setRolUsuario("miembro");
      setSesionIniciada(true);
    }
  };

  const handleLoginSeguro = async () => {
    if (emailInput.trim() === "" || passwordInput.trim() === "") {
      alert("⚠️ Por favor ingresa tu correo electrónico y contraseña.");
      return;
    }

    setCargandoAuth(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailInput.trim(),
      password: passwordInput,
    });

    setCargandoAuth(false);

    if (error) {
      alert(`⚠️ Error de autenticación: ${error.message}`);
    } else if (data?.user) {
      await cargarPerfilUsuario(data.user.email);
      setEmailInput("");
      setPasswordInput("");
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
  };

  const t = TEMAS.azul;
  const sedeActual = SEDES_DISPONIBLES.find((s) => s.id === sedeIdSeleccionada) || SEDES_DISPONIBLES[0];

  if (!sesionIniciada) {
    return (
      <View style={[styles.loginContainer, { backgroundColor: t.bg }]}>
        <View style={[styles.loginCard, { backgroundColor: t.cardBg, borderColor: t.border }]}>
          <Text style={[styles.loginTitle, { color: t.textMain }]}>SoundTeam</Text>
          <Text style={[styles.loginSubtitle, { color: t.textSub }]}>Acceso Seguro por Correo</Text>

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

          <Text style={[styles.inputLabel, { color: t.textMain }]}>📧 Correo Electrónico</Text>
          <TextInput
            style={[styles.loginInput, { backgroundColor: t.bg, borderColor: t.border, color: t.textMain }]}
            placeholder="ejemplo@iglesia.com"
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

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: t.primary, marginTop: 10 }]}
            onPress={handleLoginSeguro}
            disabled={cargandoAuth}
          >
            <Text style={styles.loginButtonText}>
              {cargandoAuth ? "Verificando..." : "Iniciar Sesión"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={[styles.header, { backgroundColor: t.cardBg, borderBottomColor: t.border }]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: t.textMain }}>SoundTeam • {sedeActual.nombre}</Text>
            <Text style={{ fontSize: 11, color: t.textSub }}>👤 {usuario} | ROL: {rolUsuario.toUpperCase()}</Text>
          </View>
          <TouchableOpacity style={{ backgroundColor: "#EF4444", padding: 6, borderRadius: 6 }} onPress={handleLogout}>
            <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 11 }}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, alignItems: "center" }}>
        <Text style={{ color: t.textMain, fontSize: 16, fontWeight: "bold" }}>✨ Bienvenido a SoundTeam con autenticación segura por correo.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%" },
  loginContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loginCard: { width: "100%", maxWidth: 400, padding: 24, borderRadius: 12, borderWidth: 1 },
  loginTitle: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 6 },
  loginSubtitle: { fontSize: 13, textAlign: "center", marginBottom: 20 },
  loginInput: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 14, fontSize: 15 },
  loginButton: { padding: 14, borderRadius: 8, alignItems: "center" },
  loginButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
  header: { padding: 12, borderBottomWidth: 1, width: "100%" },
  inputLabel: { fontSize: 11, marginBottom: 4, fontWeight: "500" },
});