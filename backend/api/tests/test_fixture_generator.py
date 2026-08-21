from app.utils.fixture_generator import generate_round_robin

def test_round_robin_even_teams():
    teams = ["A", "B", "C", "D"]
    rounds = generate_round_robin(teams)
    
    # Para 4 equipos, debe haber 3 jornadas
    assert len(rounds) == 3
    
    # Cada jornada debe tener 2 partidos
    for r in rounds:
        assert len(r) == 2
        
    # Verificar que el equipo A juega exactamente 3 veces
    matches_with_A = sum(
        1 for r in rounds for match in r if "A" in match
    )
    assert matches_with_A == 3
    
    # Verificar que nadie juegue contra sí mismo o contra None
    for r in rounds:
        for t1, t2 in r:
            assert t1 != t2
            assert t1 is not None
            assert t2 is not None

def test_round_robin_odd_teams():
    teams = ["A", "B", "C"]
    rounds = generate_round_robin(teams)
    
    # Para 3 equipos (+1 fantasma), debe haber 3 jornadas
    assert len(rounds) == 3
    
    # En cada jornada, exactamente un equipo debe descansar (emparejado con None)
    for r in rounds:
        assert len(r) == 2
        byes = sum(1 for match in r if match[0] is None or match[1] is None)
        assert byes == 1

def test_round_robin_empty():
    assert generate_round_robin([]) == []

def test_round_robin_one_team():
    rounds = generate_round_robin(["A"])
    # 1 equipo + 1 fantasma = 1 jornada, 1 partido donde descansa
    assert len(rounds) == 1
    assert len(rounds[0]) == 1
    assert "A" in rounds[0][0]
    assert None in rounds[0][0]
