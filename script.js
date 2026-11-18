// Tokens do padrão: 9 = dígito, A = letra, * = letra ou dígito.
// Qualquer outro caractere do padrão é literal (., -, /, :, espaço...).
const TOKENS = {
  9: /\d/,
  A: /[A-Za-z]/,
  '*': /[A-Za-z0-9]/,
};

function aplicarMascara(valor, padrao) {
  let resultado = '';
  let pendente = '';
  let i = 0;

  for (const token of padrao) {
    const regra = TOKENS[token];

    // Literal: só entra quando o próximo caractere válido for digitado.
    if (!regra) {
      pendente += token;
      continue;
    }

    while (i < valor.length && !regra.test(valor[i])) i++; // descarta inválidos
    if (i >= valor.length) break;

    const char = valor[i++];
    resultado += pendente + (token === '9' ? char : char.toUpperCase());
    pendente = '';
  }
  return resultado;
}

// Vários padrões separados por "|": usa o primeiro que couber.
// Ex.: "(99) 9999-9999|(99) 99999-9999" serve para fixo e celular.
function escolherPadrao(valor, padroes) {
  const qtd = valor.replace(/[^A-Za-z0-9]/g, '').length;
  const cabe = (padrao) => padrao.replace(/[^9A*]/g, '').length >= qtd;
  return padroes.find(cabe) ?? padroes.at(-1);
}

// Moeda é preenchida da direita para a esquerda, então tem regra própria.
function aplicarMoeda(valor) {
  const numeros = valor.replace(/\D/g, '').slice(0, 15);
  if (!numeros) return '';

  const centavos = numeros.padStart(3, '0');
  const inteiro = centavos
    .slice(0, -2)
    .replace(/^0+(?=\d)/, '')
    .replace(/\B(?=(\d{3})+$)/g, '.');

  return `${inteiro},${centavos.slice(-2)}`;
}

document.querySelectorAll('[data-mascara]').forEach((campo) => {
  const padroes = campo.dataset.mascara.split('|');
  const moeda = padroes[0] === 'moeda';

  if (!moeda) campo.maxLength = Math.max(...padroes.map((p) => p.length));

  campo.addEventListener('input', () => {
    campo.value = moeda
      ? aplicarMoeda(campo.value)
      : aplicarMascara(campo.value, escolherPadrao(campo.value, padroes));
  });
});

// Prévia do que seria enviado, só para conferir as máscaras.
const form = document.querySelector('form');
const saida = document.getElementById('saida');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const dados = Object.fromEntries(
    [...new FormData(form)].filter(([, valor]) => valor !== '')
  );
  saida.hidden = false;
  saida.textContent = JSON.stringify(dados, null, 2);
});
