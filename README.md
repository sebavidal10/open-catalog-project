# open-catalog-project 📚

API estática de libros y películas. Los datos se almacenan en JSON y el catálogo crece automáticamente mediante GitHub Actions cuando alguien abre un Issue.

## Cómo agregar contenido

No necesitas hacer un PR. Basta con abrir un **Issue** con el formato correspondiente y esperar a que un administrador lo apruebe:

- **Para libros:** Título del issue -> `add-book: [ISBN]` (Ej: `add-book: 9780141036144`)
- **Para películas:** Título del issue -> `add-movie: [Título]` (Ej: `add-movie: Inception`)

**Nota:** El bot solo procesará el pedido cuando un administrador añada la etiqueta `approved` al issue.

El bot se encarga de extraer la info de Open Library u OMDb, limpiar los datos y commitear el archivo al repositorio.

---

## Estructura de datos

- `data/books/`: Archivos JSON nombrados por ISBN.
- `data/movies/`: Archivos JSON con nombres en formato slug.

## Setup técnico

### Configuración de la API de Películas

Para que el bot de películas funcione, el repo necesita una clave de OMDb:

1. Genera una en [omdbapi.com](http://www.omdbapi.com/apikey.aspx).
2. Guárdala en los secretos del repo (**Settings > Secrets > Actions**) con el nombre `OMDB_API_KEY`.

### Desarrollo local

```bash
npm install

# Probar extracción de libro
node scripts/fetch-book.js 9780141036144

# Probar extracción de película
OMDB_API_KEY=tu_clave node scripts/fetch-movie.js "Matrix"
```
