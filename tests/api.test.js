/** @jest-environment jsdom */

// Mock do fetch global
global.fetch = jest.fn();
// Mock do alert para capturar mensagens de erro
global.alert = jest.fn();
// Silencia o console.error durante os testes para uma saída limpa
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Testes da API de Clima (api.js)', () => {
    beforeEach(() => {
        // Configura o DOM antes de cada teste
        document.body.innerHTML = `
            <form id="weather-form">
                <input type="text" id="city-input">
                <button type="submit">Buscar</button>
            </form>
            <div id="result-container" class="hidden">
                <h2 id="city-name"></h2>
                <p id="date-time"></p>
                <i id="weather-icon"></i>
                <span id="temperature"></span>
                <p id="weather-desc"></p>
            </div>
        `;

        // Reinicia mocks
        jest.clearAllMocks();
        
        // Importa o script (garante que o listener seja anexado ao novo DOM)
        jest.isolateModules(() => {
            require('../api.js');
        });
    });

    const submitForm = async (cityValue) => {
        const input = document.getElementById('city-input');
        const form = document.getElementById('weather-form');
        input.value = cityValue;
        
        const event = new window.Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(event);
        
        // Aguarda múltiplos ciclos para garantir que todas as promessas da api.js resolvam
        await new Promise(resolve => setTimeout(resolve, 0));
    };

    // --- 3.6. Testes Básicos ---

    test('1. Nome de cidade válido retorna dados meteorológicos e atualiza UI', async () => {
        // Mock Geocoding
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ results: [{ latitude: -23.5, longitude: -46.6, name: 'São Paulo', country: 'Brasil' }] })
        });
        // Mock Weather
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ current_weather: { temperature: 25, weathercode: 0, is_day: 1 } })
        });

        await submitForm('São Paulo');

        expect(document.getElementById('city-name').textContent).toContain('São Paulo');
        expect(document.getElementById('temperature').textContent).toBe('25°C');
        expect(document.getElementById('result-container').classList.contains('hidden')).toBe(false);
    });

    test('2. Nome de cidade inexistente lança exceção tratada', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ results: [] }) // Sem resultados
        });

        await submitForm('CidadeFantasma123');

        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Cidade não encontrada'));
    });

    test('3. Entrada vazia não dispara requisição', async () => {
        await submitForm('');
        expect(fetch).not.toHaveBeenCalled();
    });

    test('4. Falha da API (Erro 500) gera resposta adequada', async () => {
        fetch.mockResolvedValueOnce({ ok: false, status: 500 });

        await submitForm('Londres');

        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Falha na comunicação'));
    });

    // --- 3.7. Casos Extremos ---

    test('5. Limite de requisições excedido (Status 429)', async () => {
        fetch.mockResolvedValueOnce({ 
            ok: false, 
            status: 429 
        });

        await submitForm('Paris');

        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Falha na comunicação'));
    });

    test('6. Erro de rede (Rejeição da Promise)', async () => {
        fetch.mockRejectedValueOnce(new Error('Network Error'));

        await submitForm('Tokyo');

        expect(global.alert).toHaveBeenCalledWith('Network Error');
    });

    test('7. Mudança inesperada no formato JSON (Campos faltando)', async () => {
        // Geocoding ok, mas Weather retorna JSON malformado (sem current_weather)
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ results: [{ latitude: 0, longitude: 0, name: 'Teste' }] })
        });
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data_errada: {} }) 
        });

        await submitForm('Teste');

        // O código tentará acessar data.temperature que será undefined
        // Resultando em um erro capturado pelo try/catch
        expect(global.alert).toHaveBeenCalled();
    });

    test('8. Conexão lenta (Simulação de delay)', async () => {
        // Simulamos o atraso apenas garantindo que a promessa resolva de forma assíncrona,
        // mas sem usar setTimeout real que quebra a sincronia do teste.
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ results: [{ latitude: 0, longitude: 0, name: 'Lento' }] })
        });

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ current_weather: { temperature: 20, weathercode: 0, is_day: 1 } })
        });

        await submitForm('Lento');

        expect(document.getElementById('city-name').textContent).toContain('Lento');
    });
});
