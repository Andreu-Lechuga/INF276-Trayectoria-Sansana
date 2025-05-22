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

// Función para obtener los colores de departamentos según la carrera
export async function getDepartmentColors(carreraLink: string) {
  try {
    const response = await fetch(`/data/colors_${carreraLink}.json`)
    if (!response.ok) {
      throw new Error(`Error cargando colores: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error cargando colores para ${carreraLink}:`, error)
    return {}
  }
}
