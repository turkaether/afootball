const GAME_ORIGIN = 'https://turkaether.github.io';
const TOKEN_CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const TIMER_REWARD = 5;
const TIMER_WAIT_MS = 5 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
// Yönetici tarafından açıkça bildirilen hesaplar, ilk yönetim paneli açılışında
// güvenli ban kaydına taşınır. Aynı adla yeni bir profil oluşursa otomatik banlanmaz.
const DECLARED_ADMIN_BAN_NAMES = Object.freeze(['pipicanfk']);
// İlk yarış 2 Kasım 22:00'de başlar ve 9 Kasım 22:00'de biter.
const LEADERBOARD_START = Date.parse('2026-11-02T22:00:00+03:00');
const CODE_REWARDS = Object.freeze({
  OYUNPIYASADA: 1000,
  BUGLARICINOZURDILERIM: 1000,
  EFSANEGUNCELLEME: 500,
  '10KASIM': 2000,
});
const PACKS_DISABLED = false;
const RANK_TIERS = Object.freeze([
  { id:'unranked', name:'Unranked', need:0 },{ id:'bronze', name:'Bronz', need:500, reward:200 },
  { id:'silver', name:'Gümüş', need:1000, reward:400 },{ id:'gold', name:'Altın', need:2000, reward:700 },
  { id:'diamond', name:'Elmas', need:4000, reward:1500 },{ id:'elite', name:'Elite', need:5000, reward:4000 },
  { id:'master', name:'Master', need:7000, reward:7000 },{ id:'champion', name:'Şampiyon', need:12000, reward:30000 },
]);
function rankTier(points=0){return [...RANK_TIERS].reverse().find(t=>points>=t.need)||RANK_TIERS[0]}
function rankState(state){state.ranked=state.ranked&&typeof state.ranked==='object'?state.ranked:{};state.ranked.points=Math.max(0,Math.floor(Number(state.ranked.points)||0));state.ranked.rewards=state.ranked.rewards&&typeof state.ranked.rewards==='object'?state.ranked.rewards:{};return state.ranked}
function rankRandom(min,max){const bytes=new Uint32Array(1);crypto.getRandomValues(bytes);return min+(bytes[0]%(max-min+1))}
function rankedDelta(tierId,result){const rules={unranked:{win:[50,100],loss:[10,20],draw:[20,30]},bronze:{win:[50,100],loss:[10,20],draw:[20,30]},silver:{win:[100,200],loss:[30,50],draw:[50,100]},gold:{win:[150,250],loss:[60,80],draw:[50,70]},diamond:{win:[300,500],loss:[100,120],draw:[10,20]},elite:{win:[300,400],loss:[150,250],draw:[0,0]},master:{win:[200,400],loss:[500,800],draw:[10,20]}};const r=rules[tierId]||rules.bronze,range=r[result]||[0,0],value=rankRandom(range[0],range[1]);return result==='loss'||(tierId==='master'&&result==='draw')?-value:value}
const PLAYER_RATINGS = Object.freeze({ayaz:96,atlas:94,parhan:97,ozgur:69,alperen:68,eymenkl:60,kuzey:70,dorukhan:75,muhammed:69,vasim:64,cad:70,cihangir:78,emir:68,aliumut:79,radan:70,eymenst:75,tahir:50,sait:59,zeba:67,ayaz_defans:85,atlas_defans:83,parhan_defans:86,ozgur_defans:93,alperen_defans:91,radan_defans:93,ruzgar:79,cihangir_panter:92,olcay_panter:92,eymenkl_panter:90,ayaz_panter:85,atlas_panter:83,parhan_panter:86,ruzgar_firtina:93,kuzey_firtina:93,ayaz_simple:85,atlas_simple:83,parhan_simple:86,ruzgar_simple:79});
const PLAYER_POSITIONS = Object.freeze({ayaz:'ST',atlas:'STP',parhan:'OOS',ozgur:'OOS',alperen:'STP',eymenkl:'KL',kuzey:'SLB',dorukhan:'ST',muhammed:'SLB',vasim:'STP',cad:'OS',cihangir:'KL',emir:'STP',aliumut:'ST',radan:'STP',eymenst:'ST',tahir:'KL',sait:'STP',zeba:'OS',ayaz_defans:'ST',atlas_defans:'STP',parhan_defans:'OOS',ozgur_defans:'SLB',alperen_defans:'STP',radan_defans:'STP',ruzgar:'OS',cihangir_panter:'KL',olcay_panter:'KL',eymenkl_panter:'KL',ayaz_panter:'ST',atlas_panter:'STP',parhan_panter:'OOS',ruzgar_firtina:'OS',kuzey_firtina:'SLB',ayaz_simple:'ST',atlas_simple:'STP',parhan_simple:'OOS',ruzgar_simple:'OS'});
const PLAYER_PLAYABLE_POSITIONS = Object.freeze({ayaz:['ST','OOS','GF'],ayaz_defans:['ST','OOS','GF'],ozgur:['OS','SLB','STP','SGB'],ozgur_defans:['OS','SLB','STP','SGB'],ruzgar_firtina:['OS','DOS','OOS'],kuzey_firtina:['SLB','STP']});
const PLAYER_NATIONS = Object.freeze({ayaz:'TR',atlas:'TR',parhan:'IR',ozgur:'TR',alperen:'TR',eymenkl:'TR',kuzey:'TR',dorukhan:'TR',muhammed:'SY',vasim:'SY',cad:'SY',cihangir:'TR',emir:'TR',aliumut:'TR',radan:'IR',eymenst:'TR',tahir:'TR',sait:'TR',zeba:'RU',ayaz_defans:'TR',atlas_defans:'TR',parhan_defans:'IR',ozgur_defans:'TR',alperen_defans:'TR',radan_defans:'IR',ruzgar:'TR',cihangir_panter:'TR',olcay_panter:'PS',eymenkl_panter:'TR',ayaz_panter:'TR',atlas_panter:'TR',parhan_panter:'IR',ruzgar_firtina:'TR',kuzey_firtina:'TR',ayaz_simple:'TR',atlas_simple:'TR',parhan_simple:'IR',ruzgar_simple:'TR'});
const PLAYER_NAME_KEYS = Object.freeze({ayaz:'ayaz yücel',atlas:'atlas demir',parhan:'parhan pars',ozgur:'özgür',alperen:'alperen',eymenkl:'eymen',kuzey:'kuzey',dorukhan:'dorukhan',muhammed:'muhammed',vasim:'vasim',cad:'cad',cihangir:'cihangir',emir:'emir',aliumut:'ali umut',radan:'radan',eymenst:'eymen',tahir:'tahir',sait:'sait',zeba:'zeba',ayaz_defans:'ayaz yücel',atlas_defans:'atlas demir',parhan_defans:'parhan pars',ozgur_defans:'özgür',alperen_defans:'alperen',radan_defans:'radan',ruzgar:'rüzgar',cihangir_panter:'cihangir',olcay_panter:'olcay',eymenkl_panter:'eymen',ayaz_panter:'ayaz yücel',atlas_panter:'atlas demir',parhan_panter:'parhan pars',ruzgar_firtina:'rüzgar',kuzey_firtina:'kuzey',ayaz_simple:'ayaz yücel',atlas_simple:'atlas demir',parhan_simple:'parhan pars',ruzgar_simple:'rüzgar'});
// Kondisyonlar sunucunun kayıtlı profilinde tutulur. Bu sürüm dağıtımı bir
// defaya mahsus uygulanır; istemci bu değerleri değiştiremez.
const CONDITION_PRESET_V6 = Object.freeze({aliumut:'B',kuzey:'A',cad:'B',ozgur:'A',muhammed:'B',zeba:'D',emir:'B',vasim:'B',sait:'C',tahir:'D',eymenkl:'B'});
const CONDITION_PRESET_V7 = Object.freeze({alperen:'B'});
const CONDITION_PRESET_V8 = Object.freeze({ayaz:'A',atlas:'A',parhan:'A',ozgur:'B',alperen:'B',eymenkl:'C',kuzey:'A',dorukhan:'B',muhammed:'C',vasim:'D',cad:'C',cihangir:'B',emir:'C',aliumut:'B',radan:'B',eymenst:'B',tahir:'D',sait:'D',zeba:'C'});
const CONDITION_PRESET_V9 = Object.freeze({ayaz_defans:'A',atlas_defans:'A',parhan_defans:'A',ozgur_defans:'B',alperen_defans:'B',radan_defans:'B',ruzgar:'A'});
const CONDITION_PRESET_V10 = Object.freeze({ayaz:'B',ayaz_defans:'B',ayaz_panter:'B',ruzgar:'A',ruzgar_firtina:'A',eymenst:'B',atlas:'B',atlas_defans:'B',atlas_panter:'B',kuzey:'B',kuzey_firtina:'B',muhammed:'B',radan:'B',radan_defans:'B',cihangir:'B',cihangir_panter:'B',parhan:'B',parhan_defans:'B',parhan_panter:'B',dorukhan:'B',aliumut:'B',ozgur:'B',ozgur_defans:'B',eymenkl:'C',eymenkl_panter:'C',cad:'C',emir:'C',zeba:'C',sait:'D',tahir:'D',vasim:'D'});
const CONDITION_PRESET_V11 = Object.freeze({olcay_panter:'D'});
const CONDITION_PRESET_V12 = Object.freeze({cihangir_panter:'B',olcay_panter:'D',eymenkl_panter:'C',ruzgar_firtina:'A',kuzey_firtina:'B'});
const CONDITION_PRESET_V13 = Object.freeze({ayaz_simple:'B',atlas_simple:'B',parhan_simple:'B',ruzgar_simple:'A'});
const FORMATION_SLOTS = Object.freeze({'1-2-1':['KL','STP','OS','OS','ST'],'2-1-1':['KL','STP','SLB','OOS','ST'],'1-1-2':['KL','STP','OS','GF','ST'],'1-3':['KL','STP','ST','GF','ST'],'1-1-1-1':['KL','STP','OS','OOS','ST'],'4-0-0':['KL','SLB','STP','STP','SGB']});
const FORMATION_COORDS = Object.freeze({'1-2-1':[[50,89],[50,69],[26,47],[74,47],[50,22]],'2-1-1':[[50,89],[30,69],[70,69],[50,46],[50,22]],'1-1-2':[[50,89],[50,69],[50,48],[28,24],[72,24]],'1-3':[[50,89],[50,69],[22,28],[50,43],[78,28]],'1-1-1-1':[[50,89],[50,69],[50,52],[50,37],[50,20]],'4-0-0':[[50,89],[16,66],[38,71],[62,71],[84,66]]});
const PACK_POOL = Object.entries(PLAYER_RATINGS).map(([id,r])=>({id,r,w:['ayaz','atlas','parhan'].includes(id)?({ayaz:3,atlas:4,parhan:2}[id]):100*Math.exp(-.09*(r-50))}));
const DEFANS_IDS = Object.freeze(['ayaz_defans','atlas_defans','parhan_defans','ozgur_defans','alperen_defans','radan_defans','ruzgar','eymenkl','kuzey','dorukhan','muhammed','vasim','cad','cihangir','emir','aliumut','eymenst','tahir','sait','zeba']);
const DEFANS_PACK_POOL = DEFANS_IDS.map(id=>({id,r:PLAYER_RATINGS[id],w:['ozgur_defans','alperen_defans','radan_defans'].includes(id)?0.8:100*Math.exp(-.09*((PLAYER_RATINGS[id]||50)-50))}));
const PLAIN_PLAYER_IDS = Object.freeze(['ayaz_simple','atlas_simple','parhan_simple','ruzgar_simple','ozgur','alperen','eymenkl','kuzey','dorukhan','muhammed','vasim','cad','cihangir','emir','aliumut','radan','eymenst','tahir','sait','zeba']);
const PANTER_IDS = Object.freeze(PLAIN_PLAYER_IDS.filter(id=>!['cihangir','eymenkl'].includes(id)).concat(['cihangir_panter','olcay_panter','eymenkl_panter']));
const PANTER_PACK_POOL = PANTER_IDS.map(id=>({id,r:PLAYER_RATINGS[id],w:['cihangir_panter','olcay_panter','eymenkl_panter'].includes(id)?0.7:100*Math.exp(-.09*((PLAYER_RATINGS[id]||50)-50))}));
const FIRTINA_IDS = Object.freeze(PLAIN_PLAYER_IDS.filter(id=>!['ruzgar_simple','kuzey'].includes(id)).concat(['ruzgar_firtina','kuzey_firtina']));
const FIRTINA_PACK_POOL = FIRTINA_IDS.map(id=>({id,r:PLAYER_RATINGS[id],w:['ruzgar_firtina','kuzey_firtina'].includes(id)?0.65:100*Math.exp(-.09*((PLAYER_RATINGS[id]||50)-50))}));
const PACK_POOLS = Object.freeze({panter:PANTER_PACK_POOL,firtina:FIRTINA_PACK_POOL});
const PACK_END_AT=Date.parse('2026-11-14T22:30:00+03:00');
const PACK_START_AT=Date.parse('2026-11-07T00:00:00+03:00');
const PACK_CONFIGS = Object.freeze({panter:{startsAt:PACK_START_AT,duration:PACK_END_AT-PACK_START_AT,costs:{1:100,10:900}},firtina:{startsAt:PACK_START_AT,duration:PACK_END_AT-PACK_START_AT,costs:{1:100,10:900}}});
const COACH_PACK_CONFIG = Object.freeze({startsAt:Date.parse('2026-11-02T00:00:00+03:00'),duration:7*86400000});
// Tekrar kart iadesi yarıya iner; küsurat oyuncu lehine en yakın tam sayıya yuvarlanır.
const duplicateRefund = rating => Math.round((rating>=80?60:rating>=70?50:rating>=60?25:10)*.5);
const STARTER_IDS = ['eymenkl','sait','zeba','muhammed','eymenst'];
const BENCH_IDS = ['tahir','vasim','ozgur'];
const SECURE_TASKS = Object.freeze({matches:{text:'20 kere maç yap',goal:20,reward:100},packs:{text:'10 kere paket aç',goal:10,reward:200},reports:{text:'Bir tane bildirim yaz',goal:1,reward:100},squad80:{text:'Takım gücünü 90 yap',goal:1,reward:100},liveChampions:{text:'Canlı ligde 1 kere şampiyon ol',goal:1,reward:100},onlineWins:{text:'Canlı maçta 5 kere kazan',goal:5,reward:200}});
const FORBIDDEN_CLUB_WORDS = Object.freeze(['amk','amcik','porn','porno','sex','seks','dol','sperm','yarak','yarrak','cuk','pipi','zenci','nigger','nigga','sik','sikis','orospu','fuhus','gavat','ibne','pezevenk','fuck','fck','shit','bitch']);

let certificateCache = { expiresAt: 0, values: {} };
let serviceTokenCache = { expiresAt: 0, value: '' };

function cors(request) {
  const origin = request.headers.get('Origin');
  return {
    'Access-Control-Allow-Origin': origin === GAME_ORIGIN ? origin : GAME_ORIGIN,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin',
  };
}

function json(request, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(request), 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function base64UrlToBytes(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const raw = atob(padded);
  return Uint8Array.from(raw, char => char.charCodeAt(0));
}

function decodePart(value) {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(value)));
}

function pemToBytes(pem) {
  const body = pem.replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\s/g, '');
  return base64UrlToBytes(body.replace(/\+/g, '-').replace(/\//g, '_'));
}

function derNode(bytes, start) {
  let length = bytes[start + 1];
  let cursor = start + 2;
  if (length & 0x80) {
    const count = length & 0x7f;
    length = 0;
    for (let i = 0; i < count; i += 1) length = (length << 8) | bytes[cursor + i];
    cursor += count;
  }
  return { tag: bytes[start], start, valueStart: cursor, end: cursor + length };
}

// Firebase anahtarları X.509 sertifikası olarak gelir. Web Crypto ise SPKI ister.
function certificateToSpki(pem) {
  const bytes = pemToBytes(pem);
  const certificate = derNode(bytes, 0);
  const tbs = derNode(bytes, certificate.valueStart);
  const fields = [];
  for (let cursor = tbs.valueStart; cursor < tbs.end;) {
    const field = derNode(bytes, cursor);
    fields.push(field);
    cursor = field.end;
  }
  const spki = fields[fields[0]?.tag === 0xa0 ? 6 : 5];
  if (!spki) throw new Error('Firebase sertifikası okunamadı.');
  return bytes.slice(spki.start, spki.end).buffer;
}

async function getCertificates() {
  if (certificateCache.expiresAt > Date.now()) return certificateCache.values;
  const response = await fetch(TOKEN_CERTS_URL);
  if (!response.ok) throw new Error('Firebase doğrulama sertifikaları alınamadı.');
  const cacheControl = response.headers.get('Cache-Control') || '';
  const maxAge = Number((cacheControl.match(/max-age=(\d+)/) || [])[1] || 3600);
  const values = await response.json();
  certificateCache = { values, expiresAt: Date.now() + maxAge * 1000 };
  return values;
}

async function requireFirebaseUser(request, env) {
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Google oturumu gerekli.');

  const header = decodePart(parts[0]);
  const claims = decodePart(parts[1]);
  const now = Math.floor(Date.now() / 1000);
  if (header.alg !== 'RS256' || !header.kid || !claims.sub || claims.sub.length > 128
    || claims.aud !== env.FIREBASE_PROJECT_ID
    || claims.iss !== `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`
    || !Number.isFinite(claims.exp) || claims.exp <= now) {
    throw new Error('Google oturumu doğrulanamadı.');
  }

  const certificate = (await getCertificates())[header.kid];
  if (!certificate) throw new Error('Oturum anahtarı güncel değil. Tekrar giriş yap.');
  const key = await crypto.subtle.importKey(
    'spki', certificateToSpki(certificate), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'],
  );
  const verified = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5', key, base64UrlToBytes(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
  );
  if (!verified) throw new Error('Google oturumu doğrulanamadı.');
  return { uid: claims.sub, email: String(claims.email || '').toLowerCase() };
}
function requireAdmin(user) {
  // Yönetici yetkisi yalnız imzalı Google kimliğindeki e-posta üzerinden verilir.
  if (user.email !== 'atlasd907@gmail.com') throw new Error('Yönetici yetkisi gerekli.');
}

function toBase64Url(bytes) { let s=''; for(const b of bytes)s+=String.fromCharCode(b); return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function privateKeyBytes(pem) { return base64UrlToBytes(pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,'').replace(/\+/g,'-').replace(/\//g,'_')); }
async function serviceAccessToken(env) {
  if(serviceTokenCache.expiresAt>Date.now())return serviceTokenCache.value;
  if(!env.FIREBASE_SERVICE_ACCOUNT_JSON)throw new Error('Güvenli profil aktarımı henüz ayarlanmadı.');
  const sa=JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON),now=Math.floor(Date.now()/1000),header=toBase64Url(new TextEncoder().encode(JSON.stringify({alg:'RS256',typ:'JWT'}))),body=toBase64Url(new TextEncoder().encode(JSON.stringify({iss:sa.client_email,scope:'https://www.googleapis.com/auth/datastore',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600})));
  const key=await crypto.subtle.importKey('pkcs8',privateKeyBytes(sa.private_key),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
  const signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(`${header}.${body}`));
  const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:`${header}.${body}.${toBase64Url(new Uint8Array(signature))}`})});
  if(!response.ok)throw new Error('Firebase servis hesabı doğrulanamadı.');const data=await response.json();serviceTokenCache={value:data.access_token,expiresAt:Date.now()+Math.max(60000,(data.expires_in-60)*1000)};return data.access_token;
}
function firestoreValue(v){if('stringValue'in v)return v.stringValue;if('integerValue'in v)return Number(v.integerValue);if('doubleValue'in v)return v.doubleValue;if('booleanValue'in v)return v.booleanValue;if('nullValue'in v)return null;if('mapValue'in v){const out={};for(const[k,x]of Object.entries(v.mapValue.fields||{}))out[k]=firestoreValue(x);return out}if('arrayValue'in v)return(v.arrayValue.values||[]).map(firestoreValue);return null}
async function importLegacyProfile(env,uid){const token=await serviceAccessToken(env),url=`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/afootball_profiles/${encodeURIComponent(uid)}`,response=await fetch(url,{headers:{Authorization:`Bearer ${token}`}});if(response.status===404)return null;if(!response.ok)throw new Error('Eski profil okunamadı.');const doc=await response.json(),state=doc.fields?.state?firestoreValue(doc.fields.state):firestoreValue({mapValue:{fields:doc.fields||{}}});return state&&typeof state==='object'?state:null;}
async function listLegacyProfiles(env){const token=await serviceAccessToken(env),url=`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/afootball_profiles?pageSize=300`,response=await fetch(url,{headers:{Authorization:`Bearer ${token}`}});if(!response.ok)throw new Error('Eski profil listesi okunamadı.');const payload=await response.json();return{truncated:!!payload.nextPageToken,items:(payload.documents||[]).map(doc=>{const uid=String(doc.name||'').split('/').pop(),state=doc.fields?.state?firestoreValue(doc.fields.state):firestoreValue({mapValue:{fields:doc.fields||{}}});return{uid,teamName:String(state?.teamName||'İsimsiz takım').slice(0,15)}})}}
async function importLegacyManualBans(env,db){
  const token=await serviceAccessToken(env),url=`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/afootball_bans?pageSize=300`;
  const response=await fetch(url,{headers:{Authorization:`Bearer ${token}`}});if(!response.ok)return 0;
  const payload=await response.json(),now=Date.now(),statements=[];
  for(const doc of payload.documents||[]){const data=firestoreValue({mapValue:{fields:doc.fields||{}}})||{},uid=String(data.playerId||String(doc.name||'').split('/').pop()||''),untilAt=Number(data.until||0);if(!uid||untilAt<=now)continue;statements.push(db.prepare("INSERT INTO secure_bans (uid,reason,created_at,rename_used,active,ban_kind,until_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(uid) DO UPDATE SET reason=excluded.reason,created_at=excluded.created_at,rename_used=0,active=1,ban_kind='manual',until_at=excluded.until_at").bind(uid,'Yönetici banı',Number(data.bannedAt||now),0,1,'manual',untilAt));}
  if(statements.length)await db.batch(statements);return statements.length;
}

function clubNameKey(value) {
  return String(value || '').trim().toLocaleLowerCase('tr-TR').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').replace(/[^a-z0-9]/g, '');
}
function forbiddenClubWord(name) { const key=clubNameKey(name); return FORBIDDEN_CLUB_WORDS.find(word=>key.includes(word)) || null; }
async function applyDeclaredAdministrativeBans(db, now=Date.now()){
  if(!DECLARED_ADMIN_BAN_NAMES.length)return 0;
  const rows=await db.prepare('SELECT uid,player_name AS playerName,team_name AS teamName FROM player_profiles').all();let count=0;
  for(const declared of DECLARED_ADMIN_BAN_NAMES){const wanted=clubNameKey(declared),match=rows.results.find(p=>clubNameKey(p.playerName)===wanted||clubNameKey(p.teamName)===wanted);if(!match)continue;const existing=await db.prepare("SELECT active,ban_kind AS banKind,until_at AS untilAt FROM secure_bans WHERE uid=?").bind(match.uid).first();if(existing?.active&&String(existing.banKind)==='manual'&&Number(existing.untilAt)>now)continue;const untilAt=now+365*24*60*60*1000;await db.batch([db.prepare("INSERT INTO secure_bans (uid,reason,created_at,rename_used,active,ban_kind,until_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(uid) DO UPDATE SET reason=excluded.reason,created_at=excluded.created_at,rename_used=0,active=1,ban_kind='manual',until_at=excluded.until_at").bind(match.uid,'Yönetici banı',now,0,1,'manual',untilAt),db.prepare('DELETE FROM ranked_queue WHERE uid=?').bind(match.uid)]);count++;}
  return count;
}
async function banForClubName(db, uid, name) {
  const now=Date.now();
  await db.prepare('INSERT INTO secure_bans (uid,reason,created_at,rename_used,active) VALUES (?,?,?,?,?) ON CONFLICT(uid) DO UPDATE SET reason=excluded.reason,created_at=excluded.created_at,active=1').bind(uid,'Uygunsuz kulüp adı: '+String(name||'').slice(0,30),now,0,1).run();
}
async function permanentlyBanForClubName(db, uid, name) {
  const now=Date.now();
  await db.prepare('INSERT INTO secure_bans (uid,reason,created_at,rename_used,active) VALUES (?,?,?,?,?) ON CONFLICT(uid) DO UPDATE SET reason=excluded.reason,created_at=excluded.created_at,rename_used=1,active=1').bind(uid,'Uygunsuz kulüp adı tekrarlandı: '+String(name||'').slice(0,30),now,1,1).run();
}
async function ensurePlayerAllowed(db, uid) {
  const now=Date.now();
  const ban=await db.prepare('SELECT reason,rename_used AS renameUsed,active,ban_kind AS banKind,until_at AS untilAt FROM secure_bans WHERE uid=?').bind(uid).first();
  // Yönetici banı, tarayıcıdaki Firebase kaydına değil güvenli sunucudaki UID kaydına bağlıdır.
  // Bu yüzden cüzdan, maç, paket ve profil dahil tüm /v1 işlemleri tek noktadan engellenir.
  if(ban?.active&&String(ban.banKind||'')==='manual'){
    if(Number(ban.untilAt||0)>now)throw new Error(`Yönetici tarafından banlandın. Ban bitişi: ${new Date(Number(ban.untilAt)).toLocaleString('tr-TR')}`);
    await db.prepare('UPDATE secure_bans SET active=0 WHERE uid=?').bind(uid).run();
  }
  // Eski sürümlerdeki yasaklı-ad banları için de bir kez isim değiştirme hakkı
  // tanınır. Yalnız "tekrarlandı" olarak işaretlenen yeni ihlaller kalıcıdır.
  if(ban?.active&&String(ban.reason||'').includes('tekrarlandı'))throw new Error('Yasaklı isim tekrar denendi. Bu hesabın oyuna erişimi kalıcı olarak kapatıldı.');
  if(ban?.active)return { renameRequired:true };
  const profile=await db.prepare('SELECT team_name AS teamName FROM player_profiles WHERE uid=?').bind(uid).first();
  if(profile&&forbiddenClubWord(profile.teamName)){await banForClubName(db,uid,profile.teamName);return { renameRequired:true };}
  return { renameRequired:false };
}

async function ensureTables(db) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS player_wallets (
      uid TEXT PRIMARY KEY,
      coins INTEGER NOT NULL DEFAULT 0 CHECK (coins >= 0),
      next_reward_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS used_codes (
      uid TEXT NOT NULL,
      code TEXT NOT NULL,
      used_at INTEGER NOT NULL,
      PRIMARY KEY (uid, code)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS secure_code_redemptions (
      uid TEXT NOT NULL,
      code TEXT NOT NULL,
      used_at INTEGER NOT NULL,
      PRIMARY KEY (uid, code)
    )`),
    // Oyun profili Firebase'de değil D1'de tutulur. Böylece doğrudan Firestore
    // yazımıyla kadro, süre ve takım gücü değiştirilemez.
    db.prepare(`CREATE TABLE IF NOT EXISTS player_profiles (
      uid TEXT PRIMARY KEY,
      player_name TEXT NOT NULL DEFAULT '',
      team_name TEXT NOT NULL DEFAULT '',
      state_json TEXT NOT NULL,
      team_power INTEGER NOT NULL DEFAULT 0,
      migrated_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`),
    // Kulüp adı sahipliği de D1'de tutulur. Böylece Firestore yazma kuralı
    // değişse bile "Ayaz FK" gibi geçerli isimler güvenilir biçimde kaydedilir.
    db.prepare(`CREATE TABLE IF NOT EXISTS team_name_claims (
      name_key TEXT PRIMARY KEY,
      uid TEXT NOT NULL,
      team_name TEXT NOT NULL,
      claimed_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS player_presence (
      uid TEXT PRIMARY KEY,
      last_heartbeat_at INTEGER NOT NULL,
      play_seconds INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS weekly_playtime (
      week_start INTEGER NOT NULL,
      uid TEXT NOT NULL,
      play_seconds INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (week_start, uid)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS weekly_power (
      week_start INTEGER NOT NULL,
      uid TEXT NOT NULL,
      team_power INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (week_start, uid)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS weekly_awards (
      week_start INTEGER NOT NULL,
      category TEXT NOT NULL,
      uid TEXT NOT NULL,
      amount INTEGER NOT NULL,
      awarded_at INTEGER NOT NULL,
      PRIMARY KEY (week_start, category)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS pack_openings (
      id TEXT PRIMARY KEY,
      uid TEXT NOT NULL,
      count INTEGER NOT NULL,
      cost INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS match_sessions (
      id TEXT PRIMARY KEY, uid TEXT NOT NULL, score_a INTEGER NOT NULL, score_b INTEGER NOT NULL,
      reward INTEGER NOT NULL, started_at INTEGER NOT NULL, finished_at INTEGER
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS daily_task_claims (
      uid TEXT NOT NULL, day_key TEXT NOT NULL, task_id TEXT NOT NULL, claimed_at INTEGER NOT NULL,
      PRIMARY KEY (uid, day_key, task_id)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS secure_auctions (
      id TEXT PRIMARY KEY, seller_uid TEXT NOT NULL, player_id TEXT NOT NULL, start_price INTEGER NOT NULL,
      buy_now INTEGER NOT NULL, high_bid INTEGER NOT NULL DEFAULT 0, high_bidder_uid TEXT,
      expires_at INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'active', created_at INTEGER NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS duels (
      code TEXT PRIMARY KEY, host_uid TEXT NOT NULL, guest_uid TEXT, status TEXT NOT NULL,
      host_score INTEGER NOT NULL DEFAULT 0, guest_score INTEGER NOT NULL DEFAULT 0,
      attack TEXT NOT NULL DEFAULT 'host', minute INTEGER NOT NULL DEFAULT 1,
      host_pick TEXT, guest_pick TEXT, winner_uid TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS duel_rewards (
      code TEXT NOT NULL, uid TEXT NOT NULL, awarded_at INTEGER NOT NULL, PRIMARY KEY(code,uid)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS secure_leagues (
      code TEXT PRIMARY KEY, owner_uid TEXT NOT NULL, status TEXT NOT NULL, members_json TEXT NOT NULL,
      results_json TEXT NOT NULL DEFAULT '[]', ends_at INTEGER NOT NULL, created_at INTEGER NOT NULL
    )`),
    // Duyurular yalnız yönetici tarafından yazılır; oyuncular son yayını salt okunur alır.
    db.prepare(`CREATE TABLE IF NOT EXISTS secure_announcements (
      id TEXT PRIMARY KEY, message TEXT NOT NULL, effect TEXT NOT NULL DEFAULT 'none', created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL DEFAULT 0
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS secure_polls (
      id TEXT PRIMARY KEY, question TEXT NOT NULL, options_json TEXT NOT NULL, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS secure_poll_votes (
      poll_id TEXT NOT NULL, uid TEXT NOT NULL, choice INTEGER NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY(poll_id,uid)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS secure_mutes (
      uid TEXT PRIMARY KEY, until_at INTEGER NOT NULL, muted_at INTEGER NOT NULL, muted_by TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS secure_bans (
      uid TEXT PRIMARY KEY, reason TEXT NOT NULL, created_at INTEGER NOT NULL, rename_used INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1,
      ban_kind TEXT NOT NULL DEFAULT 'rename', until_at INTEGER NOT NULL DEFAULT 0
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS secure_notifications (
      id TEXT PRIMARY KEY, uid TEXT NOT NULL, message TEXT NOT NULL, created_at INTEGER NOT NULL, seen_at INTEGER
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS ranked_queue (
      uid TEXT PRIMARY KEY, points INTEGER NOT NULL, tier_id TEXT NOT NULL, team_power INTEGER NOT NULL, queued_at INTEGER NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS ranked_matches (
      id TEXT PRIMARY KEY, player_one_uid TEXT NOT NULL, player_two_uid TEXT, mode TEXT NOT NULL, score_one INTEGER NOT NULL, score_two INTEGER NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 5, created_at INTEGER NOT NULL, finished_at INTEGER
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS ranked_match_claims (
      match_id TEXT NOT NULL, uid TEXT NOT NULL, claimed_at INTEGER NOT NULL, PRIMARY KEY(match_id,uid)
    )`),
    db.prepare(`CREATE TRIGGER IF NOT EXISTS auction_create_guard BEFORE INSERT ON secure_auctions BEGIN
      SELECT RAISE(ABORT,'Oyuncu envanterde yok') WHERE COALESCE(json_extract((SELECT state_json FROM player_profiles WHERE uid=NEW.seller_uid),'$.owned.'||NEW.player_id),0)<1;
      SELECT RAISE(ABORT,'Kadrodaki son kart satılamaz') WHERE COALESCE(json_extract((SELECT state_json FROM player_profiles WHERE uid=NEW.seller_uid),'$.owned.'||NEW.player_id),0)=1
        AND (EXISTS(SELECT 1 FROM json_each((SELECT state_json FROM player_profiles WHERE uid=NEW.seller_uid),'$.lineup') WHERE value=NEW.player_id)
        OR EXISTS(SELECT 1 FROM json_each((SELECT state_json FROM player_profiles WHERE uid=NEW.seller_uid),'$.bench') WHERE value=NEW.player_id));
    END`),
    db.prepare(`CREATE TRIGGER IF NOT EXISTS auction_create_debit AFTER INSERT ON secure_auctions BEGIN
      UPDATE player_profiles SET state_json=json_set(state_json,'$.owned.'||NEW.player_id,COALESCE(json_extract(state_json,'$.owned.'||NEW.player_id),0)-1),updated_at=NEW.created_at WHERE uid=NEW.seller_uid;
    END`),
    db.prepare(`CREATE TRIGGER IF NOT EXISTS auction_bid_guard BEFORE UPDATE OF high_bid ON secure_auctions WHEN NEW.high_bid>OLD.high_bid BEGIN
      SELECT RAISE(ABORT,'İhale sona erdi') WHERE OLD.status!='active' OR OLD.expires_at<=CAST(strftime('%s','now') AS INTEGER)*1000;
      SELECT RAISE(ABORT,'Teklif çok düşük') WHERE NEW.high_bid<MAX(OLD.start_price,OLD.high_bid+1) OR NEW.high_bid>OLD.buy_now;
      SELECT RAISE(ABORT,'Yetersiz coin') WHERE COALESCE((SELECT coins FROM player_wallets WHERE uid=NEW.high_bidder_uid),0)<NEW.high_bid-CASE WHEN NEW.high_bidder_uid=OLD.high_bidder_uid THEN OLD.high_bid ELSE 0 END;
    END`),
    db.prepare(`CREATE TRIGGER IF NOT EXISTS auction_bid_money AFTER UPDATE OF high_bid ON secure_auctions WHEN NEW.high_bid>OLD.high_bid BEGIN
      UPDATE player_wallets SET coins=coins+OLD.high_bid WHERE uid=OLD.high_bidder_uid AND OLD.high_bidder_uid!=NEW.high_bidder_uid;
      UPDATE player_wallets SET coins=coins-(NEW.high_bid-CASE WHEN NEW.high_bidder_uid=OLD.high_bidder_uid THEN OLD.high_bid ELSE 0 END) WHERE uid=NEW.high_bidder_uid;
    END`),
    db.prepare(`CREATE TRIGGER IF NOT EXISTS auction_settle AFTER UPDATE OF status ON secure_auctions WHEN OLD.status='active' AND NEW.status IN ('sold','expired') BEGIN
      UPDATE player_wallets SET coins=coins+NEW.high_bid WHERE uid=NEW.seller_uid AND NEW.status='sold';
      UPDATE player_profiles SET state_json=json_set(state_json,'$.owned.'||NEW.player_id,COALESCE(json_extract(state_json,'$.owned.'||NEW.player_id),0)+1) WHERE uid=CASE WHEN NEW.status='sold' THEN NEW.high_bidder_uid ELSE NEW.seller_uid END;
    END`),
  ]);
  try { await db.prepare('ALTER TABLE duels ADD COLUMN league_code TEXT').run(); } catch (_) {}
  try { await db.prepare('ALTER TABLE secure_announcements ADD COLUMN expires_at INTEGER NOT NULL DEFAULT 0').run(); } catch (_) {}
  try { await db.prepare("ALTER TABLE player_profiles ADD COLUMN player_name TEXT NOT NULL DEFAULT ''").run(); } catch (_) {}
  try { await db.prepare('ALTER TABLE ranked_matches ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 5').run(); } catch (_) {}
  try { await db.prepare('ALTER TABLE secure_bans ADD COLUMN rename_used INTEGER NOT NULL DEFAULT 0').run(); } catch (_) {}
  try { await db.prepare('ALTER TABLE secure_bans ADD COLUMN active INTEGER NOT NULL DEFAULT 1').run(); } catch (_) {}
  try { await db.prepare("ALTER TABLE secure_bans ADD COLUMN ban_kind TEXT NOT NULL DEFAULT 'rename'").run(); } catch (_) {}
  try { await db.prepare('ALTER TABLE secure_bans ADD COLUMN until_at INTEGER NOT NULL DEFAULT 0').run(); } catch (_) {}
}

function weekStart(now = Date.now()) {
  if (now < LEADERBOARD_START) return null;
  return LEADERBOARD_START + Math.floor((now - LEADERBOARD_START) / WEEK_MS) * WEEK_MS;
}

function cleanState(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Geçersiz oyun kaydı.');
  // Coin yalnızca cüzdandan gelir; istemcinin gönderdiği coin ve yönetici bayrakları saklanmaz.
  const state = JSON.parse(JSON.stringify(value));
  delete state.coins; delete state.adminActive; delete state.lastSaved;
  const encoded = JSON.stringify(state);
  if (encoded.length > 110000) throw new Error('Oyun kaydı fazla büyük.');
  return { state, encoded };
}

function cryptoPick(pool) {
  const total = pool.reduce((sum, p) => sum + p.w, 0);
  const bytes = new Uint32Array(1); crypto.getRandomValues(bytes);
  let roll = bytes[0] / 0x100000000 * total;
  for (const p of pool) { roll -= p.w; if (roll <= 0) return p; }
  return pool[pool.length - 1];
}
function applyConditionPresetV6(state) {
  if (state.conditionPresetV6) return false;
  state.condition = { ...(state.condition && typeof state.condition === 'object' ? state.condition : {}), ...CONDITION_PRESET_V6 };
  state.conditionPresetV6 = true;
  return true;
}
function applyConditionPresetV7(state) {
  if (state.conditionPresetV7) return false;
  state.condition = { ...(state.condition && typeof state.condition === 'object' ? state.condition : {}), ...CONDITION_PRESET_V7 };
  state.conditionPresetV7 = true;
  return true;
}
function applyConditionPresetV8(state) {
  if (state.conditionPresetV8) return false;
  state.condition = { ...(state.condition && typeof state.condition === 'object' ? state.condition : {}), ...CONDITION_PRESET_V8 };
  state.conditionPresetV8 = true;
  return true;
}
function applyConditionPresetV9(state) {
  if (state.conditionPresetV9) return false;
  state.condition = { ...(state.condition && typeof state.condition === 'object' ? state.condition : {}), ...CONDITION_PRESET_V9 };
  state.conditionPresetV9 = true;
  return true;
}
function applyConditionPresetV10(state) {
  if (state.conditionPresetV10) return false;
  state.condition = { ...(state.condition && typeof state.condition === 'object' ? state.condition : {}), ...CONDITION_PRESET_V10 };
  state.conditionPresetV10 = true;
  return true;
}
function applyConditionPresetV11(state) {
  if (state.conditionPresetV11) return false;
  state.condition = { ...(state.condition && typeof state.condition === 'object' ? state.condition : {}), ...CONDITION_PRESET_V11 };
  state.conditionPresetV11 = true;
  return true;
}
function applyConditionPresetV12(state) {
  if (state.conditionPresetV12) return false;
  state.condition = { ...(state.condition && typeof state.condition === 'object' ? state.condition : {}), ...CONDITION_PRESET_V12 };
  state.conditionPresetV12 = true;
  return true;
}
function applyConditionPresetV13(state) {
  if (state.conditionPresetV13) return false;
  state.condition = { ...(state.condition && typeof state.condition === 'object' ? state.condition : {}), ...CONDITION_PRESET_V13 };
  state.conditionPresetV13 = true;
  return true;
}
function ensureCoachTaskBaseline(state) {
  if (Number.isFinite(Number(state.coachTaskStartMatches))) return false;
  state.coachTaskStartMatches = Math.max(0, Number(state.taskStats?.matches || 0));
  return true;
}
function initialState() { return { owned:Object.fromEntries([...STARTER_IDS,...BENCH_IDS].map(id=>[id,1])), lineup:[...STARTER_IDS], bench:[...BENCH_IDS], formation:'1-2-1', condition:{...CONDITION_PRESET_V6,...CONDITION_PRESET_V7,...CONDITION_PRESET_V8,...CONDITION_PRESET_V9,...CONDITION_PRESET_V10,...CONDITION_PRESET_V11,...CONDITION_PRESET_V12,...CONDITION_PRESET_V13},conditionPresetV6:true,conditionPresetV7:true,conditionPresetV8:true,conditionPresetV9:true,conditionPresetV10:true,conditionPresetV11:true,conditionPresetV12:true,conditionPresetV13:true,coachTaskStartMatches:0, teamName:'', w:0,l:0,taskStats:{matches:0,packs:0,reports:0,onlineWins:0,liveChampions:0},dailyTasks:null,playerStats:{},ranked:{points:0,rewards:{}},injuries:{},redCards:{},subRule:'flex',captain:null,freeKickTaker:null,penaltyTaker:null }; }
function normalizeDistinctRoster(state) {
  const owned=state.owned&&typeof state.owned==='object'?state.owned:{};
  const select=(value,limit,usedNames=new Set())=>{const result=[];for(const id of Array.isArray(value)?value:[]){const name=PLAYER_NAME_KEYS[id];if(!PLAYER_RATINGS[id]||!owned[id]||usedNames.has(name)||result.includes(id))continue;usedNames.add(name);result.push(id);if(result.length>=limit)break}return result};
  const lineup=select(state.lineup,5),names=new Set(lineup.map(id=>PLAYER_NAME_KEYS[id])),bench=select(state.bench,3,names);
  const changed=JSON.stringify(lineup)!==JSON.stringify(state.lineup||[])||JSON.stringify(bench)!==JSON.stringify(state.bench||[]);
  state.lineup=lineup;state.bench=bench;return changed;
}
function canApplyServerAbsence(state, id) {
  const owned=state.owned&&typeof state.owned==='object'?state.owned:{};
  const injuries=state.injuries&&typeof state.injuries==='object'?state.injuries:{};
  const redCards=state.redCards&&typeof state.redCards==='object'?state.redCards:{};
  return Object.keys(PLAYER_RATINGS).filter(playerId=>playerId!==id&&Number(owned[playerId]||0)>0&&!injuries[playerId]&&!redCards[playerId]).length>=5;
}
function consumeServerAbsences(state) {
  for (const key of ['injuries','redCards']) {
    const map=state[key]&&typeof state[key]==='object'?state[key]:{};
    state[key]=map;
    for (const id of Object.keys(map)) { map[id]=Number(map[id]||0)-1; if(map[id]<=0) delete map[id]; }
  }
}
// Eski Firebase profilinden yalnızca kart sahipliği bir kez geri alınabilir.
// Eski istemci kayıtları güvenilir para kaynağı değildir; coin, görev, ceza ve
// duplicate adetleri bu yolla asla taşınmaz.
function recoverLegacyRoster(current, legacy) {
  const next = JSON.parse(JSON.stringify(current));
  next.owned = next.owned && typeof next.owned === 'object' ? next.owned : {};
  const oldOwned = legacy?.owned && typeof legacy.owned === 'object' ? legacy.owned : {};
  let restored = 0;
  for (const id of Object.keys(PLAYER_RATINGS)) {
    if (Number(oldOwned[id] || 0) > 0 && Number(next.owned[id] || 0) < 1) { next.owned[id] = 1; restored++; }
  }
  const valid = ids => Array.isArray(ids) ? ids.filter((id, i, all) => PLAYER_RATINGS[id] && next.owned[id] && all.indexOf(id) === i) : [];
  const oldLineup = valid(legacy?.lineup);
  if (oldLineup.length === 5) next.lineup = oldLineup;
  next.bench = valid(legacy?.bench).filter(id => !(next.lineup || []).includes(id)).slice(0, 3);
  if (!next.teamName && typeof legacy?.teamName === 'string') next.teamName = legacy.teamName.slice(0, 15);
  next.legacyRecoveryV1 = true;
  return { state: next, restored };
}
function safeClientSettings(existing, incoming) {
  const next = JSON.parse(JSON.stringify(existing));
  next.teamName = String(incoming.teamName || next.teamName || '').slice(0, 15);
  next.formation = ['1-2-1','2-1-1','1-1-2','1-3','1-1-1-1','4-0-0'].includes(incoming.formation) ? incoming.formation : next.formation;
  const own = next.owned && typeof next.owned === 'object' ? next.owned : {};
  const cleanIds = value => {
    const ids=Array.isArray(value)?value:[],seenIds=new Set(),seenNames=new Set(),result=[];
    for(const id of ids){const name=PLAYER_NAME_KEYS[id];if(typeof id!=='string'||!own[id]||seenIds.has(id)||!name||seenNames.has(name))continue;seenIds.add(id);seenNames.add(name);result.push(id);if(result.length===5)break}
    return result;
  };
  const lineup = cleanIds(incoming.lineup);
  if (lineup.length === 5) next.lineup = lineup;
  const lineupNames=new Set(next.lineup.map(id=>PLAYER_NAME_KEYS[id]));
  const bench = cleanIds(incoming.bench).filter(id=>!next.lineup.includes(id)&&!lineupNames.has(PLAYER_NAME_KEYS[id])).slice(0,3);
  next.bench = bench;
  next.captain = next.lineup.includes(incoming.captain) ? incoming.captain : (next.captain||null);
  next.freeKickTaker = next.lineup.includes(incoming.freeKickTaker) ? incoming.freeKickTaker : (next.freeKickTaker||null);
  next.penaltyTaker = next.lineup.includes(incoming.penaltyTaker) ? incoming.penaltyTaker : (next.penaltyTaker||null);
  next.subRule = ['early','flex','late'].includes(incoming.subRule) ? incoming.subRule : (next.subRule||'flex');
  // Cihaz tercihi yalnız görsel/performance ayarıdır; yine de profil ile birlikte
  // saklanır ki aynı Google hesabında her girişte doğru mod açılsın.
  next.graphicsMode = ['mobile','desktop'].includes(incoming.graphicsMode) ? incoming.graphicsMode : (next.graphicsMode||null);
  return next;
}
function serverPositionPenalty(playerId,slotPos){const playerPos=PLAYER_POSITIONS[playerId],playable=PLAYER_PLAYABLE_POSITIONS[playerId]||[playerPos];if(playable.includes(slotPos))return 0;if(playerPos==='KL'||slotPos==='KL')return 30;if((playerPos==='SLB'||playerPos==='SGB')&&slotPos==='STP')return 2;const groups={KL:'G',STP:'D',SLB:'D',SGB:'D',OS:'M',OOS:'M',GF:'A',ST:'A'},a=groups[playerPos],b=groups[slotPos];if(a===b)return 3;const order={D:0,M:1,A:2};return Math.abs(order[a]-order[b])===1?8:14}
function serverConditionBonus(state,id){return({A:3,B:2,C:-1,D:-3})[state.condition?.[id]||'A']}
function serverCoachBonus(state,id){const coach=state.coach?.id,pos=PLAYER_POSITIONS[id];if(coach==='muhammedabi'&&['OS','OOS','GF','ST'].includes(pos))return 1;if(coach==='abdullahabi'&&['KL','STP','SLB','SGB'].includes(pos))return 1;return 0}
function serverSlotsAreNeighbors(formation,a,b){const coords=FORMATION_COORDS[formation]||FORMATION_COORDS['1-2-1'],one=coords[a],two=coords[b];return !!one&&!!two&&Math.hypot(one[0]-two[0],one[1]-two[1])<=37}
function serverChemistryBonus(lineup,id,formation,index){const nation=PLAYER_NATIONS[id];return nation?(lineup||[]).reduce((total,other,otherIndex)=>total+(other!==id&&PLAYER_NATIONS[other]===nation&&serverSlotsAreNeighbors(formation,index,otherIndex)?1:0),0):0}
function serverPower(state) {
  const lineup=Array.isArray(state.lineup)?state.lineup:[],bench=Array.isArray(state.bench)?state.bench:[],slots=FORMATION_SLOTS[state.formation]||FORMATION_SLOTS['1-2-1'],values=[];
  lineup.forEach((id,index)=>{if(!Number.isFinite(PLAYER_RATINGS[id])||!slots[index])return;values.push(PLAYER_RATINGS[id]-serverPositionPenalty(id,slots[index])+serverConditionBonus(state,id)+serverChemistryBonus(lineup,id,state.formation,index)+serverCoachBonus(state,id))});
  bench.forEach(id=>{if(Number.isFinite(PLAYER_RATINGS[id]))values.push(PLAYER_RATINGS[id]+serverConditionBonus(state,id)+serverCoachBonus(state,id))});
  return values.length ? Math.round(values.reduce((a,b)=>a+b,0)/values.length) : 0;
}

function profilePower(state) {
  // Görsel güç değeri istemcinin eski profilinden taşınır; sonraki sürümde maç ve
  // paket işlemleri de Worker'da tamamlandığında bu değer yalnız sunucuda hesaplanır.
  return serverPower(state);
}

async function profileResponse(request, db, uid, extra = {}) {
  const profile = await db.prepare('SELECT state_json AS stateJson, team_name AS teamName, team_power AS teamPower, updated_at AS updatedAt FROM player_profiles WHERE uid = ?').bind(uid).first();
  if (!profile) return json(request, { ok: true, profile: null, ...extra });
  const state = JSON.parse(profile.stateJson);
  rankState(state);
  // İki tek-seferlik güncelleme de aynı yüklemede uygulanmalıdır; || kısa devre
  // yaptığı için sonuçları önce ayrı alıyoruz.
  const conditionV6Changed = applyConditionPresetV6(state);
  const conditionV7Changed = applyConditionPresetV7(state);
  const conditionV8Changed = applyConditionPresetV8(state);
  const conditionV9Changed = applyConditionPresetV9(state);
  const conditionV10Changed = applyConditionPresetV10(state);
  const conditionV11Changed = applyConditionPresetV11(state);
  const conditionV12Changed = applyConditionPresetV12(state);
  const conditionV13Changed = applyConditionPresetV13(state);
  const coachBaselineChanged = ensureCoachTaskBaseline(state);
  const rosterChanged = normalizeDistinctRoster(state);
  if (conditionV6Changed || conditionV7Changed || conditionV8Changed || conditionV9Changed || conditionV10Changed || conditionV11Changed || conditionV12Changed || conditionV13Changed || coachBaselineChanged || rosterChanged) {
    const now = Date.now();
    const teamPower = serverPower(state);
    await db.prepare('UPDATE player_profiles SET state_json=?, team_power=?, updated_at=? WHERE uid=?').bind(JSON.stringify(state), teamPower, now, uid).run();
    profile.stateJson = JSON.stringify(state); profile.teamPower = teamPower; profile.updatedAt = now;
  }
  return json(request, { ok: true, profile: { ...profile, state }, ...extra });
}

async function recordHeartbeat(db, uid, now = Date.now()) {
  const previous = await db.prepare('SELECT last_heartbeat_at AS lastSeen FROM player_presence WHERE uid = ?').bind(uid).first();
  const elapsed = previous ? Math.max(0, Math.min(70, Math.floor((now - previous.lastSeen) / 1000))) : 0;
  await db.prepare(`INSERT INTO player_presence (uid,last_heartbeat_at,play_seconds,updated_at) VALUES (?, ?, ?, ?)
    ON CONFLICT(uid) DO UPDATE SET last_heartbeat_at=excluded.last_heartbeat_at, play_seconds=player_presence.play_seconds+excluded.play_seconds, updated_at=excluded.updated_at`)
    .bind(uid, now, elapsed, now).run();
  const currentWeek = weekStart(now);
  if (currentWeek !== null) await db.prepare(`INSERT INTO weekly_playtime (week_start,uid,play_seconds,updated_at) VALUES (?, ?, ?, ?)
    ON CONFLICT(week_start,uid) DO UPDATE SET play_seconds=weekly_playtime.play_seconds+excluded.play_seconds, updated_at=excluded.updated_at`)
    .bind(currentWeek, uid, elapsed, now).run();
  // Liderlikteki güç, istemciden gelen sayı değil D1'deki doğrulanmış kadrodan
  // her nabızda yeniden hesaplanır. İstemci dakika başı nabız gönderir.
  const profile = await db.prepare('SELECT state_json AS stateJson FROM player_profiles WHERE uid=?').bind(uid).first();
  let power = 0;
  if (profile) {
    power = serverPower(JSON.parse(profile.stateJson));
    await db.prepare('UPDATE player_profiles SET team_power=?,updated_at=? WHERE uid=?').bind(power, now, uid).run();
    if (currentWeek !== null) await db.prepare(`INSERT INTO weekly_power (week_start,uid,team_power,updated_at) VALUES (?, ?, ?, ?)
      ON CONFLICT(week_start,uid) DO UPDATE SET team_power=excluded.team_power, updated_at=excluded.updated_at`)
      .bind(currentWeek, uid, power, now).run();
  }
  return { elapsed, power };
}

async function refreshLeaderboardPowers(db, now) {
  // Tablo açıldığında tüm güvenli kadrolar yeniden hesaplanır. Böylece eski
  // istemci değeri veya gecikmiş bir kaydetme, sıralamayı yanlış gösteremez.
  const rows=await db.prepare('SELECT uid,state_json AS stateJson,team_power AS teamPower FROM player_profiles').all();
  const updates=[];
  for(const row of rows.results){const power=serverPower(JSON.parse(row.stateJson));if(power!==Number(row.teamPower))updates.push(db.prepare('UPDATE player_profiles SET team_power=?,updated_at=? WHERE uid=?').bind(power,now,row.uid));}
  if(updates.length)await db.batch(updates);
}

async function settleWeek(db, week, now) {
  if (week === null || now < week + WEEK_MS) return;
  const activeBan=`NOT EXISTS (SELECT 1 FROM secure_bans b WHERE b.uid=weekly_power.uid AND b.active=1 AND (COALESCE(b.ban_kind,'rename')!='manual' OR b.until_at>?))`;
  const power = await db.prepare(`SELECT uid FROM weekly_power WHERE week_start=? AND team_power > 0 AND ${activeBan} ORDER BY team_power DESC, updated_at ASC LIMIT 1`).bind(week,now).first();
  const time = await db.prepare(`SELECT uid FROM weekly_playtime WHERE week_start = ? AND play_seconds > 0 AND NOT EXISTS (SELECT 1 FROM secure_bans b WHERE b.uid=weekly_playtime.uid AND b.active=1 AND (COALESCE(b.ban_kind,'rename')!='manual' OR b.until_at>?)) ORDER BY play_seconds DESC, updated_at ASC LIMIT 1`).bind(week,now).first();
  for (const [category, winner] of [['power', power], ['playtime', time]]) {
    if (!winner?.uid) continue;
    const added = await db.prepare('INSERT OR IGNORE INTO weekly_awards (week_start,category,uid,amount,awarded_at) VALUES (?, ?, ?, 1000, ?)').bind(week, category, winner.uid, now).run();
    if ((added.meta.changes || 0) === 1) {
      await getWallet(db, winner.uid, now);
      await db.prepare('UPDATE player_wallets SET coins=coins+1000, updated_at=? WHERE uid=?').bind(now, winner.uid).run();
    }
  }
}

async function leaderboardResponse(request, db, uid) {
  const now = Date.now(), currentWeek = weekStart(now);
  await refreshLeaderboardPowers(db, now);
  if (currentWeek !== null) await settleWeek(db, currentWeek - WEEK_MS, now);
  const banFilter='NOT EXISTS (SELECT 1 FROM secure_bans b WHERE b.uid=p.uid AND b.active=1 AND (COALESCE(b.ban_kind,\'rename\')!=\'manual\' OR b.until_at>?))';
  const power = await db.prepare(`SELECT p.team_name AS teamName, p.team_power AS value FROM player_profiles p WHERE p.team_power > 0 AND ${banFilter} ORDER BY p.team_power DESC, p.updated_at ASC LIMIT 10`).bind(now).all();
  const coins = await db.prepare(`SELECT p.team_name AS teamName, w.coins AS value FROM player_wallets w JOIN player_profiles p ON p.uid=w.uid WHERE ${banFilter} ORDER BY w.coins DESC, w.updated_at ASC LIMIT 10`).bind(now).all();
  // Oynama süresi, çevrim içi olup olmamasına bakmadan haftalık güvenli kayıtlardan sıralanır.
  const time = currentWeek === null ? { results: [] } : await db.prepare(`SELECT p.team_name AS teamName, t.play_seconds AS value FROM weekly_playtime t JOIN player_profiles p ON p.uid=t.uid WHERE t.week_start=? AND t.play_seconds>0 AND ${banFilter} ORDER BY t.play_seconds DESC, t.updated_at ASC LIMIT 10`).bind(currentWeek,now).all();
  const awards = currentWeek === null ? { results: [] } : await db.prepare('SELECT category,uid,amount FROM weekly_awards WHERE week_start=?').bind(currentWeek - WEEK_MS).all();
  return json(request, { ok:true, currentWeek, nextAt: currentWeek === null ? LEADERBOARD_START : currentWeek + WEEK_MS, power: power.results, playtime: time.results, coins: coins.results, awards: awards.results, me: uid });
}

function taskDayKey(now=Date.now()){return new Date(now+3*3600000).toISOString().slice(0,10)}
function dailyTaskIds(uid,day){let seed=2166136261;for(const c of `${uid}:${day}`){seed^=c.charCodeAt(0);seed=Math.imul(seed,16777619)}const ids=Object.keys(SECURE_TASKS);for(let i=ids.length-1;i>0;i--){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;const j=Math.abs(seed)%(i+1);[ids[i],ids[j]]=[ids[j],ids[i]]}return ids.slice(0,3)}
async function taskPayload(db, uid, now=Date.now()){
  const profile=await db.prepare('SELECT state_json AS stateJson FROM player_profiles WHERE uid=?').bind(uid).first();
  if(!profile)throw new Error('Önce profil aktarımı gerekli.');
  const state=JSON.parse(profile.stateJson), day=taskDayKey(now), claimedRows=await db.prepare('SELECT task_id AS taskId FROM daily_task_claims WHERE uid=? AND day_key=?').bind(uid,day).all(),claimed=new Set(claimedRows.results.map(r=>r.taskId));
  return {day,items:dailyTaskIds(uid,day).map(id=>{const t=SECURE_TASKS[id],progress=id==='squad80'?serverPower(state):Number(state.taskStats?.[id]||0);return{id,...t,progress,claimed:claimed.has(id)}})};
}

async function getWallet(db, uid, now = Date.now()) {
  await db.prepare(
    'INSERT OR IGNORE INTO player_wallets (uid, coins, next_reward_at, created_at, updated_at) VALUES (?, 0, ?, ?, ?)',
  ).bind(uid, now + TIMER_WAIT_MS, now, now).run();
  return db.prepare('SELECT coins, next_reward_at AS nextRewardAt, updated_at AS walletUpdatedAt FROM player_wallets WHERE uid = ?').bind(uid).first();
}

async function walletResponse(request, db, uid, extra = {}) {
  const wallet = await getWallet(db, uid);
  return json(request, { ok: true, coins: wallet.coins, nextRewardAt: wallet.nextRewardAt, ...extra });
}

function rankedScore(tierId, myPower, opponentPower){
  const difficulty={unranked:2,bronze:2,silver:4,gold:7,diamond:8,elite:9,master:10}[tierId]||2;
  const edge=Math.max(-1,Math.min(1,(myPower-opponentPower)/12));
  const mine=Math.max(0,Math.min(4,Math.round(rankRandom(0,3)+edge-(difficulty-5)/8)));
  const theirs=Math.max(0,Math.min(4,Math.round(rankRandom(0,3)-edge+(difficulty-5)/8)));
  return {a:mine,b:theirs};
}
async function rankedMatchView(db, uid, row){
  const mine=row.player_one_uid===uid,other=mine?row.player_two_uid:row.player_one_uid;
  const profile=other?await db.prepare('SELECT team_name AS teamName,team_power AS teamPower FROM player_profiles WHERE uid=?').bind(other).first():null;
  return {matchId:row.id,score:{a:mine?row.score_one:row.score_two,b:mine?row.score_two:row.score_one},opponentName:profile?.teamName||(row.mode==='ai'?'Aşamalı Yapay Zekâ':'Rakip'),opponentPower:profile?.teamPower||null,isHuman:row.mode==='pvp',tierName:null,durationMinutes:Number(row.duration_minutes||5)};
}

async function readBody(request) {
  const type = request.headers.get('Content-Type') || '';
  if (!type.includes('application/json')) return {};
  try { return await request.json(); } catch { throw new Error('Geçersiz istek.'); }
}

export default {
  async scheduled(controller, env, ctx) {
    // Her cuma 00:00 Türkiye saatinden sonra çalışan zamanlayıcı, önceki haftanın
    // güç ve oynama süresi ödüllerini tek seferlik D1 kaydıyla dağıtır.
    ctx.waitUntil((async () => {
      await ensureTables(env.AF_DB);
      const now = Date.now();
      const expired=await env.AF_DB.prepare("SELECT id FROM secure_auctions WHERE status='active' AND expires_at<=? LIMIT 100").bind(now).all();
      for(const row of expired.results)await env.AF_DB.prepare("UPDATE secure_auctions SET status=CASE WHEN high_bidder_uid IS NULL THEN 'expired' ELSE 'sold' END WHERE id=? AND status='active'").bind(row.id).run();
      const current = weekStart(now);
      if (current !== null) await settleWeek(env.AF_DB, current - WEEK_MS, now);
    })());
  },
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(request) });
    const url = new URL(request.url);
    if (url.pathname === '/' || url.pathname === '/health') {
      return json(request, { ok: true, service: 'AFootball güvenli oyun servisi' });
    }
    if (!url.pathname.startsWith('/v1/')) return json(request, { ok: false, error: 'Bulunamadı.' }, 404);
    if (request.method !== 'POST') return json(request, { ok: false, error: 'Yalnız POST istekleri desteklenir.' }, 405);

    try {
      const user = await requireFirebaseUser(request, env);
      await ensureTables(env.AF_DB);
      const access=await ensurePlayerAllowed(env.AF_DB, user.uid);
      if(access.renameRequired&&!['/v1/team/validate','/v1/team/rename','/v1/team/claim'].includes(url.pathname))return json(request,{ok:false,error:'Uygunsuz kulüp adı nedeniyle bir defaya mahsus yeni kulüp adı seçmelisin.',renameRequired:true},403);

      if (url.pathname === '/v1/bootstrap') return walletResponse(request, env.AF_DB, user.uid);

      if (url.pathname === '/v1/team/validate') {
        const body=await readBody(request),teamName=String(body.teamName||'').trim().slice(0,15);
        if(!teamName)return json(request,{ok:false,error:'Takım adı gerekli.'},400);
        if(forbiddenClubWord(teamName)){
          if(access.renameRequired){await permanentlyBanForClubName(env.AF_DB,user.uid,teamName);return json(request,{ok:false,error:'Yasaklı isim tekrar denendi. Bu hesabın oyuna erişimi kalıcı olarak kapatıldı.'},403);}
          return json(request,{ok:false,error:'Bu kulüp adı yasaklı kelime içeriyor.'},400);
        }
        return json(request,{ok:true,teamName});
      }

      if (url.pathname === '/v1/team/claim') {
        const body=await readBody(request),teamName=String(body.teamName||'').trim().slice(0,15),nameKey=clubNameKey(teamName);
        if(!teamName||!nameKey)return json(request,{ok:false,error:'Geçerli bir takım adı yaz.'},400);
        if(forbiddenClubWord(teamName)){
          if(access.renameRequired){await permanentlyBanForClubName(env.AF_DB,user.uid,teamName);return json(request,{ok:false,error:'Yasaklı isim tekrar denendi. Bu hesabın oyuna erişimi kalıcı olarak kapatıldı.'},403);}
          return json(request,{ok:false,error:'Bu kulüp adı yasaklı kelime içeriyor.'},400);
        }
        const profile=await env.AF_DB.prepare('SELECT state_json AS stateJson,team_name AS teamName FROM player_profiles WHERE uid=?').bind(user.uid).first();
        if(!profile)return json(request,{ok:false,error:'Profil hazırlanıyor. Birkaç saniye sonra tekrar dene.'},409);
        // Aynı anahtarı iki hesabın alamaması D1 birincil anahtarı ile korunur.
        const now=Date.now();
        await env.AF_DB.prepare('INSERT INTO team_name_claims (name_key,uid,team_name,claimed_at,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(name_key) DO NOTHING').bind(nameKey,user.uid,teamName,now,now).run();
        const owner=await env.AF_DB.prepare('SELECT uid FROM team_name_claims WHERE name_key=?').bind(nameKey).first();
        if(!owner||owner.uid!==user.uid)return json(request,{ok:false,error:'Kullanıcı adı alınmış.'},409);
        const state=JSON.parse(profile.stateJson);state.teamName=teamName;
        const oldKey=clubNameKey(profile.teamName);
        const statements=[
          env.AF_DB.prepare('UPDATE team_name_claims SET team_name=?,updated_at=? WHERE name_key=? AND uid=?').bind(teamName,now,nameKey,user.uid),
          env.AF_DB.prepare('UPDATE player_profiles SET team_name=?,state_json=?,updated_at=? WHERE uid=?').bind(teamName,JSON.stringify(state),now,user.uid),
        ];
        if(oldKey&&oldKey!==nameKey)statements.push(env.AF_DB.prepare('DELETE FROM team_name_claims WHERE name_key=? AND uid=?').bind(oldKey,user.uid));
        if(access.renameRequired)statements.push(env.AF_DB.prepare('UPDATE secure_bans SET active=0,rename_used=1 WHERE uid=?').bind(user.uid));
        await env.AF_DB.batch(statements);
        return profileResponse(request,env.AF_DB,user.uid,{claimed:true,renamed:access.renameRequired,teamName});
      }

      if (url.pathname === '/v1/team/rename') {
        const body=await readBody(request),teamName=String(body.teamName||'').trim().slice(0,15);
        if(!access.renameRequired)return json(request,{ok:false,error:'Bu hesap için isim değiştirme hakkı yok.'},400);
        if(!teamName)return json(request,{ok:false,error:'Geçerli ve kurallara uygun bir kulüp adı yaz.'},400);
        if(forbiddenClubWord(teamName)){await permanentlyBanForClubName(env.AF_DB,user.uid,teamName);return json(request,{ok:false,error:'Yasaklı isim tekrar denendi. Bu hesabın oyuna erişimi kalıcı olarak kapatıldı.'},403);}
        const profile=await env.AF_DB.prepare('SELECT state_json AS stateJson FROM player_profiles WHERE uid=?').bind(user.uid).first();
        if(!profile)return json(request,{ok:false,error:'Profil bulunamadı.'},404);
        const state=JSON.parse(profile.stateJson);state.teamName=teamName;const now=Date.now();
        await env.AF_DB.batch([env.AF_DB.prepare('UPDATE player_profiles SET team_name=?,state_json=?,updated_at=? WHERE uid=?').bind(teamName,JSON.stringify(state),now,user.uid),env.AF_DB.prepare('UPDATE secure_bans SET active=0,rename_used=1 WHERE uid=?').bind(user.uid)]);
        return profileResponse(request,env.AF_DB,user.uid,{renamed:true});
      }

      if (url.pathname === '/v1/team/paid-rename') {
        const body=await readBody(request),teamName=String(body.teamName||'').trim().slice(0,15),nameKey=clubNameKey(teamName),cost=1000;
        if(!teamName||!nameKey)return json(request,{ok:false,error:'Geçerli bir kulüp adı yaz.'},400);
        if(forbiddenClubWord(teamName))return json(request,{ok:false,error:'Bu kulüp adı yasaklı kelime içeriyor.'},400);
        const profile=await env.AF_DB.prepare('SELECT state_json AS stateJson,team_name AS teamName FROM player_profiles WHERE uid=?').bind(user.uid).first();
        if(!profile)return json(request,{ok:false,error:'Profil hazırlanıyor. Birkaç saniye sonra tekrar dene.'},409);
        const oldKey=clubNameKey(profile.teamName);
        if(!oldKey||oldKey===nameKey)return json(request,{ok:false,error:'Farklı bir kulüp adı yaz.'},400);
        const wallet=await getWallet(env.AF_DB,user.uid);
        if(Number(wallet.coins||0)<cost)return json(request,{ok:false,error:'Kulüp adı değiştirmek için 1.000 coin gerekli.'},400);
        const now=Date.now();
        await env.AF_DB.prepare('INSERT INTO team_name_claims (name_key,uid,team_name,claimed_at,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(name_key) DO NOTHING').bind(nameKey,user.uid,teamName,now,now).run();
        const owner=await env.AF_DB.prepare('SELECT uid FROM team_name_claims WHERE name_key=?').bind(nameKey).first();
        if(!owner||owner.uid!==user.uid)return json(request,{ok:false,error:'Kullanıcı adı alınmış.'},409);
        const paid=await env.AF_DB.prepare('UPDATE player_wallets SET coins=coins-?,updated_at=? WHERE uid=? AND coins>=?').bind(cost,now,user.uid,cost).run();
        if(!paid.meta.changes)return json(request,{ok:false,error:'Kulüp adı değiştirmek için 1.000 coin gerekli.'},400);
        const state=JSON.parse(profile.stateJson);state.teamName=teamName;
        await env.AF_DB.batch([
          env.AF_DB.prepare('UPDATE team_name_claims SET team_name=?,updated_at=? WHERE name_key=? AND uid=?').bind(teamName,now,nameKey,user.uid),
          env.AF_DB.prepare('DELETE FROM team_name_claims WHERE name_key=? AND uid=?').bind(oldKey,user.uid),
          env.AF_DB.prepare('UPDATE player_profiles SET team_name=?,state_json=?,updated_at=? WHERE uid=?').bind(teamName,JSON.stringify(state),now,user.uid),
        ]);
        return profileResponse(request,env.AF_DB,user.uid,{renamed:true,teamName});
      }

      if (url.pathname === '/v1/profile/reset') {
        const body=await readBody(request);
        if(body.confirm!=='RESET')return json(request,{ok:false,error:'Takım sıfırlama onayı eksik.'},400);
        const profile=await env.AF_DB.prepare('SELECT team_name AS teamName FROM player_profiles WHERE uid=?').bind(user.uid).first();
        if(!profile)return json(request,{ok:false,error:'Profil bulunamadı.'},404);
        const now=Date.now(),fresh=initialState(),oldKey=clubNameKey(profile.teamName);
        const jobs=[
          env.AF_DB.prepare('UPDATE player_profiles SET team_name=?,state_json=?,team_power=?,updated_at=? WHERE uid=?').bind('',JSON.stringify(fresh),serverPower(fresh),now,user.uid),
          env.AF_DB.prepare('UPDATE player_wallets SET coins=0,next_reward_at=?,updated_at=? WHERE uid=?').bind(now+TIMER_WAIT_MS,now,user.uid),
          env.AF_DB.prepare('DELETE FROM used_codes WHERE uid=?').bind(user.uid),
          env.AF_DB.prepare('DELETE FROM secure_code_redemptions WHERE uid=?').bind(user.uid),
          env.AF_DB.prepare('DELETE FROM pack_openings WHERE uid=?').bind(user.uid),
          env.AF_DB.prepare('DELETE FROM match_sessions WHERE uid=?').bind(user.uid),
          env.AF_DB.prepare('DELETE FROM daily_task_claims WHERE uid=?').bind(user.uid),
          env.AF_DB.prepare('DELETE FROM weekly_playtime WHERE uid=?').bind(user.uid),
          env.AF_DB.prepare('DELETE FROM weekly_power WHERE uid=?').bind(user.uid),
          env.AF_DB.prepare('DELETE FROM player_presence WHERE uid=?').bind(user.uid),
          env.AF_DB.prepare('DELETE FROM secure_notifications WHERE uid=?').bind(user.uid),
          env.AF_DB.prepare('DELETE FROM secure_mutes WHERE uid=?').bind(user.uid),
        ];
        if(oldKey)jobs.push(env.AF_DB.prepare('DELETE FROM team_name_claims WHERE name_key=? AND uid=?').bind(oldKey,user.uid));
        await env.AF_DB.batch(jobs);
        return profileResponse(request,env.AF_DB,user.uid,{reset:true});
      }

      if(url.pathname==='/v1/ranked/profile'){
        await readBody(request);
        const profile=await env.AF_DB.prepare('SELECT state_json AS stateJson FROM player_profiles WHERE uid=?').bind(user.uid).first();
        if(!profile)return json(request,{ok:false,error:'Profil hazırlanıyor.'},409);
        const state=JSON.parse(profile.stateJson),ranked=rankState(state);
        const rows=await env.AF_DB.prepare("SELECT p.team_name AS teamName,COALESCE(json_extract(p.state_json,'$.ranked.points'),0) AS points FROM player_profiles p WHERE NOT EXISTS (SELECT 1 FROM secure_bans b WHERE b.uid=p.uid AND b.active=1 AND (COALESCE(b.ban_kind,'rename')!='manual' OR b.until_at>?)) ORDER BY CAST(COALESCE(json_extract(p.state_json,'$.ranked.points'),0) AS INTEGER) DESC,p.updated_at ASC LIMIT 50").bind(Date.now()).all();
        return walletResponse(request,env.AF_DB,user.uid,{ranked,leaderboard:rows.results});
      }

      if(url.pathname==='/v1/ranked/queue'){
        await readBody(request);const now=Date.now();
        await env.AF_DB.prepare('DELETE FROM ranked_queue WHERE queued_at<?').bind(now-120000).run();
        const profile=await env.AF_DB.prepare('SELECT state_json AS stateJson,team_power AS teamPower FROM player_profiles WHERE uid=?').bind(user.uid).first();
        if(!profile)return json(request,{ok:false,error:'Profil hazırlanıyor.'},409);
        const state=JSON.parse(profile.stateJson),ranked=rankState(state),tier=rankTier(ranked.points);
        if(tier.id==='champion')return json(request,{ok:false,error:'Şampiyon kademesinde aşamalı maç oynanamaz.'},400);
        const current=await env.AF_DB.prepare("SELECT * FROM ranked_matches WHERE finished_at IS NULL AND (player_one_uid=? OR player_two_uid=?) ORDER BY created_at DESC LIMIT 1").bind(user.uid,user.uid).first();
        if(current)return json(request,{ok:true,status:'matched',match:await rankedMatchView(env.AF_DB,user.uid,current)});
        const power=Number(profile.teamPower||serverPower(state));
        if(ranked.points<4000){const score=rankedScore(tier.id,power,Math.max(42,power-rankRandom(2,9))),id=crypto.randomUUID(),duration=rankRandom(1,2);await env.AF_DB.prepare('INSERT INTO ranked_matches (id,player_one_uid,mode,score_one,score_two,duration_minutes,created_at) VALUES (?,?,?,?,?,?,?)').bind(id,user.uid,'ai',score.a,score.b,duration,now).run();const row=await env.AF_DB.prepare('SELECT * FROM ranked_matches WHERE id=?').bind(id).first();const match=await rankedMatchView(env.AF_DB,user.uid,row);match.tierName=tier.name;return walletResponse(request,env.AF_DB,user.uid,{status:'ai',match});}
        await env.AF_DB.prepare('INSERT INTO ranked_queue (uid,points,tier_id,team_power,queued_at) VALUES (?,?,?,?,?) ON CONFLICT(uid) DO UPDATE SET points=excluded.points,tier_id=excluded.tier_id,team_power=excluded.team_power,queued_at=excluded.queued_at').bind(user.uid,ranked.points,tier.id,power,now).run();
        const opponent=await env.AF_DB.prepare('SELECT * FROM ranked_queue WHERE uid!=? AND tier_id=? AND team_power BETWEEN ? AND ? AND queued_at>=? ORDER BY queued_at ASC LIMIT 1').bind(user.uid,tier.id,power-5,power+5,now-120000).first();
        if(!opponent)return walletResponse(request,env.AF_DB,user.uid,{status:'waiting'});
        const scores=rankedScore(tier.id,power,opponent.team_power),id=crypto.randomUUID(),duration=rankRandom(1,2);
        await env.AF_DB.batch([env.AF_DB.prepare('INSERT INTO ranked_matches (id,player_one_uid,player_two_uid,mode,score_one,score_two,duration_minutes,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id,user.uid,opponent.uid,'pvp',scores.a,scores.b,duration,now),env.AF_DB.prepare('DELETE FROM ranked_queue WHERE uid IN (?,?)').bind(user.uid,opponent.uid)]);
        const row=await env.AF_DB.prepare('SELECT * FROM ranked_matches WHERE id=?').bind(id).first(),match=await rankedMatchView(env.AF_DB,user.uid,row);match.tierName=tier.name;return walletResponse(request,env.AF_DB,user.uid,{status:'matched',match});
      }

      if(url.pathname==='/v1/ranked/finish'){
        const body=await readBody(request),id=String(body.matchId||''),now=Date.now(),match=await env.AF_DB.prepare('SELECT * FROM ranked_matches WHERE id=? AND (player_one_uid=? OR player_two_uid=?)').bind(id,user.uid,user.uid).first();
        if(!match)return json(request,{ok:false,error:'Aşamalı maç bulunamadı.'},404);
        if(now-match.created_at<20000)return json(request,{ok:false,error:'Aşamalı maç henüz bitmedi.'},400);
        const claim=await env.AF_DB.prepare('INSERT OR IGNORE INTO ranked_match_claims (match_id,uid,claimed_at) VALUES (?,?,?)').bind(id,user.uid,now).run();
        const mine=match.player_one_uid===user.uid,score={a:mine?match.score_one:match.score_two,b:mine?match.score_two:match.score_one};
        if(!claim.meta.changes)return walletResponse(request,env.AF_DB,user.uid,{score,rankDelta:0,alreadyFinished:true});
        const profile=await env.AF_DB.prepare('SELECT state_json AS stateJson FROM player_profiles WHERE uid=?').bind(user.uid).first(),state=JSON.parse(profile.stateJson),ranked=rankState(state),before=rankTier(ranked.points),result=score.a>score.b?'win':score.a<score.b?'loss':'draw',delta=rankedDelta(before.id,result);ranked.points=Math.max(0,ranked.points+delta);
        let reward=0;for(const tier of RANK_TIERS){if(!tier.reward||ranked.rewards[tier.id]||tier.need>ranked.points)continue;ranked.rewards[tier.id]=true;reward+=tier.reward}
        const after=rankTier(ranked.points),claims=await env.AF_DB.prepare('SELECT COUNT(*) AS count FROM ranked_match_claims WHERE match_id=?').bind(id).first(),needed=match.player_two_uid?2:1;
        const jobs=[env.AF_DB.prepare('UPDATE player_profiles SET state_json=?,team_power=?,updated_at=? WHERE uid=?').bind(JSON.stringify(state),serverPower(state),now,user.uid)];
        if(reward){await getWallet(env.AF_DB,user.uid);jobs.push(env.AF_DB.prepare('UPDATE player_wallets SET coins=coins+?,updated_at=? WHERE uid=?').bind(reward,now,user.uid))}
        if(Number(claims.count)>=needed)jobs.push(env.AF_DB.prepare('UPDATE ranked_matches SET finished_at=? WHERE id=?').bind(now,id));
        await env.AF_DB.batch(jobs);
        return walletResponse(request,env.AF_DB,user.uid,{score,rankDelta:delta,rankReward:reward,ranked:{points:ranked.points},tierBefore:before.id,tierAfter:after.id});
      }

      if (url.pathname === '/v1/profile/load') return profileResponse(request, env.AF_DB, user.uid);

      if (url.pathname === '/v1/profile/migrate') {
        await readBody(request); const now = Date.now();
        const existing = await env.AF_DB.prepare('SELECT uid FROM player_profiles WHERE uid=?').bind(user.uid).first();
        const legacy=existing?null:await importLegacyProfile(env,user.uid),state=legacy?.owned?cleanState(legacy).state:initialState(),encoded=JSON.stringify(state);
        if(forbiddenClubWord(state.teamName)){
          if (!existing) await env.AF_DB.prepare('INSERT INTO player_profiles (uid,player_name,team_name,state_json,team_power,migrated_at,updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
            .bind(user.uid, String(user.email||'Oyuncu').split('@')[0].slice(0,30), String(state.teamName || '').slice(0, 15), encoded, profilePower(state), now, now).run();
          await banForClubName(env.AF_DB,user.uid,state.teamName);
          return json(request,{ok:false,error:'Uygunsuz kulüp adı nedeniyle bir defaya mahsus yeni kulüp adı seçmelisin.',renameRequired:true},403);
        }
        if (!existing) await env.AF_DB.prepare('INSERT INTO player_profiles (uid,player_name,team_name,state_json,team_power,migrated_at,updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .bind(user.uid, String(user.email||'Oyuncu').split('@')[0].slice(0,30), String(state.teamName || '').slice(0, 15), encoded, profilePower(state), now, now).run();
        return profileResponse(request, env.AF_DB, user.uid, { migrated: !existing });
      }

      if (url.pathname === '/v1/profile/recover-legacy') {
        await readBody(request); const now=Date.now();
        const profile=await env.AF_DB.prepare('SELECT state_json AS stateJson FROM player_profiles WHERE uid=?').bind(user.uid).first();
        if(!profile)return json(request,{ok:false,error:'Önce profil aktarımı gerekli.'},409);
        const current=JSON.parse(profile.stateJson);
        if(current.legacyRecoveryV1)return profileResponse(request,env.AF_DB,user.uid,{recovered:false,restored:0});
        const legacy=await importLegacyProfile(env,user.uid);
        if(!legacy?.owned){current.legacyRecoveryV1=true;await env.AF_DB.prepare('UPDATE player_profiles SET state_json=?,updated_at=? WHERE uid=?').bind(JSON.stringify(current),now,user.uid).run();return profileResponse(request,env.AF_DB,user.uid,{recovered:false,restored:0});}
        const merged=recoverLegacyRoster(current,legacy);
        if(forbiddenClubWord(merged.state.teamName)){await banForClubName(env.AF_DB,user.uid,merged.state.teamName);return json(request,{ok:false,error:'Uygunsuz kulüp adı nedeniyle bu hesaba erişim kapatıldı.'},403);}
        await env.AF_DB.prepare('UPDATE player_profiles SET team_name=?,state_json=?,team_power=?,updated_at=? WHERE uid=?').bind(String(merged.state.teamName||'').slice(0,15),JSON.stringify(merged.state),serverPower(merged.state),now,user.uid).run();
        return profileResponse(request,env.AF_DB,user.uid,{recovered:merged.restored>0,restored:merged.restored});
      }

      if (url.pathname === '/v1/profile/save') {
        const body = await readBody(request), now = Date.now(), cleaned = cleanState(body.state);
        const existing = await env.AF_DB.prepare('SELECT state_json AS stateJson FROM player_profiles WHERE uid=?').bind(user.uid).first();
        if (!existing) return json(request, { ok:false, error:'Önce profil aktarımı gerekli.' }, 409);
        const state = safeClientSettings(JSON.parse(existing.stateJson), cleaned.state), encoded = JSON.stringify(state);
        if(forbiddenClubWord(state.teamName)){await banForClubName(env.AF_DB,user.uid,state.teamName);return json(request,{ok:false,error:'Uygunsuz kulüp adı nedeniyle bu hesaba erişim kapatıldı.'},403);}
        await env.AF_DB.prepare('UPDATE player_profiles SET player_name=?, team_name=?, state_json=?, team_power=?, updated_at=? WHERE uid=?')
          .bind(String(user.email||'Oyuncu').split('@')[0].slice(0,30), String(state.teamName || '').slice(0, 15), encoded, profilePower(state), now, user.uid).run();
        return walletResponse(request, env.AF_DB, user.uid, { saved:true });
      }

      if (url.pathname === '/v1/heartbeat') {
        const heartbeat = await recordHeartbeat(env.AF_DB, user.uid);
        return walletResponse(request, env.AF_DB, user.uid, heartbeat);
      }

      if (url.pathname === '/v1/leaderboard') return leaderboardResponse(request, env.AF_DB, user.uid);

      if (url.pathname === '/v1/tasks') {
        const tasks=await taskPayload(env.AF_DB,user.uid);
        return walletResponse(request,env.AF_DB,user.uid,{tasks});
      }

      if (url.pathname === '/v1/tasks/claim') {
        const body=await readBody(request),id=String(body.taskId||''),task=SECURE_TASKS[id];
        if(!task)return json(request,{ok:false,error:'Geçersiz görev.'},400);
        const now=Date.now(),tasks=await taskPayload(env.AF_DB,user.uid,now),current=tasks.items.find(x=>x.id===id);
        if(!current||current.progress<task.goal)return json(request,{ok:false,error:'Görev henüz tamamlanmadı.'},400);
        const added=await env.AF_DB.prepare('INSERT OR IGNORE INTO daily_task_claims (uid,day_key,task_id,claimed_at) VALUES (?, ?, ?, ?)').bind(user.uid,tasks.day,id,now).run();
        if((added.meta.changes||0)!==1)return walletResponse(request,env.AF_DB,user.uid,{claimed:false,error:'Bu ödül zaten alındı.'});
        await env.AF_DB.prepare('UPDATE player_wallets SET coins=coins+?,updated_at=? WHERE uid=?').bind(task.reward,now,user.uid).run();
        return walletResponse(request,env.AF_DB,user.uid,{claimed:true,reward:task.reward,tasks:await taskPayload(env.AF_DB,user.uid,now)});
      }

      if (url.pathname === '/v1/auction/list') {
        const now=Date.now(),expired=await env.AF_DB.prepare("SELECT id FROM secure_auctions WHERE status='active' AND expires_at<=? LIMIT 50").bind(now).all();
        for(const row of expired.results)await env.AF_DB.prepare("UPDATE secure_auctions SET status=CASE WHEN high_bidder_uid IS NULL THEN 'expired' ELSE 'sold' END WHERE id=? AND status='active'").bind(row.id).run();
        const rows=await env.AF_DB.prepare("SELECT a.id,a.player_id AS playerId,a.seller_uid AS sellerId,p.team_name AS sellerName,a.start_price AS startPrice,a.buy_now AS buyNow,a.high_bid AS highBid,a.high_bidder_uid AS highBidder,a.expires_at AS expiresAt,a.status FROM secure_auctions a LEFT JOIN player_profiles p ON p.uid=a.seller_uid WHERE a.status='active' AND a.expires_at>? ORDER BY a.expires_at ASC LIMIT 100").bind(now).all();
        return json(request,{ok:true,auctions:rows.results});
      }

      if (url.pathname === '/v1/auction/create') {
        const body=await readBody(request),id=String(body.playerId||''),price=Math.floor(Number(body.price)),now=Date.now();
        if(!PLAYER_RATINGS[id]||!Number.isFinite(price)||price<10)return json(request,{ok:false,error:'Geçersiz satış bilgisi.'},400);
        const profile=await env.AF_DB.prepare('SELECT state_json AS stateJson FROM player_profiles WHERE uid=?').bind(user.uid).first();if(!profile)return json(request,{ok:false,error:'Profil bulunamadı.'},404);
        const state=JSON.parse(profile.stateJson),count=Number(state.owned?.[id]||0);if(count<1)return json(request,{ok:false,error:'Bu oyuncu sende yok.'},400);
        await env.AF_DB.prepare('INSERT INTO secure_auctions (id,seller_uid,player_id,start_price,buy_now,expires_at,created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(crypto.randomUUID(),user.uid,id,price,price*2,now+86400000,now).run();
        return walletResponse(request,env.AF_DB,user.uid,{created:true});
      }

      if(url.pathname==='/v1/auction/bid'||url.pathname==='/v1/auction/buy'){
        const body=await readBody(request),id=String(body.id||''),auction=await env.AF_DB.prepare('SELECT * FROM secure_auctions WHERE id=?').bind(id).first();
        if(!auction||auction.status!=='active'||auction.expires_at<=Date.now())return json(request,{ok:false,error:'İhale sona erdi.'},400);
        if(auction.seller_uid===user.uid)return json(request,{ok:false,error:'Kendi oyuncuna teklif veremezsin.'},400);
        const buy=url.pathname.endsWith('/buy'),amount=buy?auction.buy_now:Math.floor(Number(body.amount));
        if(!Number.isSafeInteger(amount)||amount<Math.max(auction.start_price,auction.high_bid+1)||amount>auction.buy_now)return json(request,{ok:false,error:'Geçersiz teklif.'},400);
        await getWallet(env.AF_DB,user.uid);
        const changed=await env.AF_DB.prepare("UPDATE secure_auctions SET high_bid=?,high_bidder_uid=?,status=CASE WHEN ? THEN 'sold' ELSE status END WHERE id=? AND status='active' AND high_bid=? AND expires_at>?").bind(amount,user.uid,buy?1:0,id,auction.high_bid,Date.now()).run();
        if(!changed.meta.changes)return json(request,{ok:false,error:'Bu ihaleye yeni teklif geldi. Yenile ve tekrar dene.'},409);
        return walletResponse(request,env.AF_DB,user.uid,{bid:true,bought:buy});
      }

      if(url.pathname==='/v1/duel/create'){
        const body=await readBody(request),now=Date.now(), code=crypto.randomUUID().replace(/-/g,'').slice(0,6).toUpperCase(),leagueCode=String(body.leagueCode||'').toUpperCase()||null;
        if(leagueCode){const l=await env.AF_DB.prepare("SELECT members_json AS members,status,ends_at AS endsAt FROM secure_leagues WHERE code=?").bind(leagueCode).first();if(!l||l.status!=='active'||l.endsAt<=now||!JSON.parse(l.members).some(m=>m.id===user.uid))return json(request,{ok:false,error:'Aktif canlı lig bulunamadı.'},400)}
        await env.AF_DB.prepare("INSERT INTO duels (code,host_uid,status,league_code,created_at,updated_at) VALUES (?,?,'waiting',?,?,?)").bind(code,user.uid,leagueCode,now,now).run();
        return json(request,{ok:true,code});
      }
      if(url.pathname==='/v1/duel/join'){
        const body=await readBody(request),code=String(body.code||'').toUpperCase();
        const changed=await env.AF_DB.prepare("UPDATE duels SET guest_uid=?,status='ready',updated_at=? WHERE code=? AND status='waiting' AND host_uid!=?").bind(user.uid,Date.now(),code,user.uid).run();
        if(!changed.meta.changes)return json(request,{ok:false,error:'Oda bulunamadı veya dolu.'},400);
        return json(request,{ok:true,code});
      }
      if(url.pathname==='/v1/duel/get'){
        const body=await readBody(request),row=await env.AF_DB.prepare('SELECT * FROM duels WHERE code=?').bind(String(body.code||'').toUpperCase()).first();
        if(!row||![row.host_uid,row.guest_uid].includes(user.uid))return json(request,{ok:false,error:'Oda bulunamadı.'},404);
        return json(request,{ok:true,duel:{code:row.code,status:row.status,host:row.host_uid===user.uid?'sen':'rakip',guest:row.guest_uid===user.uid?'sen':row.guest_uid?'rakip':null,hostScore:row.host_score,guestScore:row.guest_score,attack:row.attack,minute:row.minute,winner:row.winner_uid===user.uid?'sen':row.winner_uid?'rakip':null}});
      }
      if(url.pathname==='/v1/duel/start'){
        const body=await readBody(request),changed=await env.AF_DB.prepare("UPDATE duels SET status='match',updated_at=? WHERE code=? AND host_uid=? AND status='ready'").bind(Date.now(),String(body.code||'').toUpperCase(),user.uid).run();
        if(!changed.meta.changes)return json(request,{ok:false,error:'Maç başlatılamadı.'},400);return json(request,{ok:true});
      }
      if(url.pathname==='/v1/duel/pick'){
        const body=await readBody(request),code=String(body.code||'').toUpperCase(),side=['sol','orta','sağ'].includes(body.side)?body.side:null;if(!side)return json(request,{ok:false,error:'Geçersiz yön.'},400);
        const row=await env.AF_DB.prepare('SELECT * FROM duels WHERE code=?').bind(code).first();if(!row||row.status!=='match'||![row.host_uid,row.guest_uid].includes(user.uid))return json(request,{ok:false,error:'Maç uygun değil.'},400);
        const field=row.host_uid===user.uid?'host_pick':'guest_pick';if(row[field])return json(request,{ok:false,error:'Seçimini zaten yaptın.'},400);
        await env.AF_DB.prepare(`UPDATE duels SET ${field}=?,updated_at=? WHERE code=? AND ${field} IS NULL`).bind(side,Date.now(),code).run();
        const d=await env.AF_DB.prepare('SELECT * FROM duels WHERE code=?').bind(code).first();
        if(!d.host_pick||!d.guest_pick)return json(request,{ok:true,waiting:true});
        const goal=d.host_pick!==d.guest_pick,scoreField=d.attack==='host'?'host_score':'guest_score',minute=Math.min(90,d.minute+5),done=minute>=90,winner=done?(d.host_score+(d.attack==='host'&&goal?1:0)===d.guest_score+(d.attack==='guest'&&goal?1:0)?null:(d.host_score+(d.attack==='host'&&goal?1:0)>d.guest_score+(d.attack==='guest'&&goal?1:0)?d.host_uid:d.guest_uid)):null;
        await env.AF_DB.prepare(`UPDATE duels SET ${scoreField}=${scoreField}+?,attack=?,minute=?,host_pick=NULL,guest_pick=NULL,status=?,winner_uid=?,updated_at=? WHERE code=?`).bind(goal?1:0,d.attack==='host'?'guest':'host',minute,done?'finished':'match',winner,Date.now(),code).run();
        if(done&&winner){const award=await env.AF_DB.prepare('INSERT OR IGNORE INTO duel_rewards (code,uid,awarded_at) VALUES (?,?,?)').bind(code,winner,Date.now()).run();if(award.meta.changes){await getWallet(env.AF_DB,winner);await env.AF_DB.prepare('UPDATE player_wallets SET coins=coins+100,updated_at=? WHERE uid=?').bind(Date.now(),winner).run();}}
        if(done&&d.league_code){const league=await env.AF_DB.prepare('SELECT * FROM secure_leagues WHERE code=?').bind(d.league_code).first();if(league&&league.status==='active'){const members=JSON.parse(league.members_json),a=d.host_score+(d.attack==='host'&&goal?1:0),b=d.guest_score+(d.attack==='guest'&&goal?1:0),winnerId=a===b?null:a>b?d.host_uid:d.guest_uid,loserId=winnerId===d.host_uid?d.guest_uid:d.host_uid;for(const m of members){if(m.id!==d.host_uid&&m.id!==d.guest_uid)continue;m.p=(m.p||0)+1;if(!winnerId){m.d=(m.d||0)+1;m.pts=(m.pts||0)+1}else if(m.id===winnerId){m.w=(m.w||0)+1;m.gf=(m.gf||0)+1;m.pts=(m.pts||0)+3}else{m.l=(m.l||0)+1;m.ga=(m.ga||0)+1}}await env.AF_DB.prepare('UPDATE secure_leagues SET members_json=?,results_json=json_insert(results_json,\'$[#]\',json(?)) WHERE code=?').bind(JSON.stringify(members),JSON.stringify({id:code,winner:winnerId,at:Date.now()}),d.league_code).run()}}
        return json(request,{ok:true,resolved:true});
      }

      if(url.pathname==='/v1/league/create'){
        const now=Date.now(),code=crypto.randomUUID().replace(/-/g,'').slice(0,6).toUpperCase();
        const profile=await env.AF_DB.prepare('SELECT team_name AS teamName FROM player_profiles WHERE uid=?').bind(user.uid).first();
        const members=[{id:user.uid,name:profile?.teamName||'Takımım',p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}];
        await env.AF_DB.prepare("INSERT INTO secure_leagues (code,owner_uid,status,members_json,ends_at,created_at) VALUES (?,?,'waiting',?,?,?)").bind(code,user.uid,JSON.stringify(members),now+7*86400000,now).run();
        return json(request,{ok:true,code});
      }
      if(url.pathname==='/v1/league/get'||url.pathname==='/v1/league/join'||url.pathname==='/v1/league/start'){
        const body=await readBody(request),code=String(body.code||'').toUpperCase(),row=await env.AF_DB.prepare('SELECT * FROM secure_leagues WHERE code=?').bind(code).first();
        if(!row)return json(request,{ok:false,error:'Lig bulunamadı.'},404);
        let members=JSON.parse(row.members_json),status=row.status;
        if(url.pathname.endsWith('/join')){if(status!=='waiting'||row.ends_at<=Date.now())return json(request,{ok:false,error:'Bu lige katılamazsın.'},400);if(!members.some(m=>m.id===user.uid)){if(members.length>=8)return json(request,{ok:false,error:'Lig dolu.'},400);const p=await env.AF_DB.prepare('SELECT team_name AS teamName FROM player_profiles WHERE uid=?').bind(user.uid).first();members.push({id:user.uid,name:p?.teamName||'Takımım',p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0});status=members.length>=2?'ready':'waiting';await env.AF_DB.prepare('UPDATE secure_leagues SET members_json=?,status=? WHERE code=?').bind(JSON.stringify(members),status,code).run()}}
        if(url.pathname.endsWith('/start')){if(row.owner_uid!==user.uid||members.length<2)return json(request,{ok:false,error:'Lig başlatılamadı.'},400);status='active';await env.AF_DB.prepare("UPDATE secure_leagues SET status='active' WHERE code=?").bind(code).run()}
        return json(request,{ok:true,league:{code,ownerId:row.owner_uid,status,members,endsAt:row.ends_at,results:JSON.parse(row.results_json)}});
      }

      if(url.pathname==='/v1/admin/dashboard'){
        requireAdmin(user);
        try{await importLegacyManualBans(env,env.AF_DB)}catch(_){}
        const now=Date.now();
        await applyDeclaredAdministrativeBans(env.AF_DB,now);
        const [auctionRows,leagueRows,playerRows]=await Promise.all([
          env.AF_DB.prepare("SELECT a.id,a.player_id AS playerId,a.seller_uid AS sellerId,p.team_name AS sellerName,a.start_price AS startPrice,a.buy_now AS buyNow,a.high_bid AS highBid,a.expires_at AS expiresAt FROM secure_auctions a LEFT JOIN player_profiles p ON p.uid=a.seller_uid WHERE a.status='active' AND a.expires_at>? ORDER BY a.expires_at ASC LIMIT 100").bind(now).all(),
          env.AF_DB.prepare("SELECT code,owner_uid AS ownerId,status,members_json AS membersJson,ends_at AS endsAt FROM secure_leagues WHERE status!='deleted' ORDER BY created_at DESC LIMIT 100").all(),
          env.AF_DB.prepare("SELECT p.uid,p.player_name AS playerName,p.team_name AS teamName,b.active AS banActive,b.ban_kind AS banKind,b.until_at AS banUntil FROM player_profiles p LEFT JOIN secure_bans b ON b.uid=p.uid ORDER BY p.updated_at DESC LIMIT 300").all(),
        ]);
        return json(request,{ok:true,auctions:auctionRows.results,leagues:leagueRows.results.map(l=>({...l,members:JSON.parse(l.membersJson||'[]')})),players:playerRows.results});
      }

      if(url.pathname==='/v1/admin/action'){
        requireAdmin(user);const body=await readBody(request),action=String(body.action||''),id=String(body.id||'');
        if(!id)return json(request,{ok:false,error:'İşlem hedefi eksik.'},400);
        if(action==='auction-delete'){const r=await env.AF_DB.prepare("UPDATE secure_auctions SET status='deleted' WHERE id=? AND status='active'").bind(id).run();if(!r.meta.changes)return json(request,{ok:false,error:'Açık artırma bulunamadı.'},404);return json(request,{ok:true});}
        if(action==='auction-return'){const r=await env.AF_DB.prepare("UPDATE secure_auctions SET status='expired' WHERE id=? AND status='active'").bind(id).run();if(!r.meta.changes)return json(request,{ok:false,error:'Açık artırma bulunamadı.'},404);return json(request,{ok:true});}
        if(action==='league-delete'){const r=await env.AF_DB.prepare("UPDATE secure_leagues SET status='deleted' WHERE code=? AND status!='deleted'").bind(id).run();if(!r.meta.changes)return json(request,{ok:false,error:'Lig bulunamadı.'},404);return json(request,{ok:true});}
        return json(request,{ok:false,error:'Geçersiz yönetici işlemi.'},400);
      }

      if(url.pathname==='/v1/admin/ban'){
        requireAdmin(user);
        const body=await readBody(request),minutes=Math.floor(Number(body.minutes));let target=String(body.uid||'').trim();
        if(!Number.isInteger(minutes)||minutes<1||minutes>525600)return json(request,{ok:false,error:'Geçersiz ban işlemi.'},400);
        if(!target){const wanted=clubNameKey(body.name);if(wanted.length<3)return json(request,{ok:false,error:'Oyuncu adı veya kulüp adı gerekli.'},400);const candidates=await env.AF_DB.prepare('SELECT uid,player_name AS playerName,team_name AS teamName FROM player_profiles').all(),matches=candidates.results.filter(p=>clubNameKey(p.playerName)===wanted||clubNameKey(p.teamName)===wanted);if(matches.length!==1)return json(request,{ok:false,error:matches.length?'Bu ada birden fazla kayıt bulundu; listedeki ban butonunu kullan.':'Oyuncu bulunamadı.'},404);target=matches[0].uid;}
        if(target===user.uid)return json(request,{ok:false,error:'Kendi hesabını banlayamazsın.'},400);
        const profile=await env.AF_DB.prepare('SELECT uid FROM player_profiles WHERE uid=?').bind(target).first();
        if(!profile)return json(request,{ok:false,error:'Oyuncu bulunamadı.'},404);
        const now=Date.now(),untilAt=now+minutes*60000;
        await env.AF_DB.batch([
          env.AF_DB.prepare("INSERT INTO secure_bans (uid,reason,created_at,rename_used,active,ban_kind,until_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(uid) DO UPDATE SET reason=excluded.reason,created_at=excluded.created_at,rename_used=0,active=1,ban_kind='manual',until_at=excluded.until_at").bind(target,'Yönetici banı',now,0,1,'manual',untilAt),
          env.AF_DB.prepare('DELETE FROM ranked_queue WHERE uid=?').bind(target),
          env.AF_DB.prepare('INSERT INTO secure_notifications (id,uid,message,created_at) VALUES (?,?,?,?)').bind(crypto.randomUUID(),target,'Yönetici tarafından hesabına geçici erişim engeli uygulandı.',now),
        ]);
        return json(request,{ok:true,untilAt});
      }

      if(url.pathname==='/v1/admin/grant'){
        requireAdmin(user);
        const body=await readBody(request),amount=Math.floor(Number(body.amount)),target=String(body.uid||'');if(!target||!Number.isSafeInteger(amount)||amount<1||amount>1000000)return json(request,{ok:false,error:'Geçersiz coin işlemi.'},400);
        const now=Date.now();await getWallet(env.AF_DB,target);await env.AF_DB.batch([env.AF_DB.prepare('UPDATE player_wallets SET coins=coins+?,updated_at=? WHERE uid=?').bind(amount,now,target),env.AF_DB.prepare('INSERT INTO secure_notifications (id,uid,message,created_at) VALUES (?,?,?,?)').bind(crypto.randomUUID(),target,`Adminden ${amount.toLocaleString('tr-TR')} Coin Kazandın`,now)]);return json(request,{ok:true});
      }

      if(url.pathname==='/v1/notifications'){
        await readBody(request);const notice=await env.AF_DB.prepare('SELECT id,message,created_at AS createdAt FROM secure_notifications WHERE uid=? AND seen_at IS NULL ORDER BY created_at ASC LIMIT 1').bind(user.uid).first();if(notice)await env.AF_DB.prepare('UPDATE secure_notifications SET seen_at=? WHERE id=? AND uid=?').bind(Date.now(),notice.id,user.uid).run();return json(request,{ok:true,notice:notice||null});
      }

      if(url.pathname==='/v1/admin/debit'){
        requireAdmin(user);
        const body=await readBody(request),amount=Math.floor(Number(body.amount)),target=String(body.uid||'');
        if(!target||!Number.isSafeInteger(amount)||amount<1||amount>1000000)return json(request,{ok:false,error:'Geçersiz coin işlemi.'},400);
        await getWallet(env.AF_DB,target);
        const changed=await env.AF_DB.prepare('UPDATE player_wallets SET coins=coins-?,updated_at=? WHERE uid=? AND coins>=?').bind(amount,Date.now(),target,amount).run();
        if(!changed.meta.changes)return json(request,{ok:false,error:'Bakiyede yeterli coin yok.'},400);
        return walletResponse(request,env.AF_DB,target,{debited:true,amount});
      }

      if(url.pathname==='/v1/announcement/latest'){
        await readBody(request);
        const announcement=await env.AF_DB.prepare('SELECT id,message,effect,created_at AS createdAt,expires_at AS expiresAt FROM secure_announcements ORDER BY created_at DESC LIMIT 1').first();
        return json(request,{ok:true,announcement:announcement||null});
      }

      if(url.pathname==='/v1/admin/announce'){
        requireAdmin(user);
        const body=await readBody(request),message=String(body.message||'').trim().slice(0,160),effect=body.effect==='confetti'?'confetti':'none';
        if(!message)return json(request,{ok:false,error:'Duyuru metni gerekli.'},400);
        const announcement={id:crypto.randomUUID(),message,effect,createdAt:Date.now(),expiresAt:effect==='confetti'?Date.now()+30*60*1000:0};
        await env.AF_DB.prepare('INSERT INTO secure_announcements (id,message,effect,created_at,expires_at) VALUES (?,?,?,?,?)').bind(announcement.id,announcement.message,announcement.effect,announcement.createdAt,announcement.expiresAt).run();
        // D1 kaydını küçük tut: yalnız son 50 duyuru denetim için saklanır.
        await env.AF_DB.prepare('DELETE FROM secure_announcements WHERE id NOT IN (SELECT id FROM secure_announcements ORDER BY created_at DESC LIMIT 50)').run();
        return json(request,{ok:true,announcement});
      }

      if(url.pathname==='/v1/poll/current'){
        await readBody(request);const now=Date.now();
        const poll=await env.AF_DB.prepare('SELECT id,question,options_json AS optionsJson,expires_at AS expiresAt,created_at AS createdAt FROM secure_polls WHERE expires_at>? ORDER BY created_at DESC LIMIT 1').bind(now).first();
        if(!poll)return json(request,{ok:true,poll:null});
        const votes=await env.AF_DB.prepare('SELECT choice,COUNT(*) AS count FROM secure_poll_votes WHERE poll_id=? GROUP BY choice').bind(poll.id).all();
        const mine=await env.AF_DB.prepare('SELECT choice FROM secure_poll_votes WHERE poll_id=? AND uid=?').bind(poll.id,user.uid).first();
        const counts={};votes.results.forEach(v=>counts[v.choice]=Number(v.count));return json(request,{ok:true,poll:{...poll,options:JSON.parse(poll.optionsJson),counts,myChoice:mine?.choice??null}});
      }

      if(url.pathname==='/v1/admin/poll'){
        requireAdmin(user);const body=await readBody(request),question=String(body.question||'').trim().slice(0,120),options=(Array.isArray(body.options)?body.options:[]).map(x=>String(x||'').trim().slice(0,50)).filter(Boolean).slice(0,4),minutes=Math.floor(Number(body.minutes));
        if(question.length<3||options.length<2)return json(request,{ok:false,error:'Soru ve en az iki seçenek gerekli.'},400);
        if(!Number.isInteger(minutes)||minutes<1||minutes>10080)return json(request,{ok:false,error:'Anket süresi 1 ile 10.080 dakika arasında olmalı.'},400);
        const now=Date.now(),poll={id:crypto.randomUUID(),question,options,createdAt:now,expiresAt:now+minutes*60*1000};
        await env.AF_DB.prepare('INSERT INTO secure_polls (id,question,options_json,expires_at,created_at) VALUES (?,?,?,?,?)').bind(poll.id,poll.question,JSON.stringify(poll.options),poll.expiresAt,poll.createdAt).run();
        return json(request,{ok:true,poll:{...poll,counts:{},myChoice:null}});
      }

      if(url.pathname==='/v1/poll/vote'){
        const body=await readBody(request),pollId=String(body.pollId||''),choice=Math.floor(Number(body.choice)),now=Date.now();
        const poll=await env.AF_DB.prepare('SELECT options_json AS optionsJson,expires_at AS expiresAt FROM secure_polls WHERE id=?').bind(pollId).first();
        if(!poll||poll.expiresAt<=now)return json(request,{ok:false,error:'Anket aktif değil.'},400);
        const options=JSON.parse(poll.optionsJson);if(!Number.isInteger(choice)||choice<0||choice>=options.length)return json(request,{ok:false,error:'Geçersiz seçenek.'},400);
        const inserted=await env.AF_DB.prepare('INSERT OR IGNORE INTO secure_poll_votes (poll_id,uid,choice,created_at) VALUES (?,?,?,?)').bind(pollId,user.uid,choice,now).run();
        if(!inserted.meta.changes)return json(request,{ok:false,error:'Bu ankette zaten oy kullandın.'},400);
        return json(request,{ok:true,voted:true});
      }

      if(url.pathname==='/v1/chat/mute-status'){
        await readBody(request);const row=await env.AF_DB.prepare('SELECT until_at AS untilAt FROM secure_mutes WHERE uid=?').bind(user.uid).first();return json(request,{ok:true,muted:!!row&&row.untilAt>Date.now(),untilAt:row?.untilAt||0});
      }

      if(url.pathname==='/v1/admin/mute'){
        requireAdmin(user);const body=await readBody(request),uid=String(body.uid||''),minutes=Math.floor(Number(body.minutes));
        if(!uid||!Number.isInteger(minutes)||minutes<1||minutes>525600)return json(request,{ok:false,error:'Geçersiz mute süresi.'},400);
        const now=Date.now(),untilAt=now+minutes*60000;await env.AF_DB.prepare('INSERT INTO secure_mutes (uid,until_at,muted_at,muted_by) VALUES (?,?,?,?) ON CONFLICT(uid) DO UPDATE SET until_at=excluded.until_at,muted_at=excluded.muted_at,muted_by=excluded.muted_by').bind(uid,untilAt,now,user.uid).run();return json(request,{ok:true,untilAt});
      }

      if (url.pathname === '/v1/claim-timer') {
        const now = Date.now();
        await getWallet(env.AF_DB, user.uid, now);
        const claim = await env.AF_DB.prepare(
          'UPDATE player_wallets SET coins = coins + ?, next_reward_at = ?, updated_at = ? WHERE uid = ? AND next_reward_at <= ?',
        ).bind(TIMER_REWARD, now + TIMER_WAIT_MS, now, user.uid, now).run();
        return walletResponse(request, env.AF_DB, user.uid, { claimed: (claim.meta.changes || 0) === 1, reward: TIMER_REWARD });
      }

      if (url.pathname === '/v1/redeem') {
        const body = await readBody(request);
        const code = String(body.code || '').trim().toLocaleUpperCase('tr-TR');
        const reward = CODE_REWARDS[code];
        if (!reward) return json(request, { ok: false, error: 'Geçersiz kod.' }, 400);
        const now = Date.now();
        await getWallet(env.AF_DB, user.uid, now);
        const legacy = await env.AF_DB.prepare('SELECT 1 FROM used_codes WHERE uid=? AND code=? LIMIT 1').bind(user.uid, code).first();
        if (legacy) return walletResponse(request, env.AF_DB, user.uid, { redeemed: false, error: 'Bu kod daha önce kullanıldı.' });
        const inserted = await env.AF_DB.prepare(
          'INSERT OR IGNORE INTO secure_code_redemptions (uid, code, used_at) VALUES (?, ?, ?)',
        ).bind(user.uid, code, now).run();
        if ((inserted.meta.changes || 0) !== 1) return walletResponse(request, env.AF_DB, user.uid, { redeemed: false, error: 'Bu kod daha önce kullanıldı.' });
        await env.AF_DB.prepare('INSERT OR IGNORE INTO used_codes (uid, code, used_at) VALUES (?, ?, ?)').bind(user.uid, code, now).run();
        await env.AF_DB.prepare('UPDATE player_wallets SET coins = coins + ?, updated_at = ? WHERE uid = ?')
          .bind(reward, now, user.uid).run();
        return walletResponse(request, env.AF_DB, user.uid, { redeemed: true, reward, message: code==='10KASIM'?'Her zaman kalbimizde yaşıyor.':'' });
      }

      if (url.pathname === '/v1/pack/open') {
        if(PACKS_DISABLED)return json(request,{ok:false,error:'Paketler yeni duyuruya kadar kaldırıldı.'},400);
        const body = await readBody(request), count = Number(body.count) === 10 ? 10 : Number(body.count) === 1 ? 1 : 0, packId=String(body.packId||'bombaci');
        if (!count) return json(request, { ok:false, error:'Geçersiz paket isteği.' }, 400);
        const packConfig=PACK_CONFIGS[packId],basePool=PACK_POOLS[packId];
        if(!packConfig||!basePool)return json(request,{ok:false,error:'Geçersiz paket.'},400);
        const now=Date.now();if(now<packConfig.startsAt||now>=packConfig.startsAt+packConfig.duration)return json(request,{ok:false,error:'Bu paketin yayın süresi doldu.'},400);
        const profile = await env.AF_DB.prepare('SELECT state_json AS stateJson FROM player_profiles WHERE uid=?').bind(user.uid).first();
        if (!profile) return json(request, { ok:false, error:'Önce profil aktarımı gerekli.' }, 409);
        const cost=packConfig.costs[count]; await getWallet(env.AF_DB,user.uid,now);
        const wallet=await env.AF_DB.prepare('SELECT coins FROM player_wallets WHERE uid=?').bind(user.uid).first();
        if (!wallet || wallet.coins<cost) return json(request,{ok:false,error:'Yeterli coin yok.'},400);
        const state=JSON.parse(profile.stateJson), results=[]; state.owned=state.owned&&typeof state.owned==='object'?state.owned:{};
        // Admin Abuse yalnızca 10 dakika sürer. Bu süre boyunca 90+ kartların
        // paket ağırlığı iki katına çıkar; karar tamamen D1'de verilir.
        const abuse=await env.AF_DB.prepare("SELECT 1 FROM secure_announcements WHERE effect='confetti' AND expires_at>? ORDER BY expires_at DESC LIMIT 1").bind(now).first();
        const pool=abuse?basePool.map(p=>({...p,w:p.r>=90?p.w*2:p.w})):basePool;
        let refund=0;
        for(let i=0;i<count;i++){const p=cryptoPick(pool), had=Number(state.owned[p.id]||0), dup=had>0, add=dup?duplicateRefund(p.r):0;state.owned[p.id]=had+1;refund+=add;results.push({id:p.id,dup,refund:add});}
        state.taskStats=state.taskStats&&typeof state.taskStats==='object'?state.taskStats:{};state.taskStats.packs=Number(state.taskStats.packs||0)+count;
        await env.AF_DB.batch([
          env.AF_DB.prepare('UPDATE player_wallets SET coins=coins-?+?,updated_at=? WHERE uid=?').bind(cost,refund,now,user.uid),
          env.AF_DB.prepare('UPDATE player_profiles SET state_json=?,team_power=?,updated_at=? WHERE uid=?').bind(JSON.stringify(state),serverPower(state),now,user.uid),
          env.AF_DB.prepare('INSERT INTO pack_openings (id,uid,count,cost,created_at) VALUES (?, ?, ?, ?, ?)').bind(crypto.randomUUID(),user.uid,count,cost,now),
        ]);
        return walletResponse(request,env.AF_DB,user.uid,{opened:true,packId,results,refund,cost});
      }

      if (url.pathname === '/v1/coach/claim') {
        const body=await readBody(request),coachId=String(body.coachId||'');
        if(!['muhammedabi','abdullahabi'].includes(coachId))return json(request,{ok:false,error:'Geçersiz teknik direktör.'},400);
        const now=Date.now();if(now<COACH_PACK_CONFIG.startsAt||now>=COACH_PACK_CONFIG.startsAt+COACH_PACK_CONFIG.duration)return json(request,{ok:false,error:'Teknik Direktör Paketi’nin yayın süresi doldu.'},400);
        const profile=await env.AF_DB.prepare('SELECT state_json AS stateJson FROM player_profiles WHERE uid=?').bind(user.uid).first();
        if(!profile)return json(request,{ok:false,error:'Önce profil aktarımı gerekli.'},409);
        const state=JSON.parse(profile.stateJson);ensureCoachTaskBaseline(state);const matches=Math.max(0,Number(state.taskStats?.matches||0)-Number(state.coachTaskStartMatches||0)),claimed=Number(state.coachPacksClaimed||0);
        if(Math.floor(matches/75)<=claimed)return json(request,{ok:false,error:'Seçmeli sözleşme paketin yok. 75 maç tamamla.'},400);
        state.coach={id:coachId,name:coachId==='muhammedabi'?'Muhammed Abi':'Abdullah Abi',skill:80};state.coachPacksClaimed=claimed+1;
        await env.AF_DB.prepare('UPDATE player_profiles SET state_json=?,team_power=?,updated_at=? WHERE uid=?').bind(JSON.stringify(state),serverPower(state),now,user.uid).run();
        return walletResponse(request,env.AF_DB,user.uid,{claimed:true,coach:state.coach,state});
      }

      if (url.pathname === '/v1/match/start') {
        const profile=await env.AF_DB.prepare('SELECT state_json AS stateJson FROM player_profiles WHERE uid=?').bind(user.uid).first();
        if(!profile)return json(request,{ok:false,error:'Önce profil aktarımı gerekli.'},409);
        const recent=await env.AF_DB.prepare('SELECT started_at AS startedAt FROM match_sessions WHERE uid=? ORDER BY started_at DESC LIMIT 1').bind(user.uid).first();
        if(recent&&Date.now()-recent.startedAt<55000)return json(request,{ok:false,error:'Yeni maç için önce önceki maçın tamamlanmasını bekle.'},429);
        const state=JSON.parse(profile.stateJson);consumeServerAbsences(state);const power=serverPower(state), bytes=new Uint32Array(3);crypto.getRandomValues(bytes);
        const rival=58+(bytes[0]%30), edge=(power-rival)/18, scoreA=Math.max(0,Math.min(5,Math.floor(bytes[1]%3+(edge>0?1:0)))), scoreB=Math.max(0,Math.min(5,Math.floor(bytes[2]%3+(edge<0?1:0))));
        const normalReward=scoreA>scoreB?10+(bytes[0]%41):scoreA===scoreB?10:1+(bytes[0]%5);
        const abuse=await env.AF_DB.prepare("SELECT 1 FROM secure_announcements WHERE effect='confetti' AND expires_at>? ORDER BY expires_at DESC LIMIT 1").bind(Date.now()).first();
        const multiplier=abuse?2:1,reward=normalReward*multiplier,id=crypto.randomUUID(),now=Date.now();
        await env.AF_DB.batch([
          env.AF_DB.prepare('INSERT INTO match_sessions (id,uid,score_a,score_b,reward,started_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id,user.uid,scoreA,scoreB,reward,now),
          env.AF_DB.prepare('UPDATE player_profiles SET state_json=?,team_power=?,updated_at=? WHERE uid=?').bind(JSON.stringify(state),power,now,user.uid),
        ]);
        return json(request,{ok:true,sessionId:id,serverScore:{a:scoreA,b:scoreB},minimumFinishAt:now+20000});
      }

      if (url.pathname === '/v1/match/finish') {
        const body=await readBody(request),id=String(body.sessionId||''),now=Date.now(),match=await env.AF_DB.prepare('SELECT * FROM match_sessions WHERE id=? AND uid=?').bind(id,user.uid).first();
        if(!match)return json(request,{ok:false,error:'Geçersiz maç oturumu.'},400);
        if(match.finished_at)return walletResponse(request,env.AF_DB,user.uid,{finished:true,score:{a:match.score_a,b:match.score_b},reward:0,alreadyFinished:true});
        if(now-match.started_at<20000)return json(request,{ok:false,error:'Maç henüz bitmedi.'},400);
        const profile=await env.AF_DB.prepare('SELECT state_json AS stateJson FROM player_profiles WHERE uid=?').bind(user.uid).first(),state=JSON.parse(profile.stateJson),reported=body.stats&&typeof body.stats==='object'?body.stats:{},owned=state.owned&&typeof state.owned==='object'?state.owned:{},goals=reported.goals&&typeof reported.goals==='object'?reported.goals:{},assists=reported.assists&&typeof reported.assists==='object'?reported.assists:{},appearances=Array.isArray(reported.appearances)?[...new Set(reported.appearances.filter(id=>typeof id==='string'&&owned[id]))].slice(0,8):[];
        const goalTotal=Object.entries(goals).reduce((sum,[id,n])=>sum+(owned[id]?Math.max(0,Math.min(5,Math.floor(Number(n)||0))):0),0),assistTotal=Object.entries(assists).reduce((sum,[id,n])=>sum+(owned[id]?Math.max(0,Math.min(5,Math.floor(Number(n)||0))):0),0);
        state.playerStats=state.playerStats&&typeof state.playerStats==='object'?state.playerStats:{};
        for(const id of appearances){const st=state.playerStats[id]&&typeof state.playerStats[id]==='object'?state.playerStats[id]:{goals:0,assists:0,matches:0};st.matches=Math.max(0,Number(st.matches)||0)+1;state.playerStats[id]=st}
        if(goalTotal===match.score_a&&assistTotal<=goalTotal){for(const [id,n] of Object.entries(goals)){if(!owned[id])continue;const st=state.playerStats[id]||{goals:0,assists:0,matches:0};st.goals=Math.max(0,Number(st.goals)||0)+Math.max(0,Math.min(5,Math.floor(Number(n)||0)));state.playerStats[id]=st}for(const [id,n] of Object.entries(assists)){if(!owned[id])continue;const st=state.playerStats[id]||{goals:0,assists:0,matches:0};st.assists=Math.max(0,Number(st.assists)||0)+Math.max(0,Math.min(5,Math.floor(Number(n)||0)));state.playerStats[id]=st}}
        state.w=Number(state.w||0)+(match.score_a>match.score_b?1:0);state.l=Number(state.l||0)+(match.score_a<match.score_b?1:0);state.taskStats=state.taskStats||{};state.taskStats.matches=Number(state.taskStats.matches||0)+1;
        await env.AF_DB.batch([env.AF_DB.prepare('UPDATE match_sessions SET finished_at=? WHERE id=?').bind(now,id),env.AF_DB.prepare('UPDATE player_wallets SET coins=coins+?,updated_at=? WHERE uid=?').bind(match.reward,now,user.uid),env.AF_DB.prepare('UPDATE player_profiles SET state_json=?,team_power=?,updated_at=? WHERE uid=?').bind(JSON.stringify(state),serverPower(state),now,user.uid)]);
        return walletResponse(request,env.AF_DB,user.uid,{finished:true,score:{a:match.score_a,b:match.score_b},reward:match.reward});
      }

      if (url.pathname === '/v1/match/absence') {
        const body=await readBody(request),id=String(body.sessionId||''),playerId=String(body.playerId||''),type=String(body.type||''),now=Date.now();
        if(!PLAYER_RATINGS[playerId]||!['injury','red'].includes(type))return json(request,{ok:false,error:'Geçersiz maç olayı.'},400);
        const match=await env.AF_DB.prepare('SELECT finished_at AS finishedAt FROM match_sessions WHERE id=? AND uid=?').bind(id,user.uid).first();
        if(!match||match.finishedAt)return json(request,{ok:false,error:'Bu maç oturumu kapandı.'},400);
        const profile=await env.AF_DB.prepare('SELECT state_json AS stateJson FROM player_profiles WHERE uid=?').bind(user.uid).first();
        if(!profile)return json(request,{ok:false,error:'Önce profil aktarımı gerekli.'},409);
        const state=JSON.parse(profile.stateJson);state.injuries=state.injuries&&typeof state.injuries==='object'?state.injuries:{};state.redCards=state.redCards&&typeof state.redCards==='object'?state.redCards:{};
        if(!(state.lineup||[]).includes(playerId)||state.injuries[playerId]||state.redCards[playerId]||!canApplyServerAbsence(state,playerId))return json(request,{ok:false,error:'Kadro güvenliği nedeniyle bu olay uygulanamadı.'},400);
        let games=2;
        if(type==='injury'){
          if(Object.keys(state.injuries).length)return json(request,{ok:false,error:'Takımda zaten sakat oyuncu var.'},400);
          const bytes=new Uint32Array(1);crypto.getRandomValues(bytes);games=1+(bytes[0]%3);state.injuries[playerId]=games;
        }else state.redCards[playerId]=2;
        await env.AF_DB.prepare('UPDATE player_profiles SET state_json=?,team_power=?,updated_at=? WHERE uid=?').bind(JSON.stringify(state),serverPower(state),now,user.uid).run();
        return walletResponse(request,env.AF_DB,user.uid,{recorded:true,type,playerId,games});
      }

      return json(request, { ok: false, error: 'Bilinmeyen güvenli işlem.' }, 404);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sunucu işlemi tamamlanamadı.';
      return json(request, { ok: false, error: message }, message.includes('oturumu') ? 401 : 400);
    }
  },
};
