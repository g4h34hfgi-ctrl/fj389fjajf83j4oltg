#!/usr/bin/env node
// -*- coding: utf-8 -*-
//
// Descarga precios de 1 año + indicadores técnicos para TODO el universo de tickers,
// y datos macro de Argentina/EE.UU., y guarda el resultado en /data/*.json.
//
// Corre server-side (GitHub Actions), así que pega directo a Yahoo Finance sin
// necesitar ningún proxy CORS — el problema de CORS solo existe en el navegador.
//
// Mantener CORE_US / WATCHLIST_AR / CEDEARS_UNIVERSE sincronizados con shared.js
// si agregás o sacás tickers ahí.

const fs = require("fs");
const path = require("path");

const CORE_US = [
  ["AAPL","Apple"],["MSFT","Microsoft"],["GOOGL","Alphabet / Google"],["AMZN","Amazon"],
  ["NVDA","NVIDIA"],["META","Meta"],["TSLA","Tesla"],["JPM","JPMorgan"]
];
const WATCHLIST_AR = [
  ["GGAL","Grupo Financiero Galicia"],["YPF","YPF"],["BMA","Banco Macro"],
  ["PAM","Pampa Energía"],["TGS","Transportadora Gas del Sur"],["CRESY","Cresud"],
  ["LOMA","Loma Negra"],["EDN","Edenor"],["IRS","IRSA"],["SUPV","Grupo Supervielle"],["BBAR","BBVA Banco Francés"]
];
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
  return 100-(100/(1+avgGain/avgLoss));
}
function signal(price, sma20, sma50, rsi14){
  let score=0;
  if(sma20!=null) score += price>sma20 ? 1 : -1;
  if(sma50!=null) score += price>sma50 ? 1 : -1;
  if(rsi14!=null){ if(rsi14<30) score+=2; else if(rsi14>70) score-=2; }
  const intensity = Math.round(Math.abs(score)/4*100);
  let base, cls;
  if(score>=3){ base="Compra fuerte"; cls="p-buy2"; }
  else if(score>=1){ base="Compra"; cls="p-buy1"; }
  else if(score===0){ base="Neutral"; cls="p-neutral"; }
  else if(score>=-2){ base="Venta"; cls="p-sell1"; }
  else { base="Venta fuerte"; cls="p-sell2"; }
  const label = score===0 ? base : `${base} (${intensity}%)`;
  return {label, cls, intensity, base};
}
function momentum(closes, r14){
  if(closes.length<6) return null;
  const roc5 = (closes[closes.length-1]/closes[closes.length-6]-1)*100;
  let strength=0;
  if(Math.abs(roc5)>=5) strength+=2; else if(Math.abs(roc5)>=3) strength+=1;
  if(r14!=null && (r14<25||r14>75)) strength+=2; else if(r14!=null && (r14<32||r14>68)) strength+=1;
  return { roc5, strength, direction: roc5>=0?"alcista":"bajista", active: strength>=2 };
}
function relativeVolume(volumes){
  if(!volumes || volumes.length<11) return null;
  const last = volumes[volumes.length-1];
  const prior = volumes.slice(-21,-1).filter(v=>v!=null);
  if(last==null || prior.length<5) return null;
  const avg = prior.reduce((a,b)=>a+b,0)/prior.length;
  return avg ? last/avg : null;
}

async function fetchHistory(ticker){
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1y&interval=1d`;
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; PanelInversionesBot/1.0)" } });
  if(!r.ok) throw new Error("HTTP "+r.status);
  const data = await r.json();
  const result = data?.chart?.result?.[0];
  if(!result) throw new Error("sin datos para "+ticker);
  const timestamps = result.timestamp || [];
  const q = result.indicators?.quote?.[0] || {};
  const closes=[], dates=[], volumes=[];
  timestamps.forEach((ts,i)=>{
    const c = q.close?.[i];
    if(c!=null){ closes.push(c); dates.push(new Date(ts*1000).toISOString().slice(0,10)); volumes.push(q.volume?.[i] ?? null); }
  });
  const meta = result.meta || {};
  const lastClose = meta.regularMarketPrice ?? closes[closes.length-1] ?? null;
  const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? (closes.length>1?closes[closes.length-2]:null);
  return { closes, dates, volumes, lastOpen: prevClose, lastClose };
}

async function runPool(items, concurrency, worker){
  const results = new Array(items.length);
  let idx = 0;
  async function runNext(){ while(idx<items.length){ const cur=idx++; results[cur]=await worker(items[cur]); } }
  await Promise.all(Array.from({length:Math.min(concurrency,items.length)}, runNext));
  return results;
}

async function main(){
  const seen = new Set();
  const allTickers = [];
  for(const t of [...CORE_US, ...WATCHLIST_AR, ...CEDEARS_UNIVERSE]){
    if(!seen.has(t[0])){ seen.add(t[0]); allTickers.push(t); }
  }

  console.log(`Descargando ${allTickers.length} tickers...`);
  const tickers = {};
  let ok=0, fail=0;
  await runPool(allTickers, 10, async ([ticker,name])=>{
    try{
      const h = await fetchHistory(ticker);
      const price = h.closes[h.closes.length-1] ?? h.lastClose;
      const s20=sma(h.closes,20), s50=sma(h.closes,50), r14=rsi(h.closes,14);
      const chg = (h.lastOpen && h.lastClose) ? ((h.lastClose-h.lastOpen)/h.lastOpen*100) : null;
      tickers[ticker] = {
        name, price, chg,
        s20, s50, r14,
        sig: signal(price,s20,s50,r14),
        mom: momentum(h.closes, r14),
        rvol: relativeVolume(h.volumes),
        closes: h.closes, dates: h.dates,
        ok: true
      };
      ok++;
    }catch(e){
      tickers[ticker] = { name, ok:false, error: String(e.message||e) };
      fail++;
    }
  });
  console.log(`Tickers: ${ok} ok, ${fail} con error`);

  // ---- Macro Argentina ----
  const ar = {};
  for(const casa of ["oficial","blue","bolsa","contadoconliqui"]){
    try{
      const r = await fetch(`https://api.argentinadatos.com/v1/cotizaciones/dolares/${casa}`);
      const serie = await r.json();
      const last30 = serie.slice(-30).map(d=>d.venta);
      ar[casa] = { last: last30[last30.length-1], prev: last30[last30.length-2], sparkline: last30 };
    }catch(e){ ar[casa] = null; console.log("dolar", casa, "fallo:", e.message); }
  }
  try{
    const r = await fetch("https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo");
    ar.riesgoPaisUltimo = await r.json();
  }catch(e){ console.log("riesgo pais ultimo fallo:", e.message); }
  try{
    const r = await fetch("https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais");
    const hist = await r.json();
    ar.riesgoPaisSparkline = hist.slice(-30).map(d=>d.valor);
  }catch(e){ console.log("riesgo pais historico fallo:", e.message); }
  try{
    const r = await fetch("https://criptoya.com/api/USDT/ARS/1");
    ar.dolarCripto = await r.json();
  }catch(e){ console.log("dolar cripto fallo:", e.message); }

  const dolarHistory90 = {};
  for(const casa of ["blue","oficial","bolsa"]){
    try{
      const r = await fetch(`https://api.argentinadatos.com/v1/cotizaciones/dolares/${casa}`);
      const serie = await r.json();
      dolarHistory90[casa] = serie.slice(-90).map(d=>d.venta);
    }catch(e){ /* esa serie no se pudo, seguimos con las demás */ }
  }

  // ---- Macro EE.UU. (índices vía ETF) ----
  const us = {};
  for(const sym of ["SPY","QQQ","DIA"]){
    try{
      const h = await fetchHistory(sym);
      us[sym] = { price: h.lastClose, prevClose: h.lastOpen, sparkline: h.closes.slice(-30) };
    }catch(e){ us[sym] = null; }
  }

  const dataDir = path.join(__dirname, "..", "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const updatedAt = new Date().toISOString();
  fs.writeFileSync(path.join(dataDir,"stocks.json"), JSON.stringify({ updatedAt, tickers }));
  fs.writeFileSync(path.join(dataDir,"macro.json"), JSON.stringify({ updatedAt, ar, us, dolarHistory90 }));
  console.log("Listo:", updatedAt);
}

main().catch(e=>{ console.error(e); process.exit(1); });
