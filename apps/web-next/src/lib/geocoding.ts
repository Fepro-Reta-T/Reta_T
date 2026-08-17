// Resuelve lat/lng a nombre de municipio usando Nominatim (OpenStreetMap)
//  límite de 1 solicitud/segundo

export interface ResultadoGeocodificacion {
  municipio: string;
  direccionFormateada: string;
}

const cache = new Map<string, ResultadoGeocodificacion>();

export async function resolverMunicipio(
  lat: number,
  lng: number
): Promise<ResultadoGeocodificacion> {
  // Generar clave para el caché
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  
  if (cache.has(key)) {
    console.log("📍 Usando caché de geocodificación");
    return cache.get(key)!;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Reta-T-App/1.0 (https://reta-t.com)' // ⚠️ Importante para identificar tu app
      }
    });

    if (!response.ok) {
      throw new Error(`Error al contactar Nominatim: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.address) {
      throw new Error("No se pudo obtener la dirección");
    }

    const address = data.address;
    
    const municipio = 
      address.city || 
      address.town || 
      address.village || 
      address.municipality || 
      address.county ||
      'Desconocido';

    const resultado: ResultadoGeocodificacion = {
      municipio,
      direccionFormateada: data.display_name || `${lat}, ${lng}`,
    };

    cache.set(key, resultado);
    console.log("Municipio resuelto:", resultado.municipio);

    return resultado;
  } catch (error) {
    console.error("Error en geocodificación:", error);
    
    return {
      municipio: "Desconocido",
      direccionFormateada: `${lat}, ${lng}`,
    };
  }
}

export function clearGeocodingCache() {
  cache.clear();
  console.log("Caché de geocodificación limpiado");
}