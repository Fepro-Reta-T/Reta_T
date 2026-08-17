// Representa el JSON exacto que Next.js le enviará a FastAPI
// Ya incluye la geolocalización y la relación resuelta (municipio_id)
export interface CanchaCrearPayload {
  nombre: string;
  direccion: string;
  latitud: number;      // Resuelto en el frontend (mapa)
  longitud: number;     // Resuelto en el frontend (mapa)
  capacidad: number;
  municipio_id: string; // Resuelto mediante el Reverse Geocoding en frontend
}

// Opcional: Payload para actualizar (todo es opcional)
export type CanchaActualizarPayload = Partial<CanchaCrearPayload>;

// Representa el modelo completo que devuelve FastAPI
export interface Cancha {
  id: string;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  capacidad: number;
  municipio_id: string;
  
  // Si tu backend hace un JOIN/relación al devolver los datos,
  // puedes incluir el objeto anidado opcionalmente:
  municipio?: {
    id: string;
    nombre: string;
    estado?: string;
  };
  
  created_at: string;
  updated_at?: string;
}