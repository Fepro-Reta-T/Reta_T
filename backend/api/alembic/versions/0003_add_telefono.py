"""add telefono to users table

Revision ID: 0003
Revises: 0002
Create Date: 2026-07-30
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add telefono column
    op.add_column("users", sa.Column("telefono", sa.String(length=20), nullable=True))
    op.create_index(op.f("ix_users_telefono"), "users", ["telefono"], unique=True)


def downgrade() -> None:
    # Remove telefono column
    op.drop_index(op.f("ix_users_telefono"), table_name="users")
    op.drop_column("users", "telefono")
