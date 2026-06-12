import CONFIG from './config.js';

// Inicializar elementos do DOM
const screens = document.querySelectorAll('.screen');
const btnNo = document.getElementById('btn-no');
const btnYes1 = document.getElementById('btn-yes-1');
const btnNext2 = document.getElementById('btn-next-2');
const btnNext3 = document.getElementById('btn-next-3');
const btnNext4 = document.getElementById('btn-next-4');
const btnWhatsapp = document.getElementById('btn-whatsapp');

const phoneScreen = document.querySelector('.phone-screen');
const warningContainer = document.getElementById('warning-container');
const heartsContainer = document.getElementById('hearts-container');

const foodItems = document.querySelectorAll('.food-item');
const dateInput = document.getElementById('date-input');
const timeInput = document.getElementById('time-input');
const summaryDetails = document.getElementById('summary-details');
const inviterNameSpan = document.getElementById('inviter-name');

// Configuração do estado
let selectedFoods = [];
let yesScale = 1;

// 1. Configurar nome do Remetente no botão final
inviterNameSpan.innerText = CONFIG.name.toUpperCase();

// 2. Navegação simples entre as telas
function navigateTo(screenId) {
  screens.forEach(screen => {
    screen.classList.remove('active');
  });
  const targetScreen = document.getElementById(`screen-${screenId}`);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }
}

// Eventos de Navegação
btnYes1.addEventListener('click', () => navigateTo(2));
btnNext2.addEventListener('click', () => navigateTo(3));
btnNext3.addEventListener('click', () => navigateTo(4));

// 3. Botão "NÃO" que foge (Teletransporte)
function teleportButton() {
  const containerRect = phoneScreen.getBoundingClientRect();
  const btnRect = btnNo.getBoundingClientRect();
  
  // Limites seguros de movimentação dentro do container da tela do celular
  const maxX = containerRect.width - btnRect.width - 24;
  const maxY = containerRect.height - btnRect.height - 40;
  
  // Margens de segurança para evitar colisão com a ilha dinâmica e com o topo/rodapé excessivo
  const minX = 24;
  const minY = 100;
  
  const randomX = Math.floor(Math.random() * (maxX - minX)) + minX;
  const randomY = Math.floor(Math.random() * (maxY - minY)) + minY;
  
  btnNo.style.position = 'absolute';
  btnNo.style.left = `${randomX}px`;
  btnNo.style.top = `${randomY}px`;
  btnNo.style.margin = '0';
  btnNo.style.zIndex = '999';
  
  // Exibir balão com frases de apelo
  showWarningPill();
  
  // Fazer o botão SIM crescer para induzir o acerto
  yesScale += 0.25;
  btnYes1.style.transform = `scale(${yesScale})`;
}

// Balões de apelo fofos
function showWarningPill() {
  const message = CONFIG.pleadingMessages[Math.floor(Math.random() * CONFIG.pleadingMessages.length)];
  
  const pill = document.createElement('div');
  pill.className = 'warning-pill';
  pill.innerText = message;
  
  // Limitar para exibir no máximo 3 avisos ao mesmo tempo
  if (warningContainer.children.length >= 3) {
    warningContainer.removeChild(warningContainer.children[0]);
  }
  
  warningContainer.appendChild(pill);
  
  // Remover o alerta após a animação de fade
  setTimeout(() => {
    if (pill.parentNode) {
      pill.parentNode.removeChild(pill);
    }
  }, 2500);
}

// Listeners do botão "NÃO" para desktop (mouseover) e mobile (touchstart)
btnNo.addEventListener('mouseover', teleportButton);
btnNo.addEventListener('touchstart', (e) => {
  e.preventDefault(); // Impede zoom ou clique padrão no celular
  teleportButton();
});
btnNo.addEventListener('click', (e) => {
  e.preventDefault();
  teleportButton();
});

// 4. Seleção de Comidas
foodItems.forEach(item => {
  item.addEventListener('click', () => {
    item.classList.toggle('selected');
    const food = item.dataset.food;
    
    if (item.classList.contains('selected')) {
      selectedFoods.push(food);
    } else {
      selectedFoods = selectedFoods.filter(f => f !== food);
    }
    
    // Habilitar botão se houver pelo menos uma opção selecionada
    btnNext3.disabled = selectedFoods.length === 0;
  });
});

// 5. Configurar Data e Hora
const today = new Date();
const todayStr = today.toISOString().split('T')[0];
dateInput.min = todayStr;

// Definir data padrão para amanhã
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
dateInput.value = tomorrow.toISOString().split('T')[0];

btnNext4.addEventListener('click', () => {
  if (!dateInput.value || !timeInput.value) {
    alert("Por favor, escolhe uma data e um horário bem legal! 😉");
    return;
  }
  
  // Gerar resumo final
  formatAndShowSummary();
  navigateTo(5);
});

// Formatação do resumo na tela final
function formatAndShowSummary() {
  const rawDate = dateInput.value;
  const parts = rawDate.split('-');
  const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
  
  let foodsText = "";
  if (selectedFoods.length === 1) {
    foodsText = selectedFoods[0];
  } else if (selectedFoods.length === 2) {
    foodsText = `${selectedFoods[0]} e ${selectedFoods[1]}`;
  } else {
    const lastFood = selectedFoods[selectedFoods.length - 1];
    const otherFoods = selectedFoods.slice(0, -1).join(', ');
    foodsText = `${otherFoods} e ${lastFood}`;
  }
  
  summaryDetails.innerHTML = `Vamos comer <strong>${foodsText}</strong> no dia <strong>${formattedDate}</strong> às <strong>${timeInput.value}</strong>!`;
}

// 6. Integração e Envio via WhatsApp
btnWhatsapp.addEventListener('click', () => {
  const rawDate = dateInput.value;
  const parts = rawDate.split('-');
  const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
  
  let foodsText = "";
  if (selectedFoods.length === 1) {
    foodsText = selectedFoods[0];
  } else if (selectedFoods.length === 2) {
    foodsText = `${selectedFoods[0]} e ${selectedFoods[1]}`;
  } else {
    const lastFood = selectedFoods[selectedFoods.length - 1];
    const otherFoods = selectedFoods.slice(0, -1).join(', ');
    foodsText = `${otherFoods} e ${lastFood}`;
  }
  
  // Mensagem customizada e romântica
  const messageText = `Oi, ${CONFIG.name}! Aceito o convite para o nosso date! Vamos comer ${foodsText} no dia ${formattedDate} às ${timeInput.value}! 🥰`;
  
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${CONFIG.phone}&text=${encodeURIComponent(messageText)}`;
  window.open(whatsappUrl, '_blank');
});

// 7. Motor de Corações Flutuantes (Background)
const heartSymbols = ['🖤', '🖤', '🖤', '❤️', '🖤']; // Corações escuros elegantes (e alguns vermelhos de detalhe)

function createHeart() {
  const heart = document.createElement('span');
  heart.className = 'heart';
  
  // Escolher símbolo aleatoriamente
  const symbol = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
  heart.innerText = symbol;
  
  // Posição horizontal de início aleatória
  const startX = Math.random() * 100;
  heart.style.left = `${startX}%`;
  
  // Parâmetros aleatórios passados para animação CSS
  const randomX = (Math.random() * 160 - 80); // Desvio horizontal
  const randomRotate = (Math.random() * 360); // Rotação final
  const randomScale = (Math.random() * 0.7 + 0.4); // Tamanho
  const animDuration = (Math.random() * 5 + 4); // Tempo de flutuação (4s a 9s)
  const opacity = (Math.random() * 0.4 + 0.35); // Opacidade base
  
  heart.style.setProperty('--random-x', `${randomX}px`);
  heart.style.setProperty('--random-rotate', `${randomRotate}deg`);
  heart.style.setProperty('--random-scale', randomScale);
  heart.style.setProperty('--animation-duration', `${animDuration}s`);
  heart.style.setProperty('--base-opacity', opacity);
  
  heartsContainer.appendChild(heart);
  
  // Limpeza do DOM após o término da animação
  setTimeout(() => {
    heart.remove();
  }, animDuration * 1000);
}

// Iniciar e manter corações flutuando
setInterval(createHeart, 300);
