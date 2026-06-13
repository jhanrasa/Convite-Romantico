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

// Elementos de Data e Hora
const defaultDateSelectors = document.getElementById('default-date-selectors');
const slotsSelectContainer = document.getElementById('slots-select-container');
const slotsGrid = document.getElementById('slots-grid');
const dateInput = document.getElementById('date-input');
const timeInput = document.getElementById('time-input');
const summaryDetails = document.getElementById('summary-details');
const inviterNameSpan = document.getElementById('inviter-name');

// Elementos do Modal Administrativo
const emojiTrigger = document.getElementById('emoji-trigger');
const adminModal = document.getElementById('admin-modal');
const btnCloseAdmin = document.getElementById('btn-close-admin');
const adminName = document.getElementById('admin-name');
const adminPhone = document.getElementById('admin-phone');
const adminSlotDate = document.getElementById('admin-slot-date');
const adminSlotTime = document.getElementById('admin-slot-time');
const btnAddSlot = document.getElementById('btn-add-slot');
const adminSlotsList = document.getElementById('admin-slots-list');
const btnGenerateLink = document.getElementById('btn-generate-link');

// Configuração de Estado Global da Aplicação
let selectedFoods = [];
let yesScale = 1;
let adminSlots = []; // Slots adicionados localmente no painel administrativo
let urlSlots = [];   // Slots lidos da URL
let selectedSlot = null; // Slot selecionado pela convidada (se houver slots na URL)

let chosenDate = "";
let chosenTime = "";

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

// 5. Configurar Data e Hora de forma Condicional (Inputs Padrão ou Slots da URL)
const urlParams = new URLSearchParams(window.location.search);

function initializeInviteSlots() {
  const slotsParam = urlParams.get('slots');
  
  if (slotsParam) {
    // Ex: slots=2026-06-15T19:00,2026-06-16T20:00
    urlSlots = slotsParam.split(',').map(s => {
      const [d, t] = s.split('T');
      return { date: d, time: t };
    }).filter(s => s.date && s.time);
    
    if (urlSlots.length > 0) {
      // Ocultar calendário padrão e exibir o grid de slots do Jean
      defaultDateSelectors.style.display = 'none';
      slotsSelectContainer.style.display = 'block';
      slotsGrid.innerHTML = '';
      
      // Desabilitar o botão de avançar até que ela escolha um horário
      btnNext4.disabled = true;
      
      urlSlots.forEach((slot) => {
        const btn = document.createElement('button');
        btn.className = 'slot-btn';
        
        // Formatar data: AAAA-MM-DD -> DiaDaSemana, DD/MM
        const parts = slot.date.split('-');
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const dayName = daysOfWeek[dateObj.getDay()];
        const formattedDate = `${parts[2]}/${parts[1]}`;
        
        btn.innerHTML = `
          <div>
            <strong>${dayName}, ${formattedDate}</strong>
            <div style="font-size: 0.8rem; opacity: 0.8; font-weight: normal; margin-top: 2px;">às ${slot.time}</div>
          </div>
          <span class="slot-btn-check">✓</span>
        `;
        
        btn.addEventListener('click', () => {
          // Desmarcar botões selecionados anteriormente
          document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          
          selectedSlot = slot;
          btnNext4.disabled = false;
        });
        
        slotsGrid.appendChild(btn);
      });
    }
  }
}

// Configurar limites do calendário padrão caso não tenha slots
const today = new Date();
const todayStr = today.toISOString().split('T')[0];
dateInput.min = todayStr;

const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
dateInput.value = tomorrow.toISOString().split('T')[0];

btnNext4.addEventListener('click', () => {
  if (urlSlots.length > 0) {
    if (!selectedSlot) {
      alert("Por favor, selecione um dos horários disponíveis! 😉");
      return;
    }
    chosenDate = selectedSlot.date;
    chosenTime = selectedSlot.time;
  } else {
    if (!dateInput.value || !timeInput.value) {
      alert("Por favor, escolhe uma data e um horário bem legal! 😉");
      return;
    }
    chosenDate = dateInput.value;
    chosenTime = timeInput.value;
  }
  
  // Gerar resumo final
  formatAndShowSummary();
  navigateTo(5);
});

// Formatação do resumo na tela final
function formatAndShowSummary() {
  const parts = chosenDate.split('-');
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
  
  summaryDetails.innerHTML = `Vamos comer <strong>${foodsText}</strong> no dia <strong>${formattedDate}</strong> às <strong>${chosenTime}</strong>!`;
}

// 6. Envio via WhatsApp
btnWhatsapp.addEventListener('click', () => {
  const parts = chosenDate.split('-');
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
  
  // Mensagem romântica
  const messageText = `Oi, ${CONFIG.name}! Aceito o convite para o nosso date! Vamos comer ${foodsText} no dia ${formattedDate} às ${chosenTime}! 🥰`;
  
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${CONFIG.phone}&text=${encodeURIComponent(messageText)}`;
  window.open(whatsappUrl, '_blank');
});

// 7. Lógica do Painel Administrativo Oculto (Duplo Clique no Emoji)
let lastTouchTime = 0;

function openAdminPanel() {
  adminName.value = CONFIG.name;
  adminPhone.value = CONFIG.phone;
  
  // Configurar campos de data/hora do cadastro com data de amanhã por padrão
  const defaultSlotDate = new Date();
  defaultSlotDate.setDate(defaultSlotDate.getDate() + 1);
  adminSlotDate.value = defaultSlotDate.toISOString().split('T')[0];
  adminSlotDate.min = todayStr;
  
  // Renderizar slots atuais caso já existam em memória local
  renderAdminSlots();
  
  adminModal.style.display = 'flex';
}

emojiTrigger.addEventListener('dblclick', openAdminPanel);

emojiTrigger.addEventListener('touchstart', (e) => {
  const now = new Date().getTime();
  const timespan = now - lastTouchTime;
  if (timespan < 300 && timespan > 0) {
    e.preventDefault();
    openAdminPanel();
  }
  lastTouchTime = now;
});

// Fechar Painel Admin
btnCloseAdmin.addEventListener('click', () => {
  adminModal.style.display = 'none';
});

// Adicionar Horário Livre no Painel
btnAddSlot.addEventListener('click', () => {
  const dVal = adminSlotDate.value;
  const tVal = adminSlotTime.value;
  
  if (!dVal || !tVal) {
    alert("Preencha a data e o horário para adicionar!");
    return;
  }
  
  // Evitar duplicados
  const isDuplicate = adminSlots.some(s => s.date === dVal && s.time === tVal);
  if (isDuplicate) {
    alert("Esse horário já foi adicionado!");
    return;
  }
  
  adminSlots.push({ date: dVal, time: tVal });
  
  // Limpar campos ou resetar horário
  adminSlotTime.value = "19:00";
  
  renderAdminSlots();
});

// Renderizar slots na lista do admin
function renderAdminSlots() {
  adminSlotsList.innerHTML = '';
  
  adminSlots.forEach((slot, index) => {
    const li = document.createElement('li');
    
    // Formatar data: AAAA-MM-DD -> DD/MM
    const parts = slot.date.split('-');
    const formattedDate = `${parts[2]}/${parts[1]}`;
    
    li.innerHTML = `
      <span>📅 ${formattedDate} às ${slot.time}</span>
      <button data-index="${index}">&times;</button>
    `;
    
    // Ouvinte para remover o slot
    li.querySelector('button').addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index);
      adminSlots.splice(idx, 1);
      renderAdminSlots();
    });
    
    adminSlotsList.appendChild(li);
  });
}

// Gerar e Copiar Link Customizado
btnGenerateLink.addEventListener('click', () => {
  const nameVal = adminName.value.trim() || 'Jean';
  const phoneVal = adminPhone.value.trim().replace(/\D/g, '') || '5516996332657';
  
  const params = new URLSearchParams();
  params.set('name', nameVal);
  params.set('phone', phoneVal);
  
  if (adminSlots.length > 0) {
    const slotsStr = adminSlots.map(s => `${s.date}T${s.time}`).join(',');
    params.set('slots', slotsStr);
  }
  
  // Criar URL completa
  const generatedUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  
  // Copiar para o Clipboard
  navigator.clipboard.writeText(generatedUrl).then(() => {
    alert("Sucesso! Link do convite gerado e copiado! 🎉\n\nAgora envie para ela no WhatsApp!");
    adminModal.style.display = 'none';
  }).catch(err => {
    console.error("Falha ao copiar link automaticamente: ", err);
    alert(`Link gerado com sucesso! Como não conseguimos copiar automaticamente, copie manualmente abaixo:\n\n${generatedUrl}`);
  });
});

// 8. Inicializar os Slots ao carregar
initializeInviteSlots();

// 9. Motor de Corações Flutuantes (Background)
function startHeartEngine() {
  setInterval(createHeart, 300);
}

startHeartEngine();
