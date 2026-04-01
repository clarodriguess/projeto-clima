document.getElementById('weather-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const city = document.getElementById('city-input').value;
    const resultContainer = document.getElementById('result-container');
    
    try {
        // 1. Geocoding API para transformar nome da cidade em coordenadas
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert('Cidade não encontrada.');
            return;
        }

        const { latitude, longitude, name, admin1, country } = geoData.results[0];

        // 2. Weather API usando as coordenadas obtidas
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const weatherData = await weatherResponse.json();

        // 3. Atualizar a UI
        displayWeather(name, admin1, country, weatherData.current_weather);
        resultContainer.classList.remove('hidden');

    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        alert('Ocorreu um erro ao buscar a previsão.');
    }
});

function displayWeather(city, state, country, data) {
    document.getElementById('city-name').textContent = `${city}, ${state ? state + ' - ' : ''}${country}`;
    document.getElementById('temperature').textContent = `${Math.round(data.temperature)}°C`;
    
    // Mapeamento simples de código de clima (opcional)
    const weatherCodes = { 0: 'Céu limpo', 1: 'Principalmente limpo', 2: 'Parcialmente nublado', 3: 'Encoberto' };
    document.getElementById('weather-desc').textContent = weatherCodes[data.weathercode] || 'Condições atuais';
}

// ### Destaques da Implementação:
// 1.  **Responsividade**: O CSS utiliza `max-width` e unidades relativas para garantir que o layout se ajuste bem tanto em monitores quanto em celulares.
// 2.  **API Open-Meteo**: Como a API de previsão exige coordenadas, adicionei uma chamada prévia à API de Geocoding da própria Open-Meteo. Isso permite que o usuário digite "São Paulo" em vez de números de latitude.
// 3.  **Fetch API**: Utilizei `async/await` para manter o código limpo e legível.

// <!--
// [PROMPT_SUGGESTION]Como posso adicionar ícones climáticos dinâmicos baseados no weathercode da API?[/PROMPT_SUGGESTION]
// [PROMPT_SUGGESTION]Como adicionar uma funcionalidade para mostrar a previsão dos próximos 5 dias?[/PROMPT_SUGGESTION]
// ->