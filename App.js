import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native";
import { createClient } from "@supabase/supabase-js";

// 1. Configuración real de Supabase
const SUPABASE_URL = "https://menaeypgdctjvvubckfh.supabase.co";
const SUPABASE_ANON_KEY = "TU_SUPABASE_ANON_KEY_AQUI"; // Pega aquí tu anon / public key de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Paleta de colores original del proyecto
const t = {
  bg: "#0D0D0D",
  cardBg: "#161616",
  textMain: "#FFFFFF",
  textSub: "#8E8E93",
  border: "#242424",
  accent: "#FF6B00",
};

// Las 4 Sedes
const SEDES_DISPONIBLES = [
  { id: "principal", nombre: "Sede Principal" },
  { id: "norte", nombre: "Sede Norte" },
  { id: "sur", nombre: "Sede Sur" },
  { id: "occidente", nombre: "Sede Occidente" },
];

export default function App() {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [sedeIdSeleccionada, setSedeIdSeleccionada] = useState("principal");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      setCargando(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
      setCargando(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const iniciarSesionConGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: Platform.OS === "web" ? window.location.origin : undefined,
        },
      });
      if (error) alert("Error al conectar con Google: " + error.message);
    } catch (err) {
      alert("Error de conexión: " + err.message);
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
  };

  if (cargando) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  // Vista 1: Login con selector de las 4 sedes y botón de Google
  if (!sesion) {
    const sedeActual = SEDES_DISPONIBLES.find((s) => s.id === sedeIdSeleccionada);
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loginCard}>
          <Text style={styles.title}>SoundTeam</Text>
          <Text style={styles.subtitle}>
            Organiza tu equipo de alabanza en {sedeActual?.nombre}
          </Text>

          {/* Selector de las 4 Sedes */}
          {Platform.OS === "web" && (
            <select
              value={sedeIdSeleccionada}
              onChange={(e) => setSedeIdSeleccionada(e.target.value)}
              style={{
                backgroundColor: t.cardBg,
                color: t.textMain,
                borderColor: t.border,
                borderWidth: "1px",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "14px",
                marginBottom: "24px",
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
          )}

          {/* Botón de Iniciar sesión con Google */}
          <TouchableOpacity style={styles.googleButton} onPress={iniciarSesionConGoogle}>
            <Text style={{ fontSize: 18, marginRight: 10 }}>🌐</Text>
            <Text style={styles.googleButtonText}>Iniciar sesión con Google</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Vista 2: Panel principal post-login
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SoundTeam</Text>
          <Text style={styles.userEmail}>{sesion.user.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={cerrarSesion}>
          <Text style={{ color: "#FF4D4D", fontWeight: "bold" }}>Salir</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, padding: 20, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: t.textMain, fontSize: 18, fontWeight: "bold" }}>
          ¡Bienvenido al panel de SoundTeam!
        </Text>
        <Text style={{ color: t.textSub, marginTop: 8, textAlign: "center" }}>
          Has accedido correctamente con tu cuenta de Google.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.bg,
  },
  loginCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    alignSelf: "center",
    width: "100%",
    maxWidth: 400,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: t.textMain,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: t.textSub,
    marginBottom: 36,
    textAlign: "center",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.cardBg,
    borderColor: t.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: "100%",
  },
  googleButtonText: {
    color: t.textMain,
    fontWeight: "bold",
    fontSize: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: t.textMain,
  },
  userEmail: {
    fontSize: 12,
    color: t.textSub,
    marginTop: 2,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: t.cardBg,
    borderColor: t.border,
    borderWidth: 1,
  },
});