import os
import socket
import subprocess
import time

import pytest
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select, WebDriverWait


DEMO_DELAY = float(os.environ.get("SELENIUM_DEMO_DELAY", "0.7"))


def pause():
    if DEMO_DELAY > 0:
        time.sleep(DEMO_DELAY)


def free_port():
    sock = socket.socket()
    sock.bind(("127.0.0.1", 0))
    port = sock.getsockname()[1]
    sock.close()
    return port


@pytest.fixture()
def live_server():
    port = free_port()
    env = os.environ.copy()
    env["PORT"] = str(port)
    env["DB_NAME"] = "hotel_aurora_selenium"
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
        raise RuntimeError("Servidor Node nao iniciou.")

    yield base_url
    process.terminate()
    process.wait(timeout=5)


@pytest.fixture()
def driver():
    attempts = []
    headless = os.environ.get("SELENIUM_HEADLESS") == "1"

    chrome_options = webdriver.ChromeOptions()
    if headless:
        chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    attempts.append(lambda: webdriver.Chrome(options=chrome_options))

    edge_options = webdriver.EdgeOptions()
    if headless:
        edge_options.add_argument("--headless=new")
    attempts.append(lambda: webdriver.Edge(options=edge_options))

    firefox_options = webdriver.FirefoxOptions()
    if headless:
        firefox_options.add_argument("-headless")
    attempts.append(lambda: webdriver.Firefox(options=firefox_options))

    browser = None
    errors = []
    for start_browser in attempts:
        try:
            browser = start_browser()
            break
        except Exception as exc:
            errors.append(str(exc).splitlines()[0])

    if browser is None:
        pytest.skip("Nao foi possivel iniciar Chrome, Edge ou Firefox via Selenium Manager: " + " | ".join(errors))

    browser.set_window_size(1280, 900)
    yield browser
    browser.quit()


@pytest.mark.selenium
def test_fluxo_completo_cliente(driver, live_server):
    wait = WebDriverWait(driver, 10)
    email = f"selenium{int(time.time())}@email.com"

    driver.get(f"{live_server}/cadastro.html")
    pause()
    driver.find_element(By.ID, "name").send_keys("Cliente Selenium")
    driver.find_element(By.ID, "email").send_keys(email)
    driver.find_element(By.ID, "phone").send_keys("11999998888")
    driver.find_element(By.ID, "password").send_keys("1234")
    pause()
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    wait.until(EC.url_contains("home.html"))
    pause()
    driver.get(f"{live_server}/quartos.html")
    pause()
    driver.execute_script("document.getElementById('checkin').value = '2026-06-10'")
    driver.execute_script("document.getElementById('checkout').value = '2026-06-12'")
    Select(driver.find_element(By.ID, "guests")).select_by_value("2")
    pause()
    driver.find_element(By.CSS_SELECTOR, "#searchForm button").click()
    pause()
    wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Reservar"))).click()

    wait.until(EC.url_contains("reserva.html"))
    pause()
    driver.find_element(By.CSS_SELECTOR, "#reservationForm button").click()

    wait.until(EC.url_contains("minhas-reservas.html"))
    pause()
    code_text = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".card strong"))).text
    assert code_text.startswith("HTL-")

    driver.get(f"{live_server}/cancelamento.html?code={code_text}")
    pause()
    driver.find_element(By.CSS_SELECTOR, "#cancelForm button").click()
    pause()
    assert "cancelada" in wait.until(EC.visibility_of_element_located((By.ID, "msg"))).text
