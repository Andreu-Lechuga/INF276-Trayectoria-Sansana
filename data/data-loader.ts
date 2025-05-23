// Importar todos los módulos de datos estáticamente
import { cursos as cursosINF } from "./data_INF"
import { cursos as cursosFIS } from "./data_FIS"
import { cursos as cursosMAT } from "./data_MAT"

// Función para obtener los datos según la carrera seleccionada
export function getCarreraData(carreraLink: string) {
  switch (carreraLink) {
    case "INF":
      return { cursos: cursosINF }
    case "FIS":
      return { cursos: cursosFIS }
    case "MAT":
      return { cursos: cursosMAT }
    default:
      return { cursos: [] }
  }
}
