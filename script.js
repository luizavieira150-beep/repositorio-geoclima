// ============================================
// CONFIGURAÇÃO DA API
// ============================================

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const CLIMA_URL = "https://api.open-meteo.com/v1/forecast";


// ============================================
// ELEMENTOS DA PÁGINA
// ============================================

const botaoBuscar = document.getElementById("buscar");
const campoCidade = document.getElementById("cidade");
const resultado = document.getElementById("resultado");


// ============================================
// BOTÃO DE BUSCAR
// ============================================

botaoBuscar.addEventListener("click", buscarClima);


// ============================================
// PERMITIR PESQUISAR COM ENTER
// ============================================

campoCidade.addEventListener("keydown", function (evento) {

  if (evento.key === "Enter") {
    buscarClima();
  }

});


// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

function buscarClima() {

  const cidade = campoCidade.value.trim();


  // Verifica se o campo está vazio

  if (cidade === "") {

    resultado.innerHTML = `
<p>Digite o nome de uma cidade.</p>
`;

    return;
  }


  // Mensagem enquanto carrega

  resultado.innerHTML = `
<p>Consultando o clima...</p>
`;


  // ============================================
  // PRIMEIRA REQUISIÇÃO
  // Descobre latitude e longitude da cidade
  // ============================================

  const urlBusca =
    `${GEO_URL}?name=${encodeURIComponent(cidade)}` +
    `&count=1&language=pt&format=json`;


  fetch(urlBusca)

    .then(resposta => {

      if (!resposta.ok) {
        throw new Error("Erro ao buscar a cidade.");
      }

      return resposta.json();

    })

    .then(dadosCidade => {

      // Verifica se a cidade foi encontrada

      if (!dadosCidade.results || dadosCidade.results.length === 0) {
        throw new Error("Cidade não encontrada.");
      }


      // Pega latitude e longitude

      const latitude = dadosCidade.results[0].latitude;
      const longitude = dadosCidade.results[0].longitude;


      // ============================================
      // SEGUNDA REQUISIÇÃO
      // Busca os dados do clima
      // ============================================

      const urlClima =
        `${CLIMA_URL}?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m` +
        `,wind_speed_10m,weather_code`;


      return fetch(urlClima);

    })

    .then(resposta => {

      if (!resposta.ok) {
        throw new Error("Não foi possível consultar o clima.");
      }

      return resposta.json();

    })

    .then(dadosClima => {

      console.log("JSON recebido:", dadosClima);


      // ============================================
      // DADOS DO CLIMA
      // ============================================

      const temperatura =
        dadosClima.current.temperature_2m;

      const umidade =
        dadosClima.current.relative_humidity_2m;

      const vento =
        dadosClima.current.wind_speed_10m;

      const codigoClima =
        dadosClima.current.weather_code;


      // ============================================
      // CONDIÇÃO CLIMÁTICA
      // ============================================

      let condicao = "";
      let emoji = "🌤️";


      if (codigoClima === 0) {

        condicao = "Céu limpo";
        emoji = "☀️";

      } else if (codigoClima === 1 || codigoClima === 2) {

        condicao = "Parcialmente nublado";
        emoji = "🌤️";

      } else if (codigoClima === 3) {

        condicao = "Nublado";
        emoji = "☁️";

      } else if (
        codigoClima === 45 ||
        codigoClima === 48
      ) {

        condicao = "Neblina";
        emoji = "🌫️";

      } else if (
        codigoClima >= 51 &&
        codigoClima <= 57
      ) {

        condicao = "Garoa";
        emoji = "🌧️";

      } else if (
        codigoClima >= 61 &&
        codigoClima <= 67
      ) {

        condicao = "Chuva";
        emoji = "🌧️";

      } else if (
        codigoClima >= 71 &&
        codigoClima <= 77
      ) {

        condicao = "Neve";
        emoji = "❄️";

      } else if (
        codigoClima >= 80 &&
        codigoClima <= 82
      ) {

        condicao = "Pancadas de chuva";
        emoji = "🌦️";

      } else if (
        codigoClima >= 95
      ) {

        condicao = "Trovoada";
        emoji = "⛈️";

      } else {

        condicao = "Condição desconhecida";

      }


      // ============================================
      // MOSTRA O RESULTADO NA PÁGINA
      // ============================================

      resultado.innerHTML = `

<div class="card-clima">

<h2>${cidade} ${emoji}</h2>

<p>
Condição:
<strong>${condicao}</strong>
</p>

<p>
Temperatura:
<strong>${temperatura} °C</strong>
</p>

<p>
Umidade:
<strong>${umidade}%</strong>
</p>

<p>
Vento:
<strong>${vento} km/h</strong>
</p>

</div>

`;

    })

    .catch(erro => {

      console.error(erro);

      resultado.innerHTML = `

<p>
Não foi possível consultar o clima dessa cidade.
</p>

`;

    });

}
