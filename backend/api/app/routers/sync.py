from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.sport import MatchEvent
from app.schemas.evento import MatchEventCreate

router = APIRouter(prefix="/sync", tags=["Sincronización"])

@router.post("/match-events", status_code=201)
async def sync_match_events(events: list[MatchEventCreate], db: AsyncSession = Depends(get_db)):
    """
    Recibe todos los eventos guardados en el teléfono del árbitro cuando recupera señal.
    Usa client_timestamp para mantener la cronología real del partido.
    """
    try:
        # Convertimos los datos de Pydantic a modelos ORM usando los campos exactos
        db_events = [
            MatchEvent(
                partido_id=event.partido_id,
                event_type_id=event.event_type_id,
                participante_id=event.participante_id,
                client_timestamp=event.client_timestamp,
                meta_data=event.meta_data
            )
            for event in events
        ]
        
        # Los agregamos a la sesión y los guardamos
        db.add_all(db_events)
        await db.commit()
        
        return {"status": "success", "message": f"{len(events)} eventos sincronizados"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))