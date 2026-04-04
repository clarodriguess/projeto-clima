# 🌤️ Projeto Clima

Uma aplicação web moderna e responsiva para consulta de previsão do tempo em tempo real, utilizando Vanilla JavaScript e a API gratuita do **Open-Meteo**.

## 🚀 Funcionalidades

- **Busca Inteligente**: Localiza cidades ao redor do mundo através da API de Geocodificação.
- **Dados Precisos**: Exibe temperatura (°C), descrição do clima e data por extenso.
- **Interface Dinâmica**: 
    - **Ícones Adaptativos**: Utiliza a biblioteca *Weather Icons* para representar visualmente o estado do céu.
    - **Temas Automáticos**: O fundo da aplicação muda entre os modos "Dia" e "Noite" baseando-se no horário local da cidade pesquisada.
- **Tratamento de Erros Robusto**: Alertas amigáveis para cidades não encontradas, falhas de conexão ou limites de requisição excedidos.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3 (com Glassmorphism) e JavaScript (ES6+).
- **APIs Externas**:
    - [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)
    - [Open-Meteo Weather Forecast API](https://open-meteo.com/en/docs)
- **Ícones**: [Weather Icons](https://erikflowers.github.io/weather-icons/)
- **Testes**: [Jest](https://jestjs.io/) e [JSDOM](https://github.com/jsdom/jsdom).

## 📦 Como Instalar e Rodar

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/projeto-clima.git
   ```

2. **Instale as dependências de desenvolvimento** (necessário para os testes):
   ```bash
   npm install
   ```

3. **Abrir a aplicação**:
   Basta abrir o arquivo `index.html` diretamente no seu navegador ou utilizar uma extensão como *Live Server* no VS Code.

## 🧪 Executando Testes

O projeto conta com uma suíte de testes unitários que cobrem desde fluxos de sucesso até casos extremos como erros de rede e formatos JSON inesperados.

Para rodar os testes, utilize o comando:
```bash
npm test
```

## 📂 Estrutura do Projeto

```text
projeto-clima/
├── tests/
│   └── api.test.js    # Suíte de testes unitários com Jest
├── api.js             # Lógica de consumo de API e manipulação do DOM
├── index.html         # Estrutura principal da aplicação
├── style.css          # Estilização e definições de temas (dia/noite)
├── package.json       # Configurações de dependências e scripts
└── readme.md          # Documentação do projeto
```

## 📄 Licença

Este projeto está licenciado sob a **Licença ISC**. Consulte o arquivo `LICENSE` para o texto completo em Inglês e Português.

### Atribuições Obrigatórias
De acordo com os termos de uso das ferramentas utilizadas:
- Dados meteorológicos fornecidos por Open-Meteo.com (CC BY 4.0).
- Ícones climáticos por Weather Icons (SIL OFL 1.1/MIT).

---
*Desenvolvido com foco em qualidade de código e experiência do usuário.*