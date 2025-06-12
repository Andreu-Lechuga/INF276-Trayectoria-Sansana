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
  {
    id: 11,
    nombre: "Inglés 1",
    codigo: "HCW-100",
    creditos: 2,
    horas: 0,
    departamento: "ENG",
    color: "#E8B8E8", // Color pastel para ENG - Inglés
    prerrequisitos: [],
    periodo: "",
    semestre: 2,
  },
  {
    id: 12,
    nombre: "Educación Física II",
    codigo: "DEW-101",
    creditos: 1,
    horas: 0,
    departamento: "DEW",
    color: "#F0FFB8", // Color pastel para DEW - DEFIDER
    prerrequisitos: [6], // DEW-100
    periodo: "",
    semestre: 2,
  },
  {
    id: 13,
    nombre: "Matemáticas III",
    codigo: "MAT-023",
    creditos: 4,
    horas: 7,
    departamento: "PC",
    color: "#FFF2B8", // Color pastel para PC - Plan Común
    prerrequisitos: [7], // MAT-022
    periodo: "A",
    semestre: 3,
  },
  {
    id: 14,
    nombre: "Física General II",
    codigo: "FIS-120",
    creditos: 4,
    horas: 8,
    departamento: "PC",
    color: "#FFF2B8", // Color pastel para PC - Plan Común
    prerrequisitos: [7, 8], // MAT-022, FIS-110
    periodo: "A",
    semestre: 3,
  },
  {
    id: 15,
    nombre: "Estructura de Datos y Algoritmos",
    codigo: "ELO-320",
    creditos: 3,
    horas: 0,
    departamento: "CI",
    color: "#B8E8FF", // Color pastel para CI - Ciencias de Ingeniería
    prerrequisitos: [2], // IWI-131
    periodo: "",
    semestre: 3,
  },
  {
    id: 16,
    nombre: "Inglés 2",
    codigo: "HCW-101",
    creditos: 2,
    horas: 0,
    departamento: "ENG",
    color: "#E8B8E8", // Color pastel para ENG - Inglés
    prerrequisitos: [11], // HCW-100
    periodo: "",
    semestre: 3,
  },
  {
    id: 17,
    nombre: "Álgebra Lineal I",
    codigo: "MAT-210",
    creditos: 4,
    horas: 6,
    departamento: "ICMATB",
    color: "#B8E8B8", // Color pastel para ICMATB - Ciencias Basicas ICMAT
    prerrequisitos: [7], // MAT-022
    periodo: "I",
    semestre: 3,
  },
  {
    id: 18,
    nombre: "Introducción a la Matemática Avanzada",
    codigo: "MAT-125",
    creditos: 4,
    horas: 6,
    departamento: "ICMATB",
    color: "#B8E8B8", // Color pastel para ICMATB - Ciencias Basicas ICMAT
    prerrequisitos: [7], // MAT-022
    periodo: "P",
    semestre: 4,
  },
  {
    id: 19,
    nombre: "Probabilidades y Estadística",
    codigo: "MAT-041",
    creditos: 4,
    horas: 0,
    departamento: "CI",
    color: "#B8E8FF", // Color pastel para CI - Ciencias de Ingeniería
    prerrequisitos: [13], // MAT-023
    periodo: "",
    semestre: 4,
  },
  {
    id: 20,
    nombre: "Matemáticas IV",
    codigo: "MAT-024",
    creditos: 4,
    horas: 6,
    departamento: "PC",
    color: "#FFF2B8", // Color pastel para PC - Plan Común
    prerrequisitos: [13], // MAT-023
    periodo: "A",
    semestre: 4,
  },
  {
    id: 21,
    nombre: "Física General III",
    codigo: "FIS-130",
    creditos: 4,
    horas: 8,
    departamento: "PC",
    color: "#FFF2B8", // Color pastel para PC - Plan Común
    prerrequisitos: [7, 8], // MAT-022, FIS-110
    periodo: "A",
    semestre: 4,
  },
  {
    id: 22,
    nombre: "Inglés 3",
    codigo: "HCW-102",
    creditos: 2,
    horas: 0,
    departamento: "ENG",
    color: "#E8B8E8", // Color pastel para ENG - Inglés
    prerrequisitos: [16], // HCW-101
    periodo: "",
    semestre: 4,
  },
  {
    id: 23,
    nombre: "Análisis I",
    codigo: "MAT-225",
    creditos: 4,
    horas: 6,
    departamento: "ICMATB",
    color: "#B8E8B8", // Color pastel para ICMATB - Ciencias Basicas ICMAT
    prerrequisitos: [18, 13], // MAT-125, MAT-023
    periodo: "I",
    semestre: 5,
  },
  {
    id: 24,
    nombre: "Estructuras Algebraicas",
    codigo: "MAT-214",
    creditos: 4,
    horas: 6,
    departamento: "ICMATB",
    color: "#B8E8B8", // Color pastel para ICMATB - Ciencias Basicas ICMAT
    prerrequisitos: [17], // MAT-210
    periodo: "I",
    semestre: 5,
  },
  {
    id: 25,
    nombre: "Física General IV",
    codigo: "FIS-140",
    creditos: 4,
    horas: 8,
    departamento: "PC",
    color: "#FFF2B8", // Color pastel para PC - Plan Común
    prerrequisitos: [21, 14], // FIS-130, FIS-120
    periodo: "A",
    semestre: 5,
  },
  {
    id: 26,
    nombre: "Análisis Numérico I",
    codigo: "MAT-270",
    creditos: 4,
    horas: 0,
    departamento: "CI",
    color: "#B8E8FF", // Color pastel para CI - Ciencias de Ingeniería
    prerrequisitos: [20, 2], // MAT-024, IWI-131
    periodo: "",
    semestre: 5,
  },
  {
    id: 27,
    nombre: "Inglés 4",
    codigo: "HCW-103",
    creditos: 2,
    horas: 0,
    departamento: "ENG",
    color: "#E8B8E8", // Color pastel para ENG - Inglés
    prerrequisitos: [22], // HCW-102
    periodo: "",
    semestre: 5,
  },
  {
    id: 28,
    nombre: "Análisis II",
    codigo: "MAT-226",
    creditos: 4,
    horas: 6,
    departamento: "ICMATB",
    color: "#B8E8B8", // Color pastel para ICMATB - Ciencias Basicas ICMAT
    prerrequisitos: [23], // MAT-225
    periodo: "P",
    semestre: 6,
  },
  {
    id: 29,
    nombre: "Variable Compleja",
    codigo: "MAT-235",
    creditos: 4,
    horas: 5,
    departamento: "ICMATB",
    color: "#B8E8B8", // Color pastel para ICMATB - Ciencias Basicas ICMAT
    prerrequisitos: [20], // MAT-024
    periodo: "P",
    semestre: 6,
  },
  {
    id: 30,
    nombre: "EDO",
    codigo: "MAT-243",
    creditos: 4,
    horas: 6,
    departamento: "ICMATA",
    color: "#E8FFE8", // Color pastel para ICMATA - Ciencias Aplicadas ICMAT
    prerrequisitos: [17, 18], // MAT-210, MAT-125
    periodo: "P",
    semestre: 6,
  },
  {
    id: 31,
    nombre: "Laboratorio de Modelación I",
    codigo: "MAT-282",
    creditos: 3,
    horas: 6,
    departamento: "IAA",
    color: "#E8E8E8", // Color pastel para IAA - Ingeniería Aplicada e Integración
    prerrequisitos: [26, 15, 19], // MAT-270, ELO-320, MAT-041
    periodo: "P",
    semestre: 6,
  },
  {
    id: 32,
    nombre: "Fund. Investigaciones Operaciones",
    codigo: "ILI-281",
    creditos: 3,
    horas: 0,
    departamento: "CI",
    color: "#B8E8FF", // Color pastel para CI - Ciencias de Ingeniería
    prerrequisitos: [19], // MAT-041
    periodo: "",
    semestre: 6,
  },
  {
    id: 33,
    nombre: "Análisis III",
    codigo: "MAT-277",
    creditos: 4,
    horas: 6,
    departamento: "ICMATB",
    color: "#B8E8B8", // Color pastel para ICMATB - Ciencias Basicas ICMAT
    prerrequisitos: [28], // MAT-226
    periodo: "I",
    semestre: 7,
  },
  {
    id: 34,
    nombre: "Análisis Numérico II",
    codigo: "MAT-274",
    creditos: 4,
    horas: 5,
    departamento: "ICMATA",
    color: "#E8FFE8", // Color pastel para ICMATA - Ciencias Aplicadas ICMAT
    prerrequisitos: [26], // MAT-270
    periodo: "I",
    semestre: 7,
  },
  {
    id: 35,
    nombre: "Teo. de Prob. y Proc. Estocásticos",
    codigo: "MAT-263",
    creditos: 4,
    horas: 6,
    departamento: "ICMATA",
    color: "#E8FFE8", // Color pastel para ICMATA - Ciencias Aplicadas ICMAT
    prerrequisitos: [28, 19], // MAT-226, MAT-041
    periodo: "I",
    semestre: 7,
  },
  {
    id: 36,
    nombre: "Electivo de Ingeniería 1",
    codigo: "EI-1",
    creditos: 3,
    horas: 0,
    departamento: "ELI",
    color: "#B8C8E8", // Color pastel para ELI - Electivo de Ingeniería
    prerrequisitos: [],
    periodo: "",
    semestre: 7,
  },
  {
    id: 37,
    nombre: "Electivo de Gestión 1",
    codigo: "EG-1",
    creditos: 3,
    horas: 0,
    departamento: "ELG",
    color: "#FFB8B8", // Color pastel para ELG - Electivo de Gestión
    prerrequisitos: [],
    periodo: "",
    semestre: 7,
  },
  {
    id: 38,
    nombre: "Optimización no Lineal",
    codigo: "MAT-279",
    creditos: 4,
    horas: 0,
    departamento: "ICMATA",
    color: "#E8FFE8", // Color pastel para ICMATA - Ciencias Aplicadas ICMAT
    prerrequisitos: [32, 23], // ILI-281, MAT-225
    periodo: "",
    semestre: 8,
  },
  {
    id: 39,
    nombre: "EDP",
    codigo: "MAT-247",
    creditos: 4,
    horas: 6,
    departamento: "ICMATA",
    color: "#E8FFE8", // Color pastel para ICMATA - Ciencias Aplicadas ICMAT
    prerrequisitos: [29, 33, 30], // MAT-235, MAT-277, MAT-243
    periodo: "P",
    semestre: 8,
  },
  {
    id: 40,
    nombre: "Inferencia Estadística",
    codigo: "MAT-206",
    creditos: 4,
    horas: 5,
    departamento: "ICMATA",
    color: "#E8FFE8", // Color pastel para ICMATA - Ciencias Aplicadas ICMAT
    prerrequisitos: [35], // MAT-263
    periodo: "P",
    semestre: 8,
  },
  {
    id: 41,
    nombre: "Aplic. Matemática Ingeniería",
    codigo: "MAT-281",
    creditos: 3,
    horas: 4,
    departamento: "IAA",
    color: "#E8E8E8", // Color pastel para IAA - Ingeniería Aplicada e Integración
    prerrequisitos: [15, 23, 26], // ELO-320, MAT-225, MAT-270
    periodo: "P",
    semestre: 8,
  },
  {
    id: 42,
    nombre: "Electivo de Ingeniería 2",
    codigo: "EI-2",
    creditos: 3,
    horas: 0,
    departamento: "ELI",
    color: "#B8C8E8", // Color pastel para ELI - Electivo de Ingeniería
    prerrequisitos: [],
    periodo: "",
    semestre: 8,
  },
  {
    id: 43,
    nombre: "Optimización y Control",
    codigo: "MAT-379",
    creditos: 4,
    horas: 5,
    departamento: "ICMATA",
    color: "#E8FFE8", // Color pastel para ICMATA - Ciencias Aplicadas ICMAT
    prerrequisitos: [28, 30], // MAT-226, MAT-243
    periodo: "I",
    semestre: 9,
  },
  {
    id: 44,
    nombre: "Matemática Discreta",
    codigo: "MAT-215",
    creditos: 4,
    horas: 5,
    departamento: "ICMATA",
    color: "#E8FFE8", // Color pastel para ICMATA - Ciencias Aplicadas ICMAT
    prerrequisitos: [24], // MAT-214
    periodo: "I",
    semestre: 9,
  },
  {
    id: 45,
    nombre: "Análisis Numérico de EDP",
    codigo: "MAT-227",
    creditos: 4,
    horas: 5,
    departamento: "ICMATA",
    color: "#E8FFE8", // Color pastel para ICMATA - Ciencias Aplicadas ICMAT
    prerrequisitos: [39, 34], // MAT-247, MAT-274
    periodo: "I",
    semestre: 9,
  },
  {
    id: 46,
    nombre: "Electivo de Ingeniería 3",
    codigo: "EI-3",
    creditos: 3,
    horas: 0,
    departamento: "ELI",
    color: "#B8C8E8", // Color pastel para ELI - Electivo de Ingeniería
    prerrequisitos: [],
    periodo: "",
    semestre: 9,
  },
  {
    id: 47,
    nombre: "Electivo de Gestión 2",
    codigo: "EG-2",
    creditos: 3,
    horas: 0,
    departamento: "ELG",
    color: "#FFB8B8", // Color pastel para ELG - Electivo de Gestión
    prerrequisitos: [],
    periodo: "",
    semestre: 9,
  },
  {
    id: 48,
    nombre: "Electivo Proyectos de Ingeniería",
    codigo: "EP",
    creditos: 3,
    horas: 0,
    departamento: "IAA",
    color: "#E8E8E8", // Color pastel para IAA - Ingeniería Aplicada e Integración
    prerrequisitos: [],
    periodo: "",
    semestre: 10,
  },
  {
    id: 49,
    nombre: "Electivo de Ingeniería 4",
    codigo: "EI-4",
    creditos: 3,
    horas: 0,
    departamento: "ELI",
    color: "#B8C8E8", // Color pastel para ELI - Electivo de Ingeniería
    prerrequisitos: [],
    periodo: "",
    semestre: 10,
  },
  {
    id: 50,
    nombre: "Electivo de Ingeniería 5",
    codigo: "EI-5",
    creditos: 3,
    horas: 0,
    departamento: "ELI",
    color: "#B8C8E8", // Color pastel para ELI - Electivo de Ingeniería
    prerrequisitos: [],
    periodo: "",
    semestre: 10,
  },
  {
    id: 51,
    nombre: "Humanístico III",
    codigo: "HRW-103",
    creditos: 2,
    horas: 0,
    departamento: "FC",
    color: "#FFD4B8", // Color pastel para FC - Formación
    prerrequisitos: [],
    periodo: "",
    semestre: 10,
  },
  {
    id: 52,
    nombre: "Electivo de Gestión 3",
    codigo: "EG-3",
    creditos: 3,
    horas: 0,
    departamento: "ELG",
    color: "#FFB8B8", // Color pastel para ELG - Electivo de Gestión
    prerrequisitos: [],
    periodo: "",
    semestre: 10,
  },
  {
    id: 53,
    nombre: "Proyecto de Memoria de Titulo",
    codigo: "MAT-301",
    creditos: 2,
    horas: 0,
    departamento: "IAA",
    color: "#E8E8E8", // Color pastel para IAA - Ingeniería Aplicada e Integración
    prerrequisitos: [],
    periodo: "",
    semestre: 11,
  },
  {
    id: 54,
    nombre: "Laboratorio de Modelación II",
    codigo: "MAT-283",
    creditos: 3,
    horas: 0,
    departamento: "IAA",
    color: "#E8E8E8", // Color pastel para IAA - Ingeniería Aplicada e Integración
    prerrequisitos: [],
    periodo: "",
    semestre: 11,
  },
  {
    id: 55,
    nombre: "Electivo de Ingeniería 6",
    codigo: "EI-6",
    creditos: 3,
    horas: 0,
    departamento: "ELI",
    color: "#B8C8E8", // Color pastel para ELI - Electivo de Ingeniería
    prerrequisitos: [],
    periodo: "",
    semestre: 11,
  },
  {
    id: 56,
    nombre: "Electivo de Formación Complementario",
    codigo: "COM-1",
    creditos: 1,
    horas: 0,
    departamento: "COMP",
    color: "#E8D4B8", // Color pastel para COMP - Complementarios
    prerrequisitos: [],
    periodo: "",
    semestre: 11,
  },
  {
    id: 57,
    nombre: "Electivo de Gestión 4",
    codigo: "EG-4",
    creditos: 3,
    horas: 0,
    departamento: "ELG",
    color: "#FFB8B8", // Color pastel para ELG - Electivo de Gestión
    prerrequisitos: [],
    periodo: "",
    semestre: 11,
  },
  {
    id: 58,
    nombre: "Memoria de Titulo",
    codigo: "MAT-308",
    creditos: 8,
    horas: 0,
    departamento: "IAA",
    color: "#E8E8E8", // Color pastel para IAA - Ingeniería Aplicada e Integración
    prerrequisitos: [],
    periodo: "",
    semestre: 12,
  },
  {
    id: 59,
    nombre: "Electivo de Formación Complementario",
    codigo: "COM-2",
    creditos: 1,
    horas: 0,
    departamento: "COMP",
    color: "#E8D4B8", // Color pastel para COMP - Complementarios
    prerrequisitos: [],
    periodo: "",
    semestre: 12,
  },
]
