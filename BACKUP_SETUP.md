# Configurar copias de seguridad cifradas de SoundTeam

El workflow `.github/workflows/backup-supabase.yml` genera una copia diaria de la base de datos, la cifra antes de subirla y conserva el archivo cifrado durante 90 días como artefacto de GitHub Actions. No se guarda ningún volcado sin cifrar en GitHub.

## Activación gratuita

En GitHub, abre **Settings → Secrets and variables → Actions → New repository secret** y crea estos dos secretos:

1. `SUPABASE_DB_URL`: cadena de conexión de PostgreSQL obtenida en el proyecto de Supabase desde **Connect → Session pooler**. Usa la cadena del pooler de sesión y añade `sslmode=require` si no aparece. Sustituye la contraseña de ejemplo por la contraseña de base de datos del proyecto. No la publiques ni la envíes por chat.
2. `BACKUP_ENCRYPTION_PASSPHRASE`: frase aleatoria larga, idealmente de 32 caracteres o más. Guárdala también en un gestor de contraseñas o en un lugar seguro fuera de GitHub. Sin ella no se podrán descifrar las copias.

Después, ve a **Actions → Encrypted Supabase backup → Run workflow** para ejecutar la primera copia manual. Si ambos secretos existen, el workflow también se ejecutará diariamente.

## Recuperar una copia

Descarga el artefacto `soundteam-encrypted-db-backup-...` desde la ejecución del workflow. Para descifrarlo en un equipo seguro:

```bash
openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 \
  -pass env:BACKUP_ENCRYPTION_PASSPHRASE \
  -in soundteam.dump.enc -out soundteam.dump
pg_restore --list soundteam.dump
```

Para restaurar, usa una base de datos de destino compatible y revisa el contenido antes de ejecutar `pg_restore`. No restaures sobre producción sin comprobar primero el destino.

**Límites:** los artefactos gratuitos se conservan 90 días. Descarga periódicamente las copias cifradas que quieras conservar más tiempo. Si se pierde la frase de cifrado, los archivos no se pueden recuperar.
