import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Legend, Tooltip, PointElement, LineElement, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip, PointElement, LineElement, ArcElement);

const API = 'http://localhost:5000';
const SYMS = { USD:'$', SYP:'لس', TRY:'ل.ت', EUR:'€' };
const CURRENCIES = { USD:'دولار $', SYP:'سوري لس', TRY:'تركي ل.ت', EUR:'يورو €' };
const ACCOUNTS = ['الصندوق','البنك','المبيعات','المشتريات','الزبائن','الموردون','المصروفات','الايرادات','راس المال','البضاعة','الاثاث','المعدات','الديون','الرواتب','الايجار','الكهرباء','اخرى'];

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Tajawal',sans-serif;background:#0a0e1a;color:#e2e8f0;min-height:100vh;}
  :root{--s:#111827;--s2:#1a2235;--b:#1e2d45;--ac:#3b82f6;--ac2:#06b6d4;--gr:#10b981;--rd:#ef4444;--yw:#f59e0b;--pp:#8b5cf6;--or:#f97316;--mu:#64748b;--r:11px;}
  .nb{background:rgba(17,24,39,.97);backdrop-filter:blur(12px);border-bottom:1px solid var(--b);padding:0 10px;display:flex;align-items:center;justify-content:space-between;min-height:54px;position:sticky;top:0;z-index:100;flex-wrap:wrap;gap:4px;}
  .nb-brand{font-size:14px;font-weight:900;background:linear-gradient(135deg,var(--ac),var(--ac2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .nb-tabs{display:flex;gap:2px;flex-wrap:wrap;}
  .nt{padding:4px 8px;border-radius:6px;border:none;background:transparent;color:var(--mu);font-family:'Tajawal';font-size:11px;cursor:pointer;transition:.2s;white-space:nowrap;}
  .nt:hover{color:#e2e8f0;background:var(--s2);}.nt.active{background:var(--ac);color:#fff;font-weight:700;}
  .main{padding:10px;max-width:1280px;margin:0 auto;}
  .card{background:var(--s);border:1px solid var(--b);border-radius:var(--r);padding:14px;margin-bottom:12px;}
  .ct{font-size:13px;font-weight:700;margin-bottom:11px;display:flex;align-items:center;gap:7px;}
  .ct::before{content:'';width:3px;height:14px;background:linear-gradient(to bottom,var(--ac),var(--ac2));border-radius:3px;}
  .sg{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:6px;margin-bottom:11px;}
  .sc{background:var(--s);border:1px solid var(--b);border-radius:var(--r);padding:10px 12px;}
  .sl{font-size:10px;color:var(--mu);margin-bottom:2px;}.sv{font-size:16px;font-weight:900;}
  .sc.sb .sv{color:var(--ac);}.sc.sc2 .sv{color:var(--ac2);}.sc.sg2 .sv{color:var(--gr);}.sc.sy .sv{color:var(--yw);}.sc.sp .sv{color:var(--pp);}.sc.sr .sv{color:var(--rd);}
  .fb{display:flex;gap:6px;margin-bottom:9px;flex-wrap:wrap;align-items:flex-end;background:var(--s2);padding:7px 9px;border-radius:8px;border:1px solid var(--b);}
  .fb label{font-size:10px;color:var(--mu);display:block;margin-bottom:2px;font-weight:700;}
  .sb2{display:flex;gap:6px;margin-bottom:9px;flex-wrap:wrap;}
  .in{background:var(--s2);border:1px solid var(--b);border-radius:7px;padding:5px 9px;color:#e2e8f0;font-family:'Tajawal';font-size:12px;outline:none;transition:.2s;}
  .in:focus{border-color:var(--ac);}.ig{flex:1;min-width:90px;}
  table{width:100%;border-collapse:collapse;}thead tr{border-bottom:1px solid var(--b);}
  th{padding:6px 8px;text-align:right;font-size:10px;font-weight:700;color:var(--mu);}
  td{padding:7px 8px;font-size:11px;border-bottom:1px solid var(--b);}
  tbody tr{transition:.15s;}tbody tr:hover{background:var(--s2);}tbody tr:last-child td{border-bottom:none;}
  .bx{display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700;}
  .bb{background:rgba(59,130,246,.15);color:var(--ac);}.bg{background:rgba(16,185,129,.15);color:var(--gr);}
  .br{background:rgba(239,68,68,.15);color:var(--rd);}.by{background:rgba(245,158,11,.15);color:var(--yw);}
  .bp{background:rgba(139,92,246,.15);color:var(--pp);}.bo{background:rgba(249,115,22,.15);color:var(--or);}
  .bm{background:rgba(100,116,139,.15);color:var(--mu);}
  .btn{padding:5px 10px;border-radius:6px;border:none;font-family:'Tajawal';font-size:11px;font-weight:700;cursor:pointer;transition:.2s;}
  .b1{background:var(--ac);color:#fff;}.b1:hover{background:#2563eb;}
  .bd{background:rgba(239,68,68,.15);color:var(--rd);}.bd:hover{background:var(--rd);color:#fff;}
  .be{background:rgba(59,130,246,.15);color:var(--ac);}.be:hover{background:var(--ac);color:#fff;}
  .bs{background:rgba(16,185,129,.15);color:var(--gr);}.bs:hover{background:var(--gr);color:#fff;}
  .bpu{background:rgba(139,92,246,.15);color:var(--pp);}.bpu:hover{background:var(--pp);color:#fff;}
  .bpay{background:rgba(16,185,129,.15);color:var(--gr);}.bpay:hover{background:var(--gr);color:#fff;}
  .bsm{padding:3px 7px;font-size:10px;}
  .fg label{display:block;font-size:10px;color:var(--mu);margin-bottom:3px;font-weight:700;}
  .mo{position:fixed;inset:0;background:rgba(0,0,0,.82);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;}
  .md{background:var(--s);border:1px solid var(--b);border-radius:13px;padding:18px;width:640px;max-width:96vw;max-height:92vh;overflow-y:auto;}
  .md-t{font-size:14px;font-weight:900;margin-bottom:13px;}
  .md-f{display:flex;gap:6px;justify-content:flex-end;margin-top:13px;}
  .tc{position:fixed;bottom:10px;left:10px;z-index:300;display:flex;flex-direction:column;gap:5px;}
  .to{padding:8px 12px;border-radius:8px;font-size:11px;font-weight:700;min-width:160px;box-shadow:0 8px 24px rgba(0,0,0,.4);}
  .ts{background:var(--gr);color:#fff;}.te{background:var(--rd);color:#fff;}.tw{background:var(--yw);color:#fff;}
  .es{text-align:center;padding:28px 16px;color:var(--mu);}
  .cg{display:grid;grid-template-columns:3fr 2fr;gap:12px;align-items:center;}
  .fib{background:var(--s2);border:1px solid var(--b);border-radius:9px;padding:11px;margin-bottom:12px;}
  .fir{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--b);font-size:11px;}
  .fir:last-child{border-bottom:none;font-weight:900;font-size:12px;}
  .pb-g{background:var(--s2);border-radius:4px;height:5px;width:100%;margin-top:3px;overflow:hidden;}
  .pb{height:5px;border-radius:4px;}
  .pm{display:flex;gap:4px;}
  .pmt{flex:1;padding:6px;border-radius:6px;border:1px solid var(--b);background:transparent;color:var(--mu);font-family:'Tajawal';font-size:11px;cursor:pointer;transition:.2s;font-weight:700;text-align:center;}
  .pmc{background:rgba(16,185,129,.15)!important;color:var(--gr)!important;border-color:var(--gr)!important;}
  .pmb{background:rgba(59,130,246,.15)!important;color:var(--ac)!important;border-color:var(--ac)!important;}
  .pmd{background:rgba(239,68,68,.15)!important;color:var(--rd)!important;border-color:var(--rd)!important;}
  .ss{margin-bottom:14px;}.ss h3{font-size:10px;color:var(--mu);margin-bottom:7px;font-weight:700;}
  .g2{display:grid;grid-template-columns:1fr 1fr;gap:5px;}
  .sb3{padding:7px;border-radius:7px;border:1px solid var(--b);background:var(--s2);color:#e2e8f0;font-family:'Tajawal';font-size:11px;font-weight:700;cursor:pointer;transition:.2s;text-align:center;}
  .sb3.act{border-color:var(--ac);background:rgba(59,130,246,.15);color:var(--ac);}
  .cl{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;}
  .ch{display:flex;align-items:center;gap:3px;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;background:rgba(59,130,246,.15);color:var(--ac);}
  .vtype-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px;}
  .vtype-card{padding:12px 8px;border-radius:10px;border:2px solid var(--b);background:var(--s2);cursor:pointer;transition:.2s;text-align:center;}
  .vtype-card:hover{border-color:var(--ac);}.vtype-card.vsel{border-color:var(--ac);background:rgba(59,130,246,.1);}
  .acct-wrap{position:relative;}
  .acct-drop{position:absolute;top:100%;right:0;left:0;background:var(--s);border:1px solid var(--b);border-radius:7px;z-index:50;max-height:130px;overflow-y:auto;}
  .acct-item{padding:5px 9px;cursor:pointer;font-size:11px;}.acct-item:hover{background:var(--s2);}
  .vt{width:100%;border-collapse:collapse;}
  .vt th{padding:5px 6px;font-size:10px;color:var(--mu);font-weight:700;text-align:right;border-bottom:1px solid var(--b);}
  .vt td{padding:3px 2px;}
  .vbl{display:flex;justify-content:space-between;padding:5px 9px;border-radius:6px;font-size:11px;font-weight:700;margin-top:5px;}
  .inv-grid{display:grid;grid-template-columns:2fr 1.5fr 1fr 1fr auto;gap:4px;align-items:center;margin-bottom:4px;}
  @media(max-width:768px){.cg{grid-template-columns:1fr;}.main{padding:7px;}.vtype-grid{grid-template-columns:1fr;}}
  @media print{body{background:#fff;color:#000;direction:rtl;}.np{display:none!important;}}
`;

function Toast({t}){return <div className="tc">{t.map(x=><div key={x.id} className={"to "+(x.type==='success'?'ts':x.type==='error'?'te':'tw')}>{x.msg}</div>)}</div>;}
function fd(d){return new Date(d).toLocaleDateString('ar-SA');}
function fdt(d){return new Date(d).toLocaleString('ar-SA',{dateStyle:'short',timeStyle:'short'});}

function DF({onApply}){
  const [f,setF]=useState('');const [t,setT]=useState('');
  return <div className="fb">
    <div><label>من</label><input className="in" type="date" value={f} onChange={e=>setF(e.target.value)}/></div>
    <div><label>الى</label><input className="in" type="date" value={t} onChange={e=>setT(e.target.value)}/></div>
    <button className="btn b1 bsm" onClick={()=>onApply(f,t)}>تطبيق</button>
    <button className="btn bsm" style={{background:'transparent',color:'var(--mu)',border:'1px solid var(--b)'}} onClick={()=>{setF('');setT('');onApply('','');}}>مسح</button>
  </div>;
}

function AccountInput({value,onChange,placeholder}){
  const [show,setShow]=useState(false);
  const filtered=ACCOUNTS.filter(a=>a.includes(value)||value==='');
  return <div className="acct-wrap">
    <input className="in" style={{width:'100%'}} value={value}
      onChange={e=>{onChange(e.target.value);setShow(true);}}
      onFocus={()=>setShow(true)}
      onBlur={()=>setTimeout(()=>setShow(false),150)}
      placeholder={placeholder||'اسم الحساب'}/>
    {show&&filtered.length>0&&<div className="acct-drop">
      {filtered.map(a=><div key={a} className="acct-item" onMouseDown={()=>{onChange(a);setShow(false);}}>{a}</div>)}
    </div>}
  </div>;
}
// ===== INVOICE MODAL =====
function InvoiceModal({type,products,warehouses,customers,onSave,onClose,sym,nextNum}){
  const isSale=type==='sale';
  const [num,setNum]=useState(nextNum);
  const [partyId,setPartyId]=useState('');
  const [partyName,setPartyName]=useState('');
  const [pm,setPm]=useState('cash');
  const [paid,setPaid]=useState('');
  const [notes,setNotes]=useState('');
  const [date,setDate]=useState(new Date().toISOString().split('T')[0]);
  const newRow=()=>({mode:'existing',productId:'',warehouseId:'',productName:'',newProductName:'',newSellPrice:'',price:0,costPrice:0,quantity:1,warehouseName:'',subtotal:0});
  const [items,setItems]=useState([newRow()]);
  const [barcodeInput,setBarcodeInput]=useState('');
  const barcodeRef=React.useRef(null);

  const handleBarcodeScan=(val)=>{
    if(!val.trim())return;
    const p=products.find(x=>x.barcode===val.trim()||x.name.toLowerCase()===val.trim().toLowerCase());
    if(p){
      const existing=items.findIndex(i=>i.productId===p._id);
      if(existing>-1){
        setItems(prev=>prev.map((item,idx)=>{
          if(idx!==existing)return item;
          const newQty=(parseInt(item.quantity)||0)+1;
          return {...item,quantity:newQty,subtotal:(parseFloat(item.price)||0)*newQty};
        }));
      } else {
        const wh=p.warehouses?.[0];
        setItems(prev=>[...prev.filter(i=>i.productId!==''),{mode:'existing',productId:p._id,productName:p.name,price:isSale?p.price:(p.costPrice||0),costPrice:p.costPrice||0,warehouseId:wh?.warehouseId||'',warehouseName:wh?.warehouseName||'',quantity:1,subtotal:isSale?p.price:(p.costPrice||0),newProductName:'',newSellPrice:''}]);
      }
      setBarcodeInput('');
    } else {
      setBarcodeInput('');
      alert('لم يتم العثور على المنتج: '+val);
    }
  };

  const calcSubtotal=(u)=>{
    const pr=u.mode==='new'?parseFloat(u.costPrice||0):parseFloat(u.price||0);
    return pr*(parseInt(u.quantity)||0);
  };

  const upItem=(i,k,v)=>setItems(prev=>prev.map((item,idx)=>{
    if(idx!==i)return item;
    let u={...item,[k]:v};
    if(k==='mode'){u.productId='';u.productName='';u.newProductName='';u.newSellPrice='';u.price=0;u.costPrice=0;u.warehouseId='';u.warehouseName='';}
    if(k==='productId'&&u.mode==='existing'){
      const p=products.find(x=>x._id===v);
      if(p){u.productName=p.name;u.price=isSale?p.price:(p.costPrice||0);u.costPrice=p.costPrice||0;}
      const wh=p?.warehouses?.[0];
      if(wh){u.warehouseId=String(wh.warehouseId);u.warehouseName=wh.warehouseName;}
    }
    if(k==='warehouseId'){
      const p=products.find(x=>x._id===item.productId);
      const wh=p?.warehouses?.find(w=>String(w.warehouseId)===String(v));
      if(wh)u.warehouseName=wh.warehouseName;
      else{const wObj=warehouses.find(x=>String(x._id)===String(v));if(wObj)u.warehouseName=wObj.name;}
    }
    u.subtotal=calcSubtotal(u);
    return u;
  }));

  const total=items.reduce((s,i)=>s+(i.subtotal||0),0);
  useEffect(()=>{if(pm!=='debt')setPaid(total.toFixed(0));else setPaid('0');},[pm,total]);
  const rem=total-parseFloat(paid||0);
  const label=(item)=>item.mode==='new'?(item.newProductName||'منتج جديد'):item.productName;
  const isValid=num&&items.some(i=>i.mode==='existing'?i.productId:(i.newProductName&&i.costPrice&&i.warehouseId));

  return <div className="mo" onClick={onClose}><div className="md" onClick={e=>e.stopPropagation()}>
    <div className="md-t">{isSale?'فاتورة بيع':'فاتورة شراء'}</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:7,marginBottom:9}}>
      <div className="fg"><label>رقم الفاتورة</label><input className="in" style={{width:'100%'}} value={num} onChange={e=>setNum(e.target.value)}/></div>
      <div className="fg"><label>{isSale?'الزبون':'المورد'}</label>
        {isSale
          ?<select className="in" style={{width:'100%'}} value={partyId} onChange={e=>{const c=customers.find(x=>x._id===e.target.value);setPartyId(e.target.value);setPartyName(c?c.name:'');}}>
            <option value="">زبون نقدي</option>{customers.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          :<input className="in" style={{width:'100%'}} placeholder="اسم المورد" value={partyName} onChange={e=>setPartyName(e.target.value)}/>}
      </div>
      <div className="fg"><label>التاريخ</label><input className="in" style={{width:'100%'}} type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
    </div>
    <div style={{marginBottom:9}}>
      <div style={{display:'flex',gap:5,marginBottom:7,alignItems:'center'}}>
        <div style={{flex:1,position:'relative'}}>
          <input ref={barcodeRef} className="in" style={{width:'100%'}} placeholder="امسح باركود أو اكتب اسم + Enter" value={barcodeInput}
            onChange={e=>setBarcodeInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();handleBarcodeScan(barcodeInput);}}}
            autoFocus/>
          <span style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',fontSize:13,color:'var(--mu)',cursor:'pointer',userSelect:'none'}} onClick={()=>{if(barcodeInput)handleBarcodeScan(barcodeInput);}}>⊡</span>
        </div>
        <button className="btn be bsm" onClick={()=>setItems(p=>[...p,newRow()])}>+ يدوي</button>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
        <label style={{fontSize:10,color:'var(--mu)',fontWeight:700}}>المنتجات ({items.filter(i=>i.productId||i.newProductName).length})</label>
      </div>
      <div style={{background:'var(--s2)',borderRadius:7,padding:7,maxHeight:280,overflowY:'auto'}}>
        {items.map((item,i)=>(
          <div key={i} style={{background:'var(--s)',borderRadius:7,padding:7,marginBottom:6,border:'1px solid var(--b)'}}>
            <div style={{display:'flex',gap:5,alignItems:'center',marginBottom:5}}>
              {!isSale&&<><button className={"btn bsm "+(item.mode==='existing'?'b1':'be')} onClick={()=>upItem(i,'mode','existing')}>موجود</button><button className={"btn bsm "+(item.mode==='new'?'bpu':'be')} onClick={()=>upItem(i,'mode','new')}>جديد</button></>}
              {items.length>1&&<button className="btn bd bsm" style={{marginRight:'auto'}} onClick={()=>setItems(p=>p.filter((_,j)=>j!==i))}>حذف</button>}
            </div>
            {(item.mode==='existing'||isSale)?(
              <div style={{display:'grid',gridTemplateColumns:'2fr 1.5fr 1fr 1fr',gap:4}}>
                <div className="fg"><label>المنتج</label>
                  <select className="in" style={{width:'100%'}} value={item.productId} onChange={e=>upItem(i,'productId',e.target.value)}>
                    <option value="">-- اختر --</option>{products.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="fg"><label>المستودع</label>
                  <select className="in" style={{width:'100%'}} value={item.warehouseId} onChange={e=>upItem(i,'warehouseId',e.target.value)}>
                    <option value="">-- مستودع --</option>
                    {(products.find(p=>p._id===item.productId)?.warehouses||[]).map(w=><option key={w.warehouseId} value={w.warehouseId}>{w.warehouseName}({w.quantity})</option>)}
                  </select>
                </div>
                <div className="fg"><label>الكمية</label><input className="in" style={{width:'100%'}} type="number" min="1" value={item.quantity} onChange={e=>upItem(i,'quantity',e.target.value)}/></div>
                <div className="fg"><label>{isSale?'السعر':'التكلفة'} ({sym})</label><input className="in" style={{width:'100%'}} type="number" value={item.price} onChange={e=>upItem(i,'price',e.target.value)}/></div>
              </div>
            ):(
              <div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4,marginBottom:4}}>
                  <div className="fg"><label>اسم المنتج الجديد *</label><input className="in" style={{width:'100%'}} placeholder="اسم المنتج" value={item.newProductName} onChange={e=>upItem(i,'newProductName',e.target.value)}/></div>
                  <div className="fg"><label>سعر البيع ({sym})</label><input className="in" style={{width:'100%'}} type="number" placeholder="0" value={item.newSellPrice} onChange={e=>upItem(i,'newSellPrice',e.target.value)}/></div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:4}}>
                  <div className="fg"><label>المستودع *</label>
                    <select className="in" style={{width:'100%'}} value={item.warehouseId} onChange={e=>upItem(i,'warehouseId',e.target.value)}>
                      <option value="">-- اختر --</option>{warehouses.map(w=><option key={w._id} value={w._id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="fg"><label>الكمية</label><input className="in" style={{width:'100%'}} type="number" min="1" value={item.quantity} onChange={e=>upItem(i,'quantity',e.target.value)}/></div>
                  <div className="fg"><label>سعر الشراء ({sym}) *</label><input className="in" style={{width:'100%'}} type="number" placeholder="0" value={item.costPrice} onChange={e=>upItem(i,'costPrice',e.target.value)}/></div>
                </div>
                <div style={{fontSize:10,color:'var(--yw)',marginTop:4}}>سيتم انشاء المنتج تلقائياً</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    <div style={{background:'var(--s2)',borderRadius:7,padding:'7px 9px',marginBottom:9,fontSize:11}}>
      {items.filter(i=>i.subtotal>0).map((item,ix)=>{const prod=products.find(p=>String(p._id)===String(item.productId));return<div key={ix} style={{display:'flex',justifyContent:'space-between',padding:'1px 0'}}><span>{label(item)} x{item.quantity}{prod?.unit&&<span style={{fontSize:9,color:'var(--mu)',marginRight:3}}>{prod.unit}</span>}</span><span>{item.subtotal}{sym}</span></div>;})}
      <div style={{borderTop:'1px solid var(--b)',marginTop:4,paddingTop:4,fontWeight:900,display:'flex',justifyContent:'space-between'}}><span>الاجمالي</span><span style={{color:'var(--gr)'}}>{total.toFixed(0)}{sym}</span></div>
    </div>
    <div className="fg" style={{marginBottom:9}}><label>طريقة الدفع</label>
      <div className="pm"><button className={"pmt "+(pm==='cash'?'pmc':'')} onClick={()=>setPm('cash')}>نقدي</button><button className={"pmt "+(pm==='bank'?'pmb':'')} onClick={()=>setPm('bank')}>بنك</button><button className={"pmt "+(pm==='debt'?'pmd':'')} onClick={()=>setPm('debt')}>دين</button></div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:9}}>
      <div className="fg"><label>المدفوع ({sym})</label><input className="in" style={{width:'100%'}} type="number" value={paid} onChange={e=>setPaid(e.target.value)}/></div>
      <div className="fg"><label>ملاحظات</label><input className="in" style={{width:'100%'}} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="..."/></div>
    </div>
    {rem>0.01&&<div style={{background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.3)',borderRadius:7,padding:'6px 9px',marginBottom:9,fontSize:11,color:'var(--rd)'}}>المتبقي {rem.toFixed(0)}{sym} سيسجل كدين تلقائياً</div>}
    <div className="md-f">
      <button className="btn bd" onClick={onClose}>الغاء</button>
      <button className="btn b1" disabled={!isValid} style={{opacity:isValid?1:0.5}} onClick={()=>{
        if(!isValid)return;
        const validItems=items.filter(i=>i.mode==='existing'?i.productId:(i.newProductName&&i.costPrice&&i.warehouseId));
        const payload={
          number:num,
          items:validItems.map(item=>({
            productId:item.mode==='new'?null:item.productId,
            productName:item.mode==='new'?item.newProductName:item.productName,
            isNew:item.mode==='new',
            newSellPrice:item.mode==='new'?parseFloat(item.newSellPrice||0):undefined,
            warehouseId:item.warehouseId,warehouseName:item.warehouseName,
            price:parseFloat(item.price||0),
            costPrice:item.mode==='new'?parseFloat(item.costPrice||0):(parseFloat(item.costPrice||0)||parseFloat(item.price||0)),
            quantity:parseInt(item.quantity)||1,
            subtotal:item.subtotal
          })),
          paidAmount:parseFloat(paid||0),paymentMethod:pm,notes,date
        };
        if(isSale){payload.customerId=partyId||null;payload.customerName=partyName||'زبون نقدي';}
        else{payload.supplierName=partyName||'مورد';}
        onSave(payload);
      }}>حفظ الفاتورة</button>
    </div>
  </div></div>;
}

// ===== VOUCHER MODAL (سند القيد المحسّن) =====
function VoucherModal({onSave,onClose,sym,nextNum,customers,onAddCash}){
  const [vType,setVType]=useState('');
  const [num,setNum]=useState(nextNum);
  const [desc,setDesc]=useState('');
  const [personName,setPersonName]=useState('');
  const [cashSource,setCashSource]=useState('cash');
  const [date,setDate]=useState(new Date().toISOString().split('T')[0]);
  const [lines,setLines]=useState([{account:'',debit:'',credit:'',notes:''},{account:'',debit:'',credit:'',notes:''}]);

  const applyTemplate=(type)=>{
    setVType(type);
    if(type==='receipt')setLines([{account:'الصندوق',debit:'',credit:'',notes:''},{account:'الزبائن',debit:'',credit:'',notes:''}]);
    else if(type==='payment')setLines([{account:'الموردون',debit:'',credit:'',notes:''},{account:'الصندوق',debit:'',credit:'',notes:''}]);
    else setLines([{account:'',debit:'',credit:'',notes:''},{account:'',debit:'',credit:'',notes:''}]);
  };

  const upLine=(i,k,v)=>setLines(prev=>prev.map((l,j)=>j===i?{...l,[k]:v}:l));

  const handleAmt=(i,field,val)=>{
    const nl=lines.map((l,j)=>j===i?{...l,[field]:val}:l);
    if(vType==='receipt'&&i===0&&field==='debit')nl[1]={...nl[1],credit:val};
    else if(vType==='payment'&&i===1&&field==='credit')nl[0]={...nl[0],debit:val};
    setLines(nl);
  };

  const totalD=lines.reduce((s,l)=>s+parseFloat(l.debit||0),0);
  const totalC=lines.reduce((s,l)=>s+parseFloat(l.credit||0),0);
  const balanced=Math.abs(totalD-totalC)<0.01&&totalD>0;

  return <div className="mo" onClick={onClose}><div className="md" onClick={e=>e.stopPropagation()}>
    <div className="md-t">سند قيد جديد</div>
    <div className="vtype-grid">
      {[['receipt','سند قبض','استلام نقود من زبون'],['payment','سند صرف','دفع نقود لمورد'],['journal','قيد يومية','قيد محاسبي عام']].map(([k,l,d])=>(
        <div key={k} className={"vtype-card "+(vType===k?'vsel':'')} onClick={()=>applyTemplate(k)}>
          <div style={{fontSize:16,marginBottom:3}}>{k==='receipt'?'قبض':k==='payment'?'صرف':'يومية'}</div>
          <div style={{fontSize:11,fontWeight:700,color:k==='receipt'?'var(--gr)':k==='payment'?'var(--rd)':'var(--pp)'}}>{l}</div>
          <div style={{fontSize:9,color:'var(--mu)',marginTop:2}}>{d}</div>
        </div>
      ))}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:7}}>
      <div className="fg"><label>رقم السند *</label><input className="in" style={{width:'100%'}} placeholder="V-001" value={num} onChange={e=>setNum(e.target.value)}/></div>
      <div className="fg"><label>التاريخ</label><input className="in" style={{width:'100%'}} type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:7}}>
      <div className="fg"><label>الاسم (زبون / مورد / جهة)</label>
        <input className="in" style={{width:'100%'}} list="cust-list" placeholder="اكتب او اختر..." value={personName} onChange={e=>setPersonName(e.target.value)}/>
        <datalist id="cust-list">{(customers||[]).map(c=><option key={c._id} value={c.name}/>)}</datalist>
      </div>
      <div className="fg"><label>البيان</label><input className="in" style={{width:'100%'}} placeholder="وصف العملية..." value={desc} onChange={e=>setDesc(e.target.value)}/></div>
    </div>
    {(vType==='receipt'||vType==='payment')&&<div style={{background:'rgba(59,130,246,.08)',border:'1px solid rgba(59,130,246,.2)',borderRadius:7,padding:'7px 10px',marginBottom:9,fontSize:11}}>
      <div style={{fontWeight:700,color:'var(--ac)',marginBottom:5}}>ربط تلقائي بالصندوق عند الحفظ</div>
      <div className="pm">
        <button className={"pmt "+(cashSource==='cash'?'pmc':'')} onClick={()=>setCashSource('cash')}>💵 كاش</button>
        <button className={"pmt "+(cashSource==='bank'?'pmb':'')} onClick={()=>setCashSource('bank')}>🏦 بنك</button>
      </div>
    </div>}
    <div style={{background:'var(--s2)',borderRadius:8,padding:8,marginBottom:9}}>
      <table className="vt">
        <thead><tr><th style={{width:'32%'}}>الحساب *</th><th style={{width:'20%'}}>مدين ({sym})</th><th style={{width:'20%'}}>دائن ({sym})</th><th>بيان</th><th style={{width:'28px'}}></th></tr></thead>
        <tbody>{lines.map((l,i)=><tr key={i}>
          <td><AccountInput value={l.account} onChange={v=>upLine(i,'account',v)} placeholder={i===0?'الحساب المدين':'الحساب الدائن'}/></td>
          <td><input className="in" style={{width:'100%'}} type="number" placeholder="0" value={l.debit} onChange={e=>handleAmt(i,'debit',e.target.value)}/></td>
          <td><input className="in" style={{width:'100%'}} type="number" placeholder="0" value={l.credit} onChange={e=>handleAmt(i,'credit',e.target.value)}/></td>
          <td><input className="in" style={{width:'100%'}} placeholder="..." value={l.notes} onChange={e=>upLine(i,'notes',e.target.value)}/></td>
          <td>{lines.length>2&&<button className="btn bd bsm" onClick={()=>setLines(p=>p.filter((_,j)=>j!==i))}>x</button>}</td>
        </tr>)}</tbody>
      </table>
      <button className="btn be bsm" style={{marginTop:5}} onClick={()=>setLines(p=>[...p,{account:'',debit:'',credit:'',notes:''}])}>+ سطر</button>
    </div>
    <div className="vbl" style={{background:balanced?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)',border:'1px solid '+(balanced?'var(--gr)':'var(--rd)')}}>
      <span>مدين: <strong style={{color:'var(--ac)'}}>{totalD.toFixed(2)}{sym}</strong></span>
      <span style={{color:balanced?'var(--gr)':'var(--rd)'}}>{totalD===0?'ادخل المبالغ':balanced?'القيد متوازن':'غير متوازن'}</span>
      <span>دائن: <strong style={{color:'var(--pp)'}}>{totalC.toFixed(2)}{sym}</strong></span>
    </div>
    <div className="md-f">
      <button className="btn bd" onClick={onClose}>الغاء</button>
      <button className="btn b1" disabled={!balanced||!num} style={{opacity:(!balanced||!num)?0.5:1}}
        onClick={()=>{const payload={number:num,date,description:desc,voucherType:vType,personName,cashSource,lines:lines.map(l=>({...l,debit:parseFloat(l.debit||0),credit:parseFloat(l.credit||0)}))};onSave(payload);}}>
        حفظ السند
      </button>
    </div>
  </div></div>;
}

// ===== PRINT MODAL =====
function PrintModal({inv,sym,onClose,isSale}){
  return <div className="mo" onClick={onClose}><div className="md" style={{background:'#fff',color:'#000',direction:'rtl'}} onClick={e=>e.stopPropagation()}>
    <div style={{textAlign:'center',marginBottom:12}}>
      <h2 style={{fontSize:16,fontWeight:900}}>RO</h2>
      <div style={{fontSize:11}}>{isSale?'فاتورة بيع':'فاتورة شراء'} رقم: <strong>{inv.number}</strong></div>
      <div style={{fontSize:10,color:'#666'}}>{fd(inv.date)}</div>
    </div>
    <div style={{fontSize:11,marginBottom:9}}><strong>{isSale?'الزبون':'المورد'}:</strong> {isSale?inv.customerName:inv.supplierName}</div>
    <table style={{width:'100%',borderCollapse:'collapse',marginBottom:9,fontSize:11}}>
      <thead><tr style={{borderBottom:'2px solid #000'}}><th style={{padding:4,textAlign:'right'}}>المنتج</th><th style={{padding:4,textAlign:'center'}}>الكمية</th><th style={{padding:4,textAlign:'center'}}>السعر</th><th style={{padding:4,textAlign:'center'}}>المجموع</th></tr></thead>
      <tbody>{(inv.items||[]).map((it,i)=><tr key={i} style={{borderBottom:'1px solid #eee'}}><td style={{padding:3}}>{it.productName}</td><td style={{padding:3,textAlign:'center'}}>{it.quantity}</td><td style={{padding:3,textAlign:'center'}}>{it.price||it.costPrice}{sym}</td><td style={{padding:3,textAlign:'center'}}>{it.subtotal}{sym}</td></tr>)}</tbody>
    </table>
    <div style={{borderTop:'2px solid #000',paddingTop:6,fontSize:11}}>
      <div style={{display:'flex',justifyContent:'space-between'}}><span>الاجمالي:</span><strong>{inv.totalAmount}{sym}</strong></div>
      <div style={{display:'flex',justifyContent:'space-between'}}><span>المدفوع:</span><strong style={{color:'green'}}>{inv.paidAmount}{sym}</strong></div>
      {inv.totalAmount>inv.paidAmount&&<div style={{display:'flex',justifyContent:'space-between'}}><span>المتبقي:</span><strong style={{color:'red'}}>{(inv.totalAmount-inv.paidAmount).toFixed(0)}{sym}</strong></div>}
    </div>
    <div style={{textAlign:'center',marginTop:10,fontSize:10,color:'#999'}}>شكرا لتعاملكم معنا</div>
    <div className="md-f"><button className="btn bd" onClick={onClose}>اغلاق</button><button className="btn b1" onClick={()=>window.print()}>طباعة</button></div>
  </div></div>;
}
// ===== MAIN APP =====

// ===== TRANSFER MODAL =====
function TransferModal({product, warehouses, onSave, onClose}){
  const [fromId, setFromId] = useState(product?.warehouses?.[0]?.warehouseId||'');
  const [toId, setToId] = useState('');
  const [qty, setQty] = useState('1');
  const fromWh = product?.warehouses?.find(w=>String(w.warehouseId)===String(fromId));
  const maxQty = fromWh?.quantity || 0;
  const toOptions = warehouses.filter(w=>String(w._id)!==String(fromId));

  return <div className="mo" onClick={onClose}><div className="md" onClick={e=>e.stopPropagation()} style={{width:420}}>
    <div className="md-t">نقل مخزون بين المستودعات</div>
    <div style={{background:'var(--s2)',borderRadius:8,padding:'9px 12px',marginBottom:12,fontSize:12}}>
      <strong>{product?.name}</strong>
      <div style={{fontSize:10,color:'var(--mu)',marginTop:3}}>إجمالي المخزون: {product?.warehouses?.reduce((s,w)=>s+w.quantity,0)} {product?.unit||'قطعة'}</div>
    </div>
    <div className="fg" style={{marginBottom:9}}>
      <label>من مستودع</label>
      <select className="in" style={{width:'100%'}} value={fromId} onChange={e=>{setFromId(e.target.value);setToId('');}}>
        {(product?.warehouses||[]).filter(w=>w.quantity>0).map(w=><option key={w.warehouseId} value={w.warehouseId}>{w.warehouseName} (متوفر: {w.quantity})</option>)}
      </select>
    </div>
    <div className="fg" style={{marginBottom:9}}>
      <label>إلى مستودع</label>
      <select className="in" style={{width:'100%'}} value={toId} onChange={e=>setToId(e.target.value)}>
        <option value="">-- اختر مستودع --</option>
        {toOptions.map(w=><option key={w._id} value={w._id}>{w.name}</option>)}
      </select>
    </div>
    <div className="fg" style={{marginBottom:9}}>
      <label>الكمية (المتاح: {maxQty})</label>
      <input className="in" style={{width:'100%'}} type="number" min="1" max={maxQty} value={qty} onChange={e=>setQty(e.target.value)}/>
    </div>
    <div style={{display:'flex',gap:5,marginBottom:11}}>
      <button className="btn be bsm" onClick={()=>setQty(String(maxQty))}>كل الكمية</button>
      <button className="btn be bsm" onClick={()=>setQty(String(Math.floor(maxQty/2)))}>النصف</button>
    </div>
    {fromId&&toId&&qty>0&&<div style={{background:'rgba(59,130,246,.1)',border:'1px solid rgba(59,130,246,.2)',borderRadius:7,padding:'6px 9px',fontSize:11,marginBottom:9}}>
      نقل {qty} {product?.unit||'قطعة'} من {fromWh?.warehouseName} إلى {warehouses.find(w=>String(w._id)===String(toId))?.name}
    </div>}
    <div className="md-f">
      <button className="btn bd" onClick={onClose}>إلغاء</button>
      <button className="btn b1" disabled={!fromId||!toId||!qty||parseInt(qty)<=0||parseInt(qty)>maxQty}
        style={{opacity:(!fromId||!toId||!qty||parseInt(qty)<=0||parseInt(qty)>maxQty)?0.5:1}}
        onClick={()=>onSave(product._id, fromId, toId, parseInt(qty))}>
        نقل المخزون
      </button>
    </div>
  </div></div>;
}

export default function App(){
  const [page,setPage]=useState('products');
  const [currency,setCurrency]=useState('USD');
  const [products,setProducts]=useState([]);
  const [filteredProducts,setFilteredProducts]=useState([]);
  const [categories,setCategories]=useState([]);
  const [warehouses,setWarehouses]=useState([]);
  const [customers,setCustomers]=useState([]);
  const [sellLogs,setSellLogs]=useState([]);
  const [purchaseLogs,setPurchaseLogs]=useState([]);
  const [saleInvoices,setSaleInvoices]=useState([]);
  const [purchaseInvoices,setPurchaseInvoices]=useState([]);
  const [debts,setDebts]=useState([]);
  const [cashLog,setCashLog]=useState([]);
  const [vouchers,setVouchers]=useState([]);
  const [search,setSearch]=useState('');
  const [sortBy,setSortBy]=useState('name');
  const [catFilter,setCatFilter]=useState('all');
  const [showSaleInv,setShowSaleInv]=useState(false);
  const [showPurchInv,setShowPurchInv]=useState(false);
  const [showVoucher,setShowVoucher]=useState(false);
  const [showDebt,setShowDebt]=useState(false);
  const [printInv,setPrintInv]=useState(null);
  const [printInvType,setPrintInvType]=useState('sale');
  const [payingDebt,setPayingDebt]=useState(null);
  const [payAmount,setPayAmount]=useState('');
  const [debtFilter,setDebtFilter]=useState('all');
  const [toasts,setToasts]=useState([]);
  const [selectedCustomer,setSelectedCustomer]=useState(null);
  const [customerHistory,setCustomerHistory]=useState(null);
  const [customerSearch,setCustomerSearch]=useState('');
  const [newCustomer,setNewCustomer]=useState({name:'',phone:''});
  const [newCat,setNewCat]=useState('');
  const [newWh,setNewWh]=useState('');
  const [cashForm,setCashForm]=useState({amount:'',note:'',source:'cash'});
  const [cashTab,setCashTab]=useState('cash');
  const [newProduct,setNewProduct]=useState({name:'',price:'',costPrice:'',quantity:'',unit:'قطعة',barcode:'',expiryDate:'',categoryId:'',categoryName:'',warehouseId:'',warehouseName:'',newCat:'',newWh:'',pm:'cash'});
  const [showTransfer,setShowTransfer]=useState(false);
  const [transferProduct,setTransferProduct]=useState(null);
  const [expiryAlerts,setExpiryAlerts]=useState([]);
  const [debtForm,setDebtForm]=useState({type:'علي',personName:'',personId:'',totalAmount:'',paidAmount:'0',notes:'',date:new Date().toISOString().split('T')[0]});
  const [loading,setLoading]=useState(false);
  const sym=SYMS[currency];

  const toast=(msg,type='success')=>{const id=Date.now();setToasts(p=>[...p,{id,msg,type}]);setTimeout(()=>setToasts(p=>p.filter(x=>x.id!==id)),3000);};

  const load=useCallback(()=>{
    fetch(API+'/api/products').then(r=>r.json()).then(d=>{setProducts(d);setFilteredProducts(d);}).catch(()=>{});
    fetch(API+'/api/categories').then(r=>r.json()).then(setCategories).catch(()=>{});
    fetch(API+'/api/warehouses').then(r=>r.json()).then(setWarehouses).catch(()=>{});
    fetch(API+'/api/customers').then(r=>r.json()).then(setCustomers).catch(()=>{});
    fetch(API+'/api/sell-logs').then(r=>r.json()).then(setSellLogs).catch(()=>{});
    fetch(API+'/api/purchase-logs').then(r=>r.json()).then(setPurchaseLogs).catch(()=>{});
    fetch(API+'/api/sale-invoices').then(r=>r.json()).then(setSaleInvoices).catch(()=>{});
    fetch(API+'/api/purchase-invoices').then(r=>r.json()).then(setPurchaseInvoices).catch(()=>{});
    fetch(API+'/api/debts').then(r=>r.json()).then(setDebts).catch(()=>{});
    fetch(API+'/api/cash').then(r=>r.json()).then(setCashLog).catch(()=>{});
    fetch(API+'/api/vouchers').then(r=>r.json()).then(setVouchers).catch(()=>{});
    fetch(API+'/api/settings').then(r=>r.json()).then(s=>{if(s.currency)setCurrency(s.currency);}).catch(()=>{});
    fetch(API+'/api/products/expiring?days=30').then(r=>r.json()).then(d=>{if(d.expiring||d.expired)setExpiryAlerts([...(d.expired||[]).map(p=>({...p,isExpired:true})),  ...(d.expiring||[]).map(p=>({...p,isExpired:false}))]);}).catch(()=>{});
  },[]);

  useEffect(()=>{load();},[load]);

  useEffect(()=>{
    let list=[...products];
    if(search)list=list.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));
    if(catFilter!=='all')list=catFilter===''?list.filter(p=>!p.categoryId):list.filter(p=>String(p.categoryId)===catFilter);
    if(sortBy==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
    else if(sortBy==='price')list.sort((a,b)=>a.price-b.price);
    else if(sortBy==='qty')list.sort((a,b)=>(a.warehouses||[]).reduce((s,w)=>s+w.quantity,0)-(b.warehouses||[]).reduce((s,w)=>s+w.quantity,0));
    setFilteredProducts(list);
  },[products,search,catFilter,sortBy]);

  const getQty=p=>(p.warehouses||[]).reduce((s,w)=>s+w.quantity,0);

  const addInlineCat=async(name)=>{
    if(!name?.trim())return null;
    const ex=categories.find(c=>c.name===name.trim());if(ex)return ex;
    const res=await fetch(API+'/api/categories',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name.trim()})});
    if(!res.ok)return null;const c=await res.json();setCategories(p=>[...p,c]);return c;
  };

  const addInlineWh=async(name)=>{
    if(!name?.trim())return null;
    const ex=warehouses.find(w=>w.name===name.trim());if(ex)return ex;
    const res=await fetch(API+'/api/warehouses',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name.trim()})});
    if(!res.ok)return null;const w=await res.json();setWarehouses(p=>[...p,w]);return w;
  };

  const handleAddProduct=async(e)=>{
    e.preventDefault();if(!newProduct.name||!newProduct.price||!newProduct.quantity)return;
    setLoading(true);
    try{
      let catId=newProduct.categoryId,catName=newProduct.categoryName;
      if(newProduct.newCat){const c=await addInlineCat(newProduct.newCat);if(c){catId=c._id;catName=c.name;}}
      let whId=newProduct.warehouseId,whName=newProduct.warehouseName;
      if(newProduct.newWh){const w=await addInlineWh(newProduct.newWh);if(w){whId=w._id;whName=w.name;}}
      const whList=whId?[{warehouseId:whId,warehouseName:whName,quantity:parseInt(newProduct.quantity)}]:[];
      const res=await fetch(API+'/api/products',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:newProduct.name,price:parseFloat(newProduct.price),costPrice:parseFloat(newProduct.costPrice)||0,unit:newProduct.unit||'قطعة',barcode:newProduct.barcode||'',expiryDate:newProduct.expiryDate||null,warehouses:whList,categoryId:catId||null,categoryName:catName||'',paymentMethod:newProduct.pm})});
      const saved=await res.json();
      setProducts(p=>[...p,saved]);
      if(newProduct.costPrice)fetch(API+'/api/purchase-logs').then(r=>r.json()).then(setPurchaseLogs).catch(()=>{});
      setNewProduct({name:'',price:'',costPrice:'',quantity:'',unit:'قطعة',barcode:'',expiryDate:'',categoryId:'',categoryName:'',warehouseId:'',warehouseName:'',newCat:'',newWh:'',pm:'cash'});
      toast('تمت الاضافة');
    }catch{toast('خطا','error');}
    setLoading(false);
  };

  const handleSaleInvoice=async(form)=>{
    try{
      const res=await fetch(API+'/api/sale-invoices',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      if(!res.ok){const err=await res.json();toast(err.error||'خطا','error');return;}
      toast('تم حفظ الفاتورة');setShowSaleInv(false);load();
    }catch{toast('خطا','error');}
  };

  const handlePurchaseInvoice=async(form)=>{
    try{
      const res=await fetch(API+'/api/purchase-invoices',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      if(!res.ok){const err=await res.json();toast(err.error||'خطا','error');return;}
      toast('تم حفظ فاتورة الشراء');setShowPurchInv(false);load();
    }catch{toast('خطا','error');}
  };

  const handleDelSell=async(id)=>{
    try{await fetch(API+'/api/sell-logs/'+id,{method:'DELETE'});setSellLogs(p=>p.filter(x=>x._id!==id));load();toast('تم الحذف','error');}
    catch{toast('خطا','error');}
  };

  const handleDelPurch=async(id)=>{
    try{await fetch(API+'/api/purchase-logs/'+id,{method:'DELETE'});setPurchaseLogs(p=>p.filter(x=>x._id!==id));load();toast('تم الحذف','error');}
    catch{toast('خطا','error');}
  };

  const handleAddDebt=async()=>{
    if(!debtForm.personName||!debtForm.totalAmount)return;
    try{
      const res=await fetch(API+'/api/debts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...debtForm,totalAmount:parseFloat(debtForm.totalAmount),paidAmount:parseFloat(debtForm.paidAmount||0)})});
      if(!res.ok){toast('خطا','error');return;}
      const saved=await res.json();setDebts(p=>[saved,...p]);setShowDebt(false);
      setDebtForm({type:'علي',personName:'',personId:'',totalAmount:'',paidAmount:'0',notes:'',date:new Date().toISOString().split('T')[0]});
      toast('تم اضافة الدين');
    }catch{toast('خطا','error');}
  };

  const handlePay=async(id,amount)=>{
    try{
      const res=await fetch(API+'/api/debts/'+id+'/pay',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:parseFloat(amount)})});
      const up=await res.json();setDebts(p=>p.map(d=>d._id===id?up:d));
      setPayingDebt(null);setPayAmount('');
      toast(up.status==='paid'?'تم السداد الكامل':'تم تسجيل الدفعة');
    }catch{toast('خطا','error');}
  };

  const handleCash=async(type)=>{
    if(!cashForm.amount)return;
    try{
      const src=cashForm.source||cashTab;
    const res=await fetch(API+'/api/cash',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,amount:parseFloat(cashForm.amount),note:cashForm.note,source:src})});
      const saved=await res.json();setCashLog(p=>[saved,...p]);setCashForm({amount:'',note:'',source:'cash'});toast('تم');
    }catch{toast('خطا','error');}
  };

  const handleAddVoucher=async(form)=>{
    try{
      const res=await fetch(API+'/api/vouchers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      if(!res.ok){const err=await res.json();toast(err.error||'خطا','error');return;}
      const saved=await res.json();setVouchers(p=>[saved,...p]);setShowVoucher(false);toast('تم اضافة السند');
      // ربط تلقائي بالصندوق
      if(form.voucherType==='receipt'||form.voucherType==='payment'){
        const amount=form.lines.reduce((s,l)=>s+parseFloat(l.debit||0),0);
        if(amount>0){
          const type=form.voucherType==='receipt'?'in':'out';
          const note=(form.personName?form.personName+' - ':'')+( form.description||'سند '+form.number);
          const cashRes=await fetch(API+'/api/cash',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,amount,note,source:form.cashSource||'cash'})});
          const cashSaved=await cashRes.json();setCashLog(p=>[cashSaved,...p]);
          toast('تم اضافة السند وتسجيله بالصندوق تلقائياً');
        }
      }
    }catch{toast('خطا','error');}
  };

  const addCustomer=async()=>{
    if(!newCustomer.name.trim())return;
    try{
      const res=await fetch(API+'/api/customers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(newCustomer)});
      if(!res.ok){toast('الاسم موجود مسبقا','error');return;}
      const c=await res.json();setCustomers(p=>[...p,c]);setNewCustomer({name:'',phone:''});toast('تمت الاضافة');
    }catch{toast('خطا','error');}
  };

  const handleTransfer=async(productId, fromId, toId, qty)=>{
    try{
      const res=await fetch(API+'/api/products/'+productId+'/transfer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fromWarehouseId:fromId,toWarehouseId:toId,quantity:qty})});
      if(!res.ok){const err=await res.json();toast(err.error||'خطا','error');return;}
      const data=await res.json();
      setProducts(p=>p.map(x=>x._id===productId?data.product:x));
      setShowTransfer(false);setTransferProduct(null);
      toast('تم نقل المخزون بنجاح');
    }catch{toast('خطا','error');}
  };

  const loadCustomerHistory=async(id)=>{
    try{const res=await fetch(API+'/api/customers/'+id+'/history');const data=await res.json();setCustomerHistory(data);setSelectedCustomer(id);}
    catch{toast('خطا','error');}
  };

  // بحث بالاسم مباشرة (بدون id)
  const loadCustomerHistoryByName=async(name)=>{
    if(!name.trim())return;
    try{
      // ابحث عن الزبون بالاسم
      const cust=customers.find(c=>c.name.toLowerCase()===name.toLowerCase().trim());
      if(cust){const res=await fetch(API+'/api/customers/'+cust._id+'/history');const data=await res.json();setCustomerHistory(data);setSelectedCustomer(cust._id);}
      else{
        // بحث في الفواتير مباشرة بدون id
        const [si,pi,debts]=await Promise.all([
          fetch(API+'/api/sale-invoices?customer='+encodeURIComponent(name)).then(r=>r.json()),
          fetch(API+'/api/purchase-invoices').then(r=>r.json()),
          fetch(API+'/api/debts').then(r=>r.json()),
        ]);
        const filtPurch=pi.filter(i=>i.supplierName?.toLowerCase().includes(name.toLowerCase()));
        const filtDebts=debts.filter(d=>d.personName?.toLowerCase().includes(name.toLowerCase()));
        const totalSales=si.reduce((s,i)=>s+i.totalAmount,0);
        const totalPurchases=filtPurch.reduce((s,i)=>s+i.totalAmount,0);
        const totalDebt=filtDebts.filter(d=>d.status==='pending').reduce((s,d)=>s+(d.totalAmount-d.paidAmount),0);
        setCustomerHistory({customer:{name},salesInvoices:si,purchaseInvoices:filtPurch,debts:filtDebts,totalSales,totalPurchases,totalDebt});
        setSelectedCustomer(null);
      }
    }catch{toast('خطا','error');}
  };

  const runCustomerSearch=()=>loadCustomerHistoryByName(customerSearch);

  // تصدير PDF للزبون
  const exportCustomerPDF=(history,sym,searchName)=>{
    const name=history?.customer?.name||searchName||'زبون';
    const si=history?.salesInvoices||[];
    const pi=history?.purchaseInvoices||[];
    const debts=history?.debts||[];
    const today=new Date().toLocaleDateString('ar-SA');

    let siRows='';
    si.forEach(i=>{
      const prods=(i.items||[]).map(x=>x.productName).join(', ');
      const rem=(i.totalAmount-i.paidAmount).toFixed(0);
      const stClass=i.status==='paid'?'paid':i.status==='debt'?'debt':'partial';
      const stLabel=i.status==='paid'?'مدفوعة':i.status==='debt'?'دين':'جزئي';
      siRows+='<tr><td style="font-weight:700">'+i.number+'</td><td style="font-size:10px;color:#64748b">'+prods+'</td><td>'+i.totalAmount+sym+'</td><td>'+i.paidAmount+sym+'</td><td>'+rem+sym+'</td><td class="'+stClass+'">'+stLabel+'</td><td>'+new Date(i.date).toLocaleDateString('ar-SA')+'</td></tr>';
    });

    let piRows='';
    pi.forEach(i=>{
      const prods=(i.items||[]).map(x=>x.productName).join(', ');
      piRows+='<tr><td style="font-weight:700">'+i.number+'</td><td>'+(i.supplierName||'-')+'</td><td style="font-size:10px;color:#64748b">'+prods+'</td><td>'+i.totalAmount+sym+'</td><td>'+i.paidAmount+sym+'</td><td>'+new Date(i.date).toLocaleDateString('ar-SA')+'</td></tr>';
    });

    let dRows='';
    debts.forEach(d=>{
      const rem=(d.totalAmount-d.paidAmount).toFixed(0);
      const stClass=d.totalAmount>d.paidAmount?'debt':'paid';
      dRows+='<tr><td>'+(d.type==='علي'?'عليّ':'ليّ')+'</td><td>'+d.totalAmount+sym+'</td><td>'+d.paidAmount+sym+'</td><td class="'+stClass+'">'+rem+sym+'</td><td>'+(d.status==='paid'?'مسدد':'مفتوح')+'</td><td>'+new Date(d.date).toLocaleDateString('ar-SA')+'</td></tr>';
    });

    const siSection=si.length>0?('<h2>فواتير البيع ('+si.length+')</h2><table><thead><tr><th>رقم</th><th>المنتجات</th><th>الاجمالي</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th><th>التاريخ</th></tr></thead><tbody>'+siRows+'</tbody></table>'):'';
    const piSection=pi.length>0?('<h2>فواتير الشراء ('+pi.length+')</h2><table><thead><tr><th>رقم</th><th>المورد</th><th>المنتجات</th><th>الاجمالي</th><th>المدفوع</th><th>التاريخ</th></tr></thead><tbody>'+piRows+'</tbody></table>'):'';
    const dSection=debts.length>0?('<h2>الديون ('+debts.length+')</h2><table><thead><tr><th>النوع</th><th>المبلغ</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th><th>التاريخ</th></tr></thead><tbody>'+dRows+'</tbody></table>'):'';

    const html='<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"/><title>سجل '+name+'</title>'
      +'<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Tahoma,Arial,sans-serif;font-size:12px;color:#111;padding:24px;background:#fff;}'
      +'h1{font-size:18px;font-weight:700;margin-bottom:4px;}.sub{font-size:11px;color:#666;margin-bottom:20px;}'
      +'.stats{display:flex;gap:12px;margin-bottom:20px;}.stat{flex:1;border:1px solid #e2e8f0;border-radius:8px;padding:10px;text-align:center;}'
      +'.stat-label{font-size:10px;color:#888;margin-bottom:3px;}.stat-value{font-size:16px;font-weight:700;}'
      +'h2{font-size:13px;font-weight:700;margin:18px 0 7px;padding-bottom:4px;border-bottom:2px solid #3b82f6;color:#1e40af;}'
      +'table{width:100%;border-collapse:collapse;margin-bottom:4px;}th{background:#f1f5f9;padding:6px 8px;text-align:right;font-size:10px;font-weight:700;color:#475569;border:1px solid #e2e8f0;}'
      +'td{padding:5px 8px;font-size:11px;border:1px solid #e2e8f0;}tr:nth-child(even) td{background:#f8fafc;}'
      +'.paid{color:#059669;font-weight:700;}.debt{color:#dc2626;font-weight:700;}.partial{color:#d97706;font-weight:700;}'
      +'.footer{margin-top:24px;text-align:center;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:10px;}'
      +'</style></head><body>'
      +'<h1>سجل الزبون: '+name+'</h1>'
      +'<div class="sub">تاريخ التصدير: '+today+' | RO</div>'
      +'<div class="stats">'
      +'<div class="stat"><div class="stat-label">اجمالي المبيعات</div><div class="stat-value" style="color:#1d4ed8">'+(history?.totalSales||0).toFixed(0)+sym+'</div></div>'
      +'<div class="stat"><div class="stat-label">اجمالي المشتريات</div><div class="stat-value" style="color:#059669">'+(history?.totalPurchases||0).toFixed(0)+sym+'</div></div>'
      +'<div class="stat"><div class="stat-label">الديون المتبقية</div><div class="stat-value" style="color:#dc2626">'+(history?.totalDebt||0).toFixed(0)+sym+'</div></div>'
      +'</div>'
      +siSection+piSection+dSection
      +'<div class="footer">RO - نظام ادارة المخازن</div>'
      +'</body></html>';

    const blob=new Blob([html],{type:'text/html;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const w=window.open(url,'_blank');
    if(w){setTimeout(()=>{w.print();URL.revokeObjectURL(url);},800);}
    toast('تم فتح PDF للطباعة');
  };
const exportCustomerCSV = (history, sym, searchName) => {
    const name = history?.customer?.name || searchName || 'زبون';
    const rows = [['سجل: ' + name], [], ['فواتير البيع'], ['رقم', 'الاجمالي', 'المدفوع', 'المتبقي', 'الحالة', 'التاريخ']];
    (history?.salesInvoices || []).forEach(i => rows.push([i.number, i.totalAmount, i.paidAmount, (i.totalAmount - i.paidAmount).toFixed(0), i.status, fd(i.date)]));
    rows.push([], ['فواتير الشراء'], ['رقم', 'المورد', 'الاجمالي', 'المدفوع', 'التاريخ']);
    (history?.purchaseInvoices || []).forEach(i => rows.push([i.number, i.supplierName || '-', i.totalAmount, i.paidAmount, fd(i.date)]));
    rows.push([], ['الديون'], ['النوع', 'المبلغ', 'المدفوع', 'المتبقي', 'الحالة']);
    (history?.debts || []).forEach(d => rows.push([d.type, d.totalAmount, d.paidAmount, (d.totalAmount - d.paidAmount).toFixed(0), d.status]));
    
    // التصحيح هنا: استخدم \n بدلاً من ضغط Enter
    const csv = rows.map(r => r.join(',')).join('\n');
    
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })); a.download = name + '.csv'; a.click();
    toast('تم التصدير CSV');
};


  // احصائيات تتحدث دائما
  const totalRev=sellLogs.reduce((s,l)=>s+l.price*l.quantity,0);
  const totalCost=sellLogs.reduce((s,l)=>s+(l.costPrice||0)*l.quantity,0);
  const profit=totalRev-totalCost;
  const purchCost=purchaseLogs.reduce((s,l)=>s+(l.costPrice||0)*l.quantity,0);
  const invVal=products.reduce((s,p)=>s+(p.costPrice||0)*getQty(p),0);
  const net=profit-purchCost+invVal;
  const cashOnly=cashLog.filter(c=>c.source==='cash').reduce((s,c)=>s+(c.type==='in'?c.amount:-c.amount),0);
  const bankBal=cashLog.filter(c=>c.source==='bank').reduce((s,c)=>s+(c.type==='in'?c.amount:-c.amount),0);
  const debtsOnMe=debts.filter(d=>d.type==='علي'&&d.status==='pending').reduce((s,d)=>s+(d.totalAmount-d.paidAmount),0);
  const filtDebts=debtFilter==='all'?debts.filter(d=>d.status==='pending'):debtFilter==='paid'?debts.filter(d=>d.status==='paid'):debts.filter(d=>d.type===debtFilter&&d.status==='pending');

  const nextSaleNum='SI-'+String(saleInvoices.length+1).padStart(3,'0');
  const nextPurchNum='PI-'+String(purchaseInvoices.length+1).padStart(3,'0');
  const nextVchNum='V-'+String(vouchers.length+1).padStart(3,'0');

  const barData={labels:products.slice(0,12).map(p=>p.name),datasets:[{label:'سعر البيع',data:products.slice(0,12).map(p=>p.price),backgroundColor:'rgba(59,130,246,.7)',borderRadius:4},{label:'سعر الشراء',data:products.slice(0,12).map(p=>p.costPrice||0),backgroundColor:'rgba(139,92,246,.7)',borderRadius:4}]};
  const doData={labels:['ارباح','تكاليف','مخزون'],datasets:[{data:[Math.max(0,profit),totalCost,invVal],backgroundColor:['rgba(16,185,129,.8)','rgba(239,68,68,.7)','rgba(59,130,246,.7)'],borderWidth:0}]};
  const co={plugins:{legend:{labels:{color:'#94a3b8',font:{family:'Tajawal'}}}},scales:{x:{ticks:{color:'#64748b'},grid:{color:'#1e2d45'}},y:{ticks:{color:'#64748b'},grid:{color:'#1e2d45'}}}};

  const pages=[['products','المنتجات'],['sale-inv','فواتير بيع'],['purch-inv','فواتير شراء'],['sales','المبيعات'],['purchases','المشتريات'],['debts','الديون'],['cashbox','الصندوق'],['profits','الارباح'],['vouchers','سندات'],['customers','الزبائن'],['settings','الاعدادات'],['add','اضافة']];

  return <>
    <style>{S}</style>
    <div style={{direction:'rtl',fontFamily:'Tajawal, sans-serif'}}>
      <nav className="nb np">
        <div className="nb-brand">RO</div>
        <div className="nb-tabs">{pages.map(([p,l])=><button key={p} className={"nt "+(page===p?'active':'')} onClick={()=>setPage(p)}>{l}</button>)}</div>
      </nav>
      <div className="main np">
        <div className="sg">
          <div className="sc sb" style={{cursor:"pointer"}} onClick={()=>setPage("products")}><div className="sl">المنتجات</div><div className="sv">{products.length}</div></div>
          <div className="sc sc2" style={{cursor:"pointer"}} onClick={()=>setPage("sale-inv")}><div className="sl">فواتير بيع</div><div className="sv">{saleInvoices.length}</div></div>
          <div className="sc sg2" style={{cursor:'pointer'}} onClick={()=>setPage('profits')}><div className="sl">الارباح</div><div className="sv">{profit.toFixed(0)}{sym}</div></div>
          <div className="sc sy" style={{cursor:"pointer"}} onClick={()=>{setPage("cashbox");setCashTab('cash');}}><div className="sl">صندوق</div><div className="sv">{cashOnly.toFixed(0)}{sym}</div></div>
          <div className="sc sb" style={{cursor:"pointer"}} onClick={()=>{setPage("cashbox");setCashTab('bank');}}><div className="sl">بنك</div><div className="sv">{bankBal.toFixed(0)}{sym}</div></div>
          <div className="sc sr" style={{cursor:"pointer"}} onClick={()=>setPage("debts")}><div className="sl">ديون عليك</div><div className="sv">{debtsOnMe.toFixed(0)}{sym}</div></div>
          <div className={"sc "+(net>=0?'sg2':'sr')}><div className="sl">الوضع المالي</div><div className="sv">{net.toFixed(0)}{sym}</div></div>
        </div>

        {/* تنبيهات انتهاء الصلاحية */}
        {expiryAlerts.length>0&&<div style={{background:'rgba(245,158,11,.1)',border:'1px solid rgba(245,158,11,.35)',borderRadius:10,padding:'9px 12px',marginBottom:10}}>
          <div style={{fontWeight:700,fontSize:11,color:'var(--yw)',marginBottom:6}}>⚠️ تنبيهات الصلاحية ({expiryAlerts.length} منتج)</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
            {expiryAlerts.map(p=>{
              const exp=new Date(p.expiryDate);
              const now=new Date();
              const days=Math.ceil((exp-now)/(1000*60*60*24));
              return <div key={p._id} style={{background:p.isExpired?'rgba(239,68,68,.15)':'rgba(245,158,11,.15)',border:'1px solid '+(p.isExpired?'rgba(239,68,68,.4)':'rgba(245,158,11,.4)'),borderRadius:6,padding:'3px 8px',fontSize:10,cursor:'pointer'}} onClick={()=>setPage('products')}>
                <strong>{p.name}</strong>
                <span style={{marginRight:4,color:p.isExpired?'var(--rd)':'var(--yw)'}}>
                  {p.isExpired?'منتهي الصلاحية':'ينتهي خلال '+days+' يوم'}
                </span>
              </div>;
            })}
          </div>
        </div>}

        {page==='products'&&<div className="card">
          <div className="ct">المنتجات</div>
          <div className="sb2">
            <input className="in ig" placeholder="ابحث..." value={search} onChange={e=>setSearch(e.target.value)}/>
            <select className="in" value={sortBy} onChange={e=>setSortBy(e.target.value)}><option value="name">الاسم</option><option value="price">السعر</option><option value="qty">الكمية</option></select>
            <select className="in" value={catFilter} onChange={e=>setCatFilter(e.target.value)}><option value="all">كل الاقسام</option><option value="">بدون قسم</option>{categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select>
          </div>
          {filteredProducts.length===0?<div className="es"><div style={{marginBottom:8}}>لا توجد منتجات</div><button className="btn b1 bsm" onClick={()=>setPage('add')}>+ أضف منتج</button></div>
            :<div style={{overflowX:'auto'}}><table><thead><tr><th>المنتج</th><th>الوحدة</th><th>البيع</th><th>الشراء</th><th>القسم</th><th>المستودعات</th><th>الحالة</th><th>صلاحية</th><th></th></tr></thead>
              <tbody>{filteredProducts.map(p=>{const q=getQty(p);return<tr key={p._id}>
                <td>
                  <div style={{fontWeight:700}}>{p.name}</div>
                  {p.barcode&&<div style={{fontSize:9,color:'var(--mu)',fontFamily:'monospace'}}>{p.barcode}</div>}
                </td>
                <td><span className="bx bm">{p.unit||'قطعة'}</span></td>
                <td><span className="bx bb">{p.price}{sym}</span></td>
                <td><span className="bx bp">{p.costPrice||0}{sym}</span></td>
                <td><span className="bx bm">{p.categoryName||'-'}</span></td>
                <td>{(p.warehouses||[]).map(w=><span key={w.warehouseId} className="bx bm" style={{margin:'1px'}}>{w.warehouseName}:{w.quantity}</span>)}</td>
                <td><span className={"bx "+(q>0?'bg':'br')}>{q>0?'متوفر':'نفد'}({q})</span></td>
                <td>{p.expiryDate&&(()=>{const d=new Date(p.expiryDate);const now=new Date();const days=Math.ceil((d-now)/(1000*60*60*24));return<span className={"bx "+(days<0?'br':days<=7?'br':days<=30?'by':'bg')} style={{fontSize:9}}>{days<0?'منتهي':days+'ي'}</span>;})()}</td>
                <td style={{display:'flex',gap:3}}>
                  <button className="btn be bsm" onClick={()=>setShowSaleInv(true)}>بيع</button>
                  <button className="btn bpu bsm" onClick={()=>setShowPurchInv(true)}>شراء</button>
                  {p.warehouses?.length>1&&<button className="btn bu bsm" onClick={()=>{setTransferProduct(p);setShowTransfer(true);}}>نقل</button>}
                  <button className="btn bd bsm" onClick={()=>{fetch(API+'/api/products/'+p._id,{method:'DELETE'}).then(()=>{setProducts(x=>x.filter(y=>y._id!==p._id));toast('تم الحذف','error');});}}>حذف</button>
                </td>
              </tr>;})}
              </tbody></table></div>}
          <div style={{display:'flex',gap:6,marginTop:9,borderTop:'1px solid var(--b)',paddingTop:9}}>
            <button className="btn b1 bsm" onClick={()=>setShowSaleInv(true)}>+ فاتورة بيع</button>
            <button className="btn bpu bsm" onClick={()=>setShowPurchInv(true)}>+ فاتورة شراء</button>
            <button className="btn be bsm" onClick={()=>setPage('add')}>+ منتج جديد</button>
          </div>
        </div>}

        {page==='sale-inv'&&<div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div className="ct" style={{marginBottom:0}}>فواتير البيع ({saleInvoices.length})</div>
            <button className="btn b1" onClick={()=>setShowSaleInv(true)}>+ فاتورة جديدة</button>
          </div>
          <DF onApply={(f,t)=>{const q=new URLSearchParams();if(f)q.set('from',f);if(t)q.set('to',t);fetch(API+'/api/sale-invoices?'+q).then(r=>r.json()).then(setSaleInvoices).catch(()=>{});}}/>
          <div className="sb2"><input className="in ig" placeholder="بحث باسم الزبون..." onChange={e=>{const v=e.target.value;const q=new URLSearchParams();if(v)q.set('customer',v);fetch(API+'/api/sale-invoices?'+q).then(r=>r.json()).then(setSaleInvoices).catch(()=>{});}}/></div>
          {saleInvoices.length===0?<div className="es">لا توجد فواتير</div>
            :<div style={{overflowX:'auto'}}><table><thead><tr><th>رقم</th><th>الزبون</th><th>الاجمالي</th><th>المدفوع</th><th>الحالة</th><th>التاريخ</th><th></th></tr></thead>
              <tbody>{saleInvoices.map(i=><tr key={i._id}>
                <td style={{fontWeight:700}}>{i.number}</td><td>{i.customerName}</td>
                <td><span className="bx bb">{i.totalAmount}{sym}</span></td>
                <td><span className="bx bg">{i.paidAmount}{sym}</span></td>
                <td><span className={"bx "+(i.status==='paid'?'bg':i.status==='debt'?'br':'by')}>{i.status==='paid'?'مدفوعة':i.status==='debt'?'دين':'جزئي'}</span></td>
                <td style={{color:'var(--mu)',fontSize:10}}>{fd(i.date)}</td>
                <td style={{display:'flex',gap:3}}>
                  <button className="btn be bsm" onClick={()=>{setPrintInv(i);setPrintInvType('sale');}}>طباعة</button>
                  <button className="btn bd bsm" onClick={()=>{fetch(API+'/api/sale-invoices/'+i._id,{method:'DELETE'}).then(()=>{setSaleInvoices(p=>p.filter(x=>x._id!==i._id));load();toast('تم الحذف','error');});}}>حذف</button>
                </td>
              </tr>)}</tbody></table></div>}
        </div>}

        {page==='purch-inv'&&<div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div className="ct" style={{marginBottom:0}}>فواتير الشراء ({purchaseInvoices.length})</div>
            <div style={{display:'flex',gap:6}}>
              <button className="btn b1" onClick={()=>setShowPurchInv(true)}>+ فاتورة شراء</button>
            </div>
          </div>
          <DF onApply={(f,t)=>{const q=new URLSearchParams();if(f)q.set('from',f);if(t)q.set('to',t);fetch(API+'/api/purchase-invoices?'+q).then(r=>r.json()).then(setPurchaseInvoices).catch(()=>{});}}/>
          <div className="sb2"><input className="in ig" placeholder="بحث باسم المورد..." onChange={e=>{const v=e.target.value;setPurchaseInvoices(purchaseInvoices.filter(i=>!v||i.supplierName?.toLowerCase().includes(v.toLowerCase())));}}/></div>
          {purchaseInvoices.length===0?<div className="es">لا توجد فواتير شراء</div>
            :<div style={{overflowX:'auto'}}><table><thead><tr><th>رقم</th><th>المورد</th><th>الاجمالي</th><th>المدفوع</th><th>الحالة</th><th>التاريخ</th><th></th></tr></thead>
              <tbody>{purchaseInvoices.map(i=><tr key={i._id}>
                <td style={{fontWeight:700}}>{i.number}</td><td>{i.supplierName}</td>
                <td><span className="bx bb">{i.totalAmount}{sym}</span></td>
                <td><span className="bx bg">{i.paidAmount}{sym}</span></td>
                <td><span className={"bx "+(i.status==='paid'?'bg':i.status==='debt'?'br':'by')}>{i.status==='paid'?'مدفوعة':i.status==='debt'?'دين':'جزئي'}</span></td>
                <td style={{color:'var(--mu)',fontSize:10}}>{fd(i.date)}</td>
                <td style={{display:'flex',gap:3}}>
                  <button className="btn be bsm" onClick={()=>{setPrintInv(i);setPrintInvType('purchase');}}>طباعة</button>
                  <button className="btn bd bsm" onClick={()=>{fetch(API+'/api/purchase-invoices/'+i._id,{method:'DELETE'}).then(()=>{setPurchaseInvoices(p=>p.filter(x=>x._id!==i._id));load();toast('تم الحذف','error');});}}>حذف</button>
                </td>
              </tr>)}</tbody></table></div>}
        </div>}

        {page==='sales'&&<div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div className="ct" style={{marginBottom:0}}>سجل المبيعات ({sellLogs.length})</div>
            <button className="btn b1 bsm" onClick={()=>setShowSaleInv(true)}>+ فاتورة بيع</button>
          </div>
          <DF onApply={(f,t)=>{const q=new URLSearchParams();if(f)q.set('from',f);if(t)q.set('to',t);fetch(API+'/api/sell-logs?'+q).then(r=>r.json()).then(setSellLogs).catch(()=>{});}}/>
          {sellLogs.length===0?<div className="es"><div>لا توجد مبيعات</div><button className="btn b1 bsm" style={{marginTop:8}} onClick={()=>setShowSaleInv(true)}>+ فاتورة بيع الآن</button></div>
            :<div style={{overflowX:'auto'}}><table><thead><tr><th>المنتج</th><th>الوحدة</th><th>الزبون</th><th>الفاتورة</th><th>السعر</th><th>الكمية</th><th>الاجمالي</th><th>التاريخ</th><th></th></tr></thead>
              <tbody>{sellLogs.map(l=><tr key={l._id}>
                <td style={{fontWeight:700}}>{l.productName}</td>
                <td><span className="bx bm">{products.find(p=>String(p._id)===String(l.productId))?.unit||'قطعة'}</span></td>
                <td style={{color:'var(--mu)'}}>{l.customerName||'-'}</td>
                <td><span className="bx bm">{l.invoiceNumber||'-'}</span></td>
                <td><span className="bx bb">{l.price}{sym}</span></td>
                <td>{l.quantity}</td>
                <td><span className="bx bg">{(l.price*l.quantity).toFixed(0)}{sym}</span></td>
                <td style={{color:'var(--mu)',fontSize:10}}>{fdt(l.date)}</td>
                <td><button className="btn bd bsm" onClick={()=>handleDelSell(l._id)}>حذف</button></td>
              </tr>)}</tbody></table></div>}
        </div>}

        {page==='purchases'&&<div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div className="ct" style={{marginBottom:0}}>سجل المشتريات ({purchaseLogs.length})</div>
            <button className="btn bpu bsm" onClick={()=>setShowPurchInv(true)}>+ فاتورة شراء</button>
          </div>
          <DF onApply={(f,t)=>{const q=new URLSearchParams();if(f)q.set('from',f);if(t)q.set('to',t);fetch(API+'/api/purchase-logs?'+q).then(r=>r.json()).then(setPurchaseLogs).catch(()=>{});}}/>
          {purchaseLogs.length===0?<div className="es">لا توجد مشتريات</div>
            :<div style={{overflowX:'auto'}}><table><thead><tr><th>المنتج</th><th>الوحدة</th><th>المورد</th><th>الفاتورة</th><th>الدفع</th><th>التكلفة</th><th>الكمية</th><th>الاجمالي</th><th>التاريخ</th><th></th></tr></thead>
              <tbody>{purchaseLogs.map(l=><tr key={l._id}>
                <td style={{fontWeight:700}}>{l.productName}</td>
                <td><span className="bx bm">{products.find(p=>String(p._id)===String(l.productId))?.unit||'قطعة'}</span></td>
                <td style={{color:'var(--mu)'}}>{l.supplierName||'-'}</td>
                <td><span className="bx bm">{l.invoiceNumber||'-'}</span></td>
                <td><span className={"bx "+(l.paymentMethod==='cash'?'bg':l.paymentMethod==='bank'?'bb':'bp')}>{l.paymentMethod==='cash'?'نقدي':l.paymentMethod==='bank'?'بنك':'دين'}</span></td>
                <td><span className="bx bp">{l.costPrice}{sym}</span></td>
                <td>{l.quantity}</td>
                <td><span className="bx by">{(l.costPrice*l.quantity).toFixed(0)}{sym}</span></td>
                <td style={{color:'var(--mu)',fontSize:10}}>{fdt(l.date)}</td>
                <td><button className="btn bd bsm" onClick={()=>handleDelPurch(l._id)}>حذف</button></td>
              </tr>)}</tbody></table></div>}
        </div>}

        {page==='debts'&&<div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div className="ct" style={{marginBottom:0}}>الديون</div>
            <button className="btn b1" onClick={()=>setShowDebt(true)}>+ دين جديد</button>
          </div>
          <DF onApply={(f,t)=>{const q=new URLSearchParams();if(f)q.set('from',f);if(t)q.set('to',t);fetch(API+'/api/debts?'+q).then(r=>r.json()).then(setDebts).catch(()=>{});}}/>
          <div style={{display:'flex',gap:4,marginBottom:9,flexWrap:'wrap'}}>
            {[['all','الكل'],['علي','عليّ'],['لي','ليّ'],['paid','مسددة']].map(([f,l])=><button key={f} className="btn bsm" style={debtFilter===f?{background:'rgba(59,130,246,.15)',color:'var(--ac)',border:'1px solid var(--ac)',fontWeight:700}:{background:'transparent',color:'var(--mu)',border:'1px solid var(--b)'}} onClick={()=>setDebtFilter(f)}>{l}</button>)}
          </div>
          {filtDebts.length===0?<div className="es"><div>لا توجد ديون</div><button className="btn be bsm" style={{marginTop:8}} onClick={()=>setPage('customers')}>عرض سجل الزبائن</button></div>
            :<div style={{overflowX:'auto'}}><table><thead><tr><th>النوع</th><th>الاسم</th><th>الكلي</th><th>المدفوع</th><th>المتبقي</th><th>التقدم</th><th>التاريخ</th><th></th></tr></thead>
              <tbody>{filtDebts.map(d=>{const rem=d.totalAmount-d.paidAmount;const pct=d.totalAmount>0?(d.paidAmount/d.totalAmount*100):0;return<tr key={d._id}>
                <td><span className={"bx "+(d.type==='علي'?'br':'bo')}>{d.type==='علي'?'عليّ':'ليّ'}</span></td>
                <td style={{fontWeight:700}}>{d.personName}</td>
                <td><span className="bx bb">{d.totalAmount}{sym}</span></td>
                <td><span className="bx bg">{d.paidAmount}{sym}</span></td>
                <td><span className={"bx "+(rem>0?'br':'bg')}>{rem.toFixed(0)}{sym}</span></td>
                <td style={{minWidth:65}}><div className="pb-g"><div className="pb" style={{width:pct+'%',background:pct>=100?'var(--gr)':'var(--ac)'}}/></div><div style={{fontSize:9,color:'var(--mu)',marginTop:1}}>{pct.toFixed(0)}%</div></td>
                <td style={{color:'var(--mu)',fontSize:10}}>{fd(d.date)}</td>
                <td style={{display:'flex',gap:3}}>
                  {d.status==='pending'&&<button className="btn bpay bsm" onClick={()=>{setPayingDebt(d);setPayAmount('');}}>دفع</button>}
                  <button className="btn bd bsm" onClick={()=>{fetch(API+'/api/debts/'+d._id,{method:'DELETE'}).then(()=>setDebts(p=>p.filter(x=>x._id!==d._id)));toast('تم الحذف','error');}}>حذف</button>
                </td>
              </tr>;})}
              </tbody></table></div>}
        </div>}

        {page==='cashbox'&&<div className="card">
          <div className="ct">الصندوق</div>
          {/* رصيد البنك والكاش */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:11}}>
            <div style={{background:'var(--s2)',borderRadius:9,padding:11,textAlign:'center',border:cashTab==='cash'?'2px solid var(--gr)':'1px solid var(--b)',cursor:'pointer'}} onClick={()=>setCashTab('cash')}>
              <div style={{fontSize:10,color:'var(--mu)',marginBottom:3}}>💵 نقدي (كاش)</div>
              <div style={{fontSize:20,fontWeight:900,color:cashOnly>=0?'var(--gr)':'var(--rd)'}}>{cashOnly.toFixed(0)}{sym}</div>
              {cashTab==='cash'&&<div style={{fontSize:9,color:'var(--gr)',marginTop:2}}>◀ مفعّل</div>}
            </div>
            <div style={{background:'var(--s2)',borderRadius:9,padding:11,textAlign:'center',border:cashTab==='bank'?'2px solid var(--ac)':'1px solid var(--b)',cursor:'pointer'}} onClick={()=>setCashTab('bank')}>
              <div style={{fontSize:10,color:'var(--mu)',marginBottom:3}}>🏦 بنك</div>
              <div style={{fontSize:20,fontWeight:900,color:bankBal>=0?'var(--ac)':'var(--rd)'}}>{bankBal.toFixed(0)}{sym}</div>
              {cashTab==='bank'&&<div style={{fontSize:9,color:'var(--ac)',marginTop:2}}>◀ مفعّل</div>}
            </div>
          </div>
          {/* فورم الإيداع والسحب */}
          <div style={{background:'var(--s2)',borderRadius:9,padding:10,marginBottom:11,border:'1px solid '+(cashTab==='cash'?'rgba(16,185,129,.3)':'rgba(59,130,246,.3)')}}>
            <div style={{fontSize:10,fontWeight:700,color:cashTab==='cash'?'var(--gr)':'var(--ac)',marginBottom:8}}>{cashTab==='cash'?'💵 عمليات الكاش':'🏦 عمليات البنك'}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'flex-end'}}>
              <div className="fg" style={{flex:1,minWidth:80}}><label>المبلغ ({sym})</label><input className="in" style={{width:'100%'}} type="number" placeholder="0" value={cashForm.amount} onChange={e=>setCashForm(f=>({...f,amount:e.target.value,source:cashTab}))}/></div>
              <div className="fg" style={{flex:2,minWidth:120}}><label>ملاحظة</label><input className="in" style={{width:'100%'}} placeholder="..." value={cashForm.note} onChange={e=>setCashForm(f=>({...f,note:e.target.value}))}/></div>
              <div className="fg"><label style={{opacity:0}}>.</label><button className="btn bs" onClick={()=>handleCash('in')}>+ ايداع</button></div>
              <div className="fg"><label style={{opacity:0}}>.</label><button className="btn bd" onClick={()=>handleCash('out')}>- سحب</button></div>
            </div>
          </div>
          <DF onApply={(f,t)=>{const q=new URLSearchParams();if(f)q.set('from',f);if(t)q.set('to',t);fetch(API+'/api/cash?'+q).then(r=>r.json()).then(setCashLog).catch(()=>{});}}/>
          {/* جدول العمليات مفلتر حسب التبويب */}
          {(()=>{const filtered=cashLog.filter(c=>c.source===cashTab);return filtered.length===0
            ?<div className="es">لا توجد عمليات {cashTab==='cash'?'نقدية':'بنكية'}</div>
            :<div style={{overflowX:'auto'}}><table><thead><tr><th>النوع</th><th>المبلغ</th><th>ملاحظة</th><th>التاريخ</th><th></th></tr></thead>
              <tbody>{filtered.map(c=><tr key={c._id}>
                <td><span className={"bx "+(c.type==='in'?'bg':'br')}>{c.type==='in'?'ايداع':'سحب'}</span></td>
                <td style={{fontWeight:700,color:c.type==='in'?'var(--gr)':'var(--rd)'}}>{c.type==='in'?'+':'-'}{c.amount}{sym}</td>
                <td style={{color:'var(--mu)',fontSize:10}}>{c.note||'-'}</td>
                <td style={{color:'var(--mu)',fontSize:10}}>{fdt(c.date)}</td>
                <td><button className="btn bd bsm" onClick={()=>{fetch(API+'/api/cash/'+c._id,{method:'DELETE'}).then(()=>setCashLog(p=>p.filter(x=>x._id!==c._id)));}}> حذف</button></td>
              </tr>)}</tbody></table></div>;
          })()}
        </div>}

        {page==='profits'&&<div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:11}}>
            <div className="ct" style={{marginBottom:0}}>الوضع المالي</div>
            <div style={{display:'flex',gap:5}}>
              <button className="btn be bsm" onClick={load}>تحديث</button>
              <button className="btn b1 bsm" onClick={()=>setPage('sale-inv')}>فواتير البيع</button>
              <button className="btn bm bsm" style={{background:'rgba(100,116,139,.15)',color:'var(--mu)'}} onClick={()=>setPage('cashbox')}>الصندوق</button>
            </div>
          </div>
          <div className="fib">
            {[['ايرادات المبيعات','+'+totalRev.toFixed(0)+sym,'var(--gr)'],['تكلفة البضاعة المباعة','-'+totalCost.toFixed(0)+sym,'var(--rd)'],['ارباح المبيعات',profit.toFixed(0)+sym,'var(--gr)'],['تكلفة المشتريات الكلية','-'+purchCost.toFixed(0)+sym,'var(--rd)'],['قيمة المخزون المتبقي','+'+invVal.toFixed(0)+sym,'var(--ac)'],['الوضع المالي الكلي',(net>=0?'+':'')+net.toFixed(0)+sym,net>=0?'var(--gr)':'var(--rd)']].map(([l,v,c])=><div className="fir" key={l}><span>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span></div>)}
          </div>
          <div className="cg">
            <div>
              <Bar data={barData} options={co}/>
              <div style={{marginTop:12,overflowX:'auto'}}><table><thead><tr><th>المنتج</th><th>المباع</th><th>الايراد</th><th>التكلفة</th><th>الربح</th><th>%</th></tr></thead>
                <tbody>{products.map(p=>{
                  const sold=sellLogs.filter(l=>String(l.productId)===String(p._id));
                  const rev=sold.reduce((s,l)=>s+l.price*l.quantity,0);
                  const cost=sold.reduce((s,l)=>s+(l.costPrice||0)*l.quantity,0);
                  const prf=rev-cost;
                  if(!sold.length)return null;
                  return<tr key={p._id}>
                    <td style={{fontWeight:700}}>{p.name}</td>
                    <td>{sold.reduce((s,l)=>s+l.quantity,0)}</td>
                    <td><span className="bx bb">{rev.toFixed(0)}{sym}</span></td>
                    <td><span className="bx bp">{cost.toFixed(0)}{sym}</span></td>
                    <td><span className={"bx "+(prf>=0?'bg':'br')}>{prf.toFixed(0)}{sym}</span></td>
                    <td><span className={"bx "+(prf>=0?'bg':'br')}>{rev>0?((prf/rev)*100).toFixed(1):0}%</span></td>
                  </tr>;
                }).filter(Boolean)}</tbody>
              </table></div>
            </div>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
              <Doughnut data={doData} options={{plugins:{legend:{labels:{color:'#94a3b8',font:{family:'Tajawal'}}}}}}/>
              <div style={{marginTop:8,textAlign:'center'}}><div style={{fontSize:18,fontWeight:900,color:net>=0?'var(--gr)':'var(--rd)'}}>{net>=0?'+':''}{net.toFixed(0)}{sym}</div></div>
            </div>
          </div>
        </div>}

        {page==='vouchers'&&<div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div className="ct" style={{marginBottom:0}}>سندات القيد ({vouchers.length})</div>
            <button className="btn b1" onClick={()=>setShowVoucher(true)}>+ سند جديد</button>
          </div>
          <DF onApply={(f,t)=>{const q=new URLSearchParams();if(f)q.set('from',f);if(t)q.set('to',t);fetch(API+'/api/vouchers?'+q).then(r=>r.json()).then(setVouchers).catch(()=>{});}}/>
          {vouchers.length===0?<div className="es">لا توجد سندات<br/><small style={{color:'var(--mu)'}}>اضغط + سند جديد لاضافة سند قبض او صرف او قيد يومية</small></div>
            :<div style={{overflowX:'auto'}}><table><thead><tr><th>الرقم</th><th>النوع</th><th>التاريخ</th><th>الاسم</th><th>البيان</th><th>مدين</th><th>دائن</th><th>الحالة</th><th></th></tr></thead>
              <tbody>{vouchers.map(v=><tr key={v._id}>
                <td style={{fontWeight:700}}>{v.number}</td>
                <td><span className="bx bm">{v.voucherType==='receipt'?'قبض':v.voucherType==='payment'?'صرف':'يومية'}</span></td>
                <td style={{color:'var(--mu)',fontSize:10}}>{fd(v.date)}</td>
                <td style={{fontWeight:700}}>{v.personName||'-'}</td>
                <td style={{maxWidth:100,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v.description||'-'}</td>
                <td><span className="bx bb">{v.totalDebit}{sym}</span></td>
                <td><span className="bx bp">{v.totalCredit}{sym}</span></td>
                <td><span className={"bx "+(v.status==='posted'?'bg':'by')}>{v.status==='posted'?'مرحّل':'مسودة'}</span></td>
                <td style={{display:'flex',gap:3}}>
                  {v.status==='draft'&&<button className="btn bpu bsm" onClick={()=>fetch(API+'/api/vouchers/'+v._id+'/post',{method:'PATCH'}).then(r=>r.json()).then(up=>setVouchers(p=>p.map(x=>x._id===v._id?up:x)))}>ترحيل</button>}
                  <button className="btn bd bsm" onClick={()=>{fetch(API+'/api/vouchers/'+v._id,{method:'DELETE'}).then(()=>setVouchers(p=>p.filter(x=>x._id!==v._id)));toast('تم','error');}}>حذف</button>
                </td>
              </tr>)}</tbody></table></div>}
        </div>}

        {page==='customers'&&<div className="card">
          <div className="ct">الزبائن ({customers.length})</div>

          {/* شريط البحث السريع */}
          <div style={{display:'flex',gap:6,marginBottom:12,alignItems:'center'}}>
            <input className="in ig" placeholder="ابحث باسم الزبون..." value={customerSearch||''} onChange={e=>setCustomerSearch(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&runCustomerSearch()}
              style={{fontSize:13,padding:'7px 12px'}}/>
            <button className="btn b1" onClick={runCustomerSearch}>بحث</button>
            {customerHistory&&<button className="btn bd bsm" onClick={()=>{setCustomerHistory(null);setSelectedCustomer(null);setCustomerSearch('');}}>مسح</button>}
          </div>

          {/* نتائج البحث */}
          {customerHistory&&<div style={{marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:9}}>
              <div style={{fontWeight:700,fontSize:13}}>نتائج: {customerHistory.customer?.name||customerSearch}</div>
              <div style={{display:'flex',gap:5}}>
                <button className="btn be bsm" onClick={()=>exportCustomerPDF(customerHistory,sym,customerSearch)}>تصدير PDF</button>
                <button className="btn bm bsm" style={{background:'rgba(100,116,139,.15)',color:'var(--mu)'}} onClick={()=>exportCustomerCSV(customerHistory,sym,customerSearch)}>CSV</button>
              </div>
            </div>
            {/* ملخص */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7,marginBottom:11}}>
              <div className="sc sb"><div className="sl">اجمالي المبيعات</div><div className="sv">{(customerHistory.totalSales||0).toFixed(0)}{sym}</div></div>
              <div className="sc sg2"><div className="sl">اجمالي المشتريات</div><div className="sv">{(customerHistory.totalPurchases||0).toFixed(0)}{sym}</div></div>
              <div className="sc sr"><div className="sl">الديون المتبقية</div><div className="sv">{(customerHistory.totalDebt||0).toFixed(0)}{sym}</div></div>
            </div>
            {/* فواتير البيع */}
            {customerHistory.salesInvoices?.length>0&&<>
              <div style={{fontWeight:700,fontSize:11,color:'var(--mu)',marginBottom:5}}>فواتير البيع ({customerHistory.salesInvoices.length})</div>
              <div style={{overflowX:'auto',marginBottom:10}}><table><thead><tr><th>رقم</th><th>المنتجات</th><th>الاجمالي</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th><th>التاريخ</th><th></th></tr></thead>
                <tbody>{customerHistory.salesInvoices.map(i=><tr key={i._id}>
                  <td style={{fontWeight:700}}>{i.number}</td>
                  <td style={{fontSize:10,color:'var(--mu)',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{(i.items||[]).map(x=>x.productName).join(', ')}</td>
                  <td><span className="bx bb">{i.totalAmount}{sym}</span></td>
                  <td><span className="bx bg">{i.paidAmount}{sym}</span></td>
                  <td><span className={"bx "+(i.totalAmount>i.paidAmount?'br':'bg')}>{(i.totalAmount-i.paidAmount).toFixed(0)}{sym}</span></td>
                  <td><span className={"bx "+(i.status==='paid'?'bg':i.status==='debt'?'br':'by')}>{i.status==='paid'?'مدفوعة':i.status==='debt'?'دين':'جزئي'}</span></td>
                  <td style={{color:'var(--mu)',fontSize:10}}>{fd(i.date)}</td>
                  <td><button className="btn be bsm" onClick={()=>{setPrintInv(i);setPrintInvType('sale');}}>طباعة</button></td>
                </tr>)}</tbody></table></div>
            </>}
            {/* فواتير الشراء */}
            {customerHistory.purchaseInvoices?.length>0&&<>
              <div style={{fontWeight:700,fontSize:11,color:'var(--mu)',marginBottom:5}}>فواتير الشراء ({customerHistory.purchaseInvoices.length})</div>
              <div style={{overflowX:'auto',marginBottom:10}}><table><thead><tr><th>رقم</th><th>المورد</th><th>المنتجات</th><th>الاجمالي</th><th>المدفوع</th><th>التاريخ</th></tr></thead>
                <tbody>{customerHistory.purchaseInvoices.map(i=><tr key={i._id}>
                  <td style={{fontWeight:700}}>{i.number}</td>
                  <td style={{color:'var(--mu)'}}>{i.supplierName}</td>
                  <td style={{fontSize:10,color:'var(--mu)',maxWidth:100,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{(i.items||[]).map(x=>x.productName).join(', ')}</td>
                  <td><span className="bx bb">{i.totalAmount}{sym}</span></td>
                  <td><span className="bx bg">{i.paidAmount}{sym}</span></td>
                  <td style={{color:'var(--mu)',fontSize:10}}>{fd(i.date)}</td>
                </tr>)}</tbody></table></div>
            </>}
            {/* الديون */}
            {customerHistory.debts?.length>0&&<>
              <div style={{fontWeight:700,fontSize:11,color:'var(--mu)',marginBottom:5}}>الديون ({customerHistory.debts.length})</div>
              <div style={{overflowX:'auto',marginBottom:10}}><table><thead><tr><th>النوع</th><th>المبلغ</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th></tr></thead>
                <tbody>{customerHistory.debts.map(d=><tr key={d._id}>
                  <td><span className={"bx "+(d.type==='علي'?'br':'bo')}>{d.type==='علي'?'عليّ':'ليّ'}</span></td>
                  <td><span className="bx bb">{d.totalAmount}{sym}</span></td>
                  <td><span className="bx bg">{d.paidAmount}{sym}</span></td>
                  <td><span className={"bx "+(d.totalAmount>d.paidAmount?'br':'bg')}>{(d.totalAmount-d.paidAmount).toFixed(0)}{sym}</span></td>
                  <td><span className={"bx "+(d.status==='paid'?'bg':'by')}>{d.status==='paid'?'مسدد':'مفتوح'}</span></td>
                </tr>)}</tbody></table></div>
            </>}
            {!customerHistory.salesInvoices?.length&&!customerHistory.purchaseInvoices?.length&&!customerHistory.debts?.length&&
              <div className="es">لا توجد سجلات لهذا الاسم</div>}
          </div>}

          {/* قائمة الزبائن */}
          <div style={{borderTop:'1px solid var(--b)',paddingTop:11,marginTop:4}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <div style={{fontSize:11,color:'var(--mu)',fontWeight:700}}>قائمة الزبائن المسجلين</div>
              <div style={{display:'flex',gap:5}}>
                <input className="in" style={{width:130}} placeholder="اسم جديد..." value={newCustomer.name} onChange={e=>setNewCustomer(p=>({...p,name:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&addCustomer()}/>
                <input className="in" style={{width:90}} placeholder="هاتف" value={newCustomer.phone} onChange={e=>setNewCustomer(p=>({...p,phone:e.target.value}))}/>
                <button className="btn b1 bsm" onClick={addCustomer}>+</button>
              </div>
            </div>
            {customers.length===0?<div className="es" style={{padding:'12px 0',fontSize:11}}>لا يوجد زبائن مسجلين</div>
              :<div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                {customers.map(c=><div key={c._id} style={{display:'flex',alignItems:'center',gap:4,background:'var(--s2)',border:'1px solid var(--b)',borderRadius:7,padding:'4px 9px',cursor:'pointer'}}
                  onClick={()=>{setCustomerSearch(c.name);loadCustomerHistoryByName(c.name);}}>
                  <span style={{fontSize:11,fontWeight:700}}>{c.name}</span>
                  {c.phone&&<span style={{fontSize:10,color:'var(--mu)'}}>{c.phone}</span>}
                  <button className="btn bd" style={{padding:'1px 5px',fontSize:10}} onClick={e=>{e.stopPropagation();fetch(API+'/api/customers/'+c._id,{method:'DELETE'}).then(()=>setCustomers(p=>p.filter(x=>x._id!==c._id)));}}>x</button>
                </div>)}
              </div>}
          </div>
        </div>}

{page==='settings'&&<div className="card">
          <div className="ct">الاعدادات</div>
          <div className="ss"><h3>العملة</h3><div className="g2">{Object.entries(CURRENCIES).map(([k,v])=><button key={k} className={"sb3 "+(currency===k?'act':'')} onClick={()=>{setCurrency(k);fetch(API+'/api/settings/currency',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({value:k})});}}>{v}</button>)}</div></div>
          <div className="ss"><h3>الاقسام</h3>
            <div style={{display:'flex',gap:5,marginBottom:6}}><input className="in ig" placeholder="اسم القسم" value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addInlineCat(newCat).then(c=>{if(c)setNewCat('');})} /><button className="btn b1" onClick={()=>addInlineCat(newCat).then(c=>{if(c)setNewCat('');})}>+</button></div>
            <div className="cl">{categories.map(c=><div key={c._id} className="ch">{c.name}<button style={{background:'none',border:'none',color:'var(--rd)',cursor:'pointer',fontSize:11}} onClick={()=>{fetch(API+'/api/categories/'+c._id,{method:'DELETE'}).then(()=>setCategories(p=>p.filter(x=>x._id!==c._id)));}}>x</button></div>)}</div>
          </div>
          <div className="ss"><h3>المستودعات</h3>
            <div style={{display:'flex',gap:5,marginBottom:6}}><input className="in ig" placeholder="اسم المستودع" value={newWh} onChange={e=>setNewWh(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addInlineWh(newWh).then(w=>{if(w)setNewWh('');})} /><button className="btn b1" onClick={()=>addInlineWh(newWh).then(w=>{if(w)setNewWh('');})}>+</button></div>
            <div className="cl">{warehouses.map(w=><div key={w._id} className="ch" style={{background:'rgba(139,92,246,.15)',color:'var(--pp)'}}>{w.name}<button style={{background:'none',border:'none',color:'var(--rd)',cursor:'pointer',fontSize:11}} onClick={()=>{fetch(API+'/api/warehouses/'+w._id,{method:'DELETE'}).then(()=>setWarehouses(p=>p.filter(x=>x._id!==w._id)));}}>x</button></div>)}</div>
          </div>
          <div className="ss"><h3>تصدير البيانات</h3>
            <button className="btn b1" onClick={()=>fetch(API+'/api/export').then(r=>r.json()).then(data=>{
              const rows=[['المنتجات'],['الاسم','البيع','الشراء','الكمية']];
              data.products.forEach(p=>rows.push([p.name,p.price,p.costPrice||0,(p.warehouses||[]).reduce((s,w)=>s+w.quantity,0)]));
              const csv=rows.map(r=>r.join(',')).join('\n');
              const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv'}));a.download='smartstore.csv';a.click();
              toast('تم التصدير');
            })}>تصدير Excel (CSV)</button>
          </div>
        </div>}

        {page==='add'&&<div className="card">
          <div className="ct">اضافة منتج جديد</div>
          <p style={{color:'var(--mu)',fontSize:10,marginBottom:9}}>يمكنك كتابة اسم قسم او مستودع جديد وسيتم انشاؤه تلقائياً</p>
          <form onSubmit={handleAddProduct}>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'flex-end',marginBottom:7}}>
              <div className="fg" style={{flex:2,minWidth:100}}>
                <label>اسم المنتج</label>
                <div style={{display:'flex',gap:4}}>
                  <input className="in" style={{flex:1}} value={newProduct.name} onChange={e=>setNewProduct(p=>({...p,name:e.target.value}))} required placeholder="اسم المنتج..."/>
                  <input className="in" style={{width:120}} value={newProduct.barcode} onChange={e=>setNewProduct(p=>({...p,barcode:e.target.value}))} placeholder="باركود (اختياري)"/>
                </div>
              </div>
              <div className="fg" style={{flex:1,minWidth:70}}><label>سعر البيع ({sym})</label><input className="in" style={{width:'100%'}} type="number" placeholder="0" value={newProduct.price} onChange={e=>setNewProduct(p=>({...p,price:e.target.value}))} required/></div>
              <div className="fg" style={{flex:1,minWidth:70}}><label>سعر الشراء ({sym})</label><input className="in" style={{width:'100%'}} type="number" placeholder="0" value={newProduct.costPrice} onChange={e=>setNewProduct(p=>({...p,costPrice:e.target.value}))}/></div>
              <div className="fg" style={{flex:1,minWidth:60}}><label>الكمية</label><input className="in" style={{width:'100%'}} type="number" placeholder="0" value={newProduct.quantity} onChange={e=>setNewProduct(p=>({...p,quantity:e.target.value}))} required/></div>
              <div className="fg" style={{minWidth:110}}>
                <label>الوحدة</label>
                <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
                  {['قطعة','كغ','طرد','لتر','متر'].map(u=><button key={u} type="button" className={"btn bsm "+(newProduct.unit===u?'b1':'be')} style={{padding:'3px 8px',fontSize:10}} onClick={()=>setNewProduct(p=>({...p,unit:u}))}>{u}</button>)}
                </div>
              </div>
              <div className="fg" style={{minWidth:130}}>
                <label>تاريخ الصلاحية (اختياري)</label>
                <input className="in" style={{width:'100%'}} type="date" value={newProduct.expiryDate} onChange={e=>setNewProduct(p=>({...p,expiryDate:e.target.value}))} min={new Date().toISOString().split('T')[0]}/>
              </div>
            </div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'flex-end',marginBottom:7}}>
              <div className="fg" style={{flex:1,minWidth:100}}>
                <label>القسم</label>
                <select className="in" style={{width:'100%',marginBottom:3}} value={newProduct.categoryId} onChange={e=>{const c=categories.find(x=>x._id===e.target.value);setNewProduct(p=>({...p,categoryId:e.target.value,categoryName:c?c.name:'',newCat:''}));}}>
                  <option value="">بدون قسم</option>{categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <input className="in" style={{width:'100%'}} placeholder="او اكتب قسم جديد..." value={newProduct.newCat} onChange={e=>setNewProduct(p=>({...p,newCat:e.target.value,categoryId:''}))}/>
              </div>
              <div className="fg" style={{flex:1,minWidth:100}}>
                <label>المستودع</label>
                <select className="in" style={{width:'100%',marginBottom:3}} value={newProduct.warehouseId} onChange={e=>{const w=warehouses.find(x=>x._id===e.target.value);setNewProduct(p=>({...p,warehouseId:e.target.value,warehouseName:w?w.name:'',newWh:''}));}}>
                  <option value="">بدون مستودع</option>{warehouses.map(w=><option key={w._id} value={w._id}>{w.name}</option>)}
                </select>
                <input className="in" style={{width:'100%'}} placeholder="او اكتب مستودع جديد..." value={newProduct.newWh} onChange={e=>setNewProduct(p=>({...p,newWh:e.target.value,warehouseId:''}))}/>
              </div>
              <div className="fg"><label>طريقة دفع الشراء</label><div className="pm" style={{width:130}}><button type="button" className={"pmt "+(newProduct.pm==='cash'?'pmc':'')} onClick={()=>setNewProduct(p=>({...p,pm:'cash'}))}>نقدي</button><button type="button" className={"pmt "+(newProduct.pm==='bank'?'pmb':'')} onClick={()=>setNewProduct(p=>({...p,pm:'bank'}))}>بنك</button></div></div>
              <div className="fg"><label style={{opacity:0}}>.</label><button className="btn b1" type="submit" disabled={loading}>{loading?'...':'+ اضافة'}</button></div>
            </div>
          </form>
        </div>}
      </div>

      {showTransfer&&transferProduct&&<TransferModal product={transferProduct} warehouses={warehouses} onSave={handleTransfer} onClose={()=>{setShowTransfer(false);setTransferProduct(null);}}/>}
      {showSaleInv&&<InvoiceModal type="sale" products={products} warehouses={warehouses} customers={customers} onSave={handleSaleInvoice} onClose={()=>setShowSaleInv(false)} sym={sym} nextNum={nextSaleNum}/>}
      {showPurchInv&&<InvoiceModal type="purchase" products={products} warehouses={warehouses} customers={[]} onSave={handlePurchaseInvoice} onClose={()=>setShowPurchInv(false)} sym={sym} nextNum={nextPurchNum}/>}
      {showVoucher&&<VoucherModal onSave={handleAddVoucher} onClose={()=>setShowVoucher(false)} sym={sym} nextNum={nextVchNum} customers={customers}/>}
      {printInv&&<PrintModal inv={printInv} sym={sym} onClose={()=>setPrintInv(null)} isSale={printInvType==='sale'}/>}

      {showDebt&&<div className="mo" onClick={()=>setShowDebt(false)}><div className="md" onClick={e=>e.stopPropagation()}>
        <div className="md-t">دين جديد</div>
        <div className="fg" style={{marginBottom:9}}><label>النوع</label>
          <div style={{display:'flex',gap:6}}><button type="button" className={"btn bsm "+(debtForm.type==='علي'?'bd':'be')} style={{flex:1}} onClick={()=>setDebtForm(p=>({...p,type:'علي'}))}>عليّ (زبون مدين)</button><button type="button" className={"btn bsm "+(debtForm.type==='لي'?'bpu':'be')} style={{flex:1}} onClick={()=>setDebtForm(p=>({...p,type:'لي'}))}>ليّ (انا مدين)</button></div>
        </div>
        <div className="fg" style={{marginBottom:9}}>
          <label>{debtForm.type==='علي'?'الزبون':'المورد'}</label>
          {debtForm.type==='علي'
            ?<select className="in" style={{width:'100%'}} value={debtForm.personId} onChange={e=>{const c=customers.find(x=>x._id===e.target.value);setDebtForm(p=>({...p,personId:e.target.value,personName:c?c.name:''}));}}>
              <option value="">-- اختر زبون --</option>{customers.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            :<input className="in" style={{width:'100%'}} placeholder="اسم المورد" value={debtForm.personName} onChange={e=>setDebtForm(p=>({...p,personName:e.target.value}))}/>}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:9}}>
          <div className="fg"><label>المبلغ الكلي ({sym})</label><input className="in" style={{width:'100%'}} type="number" value={debtForm.totalAmount} onChange={e=>setDebtForm(p=>({...p,totalAmount:e.target.value}))}/></div>
          <div className="fg"><label>المدفوع ({sym})</label><input className="in" style={{width:'100%'}} type="number" value={debtForm.paidAmount} onChange={e=>setDebtForm(p=>({...p,paidAmount:e.target.value}))}/></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:9}}>
          <div className="fg"><label>التاريخ</label><input className="in" style={{width:'100%'}} type="date" value={debtForm.date} onChange={e=>setDebtForm(p=>({...p,date:e.target.value}))}/></div>
          <div className="fg"><label>ملاحظات</label><input className="in" style={{width:'100%'}} placeholder="..." value={debtForm.notes} onChange={e=>setDebtForm(p=>({...p,notes:e.target.value}))}/></div>
        </div>
        <div className="md-f"><button className="btn bd" onClick={()=>setShowDebt(false)}>الغاء</button><button className="btn b1" onClick={handleAddDebt}>حفظ</button></div>
      </div></div>}

      {payingDebt&&<div className="mo" onClick={()=>setPayingDebt(null)}><div className="md" onClick={e=>e.stopPropagation()} style={{width:360}}>
        <div className="md-t">تسجيل دفعة على الدين</div>
        <div style={{background:'var(--s2)',borderRadius:8,padding:'10px 12px',marginBottom:11,fontSize:12}}>
          <div style={{marginBottom:4}}><strong>{payingDebt.personName}</strong></div>
          <div>المبلغ الكلي: <span className="bx bb">{payingDebt.totalAmount}{sym}</span></div>
          <div style={{marginTop:3}}>المدفوع: <span className="bx bg">{payingDebt.paidAmount}{sym}</span></div>
          <div style={{marginTop:3}}>المتبقي: <span className="bx br">{(payingDebt.totalAmount-payingDebt.paidAmount).toFixed(0)}{sym}</span></div>
        </div>
        <div className="fg" style={{marginBottom:9}}><label>مبلغ الدفعة ({sym})</label><input className="in" style={{width:'100%'}} type="number" placeholder="0" value={payAmount} onChange={e=>setPayAmount(e.target.value)} autoFocus/></div>
        <div style={{display:'flex',gap:5,marginBottom:11}}>
          <button className="btn be bsm" onClick={()=>setPayAmount((payingDebt.totalAmount-payingDebt.paidAmount).toString())}>دفع الكل</button>
          <button className="btn be bsm" onClick={()=>setPayAmount(((payingDebt.totalAmount-payingDebt.paidAmount)/2).toFixed(0))}>النصف</button>
        </div>
        <div className="md-f"><button className="btn bd" onClick={()=>setPayingDebt(null)}>الغاء</button><button className="btn bpay" onClick={()=>{if(payAmount)handlePay(payingDebt._id,payAmount);}}>تسجيل الدفعة</button></div>
      </div></div>}

      <Toast t={toasts}/>
    </div>
  </>;
}
