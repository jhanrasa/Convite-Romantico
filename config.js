// Configurações do Convite Romântico
const urlParams = new URLSearchParams(window.location.search);

const CONFIG = {
  // Número de destino do WhatsApp (padrão do Jean, mas pode ser passado via url: ?phone=55XXXXXXXXXXX)
  phone: urlParams.get('phone') || urlParams.get('to') || '5516996332657',
  
  // Nome de quem está convidando (padrão 'Jean', mas pode ser alterado via url: ?name=OutroNome)
  name: urlParams.get('name') || 'Jean',
  
  // Balões de fala ou avisos fofos que aparecem caso ela consiga clicar em "NÃO" no celular
  pleadingMessages: [
    "Pensa bem...",
    "Por favor!! 🙏",
    "Tem certeza? 🥺",
    "Diz que sim! ❤️",
    "Só um datezinho? 🥺",
    "Não faz isso comigo... 💔",
    "Vou chorar... 😭"
  ]
};
export default CONFIG;
