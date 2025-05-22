// Datos de cursos de Ingeniería Civil Matemática
export const cursos = [
  {
    id: 1,
    nombre: "Matemáticas I",
    codigo: "MAT-021",
    creditos: 5,
    horas: 8,
    departamento: "PC",
    color: "#FFF2B8", // Color pastel para PC - Plan Común
    prerrequisitos: [],
    periodo: "A",
    semestre: 1,
  },
  {
    id: 2,
    nombre: "Programación",
    codigo: "IWI-131",
    creditos: 3,
    horas: 0,
    departamento: "CI",
    color: "#B8E8FF", // Color pastel para CI - Ciencias de Ingeniería
    prerrequisitos: [],
    periodo: "",
    semestre: 1,
  },
  {
    id: 3,
    nombre: "Introducción a la Física",
    codigo: "FIS-100",
    creditos: 3,
    horas: 6,
    departamento: "PC",
    color: "#FFF2B8", // Color pastel para PC - Plan Común
    prerrequisitos: [],
    periodo: "A",
    semestre: 1,
  },
  {
    id: 4,
    nombre: "Introducción a la Ingeniería",
    codigo: "IWG-101",
    creditos: 2,
    horas: 0,
    departamento: "IAA",
    color: "#E8E8E8", // Color pastel para IAA - Ingeniería Aplicada e Integración
    prerrequisitos: [],
    periodo: "",
    semestre: 1,
  },
  {
    id: 5,
    nombre: "Humanístico I",
    codigo: "HRW-101",
    creditos: 2,
    horas: 0,
    departamento: "FC",
    color: "#FFD4B8", // Color pastel para FC - Formación
    prerrequisitos: [],
    periodo: "",
    semestre: 1,
  },
  {
    id: 6,
    nombre: "Educación Física I",
    codigo: "DEW-100",
    creditos: 1,
    horas: 0,
    departamento: "DEW",
    color: "#F0FFB8", // Color pastel para DEW - DEFIDER
    prerrequisitos: [],
    periodo: "",
    semestre: 1,
  },
  {
    id: 7,
    nombre: "Matemáticas II",
    codigo: "MAT-022",
    creditos: 5,
    horas: 7,
    departamento: "PC",
    color: "#FFF2B8", // Color pastel para PC - Plan Común
    prerrequisitos: [1], // MAT-021
    periodo: "A",
    semestre: 2,
  },
  {
    id: 8,
    nombre: "Física General I",
    codigo: "FIS-110",
    creditos: 5,
    horas: 8,
    departamento: "PC",
    color: "#FFF2B8", // Color pastel para PC - Plan Común
    prerrequisitos: [1, 3], // MAT-021, FIS-100
    periodo: "A",
    semestre: 2,
  },
  {
    id: 9,
    nombre: "Química y Sociedad",
    codigo: "QUI-010",
    creditos: 3,
    horas: 0,
    departamento: "PC",
    color: "#FFF2B8", // Color pastel para PC - Plan Común
    prerrequisitos: [],
    periodo: "",
    semestre: 2,
  },
  {
    id: 10,
    nombre: "Humanístico II",
    codigo: "HRW-102",
    creditos: 2,
    horas: 0,
    departamento: "FC",
    color: "#FFD4B8", // Color pastel para FC - Formación
    prerrequisitos: [],
    periodo: "",
    semestre: 2,
  },
]
