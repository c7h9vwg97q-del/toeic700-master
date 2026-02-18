const SRS = {
  getStats: () => JSON.parse(localStorage.getItem('toeic_srs_stats') || '{}'),
  setStats: (stats) => localStorage.setItem('toeic_srs_stats', JSON.stringify(stats)),
  getUser: () => JSON.parse(localStorage.getItem('toeic_user') || '{"xp":0,"streak":0,"lastDate":null,"combo":0}'),
  setUser: (user) => localStorage.setItem('toeic_user', JSON.stringify(user)),

  recordResult: (id, isCorrect) => {
    const stats = SRS.getStats();
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

  // 直近履歴を保持して，同じ単語の連続出題を防ぐ
  getRecent: () => JSON.parse(localStorage.getItem('toeic_recent') || '[]'),
  setRecent: (arr) => localStorage.setItem('toeic_recent', JSON.stringify(arr)),
  pushRecent: (id) => {
    const MAX = 12; // 直近12語は避ける
    const arr = SRS.getRecent().filter(x => x !== id);
    arr.unshift(id);
    if (arr.length > MAX) arr.length = MAX;
    SRS.setRecent(arr);
  },

  // 重み付きで次を選ぶ
  getNextWord: (excludeId = null) => {
    const stats = SRS.getStats();
    const now = Date.now();
    const recent = new Set(SRS.getRecent());
    if (excludeId) recent.add(excludeId);

    const isDue = (w) => stats[w.id] && stats[w.id].dueAt <= now;
    const isWeak = (w) => {
      const s = stats[w.id];
      return s && (s.correct + s.wrong > 0) && (s.correct / (s.correct + s.wrong) < 0.7);
    };
    const isNew = (w) => !stats[w.id] || (stats[w.id].correct + stats[w.id].wrong === 0);

    // 候補作成
    const dueList = wordData.filter(w => isDue(w) && !recent.has(w.id));
    const weakList = wordData.filter(w => isWeak(w) && !recent.has(w.id));
    const newList = wordData.filter(w => isNew(w) && !recent.has(w.id));
    const anyList = wordData.filter(w => !recent.has(w.id));

    // フォールバック 直近除外で空なら除外解除
    const dueList2 = dueList.length ? dueList : wordData.filter(w => isDue(w) && w.id !== excludeId);
    const weakList2 = weakList.length ? weakList : wordData.filter(w => isWeak(w) && w.id !== excludeId);
    const newList2 = newList.length ? newList : wordData.filter(w => isNew(w) && w.id !== excludeId);
    const anyList2 = anyList.length ? anyList : wordData.filter(w => w.id !== excludeId);

    // 重み  due優先 ただし弱い or 新規も混ぜる
    // dueが1語しかない時に固定化しないように 30%で混ぜる
    const r = Math.random();

    let pickFrom = null;
    if (dueList2.length && r < 0.55) pickFrom = dueList2;
    else if (weakList2.length && r < 0.80) pickFrom = weakList2;
    else if (newList2.length && r < 0.95) pickFrom = newList2;
    else pickFrom = anyList2;

    const chosen = pickFrom[Math.floor(Math.random() * pickFrom.length)] || null;
    if (chosen) SRS.pushRecent(chosen.id);
    return chosen;
  }
};