const audio = new Audio();
audio.preload = 'auto';

const UI = {
  play: document.getElementById('btnPlay'),
  mute: document.getElementById('btnMute'),
  loop: document.getElementById('btnLoop'),
  back: document.getElementById('btnSkipBack'),
  fwd: document.getElementById('btnSkipFwd'),
  seeker: document.getElementById('seeker'),
  volume: document.getElementById('volSlider'),
  speed: document.getElementById('speedSlider'),
  volVal: document.getElementById('volVal'),
  speedVal: document.getElementById('speedVal'),
  cur: document.getElementById('curTime'),
  dur: document.getElementById('durTime'),
  file: document.getElementById('fileInput'),
  status: document.getElementById('statusBadge'),
  track: document.getElementById('trackSub'),
  canvas: document.getElementById('waveCanvas'),
  bar: document.getElementById('waveformBar')
};

const ctx = UI.canvas.getContext('2d');

let waveData = null;
let anim = null;

const fmt = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

//waveform
function drawWave() {
  const W = UI.bar.clientWidth;
  const H = UI.bar.clientHeight;

  UI.canvas.width = W;
  UI.canvas.height = H;

  ctx.clearRect(0, 0, W, H);

  const progress = audio.duration ? audio.currentTime / audio.duration : 0;
  const split = progress * W;

  const bars = 100;
  for (let i = 0; i < bars; i++) {
    const x = (i / bars) * W;
    const height = waveData ? waveData[i] * H : Math.random() * H;

    ctx.fillStyle = x < split ? '#000000' : '#000000';
    ctx.fillRect(x, (H - height) / 2, 2, height);
  }
}

//animation loop to update seeker and waveform
function tick() {
  if (audio.duration) {
    UI.seeker.value = (audio.currentTime / audio.duration) * 100;
  }

  UI.cur.textContent = fmt(audio.currentTime);
  drawWave();

  anim = requestAnimationFrame(tick);
}

//event handlers
UI.play.onclick = () => audio.paused ? audio.play() : audio.pause();

audio.onplay = () => {
  UI.play.textContent = '⏸';
  UI.status.textContent = 'playing';
  UI.status.classList.add('playing');
  tick();
};

audio.onpause = () => {
  UI.play.textContent = '▶';
  UI.status.textContent = 'paused';
  cancelAnimationFrame(anim);
};

UI.mute.onclick = () => {
  audio.muted = !audio.muted;
  UI.mute.textContent = audio.muted ? '🔇' : '🕪';
};

UI.loop.onclick = () => {
  audio.loop = !audio.loop;
};

UI.back.onclick = () => audio.currentTime -= 10;
UI.fwd.onclick = () => audio.currentTime += 10;

UI.volume.oninput = () => {
  audio.volume = UI.volume.value;
  UI.volVal.textContent = Math.round(audio.volume * 100) + '%';
};

UI.speed.oninput = () => {
  audio.playbackRate = UI.speed.value;
  UI.speedVal.textContent = UI.speed.value + '×';
};

UI.seeker.oninput = () => {
  if (audio.duration) {
    audio.currentTime = (UI.seeker.value / 100) * audio.duration;
  }
};

UI.file.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  audio.src = URL.createObjectURL(file);
  UI.track.textContent = file.name;
};


drawWave();