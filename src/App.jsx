import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Plus, TrendingUp, TrendingDown, Target, Trash2, Wallet } from 'lucide-react';

const CATEGORIES = [
  'Freelance/Gigs', 'Food', 'Transport', 'Rent/Bills', 'Data/Airtime',
  'Savings', 'Family', 'Business', 'Other'
];

const CAT_COLORS = {
  'Freelance/Gigs': '#D4A24C', 'Food': '#E2725B', 'Transport': '#7A9E8E',
  'Rent/Bills': '#B85C7A', 'Data/Airtime': '#6E8FA8', 'Savings': '#D4A24C',
  'Family': '#C98A4B', 'Business': '#8E7CC3', 'Other': '#6E8A76'
};

const TXN_KEY = 'kadiri_transactions';
const GOAL_KEY = 'kadiri_goal';

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

export default function App() {
  const [txns, setTxns] = useState(() => loadFromStorage(TXN_KEY, []));
  const [goal, setGoal] = useState(() => loadFromStorage(GOAL_KEY, { name: '', target: 0, saved: 0 }));
  const [form, setForm] = useState({ type: 'income', amount: '', category: 'Freelance/Gigs', note: '' });
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [goalDraft, setGoalDraft] = useState({ name: '', target: '' });

  useEffect(() => {
    localStorage.setItem(TXN_KEY, JSON.stringify(txns));
  }, [txns]);

  useEffect(() => {
    localStorage.setItem(GOAL_KEY, JSON.stringify(goal));
  }, [goal]);

  const totals = useMemo(() => {
    const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [txns]);

  const byCategory = useMemo(() => {
    const map = {};
    txns.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [txns]);

  const addTxn = () => {
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return;
    const newTxn = {
      id: Date.now().toString(),
      type: form.type,
      amount: amt,
      category: form.category,
      note: form.note,
      date: new Date().toISOString()
    };
    setTxns([newTxn, ...txns]);
    setForm({ ...form, amount: '', note: '' });
  };

  const removeTxn = (id) => setTxns(txns.filter(t => t.id !== id));

  const saveGoal = () => {
    const target = parseFloat(goalDraft.target);
    if (!goalDraft.name || !target) return;
    setGoal({ name: goalDraft.name, target, saved: goal.saved || 0 });
    setShowGoalEdit(false);
  };

  const fmt = (n) => 'KES ' + n.toLocaleString('en-KE', { maximumFractionDigits: 0 });

  const goalPct = goal.target ? Math.min(100, (totals.balance > 0 ? totals.balance : 0) / goal.target * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#10241C', color: '#F1EDE2', fontFamily: "'IBM Plex Sans', sans-serif", padding: '24px 16px 60px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
        * { box-sizing: border-box; }
        input, select { font-family: 'IBM Plex Sans', sans-serif; }
        ::placeholder { color: #6E8A76; }
        button { cursor: pointer; }
        .num { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      <div style={{ maxWidth: 480, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Wallet size={22} color="#D4A24C" />
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 26, margin: 0, letterSpacing: '-0.01em' }}>Kadiri Ledger</h1>
        </div>
        <p style={{ color: '#8FA895', fontSize: 13, margin: '0 0 24px', letterSpacing: '0.02em' }}>your money, tracked simply</p>

        <div style={{
          background: '#17301F', borderRadius: 14, padding: '20px 20px 24px',
          border: '1px solid #26452F', marginBottom: 16,
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(212,162,76,0.02) 8px, rgba(212,162,76,0.02) 16px)'
        }}>
          <div style={{ fontSize: 12, color: '#8FA895', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Current Balance</div>
          <div className="num" style={{ fontSize: 34, fontWeight: 600, color: totals.balance >= 0 ? '#F1EDE2' : '#E2725B' }}>{fmt(totals.balance)}</div>

          <div style={{ display: 'flex', gap: 20, marginTop: 16, paddingTop: 16, borderTop: '1px dashed #2E4E38' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={16} color="#D4A24C" />
              <div>
                <div style={{ fontSize: 11, color: '#8FA895' }}>Income</div>
                <div className="num" style={{ fontSize: 15, fontWeight: 600 }}>{fmt(totals.income)}</div>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingDown size={16} color="#E2725B" />
              <div>
                <div style={{ fontSize: 11, color: '#8FA895' }}>Expenses</div>
                <div className="num" style={{ fontSize: 15, fontWeight: 600 }}>{fmt(totals.expense)}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#17301F', borderRadius: 14, padding: 18, border: '1px solid #26452F', marginBottom: 16 }}>
          {!goal.name ? (
            !showGoalEdit ? (
              <button onClick={() => setShowGoalEdit(true)} style={{
                width: '100%', background: 'none', border: '1px dashed #4A6E52', borderRadius: 10,
                padding: '12px', color: '#8FA895', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}>
                <Target size={15} /> Set a savings goal
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input placeholder="Goal name (e.g. New phone)" value={goalDraft.name}
                  onChange={e => setGoalDraft({ ...goalDraft, name: e.target.value })}
                  style={{ background: '#10241C', border: '1px solid #2E4E38', borderRadius: 8, padding: '10px 12px', color: '#F1EDE2', fontSize: 14 }} />
                <input placeholder="Target amount (KES)" type="number" value={goalDraft.target}
                  onChange={e => setGoalDraft({ ...goalDraft, target: e.target.value })}
                  style={{ background: '#10241C', border: '1px solid #2E4E38', borderRadius: 8, padding: '10px 12px', color: '#F1EDE2', fontSize: 14 }} />
                <button onClick={saveGoal} style={{ background: '#D4A24C', border: 'none', borderRadius: 8, padding: '10px', color: '#10241C', fontWeight: 600, fontSize: 13 }}>Save goal</button>
              </div>
            )
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Target size={15} color="#D4A24C" />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{goal.name}</span>
                </div>
                <span className="num" style={{ fontSize: 12, color: '#8FA895' }}>{fmt(Math.max(0, totals.balance))} / {fmt(goal.target)}</span>
              </div>
              <div style={{ height: 8, background: '#10241C', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${goalPct}%`, background: 'linear-gradient(90deg, #B8863E, #D4A24C)', borderRadius: 4, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          )}
        </div>

        <div style={{ background: '#17301F', borderRadius: 14, padding: 18, border: '1px solid #26452F', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button onClick={() => setForm({ ...form, type: 'income' })} style={{
              flex: 1, padding: '9px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600,
              background: form.type === 'income' ? '#D4A24C' : '#10241C',
              color: form.type === 'income' ? '#10241C' : '#8FA895'
            }}>Income</button>
            <button onClick={() => setForm({ ...form, type: 'expense' })} style={{
              flex: 1, padding: '9px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600,
              background: form.type === 'expense' ? '#E2725B' : '#10241C',
              color: form.type === 'expense' ? '#10241C' : '#8FA895'
            }}>Expense</button>
          </div>
          <input placeholder="Amount (KES)" type="number" value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            style={{ width: '100%', background: '#10241C', border: '1px solid #2E4E38', borderRadius: 8, padding: '10px 12px', color: '#F1EDE2', fontSize: 14, marginBottom: 8 }} />
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            style={{ width: '100%', background: '#10241C', border: '1px solid #2E4E38', borderRadius: 8, padding: '10px 12px', color: '#F1EDE2', fontSize: 14, marginBottom: 8 }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input placeholder="Note (optional)" value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })}
            style={{ width: '100%', background: '#10241C', border: '1px solid #2E4E38', borderRadius: 8, padding: '10px 12px', color: '#F1EDE2', fontSize: 14, marginBottom: 10 }} />
          <button onClick={addTxn} style={{
            width: '100%', background: '#F1EDE2', border: 'none', borderRadius: 8, padding: '11px',
            color: '#10241C', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}>
            <Plus size={16} /> Add entry
          </button>
        </div>

        {byCategory.length > 0 && (
          <div style={{ background: '#17301F', borderRadius: 14, padding: '18px 12px', border: '1px solid #26452F', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#8FA895', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, paddingLeft: 6 }}>Spending by category</div>
            <ResponsiveContainer width="100%" height={Math.max(120, byCategory.length * 34)}>
              <BarChart data={byCategory} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#8FA895', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#10241C', border: '1px solid #2E4E38', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => fmt(v)} labelStyle={{ color: '#F1EDE2' }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {byCategory.map((entry, i) => <Cell key={i} fill={CAT_COLORS[entry.name] || '#6E8A76'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div style={{ fontSize: 12, color: '#8FA895', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px 4px' }}>Recent entries</div>
        {txns.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#5A7862', fontSize: 13, padding: '30px 0' }}>No entries yet — add your first one above.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {txns.slice(0, 30).map(t => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#17301F', borderRadius: 10, padding: '11px 14px', border: '1px solid #21402A'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: t.type === 'income' ? '#D4A24C' : '#E2725B', flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.category}</div>
                    {t.note && <div style={{ fontSize: 11, color: '#8FA895', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.note}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span className="num" style={{ fontSize: 14, fontWeight: 600, color: t.type === 'income' ? '#D4A24C' : '#E2725B' }}>
                    {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
                  </span>
                  <button onClick={() => removeTxn(t.id)} style={{ background: 'none', border: 'none', color: '#4A6E52', padding: 4 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
