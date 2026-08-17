import pytest
from types import SimpleNamespace
from fastapi import HTTPException
from app.core.deps import require_role
from app.models.user import RoleEnum


@pytest.mark.asyncio
async def test_require_role_allows_correct_role():
    role_checker = require_role(RoleEnum.ADMIN)
    fake_user = SimpleNamespace(role=RoleEnum.ADMIN)
    result = await role_checker(current_user=fake_user)
    assert result is fake_user


@pytest.mark.asyncio
async def test_require_role_denies_incorrect_role():
    role_checker = require_role(RoleEnum.ORGANIZER)
    fake_user = SimpleNamespace(role=RoleEnum.PLAYER)
    with pytest.raises(HTTPException) as exc:
        await role_checker(current_user=fake_user)
    assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_require_role_accepts_string_roles():
    role_checker = require_role("viewer", "player")
    fake_user = SimpleNamespace(role=RoleEnum.VIEWER)
    result = await role_checker(current_user=fake_user)
    assert result is fake_user