from typing import List, Tuple, TypeVar, Optional, Dict, Any
import math

T = TypeVar('T')

def generate_round_robin(
    teams: List[T],
    modalidad_liga: str = "ida"
) -> List[Dict[str, Any]]:
    """
    Genera un fixture todos-contra-todos (round-robin) usando el Método del Círculo.
    
    Args:
        teams: Lista de equipos (IDs, objetos, strings, etc.)
        modalidad_liga: "ida" o "ida_vuelta"
        
    Returns:
        Lista de diccionarios con información del encuentro:
        [{"local": T, "visitante": T, "jornada": int, "fase": "fase_regular"}]
    """
    if not teams:
        return []

    working_teams = teams.copy()
    n = len(working_teams)

    # Si hay un número impar de equipos, añadimos un equipo fantasma ('bye')
    if n % 2 != 0:
        working_teams.append(None)  # None representa descanso
        n += 1

    partidos = []
    num_jornadas_ida = n - 1

    # Fase de Ida
    for round_idx in range(num_jornadas_ida):
        jornada_num = round_idx + 1
        for i in range(n // 2):
            local = working_teams[i]
            visitante = working_teams[n - 1 - i]

            # Alternar localía del equipo fijo (índice 0)
            if i == 0 and round_idx % 2 != 0:
                local, visitante = visitante, local

            if local is not None and visitante is not None:
                partidos.append({
                    "local": local,
                    "visitante": visitante,
                    "jornada": jornada_num,
                    "fase": "fase_regular"
                })

        # Rotar equipos manteniedo el índice 0 fijo
        working_teams = [working_teams[0]] + [working_teams[-1]] + working_teams[1:-1]

    # Fase de Vuelta (si aplica)
    if modalidad_liga == "ida_vuelta":
        partidos_vuelta = []
        for p in partidos:
            partidos_vuelta.append({
                "local": p["visitante"],
                "visitante": p["local"],
                "jornada": p["jornada"] + num_jornadas_ida,
                "fase": "fase_regular"
            })
        partidos.extend(partidos_vuelta)

    return partidos


def _nombre_fase_ko(num_equipos: int) -> str:
    """Retorna el nombre descriptivo de la fase de eliminación según la cantidad de equipos."""
    if num_equipos <= 2:
        return "Final"
    elif num_equipos <= 4:
        return "Semifinal"
    elif num_equipos <= 8:
        return "Cuartos de final"
    elif num_equipos <= 16:
        return "8vos de final"
    else:
        return "16vos de final"


def generate_knockout(
    teams: List[T],
    modalidad_ko: str = "partido_unico",
    tercer_lugar: bool = False
) -> List[Dict[str, Any]]:
    """
    Genera los encuentros para la primera ronda de eliminación directa (Playoffs).
    
    Args:
        teams: Lista de equipos participantes.
        modalidad_ko: "partido_unico" o "ida_vuelta_ko"
        tercer_lugar: Si se incluye metadato para disputar el tercer lugar.
        
    Returns:
        Lista de diccionarios representando los partidos de la primera fase.
    """
    if len(teams) < 2:
        return []

    n = len(teams)
    fase_nombre = _nombre_fase_ko(n)
    working_teams = teams.copy()

    # Si la cantidad de equipos no es par, el último equipo descansa / pasa directo
    partidos = []
    llave_idx = 1
    i = 0

    while i < len(working_teams):
        if i + 1 < len(working_teams):
            local = working_teams[i]
            visitante = working_teams[i + 1]

            partidos.append({
                "local": local,
                "visitante": visitante,
                "fase": fase_nombre,
                "llave": llave_idx,
                "tipo_partido": "ida" if modalidad_ko == "ida_vuelta_ko" else "unico"
            })

            if modalidad_ko == "ida_vuelta_ko":
                partidos.append({
                    "local": visitante,
                    "visitante": local,
                    "fase": fase_nombre,
                    "llave": llave_idx,
                    "tipo_partido": "vuelta"
                })

            llave_idx += 1
            i += 2
        else:
            # Equipo sin pareja pasa automáticamente a la siguiente ronda (bye)
            i += 1

    return partidos


def generate_group_stage(
    teams: List[T],
    num_grupos: int = 2,
    modalidad_liga: str = "ida"
) -> List[Dict[str, Any]]:
    """
    Divide los equipos en N grupos y genera un fixture round-robin dentro de cada grupo.
    
    Args:
        teams: Lista de equipos.
        num_grupos: Número de grupos deseado (2, 4, 8...).
        modalidad_liga: "ida" o "ida_vuelta".
        
    Returns:
        Lista de diccionarios con información del encuentro de fase de grupos.
    """
    if not teams:
        return []

    # Ajustar num_grupos si hay menos equipos que grupos requeridos
    num_grupos_efectivo = max(1, min(num_grupos, len(teams) // 2 or 1))
    
    # Nombres de grupos (Grupo A, Grupo B, Grupo C...)
    nombres_grupos = [f"Grupo {chr(65 + i)}" for i in range(num_grupos_efectivo)]
    
    # Distribuir equipos en grupos en formato serpiente/round robin
    grupos: Dict[str, List[T]] = {g: [] for g in nombres_grupos}
    for idx, team in enumerate(teams):
        grupo_nombre = nombres_grupos[idx % num_grupos_efectivo]
        grupos[grupo_nombre].append(team)

    todos_partidos = []

    for grupo_nombre, equipos_grupo in grupos.items():
        partidos_grupo = generate_round_robin(equipos_grupo, modalidad_liga=modalidad_liga)
        for p in partidos_grupo:
            p["grupo"] = grupo_nombre
            p["fase"] = "fase_grupos"
            todos_partidos.append(p)

    return todos_partidos


def generate_fixture_for_tournament(
    teams: List[T],
    formato: Optional[Dict[str, Any]] = None
) -> List[Dict[str, Any]]:
    """
    Punto de entrada principal para generar el fixture según la modalidad del torneo.
    
    Args:
        teams: Lista de IDs u objetos de equipos inscritos.
        formato: Diccionario de configuración con `tipo_formato`, `modalidad_liga`, etc.
        
    Returns:
        Lista de diccionarios de partidos listos para ser persistidos.
    """
    if not formato:
        formato = {}

    tipo_formato = formato.get("tipo_formato", "liga")
    modalidad_liga = formato.get("modalidad_liga", "ida")
    modalidad_ko = formato.get("modalidad_ko", "partido_unico")
    tercer_lugar = formato.get("tercer_lugar", False)
    num_grupos = formato.get("num_grupos", 2)

    if tipo_formato == "eliminacion":
        return generate_knockout(teams, modalidad_ko=modalidad_ko, tercer_lugar=tercer_lugar)
    elif tipo_formato == "grupos_eliminacion":
        return generate_group_stage(teams, num_grupos=num_grupos, modalidad_liga=modalidad_liga)
    elif tipo_formato == "liga_playoffs":
        # Genera la fase regular de liga primero
        return generate_round_robin(teams, modalidad_liga=modalidad_liga)
    else:  # "liga" o valor por defecto
        return generate_round_robin(teams, modalidad_liga=modalidad_liga)
