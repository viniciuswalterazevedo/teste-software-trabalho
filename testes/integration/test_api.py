import os
import socket
import subprocess
import time

import pytest
import requests


def free_port():
    sock = socket.socket()
    sock.bind(("127.0.0.1", 0))
    port = sock.getsockname()[1]
    sock.close()
    return port


@pytest.fixture(scope="module")
def server():
    port = free_port()
    env = os.environ.copy()
    env["PORT"] = str(port)
    env["DB_NAME"] = "hotel_aurora_test"
    process = subprocess.Popen(["node", "index.js"], env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    base_url = f"http://127.0.0.1:{port}"

    for _ in range(30):
      try:
        if requests.get(f"{base_url}/api/health", timeout=1).status_code == 200:
          break
      except requests.RequestException:
        time.sleep(0.5)
    else:
      process.terminate()
      raise RuntimeError("Servidor Node nao iniciou para os testes.")

    yield base_url
    process.terminate()
    process.wait(timeout=5)


def test_cadastro_login_reserva_e_cancelamento(server):
    session = requests.Session()
    email = f"cliente{int(time.time())}@email.com"

    created = session.post(
        f"{server}/api/auth/register",
        json={"name": "Cliente Teste", "email": email, "phone": "11999998888", "password": "1234"},
        timeout=5,
    )
    assert created.status_code == 201

    rooms = session.get(f"{server}/api/rooms/search?checkin=2026-06-10&checkout=2026-06-12&guests=2", timeout=5)
    assert rooms.status_code == 200
    assert rooms.json()[0]["slug"] == "standard"

    reservation = session.post(
        f"{server}/api/reservations",
        json={"roomSlug": "standard", "checkin": "2026-06-10", "checkout": "2026-06-12", "guests": 2},
        timeout=5,
    )
    assert reservation.status_code == 201
    code = reservation.json()["code"]
    assert code.startswith("HTL-")

    canceled = session.post(f"{server}/api/reservations/{code}/cancel", timeout=5)
    assert canceled.status_code == 200
    assert "cancelada" in canceled.json()["message"]


def test_rejeita_login_invalido(server):
    response = requests.post(
        f"{server}/api/auth/login",
        json={"email": "invalido", "password": "1234"},
        timeout=5,
    )

    assert response.status_code == 400
    assert response.json()["errors"] == ["Email invalido."]
