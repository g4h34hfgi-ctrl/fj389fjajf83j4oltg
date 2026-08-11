/* ================= CONFIG COMPARTIDA ================= */
const WATCHLIST_US = [
  ["AAPL","Apple"],["MSFT","Microsoft"],["GOOGL","Alphabet / Google"],["AMZN","Amazon"],
  ["NVDA","NVIDIA"],["META","Meta"],["TSLA","Tesla"],["JPM","JPMorgan"]
];
const WATCHLIST_AR = [
  ["GGAL","Grupo Financiero Galicia"],["YPF","YPF"],["BMA","Banco Macro"],
  ["PAM","Pampa Energía"],["TGS","Transportadora Gas del Sur"],["CRESY","Cresud"],
  ["LOMA","Loma Negra"],["EDN","Edenor"],["IRS","IRSA"],["SUPV","Grupo Supervielle"],["BBAR","BBVA Banco Francés"]
];
const NEWS_FEEDS = [
  {name:"Ámbito", url:"https://www.ambito.com/rss/pages/mercados.xml"},
  {name:"El Cronista", url:"https://www.cronista.com/files/rss/finanzas-mercados.xml"},
  {name:"Yahoo Finance", url:"https://finance.yahoo.com/news/rssindex"},
  {name:"MarketWatch", url:"https://feeds.marketwatch.com/marketwatch/topstories/"}
];
const REFRESH_MS = 4 * 60 * 1000;

/* ================= LOGIN (localStorage real — funciona en cualquier hosting) ================= */
const PIN_KEY = "panel_pin_hash_v1";

async function sha256(msg){
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

async function tryUnlock(){
  const input = document.getElementById("pin").value.trim();
  const errEl = document.getElementById("gateErr");
  if(!input){ errEl.textContent = "Ingresá tu PIN."; return; }
  const stored = localStorage.getItem(PIN_KEY);
  if(!stored){
    const h = await sha256(input);
    localStorage.setItem(PIN_KEY, h);
    openApp();
    return;
  }
  const h = await sha256(input);
  if(h === stored){ openApp(); }
  else{ errEl.textContent = "PIN incorrecto."; document.getElementById("pin").value=""; }
}

function checkSession(){
  // Si ya se desbloqueó antes en este navegador (misma sesión de pestaña), no repreguntar al cambiar de página
  if(sessionStorage.getItem("panel_unlocked")==="1" && localStorage.getItem(PIN_KEY)){
    document.getElementById("gate").style.display = "none";
    document.getElementById("app").style.display = "block";
    initPage();
    setInterval(loadAll, REFRESH_MS);
  }
}

function openApp(){
  sessionStorage.setItem("panel_unlocked","1");
  document.getElementById("gate").style.display = "none";
  document.getElementById("app").style.display = "block";
  initPage();
  setInterval(loadAll, REFRESH_MS);
}

function initTopClock(){
  const el = document.getElementById("clock-time");
  function tick(){ if(el) el.textContent = new Date().toLocaleTimeString("es-AR"); }
  tick(); setInterval(tick, 1000);
}

/* ================= UNIVERSO CEDEARs (110+, tickers reales de EE.UU./globales listados como CEDEAR en BYMA) ================= */
const CEDEARS_UNIVERSE = [
  ["AAPL","Apple"],["MSFT","Microsoft"],["GOOGL","Alphabet"],["AMZN","Amazon"],["NVDA","NVIDIA"],
  ["META","Meta Platforms"],["TSLA","Tesla"],["AVGO","Broadcom"],["ORCL","Oracle"],["ADBE","Adobe"],
  ["CRM","Salesforce"],["CSCO","Cisco"],["INTC","Intel"],["AMD","AMD"],["QCOM","Qualcomm"],
  ["TXN","Texas Instruments"],["IBM","IBM"],["NOW","ServiceNow"],["INTU","Intuit"],["UBER","Uber"],
  ["PYPL","PayPal"],["SHOP","Shopify"],["SNOW","Snowflake"],["PLTR","Palantir"],["ABNB","Airbnb"],
  ["NFLX","Netflix"],["DIS","Walt Disney"],["SONY","Sony"],["BABA","Alibaba"],["ASML","ASML"],
  ["SAP","SAP"],["JPM","JPMorgan Chase"],["BAC","Bank of America"],["WFC","Wells Fargo"],["GS","Goldman Sachs"],
  ["MS","Morgan Stanley"],["C","Citigroup"],["V","Visa"],["MA","Mastercard"],["AXP","American Express"],
  ["BLK","BlackRock"],["SCHW","Charles Schwab"],["PNC","PNC Financial"],["USB","U.S. Bancorp"],["JNJ","Johnson & Johnson"],
  ["PFE","Pfizer"],["UNH","UnitedHealth"],["MRK","Merck"],["ABBV","AbbVie"],["LLY","Eli Lilly"],
  ["BMY","Bristol Myers Squibb"],["GILD","Gilead Sciences"],["AMGN","Amgen"],["CVS","CVS Health"],["MDT","Medtronic"],
  ["TMO","Thermo Fisher"],["ABT","Abbott Labs"],["NVO","Novo Nordisk"],["KO","Coca-Cola"],["PEP","PepsiCo"],
  ["WMT","Walmart"],["PG","Procter & Gamble"],["MCD","McDonald's"],["SBUX","Starbucks"],["NKE","Nike"],
  ["HD","Home Depot"],["LOW","Lowe's"],["TGT","Target"],["COST","Costco"],["EL","Estée Lauder"],
  ["CL","Colgate-Palmolive"],["KHC","Kraft Heinz"],["MO","Altria"],["PM","Philip Morris Int."],["CAT","Caterpillar"],
  ["BA","Boeing"],["GE","General Electric"],["HON","Honeywell"],["MMM","3M"],["UPS","UPS"],
  ["FDX","FedEx"],["LMT","Lockheed Martin"],["RTX","RTX Corp"],["DE","Deere & Co"],["UNP","Union Pacific"],
  ["XOM","Exxon Mobil"],["CVX","Chevron"],["COP","ConocoPhillips"],["SLB","SLB"],["OXY","Occidental Petroleum"],
  ["BP","BP"],["SHEL","Shell"],["T","AT&T"],["VZ","Verizon"],["TMUS","T-Mobile US"],
  ["CMCSA","Comcast"],["FCX","Freeport-McMoRan"],["NEM","Newmont"],["LIN","Linde"],["DOW","Dow Inc."],
  ["PLD","Prologis"],["AMT","American Tower"],["F","Ford Motor"],["GM","General Motors"],["STLA","Stellantis"],
  ["EBAY","eBay"],["ETSY","Etsy"],["MELI","MercadoLibre"],["GLOB","Globant"],["DESP","Despegar.com"],
  ["VIST","Vista Energy"]
];

/* ================= ACCIONES LOCALES ARGENTINAS — sin ADR, solo referencia (sin precio en vivo por fuente gratuita) ================= */
const LOCAL_AR_REFERENCE = [
  ["COME","Sociedad Comercial del Plata","Holding / Industrial"],
  ["TECO2","Telecom Argentina","Telecomunicaciones"],
  ["TRAN","Transener","Energía / Transporte eléctrico"],
  ["MIRG","Mirgor","Industrial / Electrónica"],
  ["CVH","Cablevisión Holding","Medios / Telecomunicaciones"],
  ["CAPX","Capex","Energía"],
  ["MOLI","Molinos Río de la Plata","Alimentos"],
  ["MOLA","Molinos Agro","Agroindustria"],
  ["SAMI","San Miguel","Agroindustria / Cítricos"],
  ["PATY","Quickfood","Alimentos"],
  ["RIGO","Rigolleau","Industrial / Envases"],
  ["GARO","Garovaglio y Zorraquín","Holding"],
  ["GRIM","Grimoldi","Consumo / Calzado"],
  ["FERR","Ferrum","Industrial / Sanitarios"],
  ["CELU","Celulosa Argentina","Papel / Celulosa"],
  ["CARC","Carboclor","Petroquímica"],
  ["IRCP","IRSA Propiedades Comerciales","Real Estate"],
  ["CTIO","Consultatio","Real Estate"],
  ["BOLT","Boldt","Industrial / Juegos"],
  ["DYCA","Dycasa","Construcción"],
  ["VALO","Grupo Financiero Valores","Financiero"],
  ["LONG","Longvie","Industrial / Electrodomésticos"],
  ["MORI","Morixe","Alimentos"],
  ["FIPL","Fiplasto","Industrial / Plásticos"],
  ["POLL","Polledo","Agro / Bodegas"],
  ["OEST","Oeste Grupo Concesionario","Concesiones viales"],
  ["INVJ","Inversora Juramento","Agroindustria"],
  ["HAVA","Havanna Holding","Consumo / Alimentos"],
  ["AGRO","Agrometal","Industrial / Maquinaria agrícola"],
  ["METR","Metrogas","Energía / Distribución de gas"],
  ["CGPA2","Central Térmica Güemes","Energía"],
  ["DGCU2","Distribuidora de Gas Cuyana","Energía / Distribución de gas"],
  ["GBAN","Gas Natural Ban","Energía / Distribución de gas"]
];

/* ================= INDICADORES TÉCNICOS ================= */
function sma(arr,n){ if(arr.length<n) return null; const s=arr.slice(-n); return s.reduce((a,b)=>a+b,0)/n; }
function rsi(closes,n=14){
  if(closes.length<n+1) return null;
  let gains=0, losses=0;
  for(let i=closes.length-n;i<closes.length;i++){
    const diff = closes[i]-closes[i-1];
    if(diff>=0) gains+=diff; else losses-=diff;
  }
  const avgGain=gains/n, avgLoss=losses/n;
  if(avgLoss===0) return 100;
  const rs=avgGain/avgLoss;
  return 100-(100/(1+rs));
}
function signal(price, sma20, sma50, rsi14){
  let score=0;
  if(sma20!=null) score += price>sma20 ? 1 : -1;
  if(sma50!=null) score += price>sma50 ? 1 : -1;
  if(rsi14!=null){
    if(rsi14<30) score+=2;
    else if(rsi14>70) score-=2;
  }
  const intensity = Math.round(Math.abs(score)/4*100); // qué tan fuerte disparó la regla, NO una probabilidad de acierto
  let base, cls;
  if(score>=3){ base="Compra fuerte"; cls="p-buy2"; }
  else if(score>=1){ base="Compra"; cls="p-buy1"; }
  else if(score===0){ base="Neutral"; cls="p-neutral"; }
  else if(score>=-2){ base="Venta"; cls="p-sell1"; }
  else { base="Venta fuerte"; cls="p-sell2"; }
  const label = score===0 ? base : `${base} (${intensity}%)`;
  return {label, cls, intensity, base};
}

/* ================= DATOS: PRECIOS (Yahoo Finance vía proxy CORS, sin API key) ================= */
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min — dentro de esta ventana, reusa lo ya bajado en vez de pedirlo de nuevo

async function fetchViaProxy(targetUrl){
  const proxies = [
    u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    u => `https://corsproxy.io/?url=${encodeURIComponent(u)}`
  ];
  let lastErr;
  for(const build of proxies){
    try{
      const r = await fetch(build(targetUrl));
      if(!r.ok) throw new Error("HTTP "+r.status);
      return await r.json();
    }catch(e){ lastErr = e; }
  }
  throw lastErr || new Error("Ambos proxies fallaron");
}

async function fetchHistory(ticker){
  const cacheKey = "hist_"+ticker;
  try{
    const raw = localStorage.getItem(cacheKey);
    if(raw){
      const parsed = JSON.parse(raw);
      if(Date.now() - parsed.ts < CACHE_TTL_MS) return parsed.data;
    }
  }catch(e){ /* localStorage lleno o no disponible, seguimos sin cache */ }

  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1y&interval=1d`;
  const data = await fetchViaProxy(yahooUrl);
  const result = data?.chart?.result?.[0];
  if(!result) throw new Error("Sin datos para "+ticker);
  const timestamps = result.timestamp || [];
  const q = result.indicators?.quote?.[0] || {};
  const rawCloses = q.close || [];
  const rawVolumes = q.volume || [];
  const closes = [], dates = [], volumes = [];
  timestamps.forEach((ts,i)=>{
    const c = rawCloses[i];
    if(c!=null){ closes.push(c); dates.push(new Date(ts*1000).toISOString().slice(0,10)); volumes.push(rawVolumes[i] ?? null); }
  });
  const meta = result.meta || {};
  const lastClose = meta.regularMarketPrice ?? closes[closes.length-1] ?? null;
  const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? (closes.length>1 ? closes[closes.length-2] : null);
  const dataOut = { closes, dates, volumes, lastOpen: prevClose, lastClose };

  try{ localStorage.setItem(cacheKey, JSON.stringify({ts:Date.now(), data:dataOut})); }catch(e){ /* si se llena el localStorage, seguimos sin guardar cache */ }
  return dataOut;
}

/* pool de concurrencia: procesa la lista con varios pedidos en simultáneo en vez de uno por uno */
async function runPool(items, concurrency, worker){
  const results = new Array(items.length);
  let idx = 0;
  async function runNext(){
    while(idx < items.length){
      const cur = idx++;
      results[cur] = await worker(items[cur], cur);
    }
  }
  const workers = Array.from({length: Math.min(concurrency, items.length)}, runNext);
  await Promise.all(workers);
  return results;
}

/* cache en memoria (por pestaña) de históricos ya usados, para abrir el modal de detalle sin re-pedir nada */
const _historyCache = {};

/* volumen relativo: volumen de la última rueda vs. promedio de las 20 anteriores */
function relativeVolume(volumes){
  if(!volumes || volumes.length<11) return null;
  const last = volumes[volumes.length-1];
  const prior = volumes.slice(-21,-1).filter(v=>v!=null);
  if(last==null || prior.length<5) return null;
  const avg = prior.reduce((a,b)=>a+b,0)/prior.length;
  if(!avg) return null;
  return last/avg;
}

/* ================= DATASET PRE-CALCULADO (data/stocks.json, generado por GitHub Actions) =================
   Si existe, la carga es casi instantánea (un solo archivo, sin pedir nada a Yahoo desde el navegador).
   Si todavía no lo armaste (o falla), cae de vuelta al camino lento de siempre, en vivo. */
let _dataset; // undefined = no intentado, null = intentado y no existe, objeto = cargado
async function loadDataset(){
  if(_dataset !== undefined) return _dataset;
  try{
    const r = await fetch("data/stocks.json", {cache:"no-store"});
    if(!r.ok) throw new Error("sin dataset");
    _dataset = await r.json();
  }catch(e){ _dataset = null; }
  return _dataset;
}

async function buildStockData(list, onProgress){
  const ds = await loadDataset();
  if(ds && ds.tickers){
    const results = list.map(([ticker,name])=>{
      const t = ds.tickers[ticker];
      if(!t || t.ok===false){
        return {ticker,name,price:null,chg:null,s20:null,s50:null,r14:null,sig:{label:"—",cls:"p-neutral"},mom:null,rvol:null,closes:[],dates:[],volumes:[],ok:false};
      }
      _historyCache[ticker] = {closes:t.closes||[], dates:t.dates||[], volumes:[], rvol:t.rvol, name:t.name||name};
      return {ticker, name:t.name||name, price:t.price, chg:t.chg, s20:t.s20, s50:t.s50, r14:t.r14, sig:t.sig, mom:t.mom, rvol:t.rvol, closes:t.closes||[], dates:t.dates||[], volumes:[], ok:true};
    });
    if(onProgress) onProgress(list.length, list.length, "listo (desde caché)");
    return results;
  }
  // camino de respaldo: sin caché pre-calculada, se pide en vivo (más lento, como antes)
  let done = 0;
  return await runPool(list, 6, async ([ticker,name])=>{
    try{
      const {closes,dates,volumes,lastOpen,lastClose} = await fetchHistory(ticker);
      _historyCache[ticker] = {closes,dates,volumes,name};
      const price = closes[closes.length-1] ?? lastClose;
      const s20 = sma(closes,20), s50 = sma(closes,50), r14 = rsi(closes,14);
      const chg = (lastOpen && lastClose) ? ((lastClose-lastOpen)/lastOpen*100) : null;
      const sig = signal(price, s20, s50, r14);
      const mom = momentum(closes, r14);
      const rvol = relativeVolume(volumes);
      done++; if(onProgress) onProgress(done, list.length, ticker);
      return {ticker,name,price,chg,s20,s50,r14,sig,mom,rvol,closes,dates,volumes,ok:true};
    }catch(e){
      done++; if(onProgress) onProgress(done, list.length, ticker);
      return {ticker,name,price:null,chg:null,s20:null,s50:null,r14:null,sig:{label:"—",cls:"p-neutral"},mom:null,rvol:null,closes:[],dates:[],volumes:[],ok:false};
    }
  });
}

/* ================= MOMENTUM ================= */
function momentum(closes, r14){
  if(closes.length < 6) return null;
  const roc5 = (closes[closes.length-1]/closes[closes.length-6] - 1) * 100;
  let strength = 0;
  if(Math.abs(roc5) >= 5) strength += 2;
  else if(Math.abs(roc5) >= 3) strength += 1;
  if(r14!=null && (r14<25 || r14>75)) strength += 2;
  else if(r14!=null && (r14<32 || r14>68)) strength += 1;
  const direction = roc5 >= 0 ? "alcista" : "bajista";
  return { roc5, strength, direction, active: strength >= 2 };
}

/* ================= MODAL DE DETALLE (click en un ticker) ================= */
function ensureModal(){
  if(document.getElementById("tickerModal")) return;
  const div = document.createElement("div");
  div.id = "tickerModal";
  div.className = "modal-overlay";
  div.innerHTML = `
    <div class="modal-box">
      <div class="modal-head">
        <div>
          <div class="modal-ticker" id="modalTicker">—</div>
          <div class="modal-name" id="modalName">—</div>
        </div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="chartbox" style="height:220px;"><canvas id="modalChart"></canvas></div>
      <div class="grid" id="modalStats"></div>
      <div class="note" style="margin-top:10px;">Caja de puntas (compra/venta en vivo) y modalidad CI/24hs no están disponibles vía fuentes gratuitas — es dato de mercado pago, solo lo tenés en tu bróker.</div>
    </div>`;
  document.body.appendChild(div);
  div.addEventListener("click", e=>{ if(e.target===div) closeModal(); });
}
function closeModal(){
  const m = document.getElementById("tickerModal");
  if(m) m.classList.remove("open");
}
async function openDetail(ticker){
  ensureModal();
  const modal = document.getElementById("tickerModal");
  modal.classList.add("open");
  document.getElementById("modalTicker").textContent = ticker;
  document.getElementById("modalName").textContent = "Cargando…";
  document.getElementById("modalStats").innerHTML = "";
  let entry = _historyCache[ticker];
  if(!entry){
    try{
      const h = await fetchHistory(ticker);
      entry = { closes:h.closes, dates:h.dates, volumes:h.volumes, name:ticker };
      _historyCache[ticker] = entry;
    }catch(e){
      document.getElementById("modalName").textContent = "No se pudo cargar este ticker";
      return;
    }
  }
  document.getElementById("modalName").textContent = entry.name || ticker;

  const closes = entry.closes;
  try{
    drawLineChart(document.getElementById("modalChart"), [{name:ticker, color:"#3ecf8e", data:closes}], {showAxis:true, decimals:2});
  }catch(e){ /* si falla el dibujo, seguimos mostrando las estadísticas igual */ }

  const price = closes[closes.length-1];
  const s20 = sma(closes,20), s50 = sma(closes,50), r14 = rsi(closes,14);
  const high52 = Math.max(...closes), low52 = Math.min(...closes);
  const last30 = closes.slice(-30);
  const resistencia = Math.max(...last30), soporte = Math.min(...last30);
  const rets = closes.slice(1).map((c,i)=> (c/closes[i]-1));
  const mean = rets.reduce((a,b)=>a+b,0)/rets.length;
  const variance = rets.reduce((a,b)=>a+Math.pow(b-mean,2),0)/rets.length;
  const volAnual = Math.sqrt(variance) * Math.sqrt(252) * 100;
  const rvol = entry.rvol!==undefined ? entry.rvol : relativeVolume(entry.volumes);
  const sig = signal(price, s20, s50, r14);
  const stats = [
    ["Precio", price!=null?"$"+price.toFixed(2):"—"],
    ["Señal técnica", sig.label],
    ["RVOL (vs. prom. 20 ruedas)", rvol!=null?rvol.toFixed(2)+"x":"—"],
    ["SMA20", s20!=null?"$"+s20.toFixed(2):"—"],
    ["SMA50", s50!=null?"$"+s50.toFixed(2):"—"],
    ["RSI(14)", r14!=null?r14.toFixed(1):"—"],
    ["Soporte reciente (30 ruedas)", "$"+soporte.toFixed(2)],
    ["Resistencia reciente (30 ruedas)", "$"+resistencia.toFixed(2)],
    ["Máx. 52 sem.", "$"+high52.toFixed(2)],
    ["Mín. 52 sem.", "$"+low52.toFixed(2)],
    ["Volatilidad anualizada", volAnual.toFixed(1)+"%"]
  ];
  document.getElementById("modalStats").innerHTML = stats.map(([l,v])=>`<div class="card"><div class="lbl">${l}</div><div class="val" style="font-size:16px;">${v}</div></div>`).join("");
}

/* ================= LINK AL BRÓKER (IOL) ================= */
const IOL_PANELS = {
  cedears: "https://iol.invertironline.com/mercado/cotizaciones/argentina/cedears/todos",
  acciones: "https://iol.invertironline.com/mercado/cotizaciones/argentina/acciones/todos"
};
function showToast(msg){
  let t = document.getElementById("panelToast");
  if(!t){ t = document.createElement("div"); t.id="panelToast"; t.className="toast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(()=>t.classList.remove("show"), 2600);
}
function goToBroker(ticker, panel){
  try{ navigator.clipboard.writeText(ticker); }catch(e){}
  showToast(`Ticker "${ticker}" copiado — pegalo en el buscador de IOL`);
  window.open(IOL_PANELS[panel] || IOL_PANELS.cedears, "_blank", "noopener");
}
function tickerLinkHtml(ticker, panel){
  return `<a href="#" class="ticker-link" onclick="event.stopPropagation(); goToBroker('${ticker}','${panel}'); return false;">${ticker}</a>`;
}

function renderStockTable(results, tbodySelector, statusSelector, panel){
  panel = panel || "cedears";
  const tbody = document.querySelector(tbodySelector);
  const status = document.getElementById(statusSelector);
  tbody.innerHTML = "";
  let ok=0, fail=0;
  results.forEach(r=>{
    r.ok ? ok++ : fail++;
    const chgClass = r.chg==null ? "flat" : (r.chg>=0?"up":"down");
    const chgTxt = r.chg==null ? "—" : (r.chg>=0?"+":"")+r.chg.toFixed(2)+"%";
    const rvolTxt = r.rvol!=null ? r.rvol.toFixed(2)+"x" : "—";
    const rvolClass = r.rvol!=null && r.rvol>=2 ? "rvol-high" : "";
    tbody.innerHTML += `<tr class="clickable" onclick="openDetail('${r.ticker}')">
      <td>${tickerLinkHtml(r.ticker, panel)}</td><td class="name">${r.name}</td>
      <td>${r.price!=null?"$"+r.price.toFixed(2):"—"}</td>
      <td class="${chgClass}">${chgTxt}</td>
      <td class="${rvolClass}">${rvolTxt}</td>
      <td>${r.s20!=null?"$"+r.s20.toFixed(2):"—"}</td>
      <td>${r.s50!=null?"$"+r.s50.toFixed(2):"—"}</td>
      <td>${r.r14!=null?r.r14.toFixed(1):"—"}</td>
      <td><span class="pill ${r.sig.cls}">${r.sig.label}</span></td>
    </tr>`;
  });
  if(status){
    status.textContent = fail===0 ? `${ok} tickers con señal calculada` : `${ok} ok, ${fail} sin datos (fuente bloqueó la consulta)`;
    status.className = fail===0 ? "status" : "status err";
  }
}

/* ================= FILTROS RÁPIDOS (pills) ================= */
/* ================= SKELETON LOADERS ================= */
function skeletonRows(tbodySelector, cols, count){
  const tbody = document.querySelector(tbodySelector);
  if(!tbody) return;
  let html = "";
  for(let i=0;i<count;i++){
    html += "<tr>" + Array.from({length:cols}).map(()=>`<td><div class="skel"></div></td>`).join("") + "</tr>";
  }
  tbody.innerHTML = html;
}
function skeletonCards(targetId, count){
  const box = document.getElementById(targetId);
  if(!box) return;
  box.innerHTML = Array.from({length:count}).map(()=>`
    <div class="card"><div class="text-wrap">
      <div class="skel" style="width:60%;height:10px;margin-bottom:10px;"></div>
      <div class="skel" style="width:80%;height:22px;margin-bottom:8px;"></div>
      <div class="skel" style="width:50%;height:10px;"></div>
    </div></div>`).join("");
}

function renderFilterPills(targetId, allResults, renderCallback){
  const box = document.getElementById(targetId);
  if(!box) return;
  const filters = [
    { key:"todos", label:"Todos", fn: rs => rs },
    { key:"compra", label:"Solo señales de compra", fn: rs => rs.filter(r=>r.ok && r.sig.base && r.sig.base.startsWith("Compra")) },
    { key:"sobrevendidas", label:"RSI < 30 (sobrevendidas)", fn: rs => rs.filter(r=>r.ok && r.r14!=null && r.r14<30) },
    { key:"variacion", label:"Mayor variación", fn: rs => rs.filter(r=>r.ok).slice().sort((a,b)=> Math.abs(b.chg||0)-Math.abs(a.chg||0)) },
    { key:"rvol", label:"RVOL alto (≥2x)", fn: rs => rs.filter(r=>r.ok && r.rvol!=null && r.rvol>=2) }
  ];
  box.innerHTML = filters.map(f=>`<button class="pill-btn ${f.key==='todos'?'active':''}" data-key="${f.key}">${f.label}</button>`).join("");
  box.querySelectorAll(".pill-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      box.querySelectorAll(".pill-btn").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      const f = filters.find(x=>x.key===btn.dataset.key);
      renderCallback(f.fn(allResults));
    });
  });
}

/* ================= MOTOR DE GRÁFICOS — Canvas nativo, sin librerías externas =================
   Se dibuja a mano sobre <canvas> en vez de usar una librería de un CDN, para que ningún
   bloqueador de contenido (extensiones, Brave Shields, adblockers) pueda dejar el gráfico vacío. */
function dpr(){ return window.devicePixelRatio || 1; }
function prepareCanvas(canvas){
  const cssWidth = canvas.clientWidth || canvas.parentElement.clientWidth || 300;
  const cssHeight = canvas.clientHeight || canvas.parentElement.clientHeight || 120;
  const ratio = dpr();
  canvas.width = Math.max(1, Math.round(cssWidth*ratio));
  canvas.height = Math.max(1, Math.round(cssHeight*ratio));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio,0,0,ratio,0,0);
  return {ctx, w:cssWidth, h:cssHeight};
}

function drawSparkline(canvasId, data, colorUp, colorDown){
  const el = document.getElementById(canvasId);
  if(!el || !data || data.length<2) return;
  const {ctx,w,h} = prepareCanvas(el);
  ctx.clearRect(0,0,w,h);
  const min=Math.min(...data), max=Math.max(...data);
  const range = (max-min)||1;
  const rising = data[data.length-1] >= data[0];
  const color = rising ? (colorUp||"#3ecf8e") : (colorDown||"#ef4444");

  const points = data.map((v,i)=>({ x:(i/(data.length-1))*w, y: h - ((v-min)/range)*h }));

  // relleno degradado debajo de la línea
  ctx.beginPath();
  ctx.moveTo(points[0].x, h);
  points.forEach(p=>ctx.lineTo(p.x,p.y));
  ctx.lineTo(points[points.length-1].x, h);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0,0,0,h);
  grad.addColorStop(0, color+"55");
  grad.addColorStop(1, color+"00");
  ctx.fillStyle = grad;
  ctx.fill();

  // línea
  ctx.beginPath();
  points.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.stroke();
}

/* gráfico de líneas general — una o varias series. opts: {showAxis, showLegend, decimals} */
function drawLineChart(canvas, series, opts={}){
  if(!canvas) return;
  const {ctx,w,h} = prepareCanvas(canvas);
  ctx.clearRect(0,0,w,h);
  const pad = { top:10, right:14, bottom: opts.showLegend?26:10, left: opts.showAxis?46:10 };
  const plotW = Math.max(10, w-pad.left-pad.right);
  const plotH = Math.max(10, h-pad.top-pad.bottom);
  const allVals = series.flatMap(s=>s.data).filter(v=>v!=null && !isNaN(v));
  if(!allVals.length) return;
  const min = Math.min(...allVals), max = Math.max(...allVals);
  const range = (max-min) || (Math.abs(max)*0.01) || 1;

  ctx.strokeStyle = "#1e2836"; ctx.lineWidth = 1;
  for(let i=0;i<=2;i++){
    const y = pad.top + (plotH/2)*i;
    ctx.beginPath(); ctx.moveTo(pad.left,y); ctx.lineTo(w-pad.right,y); ctx.stroke();
  }
  if(opts.showAxis){
    ctx.fillStyle = "#5b6678"; ctx.font = "9.5px IBM Plex Mono, monospace";
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    ctx.fillText(max.toFixed(opts.decimals??2), pad.left-6, pad.top);
    ctx.fillText(min.toFixed(opts.decimals??2), pad.left-6, pad.top+plotH);
  }
  series.forEach(s=>{
    const n = s.data.length;
    if(n<2) return;
    ctx.beginPath();
    let started = false;
    s.data.forEach((v,i)=>{
      if(v==null||isNaN(v)) return;
      const x = pad.left + (i/(n-1))*plotW;
      const y = pad.top + plotH - ((v-min)/range)*plotH;
      if(!started){ ctx.moveTo(x,y); started = true; } else { ctx.lineTo(x,y); }
    });
    ctx.strokeStyle = s.color; ctx.lineWidth = 1.6; ctx.lineJoin = "round";
    ctx.stroke();
  });
  if(opts.showLegend){
    let x = pad.left;
    const y = h-14;
    ctx.font = "10px IBM Plex Mono, monospace"; ctx.textBaseline = "middle"; ctx.textAlign = "left";
    series.forEach(s=>{
      ctx.fillStyle = s.color; ctx.fillRect(x,y-4,9,3);
      ctx.fillStyle = "#8b97a8"; ctx.fillText(s.name, x+13, y);
      x += ctx.measureText(s.name).width + 34;
    });
  }
}

/* gráfico comparativo: normaliza cada serie a 100 en el primer dato para comparar rendimiento */
function renderCompareChart(canvasId, results){
  const canvas = document.getElementById(canvasId);
  const usable = results.filter(r=>r.closes && r.closes.length>1);
  if(!usable.length) return;
  const palette = ["#3ecf8e","#e8a94c","#60a5fa","#f472b6","#facc15","#a78bfa","#fb923c","#34d399","#f87171","#38bdf8"];
  const series = usable.map((r,i)=>({
    name: r.ticker,
    color: palette[i % palette.length],
    data: r.closes.map(c => c/r.closes[0]*100)
  }));
  drawLineChart(canvas, series, {showLegend:true, decimals:0});
}

/* ================= CARD CON VARIACIÓN + SPARKLINE ================= */
let _sparkCounter = 0;
function cardHtml(lbl, val, changeTxt, changeCls, sub, sparkId){
  return `<div class="card">
    <div class="text-wrap">
      <div class="lbl">${lbl}</div>
      <div class="val">${val}</div>
      <div class="chg ${changeCls||''}">${changeTxt||''}</div>
      ${sub?`<div class="chg" style="opacity:.7;">${sub}</div>`:''}
    </div>
    ${sparkId?`<canvas id="${sparkId}" class="spark"></canvas>`:''}
  </div>`;
}

/* ================= DATASET MACRO PRE-CALCULADO (data/macro.json) ================= */
let _macroDataset;
async function loadMacroDataset(){
  if(_macroDataset !== undefined) return _macroDataset;
  try{
    const r = await fetch("data/macro.json", {cache:"no-store"});
    if(!r.ok) throw new Error("sin dataset macro");
    _macroDataset = await r.json();
  }catch(e){ _macroDataset = null; }
  return _macroDataset;
}

/* ================= DATOS: MACRO ARGENTINA ================= */
async function loadMacroAR(targetId){
  const box = document.getElementById(targetId); if(!box) return;
  const cards = [];
  const wanted=["oficial","blue","bolsa","contadoconliqui"];
  const labels={oficial:"Dólar oficial",blue:"Dólar blue",bolsa:"Dólar MEP",contadoconliqui:"Dólar CCL"};
  const ds = await loadMacroDataset();

  if(ds && ds.ar){
    for(const casa of wanted){
      const d = ds.ar[casa];
      const sparkId = `spark_${casa}_${_sparkCounter++}`;
      if(d && d.last!=null){
        const chg = d.prev ? ((d.last-d.prev)/d.prev*100) : null;
        const chgCls = chg==null ? "flat" : (chg>=0?"up":"down");
        const chgTxt = chg==null ? "sin variación" : `${chg>=0?"▲ +":"▼ "}${chg.toFixed(2)}% vs. rueda anterior`;
        cards.push({ html: cardHtml(labels[casa], "$"+Math.round(d.last).toLocaleString("es-AR"), chgTxt, chgCls, null, sparkId), sparkId, data:d.sparkline });
      }else{
        cards.push({ html: cardHtml(labels[casa], "—", "fuente no disponible", "flat"), sparkId:null });
      }
    }
    const rp = ds.ar.riesgoPaisUltimo, rpSpark = ds.ar.riesgoPaisSparkline;
    let chgTxt = rp?.fecha ?? "", chgCls = "flat", sparkId=null, data=null;
    if(rpSpark && rpSpark.length>=2){
      const diff = rpSpark[rpSpark.length-1] - rpSpark[rpSpark.length-2];
      chgCls = diff<=0 ? "up" : "down";
      chgTxt = `${diff>=0?"▲ +":"▼ "}${diff.toFixed(0)} pb vs. rueda anterior`;
      sparkId = `spark_riesgopais_${_sparkCounter++}`; data = rpSpark;
    }
    cards.push({ html: cardHtml("Riesgo país", (rp?.valor ?? "—")+" pb", chgTxt, chgCls, null, sparkId), sparkId, data });

    if(ds.ar.dolarCripto){
      const exchanges = Object.entries(ds.ar.dolarCripto).filter(([k,v])=>v && v.totalAsk);
      if(exchanges.length){
        const avg = exchanges.reduce((a,[,v])=>a+v.totalAsk,0)/exchanges.length;
        const best = exchanges.sort((a,b)=>a[1].totalAsk-b[1].totalAsk)[0];
        cards.push({ html: cardHtml("Dólar cripto (USDT)", "$"+Math.round(avg).toLocaleString("es-AR"),
          `mejor precio: $${Math.round(best[1].totalAsk).toLocaleString("es-AR")} (${best[0]})`, "flat", "Pulso 24/7 — no depende de horario bancario"), sparkId:null });
      }else{
        cards.push({ html: cardHtml("Dólar cripto (USDT)", "—", "fuente no disponible", "flat"), sparkId:null });
      }
    }
  } else {
    // camino de respaldo: sin caché, en vivo (como antes)
    for(const casa of wanted){
      const sparkId = `spark_${casa}_${_sparkCounter++}`;
      try{
        const r = await fetch(`https://api.argentinadatos.com/v1/cotizaciones/dolares/${casa}`);
        const serie = await r.json();
        const last30 = serie.slice(-30).map(d=>d.venta);
        const last = last30[last30.length-1], prev = last30[last30.length-2];
        const chg = (last!=null && prev) ? ((last-prev)/prev*100) : null;
        const chgCls = chg==null ? "flat" : (chg>=0?"up":"down");
        const chgTxt = chg==null ? "sin variación" : `${chg>=0?"▲ +":"▼ "}${chg.toFixed(2)}% vs. rueda anterior`;
        cards.push({ html: cardHtml(labels[casa], "$"+Math.round(last).toLocaleString("es-AR"), chgTxt, chgCls, null, sparkId), sparkId, data:last30 });
      }catch(e){
        cards.push({ html: cardHtml(labels[casa], "—", "fuente no disponible", "flat"), sparkId:null });
      }
    }
    try{
      const res2 = await fetch("https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo");
      const d2 = await res2.json();
      let chgTxt = d2.fecha ?? "", chgCls = "flat", sparkId=null, data=null;
      try{
        const rHist = await fetch("https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais");
        const hist = await rHist.json();
        const last30 = hist.slice(-30).map(d=>d.valor);
        const last = last30[last30.length-1], prev = last30[last30.length-2];
        if(last!=null && prev!=null){
          const diff = last - prev;
          chgCls = diff<=0 ? "up" : "down";
          chgTxt = `${diff>=0?"▲ +":"▼ "}${diff.toFixed(0)} pb vs. rueda anterior`;
          sparkId = `spark_riesgopais_${_sparkCounter++}`; data = last30;
        }
      }catch(e){ /* sin histórico, mostramos solo el valor actual */ }
      cards.push({ html: cardHtml("Riesgo país", (d2.valor ?? "—")+" pb", chgTxt, chgCls, null, sparkId), sparkId, data });
    }catch(e){
      cards.push({ html: cardHtml("Riesgo país", "—", "fuente no disponible", "flat"), sparkId:null });
    }
    cards.push({ html: await fetchDolarCriptoCardLive(), sparkId:null });
  }

  box.innerHTML = cards.map(c=>c.html).join("");
  cards.forEach(c=>{ if(c.sparkId && c.data) drawSparkline(c.sparkId, c.data, "#3ecf8e", "#ef4444"); });
}

async function loadMacroUS(targetId){
  const box = document.getElementById(targetId); if(!box) return;
  const idx=[["SPY","S&P 500 (SPY)"],["QQQ","Nasdaq 100 (QQQ)"],["DIA","Dow Jones (DIA)"]];
  const cards = [];
  const ds = await loadMacroDataset();

  if(ds && ds.us){
    for(const [sym,label] of idx){
      const sparkId = `spark_${sym}_${_sparkCounter++}`;
      const d = ds.us[sym];
      if(d && d.price!=null){
        const chg = d.prevClose ? ((d.price-d.prevClose)/d.prevClose*100) : null;
        const chgCls = chg==null ? "flat" : (chg>=0?"up":"down");
        const chgTxt = chg==null ? "sin variación" : `${chg>=0?"▲ +":"▼ "}${chg.toFixed(2)}% vs. cierre anterior`;
        cards.push({ html: cardHtml(label, "$"+d.price.toFixed(2), chgTxt, chgCls, null, sparkId), sparkId, data:d.sparkline });
      }else{
        cards.push({ html: cardHtml(label, "—", "no disponible", "flat"), sparkId:null });
      }
    }
  } else {
    for(const [sym,label] of idx){
      const sparkId = `spark_${sym}_${_sparkCounter++}`;
      try{
        const data = await fetchViaProxy(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?range=1mo&interval=1d`);
        const result = data?.chart?.result?.[0];
        const meta = result?.meta;
        const close = meta?.regularMarketPrice ?? null;
        const prevClose = meta?.previousClose ?? meta?.chartPreviousClose ?? null;
        const chg = (close!=null && prevClose) ? ((close-prevClose)/prevClose*100) : null;
        const chgCls = chg==null ? "flat" : (chg>=0?"up":"down");
        const chgTxt = chg==null ? "sin variación" : `${chg>=0?"▲ +":"▼ "}${chg.toFixed(2)}% vs. cierre anterior`;
        const closes = (result?.indicators?.quote?.[0]?.close || []).filter(c=>c!=null);
        cards.push({ html: cardHtml(label, close?"$"+close.toFixed(2):"—", chgTxt, chgCls, null, sparkId), sparkId, data:closes });
      }catch(e){
        cards.push({ html: cardHtml(label, "—", "no disponible", "flat"), sparkId:null });
      }
    }
  }
  cards.push({ html: cardHtml("Tasa Fed Funds", "3,50–3,75%", "FOMC 29-jul-2026 (manual)", "flat"), sparkId:null });
  box.innerHTML = cards.map(c=>c.html).join("");
  cards.forEach(c=>{ if(c.sparkId && c.data && c.data.length>1) drawSparkline(c.sparkId, c.data, "#3ecf8e", "#ef4444"); });
}

/* historial de dólares para el gráfico de la página Macro */
async function loadDolarHistoryChart(canvasId){
  const casas = [["blue","Blue","#e8a94c"],["oficial","Oficial","#3ecf8e"],["bolsa","MEP","#60a5fa"]];
  const series = [];
  const ds = await loadMacroDataset();
  if(ds && ds.dolarHistory90){
    for(const [casa,label,color] of casas){
      const d = ds.dolarHistory90[casa];
      if(d && d.length) series.push({ name:label, color, data:d });
    }
  } else {
    for(const [casa,label,color] of casas){
      try{
        const r = await fetch(`https://api.argentinadatos.com/v1/cotizaciones/dolares/${casa}`);
        const data = await r.json();
        const last90 = data.slice(-90);
        if(last90.length) series.push({ name:label, color, data: last90.map(d=>d.venta) });
      }catch(e){ /* esa serie no cargó, seguimos con las demás */ }
    }
  }
  if(!series.length) return false;
  drawLineChart(document.getElementById(canvasId), series, {showAxis:true, showLegend:true, decimals:0});
  return true;
}

/* ================= DÓLAR CRIPTO (USDT/ARS) — pulso 24/7, vía CriptoYa (camino en vivo, sin caché) ================= */
async function fetchDolarCriptoCardLive(){
  try{
    const r = await fetch("https://criptoya.com/api/USDT/ARS/1");
    const data = await r.json();
    const exchanges = Object.entries(data).filter(([k,v])=>v && v.totalAsk);
    if(!exchanges.length) throw new Error("sin datos");
    const avg = exchanges.reduce((a,[,v])=>a+v.totalAsk,0)/exchanges.length;
    const best = exchanges.sort((a,b)=>a[1].totalAsk-b[1].totalAsk)[0];
    return cardHtml("Dólar cripto (USDT)", "$"+Math.round(avg).toLocaleString("es-AR"),
      `mejor precio: $${Math.round(best[1].totalAsk).toLocaleString("es-AR")} (${best[0]})`, "flat", "Pulso 24/7 — no depende de horario bancario", null);
  }catch(e){
    return cardHtml("Dólar cripto (USDT)", "—", "fuente no disponible", "flat");
  }
}

/* ================= NOTICIAS ================= */
function normalize(s){ return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""); }

async function loadNews(targetId, statusId, allStocks){
  const box = document.getElementById(targetId); if(!box) return;
  const status = document.getElementById(statusId);
  box.innerHTML = ""; let total=0;
  const dict = (allStocks||[]).map(s=>({ticker:s.ticker||s[0], needle:[(s.ticker||s[0]).toLowerCase(), normalize(s.name||s[1])]}));
  for(const feed of NEWS_FEEDS){
    try{
      const r = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
      const data = await r.json();
      (data.items || []).slice(0,6).forEach(item=>{
        const t = normalize(item.title);
        const matched = dict.filter(d => d.needle.some(n => n.length>2 && t.includes(n))).map(d=>d.ticker);
        const tagsHtml = matched.length ? `<div class="tags">${[...new Set(matched)].map(m=>`<span class="tag">${m}</span>`).join("")}</div>` : "";
        box.innerHTML += `<a href="${item.link}" target="_blank" rel="noopener"><span class="src">${feed.name}</span>${item.title}${tagsHtml}</a>`;
        total++;
      });
    }catch(e){ /* fuente caída, seguimos */ }
  }
  if(status){
    status.textContent = total>0 ? `${total} titulares — etiquetados los que mencionan tu watchlist` : "No se pudieron cargar titulares";
    status.className = total>0 ? "status" : "status err";
  }
}
