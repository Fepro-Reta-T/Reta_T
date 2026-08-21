from typing import List, Tuple, TypeVar, Optional

T = TypeVar('T')

def generate_round_robin(teams: List[T]) -> List[List[Tuple[Optional[T], Optional[T]]]]:
    """
    Genera un fixture todos-contra-todos (round-robin) usando el Método del Círculo.
    
    Args:
        teams: Lista de equipos (pueden ser strings, diccionarios, objetos UUID, etc.)
        
    Returns:
        Una lista de jornadas (rounds).
        Cada jornada es una lista de partidos representados como tuplas (Local, Visitante).
        Si la cantidad de equipos es impar, el equipo que descansa será emparejado con `None`.
    """
    if not teams:
        return []
        
    # Usamos una copia para no modificar la lista original
    working_teams = teams.copy()
    n = len(working_teams)
    
    # Si hay un número impar de equipos, añadimos un equipo fantasma ('bye')
    if n % 2 != 0:
        working_teams.append(None)  # None significa que el equipo descansa
        n += 1

    rounds = []
    
    # El número total de jornadas será n - 1
    for round_idx in range(n - 1):
        current_round = []
        
        # Emparejamos los equipos (extremos hacia el centro)
        for i in range(n // 2):
            local = working_teams[i]
            visitante = working_teams[n - 1 - i]
            
            # Alternar la localía del equipo fijo (índice 0) para equilibrar los partidos en casa/fuera
            if i == 0 and round_idx % 2 != 0:
                current_round.append((visitante, local))
            else:
                current_round.append((local, visitante))
                
        rounds.append(current_round)
        
        # Rotar los equipos (el índice 0 se queda fijo)
        # El último elemento pasa al índice 1, y el resto se desplaza a la derecha
        working_teams = [working_teams[0]] + [working_teams[-1]] + working_teams[1:-1]
        
    return rounds
