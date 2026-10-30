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
  Image,
  Switch,
} from "react-native";

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
  },
};

const GALERIA_PALETAS = [
  {
    id: 1,
    nombre: "Noche Púrpura",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80",
    colores: ["#0F4C81", "#1D1E4E", "#8C52FF", "#237B9F", "#7FD8BE"],
  },
  {
    id: 2,
    nombre: "Naturaleza Beige",
    url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=300&q=80",
    colores: ["#E6E2DD", "#C08A5E", "#1A1A1A"],
  },
  {
    id: 3,
    nombre: "Flor de Loto (Grises)",
    url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=300&q=80",
    colores: ["#747D81", "#A3A2A2", "#D3D2D7"],
  },
  {
    id: 4,
    nombre: "Primavera Cálida",
    url: "https://images.unsplash.com/photo-1508615070457-7baebd0003ad?auto=format&fit=crop&w=300&q=80",
    colores: ["#E5A93C", "#D0855A", "#C86E6D"],
  },
  {
    id: 5,
    nombre: "Océano Místico",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80",
    colores: ["#4A739C", "#6C7A9C", "#7B5E7B"],
  },
  {
    id: 6,
    nombre: "Pasión Roja",
    url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=300&q=80",
    colores: ["#800010", "#4D5B44", "#A81329"],
  },
  {
    id: 7,
    nombre: "Café Calidez",
    url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=300&q=80",
    colores: ["#2B1B17", "#3D2314", "#7A4B2A", "#A3724B"],
  },
  {
    id: 8,
    nombre: "Girasoles Amarillos",
    url: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=300&q=80",
    colores: ["#00A896", "#028090", "#F0A500"],
  },
  {
    id: 9,
    nombre: "Menta Fresca",
    url: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=300&q=80",
    colores: ["#8AA399", "#4E6E58", "#45B69C", "#92DCE5", "#B8E1DD"],
  },
  {
    id: 10,
    nombre: "Atardecer Otoñal",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80",
    colores: ["#EE4266", "#FFD166", "#E2D3A1", "#A2AA7B", "#A88220"],
  },
  {
    id: 11,
    nombre: "Hojas Otoño",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80",
    colores: ["#2D3A12", "#E28400", "#5B1707", "#E06D3B", "#D93829"],
  },
];

export default function App() {
  const [usuario, setUsuario] = useState("");
  const [rolUsuario, setRolUsuario] = useState("Voz Líder");
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [pestana, setPestana] = useState("inicio");

  // SEDES Y CÓDIGOS
  const [sedeActual, setSedeActual] = useState("Iglesia General");
  const [codigoSedeActual, setCodigoSedeActual] = useState("GEN2026");
  const [codigoInputSede, setCodigoInputSede] = useState("");
  const [sedesDisponibles] = useState([
    { nombre: "Iglesia General", codigo: "GEN2026" },
    { nombre: "Sede Norte", codigo: "NORTE2026" },
    { nombre: "Sede Sur", codigo: "SUR2026" },
  ]);

  const [modalSedeVisible, setModalSedeVisible] = useState(false);
  const [nombreTema, setNombreTema] = useState<
    "azul" | "claro" | "oscuro" | "rosado" | "morado"
  >("azul");

  const t = TEMAS[nombreTema];

  const [mesSeleccionado, setMesSeleccionado] = useState("Octubre");
  const [diaSeleccionado, setDiaSeleccionado] = useState(27);

  const [servicios, setServicios] = useState([
    {
      fecha: "2026-10-27",
      titulo: "Culto Dominical",
      observaciones: "Todo listo",
      paletaSeleccionadaId: 3,
      setlist: [
        { id: 1, titulo: "digno", tono: "E" },
        { id: 2, titulo: "A el alto y sublime", tono: "G" },
        { id: 3, titulo: "creo en ti", tono: "C" },
      ],
      voces: { principal: "Sin asignar", coros: "Admin" },
      instrumentos: {
        piano: "Sin asignar",
        guitarra: "Sin asignar",
        bajo: "Sin asignar",
        bateria: "Sin asignar",
      },
    },
  ]);

  const [modalProgramarVisible, setModalProgramarVisible] = useState(false);
  const [modalPostularVisible, setModalPostularVisible] = useState(false);

  const [nombreEvento, setNombreEvento] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [setlistActivo, setSetlistActivo] = useState<any[]>([]);
  const [paletaActivaId, setPaletaActivaId] = useState<number | null>(3);
  const [subirImagenToggle, setSubirImagenToggle] = useState(false);
  const [indiceSeleccionadoParaMover, setIndiceSeleccionadoParaMover] =
    useState<number | null>(null);

  const [servicioEditandoFecha, setServicioEditandoFecha] = useState<any>(null);
  const [nuevaFechaInput, setNuevaFechaInput] = useState("");

  const bibliotecaCanciones = [
    { id: 1, titulo: "creo en ti", tono: "C" },
    { id: 2, titulo: "A el alto y sublime", tono: "G" },
    { id: 3, titulo: "digno", tono: "E" },
    { id: 4, titulo: "cuan grande", tono: "G" },
  ];

  const [integrantes, setIntegrantes] = useState([
    { id: 1, nombre: "Lina", roles: ["🎤 Voz Principal", "👥 Coros"] },
    {
      id: 2,
      nombre: "Arley",
      roles: ["🎤 Voz Principal", "👥 Coros", "🎹 Piano"],
    },
    { id: 3, nombre: "Heidy", roles: ["🎤 Voz Principal", "👥 Coros"] },
    { id: 4, nombre: "Juan", roles: ["🎹 Piano"] },
    {
      id: 5,
      nombre: "Alex (Tú)",
      roles: ["🎤 Voz Principal", "👥 Coros", "🥁 Batería"],
    },
    {
      id: 6,
      nombre: "Alexa",
      roles: ["🎤 Voz Principal", "👥 Coros", "🥁 Batería"],
    },
  ]);

  const [integranteEditando, setIntegranteEditando] = useState<any>(null);
  const [rolesSeleccionadosEdit, setRolesSeleccionadosEdit] = useState<
    string[]
  >([]);

  const rolesDisponiblesGeneral = [
    "🎤 Voz Principal",
    "👥 Coros",
    "🎹 Piano",
    "🎸 Guitarra",
    "🎸 Bajo",
    "🥁 Batería",
  ];

  // SCRIPT AUTOMÁTICO PARA ELIMINAR EL BOTÓN DE OPEN SANDBOX EN WEB
  useEffect(() => {
    if (Platform.OS === "web") {
      const limpiarBotonMolesto = () => {
        const elementos = document.querySelectorAll("button, div");
        elementos.forEach((el) => {
          if (
            el.textContent?.includes("Open Sandbox") ||
            el.getAttribute("title")?.includes("CodeSandbox") ||
            (el.className &&
              typeof el.className === "string" &&
              el.className.includes("Sandbox"))
          ) {
            el.remove();
          }
        });
      };
      limpiarBotonMolesto();
      const intervalo = setInterval(limpiarBotonMolesto, 500);
      return () => clearInterval(intervalo);
    }
  }, []);

  const abrirModalRoles = (int: any) => {
    setIntegranteEditando(int);
    setRolesSeleccionadosEdit([...int.roles]);
  };

  const guardarRolesIntegrante = () => {
    if (integranteEditando) {
      setIntegrantes(
        integrantes.map((item) =>
          item.id === integranteEditando.id
            ? { ...item, roles: rolesSeleccionadosEdit }
            : item
        )
      );
      setIntegranteEditando(null);
    }
  };

  const [repertorio, setRepertorio] = useState([
    {
      id: 1,
      titulo: "creo en ti",
      artista: "Sin artista",
      tono: "C",
      letra: "[C] Creo en ti, [G] Señor...",
    },
    {
      id: 2,
      titulo: "A el alto y sublime",
      artista: "Sin artista",
      tono: "G",
      letra: "[G] A el alto y sublime...",
    },
    {
      id: 3,
      titulo: "digno",
      artista: "espiritu y verdad",
      tono: "E",
      letra: "[E] Digno eres tú...",
    },
    {
      id: 4,
      titulo: "cuan grande",
      artista: "grande",
      tono: "G",
      letra: "[G] Señor mi Dios...",
    },
  ]);

  const [nuevoTituloCancion, setNuevoTituloCancion] = useState("");
  const [nuevoArtistaCancion, setNuevoArtistaCancion] = useState("");
  const [nuevoTonoCancion, setNuevoTonoCancion] = useState("");
  const [nuevaLetraCancion, setNuevaLetraCancion] = useState("");

  const [cancionEditando, setCancionEditando] = useState<any>(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editArtista, setEditArtista] = useState("");
  const [editTono, setEditTono] = useState("");
  const [editLetra, setEditLetra] = useState("");

  const [tipoAcordeAtril, setTipoAcordeAtril] = useState<
    "Acordes" | "Nashville"
  >("Acordes");
  const [transposicion, setTransposicion] = useState(0);

  const validarYCambiarSedePorCodigo = () => {
    const sedeEncontrada = sedesDisponibles.find(
      (s) =>
        s.codigo.trim().toUpperCase() === codigoInputSede.trim().toUpperCase()
    );

    if (sedeEncontrada) {
      setSedeActual(sedeEncontrada.nombre);
      setCodigoSedeActual(sedeEncontrada.codigo);
      setCodigoInputSede("");
      setModalSedeVisible(false);
      alert(`✅ Te has conectado exitosamente a: ${sedeEncontrada.nombre}`);
    } else {
      alert(
        "❌ Código de sede inválido. Verifica el código con tu administrador."
      );
    }
  };

  const eliminarServicioPorFecha = (fecha: string) => {
    setServicios(servicios.filter((s) => s.fecha !== fecha));
  };

  const guardarNuevaFechaServicio = () => {
    if (servicioEditandoFecha && nuevaFechaInput.trim() !== "") {
      setServicios(
        servicios.map((s) =>
          s.fecha === servicioEditandoFecha.fecha
            ? { ...s, fecha: nuevaFechaInput.trim() }
            : s
        )
      );
      setServicioEditandoFecha(null);
      setNuevaFechaInput("");
    }
  };

  const guardarNuevaCancion = () => {
    if (nuevoTituloCancion.trim() !== "") {
      setRepertorio([
        ...repertorio,
        {
          id: Date.now(),
          titulo: nuevoTituloCancion,
          artista: nuevoArtistaCancion || "Sin artista",
          tono: nuevoTonoCancion || "C",
          letra: nuevaLetraCancion,
        },
      ]);
      setNuevoTituloCancion("");
      setNuevoArtistaCancion("");
      setNuevoTonoCancion("");
      setNuevaLetraCancion("");
    }
  };

  const seleccionarCancionParaEditar = (cancion: any) => {
    setCancionEditando(cancion);
    setEditTitulo(cancion.titulo);
    setEditArtista(cancion.artista);
    setEditTono(cancion.tono);
    setEditLetra(cancion.letra || "");
  };

  const guardarCambiosCancion = () => {
    if (cancionEditando) {
      setRepertorio(
        repertorio.map((c) =>
          c.id === cancionEditando.id
            ? {
                ...c,
                titulo: editTitulo,
                artista: editArtista,
                tono: editTono,
                letra: editLetra,
              }
            : c
        )
      );
      setCancionEditando(null);
    }
  };

  const eliminarCancion = (id: number) => {
    setRepertorio(repertorio.filter((c) => c.id !== id));
    if (cancionEditando && cancionEditando.id === id) {
      setCancionEditando(null);
    }
  };

  const manejarPresionCancionSetlist = (index: number) => {
    if (indiceSeleccionadoParaMover === null) {
      setIndiceSeleccionadoParaMover(index);
    } else {
      const nuevo = [...setlistActivo];
      const temp = nuevo[indiceSeleccionadoParaMover];
      nuevo[indiceSeleccionadoParaMover] = nuevo[index];
      nuevo[index] = temp;
      setSetlistActivo(nuevo);
      setIndiceSeleccionadoParaMover(null);
    }
  };

  const quitarCancionSetlist = (index: number) => {
    const nuevo = [...setlistActivo];
    nuevo.splice(index, 1);
    setSetlistActivo(nuevo);
    setIndiceSeleccionadoParaMover(null);
  };

  const moverCancionSetlist = (
    index: number,
    direccion: "arriba" | "abajo"
  ) => {
    const nuevo = [...setlistActivo];
    const destino = direccion === "arriba" ? index - 1 : index + 1;
    if (destino >= 0 && destino < nuevo.length) {
      const temp = nuevo[index];
      nuevo[index] = nuevo[destino];
      nuevo[destino] = temp;
      setSetlistActivo(nuevo);
    }
  };

  const cambiarTonoSetlist = (index: number, nuevoTono: string) => {
    const nuevo = [...setlistActivo];
    nuevo[index].tono = nuevoTono;
    setSetlistActivo(nuevo);
  };

  const abrirEditorServicio = (serv: any) => {
    setNombreEvento(serv ? serv.titulo : "Culto Especial");
    setObservaciones(serv ? serv.observaciones : "");
    setSetlistActivo(serv ? [...serv.setlist] : []);
    setPaletaActivaId(serv ? serv.paletaSeleccionadaId : 3);
    setIndiceSeleccionadoParaMover(null);
    setModalProgramarVisible(true);
  };

  const guardarServicioAvanzado = () => {
    if (nombreEvento.trim() !== "") {
      const mesNum =
        mesSeleccionado === "Octubre"
          ? "10"
          : mesSeleccionado === "Noviembre"
          ? "11"
          : "12";
      const diaStr =
        diaSeleccionado < 10 ? "0" + diaSeleccionado : String(diaSeleccionado);
      const fechaClave = `2026-${mesNum}-${diaStr}`;

      const servicioExistente = servicios.find((s) => s.fecha === fechaClave);
      const serviciosFiltrados = servicios.filter(
        (s) => s.fecha !== fechaClave
      );

      setServicios([
        ...serviciosFiltrados,
        {
          fecha: fechaClave,
          titulo: nombreEvento,
          observaciones: observaciones || "Sin observaciones",
          paletaSeleccionadaId: paletaActivaId,
          setlist: setlistActivo.length > 0 ? setlistActivo : [],
          voces: servicioExistente
            ? servicioExistente.voces
            : { principal: "Sin asignar", coros: "Sin asignar" },
          instrumentos: servicioExistente
            ? servicioExistente.instrumentos
            : {
                piano: "Sin asignar",
                guitarra: "Sin asignar",
                bajo: "Sin asignar",
                bateria: "Sin asignar",
              },
        },
      ]);

      setModalProgramarVisible(false);
    }
  };

  const postularseARol = (
    categoria: "voces" | "instrumentos",
    subcampo: string
  ) => {
    const mesNum =
      mesSeleccionado === "Octubre"
        ? "10"
        : mesSeleccionado === "Noviembre"
        ? "11"
        : "12";
    const diaStr =
      diaSeleccionado < 10 ? "0" + diaSeleccionado : String(diaSeleccionado);
    const fechaClave = `2026-${mesNum}-${diaStr}`;

    const servicioActual = servicios.find((s) => s.fecha === fechaClave);
    if (!servicioActual) return;

    const yaEstaEnVoces = Object.values(servicioActual.voces).includes(usuario);
    const yaEstaEnInstrumentos = Object.values(
      servicioActual.instrumentos
    ).includes(usuario);

    if (yaEstaEnVoces || yaEstaEnInstrumentos) {
      alert(
        `⚠️ Ya te encuentras postulado o asignado en este servicio. Solo puedes ocupar un rol por evento.`
      );
      setModalPostularVisible(false);
      return;
    }

    setServicios(
      servicios.map((s) => {
        if (s.fecha === fechaClave) {
          if (categoria === "voces") {
            return { ...s, voces: { ...s.voces, [subcampo]: usuario } };
          } else {
            return {
              ...s,
              instrumentos: { ...s.instrumentos, [subcampo]: usuario },
            };
          }
        }
        return s;
      })
    );
    setModalPostularVisible(false);
    alert(`¡Te has postulado como ${subcampo} exitosamente!`);
  };

  const quitarRolAsignado = (
    categoria: "voces" | "instrumentos",
    subcampo: string
  ) => {
    const mesNum =
      mesSeleccionado === "Octubre"
        ? "10"
        : mesSeleccionado === "Noviembre"
        ? "11"
        : "12";
    const diaStr =
      diaSeleccionado < 10 ? "0" + diaSeleccionado : String(diaSeleccionado);
    const fechaClave = `2026-${mesNum}-${diaStr}`;

    setServicios(
      servicios.map((s) => {
        if (s.fecha === fechaClave) {
          if (categoria === "voces") {
            return { ...s, voces: { ...s.voces, [subcampo]: "Sin asignar" } };
          } else {
            return {
              ...s,
              instrumentos: { ...s.instrumentos, [subcampo]: "Sin asignar" },
            };
          }
        }
        return s;
      })
    );
  };

  const enviarSetlistPorWhatsApp = () => {
    if (!servicioDelDia) return;

    let mensaje = `🎵 *SERVICIO: ${servicioDelDia.titulo}* 🎵\n`;
    mensaje += `📅 Fecha: ${diaSeleccionado} de ${mesSeleccionado} 2026\n`;
    mensaje += `🏛️ Sede: ${sedeActual} (${codigoSedeActual})\n\n`;

    mensaje += `📜 *SETLIST:*\n`;
    if (servicioDelDia.setlist && servicioDelDia.setlist.length > 0) {
      servicioDelDia.setlist.forEach((c: any, index: number) => {
        mensaje += `${index + 1}. ${c.titulo} (${c.tono})\n`;
      });
    } else {
      mensaje += `Sin canciones asignadas\n`;
    }

    mensaje += `\n🎤 *VOCES:*\n`;
    mensaje += `• Principal: ${servicioDelDia.voces.principal}\n`;
    mensaje += `• Coros: ${servicioDelDia.voces.coros}\n`;

    mensaje += `\n🎸 *INSTRUMENTOS:*\n`;
    mensaje += `• Piano: ${servicioDelDia.instrumentos.piano}\n`;
    mensaje += `• Guitarra: ${servicioDelDia.instrumentos.guitarra}\n`;
    mensaje += `• Bajo: ${servicioDelDia.instrumentos.bajo}\n`;
    mensaje += `• Batería: ${servicioDelDia.instrumentos.bateria}\n`;

    if (servicioDelDia.observaciones) {
      mensaje += `\n📝 *OBSERVACIONES:*\n${servicioDelDia.observaciones}`;
    }

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;

    Linking.openURL(url).catch(() => {
      alert("No se pudo abrir WhatsApp. Asegúrate de tenerlo instalado.");
    });
  };

  const handleLogin = () => {
    if (usuario.trim() !== "") {
      if (usuario.toLowerCase() === "admin") {
        setRolUsuario("Administrador");
      } else {
        setRolUsuario("Voz Líder");
      }
      setSesionIniciada(true);
    }
  };

  const handleLogout = () => {
    setSesionIniciada(false);
    setUsuario("");
  };

  const mesNumActual =
    mesSeleccionado === "Octubre"
      ? "10"
      : mesSeleccionado === "Noviembre"
      ? "11"
      : "12";
  const fechaActualClave = `2026-${mesNumActual}-${
    diaSeleccionado < 10 ? "0" + diaSeleccionado : diaSeleccionado
  }`;
  const servicioDelDia = servicios.find((s) => s.fecha === fechaActualClave);
  const paletaServicio = GALERIA_PALETAS.find(
    (p) => p.id === servicioDelDia?.paletaSeleccionadaId
  );

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
            Ingresa tu nombre o apodo para acceso total
          </Text>

          <Text style={[styles.loginLabel, { color: t.textMain }]}>
            Tu Nombre o Apodo
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
            placeholder="Ej. Alex o Admin"
            placeholderTextColor={t.textSub}
            value={usuario}
            onChangeText={setUsuario}
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
          <View>
            <Text style={[styles.headerTitle, { color: t.textMain }]}>
              SoundTeam
            </Text>
            <Text style={[styles.headerSubtitle, { color: t.textSub }]}>
              {usuario} 👑 ({rolUsuario}) • Sede: {sedeActual} (
              {codigoSedeActual})
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.sedeBtn, { backgroundColor: t.primary }]}
              onPress={() => setModalSedeVisible(!modalSedeVisible)}
            >
              <Text style={styles.sedeBtnText}>🏛️ Sede</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.themeRow,
          { backgroundColor: t.cardBg, borderBottomColor: t.border },
        ]}
      >
        <Text style={[styles.themeLabel, { color: t.textMain }]}>Tema:</Text>
        {[
          { key: "azul", label: "🔵 Azul" },
          { key: "claro", label: "☀️ Claro" },
          { key: "oscuro", label: "🌙 Oscuro" },
          { key: "rosado", label: "🌸 Rosado" },
          { key: "morado", label: "💜 Morado" },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.themeBtn,
              { backgroundColor: t.bg, borderColor: t.border },
              nombreTema === item.key && {
                borderColor: t.primary,
                backgroundColor: t.primary + "33",
              },
            ]}
            onPress={() => setNombreTema(item.key as any)}
          >
            <Text
              style={[
                styles.themeText,
                { color: t.textSub },
                nombreTema === item.key && {
                  color: t.textMain,
                  fontWeight: "bold",
                },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {modalSedeVisible && (
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
              style={[styles.cardTitle, { color: t.textMain, fontSize: 16 }]}
            >
              🏛️ Gestión de Sedes y Accesos
            </Text>
            <Text
              style={[
                styles.welcomeText,
                { color: t.textSub, marginBottom: 8 },
              ]}
            >
              Sede activa actual:{" "}
              <Text style={{ color: t.primary, fontWeight: "bold" }}>
                {sedeActual}
              </Text>{" "}
              (Código: {codigoSedeActual})
            </Text>

            <Text style={[styles.inputLabel, { color: t.textSub }]}>
              Ingresar código de sede o grupo:
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
              placeholder="Ej. GEN2026, NORTE2026, SUR2026"
              placeholderTextColor={t.textSub}
              value={codigoInputSede}
              onChangeText={setCodigoInputSede}
              autoCapitalize="characters"
            />

            <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  { flex: 1, backgroundColor: t.primary, paddingVertical: 10 },
                ]}
                onPress={validarYCambiarSedePorCodigo}
              >
                <Text style={[styles.loginButtonText, { fontSize: 13 }]}>
                  Conectarse a Sede
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  { flex: 1, backgroundColor: "#EF4444", paddingVertical: 10 },
                ]}
                onPress={() => setModalSedeVisible(false)}
              >
                <Text style={[styles.loginButtonText, { fontSize: 13 }]}>
                  Cerrar
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.subHeaderLabel,
                { color: t.textSub, marginTop: 12 },
              ]}
            >
              Códigos disponibles de ejemplo:
            </Text>
            {sedesDisponibles.map((s, idx) => (
              <Text key={idx} style={{ fontSize: 11, color: t.textSub }}>
                • {s.nombre}:{" "}
                <Text style={{ color: t.textMain, fontWeight: "bold" }}>
                  {s.codigo}
                </Text>
              </Text>
            ))}
          </View>
        )}

        {/* --- PESTAÑA INICIO --- */}
        {pestana === "inicio" && (
          <>
            <View style={[styles.welcomeBanner, { backgroundColor: t.banner }]}>
              <Text style={styles.welcomeTitle}>Sede: {sedeActual}</Text>
              <Text style={styles.welcomeBannerText}>
                Organiza cada servicio con excelencia en tu comunidad.
              </Text>
            </View>

            <View
              style={[
                styles.card,
                { backgroundColor: t.cardBg, borderColor: t.border },
              ]}
            >
              <Text style={[styles.cardTitle, { color: t.textMain }]}>
                Resumen del Grupo
              </Text>
              <View style={styles.statsRow}>
                <View
                  style={[
                    styles.statBox,
                    { backgroundColor: t.bg, borderColor: t.border },
                  ]}
                >
                  <Text style={[styles.statNumber, { color: t.primary }]}>
                    {servicios.length}
                  </Text>
                  <Text style={[styles.statLabel, { color: t.textSub }]}>
                    Eventos
                  </Text>
                </View>
                <View
                  style={[
                    styles.statBox,
                    { backgroundColor: t.bg, borderColor: t.border },
                  ]}
                >
                  <Text style={[styles.statNumber, { color: t.primary }]}>
                    {integrantes.length}
                  </Text>
                  <Text style={[styles.statLabel, { color: t.textSub }]}>
                    Integrantes
                  </Text>
                </View>
                <View
                  style={[
                    styles.statBox,
                    { backgroundColor: t.bg, borderColor: t.border },
                  ]}
                >
                  <Text style={[styles.statNumber, { color: t.primary }]}>
                    {repertorio.length}
                  </Text>
                  <Text style={[styles.statLabel, { color: t.textSub }]}>
                    Canciones
                  </Text>
                </View>
              </View>
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
                  { color: t.textMain, marginBottom: 8 },
                ]}
              >
                Servicios Programados
              </Text>

              {servicioEditandoFecha && (
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: t.bg,
                      borderColor: t.primary,
                      borderWidth: 2,
                      marginBottom: 12,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: t.textMain, fontSize: 13 },
                    ]}
                  >
                    📅 Reprogramar fecha para: {servicioEditandoFecha.titulo}
                  </Text>
                  <Text style={[styles.inputLabel, { color: t.textSub }]}>
                    Nueva Fecha (Formato: YYYY-MM-DD):
                  </Text>
                  <TextInput
                    style={[
                      styles.loginInput,
                      {
                        backgroundColor: t.cardBg,
                        borderColor: t.border,
                        color: t.textMain,
                      },
                    ]}
                    placeholder="Ej. 2026-11-05"
                    placeholderTextColor={t.textSub}
                    value={nuevaFechaInput}
                    onChangeText={setNuevaFechaInput}
                  />
                  <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                    <TouchableOpacity
                      style={[
                        styles.loginButton,
                        {
                          flex: 1,
                          backgroundColor: t.primary,
                          paddingVertical: 8,
                        },
                      ]}
                      onPress={guardarNuevaFechaServicio}
                    >
                      <Text style={[styles.loginButtonText, { fontSize: 12 }]}>
                        Guardar Fecha
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.loginButton,
                        {
                          flex: 1,
                          backgroundColor: "#EF4444",
                          paddingVertical: 8,
                        },
                      ]}
                      onPress={() => setServicioEditandoFecha(null)}
                    >
                      <Text style={[styles.loginButtonText, { fontSize: 12 }]}>
                        Cancelar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {servicios.length > 0 ? (
                servicios.map((serv, index) => (
                  <View
                    key={index}
                    style={[
                      styles.eventCard,
                      {
                        backgroundColor: t.bg,
                        borderColor: t.border,
                        marginBottom: 8,
                      },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={[styles.eventTitle, { color: t.textMain }]}>
                        📅 {serv.titulo} ({serv.fecha})
                      </Text>

                      <View style={{ flexDirection: "row", gap: 6 }}>
                        <TouchableOpacity
                          style={styles.editServiceBtn}
                          onPress={() => {
                            setServicioEditandoFecha(serv);
                            setNuevaFechaInput(serv.fecha);
                          }}
                        >
                          <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                            📅 Modificar Fecha
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteServiceBtn}
                          onPress={() => eliminarServicioPorFecha(serv.fecha)}
                        >
                          <Text style={{ fontSize: 10 }}>🗑️ Eliminar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.welcomeText,
                        { color: t.textSub, marginTop: 4 },
                      ]}
                    >
                      {serv.observaciones || "Sin observaciones"}
                    </Text>

                    <View
                      style={{
                        marginTop: 6,
                        borderTopWidth: 1,
                        borderTopColor: t.border,
                        paddingTop: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "bold",
                          color: t.primary,
                        }}
                      >
                        SETLIST:
                      </Text>
                      {serv.setlist && serv.setlist.length > 0 ? (
                        serv.setlist.map((c: any, idx: number) => (
                          <Text
                            key={idx}
                            style={{ fontSize: 11, color: t.textSub }}
                          >
                            {idx + 1}. {c.titulo} ({c.tono})
                          </Text>
                        ))
                      ) : (
                        <Text
                          style={{
                            fontSize: 11,
                            color: t.textSub,
                            fontStyle: "italic",
                          }}
                        >
                          Sin canciones agregadas
                        </Text>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <Text
                  style={[
                    styles.welcomeText,
                    { color: t.textSub, textAlign: "center", padding: 10 },
                  ]}
                >
                  No hay servicios programados.
                </Text>
              )}
            </View>
          </>
        )}

        {pestana === "eventos" && (
          <>
            <View style={styles.monthsRow}>
              {["Octubre", "Noviembre", "Diciembre"].map((mes) => (
                <TouchableOpacity
                  key={mes}
                  style={[
                    styles.monthTab,
                    { backgroundColor: t.cardBg, borderColor: t.border },
                    mesSeleccionado === mes && {
                      backgroundColor: t.primary,
                      borderColor: t.primary,
                    },
                  ]}
                  onPress={() => setMesSeleccionado(mes)}
                >
                  <Text
                    style={[
                      styles.monthText,
                      { color: t.textSub },
                      mesSeleccionado === mes && styles.monthTextActive,
                    ]}
                  >
                    {mes}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View
              style={[
                styles.calendarCard,
                { backgroundColor: t.cardBg, borderColor: t.border },
              ]}
            >
              <Text style={[styles.calendarHeaderTitle, { color: t.textMain }]}>
                {mesSeleccionado} 2026
              </Text>
              <View style={styles.weekHeaderRow}>
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                  <Text
                    key={d}
                    style={[styles.weekHeaderCell, { color: t.textSub }]}
                  >
                    {d}
                  </Text>
                ))}
              </View>

              <View style={styles.daysGrid}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => {
                  const esSeleccionado = diaSeleccionado === dia;
                  return (
                    <TouchableOpacity
                      key={dia}
                      style={[
                        styles.dayCell,
                        { backgroundColor: t.bg },
                        esSeleccionado && {
                          backgroundColor: t.selectedDay,
                          borderColor: t.selectedDay,
                        },
                      ]}
                      onPress={() => setDiaSeleccionado(dia)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          { color: t.textMain },
                          esSeleccionado && styles.dayTextSelected,
                        ]}
                      >
                        {dia}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.serviceSectionHeader}>
              <Text style={[styles.serviceSectionTitle, { color: t.textMain }]}>
                Servicio del Día {diaSeleccionado} de {mesSeleccionado} 2026
              </Text>
              <TouchableOpacity
                style={[styles.programBtn, { backgroundColor: t.primary }]}
                onPress={() => abrirEditorServicio(null)}
              >
                <Text style={styles.programBtnText}>
                  + Programar en este día
                </Text>
              </TouchableOpacity>
            </View>

            {servicioDelDia ? (
              <View
                style={[
                  styles.card,
                  { backgroundColor: t.cardBg, borderColor: t.border },
                ]}
              >
                <View style={styles.eventCardHeaderRow}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>📅</Text>
                    <Text
                      style={[styles.eventMainTitle, { color: t.textMain }]}
                    >
                      {servicioDelDia.titulo}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <TouchableOpacity
                      style={styles.editServiceBtn}
                      onPress={() => abrirEditorServicio(servicioDelDia)}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                        ✏️ Editar
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteServiceBtn}
                      onPress={() => eliminarServicioPorFecha(fechaActualClave)}
                    >
                      <Text style={{ fontSize: 11 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={[styles.eventSubDate, { color: t.textSub }]}>
                  Día {diaSeleccionado} de {mesSeleccionado} 2026
                </Text>

                {paletaServicio && (
                  <View
                    style={[
                      styles.paletaPreviewBox,
                      { backgroundColor: t.bg, borderColor: t.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.setlistHeaderBoxText,
                        { color: t.textSub },
                      ]}
                    >
                      🎨 PALETA DE COLORES: {paletaServicio.nombre}
                    </Text>
                    <View style={styles.paletaPreviewRow}>
                      <Image
                        source={{ uri: paletaServicio.url }}
                        style={styles.paletaThumbImage}
                      />
                      <View style={styles.paletaSwatchesRow}>
                        {paletaServicio.colores.map((colorHex, idx) => (
                          <View
                            key={idx}
                            style={[
                              styles.swatchBox,
                              { backgroundColor: colorHex },
                            ]}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                )}

                <View
                  style={[
                    styles.setlistContainerBox,
                    { backgroundColor: t.bg, borderColor: t.border },
                  ]}
                >
                  <Text
                    style={[styles.setlistHeaderBoxText, { color: t.textSub }]}
                  >
                    SETLIST (
                    {servicioDelDia.setlist ? servicioDelDia.setlist.length : 0}
                    )
                  </Text>
                  {servicioDelDia.setlist &&
                  servicioDelDia.setlist.length > 0 ? (
                    servicioDelDia.setlist.map((cancion: any, idx: number) => (
                      <Text
                        key={idx}
                        style={[
                          styles.setlistItemBoxText,
                          { color: t.primary },
                        ]}
                      >
                        {idx + 1}. {cancion.titulo} ({cancion.tono})
                      </Text>
                    ))
                  ) : (
                    <Text
                      style={{
                        fontSize: 11,
                        color: t.textSub,
                        fontStyle: "italic",
                      }}
                    >
                      Sin canciones en este servicio
                    </Text>
                  )}
                </View>

                <View style={styles.rolesGridRow}>
                  <View
                    style={[
                      styles.roleBoxHalf,
                      { backgroundColor: t.bg, borderColor: t.border },
                    ]}
                  >
                    <Text style={[styles.roleBoxTitle, { color: t.textMain }]}>
                      🎤 VOCES
                    </Text>

                    <View style={styles.roleItemRow}>
                      <Text style={[styles.roleBoxText, { color: t.textSub }]}>
                        • Principal: {servicioDelDia.voces.principal}
                      </Text>
                      {servicioDelDia.voces.principal !== "Sin asignar" && (
                        <TouchableOpacity
                          onPress={() =>
                            quitarRolAsignado("voces", "principal")
                          }
                          style={styles.quitarRolBtn}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              color: "#EF4444",
                              fontWeight: "bold",
                            }}
                          >
                            ✕ Quitar
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.roleItemRow}>
                      <Text style={[styles.roleBoxText, { color: t.textSub }]}>
                        • Coros: {servicioDelDia.voces.coros}
                      </Text>
                      {servicioDelDia.voces.coros !== "Sin asignar" && (
                        <TouchableOpacity
                          onPress={() => quitarRolAsignado("voces", "coros")}
                          style={styles.quitarRolBtn}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              color: "#EF4444",
                              fontWeight: "bold",
                            }}
                          >
                            ✕ Quitar
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <View
                    style={[
                      styles.roleBoxHalf,
                      { backgroundColor: t.bg, borderColor: t.border },
                    ]}
                  >
                    <Text style={[styles.roleBoxTitle, { color: t.textMain }]}>
                      🎸 INSTRUMENTOS
                    </Text>

                    {["piano", "guitarra", "bajo", "bateria"].map((inst) => {
                      const asignado = servicioDelDia.instrumentos[inst];
                      return (
                        <View key={inst} style={styles.roleItemRow}>
                          <Text
                            style={[
                              styles.roleBoxText,
                              { color: t.textSub, textTransform: "capitalize" },
                            ]}
                          >
                            • {inst}: {asignado}
                          </Text>
                          {asignado !== "Sin asignar" && (
                            <TouchableOpacity
                              onPress={() =>
                                quitarRolAsignado("instrumentos", inst)
                              }
                              style={styles.quitarRolBtn}
                            >
                              <Text
                                style={{
                                  fontSize: 10,
                                  color: "#EF4444",
                                  fontWeight: "bold",
                                }}
                              >
                                ✕ Quitar
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>

                <View
                  style={[
                    styles.obsContainerBox,
                    { backgroundColor: t.bg, borderColor: t.border },
                  ]}
                >
                  <Text
                    style={[styles.obsHeaderBoxText, { color: t.textMain }]}
                  >
                    📝 OBSERVACIONES TÉCNICAS
                  </Text>
                  <Text
                    style={[styles.obsContentBoxText, { color: t.textSub }]}
                  >
                    {servicioDelDia.observaciones}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.whatsappActionBtn,
                    { backgroundColor: "#22C55E", marginTop: 8 },
                  ]}
                  onPress={enviarSetlistPorWhatsApp}
                >
                  <Text style={styles.loginButtonText}>
                    🚀 Enviar setlist por WhatsApp
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.postulateActionBtn,
                    { backgroundColor: "#F97316", marginTop: 8 },
                  ]}
                  onPress={() => setModalPostularVisible(true)}
                >
                  <Text style={styles.loginButtonText}>
                    🙋‍♂️ Postularme (Elegir rol)
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={[
                  styles.card,
                  { backgroundColor: t.cardBg, borderColor: t.border },
                ]}
              >
                <Text
                  style={[
                    styles.welcomeText,
                    { color: t.textSub, textAlign: "center", padding: 20 },
                  ]}
                >
                  No hay ningún servicio programado para esta fecha. Toca en "+
                  Programar en este día".
                </Text>
              </View>
            )}

            {modalPostularVisible && (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: t.cardBg,
                    borderColor: t.primary,
                    borderWidth: 2,
                    marginTop: 12,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cardTitle,
                    { color: t.textMain, fontSize: 16, marginBottom: 8 },
                  ]}
                >
                  Selecciona el rol para ocupar ({usuario}):
                </Text>

                <Text style={[styles.inputLabel, { color: t.textSub }]}>
                  🎤 Voces:
                </Text>
                <View style={{ flexDirection: "row", gap: 6, marginBottom: 8 }}>
                  <TouchableOpacity
                    style={[styles.chip, { backgroundColor: t.primary }]}
                    onPress={() => postularseARol("voces", "principal")}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 11,
                        fontWeight: "bold",
                      }}
                    >
                      Voz Principal
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chip, { backgroundColor: t.primary }]}
                    onPress={() => postularseARol("voces", "coros")}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 11,
                        fontWeight: "bold",
                      }}
                    >
                      Coros
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.inputLabel, { color: t.textSub }]}>
                  🎸 Instrumentos:
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: 12,
                  }}
                >
                  {["piano", "guitarra", "bajo", "bateria"].map((inst) => (
                    <TouchableOpacity
                      key={inst}
                      style={[styles.chip, { backgroundColor: t.primary }]}
                      onPress={() => postularseARol("instrumentos", inst)}
                    >
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 11,
                          fontWeight: "bold",
                          textTransform: "capitalize",
                        }}
                      >
                        {inst}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.loginButton, { backgroundColor: "#EF4444" }]}
                  onPress={() => setModalPostularVisible(false)}
                >
                  <Text style={styles.loginButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}

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
                    { color: t.textMain, fontSize: 16 },
                  ]}
                >
                  ✏️ Editando Servicio ({mesSeleccionado} {diaSeleccionado},
                  2026)
                </Text>

                <Text style={[styles.inputLabel, { color: t.textSub }]}>
                  Nombre del evento (Modificable)
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
                  value={nombreEvento}
                  onChangeText={setNombreEvento}
                  placeholder="Ej. Culto Dominical, Vigilia, etc."
                  placeholderTextColor={t.textSub}
                />

                <View
                  style={[
                    styles.paletaSectionContainer,
                    { backgroundColor: "#131B2E", borderColor: t.border },
                  ]}
                >
                  <View style={styles.paletaHeaderRow}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text style={{ fontSize: 14 }}>🌐</Text>
                      <Text style={styles.paletaSectionTitle}>
                        PALETA DEL CULTO
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text style={{ color: "#8D99AE", fontSize: 11 }}>
                        📷 Subir imagen
                      </Text>
                      <Switch
                        value={subirImagenToggle}
                        onValueChange={setSubirImagenToggle}
                        trackColor={{ false: "#3A506B", true: "#3B82F6" }}
                        thumbColor="#FFFFFF"
                      />
                    </View>
                  </View>

                  <View style={styles.paletaGrid}>
                    {GALERIA_PALETAS.map((item) => {
                      const esSeleccionada = paletaActivaId === item.id;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          activeOpacity={0.8}
                          style={[
                            styles.paletaCard,
                            esSeleccionada && styles.paletaCardSelected,
                          ]}
                          onPress={() => {
                            if (esSeleccionada) {
                              setPaletaActivaId(null);
                            } else {
                              setPaletaActivaId(item.id);
                            }
                          }}
                        >
                          <Image
                            source={{ uri: item.url }}
                            style={styles.paletaImage}
                          />

                          <View style={styles.swatchContainerOverlay}>
                            {item.colores.map((c, i) => (
                              <View
                                key={i}
                                style={[
                                  styles.swatchMini,
                                  { backgroundColor: c },
                                ]}
                              />
                            ))}
                          </View>

                          {esSeleccionada && (
                            <View style={styles.checkIconBadge}>
                              <Text
                                style={{
                                  color: "#FFFFFF",
                                  fontSize: 10,
                                  fontWeight: "bold",
                                }}
                              >
                                ✓
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={styles.paletaFooterHint}>
                    Toca otra imagen para cambiar o la misma para deseleccionar.
                    ({paletaActivaId || 0}/12)
                  </Text>
                </View>

                <Text style={[styles.inputLabel, { color: t.textSub }]}>
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
                  value={observaciones}
                  onChangeText={setObservaciones}
                />

                <Text
                  style={[
                    styles.cardTitle,
                    { color: t.textMain, marginTop: 12, fontSize: 14 },
                  ]}
                >
                  Organización del Setlist (Modificar Nota / Tono y Orden)
                </Text>
                <Text style={[styles.subHeaderLabel, { color: t.textSub }]}>
                  {setlistActivo.length === 0
                    ? "💡 El setlist está vacío. Toca abajo en la biblioteca para agregar canciones:"
                    : indiceSeleccionadoParaMover !== null
                    ? "👉 Toca otra canción del Setlist para mover la selección de puesto:"
                    : "💡 Toca una canción para seleccionarla (o usa los botones ▲▼):"}
                </Text>

                {setlistActivo.map((cancion, idx) => {
                  const estaSeleccionada = indiceSeleccionadoParaMover === idx;
                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.9}
                      onPress={() => manejarPresionCancionSetlist(idx)}
                      style={[
                        styles.editSetlistRow,
                        { backgroundColor: t.bg, borderColor: t.border },
                        estaSeleccionada && {
                          backgroundColor: "#F9731633",
                          borderColor: "#F97316",
                          borderWidth: 2,
                        },
                      ]}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          flex: 1,
                          gap: 6,
                        }}
                      >
                        <Text style={{ color: t.textMain, fontWeight: "bold" }}>
                          {estaSeleccionada ? "📌 [Seleccionada] " : "≡ "}{" "}
                          {idx + 1}. {cancion.titulo}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Text style={{ color: t.textSub, fontSize: 11 }}>
                          Nota:
                        </Text>
                        <TextInput
                          style={[
                            styles.notaInput,
                            {
                              backgroundColor: t.cardBg,
                              borderColor: t.border,
                              color: t.textMain,
                            },
                          ]}
                          value={cancion.tono}
                          onChangeText={(val) => cambiarTonoSetlist(idx, val)}
                        />
                        <TouchableOpacity
                          style={[
                            styles.miniBtn,
                            { backgroundColor: "#3B82F6" },
                          ]}
                          onPress={() => moverCancionSetlist(idx, "arriba")}
                        >
                          <Text style={{ color: "#FFFFFF", fontSize: 10 }}>
                            ▲
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.miniBtn,
                            { backgroundColor: "#3B82F6" },
                          ]}
                          onPress={() => moverCancionSetlist(idx, "abajo")}
                        >
                          <Text style={{ color: "#FFFFFF", fontSize: 10 }}>
                            ▼
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.miniBtnDanger,
                            { backgroundColor: "#EF4444" },
                          ]}
                          onPress={() => quitarCancionSetlist(idx)}
                        >
                          <Text style={{ color: "#FFFFFF", fontSize: 10 }}>
                            Quitar
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                <Text
                  style={[
                    styles.subHeaderLabel,
                    { color: t.textSub, marginTop: 12 },
                  ]}
                >
                  Biblioteca de canciones (Toca para agregar):
                </Text>
                {bibliotecaCanciones.map((cancion) => {
                  const yaAgregada = setlistActivo.some(
                    (c) =>
                      c.titulo.toLowerCase() === cancion.titulo.toLowerCase()
                  );
                  return (
                    <TouchableOpacity
                      key={cancion.id}
                      style={[
                        styles.songLibraryRow,
                        { backgroundColor: t.bg, borderColor: t.border },
                      ]}
                      onPress={() => {
                        if (!yaAgregada) {
                          setSetlistActivo([
                            ...setlistActivo,
                            {
                              id: Date.now(),
                              titulo: cancion.titulo,
                              tono: cancion.tono,
                            },
                          ]);
                        }
                      }}
                    >
                      <Text
                        style={[styles.songLibraryText, { color: t.textMain }]}
                      >
                        {cancion.titulo}{" "}
                        <Text style={{ color: t.textSub }}>
                          ({cancion.tono})
                        </Text>
                      </Text>
                      <Text
                        style={{
                          color: yaAgregada ? "#22C55E" : t.primary,
                          fontSize: 11,
                          fontWeight: "bold",
                        }}
                      >
                        {yaAgregada ? "✓ Agregada" : "+ Agregar"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      { flex: 1, backgroundColor: "#F97316" },
                    ]}
                    onPress={guardarServicioAvanzado}
                  >
                    <Text style={styles.loginButtonText}>Guardar Cambios</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      { flex: 1, backgroundColor: "#EF4444" },
                    ]}
                    onPress={() => setModalProgramarVisible(false)}
                  >
                    <Text style={styles.loginButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

        {pestana === "equipo" && (
          <View
            style={[
              styles.card,
              { backgroundColor: t.cardBg, borderColor: t.border },
            ]}
          >
            <Text
              style={[styles.cardTitle, { color: t.textMain, fontSize: 16 }]}
            >
              Miembros del Grupo ({integrantes.length})
            </Text>
            <Text style={[styles.teamSubtitle, { color: t.textSub }]}>
              👑 Vista de Voz Líder: Modificación de roles.
            </Text>

            {integrantes.map((int) => (
              <View
                key={int.id}
                style={[
                  styles.memberCard,
                  { backgroundColor: t.bg, borderColor: t.border },
                ]}
              >
                <View style={styles.memberHeaderRow}>
                  <Text style={[styles.memberTitle, { color: t.textMain }]}>
                    👤 {int.nombre}
                  </Text>
                  <View style={styles.memberRolesRow}>
                    {int.roles.map((r, i) => (
                      <Text
                        key={i}
                        style={[styles.memberRoleTag, { color: t.primary }]}
                      >
                        {r}
                      </Text>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.modifyRoleBtn,
                    { borderColor: t.border, backgroundColor: t.cardBg },
                  ]}
                  onPress={() => abrirModalRoles(int)}
                >
                  <Text
                    style={[styles.modifyRoleBtnText, { color: t.textSub }]}
                  >
                    ⚙️ Modificar roles de este integrante
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            {integranteEditando && (
              <View
                style={[
                  styles.editModalContainer,
                  { backgroundColor: t.cardBg, borderColor: t.primary },
                ]}
              >
                <Text
                  style={[
                    styles.cardTitle,
                    { color: t.textMain, fontSize: 16, marginBottom: 12 },
                  ]}
                >
                  Modificar roles de {integranteEditando.nombre}
                </Text>

                <Text
                  style={[
                    styles.inputLabel,
                    { color: t.textSub, marginBottom: 8 },
                  ]}
                >
                  Selecciona los roles activos:
                </Text>

                <View style={styles.chipsRow}>
                  {rolesDisponiblesGeneral.map((rol) => {
                    const activo = rolesSeleccionadosEdit.includes(rol);
                    return (
                      <TouchableOpacity
                        key={rol}
                        style={[
                          styles.chip,
                          { backgroundColor: t.bg, borderColor: t.border },
                          activo && {
                            backgroundColor: t.primary,
                            borderColor: t.primary,
                          },
                        ]}
                        onPress={() => {
                          if (activo) {
                            setRolesSeleccionadosEdit(
                              rolesSeleccionadosEdit.filter((r) => r !== rol)
                            );
                          } else {
                            setRolesSeleccionadosEdit([
                              ...rolesSeleccionadosEdit,
                              rol,
                            ]);
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            { color: t.textMain },
                            activo && { color: "#FFFFFF", fontWeight: "bold" },
                          ]}
                        >
                          {rol}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      { flex: 1, backgroundColor: t.primary },
                    ]}
                    onPress={guardarRolesIntegrante}
                  >
                    <Text style={styles.loginButtonText}>Guardar Cambios</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      { flex: 1, backgroundColor: "#EF4444" },
                    ]}
                    onPress={() => setIntegranteEditando(null)}
                  >
                    <Text style={styles.loginButtonText}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {pestana === "repertorio" && (
          <>
            {cancionEditando ? (
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
                    { color: t.textMain, fontSize: 16, marginBottom: 12 },
                  ]}
                >
                  ✏️ Editando: {cancionEditando.titulo}
                </Text>

                <Text style={[styles.inputLabel, { color: t.textSub }]}>
                  Título
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
                  value={editTitulo}
                  onChangeText={setEditTitulo}
                />

                <Text style={[styles.inputLabel, { color: t.textSub }]}>
                  Artista o autor
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
                  value={editArtista}
                  onChangeText={setEditArtista}
                />

                <Text style={[styles.inputLabel, { color: t.textSub }]}>
                  Tonalidad original
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
                  value={editTono}
                  onChangeText={setEditTono}
                />

                <Text style={[styles.inputLabel, { color: t.textSub }]}>
                  Letra con acordes [G]
                </Text>
                <TextInput
                  style={[
                    styles.loginInputArea,
                    {
                      backgroundColor: t.bg,
                      borderColor: t.border,
                      color: t.textMain,
                    },
                  ]}
                  multiline={true}
                  numberOfLines={5}
                  value={editLetra}
                  onChangeText={setEditLetra}
                />

                <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      { flex: 1, backgroundColor: t.primary },
                    ]}
                    onPress={guardarCambiosCancion}
                  >
                    <Text style={styles.loginButtonText}>Guardar Cambios</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      { flex: 1, backgroundColor: "#EF4444" },
                    ]}
                    onPress={() => setCancionEditando(null)}
                  >
                    <Text style={styles.loginButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View
                style={[
                  styles.card,
                  { backgroundColor: t.cardBg, borderColor: t.border },
                ]}
              >
                <Text
                  style={[
                    styles.cardTitle,
                    { color: t.textMain, fontSize: 16, marginBottom: 12 },
                  ]}
                >
                  Nueva canción para {sedeActual}
                </Text>

                <Text style={[styles.inputLabel, { color: t.textSub }]}>
                  Título
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
                  placeholder="Ej. Cuán Grande es Él"
                  placeholderTextColor={t.textSub}
                  value={nuevoTituloCancion}
                  onChangeText={setNuevoTituloCancion}
                />

                <Text style={[styles.inputLabel, { color: t.textSub }]}>
                  Artista o autor
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
                  placeholder="Ej. Espíritu y Verdad"
                  placeholderTextColor={t.textSub}
                  value={nuevoArtistaCancion}
                  onChangeText={setNuevoArtistaCancion}
                />

                <Text style={[styles.inputLabel, { color: t.textSub }]}>
                  Tonalidad original
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
                  placeholder="Ej. G"
                  placeholderTextColor={t.textSub}
                  value={nuevoTonoCancion}
                  onChangeText={setNuevoTonoCancion}
                />

                <Text style={[styles.inputLabel, { color: t.textSub }]}>
                  Letra con acordes [G]
                </Text>
                <TextInput
                  style={[
                    styles.loginInputArea,
                    {
                      backgroundColor: t.bg,
                      borderColor: t.border,
                      color: t.textMain,
                    },
                  ]}
                  placeholder="Escribe la letra e incluye acordes entre corchetes..."
                  placeholderTextColor={t.textSub}
                  multiline={true}
                  numberOfLines={4}
                  value={nuevaLetraCancion}
                  onChangeText={setNuevaLetraCancion}
                />

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    { backgroundColor: t.primary, marginTop: 8 },
                  ]}
                  onPress={guardarNuevaCancion}
                >
                  <Text style={styles.loginButtonText}>Guardar canción</Text>
                </TouchableOpacity>
              </View>
            )}

            <View
              style={[
                styles.card,
                { backgroundColor: t.cardBg, borderColor: t.border },
              ]}
            >
              <Text
                style={[
                  styles.cardTitle,
                  { color: t.textMain, fontSize: 16, marginBottom: 12 },
                ]}
              >
                Repertorio de {sedeActual} ({repertorio.length})
              </Text>

              {repertorio.map((cancion) => (
                <TouchableOpacity
                  key={cancion.id}
                  style={[
                    styles.songItemRow,
                    { backgroundColor: t.bg, borderColor: t.border },
                  ]}
                  onPress={() => seleccionarCancionParaEditar(cancion)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitle, { color: t.textMain }]}>
                      {cancion.titulo}
                    </Text>
                    <Text style={[styles.itemSub, { color: t.textSub }]}>
                      {cancion.artista} • Tono: {cancion.tono} (Toca para
                      editar)
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => eliminarCancion(cancion.id)}
                    style={styles.trashBtn}
                  >
                    <Text style={{ fontSize: 18 }}>🗑️</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {pestana === "atril" && (
          <View
            style={[
              styles.card,
              { backgroundColor: t.cardBg, borderColor: t.border },
            ]}
          >
            <Text
              style={[
                styles.cardTitle,
                { color: t.textMain, fontSize: 18, marginBottom: 12 },
              ]}
            >
              {repertorio[0]?.titulo || "creo en ti"}
            </Text>

            <Text style={[styles.inputLabel, { color: t.textSub }]}>
              Acordes escritos en {repertorio[0]?.tono || "C"}
            </Text>

            <View
              style={[
                styles.atrilSwitchRow,
                { backgroundColor: t.bg, borderColor: t.border },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.atrilSwitchBtn,
                  tipoAcordeAtril === "Acordes" && {
                    backgroundColor: t.primary,
                  },
                ]}
                onPress={() => setTipoAcordeAtril("Acordes")}
              >
                <Text
                  style={[
                    styles.atrilSwitchText,
                    tipoAcordeAtril === "Acordes" && {
                      color: "#FFFFFF",
                      fontWeight: "bold",
                    },
                  ]}
                >
                  Acordes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.atrilSwitchBtn,
                  tipoAcordeAtril === "Nashville" && {
                    backgroundColor: t.primary,
                  },
                ]}
                onPress={() => setTipoAcordeAtril("Nashville")}
              >
                <Text
                  style={[
                    styles.atrilSwitchText,
                    tipoAcordeAtril === "Nashville" && {
                      color: "#FFFFFF",
                      fontWeight: "bold",
                    },
                  ]}
                >
                  Nashville
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.harmonicCard,
                { backgroundColor: t.bg, borderColor: t.border },
              ]}
            >
              <Text style={[styles.harmonicTitle, { color: t.textMain }]}>
                🎵 ANÁLISIS ARMÓNICO
              </Text>
              <Text style={[styles.harmonicSub, { color: t.textSub }]}>
                Acordes escritos (en detectado):{" "}
                <Text style={{ color: t.primary, fontWeight: "bold" }}>
                  {repertorio[0]?.tono || "C"}
                </Text>
              </Text>
              <Text
                style={[
                  styles.harmonicSub,
                  { color: t.textMain, fontWeight: "bold", marginTop: 6 },
                ]}
              >
                Acordes prestados
              </Text>
              <Text style={{ color: "#EF4444", fontSize: 11, marginTop: 2 }}>
                • A/C# III/bVI — dominante secundario (V/vi)
              </Text>
              <Text style={{ color: "#EF4444", fontSize: 11, marginTop: 2 }}>
                • G/B II/#IV — dominante secundario (V/V)
              </Text>
              <Text style={{ color: "#EF4444", fontSize: 11, marginTop: 2 }}>
                • Estribillo V/estribillo — dominante secundario (V/iii)
              </Text>
              <Text
                style={{
                  color: "#F59E0B",
                  fontSize: 10,
                  fontStyle: "italic",
                  marginTop: 6,
                }}
              >
                ⚠️ Se detectaron acordes fuera de la tonalidad principal.
              </Text>
            </View>

            <View
              style={[
                styles.transposeContainer,
                { backgroundColor: t.bg, borderColor: t.border },
              ]}
            >
              <Text style={[styles.transposeLabel, { color: t.textMain }]}>
                Tono: {repertorio[0]?.tono || "C"} (
                {transposicion >= 0 ? "+" + transposicion : transposicion})
              </Text>
              <View style={styles.transposeActions}>
                <TouchableOpacity
                  style={[
                    styles.transBtn,
                    { backgroundColor: t.cardBg, borderColor: t.border },
                  ]}
                  onPress={() => setTransposicion(transposicion - 1)}
                >
                  <Text style={{ color: t.textMain, fontWeight: "bold" }}>
                    -
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.transBtn,
                    { backgroundColor: t.cardBg, borderColor: t.border },
                  ]}
                  onPress={() => setTransposicion(transposicion + 1)}
                >
                  <Text style={{ color: t.textMain, fontWeight: "bold" }}>
                    +
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.resetBtn,
                    { backgroundColor: t.cardBg, borderColor: t.border },
                  ]}
                  onPress={() => setTransposicion(0)}
                >
                  <Text
                    style={{
                      color: t.textSub,
                      fontSize: 11,
                      fontWeight: "bold",
                    }}
                  >
                    Reset
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={[
                styles.lyricContainer,
                { backgroundColor: t.bg, borderColor: t.border },
              ]}
            >
              <Text style={[styles.lyricText, { color: t.textMain }]}>
                {repertorio[0]?.letra || "Sin letra registrada."}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.navBar,
          { backgroundColor: t.cardBg, borderTopColor: t.border },
        ]}
      >
        {[
          { key: "inicio", icon: "🏠", label: "Inicio" },
          { key: "eventos", icon: "📅", label: "Eventos" },
          { key: "equipo", icon: "👥", label: "Equipo" },
          { key: "repertorio", icon: "🎵", label: "Repertorio" },
          { key: "atril", icon: "📜", label: "Atril" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.navItem}
            onPress={() => setPestana(tab.key)}
          >
            <Text style={styles.navIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.navLabel,
                { color: t.textSub },
                pestana === tab.key && { color: t.primary, fontWeight: "bold" },
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
  container: { flex: 1, height: "100vh", width: "100%" },
  loginContainer: {
    flex: 1,
    height: "100vh",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loginCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  loginSubtitle: { fontSize: 14, marginBottom: 24, textAlign: "center" },
  loginLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  loginInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  loginInputArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  loginButton: { borderRadius: 8, paddingVertical: 14, alignItems: "center" },
  loginButtonText: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },
  header: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  headerSubtitle: { fontSize: 11, marginTop: 1 },
  sedeBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  sedeBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 11 },
  logoutBtn: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  logoutBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 11 },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    gap: 4,
    flexWrap: "wrap",
  },
  themeLabel: { fontSize: 11, fontWeight: "bold", marginRight: 2 },
  themeBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  themeText: { fontSize: 10 },
  content: { flex: 1, padding: 12 },
  welcomeBanner: { borderRadius: 10, padding: 16, marginBottom: 12 },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  welcomeBannerText: { fontSize: 12, color: "#E2E8F0" },
  card: { borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1 },
  cardTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  teamSubtitle: { fontSize: 11, marginBottom: 12, fontStyle: "italic" },
  memberCard: { borderRadius: 8, padding: 10, marginBottom: 8, borderWidth: 1 },
  memberHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 8,
  },
  memberTitle: { fontSize: 13, fontWeight: "bold" },
  memberRolesRow: { flexDirection: "row", gap: 4, flexWrap: "wrap" },
  memberRoleTag: { fontSize: 11, fontWeight: "600" },
  modifyRoleBtn: {
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: "center",
    borderWidth: 1,
  },
  modifyRoleBtnText: { fontSize: 11, fontWeight: "bold" },
  editModalContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  statsRow: { flexDirection: "row", justifyContent: "space-between", gap: 6 },
  statBox: {
    flex: 1,
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  statNumber: { fontSize: 16, fontWeight: "bold" },
  statLabel: { fontSize: 10, marginTop: 2 },
  eventCard: { padding: 10, borderRadius: 6, borderWidth: 1 },
  eventCardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  eventMainTitle: { fontSize: 15, fontWeight: "bold" },
  eventSubDate: { fontSize: 11, marginBottom: 8 },
  editServiceBtn: {
    backgroundColor: "#FEF08A",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#CA8A04",
  },
  deleteServiceBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#EF4444",
  },

  paletaSectionContainer: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
  },
  paletaHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  paletaSectionTitle: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  paletaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  paletaCard: {
    width: "23.5%",
    aspectRatio: 1.3,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  paletaCardSelected: { borderColor: "#3B82F6", borderWidth: 2 },
  paletaImage: { width: "100%", height: "100%", position: "absolute" },
  swatchContainerOverlay: {
    position: "absolute",
    bottom: 4,
    right: 4,
    flexDirection: "column",
    gap: 2,
  },
  swatchMini: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  checkIconBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  paletaFooterHint: {
    color: "#8D99AE",
    fontSize: 10,
    marginTop: 8,
    fontStyle: "italic",
  },
  paletaPreviewBox: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
  },
  paletaPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  paletaThumbImage: { width: 48, height: 36, borderRadius: 4 },
  paletaSwatchesRow: { flexDirection: "row", gap: 4 },
  swatchBox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },

  setlistContainerBox: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
  },
  setlistHeaderBoxText: { fontSize: 10, fontWeight: "bold", marginBottom: 4 },
  setlistItemBoxText: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
  rolesGridRow: { flexDirection: "row", gap: 6, marginBottom: 8 },
  roleBoxHalf: { flex: 1, padding: 8, borderRadius: 6, borderWidth: 1 },
  roleBoxTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 4 },
  roleBoxText: { fontSize: 11, marginBottom: 2 },
  roleItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  quitarRolBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  obsContainerBox: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 12,
  },
  obsHeaderBoxText: { fontSize: 11, fontWeight: "bold", marginBottom: 2 },
  obsContentBoxText: { fontSize: 11 },
  postulateActionBtn: {
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
  },
  whatsappActionBtn: {
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
  },
  eventTitle: { fontSize: 13, fontWeight: "bold", marginBottom: 4 },
  welcomeText: { fontSize: 12 },
  monthsRow: { flexDirection: "row", gap: 6, marginBottom: 10 },
  monthTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 6,
    borderWidth: 1,
  },
  monthText: { fontSize: 12, fontWeight: "bold" },
  monthTextActive: { color: "#FFFFFF" },
  calendarCard: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  calendarHeaderTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  weekHeaderRow: { flexDirection: "row", marginBottom: 4 },
  weekHeaderCell: {
    fontSize: 10,
    width: "14.28%",
    textAlign: "center",
    fontWeight: "bold",
  },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 1,
    borderRadius: 4,
  },
  dayText: { fontSize: 11, fontWeight: "500" },
  dayTextSelected: { fontWeight: "bold", color: "#FFFFFF" },
  serviceSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
    gap: 4,
  },
  serviceSectionTitle: { fontSize: 13, fontWeight: "bold" },
  programBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  programBtnText: { color: "#FFFFFF", fontSize: 11, fontWeight: "bold" },
  inputLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
    marginTop: 4,
  },
  subHeaderLabel: { fontSize: 11, fontWeight: "bold", marginBottom: 4 },
  editSetlistRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 6,
  },
  notaInput: {
    width: 40,
    height: 26,
    borderWidth: 1,
    borderRadius: 4,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
  },
  miniBtn: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4 },
  miniBtnDanger: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4 },
  songLibraryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 4,
  },
  songLibraryText: { fontSize: 12 },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginVertical: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
  },
  itemTitle: { fontSize: 13, fontWeight: "bold" },
  itemSub: { fontSize: 11, marginTop: 1 },
  trashBtn: { paddingHorizontal: 4 },
  closeBtn: { marginTop: 8, alignSelf: "flex-end" },
  closeBtnText: { color: "#EF4444", fontWeight: "bold", fontSize: 11 },
  atrilSwitchRow: {
    flexDirection: "row",
    borderRadius: 6,
    borderWidth: 1,
    padding: 2,
    marginVertical: 6,
  },
  atrilSwitchBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 4,
  },
  atrilSwitchText: { fontSize: 11, color: "#8D99AE" },
  harmonicCard: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    marginVertical: 6,
  },
  harmonicTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 2 },
  harmonicSub: { fontSize: 11 },
  transposeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginVertical: 6,
  },
  transposeLabel: { fontSize: 12, fontWeight: "bold" },
  transposeActions: { flexDirection: "row", gap: 4 },
  transBtn: {
    width: 28,
    height: 28,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resetBtn: {
    paddingHorizontal: 8,
    height: 28,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lyricContainer: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    minHeight: 100,
    marginTop: 6,
  },
  lyricText: {
    fontSize: 13,
    fontFamily: Platform.OS === "web" ? "monospace" : "Courier",
  },
  navBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 6,
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: { alignItems: "center" },
  navIcon: { fontSize: 14, marginBottom: 1 },
  navLabel: { fontSize: 10, fontWeight: "600" },
});
