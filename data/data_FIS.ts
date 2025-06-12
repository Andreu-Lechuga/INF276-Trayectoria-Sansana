// Datos de cursos de Licenciatura en Física
export const cursos = [
  {
    id: 1,
    nombre: "Química y Sociedad",
    codigo: "QUI-010",
    creditos: 5,
    horas: 5,
    departamento: "PC",
    color: "#E8C5FF", // Color pastel para PC - Plan Común
    prerrequisitos: [],
    periodo: "",
    semestre: 1,
  },
  {
    id: 2,
    nombre: "Matemáticas I",
    codigo: "MAT-021",
    creditos: 8,
    horas: 8,
    departamento: "MAT",
    color: "#B8C5FF", // Color pastel para MAT - Matemáticas
    prerrequisitos: [],
    periodo: "A",
    semestre: 1,
  },
  {
    id: 3,
    nombre: "Física General I",
    codigo: "FIS-110",
    creditos: 6,
    horas: 6,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [],
    periodo: "A",
    semestre: 1,
  },
  {
    id: 4,
    nombre: "Introducción a la Física Contemporánea",
    codigo: "FIS-106",
    creditos: 7,
    horas: 7,
    departamento: "LIC",
    color: "#C5F7E8", // Color pastel para LIC - Licenciatura
    prerrequisitos: [],
    periodo: "",
    semestre: 1,
  },
  {
    id: 5,
    nombre: "Educación Física I",
    codigo: "DEW-100",
    creditos: 2,
    horas: 2,
    departamento: "DEW",
    color: "#FFB8B8", // Color pastel para DEW - DEFIDER
    prerrequisitos: [],
    periodo: "",
    semestre: 1,
  },
  {
    id: 6,
    nombre: "Programación",
    codigo: "IWI-131",
    creditos: 5,
    horas: 5,
    departamento: "PC",
    color: "#E8C5FF", // Color pastel para PC - Plan Común
    prerrequisitos: [],
    periodo: "",
    semestre: 2,
  },
  {
    id: 7,
    nombre: "Matemáticas II",
    codigo: "MAT-022",
    creditos: 7,
    horas: 7,
    departamento: "MAT",
    color: "#B8C5FF", // Color pastel para MAT - Matemáticas
    prerrequisitos: [2], // MAT-021
    periodo: "A",
    semestre: 2,
  },
  {
    id: 8,
    nombre: "Física General III",
    codigo: "FIS-130",
    creditos: 8,
    horas: 8,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [7, 3], // MAT-022, FIS-110
    periodo: "A",
    semestre: 2,
  },
  {
    id: 9,
    nombre: "Humanístico I",
    codigo: "HRW-1",
    creditos: 3,
    horas: 3,
    departamento: "HUM",
    color: "#FFD4B8", // Color pastel para HUM - Humanistas
    prerrequisitos: [],
    periodo: "",
    semestre: 2,
  },
  {
    id: 10,
    nombre: "Educación Física II",
    codigo: "DEW-101",
    creditos: 2,
    horas: 2,
    departamento: "DEW",
    color: "#FFB8B8", // Color pastel para DEW - DEFIDER
    prerrequisitos: [5], // DEW-100
    periodo: "",
    semestre: 2,
  },
  {
    id: 11,
    nombre: "Instrumentación Científica",
    codigo: "FIS-105",
    creditos: 6,
    horas: 6,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [],
    periodo: "",
    semestre: 2,
  },
  {
    id: 12,
    nombre: "Deportes",
    codigo: "DEW-0",
    creditos: 2,
    horas: 2,
    departamento: "DEW",
    color: "#FFB8B8", // Color pastel para DEW - DEFIDER
    prerrequisitos: [10], // DEW-101
    periodo: "",
    semestre: 3,
  },
  {
    id: 13,
    nombre: "Matemáticas III",
    codigo: "MAT-023",
    creditos: 7,
    horas: 7,
    departamento: "MAT",
    color: "#B8C5FF", // Color pastel para MAT - Matemáticas
    prerrequisitos: [7], // MAT-022
    periodo: "A",
    semestre: 3,
  },
  {
    id: 14,
    nombre: "Física General II",
    codigo: "FIS-120",
    creditos: 8,
    horas: 8,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [7, 3], // MAT-022, FIS-110
    periodo: "A",
    semestre: 3,
  },
  {
    id: 15,
    nombre: "Humanístico II",
    codigo: "HRW-2",
    creditos: 3,
    horas: 3,
    departamento: "HUM",
    color: "#FFD4B8", // Color pastel para HUM - Humanistas
    prerrequisitos: [9], // HRW-1
    periodo: "",
    semestre: 3,
  },
  {
    id: 16,
    nombre: "Inglés I",
    codigo: "HCW-100",
    creditos: 3,
    horas: 3,
    departamento: "IN",
    color: "#C5F5C8", // Color pastel para IN - Inglés
    prerrequisitos: [],
    periodo: "A",
    semestre: 3,
  },
  {
    id: 17,
    nombre: "Física Experimental",
    codigo: "FIS-200",
    creditos: 8,
    horas: 8,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [14, 8, 11], // FIS-120, FIS-130, FIS-105
    periodo: "",
    semestre: 3,
  },
  {
    id: 18,
    nombre: "Mecanica Intermedia I",
    codigo: "FIS-210",
    creditos: 8,
    horas: 8,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [3, 13], // FIS-110, MAT-023
    periodo: "P",
    semestre: 4,
  },
  {
    id: 19,
    nombre: "Matemáticas IV",
    codigo: "MAT-024",
    creditos: 6,
    horas: 6,
    departamento: "MAT",
    color: "#B8C5FF", // Color pastel para MAT - Matemáticas
    prerrequisitos: [13], // MAT-023
    periodo: "A",
    semestre: 4,
  },
  {
    id: 20,
    nombre: "Física General IV",
    codigo: "FIS-140",
    creditos: 8,
    horas: 8,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [8, 14], // FIS-130, FIS-120
    periodo: "A",
    semestre: 4,
  },
  {
    id: 21,
    nombre: "Probabilidad y Estadística",
    codigo: "MAT-041",
    creditos: 7,
    horas: 7,
    departamento: "MAT",
    color: "#B8C5FF", // Color pastel para MAT - Matemáticas
    prerrequisitos: [13], // MAT-023
    periodo: "",
    semestre: 4,
  },
  {
    id: 22,
    nombre: "Inglés II",
    codigo: "HCW-101",
    creditos: 3,
    horas: 3,
    departamento: "IN",
    color: "#C5F5C8", // Color pastel para IN - Inglés
    prerrequisitos: [16], // HCW-100
    periodo: "A",
    semestre: 4,
  },
  {
    id: 23,
    nombre: "Mecánica Intermedia II",
    codigo: "FIS-211",
    creditos: 7,
    horas: 7,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [18], // FIS-210
    periodo: "I",
    semestre: 5,
  },
  {
    id: 24,
    nombre: "Métodos de la Física Matemática",
    codigo: "FIS-245",
    creditos: 7,
    horas: 7,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [19], // MAT-024
    periodo: "I",
    semestre: 5,
  },
  {
    id: 25,
    nombre: "Campos Electromagnéticos I",
    codigo: "FIS-220",
    creditos: 7,
    horas: 7,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [14, 8, 13], // FIS-120, FIS-130, MAT-023
    periodo: "A",
    semestre: 5,
  },
  {
    id: 26,
    nombre: "Termodinámica y Mecánica Estadística",
    codigo: "FIS-230",
    creditos: 7,
    horas: 7,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [20, 13], // FIS-140, MAT-023
    periodo: "A",
    semestre: 5,
  },
  {
    id: 27,
    nombre: "Inglés III",
    codigo: "HCW-102",
    creditos: 3,
    horas: 3,
    departamento: "IN",
    color: "#C5F5C8", // Color pastel para IN - Inglés
    prerrequisitos: [22], // HCW-101
    periodo: "A",
    semestre: 5,
  },
  {
    id: 28,
    nombre: "Física Cuántica I",
    codigo: "FIS-242",
    creditos: 7,
    horas: 7,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [20, 18], // FIS-140, FIS-210
    periodo: "P",
    semestre: 6,
  },
  {
    id: 29,
    nombre: "Física Experimental Avanzada",
    codigo: "FIS-201",
    creditos: 7,
    horas: 7,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [17, 26], // FIS-200, FIS-230
    periodo: "P",
    semestre: 6,
  },
  {
    id: 30,
    nombre: "Campos Electromagnéticos II",
    codigo: "FIS-221",
    creditos: 7,
    horas: 7,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [25], // FIS-220
    periodo: "A",
    semestre: 6,
  },
  {
    id: 31,
    nombre: "Análsis Numérico",
    codigo: "MAT-270",
    creditos: 7,
    horas: 7,
    departamento: "MAT",
    color: "#B8C5FF", // Color pastel para MAT - Matemáticas
    prerrequisitos: [19], // MAT-024
    periodo: "A",
    semestre: 6,
  },
  {
    id: 32,
    nombre: "Inglés IV",
    codigo: "HCW-200",
    creditos: 3,
    horas: 3,
    departamento: "IN",
    color: "#C5F5C8", // Color pastel para IN - Inglés
    prerrequisitos: [27], // HCW-102
    periodo: "A",
    semestre: 6,
  },
  {
    id: 33,
    nombre: "Física Cuántica II",
    codigo: "FIS-243",
    creditos: 4,
    horas: 0,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [20, 28], // FIS-140, FIS-242
    periodo: "",
    semestre: 7,
  },
  {
    id: 34,
    nombre: "El Método Científico",
    codigo: "HAF-101",
    creditos: 3,
    horas: 3,
    departamento: "LIC",
    color: "#C5F7E8", // Color pastel para LIC - Licenciatura
    prerrequisitos: [],
    periodo: "A",
    semestre: 7,
  },
  {
    id: 35,
    nombre: "Física Computacional",
    codigo: "FIS-205",
    creditos: 7,
    horas: 7,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [31], // MAT-270
    periodo: "I",
    semestre: 7,
  },
  {
    id: 36,
    nombre: "Introducción a la Física de Alta Energía",
    codigo: "FIS-270",
    creditos: 7,
    horas: 7,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [],
    periodo: "I",
    semestre: 7,
  },
  {
    id: 37,
    nombre: "Optativo Avanzando I",
    codigo: "FIS-11",
    creditos: 6,
    horas: 6,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [],
    periodo: "",
    semestre: 7,
  },
  {
    id: 38,
    nombre: "Optativo Avanzando II",
    codigo: "FIS-12",
    creditos: 6,
    horas: 6,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [],
    periodo: "",
    semestre: 8,
  },
  {
    id: 39,
    nombre: "Optativo Avanzando III",
    codigo: "FIS-13",
    creditos: 6,
    horas: 6,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [],
    periodo: "",
    semestre: 8,
  },
  {
    id: 40,
    nombre: "Optativo Avanzando IV",
    codigo: "FIS-14",
    creditos: 6,
    horas: 6,
    departamento: "FIS",
    color: "#D4F5A3", // Color pastel para FIS - Física
    prerrequisitos: [],
    periodo: "",
    semestre: 8,
  },
  {
    id: 41,
    nombre: "Introducción a la Física de Materia Condensada",
    codigo: "FIS-251",
    creditos: 7,
    horas: 7,
    departamento: "LIC",
    color: "#C5F7E8", // Color pastel para LIC - Licenciatura
    prerrequisitos: [],
    periodo: "P",
    semestre: 8,
  },
  {
    id: 42,
    nombre: "Seminario de Grado",
    codigo: "FIS-299",
    creditos: 5,
    horas: 5,
    departamento: "LIC",
    color: "#C5F7E8", // Color pastel para LIC - Licenciatura
    prerrequisitos: [],
    periodo: "A",
    semestre: 8,
  },
]
