// Datos de cursos de Ingeniería Civil Informática
export const cursos = [
  {
    id: 1,
    nombre: "Programación",
    codigo: "IWI-131",
    creditos: 3,
    horas: 5,
    departamento: "FI",
    color: "#8EAAD7", // Color pastel para FI - Fundamentos de Informática
    prerrequisitos: [],
    periodo: "A",
    semestre: 1,
  },
  {
    id: 2,
    nombre: "Matemáticas I",
    codigo: "MAT-021",
    creditos: 5,
    horas: 8,
    departamento: "PC",
    color: "#80C4C8", // Color pastel para PC - Plan Común
    prerrequisitos: [],
    periodo: "A",
    semestre: 1,
  },
  {
    id: 3,
    nombre: "Introducción a la Física",
    codigo: "FIS-100",
    creditos: 3,
    horas: 6,
    departamento: "PC",
    color: "#80C4C8", // Color pastel para PC - Plan Común
    prerrequisitos: [],
    periodo: "A",
    semestre: 1,
  },
  {
    id: 4,
    nombre: "Humanístico I",
    codigo: "HRW-132",
    creditos: 2,
    horas: 3,
    departamento: "HUM",
    color: "#D8DB8E", // Color pastel para HUM - Humanistas, libres y deportes
    prerrequisitos: [],
    periodo: "A",
    semestre: 1,
  },
  {
    id: 5,
    nombre: "Educación Física I",
    codigo: "DEW-100",
    creditos: 1,
    horas: 2,
    departamento: "HUM",
    color: "#D8DB8E", // Color pastel para HUM - Humanistas, libres y deportes
    prerrequisitos: [],
    periodo: "A",
    semestre: 1,
  },
  {
    id: 6,
    nombre: "Química y Sociedad",
    codigo: "QUI-010",
    creditos: 3,
    horas: 5,
    departamento: "PC",
    color: "#80C4C8", // Color pastel para PC - Plan Común
    prerrequisitos: [],
    periodo: "A",
    semestre: 2,
  },
  {
    id: 7,
    nombre: "Matemáticas II",
    codigo: "MAT-022",
    creditos: 5,
    horas: 7,
    departamento: "PC",
    color: "#80C4C8", // Color pastel para PC - Plan Común
    prerrequisitos: [2], // MAT-021
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
    color: "#80C4C8", // Color pastel para PC - Plan Común
    prerrequisitos: [2, 3], // MAT-021, FIS-100
    periodo: "A",
    semestre: 2,
  },
  {
    id: 9,
    nombre: "Introducción a la Ingeniería",
    codigo: "IWG-101",
    creditos: 2,
    horas: 3,
    departamento: "TIN",
    color: "#E5A5B8", // Color pastel para TIN - Transversal e Integración
    prerrequisitos: [],
    periodo: "A",
    semestre: 2,
  },
  {
    id: 10,
    nombre: "Humanístico II",
    codigo: "HRW-133",
    creditos: 2,
    horas: 3,
    departamento: "HUM",
    color: "#D8DB8E", // Color pastel para HUM - Humanistas, libres y deportes
    prerrequisitos: [],
    periodo: "A",
    semestre: 2,
  },
  {
    id: 11,
    nombre: "Educación Física II",
    codigo: "DEW-101",
    creditos: 1,
    horas: 2,
    departamento: "HUM",
    color: "#D8DB8E", // Color pastel para HUM - Humanistas, libres y deportes
    prerrequisitos: [5], // DEW-100
    periodo: "A",
    semestre: 2,
  },
  {
    id: 12,
    nombre: "Estructuras de Datos",
    codigo: "INF-134",
    creditos: 3,
    horas: 5,
    departamento: "FI",
    color: "#8EAAD7", // Color pastel para FI - Fundamentos de Informática
    prerrequisitos: [1], // IWI-131
    periodo: "A",
    semestre: 3,
  },
  {
    id: 13,
    nombre: "Matemáticas III",
    codigo: "MAT-023",
    creditos: 4,
    horas: 7,
    departamento: "PC",
    color: "#80C4C8", // Color pastel para PC - Plan Común
    prerrequisitos: [7], // MAT-022
    periodo: "A",
    semestre: 3,
  },
  {
    id: 14,
    nombre: "Física General III",
    codigo: "FIS-130",
    creditos: 4,
    horas: 8,
    departamento: "PC",
    color: "#80C4C8", // Color pastel para PC - Plan Común
    prerrequisitos: [7, 8], // MAT-022, FIS-110
    periodo: "A",
    semestre: 3,
  },
  {
    id: 15,
    nombre: "Estructuras Discretas",
    codigo: "INF-152",
    creditos: 3,
    horas: 5,
    departamento: "FI",
    color: "#8EAAD7", // Color pastel para FI - Fundamentos de Informática
    prerrequisitos: [1, 2], // IWI-131, MAT-021
    periodo: "A",
    semestre: 3,
  },
  {
    id: 16,
    nombre: "Teoría de Sistemas",
    codigo: "INF-260",
    creditos: 3,
    horas: 5,
    departamento: "SD",
    color: "#D48D8F", // Color pastel para SD - Sistemas de decisión informática
    prerrequisitos: [9], // IWG-101
    periodo: "A",
    semestre: 3,
  },
  {
    id: 17,
    nombre: "Libre I",
    codigo: "INF-1",
    creditos: 1,
    horas: 2,
    departamento: "HUM",
    color: "#D8DB8E", // Color pastel para HUM - Humanistas, libres y deportes
    prerrequisitos: [],
    periodo: "A",
    semestre: 3,
  },
  {
    id: 18,
    nombre: "Lenguajes de Programación",
    codigo: "INF-253",
    creditos: 3,
    horas: 5,
    departamento: "FI",
    color: "#8EAAD7", // Color pastel para FI - Fundamentos de Informática
    prerrequisitos: [12], // INF-134
    periodo: "A",
    semestre: 4,
  },
  {
    id: 19,
    nombre: "Matemáticas IV",
    codigo: "MAT-024",
    creditos: 4,
    horas: 6,
    departamento: "PC",
    color: "#80C4C8", // Color pastel para PC - Plan Común
    prerrequisitos: [13], // MAT-023
    periodo: "A",
    semestre: 4,
  },
  {
    id: 20,
    nombre: "Física General II",
    codigo: "FIS-120",
    creditos: 4,
    horas: 8,
    departamento: "PC",
    color: "#80C4C8", // Color pastel para PC - Plan Común
    prerrequisitos: [7, 8], // MAT-022, FIS-110
    periodo: "A",
    semestre: 4,
  },
  {
    id: 21,
    nombre: "Informática Teórica",
    codigo: "INF-155",
    creditos: 3,
    horas: 5,
    departamento: "FI",
    color: "#8EAAD7", // Color pastel para FI - Fundamentos de Informática
    prerrequisitos: [12, 15], // INF-134, INF-152
    periodo: "A",
    semestre: 4,
  },
  {
    id: 22,
    nombre: "Economía IA",
    codigo: "IWN-170",
    creditos: 3,
    horas: 5,
    departamento: "IND",
    color: "#B5D4E8", // Color pastel para IND - Industrias
    prerrequisitos: [13], // MAT-023
    periodo: "A",
    semestre: 4,
  },
  {
    id: 23,
    nombre: "Libre II",
    codigo: "INF-2",
    creditos: 1,
    horas: 2,
    departamento: "HUM",
    color: "#D8DB8E", // Color pastel para HUM - Humanistas, libres y deportes
    prerrequisitos: [],
    periodo: "A",
    semestre: 4,
  },
  {
    id: 24,
    nombre: "Bases de Datos",
    codigo: "INF-239",
    creditos: 3,
    horas: 5,
    departamento: "IS",
    color: "#FEF28A", // Color pastel para IS - Ingeniería de Software
    prerrequisitos: [12], // INF-134
    periodo: "A",
    semestre: 5,
  },
  {
    id: 25,
    nombre: "Arquitectura y Organización de Computadores",
    codigo: "INF-245",
    creditos: 3,
    horas: 5,
    departamento: "TIC",
    color: "#B8ABD2", // Color pastel para TIC - Infraestructura TIC
    prerrequisitos: [12], // INF-134
    periodo: "A",
    semestre: 5,
  },
  {
    id: 26,
    nombre: "Física General IV",
    codigo: "FIS-140",
    creditos: 4,
    horas: 8,
    departamento: "PC",
    color: "#80C4C8", // Color pastel para PC - Plan Común
    prerrequisitos: [14, 20], // FIS-130, FIS-120
    periodo: "A",
    semestre: 5,
  },
  {
    id: 27,
    nombre: "Estadística Computacional",
    codigo: "INF-280",
    creditos: 3,
    horas: 5,
    departamento: "AN",
    color: "#80D6AE", // Color pastel para AN - Análisis Numérico
    prerrequisitos: [1, 13], // IWI-131, MAT-023
    periodo: "A",
    semestre: 5,
  },
  {
    id: 28,
    nombre: "Organizaciones y Sistemas de Información",
    codigo: "INF-270",
    creditos: 3,
    horas: 5,
    departamento: "SD",
    color: "#D48D8F", // Color pastel para SD - Sistemas de decisión informática
    prerrequisitos: [16], // INF-260
    periodo: "A",
    semestre: 5,
  },
  {
    id: 29,
    nombre: "Libre III",
    codigo: "INF-3",
    creditos: 1,
    horas: 2,
    departamento: "HUM",
    color: "#D8DB8E", // Color pastel para HUM - Humanistas, libres y deportes
    prerrequisitos: [],
    periodo: "A",
    semestre: 5,
  },
  {
    id: 30,
    nombre: "Análisis y Diseño de Software",
    codigo: "INF-236",
    creditos: 3,
    horas: 5,
    departamento: "IS",
    color: "#FEF28A", // Color pastel para IS - Ingeniería de Software
    prerrequisitos: [24, 18], // INF-239, INF-253
    periodo: "A",
    semestre: 6,
  },
  {
    id: 31,
    nombre: "Sistemas Operativos",
    codigo: "INF-246",
    creditos: 3,
    horas: 5,
    departamento: "TIC",
    color: "#B8ABD2", // Color pastel para TIC - Infraestructura TIC
    prerrequisitos: [25], // INF-245
    periodo: "A",
    semestre: 6,
  },
  {
    id: 32,
    nombre: "Ingeniería, Informática y Sociedad",
    codigo: "INF-276",
    creditos: 3,
    horas: 5,
    departamento: "TIN",
    color: "#E5A5B8", // Color pastel para TIN - Transversal e Integración
    prerrequisitos: [28], // INF-270
    periodo: "A",
    semestre: 6,
  },
  {
    id: 33,
    nombre: "Algoritmos y Complejidad",
    codigo: "INF-221",
    creditos: 3,
    horas: 5,
    departamento: "FI",
    color: "#8EAAD7", // Color pastel para FI - Fundamentos de Informática
    prerrequisitos: [15, 18], // INF-152, INF-253
    periodo: "A",
    semestre: 6,
  },
  {
    id: 34,
    nombre: "Optimización",
    codigo: "INF-292",
    creditos: 3,
    horas: 5,
    departamento: "SD",
    color: "#D48D8F", // Color pastel para SD - Sistemas de decisión informática
    prerrequisitos: [1, 13], // IWI-131, MAT-023
    periodo: "A",
    semestre: 6,
  },
  {
    id: 35,
    nombre: "Libre IV",
    codigo: "INF-4",
    creditos: 1,
    horas: 2,
    departamento: "HUM",
    color: "#D8DB8E", // Color pastel para HUM - Humanistas, libres y deportes
    prerrequisitos: [],
    periodo: "A",
    semestre: 6,
  },
  {
    id: 36,
    nombre: "Ingeniería de Software",
    codigo: "INF-225",
    creditos: 3,
    horas: 5,
    departamento: "IS",
    color: "#FEF28A", // Color pastel para IS - Ingeniería de Software
    prerrequisitos: [30], // INF-236
    periodo: "A",
    semestre: 7,
  },
  {
    id: 37,
    nombre: "Redes de Computadores",
    codigo: "INF-256",
    creditos: 3,
    horas: 5,
    departamento: "TIC",
    color: "#B8ABD2", // Color pastel para TIC - Infraestructura TIC
    prerrequisitos: [31], // INF-246
    periodo: "A",
    semestre: 7,
  },
  {
    id: 38,
    nombre: "Información y Matemáticas Financieras",
    codigo: "ICN-270",
    creditos: 3,
    horas: 5,
    departamento: "IND",
    color: "#B5D4E8", // Color pastel para IND - Industrias
    prerrequisitos: [22], // IWN-170
    periodo: "A",
    semestre: 7,
  },
  {
    id: 39,
    nombre: "Computación Científica",
    codigo: "INF-285",
    creditos: 3,
    horas: 5,
    departamento: "AN",
    color: "#80D6AE", // Color pastel para AN - Análisis Numérico
    prerrequisitos: [19, 33], // MAT-024, INF-221
    periodo: "A",
    semestre: 7,
  },
  {
    id: 40,
    nombre: "Investigación de Operaciones",
    codigo: "INF-293",
    creditos: 3,
    horas: 5,
    departamento: "SD",
    color: "#D48D8F", // Color pastel para SD - Sistemas de decisión informática
    prerrequisitos: [27, 34], // INF-280, INF-292
    periodo: "A",
    semestre: 7,
  },
  {
    id: 41,
    nombre: "Libre V",
    codigo: "INF-5",
    creditos: 1,
    horas: 2,
    departamento: "HUM",
    color: "#D8DB8E", // Color pastel para HUM - Humanistas, libres y deportes
    prerrequisitos: [],
    periodo: "A",
    semestre: 7,
  },
  {
    id: 42,
    nombre: "Diseño Interfaces Usuarias",
    codigo: "INF-322",
    creditos: 3,
    horas: 5,
    departamento: "IS",
    color: "#FEF28A", // Color pastel para IS - Ingeniería de Software
    prerrequisitos: [36], // INF-225
    periodo: "P",
    semestre: 8,
  },
  {
    id: 43,
    nombre: "Sistemas Distribuidos",
    codigo: "INF-343",
    creditos: 3,
    horas: 5,
    departamento: "TIC",
    color: "#B8ABD2", // Color pastel para TIC - Infraestructura TIC
    prerrequisitos: [37], // INF-256
    periodo: "A",
    semestre: 8,
  },
  {
    id: 44,
    nombre: "Electivo Informática I",
    codigo: "INF-301",
    creditos: 3,
    horas: 5,
    departamento: "ELEC",
    color: "#FBCA8F", // Color pastel para ELEC - Electivos Informática
    prerrequisitos: [],
    periodo: "P",
    semestre: 8,
  },
  {
    id: 45,
    nombre: "Inteligencia Artificial",
    codigo: "INF-295",
    creditos: 3,
    horas: 5,
    departamento: "AN",
    color: "#80D6AE", // Color pastel para AN - Análisis Numérico
    prerrequisitos: [34, 12], // INF-292, INF-134
    periodo: "A",
    semestre: 8,
  },
  {
    id: 46,
    nombre: "Sistemas de Gestión",
    codigo: "INF-266",
    creditos: 3,
    horas: 5,
    departamento: "SD",
    color: "#D48D8F", // Color pastel para SD - Sistemas de decisión informática
    prerrequisitos: [32], // INF-276
    periodo: "P",
    semestre: 8,
  },
  {
    id: 47,
    nombre: "Libre VI",
    codigo: "INF-6",
    creditos: 1,
    horas: 2,
    departamento: "HUM",
    color: "#D8DB8E", // Color pastel para HUM - Humanistas, libres y deportes
    prerrequisitos: [],
    periodo: "A",
    semestre: 8,
  },
  {
    id: 48,
    nombre: "Electivo Informática II",
    codigo: "INF-302",
    creditos: 3,
    horas: 5,
    departamento: "ELEC",
    color: "#FBCA8F", // Color pastel para ELEC - Electivos Informática
    prerrequisitos: [],
    periodo: "A",
    semestre: 9,
  },
  {
    id: 49,
    nombre: "Electivo Informática III",
    codigo: "INF-303",
    creditos: 3,
    horas: 5,
    departamento: "ELEC",
    color: "#FBCA8F", // Color pastel para ELEC - Electivos Informática
    prerrequisitos: [],
    periodo: "A",
    semestre: 9,
  },
  {
    id: 50,
    nombre: "Electivo I",
    codigo: "INF-311",
    creditos: 3,
    horas: 5,
    departamento: "ELEC",
    color: "#FBCA8F", // Color pastel para ELEC - Electivos Informática
    prerrequisitos: [],
    periodo: "A",
    semestre: 9,
  },
  {
    id: 51,
    nombre: "Electivo II",
    codigo: "INF-312",
    creditos: 3,
    horas: 5,
    departamento: "ELEC",
    color: "#FBCA8F", // Color pastel para ELEC - Electivos Informática
    prerrequisitos: [],
    periodo: "A",
    semestre: 9,
  },
  {
    id: 52,
    nombre: "Gestión de Proyectos de Informática",
    codigo: "INF-360",
    creditos: 3,
    horas: 5,
    departamento: "SD",
    color: "#D48D8F", // Color pastel para SD - Sistemas de decisión informática
    prerrequisitos: [42, 46], // INF-322, INF-266
    periodo: "I",
    semestre: 9,
  },
  {
    id: 53,
    nombre: "Libre VII",
    codigo: "INF-7",
    creditos: 1,
    horas: 2,
    departamento: "HUM",
    color: "#D8DB8E", // Color pastel para HUM - Humanistas, libres y deportes
    prerrequisitos: [],
    periodo: "A",
    semestre: 9,
  },
  {
    id: 54,
    nombre: "Electivo Informática IV",
    codigo: "INF-304",
    creditos: 3,
    horas: 5,
    departamento: "ELEC",
    color: "#FBCA8F", // Color pastel para ELEC - Electivos Informática
    prerrequisitos: [],
    periodo: "A",
    semestre: 10,
  },
  {
    id: 55,
    nombre: "Electivo III",
    codigo: "INF-313",
    creditos: 3,
    horas: 5,
    departamento: "ELEC",
    color: "#FBCA8F", // Color pastel para ELEC - Electivos Informática
    prerrequisitos: [],
    periodo: "A",
    semestre: 10,
  },
  {
    id: 56,
    nombre: "Electivo IV",
    codigo: "INF-314",
    creditos: 3,
    horas: 5,
    departamento: "ELEC",
    color: "#FBCA8F", // Color pastel para ELEC - Electivos Informática
    prerrequisitos: [],
    periodo: "A",
    semestre: 10,
  },
  {
    id: 57,
    nombre: "Taller Desarrollo de Proyecto de Informática",
    codigo: "INF-228",
    creditos: 6,
    horas: 10,
    departamento: "TIN",
    color: "#E5A5B8", // Color pastel para TIN - Transversal e Integración
    prerrequisitos: [52], // INF-360
    periodo: "P",
    semestre: 10,
  },
  {
    id: 58,
    nombre: "Trabajo de Título 1",
    codigo: "INF-309",
    creditos: 1,
    horas: 2,
    departamento: "TIN",
    color: "#E5A5B8", // Color pastel para TIN - Transversal e Integración
    prerrequisitos: [52], // INF-360
    periodo: "A",
    semestre: 10,
  },
  {
    id: 59,
    nombre: "Trabajo de Título 2",
    codigo: "INF-310",
    creditos: 12,
    horas: 20,
    departamento: "TIN",
    color: "#E5A5B8", // Color pastel para TIN - Transversal e Integración
    prerrequisitos: [57, 58], // INF-228, INF-309
    periodo: "A",
    semestre: 11,
  },
]
