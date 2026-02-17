const SRS = {
  getStats: () => JSON.parse(localStorage.getItem('toeic_srs_stats') || '{}'),
  setStats: (stats) => localStorage.setItem('toeic_srs_stats', JSON.stringify(stats)),
  getUser: () => JSON.parse(localStorage.getItem('toeic_user') || '{"xp":0, "streak":0, "lastDate":null, "combo":0}'),
  setUser: (user) => localStorage.setItem('toeic_user', JSON.stringify(user)),

  recordResult: (id, isCorrect) => {
    const stats = SRS.getStats();
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    
    if (!stats[id]) {
      stats[id] = { correct: 0, wrong: 0, ef: 2.5, intervalDays: 0, dueAt: 0, lastAt: 0 };
    }
    
    const s = stats[id];
    const q = isCorrect ? 5 : 2; // SM2の簡易Q値
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
    SRS.setStats(stats);
    SRS.updateXP(isCorrect);
  },

  updateXP: (isCorrect) => {
    const user = SRS.getUser();
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
      if (last && last.toLocaleDateString() === yesterday.toLocaleDateString()) {
        user.streak++;
      } else {
        user.streak = 1;
      }
      user.lastDate = today;
    }
    SRS.setUser(user);
  },

  getNextWord: (excludeId = null) => {
    const stats = SRS.getStats();
    const now = Date.now();
    // 1. Due
    let list = wordData.filter(w => stats[w.id] && stats[w.id].dueAt <= now && w.id !== excludeId);
    if (list.length) return list[Math.floor(Math.random() * list.length)];
    // 2. Weak
    list = wordData.filter(w => {
      const s = stats[w.id];
      return s && (s.correct + s.wrong > 0) && (s.correct/(s.correct+s.wrong) < 0.7) && w.id !== excludeId;
    });
    if (list.length) return list[Math.floor(Math.random() * list.length)];
    // 3. New/Random
    list = wordData.filter(w => w.id !== excludeId);
    return list[Math.floor(Math.random() * list.length)];
  }
};