# Hotel Aurora

Sistema academico de hotel com Node.js, Express, MySQL, frontend em HTML/CSS/JS e testes em Python com Pytest e Selenium.

## Executar

```bash
npm install
npm start
```

O sistema cria automaticamente o banco MySQL `hotel_aurora` e as tabelas ao iniciar.

Configuracao padrao:

```text
host: 127.0.0.1
porta: 3306
usuario: root
senha: vazia
```

## Testes

```bash
pip install -r requirements.txt
python -m pytest -q
```

O Selenium usa o Selenium Manager e abre o navegador visivel por padrao para demonstracao.
