(function (global) {
  const sounds = {
    'music.main': ['./audio/music/main-theme.mp3'],
    'music.island2': ['./audio/music/island-2-theme.mp3'],
    'music.boat': ['./audio/music/boat-cutscene.ogg'],
    'music.discovery': ['./audio/music/discovery-sting.ogg'],
    'ambience.ocean': ['./audio/ambience/ocean-loop.mp3'],
    'ambience.island': ['./audio/ambience/island-loop.ogg'],
    'ambience.island2': ['./audio/ambience/island-2-night-loop.ogg'],
    'ambience.lighthouse': ['./audio/ambience/lighthouse-loop.ogg'],
    'player.footstep': [
      './audio/player/footstep-grass-01.ogg?v=20260608-soft-foley',
      './audio/player/footstep-grass-02.ogg?v=20260608-soft-foley',
      './audio/player/footstep-grass-03.ogg?v=20260608-soft-foley',
      './audio/player/footstep-grass-04.ogg?v=20260608-soft-foley',
    ],
    'player.axeSwing': [
      './audio/player/axe-swing-01.ogg?v=20260608-soft-foley',
      './audio/player/axe-swing-02.ogg?v=20260608-soft-foley',
      './audio/player/axe-swing-03.ogg?v=20260608-soft-foley',
    ],
    'player.axeHitBush': [
      './audio/player/axe-hit-bush-01.ogg',
      './audio/player/axe-hit-bush-02.ogg',
      './audio/player/axe-hit-bush-03.ogg',
    ],
    'player.axeHitTree': [
      './audio/player/axe-hit-tree-01.ogg',
      './audio/player/axe-hit-tree-02.ogg',
      './audio/player/axe-hit-tree-03.ogg',
    ],
    'player.treeFall': ['./audio/player/tree-fall.ogg'],
    'player.pickup': [
      './audio/player/pickup-01.ogg',
      './audio/player/pickup-02.ogg',
      './audio/player/pickup-03.ogg',
      './audio/player/pickup-04.ogg',
    ],
    'player.pickupRare': ['./audio/player/pickup-rare.ogg'],
    'player.leavesBurst': [
      './audio/player/leaves-burst-01.ogg?v=20260608-soft-foley',
      './audio/player/leaves-burst-02.ogg?v=20260608-soft-foley',
      './audio/player/leaves-burst-03.ogg?v=20260608-soft-foley',
    ],
    'water.ripple': [
      './audio/water/ripple-01.ogg',
      './audio/water/ripple-02.ogg',
      './audio/water/ripple-03.ogg',
    ],
    'water.sharkPass': [
      './audio/water/shark-pass-01.ogg',
      './audio/water/shark-pass-02.ogg',
      './audio/water/shark-pass-03.ogg',
    ],
    'water.burst': [
      './audio/water/water-burst-01.ogg',
      './audio/water/water-burst-02.ogg',
      './audio/water/water-burst-03.ogg',
    ],
    'boat.engineStart': ['./audio/boat/engine-start.ogg'],
    'boat.engineLoop': ['./audio/boat/engine-loop.ogg'],
    'boat.engineStop': ['./audio/boat/engine-stop.ogg'],
    'boat.noFuel': ['./audio/boat/no-fuel.ogg'],
    'world.lighthouseStart': ['./audio/world/lighthouse-start.ogg'],
    'world.lighthouseBlink': [
      './audio/world/lighthouse-blink-01.ogg',
      './audio/world/lighthouse-blink-02.ogg',
    ],
    'world.scenarioGlint': ['./audio/world/scenario-glint.ogg'],
    'world.scenarioOpen': ['./audio/world/scenario-open.ogg'],
    'world.islandExpand': ['./audio/world/island-expand.ogg'],
    'world.resourceUnlock': ['./audio/world/resource-unlock.ogg'],
    'ui.tap': [
      './audio/ui/tap-01.ogg',
      './audio/ui/tap-02.ogg',
      './audio/ui/tap-03.ogg',
    ],
    'ui.panelOpen': ['./audio/ui/panel-open.ogg'],
    'ui.panelClose': ['./audio/ui/panel-close.ogg'],
    'ui.purchase': ['./audio/ui/purchase.ogg'],
    'ui.notEnoughMoney': ['./audio/ui/not-enough-money.ogg'],
    'ui.resourceUpgrade': ['./audio/ui/resource-upgrade.ogg'],
    'ui.starEarned': ['./audio/ui/star-earned.ogg'],
    'ui.questComplete': ['./audio/ui/quest-complete.ogg'],
    'ui.questReward': ['./audio/ui/quest-reward.ogg'],
  };

  const defaultVolumes = {
    'music.main': 0.18,
    'music.island2': 0.18,
    'music.boat': 0.28,
    'ambience.ocean': 0.026,
    'ambience.island': 0.08,
    'ambience.island2': 0.025,
    'ambience.lighthouse': 0.03,
    'player.footstep': 0.07,
    'player.pickup': 0.24,
    'water.ripple': 0.06,
    'water.sharkPass': 0.05,
    'water.burst': 0.026,
    'ui.tap': 0.16,
  };

  const loops = new Map();
  const effects = new Set();
  const lastPlayedAt = new Map();
  let audioContext = null;
  let pickupNoteIndex = 0;
  let unlocked = false;
  let muted = localStorage.getItem('audioMuted') === '1';
  let activeMusicKey = '';

  function choose(key) {
    const variants = sounds[key] || [];
    return variants.length ? variants[Math.floor(Math.random() * variants.length)] : '';
  }

  function volumeFor(key, volume) {
    if (muted) return 0;
    if (Number.isFinite(volume)) return Math.max(0, Math.min(1, volume));
    return defaultVolumes[key] ?? 0.32;
  }

  function ensureAudioContext() {
    const AudioContextClass = global.AudioContext || global.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioContext) audioContext = new AudioContextClass();
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    return audioContext;
  }

  function playSoftPickup(options = {}) {
    if (!ensureAudioContext()) return null;
    const now = audioContext.currentTime;
    const noteSteps = [0, 2, 4, 7, 9, 7, 4, 2];
    const step = noteSteps[pickupNoteIndex % noteSteps.length];
    pickupNoteIndex += 1;
    const baseFrequency = 255 * (2 ** (step / 12));
    const gain = audioContext.createGain();
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(baseFrequency * 0.72, now);
    oscillator.frequency.exponentialRampToValueAtTime(baseFrequency, now + 0.11);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volumeFor('player.pickup', options.volume) * 0.16), now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.15);
    return oscillator;
  }

  function play(key, options = {}) {
    if (!unlocked || muted) return null;
    const now = performance.now();
    const cooldownMs = Number.isFinite(options.cooldownMs) ? options.cooldownMs : 0;
    if (cooldownMs && now - (lastPlayedAt.get(key) || 0) < cooldownMs) return null;
    if (key === 'player.pickup') {
      lastPlayedAt.set(key, now);
      return playSoftPickup(options);
    }
    const src = choose(key);
    if (!src) return null;
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = volumeFor(key, options.volume);
    if (Number.isFinite(options.playbackRate)) audio.playbackRate = options.playbackRate;
    effects.add(audio);
    const release = () => effects.delete(audio);
    audio.addEventListener('ended', release, { once: true });
    audio.addEventListener('error', release, { once: true });
    lastPlayedAt.set(key, now);
    audio.play().catch(() => {});
    return audio;
  }

  function ensureLoop(key, volume) {
    if (!unlocked) return null;
    let audio = loops.get(key);
    if (!audio) {
      const src = choose(key);
      if (!src) return null;
      audio = new Audio(src);
      audio.loop = true;
      audio.preload = 'auto';
      loops.set(key, audio);
    }
    audio.volume = volumeFor(key, volume);
    if (!muted && audio.paused) audio.play().catch(() => {});
    return audio;
  }

  function stopLoop(key) {
    const audio = loops.get(key);
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    loops.delete(key);
  }

  function setLoopVolume(key, volume) {
    const audio = ensureLoop(key, volume);
    if (audio) audio.volume = volumeFor(key, volume);
  }

  function syncIslandAudio() {
    if (!unlocked) return;
    const islandRun = Math.max(1, Math.floor(Number(localStorage.getItem('islandRun') || 1) || 1));
    const musicKey = islandRun >= 2 ? 'music.island2' : 'music.main';
    if (activeMusicKey !== musicKey) {
      if (activeMusicKey) stopLoop(activeMusicKey);
      activeMusicKey = musicKey;
    }
    ensureLoop(musicKey);
    ensureLoop('ambience.ocean');
    if (islandRun >= 2) {
      stopLoop('ambience.island');
      ensureLoop('ambience.island2');
    } else {
      stopLoop('ambience.island2');
      ensureLoop('ambience.island');
    }
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    ensureAudioContext();
    syncIslandAudio();
  }

  function setMuted(value) {
    muted = Boolean(value);
    localStorage.setItem('audioMuted', muted ? '1' : '0');
    loops.forEach((audio, key) => {
      audio.volume = muted ? 0 : volumeFor(key);
      if (!muted && audio.paused) audio.play().catch(() => {});
    });
  }

  function playBoatDeparture() {
    play('music.boat', { volume: 0.3 });
    play('boat.engineStart', { volume: 0.32 });
    setTimeout(() => ensureLoop('boat.engineLoop', 0.22), 350);
    setTimeout(() => {
      stopLoop('boat.engineLoop');
      play('boat.engineStop', { volume: 0.28 });
    }, 3000);
  }

  document.addEventListener('pointerdown', unlock, { once: true, capture: true });
  document.addEventListener('keydown', unlock, { once: true, capture: true });
  document.addEventListener('click', (event) => {
    if (event.target.closest('button,[role="button"]')) play('ui.tap', { cooldownMs: 45 });
  }, true);
  const questCard = document.getElementById('questCard');
  if (questCard) {
    let questWasComplete = questCard.classList.contains('complete');
    new MutationObserver(() => {
      const complete = questCard.classList.contains('complete');
      if (complete && !questWasComplete) play('ui.questComplete', { volume: 0.32 });
      questWasComplete = complete;
    }).observe(questCard, { attributes: true, attributeFilter: ['class'] });
  }
  window.addEventListener('vibe-map-changed', syncIslandAudio);
  window.addEventListener('storage', (event) => {
    if (event.key === 'islandRun') syncIslandAudio();
  });

  global.VibeAudio = {
    play,
    ensureLoop,
    stopLoop,
    setLoopVolume,
    syncIslandAudio,
    playBoatDeparture,
    setMuted,
    isMuted: () => muted,
  };
})(window);
