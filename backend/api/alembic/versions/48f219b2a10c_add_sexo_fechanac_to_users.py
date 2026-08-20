"""add_sexo_fechanac_to_users

Revision ID: 48f219b2a10c
Revises: 37e237e183fe
Create Date: 2026-08-18 18:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '48f219b2a10c'
down_revision: Union[str, Sequence[str], None] = '37e237e183fe'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    sexo_enum = postgresql.ENUM('masculino', 'femenino', 'otro', name='sexo_enum')
    sexo_enum.create(op.get_bind(), checkfirst=True)
    
    op.add_column('users', sa.Column('sexo', sa.Enum('masculino', 'femenino', 'otro', name='sexo_enum'), nullable=True))
    op.add_column('users', sa.Column('fecha_nacimiento', sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'fecha_nacimiento')
    op.drop_column('users', 'sexo')
    sexo_enum = postgresql.ENUM('masculino', 'femenino', 'otro', name='sexo_enum')
    sexo_enum.drop(op.get_bind(), checkfirst=True)
