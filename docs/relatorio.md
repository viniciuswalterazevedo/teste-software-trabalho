# Relatorio - Hotel Aurora
### Vinicius Walter Azevedo, Luana Corrêa
## Descricao da aplicacao

O Hotel Aurora e um sistema web academico para uma rede hoteleira. Ele possui home publica, cadastro, login, home apos login, listagem de quartos, criacao de reservas, consulta de minhas reservas, cancelamento e contato.

O backend foi refeito em Node.js com Express e MySQL. As senhas sao salvas como texto simples por se tratar de um trabalho academico, conforme solicitado. O banco e criado automaticamente com tabelas para usuarios, sessoes, quartos, reservas e mensagens de contato.

## Estrutura

- `index.js`: entrada da aplicacao Node.
- `routes/`: rotas de autenticacao, quartos, reservas e contato.
- `utils/`: conexao MySQL, autenticacao e validacoes.
- `public/`: paginas HTML, CSS e JavaScript do frontend.
- `testes/`: testes Python com Pytest e Selenium.

## Tabela de decisao 1 - Cadastro/Login

| Regra | Nome preenchido | Email valido | Telefone valido | Senha >= 4 | Email ja existe | Resultado esperado |
| --- | --- | --- | --- | --- | --- | --- |
| R1 | Sim | Sim | Sim | Sim | Nao | Usuario cadastrado e logado |
| R2 | Nao | Sim | Sim | Sim | Nao | Erro de campos obrigatorios |
| R3 | Sim | Nao | Sim | Sim | Nao | Erro de email invalido |
| R4 | Sim | Sim | Nao | Sim | Nao | Erro de telefone invalido |
| R5 | Sim | Sim | Sim | Nao | Nao | Erro de senha curta |
| R6 | Sim | Sim | Sim | Sim | Sim | Erro de email ja cadastrado |

## Tabela de decisao 2 - Reserva

| Regra | Usuario logado | Check-in preenchido | Check-out > Check-in | Hospedes valido | Capacidade suficiente | Quarto existe | Resultado esperado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R1 | Sim | Sim | Sim | Sim | Sim | Sim | Reserva criada com codigo |
| R2 | Nao | Sim | Sim | Sim | Sim | Sim | Erro solicitando login |
| R3 | Sim | Nao | - | Sim | Sim | Sim | Erro de datas obrigatorias |
| R4 | Sim | Sim | Nao | Sim | Sim | Sim | Erro de periodo invalido |
| R5 | Sim | Sim | Sim | Nao | Sim | Sim | Erro de hospedes invalido |
| R6 | Sim | Sim | Sim | Sim | Nao | Sim | Erro de capacidade excedida |
| R7 | Sim | Sim | Sim | Sim | Sim | Nao | Erro de quarto nao encontrado |

## Testes implementados

### Pytest unitario

Arquivo: `testes/unit/test_validators.py`

Valida funcoes de email, calculo de diarias e regras das tabelas de decisao usando os validadores JavaScript do backend via Node.

### Pytest de integracao

Arquivo: `testes/integration/test_api.py`

Sobe o servidor Node em porta temporaria, usa banco MySQL de teste e valida cadastro, login automatico, busca de quartos, criacao de reserva e cancelamento.

### Selenium WebDriver

Arquivo: `testes/selenium/test_fluxo_interface.py`

Automatiza o fluxo de caixa preta:

1. Cadastro do cliente.
2. Entrada na home apos login.
3. Pesquisa de quartos.
4. Criacao de reserva.
5. Consulta em minhas reservas.
6. Cancelamento da reserva.

## Evidencia

Comando:

```bash
python -m pytest -q
```

Resultado local:

```text
7 passed
```

O teste Selenium executou com Selenium Manager, sem exigir driver configurado manualmente no PATH.
