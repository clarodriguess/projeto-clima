document.getElementById('weather-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const cityInput = document.getElementById('city-input');
    const city = cityInput.value.trim();
    const resultContainer = document.getElementById('result-container');

    if (!city) return;

    try {
        // 1. Geocoding API - Busca coordenadas e valida nome da cidade
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`);
        
        if (!geoResponse.ok) throw new Error('Falha na comunicação com o serviço de geolocalização.');
        
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('Cidade não encontrada. Verifique a grafia e tente novamente.');
        }

        const { latitude, longitude, name, admin1, country } = geoData.results[0];

        // 2. Weather API - Obtém clima atual com detecção de fuso horário
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`);
        
        if (!weatherResponse.ok) throw new Error('Erro ao buscar dados meteorológicos.');
        
        const weatherData = await weatherResponse.json();

        // 3. Atualizar UI e Temas
        displayWeather(name, admin1, country, weatherData.current_weather);
        updateTheme(weatherData.current_weather.is_day);
        
        resultContainer.classList.remove('hidden');

    } catch (error) {
        console.error('Erro na requisição:', error);
        alert(error.message || 'Erro de rede. Verifique sua conexão.');
    }
});

function displayWeather(city, state, country, data) {
    // Nome da cidade e localização
    document.getElementById('city-name').textContent = `${city}, ${state ? state + ' - ' : ''}${country}`;
    
    // Data e hora completa
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dateElement = document.getElementById('date-time');
    if (dateElement) dateElement.textContent = now.toLocaleDateString('pt-BR', options);

    // Temperatura
    document.getElementById('temperature').textContent = `${Math.round(data.temperature)}°C`;
    
    // Mapeamento de clima e ícones (WMO Codes)
    const weatherMap = {
        0: { desc: 'Céu limpo', icon: data.is_day ? 'wi-day-sunny' : 'wi-night-clear' },
        1: { desc: 'Principalmente limpo', icon: data.is_day ? 'wi-day-cloudy' : 'wi-night-alt-cloudy' },
        2: { desc: 'Parcialmente nublado', icon: data.is_day ? 'wi-day-cloudy' : 'wi-night-alt-cloudy' },
        3: { desc: 'Encoberto', icon: 'wi-cloudy' },
        45: { desc: 'Nevoeiro', icon: 'wi-fog' },
        51: { desc: 'Drizzle leve', icon: 'wi-sprinkle' },
        61: { desc: 'Chuva leve', icon: 'wi-rain' },
        95: { desc: 'Trovoada', icon: 'wi-thunderstorm' }
    };

    const currentCondition = weatherMap[data.weathercode] || { desc: 'Condições atuais', icon: 'wi-na' };
    
    document.getElementById('weather-desc').textContent = currentCondition.desc;
    
    const iconElement = document.getElementById('weather-icon');
    if (iconElement) {
        iconElement.className = `wi ${currentCondition.icon}`;
    }
}

function updateTheme(isDay) {
    if (isDay === 1) {
        document.body.classList.add('day-theme');
        document.body.classList.remove('night-theme');
    } else {
        document.body.classList.add('night-theme');
        document.body.classList.remove('day-theme');
    }
}