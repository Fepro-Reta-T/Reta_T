from app.utils.fixture_generator import (
    generate_round_robin,
    generate_knockout,
    generate_group_stage,
    generate_fixture_for_tournament
)

def test_round_robin_ida():
    teams = ["A", "B", "C", "D"]
    matches = generate_round_robin(teams, modalidad_liga="ida")
    
    # Para 4 equipos, debe haber 6 partidos en total (3 jornadas * 2 partidos)
    assert len(matches) == 6
    
    # Todos los partidos son de fase regular
    for m in matches:
        assert m["fase"] == "fase_regular"
        assert 1 <= m["jornada"] <= 3

def test_round_robin_ida_vuelta():
    teams = ["A", "B", "C", "D"]
    matches = generate_round_robin(teams, modalidad_liga="ida_vuelta")
    
    # Para 4 equipos en ida y vuelta, debe haber 12 partidos (6 de ida, 6 de vuelta)
    assert len(matches) == 12
    
    jornadas = set(m["jornada"] for m in matches)
    assert len(jornadas) == 6

def test_round_robin_odd_teams():
    teams = ["A", "B", "C"]
    matches = generate_round_robin(teams)
    
    # Para 3 equipos, 3 jornadas * 1 partido real por jornada = 3 partidos
    assert len(matches) == 3

def test_knockout_four_teams():
    teams = ["Team 1", "Team 2", "Team 3", "Team 4"]
    matches = generate_knockout(teams, modalidad_ko="partido_unico")
    
    assert len(matches) == 2
    for m in matches:
        assert m["fase"] == "Semifinal"
        assert m["tipo_partido"] == "unico"

def test_knockout_ida_vuelta():
    teams = ["Team 1", "Team 2", "Team 3", "Team 4"]
    matches = generate_knockout(teams, modalidad_ko="ida_vuelta_ko")
    
    # 2 llaves * 2 partidos (ida y vuelta) = 4 partidos
    assert len(matches) == 4
    tipos = [m["tipo_partido"] for m in matches]
    assert tipos.count("ida") == 2
    assert tipos.count("vuelta") == 2

def test_group_stage():
    teams = ["A", "B", "C", "D", "E", "F", "G", "H"]
    matches = generate_group_stage(teams, num_grupos=2, modalidad_liga="ida")
    
    # 8 equipos en 2 grupos = 4 equipos por grupo.
    # Cada grupo tiene 6 partidos -> Total 12 partidos
    assert len(matches) == 12
    
    grupos = set(m["grupo"] for m in matches)
    assert grupos == {"Grupo A", "Grupo B"}

def test_generate_fixture_for_tournament_master():
    teams = ["E1", "E2", "E3", "E4"]

    # Test Liga
    res_liga = generate_fixture_for_tournament(teams, {"tipo_formato": "liga", "modalidad_liga": "ida"})
    assert len(res_liga) == 6

    # Test Eliminación
    res_ko = generate_fixture_for_tournament(teams, {"tipo_formato": "eliminacion", "modalidad_ko": "partido_unico"})
    assert len(res_ko) == 2
    assert res_ko[0]["fase"] == "Semifinal"

    # Test Grupos
    res_grupos = generate_fixture_for_tournament(teams, {"tipo_formato": "grupos_eliminacion", "num_grupos": 2})
    assert len(res_grupos) == 2  # 2 equipos por grupo = 1 partido por grupo * 2 grupos = 2 partidos
    assert "grupo" in res_grupos[0]
