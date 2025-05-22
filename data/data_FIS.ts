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
]
