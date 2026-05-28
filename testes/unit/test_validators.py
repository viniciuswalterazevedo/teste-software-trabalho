import json
import subprocess


def node_eval(script):
    result = subprocess.run(
        ["node", "-e", script],
        text=True,
        capture_output=True,
        check=True,
    )
    return json.loads(result.stdout)


def test_email_valido_e_invalido():
    result = node_eval(
        """
        const { isEmail } = require('./utils/validators');
        console.log(JSON.stringify({
          valido: isEmail('cliente@email.com'),
          invalido: isEmail('cliente.email.com')
        }));
        """
    )

    assert result == {"valido": True, "invalido": False}


def test_calcula_diarias():
    result = node_eval(
        """
        const { nightsBetween } = require('./utils/validators');
        console.log(JSON.stringify({ nights: nightsBetween('2026-06-10', '2026-06-15') }));
        """
    )

    assert result["nights"] == 5


def test_tabela_decisao_busca_datas_invalidas():
    result = node_eval(
        """
        const { validateSearch } = require('./utils/validators');
        console.log(JSON.stringify(validateSearch({
          checkin: '2026-06-15',
          checkout: '2026-06-10',
          guests: 2
        })));
        """
    )

    assert "Check-out deve ser posterior ao check-in." in result


def test_tabela_decisao_reserva_capacidade_excedida():
    result = node_eval(
        """
        const { validateReservation } = require('./utils/validators');
        console.log(JSON.stringify(validateReservation({
          checkin: '2026-06-10',
          checkout: '2026-06-12',
          guests: 5
        }, { capacity: 2 })));
        """
    )

    assert "Quantidade de hospedes excede a capacidade do quarto." in result
