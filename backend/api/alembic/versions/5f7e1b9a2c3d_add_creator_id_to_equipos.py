"""add_creator_id_to_equipos

Revision ID: 5f7e1b9a2c3d
Revises: 48f219b2a10c
Create Date: 2026-08-20 02:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '5f7e1b9a2c3d'
down_revision: Union[str, Sequence[str], None] = '48f219b2a10c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('equipos', sa.Column('creator_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True))


def downgrade() -> None:
    op.drop_column('equipos', 'creator_id')
