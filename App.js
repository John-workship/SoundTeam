<Text style={{ fontSize: 11, color: t.textSub, fontWeight: "bold" }}>Temas:</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                {[
                  { key: "azul", label: "🔵 Azul" },
                  { key: "claro", label: "☀️ Claro" },
                  { key: "oscuro", label: "🌙 Oscuro" },
                  { key: "rosado", label: "🌸 Rosado" },
                  { key: "morado", label: "🟣 Morado" },
                  { key: "esmeralda", label: "🟢 Esmeralda" },
                  { key: "sunset", label: "🌅 Sunset" },
                  { key: "minimal", label: "⬛ Minimal" },
                ].map((itemTema) => {
                  const activo = nombreTema === itemTema.key;
                  return (
                    <TouchableOpacity
                      key={itemTema.key}
                      style={{ paddingVertical: 4, paddingHorizontal: 6, borderRadius: 4, backgroundColor: activo ? t.primary : t.bg, borderWidth: 1, borderColor: t.border }}
                      onPress={() => setNombreTema(itemTema.key)}
                    >
                      <Text style={{ fontSize: 10, color: activo ? "#FFFFFF" : t.textMain, fontWeight: activo ? "bold" : "normal" }}>
                        {itemTema.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={{ fontSize: 11, color: t.textSub, fontWeight: "bold", marginTop: 4 }}>Tapiz:</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                {Object.keys(PAPELES_TAPIZ).map((keyTapiz) => {
                  const activoTapiz = nombreTapiz === keyTapiz;
                  const tapizObj = PAPELES_TAPIZ[keyTapiz];
                  return (
                    <TouchableOpacity
                      key={keyTapiz}
                      style={{ paddingVertical: 4, paddingHorizontal: 6, borderRadius: 4, backgroundColor: activoTapiz ? t.primary : t.bg, borderWidth: 1, borderColor: t.border }}
                      onPress={() => setNombreTapiz(keyTapiz)}
                    >
                      <Text style={{ fontSize: 10, color: activoTapiz ? "#FFFFFF" : t.textMain, fontWeight: activoTapiz ? "bold" : "normal" }}>
                        {tapizObj.nombre}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>