"""update role_enum: agrega match_manager y viewer, quita spectator

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-26
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Postgres no permite "borrar" un valor de un enum existente directamente — hay que
    # crear el tipo nuevo, migrar la columna con un mapeo explícito, y borrar el tipo viejo.

    op.execute("ALTER TYPE role_enum RENAME TO role_enum_old")

    new_role_enum = sa.Enum(
        "admin", "organizer", "match_manager", "player", "viewer", name="role_enum"
    )
    new_role_enum.create(op.get_bind())

    op.execute("ALTER TABLE users ALTER COLUMN role DROP DEFAULT")
    op.execute(
        """
        ALTER TABLE users
        ALTER COLUMN role TYPE role_enum
        USING (
            CASE role::text
                WHEN 'spectator' THEN 'player'
                ELSE role::text
            END
        )::role_enum
        """
    )
    op.execute("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'player'")
    op.execute("DROP TYPE role_enum_old")


def downgrade() -> None:
    op.execute("ALTER TYPE role_enum RENAME TO role_enum_new")

    old_role_enum = sa.Enum("admin", "organizer", "player", "spectator", name="role_enum")
    old_role_enum.create(op.get_bind())

    op.execute("ALTER TABLE users ALTER COLUMN role DROP DEFAULT")
    op.execute(
        """
        ALTER TABLE users
        ALTER COLUMN role TYPE role_enum
        USING (
            CASE role::text
                WHEN 'match_manager' THEN 'organizer'
                WHEN 'viewer' THEN 'spectator'
                ELSE role::text
            END
        )::role_enum
        """
    )
    op.execute("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'player'")
    op.execute("DROP TYPE role_enum_new")
