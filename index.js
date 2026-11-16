const { onDocumentCreated, onDocumentWritten } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function push(keys, title, body) {
  keys = [...new Set(keys.filter(Boolean).map(String))].slice(0, 10);
  if (!keys.length) return;
  const snap = await db.collection('fcm_tokens').where('keys', 'array-contains-any', keys).get();
  const tokens = snap.docs.map(d => d.id).slice(0, 500);
  if (!tokens.length) return;
  const res = await admin.messaging().sendEachForMulticast({
    tokens, notification: { title, body },
    webpush: { notification: { dir: 'rtl', lang: 'ar' } }
  });
  const dead = [];
  res.responses.forEach((r, i) => { if (!r.success && /not-registered|invalid-registration/.test((r.error && r.error.code) || '')) dead.push(tokens[i]); });
  await Promise.all(dead.map(t => db.collection('fcm_tokens').doc(t).delete()));
}

// كل إشعار بيكتبه الموقع (طلبات إجازة، موافقات، أعطال...) يوصل للموبايل
exports.onNotif = onDocumentCreated('notifications/{id}', e => {
  const d = e.data.data();
  return push([d.to], d.title || 'إشعار جديد', d.msg || '');
});
// طلب اصرفلي جديد → مهندس الوردية، والرد → صاحب الطلب
exports.onRequisition = onDocumentWritten('requisitions/{id}', e => {
  const a = e.data.after && e.data.after.data(), b = e.data.before && e.data.before.data();
  if (!a) return;
  if (!b) return push([a.lead], '📦 طلب صرف جديد', `${a.by}: ${a.item} × ${a.qty}`);
  if (b.status !== a.status) return push([a.by, a.code], a.status === 'approved' ? '✅ كود الصرف جاهز' : '❌ طلب الصرف اترفض', a.status === 'approved' ? `${a.item}: ${a.srCode}` : (a.rej || ''));
});
// رسالة جديدة في «اسأل المهندس»
exports.onAsk = onDocumentWritten('ask_chats/{id}', e => {
  const a = e.data.after && e.data.after.data(), b = e.data.before && e.data.before.data();
  if (!a || !a.last || (b && b.last && b.last.ts === a.last.ts)) return;
  return push(a.last.by === a.askerName ? [a.lead] : [a.asker, a.askerName], '💬 ' + a.last.by, a.last.txt || '');
});
