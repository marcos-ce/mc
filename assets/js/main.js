const dataInicial = new Date(2025, 4, 14);
const contador = document.getElementById('contador');
const listaHTML = document.querySelectorAll('#playlistDados li');
const playlist = Array.from(listaHTML, (item) => ({
  src: item.getAttribute('data-src'),
  nome: item.innerText.trim()
}));

let indexAtual = 0;

const audio = document.getElementById('playerAudio');
const displayTitulo = document.getElementById('displayTitulo');
const visualizer = document.getElementById('visualizer');
const btnPlay = document.getElementById('btnPlay');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const playerStatus = document.getElementById('playerStatus');

function atualizarContador() {
  const agora = new Date();
  const diferenca = agora - dataInicial;

  if (diferenca < 0) {
    contador.innerText = 'Em breve...';
    return;
  }

  const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);
  contador.innerText = `${dias} dias ${horas} horas ${minutos} min e ${segundos} seg`;
}

function atualizarStatus(texto, erro = false) {
  playerStatus.textContent = texto;
  playerStatus.style.color = erro ? '#ffd5de' : '';
}

function carregarMusica(index) {
  if (!playlist.length) {
    atualizarStatus('Nenhuma música local configurada.', true);
    displayTitulo.innerText = 'Playlist vazia';
    btnPlay.disabled = true;
    btnPrev.disabled = true;
    btnNext.disabled = true;
    return;
  }

  if (index < 0) index = playlist.length - 1;
  if (index >= playlist.length) index = 0;

  indexAtual = index;
  audio.src = playlist[indexAtual].src;
  displayTitulo.innerText = playlist[indexAtual].nome;
  atualizarStatus('Pronto para tocar');
}

async function togglePlay() {
  if (!playlist.length) return;

  if (audio.paused) {
    try {
      await audio.play();
      visualizer.classList.remove('paused');
      btnPlay.innerText = '⏸';
      btnPlay.setAttribute('aria-label', 'Pausar música');
      atualizarStatus('Reproduzindo agora');
    } catch (erro) {
      console.error('Erro no player:', erro);
      atualizarStatus('Não foi possível reproduzir esta faixa agora.', true);
    }
    return;
  }

  audio.pause();
  visualizer.classList.add('paused');
  btnPlay.innerText = '▶';
  btnPlay.setAttribute('aria-label', 'Tocar música');
  atualizarStatus('Pausado');
}

function mudarFaixa(direcao) {
  if (!playlist.length) return;

  carregarMusica(indexAtual + direcao);
  if (!audio.paused) {
    audio.play().catch(() => {
      atualizarStatus('Erro ao iniciar a próxima faixa.', true);
    });
  }
}

function erroImg(img) {
  img.onerror = null;
  img.src = 'assets/images/fallback.svg';
  img.classList.add('error');
}

function configurarEventos() {
  btnPlay.addEventListener('click', togglePlay);
  btnPrev.addEventListener('click', () => mudarFaixa(-1));
  btnNext.addEventListener('click', () => mudarFaixa(1));

  audio.addEventListener('ended', () => mudarFaixa(1));
  audio.addEventListener('error', () => {
    atualizarStatus('Arquivo de áudio indisponível para esta faixa.', true);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
      } else if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        entry.target.classList.remove('reveal');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.polaroid').forEach((el) => observer.observe(el));

  document.addEventListener('keydown', (event) => {
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;

    if (event.code === 'Space') {
      event.preventDefault();
      togglePlay();
    } else if (event.code === 'ArrowLeft') {
      event.preventDefault();
      mudarFaixa(-1);
    } else if (event.code === 'ArrowRight') {
      event.preventDefault();
      mudarFaixa(1);
    }
  });

  const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
  if (motionReduced || lowPower) {
    document.body.classList.add('reduced-visual-load');
    visualizer.classList.add('paused');
  }

  document.querySelectorAll('.polaroid img').forEach((img) => {
    img.addEventListener('error', () => erroImg(img));
  });
}

setInterval(atualizarContador, 1000);
atualizarContador();
carregarMusica(0);
configurarEventos();
