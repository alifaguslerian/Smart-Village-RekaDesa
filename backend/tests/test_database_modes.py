import os
import subprocess
import sys
from pathlib import Path


def test_production_connection_failure_does_not_fallback_or_log_secret(tmp_path):
    backend_root = Path(__file__).resolve().parents[1]
    env = os.environ.copy()
    env.update({
        "REKADESA_MODE": "production",
        "DATABASE_URL": "invalid+pymysql://operator:topsecret@localhost/rekadesa",
    })
    result = subprocess.run(
        [sys.executable, "-B", "-c", "import app.db.session"],
        cwd=tmp_path,
        env={**env, "PYTHONPATH": str(backend_root)},
        capture_output=True,
        text=True,
    )
    assert result.returncode != 0
    assert "Koneksi database production gagal" in result.stderr
    assert "topsecret" not in result.stderr
    assert not (tmp_path / "rekadesa.db").exists()


def test_production_starts_empty_and_unauthorized_calls_do_not_use_quota(tmp_path):
    backend_root = Path(__file__).resolve().parents[1]
    env = os.environ.copy()
    env.update({
        "REKADESA_MODE": "production",
        "DATABASE_URL": f"sqlite:///{(tmp_path / 'production.db').as_posix()}",
        "OPERATOR_API_KEY": "test-secret-operator-key-32-characters",
        "PYTHONPATH": str(backend_root),
    })
    script = "\n".join([
        "from fastapi.testclient import TestClient",
        "from app.main import app",
        "with TestClient(app) as client:",
        "    assert client.get('/api/villages').json() == []",
        "    for _ in range(31):",
        "        assert client.post('/api/allocate', json={'village_id': 1, 'budget': 0}).status_code == 401",
        "    assert client.post('/api/allocate', json={'village_id': 1, 'budget': 0}, headers={'X-Operator-Key': 'test-secret-operator-key-32-characters'}).status_code == 404",
    ])
    result = subprocess.run([sys.executable, "-B", "-c", script], cwd=tmp_path, env=env, capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
