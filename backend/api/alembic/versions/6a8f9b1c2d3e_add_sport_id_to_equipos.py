"""add_sport_id_to_equipos

Revision ID: 6a8f9b1c2d3e
Revises: 5f7e1b9a2c3d
Create Date: 2026-08-20 17:48:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '6a8f9b1c2d3e'
down_revision: Union[str, Sequence[str], None] = '5f7e1b9a2c3d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('equipos', sa.Column('sport_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sports.id'), nullable=True))


def downgrade() -> None:
    op.drop_column('equipos', 'sport_id')
