/**
 * @file api.js
 * @description Módulo responsável pela integração com as APIs Open-Meteo para busca de geolocalização e dados climáticos.
 * @author Gemini Code Assist
 * @version 1.1.0
 */

// Constantes de Configuração
const GEO_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

// Mapeamento de clima e ícones (WMO Codes) definido fora para evitar re-alocação
const WEATHER_CONDITION_MAP = {
    0: { desc: 'Céu limpo', iconDay: 'wi-day-sunny', iconNight: 'wi-night-clear' },
    1: { desc: 'Principalmente limpo', iconDay: 'wi-day-cloudy', iconNight: 'wi-night-alt-cloudy' },
    2: { desc: 'Parcialmente nublado', iconDay: 'wi-day-cloudy', iconNight: 'wi-night-alt-cloudy' },
    3: { desc: 'Encoberto', iconDay: 'wi-cloudy', iconNight: 'wi-cloudy' },
    45: { desc: 'Nevoeiro', iconDay: 'wi-fog', iconNight: 'wi-fog' },
    51: { desc: 'Drizzle leve', iconDay: 'wi-sprinkle', iconNight: 'wi-sprinkle' },
    61: { desc: 'Chuva leve', iconDay: 'wi-rain', iconNight: 'wi-rain' },
    95: { desc: 'Trovoada', iconDay: 'wi-thunderstorm', iconNight: 'wi-thunderstorm' }
};

document.getElementById('weather-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const city = document.getElementById('city-input').value.trim();
    const resultContainer = document.getElementById('result-container');
    const submitButton = e.target.querySelector('button');

    if (!city) return;

    try {
        toggleLoading(submitButton, true);

        // Fluxo de dados: Geocoding -> Weather
        const location = await getCoordinates(city);
        const weather = await getWeather(location.latitude, location.longitude);

        // Atualização da Interface
        displayWeather(location, weather);
        updateTheme(weather.is_day);
        
        resultContainer.classList.remove('hidden');
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert(error.message || 'Erro de rede. Verifique sua conexão.');
    } finally {
        toggleLoading(submitButton, false);
    }
});

/**
 * Busca coordenadas baseadas no nome da cidade
 * 
 * @async
 * @param {string} city - O nome da cidade para pesquisa (ex: "São Paulo").
 * @returns {Promise<Object>} Objeto contendo latitude, longitude e metadados da localização.
 * @throws {Error} Lança erro se o serviço estiver offline ou se nenhum resultado for encontrado.
 * @example
 * const location = await getCoordinates('Rio de Janeiro');
 * console.log(location.latitude, location.longitude);
 */
async function getCoordinates(city) {
    const url = `${GEO_API_URL}?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Serviço de geolocalização indisponível.');
    
    const data = await response.json();
    if (!data.results?.length) throw new Error('Cidade não encontrada.');
    
    return data.results[0];
}

/**
 * Busca dados climáticos baseados em latitude/longitude
 * 
 * @async
 * @param {number|string} lat - Latitude da localização.
 * @param {number|string} lon - Longitude da localização.
 * @returns {Promise<Object>} Objeto com os dados de current_weather (temperatura, windspeed, weathercode, etc).
 * @throws {Error} Lança erro se a API falhar ou se os dados de clima atual estiverem ausentes.
 * @example
 * const weather = await getWeather(-23.55, -46.63);
 */
async function getWeather(lat, lon) {
    const url = `${WEATHER_API_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Serviço meteorológico indisponível.');
    
    const data = await response.json();
    if (!data.current_weather) throw new Error('Dados climáticos não disponíveis para esta região.');
    
    return data.current_weather;
}

/**
 * Atualiza os elementos do DOM com as informações meteorológicas formatadas.
 * 
 * @param {Object} location - Objeto de localização retornado por getCoordinates.
 * @param {Object} weather - Objeto de clima retornado por getWeather.
 * @returns {void}
 */
function displayWeather(location, weather) {
    const { name, admin1, country } = location;
    
    // Localização formatada
    document.getElementById('city-name').textContent = `${name}, ${admin1 ? admin1 + ' - ' : ''}${country}`;
    
    // Data e hora completa
    const dateElement = document.getElementById('date-time');
    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
        });
    }

    // Temperatura e Descrição
    document.getElementById('temperature').textContent = `${Math.round(weather.temperature)}°C`;
    
    const condition = WEATHER_CONDITION_MAP[weather.weathercode] || { desc: 'Condições atuais', iconDay: 'wi-na', iconNight: 'wi-na' };
    const currentCondition = {
        desc: condition.desc,
        icon: weather.is_day ? condition.iconDay : condition.iconNight
    };

    document.getElementById('weather-desc').textContent = currentCondition.desc;
    
    const iconElement = document.getElementById('weather-icon');
    if (iconElement) {
        iconElement.className = `wi ${currentCondition.icon}`;
    }
}

/**
 * Alterna a classe de tema do body entre dia e noite.
 * 
 * @param {number} isDay - Valor binário (1 para dia, 0 para noite) vindo da API.
 * @returns {void}
 */
function updateTheme(isDay) {
    const theme = isDay === 1 ? 'day-theme' : 'night-theme';
    document.body.className = theme; // Substitui as classes de tema de forma limpa
}

/**
 * Gerencia o estado visual do botão de busca durante a requisição assíncrona.
 * 
 * @param {HTMLButtonElement} button - O elemento do botão a ser modificado.
 * @param {boolean} isLoading - Define se o estado é de carregamento ou não.
 * @returns {void}
 */
function toggleLoading(button, isLoading) {
    button.disabled = isLoading;
    button.textContent = isLoading ? 'Buscando...' : 'Buscar';
}