// Lista de carreras disponibles
export interface Carrera {
  id: number;
  nombre: string;
  link: string;
  codigo?: string;
  activa: boolean;
  maxRav: number;                     // Límite de RAV para esta carrera
}

export const carreras: Carrera[] = [
  {
    id: 1,
    nombre: "Ingeniería Civil Informática",
    link: "INF",
    codigo: "ICI",
    activa: true,
    maxRav: 5
  },
  {
    id: 2,
    nombre: "Licenciatura en Física",
    link: "FIS", 
    codigo: "LIF",
    activa: true,
    maxRav: 5
  },
  {
    id: 3,
    nombre: "Ingeniería Civil Matemática",
    link: "MAT",
    codigo: "ICM",
    activa: true,
    maxRav: 5
  }
];

// Funciones de conversión bidireccional
export const getCarreraById = (id: number): Carrera | undefined => {
  return carreras.find(carrera => carrera.id === id);
};

export const getCarreraByLink = (link: string): Carrera | undefined => {
  return carreras.find(carrera => carrera.link === link);
};

// Conversiones directas
export const linkToId = (link: string): number | undefined => {
  return getCarreraByLink(link)?.id;
};

export const idToLink = (id: number): string | undefined => {
  return getCarreraById(id)?.link;
};

// Utilidades
export const getAllCarreras = (): Carrera[] => carreras;
export const getActiveCarreras = (): Carrera[] => carreras.filter(c => c.activa);
export const getActiveLinks = (): string[] => carreras.filter(c => c.activa).map(c => c.link);
export const getActiveIds = (): number[] => carreras.filter(c => c.activa).map(c => c.id);
