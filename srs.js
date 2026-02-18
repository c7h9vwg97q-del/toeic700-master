const SRS = window.SRS = {
  getStats: () => JSON.parse(localStorage.getItem('toeic_srs_stats') || '{}'),
  setStats: (stats) => localStorage.setItem('toeic_srs_stats', JSON.stringify(stats)),
  getUser: () => JSON.parse(localStorage.getItem('toeic_user') || '{"xp":0,"streak":0,"lastDate":null,"combo":0}'),
  setUser: (user) => localStorage.setItem('toeic_user', JSON.stringify(user)),

  recordResult: (id, isCorrect) => {
    const stats = window.SRS.getStats();
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    if (!stats[id]) {
      stats[id] = { correct: 0, wrong: 0, ef: 2.5, intervalDays: 0, dueAt: 0, lastAt: 0 };
    }

    const s = stats[id];
    const q = isCorrect ? 5 : 2;
    s.ef = Math.max(1.3, s.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

    if (isCorrect) {
      s.correct++;
      s.intervalDays = s.intervalDays === 0 ? 3 : Math.max(3, Math.round(s.intervalDays * s.ef));
    } else {
      s.wrong++;
      s.intervalDays = 3;
    }

    s.lastAt = now;
    s.dueAt = now + (s.intervalDays * DAY);

    window.SRS.setStats(stats);
    window.SRS.updateXP(isCorrect);
  },

  updateXP: (isCorrect) => {
    const user = window.SRS.getUser();
    if (isCorrect) {
      user.combo = Math.min(4, user.combo + 1);
      user.xp += 10 * user.combo;
    } else {
      user.combo = 0;
    }

    const today = new Date().toLocaleDateString();
    if (user.lastDate !== today) {
      const last = user.lastDate ? new Date(user.lastDate) : null;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (last && last.toLocaleDateString() === yesterday.toLocaleDateString()) user.streak++;
      else user.streak = 1;

      user.lastDate = today;
    }
    window.SRS.setUser(user);
  },

  getRecent: () => JSON.parse(localStorage.getItem('toeic_recent') || '[]'),
  setRecent: (arr) => localStorage.setItem('toeic_recent', JSON.stringify(arr)),
  pushRecent: (id) => {
    const MAX = 12;
    const arr = window.SRS.getRecent().filter(x => x !== id);
    arr.unshift(id);
    if (arr.length > MAX) arr.length = MAX;
    window.SRS.setRecent(arr);
  },

  getNextWord: (excludeId = null) => {
    const stats = window.SRS.getStats();
    const now = Date.now();

    const recent = new Set(window.SRS.getRecent());
    if (excludeId) recent.add(excludeId);

    const isDue = (w) => stats[w.id] && stats[w.id].dueAt <= now;
    const isWeak = (w) => {
      const s = stats[w.id];
      return s && (s.correct + s.wrong > 0) && (s.correct / (s.correct + s.wrong) < 0.7);
    };
    const isNew = (w) => !stats[w.id] || ((stats[w.id].correct + stats[w.id].wrong) === 0);

    const dueList = window.wordData.filter(w => isDue(w) && !recent.has(w.id));
    const weakList = window.wordData.filter(w => isWeak(w) && !recent.has(w.id));
    const newList = window.wordData.filter(w => isNew(w) && !recent.has(w.id));
    const anyList = window.wordData.filter(w => !recent.has(w.id));

    const fallbackAny = window.wordData.filter(w => w.id !== excludeId);

    const r = Math.random();
    let pool = null;

    if (dueList.length && r < 0.55) pool = dueList;
    else if (weakList.length && r < 0.80) pool = weakList;
    else if (newList.length && r < 0.95) pool = newList;
    else if (anyList.length) pool = anyList;
    else pool = fallbackAny;

    const chosen = pool[Math.floor(Math.random() * pool.length)] || null;
    if (chosen) window.SRS.pushRecent(chosen.id);
    return chosen;
  }
};