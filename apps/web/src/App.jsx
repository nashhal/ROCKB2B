import {useEffect,useMemo,useRef,useState} from "react";
import {readSheet} from "read-excel-file/browser";
import {Activity,ArrowUpLeft,Banknote,Bell,Building2,CalendarDays,Check,CheckCircle2,ChevronDown,Clock3,Download,FileSpreadsheet,LayoutDashboard,LogOut,MapPin,Menu,Plus,ReceiptText,Search,ShieldCheck,ShoppingBag,ShoppingCart,TrendingUp,Upload,Users,Wallet,X,CreditCard,AlertCircle,RefreshCw,Pencil,Target,BarChart3,CalendarRange,PauseCircle,PlayCircle} from "lucide-react";
import {roles,seed} from "./data.js";
import {downloadSpreadsheet} from "./spreadsheet.js";

const KEY="rock-b2b-demo-v1";
const fmt=n=>new Intl.NumberFormat("ar-SA",{maximumFractionDigits:2}).format(Number(n||0))+" ر.س";
const fmtDistribution=n=>new Intl.NumberFormat("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(n||0));
const day=d=>d?new Intl.DateTimeFormat("ar-SA",{day:"numeric",month:"short",year:"numeric"}).format(new Date(d+"T12:00:00")):"—";
const id=p=>p+"-"+Date.now().toString().slice(-7);
const clone=x=>JSON.parse(JSON.stringify(x));
function load(){try{return JSON.parse(localStorage.getItem(KEY))||clone(seed)}catch{return clone(seed)}}
const nav=[
 ["dashboard","نظرة عامة",LayoutDashboard,["owner","manager","finance","rep"]],
 ["customers","العملاء",Users,["owner","manager","rep"]],
 ["products","المنتجات والأسعار",ShoppingBag,["owner","manager","rep"]],
 ["integrations","مركز التكامل",RefreshCw,["owner","manager"]],
 ["orders","طلبات البيع",ShoppingCart,["owner","manager","rep"]],
 ["invoices","الفواتير",ReceiptText,["owner","manager","finance","rep"]],
 ["payments","التحصيلات والذمم",Wallet,["owner","finance"]],
 ["financial","التقارير المالية",Banknote,["owner","finance"]],
 ["visits","الزيارات",MapPin,["owner","manager","rep"]],
 ["team","إدارة المناديب",Building2,["owner","manager","finance"]],
 ["reports","تقارير المبيعات",TrendingUp,["owner","manager"]]
];
function Tag({v}){let c=["مفوتر","مؤكد","مدفوعة بالكامل","نشط","معتمد","تم البيع"].includes(v)?"ok":["بانتظار اعتماد الخصم","بانتظار التحقق","غير مدفوعة","متأخرة"].includes(v)?"warn":"soft";return <span className={"tag-status "+c}>{v}</span>}
function Modal({title,close,children}){return <div className="shade" onMouseDown={e=>e.target===e.currentTarget&&close()}><section className="modal"><header><h3>{title}</h3><button className="icon-btn" onClick={close}><X size={18}/></button></header>{children}</section></div>}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
function Stat({Icon,label,value,note}){return <article className="stat"><div className="stat-icon"><Icon size={19}/></div><small>{label}</small><b>{value}</b>{note&&<em>{note}</em>}</article>}
function Title({title,sub,action}){return <div className="title-row"><div><p className="eyebrow">ROCK B2B / WORKSPACE</p><h2>{title}</h2><p className="muted">{sub}</p></div>{action&&<div className="actions">{action}</div>}</div>}


function BrandMark({tone="light"}){return <div className={`brand-mark brand-mark-${tone}`}><img src="/rock-logo.svg" alt="ROCK"/></div>}


function CommandPalette({open,menus,role,onClose,onNavigate,onAction}){
 const [query,setQuery]=useState("");
 const [activeIndex,setActiveIndex]=useState(0);
 const inputRef=useRef(null);
 const actionItems=[
  {id:"action-order",label:"إنشاء طلب بيع",description:"بدء طلب جديد",Icon:ShoppingCart,kind:"action",target:"order",roles:["owner","manager","rep"]},
  {id:"action-customer",label:"إضافة عميل",description:"إضافة عميل إلى قاعدة العملاء",Icon:Users,kind:"action",target:"customer",roles:["owner","manager","rep"]},
  {id:"action-product",label:"إضافة منتج",description:"إضافة صنف إلى الكتالوج",Icon:ShoppingBag,kind:"action",target:"product",roles:["owner","manager"]},
  {id:"action-payment",label:"تسجيل تحصيل",description:"إضافة عملية تحصيل أو تحويل",Icon:Wallet,kind:"action",target:"payment",roles:["owner","finance"]},
  {id:"action-visit",label:"تسجيل زيارة",description:"تسجيل متابعة عميل",Icon:MapPin,kind:"action",target:"visit",roles:["owner","manager","rep"]}
 ].filter(item=>item.roles.includes(role));
 const items=[
  ...menus.map(([key,label,Icon])=>({id:"page-"+key,label,description:"الانتقال إلى القسم",Icon,kind:"page",target:key})),
  ...actionItems
 ];
 const normalized=query.trim().toLocaleLowerCase();
 const filtered=normalized?items.filter(item=>(item.label+" "+item.description).toLocaleLowerCase().includes(normalized)):items;
 useEffect(()=>{if(open){setQuery("");setActiveIndex(0);inputRef.current?.focus()}},[open]);
 useEffect(()=>{setActiveIndex(0)},[query]);
 function choose(item){
  if(!item)return;
  if(item.kind==="page")onNavigate(item.target);
  else onAction(item.target);
  onClose();
 }
 function handleKeyDown(event){
  if(event.key==="ArrowDown"){event.preventDefault();setActiveIndex(index=>filtered.length?(index+1)%filtered.length:0)}
  else if(event.key==="ArrowUp"){event.preventDefault();setActiveIndex(index=>filtered.length?(index-1+filtered.length)%filtered.length:0)}
  else if(event.key==="Enter"){event.preventDefault();choose(filtered[activeIndex])}
  else if(event.key==="Escape"){event.preventDefault();onClose()}
 }
 if(!open)return null;
 return <div className="command-backdrop" onMouseDown={event=>event.target===event.currentTarget&&onClose()}>
  <section className="command-palette" role="dialog" aria-modal="true" aria-label="البحث السريع والتنقل">
   <div className="command-search">
    <Search size={19} aria-hidden="true"/>
    <input ref={inputRef} type="search" value={query} onChange={event=>setQuery(event.target.value)} onKeyDown={handleKeyDown} placeholder="ابحث عن صفحة أو إجراء..." aria-label="ابحث في ROCK B2B" autoComplete="off"/>
    <button type="button" className="icon-btn" onClick={onClose} aria-label="إغلاق البحث"><X size={17}/></button>
   </div>
   <div className="command-results" role="listbox" aria-label="نتائج البحث">
    {filtered.length?filtered.map((item,index)=>{
     const Icon=item.Icon;
     return <button type="button" key={item.id} role="option" aria-selected={activeIndex===index} className={"command-item "+(activeIndex===index?"selected":"")} onMouseEnter={()=>setActiveIndex(index)} onClick={()=>choose(item)}>
      <span className="command-item-icon"><Icon size={18} strokeWidth={1.8}/></span>
      <span className="command-item-copy"><b>{item.label}</b><small>{item.description}</small></span>
      <span className="command-item-type">{item.kind==="page"?"قسم":"إجراء"}</span>
     </button>
    }):<div className="command-empty"><Search size={20}/><b>لا توجد نتائج مطابقة</b><span>جرّب كلمة أخرى أو اسم القسم.</span></div>}
   </div>
   <footer className="command-hints"><span><kbd>↑</kbd><kbd>↓</kbd> للتنقل</span><span><kbd>Enter</kbd> للتحديد</span><span><kbd>Esc</kbd> للإغلاق</span></footer>
  </section>
 </div>;
}

function Login({onLogin,busy,error}){
 const [username,setUsername]=useState("owner"),[password,setPassword]=useState("");
 return <div className="auth-screen" dir="rtl"><div className="auth-shell">
  <aside className="auth-aside">
   <div className="auth-aside-brand"><BrandMark tone="dark"/><div className="brand-copy"><b>B2B</b><small>SALES &amp; OPERATIONS</small></div></div>
   <div className="auth-aside-copy"><p className="auth-aside-kicker">BUSINESS WORKSPACE</p><h2>كل أعمال المبيعات<br/>في مكان واحد.</h2><p>إدارة العملاء والطلبات والمخزون والتحصيلات من مساحة عمل موحدة.</p></div>
   <div className="auth-aside-footer"><span></span> منصة ROCK لإدارة الأعمال</div>
  </aside>
  <form className="auth-card" onSubmit={e=>{e.preventDefault();onLogin({username,password})}}>
  <div className="auth-brand"><BrandMark tone="dark"/><div className="brand-copy"><b>B2B</b><small>SALES &amp; OPERATIONS</small></div></div>
  <p className="eyebrow">SECURE WORKSPACE</p><h1>تسجيل الدخول</h1><p className="muted">ادخل إلى مساحة عمل المؤسسة باستخدام حسابك.</p>
  <label className="auth-field"><span>اسم المستخدم</span><input autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} placeholder="owner" required/></label>
  <label className="auth-field"><span>كلمة المرور</span><input autoComplete="current-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="كلمة المرور المؤقتة" required/></label>
  {error&&<div className="auth-error">{error}</div>}
  <button className="btn primary auth-submit" disabled={busy}>{busy?"جارٍ التحقق...":"دخول إلى ROCK B2B"}</button>
  <div className="auth-help"><b>حسابات التجربة</b><span>owner · manager · finance · rep</span><small>تُرسل كلمات المرور المؤقتة لصاحب المشروع بشكل منفصل.</small></div>
  <small className="auth-foot">يتم حفظ بيانات مساحة العمل في قاعدة بيانات مشتركة.</small>
 </form></div></div>;
}

export default function App(){
 const [db,setDb]=useState(load),[role,setRole]=useState("owner"),[page,setPage]=useState("dashboard"),[q,setQ]=useState(""),[modal,setModal]=useState(""),[toast,setToast]=useState(""),[drawer,setDrawer]=useState(false);
 const [auth,setAuth]=useState({ready:false,user:null}),[authBusy,setAuthBusy]=useState(false),[authError,setAuthError]=useState(""),[revision,setRevision]=useState(0),[repBusy,setRepBusy]=useState(false),[repSaving,setRepSaving]=useState(false),[editingRep,setEditingRep]=useState(null),[reportRange,setReportRange]=useState("30");
 const [commandOpen,setCommandOpen]=useState(false),[sidebarCollapsed,setSidebarCollapsed]=useState(false);
 const file=useRef(null),loadedRef=useRef(false),revisionRef=useRef(0),saveTimer=useRef(null),dirtyRef=useRef(false),savingRef=useRef(false),skipSaveRef=useRef(false);
 async function hydrate(user){
  const response=await fetch("/api/data",{cache:"no-store"});
  const payload=await response.json();
  if(!response.ok)throw new Error(payload.error||"تعذر تحميل بيانات مساحة العمل");
  skipSaveRef.current=true;setDb(payload.data);setRevision(payload.revision);revisionRef.current=payload.revision;loadedRef.current=true;setRole(user.role);setAuth({ready:true,user});
 }
 useEffect(()=>{(async()=>{try{const r=await fetch("/api/auth/me",{cache:"no-store"});const p=await r.json();if(r.ok&&p.user){await hydrate(p.user)}else setAuth({ready:true,user:null})}catch{setAuth({ready:true,user:null});setAuthError("تعذر الاتصال بالخادم. تحقق من نشر API وقاعدة البيانات.")}})()},[]);
 async function login(credentials){
  setAuthBusy(true);setAuthError("");
  try{const r=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(credentials)});const p=await r.json();if(!r.ok)throw new Error(p.error||"تعذر تسجيل الدخول");await hydrate(p.user);setPage("dashboard")}
  catch(e){setAuthError(e.message||"تعذر تسجيل الدخول")}
  finally{setAuthBusy(false)}
 }
 async function logout(){
  try{await fetch("/api/auth/logout",{method:"POST"})}catch{}
  loadedRef.current=false;dirtyRef.current=false;setAuth({ready:true,user:null});setAuthError("");setPage("dashboard");setModal("");
 }
 async function updatePassword(e){
  e.preventDefault();const f=new FormData(e.currentTarget);
  try{const r=await fetch("/api/auth/change-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({currentPassword:f.get("currentPassword"),newPassword:f.get("newPassword")})});const p=await r.json();if(!r.ok)throw new Error(p.error||"تعذر تغيير كلمة المرور");setModal("");notify("تم تغيير كلمة المرور بنجاح")}
  catch(e){notify(e.message||"تعذر تغيير كلمة المرور")}
 }
 useEffect(()=>{
  if(!auth.user||!loadedRef.current)return;
  if(skipSaveRef.current){skipSaveRef.current=false;return;}
  dirtyRef.current=true;
  if(saveTimer.current)clearTimeout(saveTimer.current);
  saveTimer.current=setTimeout(async()=>{
   if(savingRef.current)return;savingRef.current=true;
   try{
    const r=await fetch("/api/data",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({data:db,revision:revisionRef.current})});
    const p=await r.json();
    if(r.status===409){const latest=await fetch("/api/data",{cache:"no-store"});const fresh=await latest.json();if(latest.ok){skipSaveRef.current=true;setDb(fresh.data);setRevision(fresh.revision);revisionRef.current=fresh.revision;}notify("تم تحديث البيانات من مستخدم آخر؛ تمت مزامنة أحدث نسخة.");}
    else if(!r.ok){notify(p.error||"تعذر حفظ التغييرات")}
    else{revisionRef.current=p.revision;setRevision(p.revision);dirtyRef.current=false;}
   }catch{notify("تعذر الاتصال بقاعدة البيانات؛ لم نؤكد حفظ التغييرات")}
   finally{savingRef.current=false;}
  },450);
  return()=>{if(saveTimer.current)clearTimeout(saveTimer.current)};
 },[db,auth.user]);
 useEffect(()=>{
  if(!auth.user)return;
  const timer=setInterval(async()=>{
   if(dirtyRef.current||savingRef.current||!loadedRef.current)return;
   try{const r=await fetch("/api/data",{cache:"no-store"});if(!r.ok)return;const p=await r.json();if(Number(p.revision)>revisionRef.current){skipSaveRef.current=true;setDb(p.data);setRevision(p.revision);revisionRef.current=p.revision;}}
   catch{}
  },10000);
  return()=>clearInterval(timer);
 },[auth.user]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(""),2800);return()=>clearTimeout(t)},[toast]);
 useEffect(()=>{
  const handleShortcut=event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){event.preventDefault();setCommandOpen(true)}};
  window.addEventListener("keydown",handleShortcut);
  return()=>window.removeEventListener("keydown",handleShortcut);
 },[]);
 const menus=nav.filter(n=>n[3].includes(role)),current=nav.find(n=>n[0]===page)||nav[0],mobileMenus=menus.slice(0,4);
 const sales=db.invoices.reduce((s,x)=>s+Number(x.total||0),0),paid=db.invoices.reduce((s,x)=>s+Number(x.paid||0),0),due=Math.max(0,sales-paid);
 const rangeDays=reportRange==="all"?90:Number(reportRange);
 const dateKey=d=>String(d.getFullYear()).padStart(4,"0")+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
 const currentMonth=dateKey(new Date()).slice(0,7);
 const today=new Date();
 const trendRows=Array.from({length:rangeDays},(_,index)=>{
  const d=new Date(today.getFullYear(),today.getMonth(),today.getDate()-rangeDays+1+index);
  const key=dateKey(d);
  return {
   date:key,
   sales:db.invoices.filter(x=>x.date===key).reduce((sum,x)=>sum+Number(x.total||0),0),
   collections:db.payments.filter(x=>x.date===key&&x.status==="مؤكد").reduce((sum,x)=>sum+Number(x.amount||0),0)
  };
 });
 const rangeStart=trendRows[0]?.date||dateKey(today);
 const periodInvoices=reportRange==="all"?db.invoices:db.invoices.filter(x=>x.date>=rangeStart);
 const periodPayments=reportRange==="all"?db.payments:db.payments.filter(x=>x.date>=rangeStart);
 const periodSales=periodInvoices.reduce((sum,x)=>sum+Number(x.total||0),0);
 const periodCollections=periodPayments.filter(x=>x.status==="مؤكد").reduce((sum,x)=>sum+Number(x.amount||0),0);
 const pendingCollections=db.payments.filter(x=>x.status==="بانتظار التحقق").reduce((sum,x)=>sum+Number(x.amount||0),0);
 const periodOrders=db.orders.filter(x=>reportRange==="all"||x.date>=rangeStart);
 const periodVisits=db.visits.filter(x=>reportRange==="all"||x.date>=rangeStart);
 const repMetrics=db.reps.map(rep=>{
  const repInvoices=periodInvoices.filter(x=>x.rep===rep.name);
  const repSales=repInvoices.reduce((sum,x)=>sum+Number(x.total||0),0);
  const repPaid=repInvoices.reduce((sum,x)=>sum+Number(x.paid||0),0);
  const target=Number(rep.target||0);
  const monthSales=db.invoices.filter(x=>x.rep===rep.name&&String(x.date||"").startsWith(currentMonth)).reduce((sum,x)=>sum+Number(x.total||0),0);
  return {
   ...rep,
   sales:repSales,
   paid:repPaid,
   orders:periodOrders.filter(x=>x.rep===rep.name).length,
   customers:db.customers.filter(x=>x.rep===rep.name).length,
   visits:periodVisits.filter(x=>x.rep===rep.name).length,
   monthSales,
   achievement:target>0?Math.min(100,monthSales/target*100):0
  };
 });
 const paymentMethodRows=["نقدي","تحويل بنكي","آجل"].map(method=>({
  name:method,
  value:periodInvoices.filter(x=>x.payment===method).reduce((sum,x)=>sum+Number(x.total||0),0)
 }));
 const receivablesByCustomer=(()=>{
  const grouped=new Map();
  for(const invoice of db.invoices){
   const key=invoice.customerId||invoice.customer||"غير معروف";
   const existing=grouped.get(key)||{name:invoice.customer||"غير معروف",total:0,paid:0};
   existing.total+=Number(invoice.total||0);
   existing.paid+=Number(invoice.paid||0);
   grouped.set(key,existing);
  }
  return [...grouped.values()].map(x=>({...x,due:Math.max(0,x.total-x.paid)})).filter(x=>x.due>0).sort((a,b)=>b.due-a.due).slice(0,8);
 })();
 const notify=m=>setToast(m);
 const filtered=useMemo(()=>db.customers.filter(x=>[x.name,x.phone,x.city,x.id].join(" ").toLowerCase().includes(q.toLowerCase())),[db.customers,q]);
 function reset(){if(confirm("إعادة البيانات التجريبية الأصلية؟")){setDb(clone(seed));setPage("dashboard");notify("تمت إعادة بيانات العرض")}}
 function customer(e){e.preventDefault();let f=new FormData(e.currentTarget);let item={id:id("C"),name:f.get("name").trim(),type:f.get("type"),contact:f.get("contact"),phone:f.get("phone"),city:f.get("city"),rep:role==="rep"?(auth.user?.repName||auth.user?.fullName):f.get("rep"),creditLimit:role==="rep"?0:(+f.get("credit")||0),balance:0,lastVisit:"",status:"نشط"};setDb(o=>({...o,customers:[item,...o.customers]}));setModal("");notify("تمت إضافة العميل")}
 function product(e){e.preventDefault();let f=new FormData(e.currentTarget),model=String(f.get("model")||"").trim(),barcode=String(f.get("barcode")||"").trim(),itemId=id("P"),rawStock=String(f.get("stock")||"").trim(),stock=rawStock===""?null:Number(rawStock);if(stock!==null&&(!Number.isFinite(stock)||stock<0)){notify("كمية المخزون غير صالحة");return;}let item={id:itemId,sku:"CUSTOM-"+itemId,model:model||null,barcode,name:String(f.get("name")||"").trim(),description:String(f.get("description")||"").trim(),imageUrl:String(f.get("imageUrl")||"").trim()||null,category:String(f.get("category")||"عام").trim(),unit:"قطعة",price:+f.get("price"),priceCurrency:null,vat:null,stock,status:"فعال"};setDb(o=>({...o,products:[item,...o.products]}));setModal("");notify("تمت إضافة الصنف")}
 function order(e){e.preventDefault();let f=new FormData(e.currentTarget),c=db.customers.find(x=>x.id===f.get("customer")),p=db.products.find(x=>x.id===f.get("product")),rep=db.reps.find(x=>x.name===(role==="rep"?(auth.user?.repName||auth.user?.fullName):f.get("rep")));if(!c||!p||!rep){notify("تحقق من العميل والمندوب المحدد في حسابك.");return;}let qty=Math.max(1,+f.get("qty")),discount=Math.max(0,+f.get("discount")),reserved=db.orders.filter(x=>x.productId===p.id&&x.status!=="ملغي").reduce((sum,x)=>sum+Number(x.quantity||0),0),available=p.stock==null?null:Math.max(0,Number(p.stock)-reserved);if(available!==null&&qty>available){notify("الكمية تتجاوز المتاح وفق آخر ملف مخزون ("+available+"). حدّث ملف المخزون قبل المتابعة.");return;}let sub=p.price*qty,total=Math.round(sub*(1-discount/100)*100)/100,over=discount>rep.discountLimit,oid=id("ORD"),date=new Date().toISOString().slice(0,10),method=f.get("payment"),cashConfirmed=method==="نقدي"&&role==="owner";let item={id:oid,customerId:c.id,customer:c.name,rep:rep.name,productId:p.id,product:p.name,sku:p.sku,quantity:qty,unitPrice:p.price,channel:f.get("channel"),total,discount,payment:method,status:over?"بانتظار اعتماد الخصم":"مفوتر",date};let invoice={id:"INV-DEMO-"+Date.now().toString().slice(-6),orderId:oid,customerId:c.id,customer:c.name,rep:rep.name,productId:p.id,product:p.name,sku:p.sku,quantity:qty,unitPrice:p.price,total,paid:cashConfirmed?total:0,payment:method,status:cashConfirmed?"مدفوعة بالكامل":"غير مدفوعة",date};setDb(o=>({...o,orders:[item,...o.orders],invoices:over?o.invoices:[invoice,...o.invoices],payments:!over&&cashConfirmed?[{id:id("PAY"),customer:c.name,invoiceId:invoice.id,amount:total,method:"نقدي",status:"مؤكد",date},...o.payments]:o.payments}));setModal("");setPage("orders");notify(over?"الطلب ينتظر اعتماد الخصم":"تم إنشاء الطلب وفاتورة العرض")}
 function approve(oid){setDb(o=>{let x=o.orders.find(a=>a.id===oid);if(!x)return o;let inv={id:"INV-DEMO-"+Date.now().toString().slice(-6),orderId:oid,customerId:x.customerId,customer:x.customer,rep:x.rep,productId:x.productId,product:x.product,sku:x.sku,quantity:x.quantity,unitPrice:x.unitPrice,total:x.total,paid:0,payment:x.payment,status:"غير مدفوعة",date:x.date};return {...o,orders:o.orders.map(a=>a.id===oid?{...a,status:"مفوتر"}:a),invoices:[inv,...o.invoices]}});notify("تم اعتماد الخصم وإصدار فاتورة العرض")}
 function payment(e){e.preventDefault();let f=new FormData(e.currentTarget),inv=db.invoices.find(x=>x.id===f.get("invoice")),amount=+f.get("amount"),method=f.get("method");if(!inv||amount<=0||amount>inv.total-inv.paid){notify("المبلغ يتجاوز الرصيد المتبقي");return}let ok=method==="نقدي",p={id:id("PAY"),customer:inv.customer,invoiceId:inv.id,amount,method,status:ok?"مؤكد":"بانتظار التحقق",date:new Date().toISOString().slice(0,10)};setDb(o=>({...o,payments:[p,...o.payments],invoices:o.invoices.map(x=>x.id===inv.id&&ok?{...x,paid:x.paid+amount,status:x.paid+amount>=x.total?"مدفوعة بالكامل":"مدفوعة جزئيًا"}:x)}));setModal("");notify(ok?"تم تسجيل التحصيل":"التحويل بانتظار التحقق")}
 function verify(pid){let p=db.payments.find(x=>x.id===pid);if(!p)return;setDb(o=>({...o,payments:o.payments.map(x=>x.id===pid?{...x,status:"مؤكد"}:x),invoices:o.invoices.map(x=>{if(x.id!==p.invoiceId)return x;let n=x.paid+p.amount;return {...x,paid:n,status:n>=x.total?"مدفوعة بالكامل":"مدفوعة جزئيًا"}})}));notify("تم تأكيد التحويل")}
 function visit(e){e.preventDefault();let f=new FormData(e.currentTarget),c=db.customers.find(x=>x.id===f.get("customer"));let v={id:id("VIS"),customer:c?.name||"",rep:role==="rep"?(auth.user?.repName||auth.user?.fullName):f.get("rep"),date:new Date().toISOString().slice(0,10),result:f.get("result"),channel:f.get("channel")};setDb(o=>({...o,visits:[v,...o.visits],customers:o.customers.map(x=>x.id===c?.id?{...x,lastVisit:v.date}:x)}));setModal("");notify("تم تسجيل النشاط")}
 async function updateRep(e){
  e.preventDefault();
  const form=new FormData(e.currentTarget);
  const payload={
   id:editingRep.id,
   phone:String(form.get("phone")||"").trim(),
   target:Number(form.get("target")||0),
   discountLimit:Number(form.get("discountLimit")||0),
   status:String(form.get("status")||"نشط")
  };
  setRepSaving(true);
  try{
   const response=await fetch("/api/admin/reps",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||"تعذر تحديث بيانات المندوب");
   const latest=await fetch("/api/data",{cache:"no-store"});
   const workspace=await latest.json();
   if(!latest.ok)throw new Error("تم تحديث بيانات المندوب، لكن تعذر تحديث العرض. أعد تحميل الصفحة.");
   skipSaveRef.current=true;
   setDb(workspace.data);
   setRevision(workspace.revision);
   revisionRef.current=workspace.revision;
   setEditingRep(null);
   notify(result.rep.status==="نشط"?"تم تحديث المندوب وإتاحة حسابه":"تم إيقاف المندوب وتعطيل حساب دخوله");
  }catch(error){notify(error.message||"تعذر تحديث بيانات المندوب")}
  finally{setRepSaving(false)}
 }
 async function addRep(e){
  e.preventDefault();
  const f=new FormData(e.currentTarget);
  const payload={
   name:String(f.get("name")||"").trim(),
   phone:String(f.get("phone")||"").trim(),
   username:String(f.get("username")||"").trim().toLowerCase(),
   password:String(f.get("password")||""),
   target:Number(f.get("target")||0),
   discountLimit:Number(f.get("discountLimit")||0)
  };
  setRepBusy(true);
  try{
   const response=await fetch("/api/admin/reps",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||"تعذرت إضافة المندوب");
   const latest=await fetch("/api/data",{cache:"no-store"});
   const workspace=await latest.json();
   if(!latest.ok)throw new Error("تم إنشاء حساب المندوب، لكن تعذر تحديث القائمة. حدّث الصفحة.");
   skipSaveRef.current=true;
   setDb(workspace.data);
   setRevision(workspace.revision);
   revisionRef.current=workspace.revision;
   setModal("");
   notify("تمت إضافة المندوب وإنشاء حساب الدخول: "+result.user.username);
  }catch(error){
   notify(error.message||"تعذرت إضافة المندوب");
  }finally{
   setRepBusy(false);
  }
 }
 async function importFile(e){
  const selected=e.target.files?.[0];
  if(!selected)return;
  try{
   const rows=selected.name.toLowerCase().endsWith(".xlsx")
    ?await readSheet(selected)
    :selected.name.toLowerCase().endsWith(".csv")
     ?(await selected.text()).split(/\r?\n/).filter(Boolean).map(line=>line.split(/[,;]/))
     :[];
   if(!rows.length)throw new Error("اختر ملف XLSX أو CSV");
   const headers=rows[0].map(value=>String(value??"").trim().toLowerCase());
   const idx=aliases=>headers.findIndex(value=>aliases.includes(value));
   const skuIndex=idx(["sku","رمز المنتج","كود المنتج","كود الصنف"]);
   const modelIndex=idx(["model","الموديل","رقم الموديل"]);
   const barcodeIndex=idx(["barcode","باركود","الباركود"]);
   const nameIndex=idx(["name","product name","اسم المنتج","المنتج","اسم الصنف"]);
   const priceIndex=idx(["price","distribution","السعر","سعر البيع","السعر التوزيعي"]);
   const stockIndex=idx(["stock","quantity","qty","available","available stock","المخزون","الرصيد","الكمية","الكمية المتاحة","رصيد المخزون"]);
   const categoryIndex=idx(["category","التصنيف","الفئة","القسم"]);
   const descriptionIndex=idx(["description","الوصف","تفاصيل المنتج"]);
   const imageIndex=idx(["image url","imageurl","رابط الصور","صور المنتج"]);
   if(skuIndex<0&&modelIndex<0&&barcodeIndex<0)throw new Error("يلزم وجود SKU أو الموديل أو الباركود للتعرف على الصنف.");
   if(nameIndex<0&&stockIndex<0)throw new Error("أضف عمود اسم المنتج أو كمية المخزون.");
   const imported=rows.slice(1).map((row,index)=>{
    const sku=skuIndex>=0?String(row[skuIndex]??"").trim():"";
    const model=modelIndex>=0?String(row[modelIndex]??"").trim():"";
    const barcode=barcodeIndex>=0?String(row[barcodeIndex]??"").trim():"";
    if(!sku&&!model&&!barcode)return null;
    const existing=db.products.find(product=>
     (sku&&product.sku===sku)||(barcode&&product.barcode===barcode)||(model&&product.model===model)
    );
    const rawPrice=priceIndex>=0?String(row[priceIndex]??"").replace(/,/g,"").trim():"";
    const parsedPrice=rawPrice===""?null:Number(rawPrice);
    const rawStock=stockIndex>=0?String(row[stockIndex]??"").replace(/,/g,"").trim():"";
    const parsedStock=rawStock===""?null:Number(rawStock);
    if(parsedPrice!==null&&(!Number.isFinite(parsedPrice)||parsedPrice<0))return null;
    if(parsedStock!==null&&(!Number.isFinite(parsedStock)||parsedStock<0))return null;
    const name=nameIndex>=0?String(row[nameIndex]??"").trim():"";
    if(!existing&&(!name||parsedPrice===null))return null;
    const incomingId=existing?.id||id("P");
    return {
     ...(existing||{}),
     id:incomingId,
     sku:existing?.sku||(sku||barcode||model||("IMPORT-"+Date.now()+"-"+index)),
     model:model||existing?.model||null,
     barcode:barcode||existing?.barcode||"",
     name:name||existing?.name||"",
     description:descriptionIndex>=0?String(row[descriptionIndex]??"").trim():(existing?.description||""),
     imageUrl:imageIndex>=0?String(row[imageIndex]??"").trim()||null:(existing?.imageUrl||null),
     category:categoryIndex>=0?String(row[categoryIndex]??"عام").trim():(existing?.category||"عام"),
     unit:existing?.unit||"قطعة",
     price:parsedPrice===null?(existing?.price??null):parsedPrice,
     priceCurrency:existing?.priceCurrency??null,
     vat:existing?.vat??null,
     stock:parsedStock===null?(existing?.stock??null):parsedStock,
     status:existing?.status||"فعال"
    };
   }).filter(Boolean);
   if(!imported.length)throw new Error("لم نعثر على صفوف صالحة. تحقق من رموز الأصناف والكميات.");
   setDb(current=>{
    const next=[...current.products];
    for(const incoming of imported){
     const match=next.findIndex(product=>product.sku===incoming.sku||
      (incoming.barcode&&product.barcode===incoming.barcode)||
      (incoming.model&&product.model===incoming.model));
     if(match>=0)next[match]={...next[match],...incoming,id:next[match].id,sku:next[match].sku||incoming.sku};
     else next.unshift(incoming);
    }
    return {...current,products:next};
   });
   notify("تم تحديث "+imported.length+" صنفًا من ملف Excel/CSV");
  }catch(error){notify(error.message||"تعذر استيراد الملف")}
  finally{e.target.value=""}
 }
 function exportInvoices(format="xlsx"){
  const rows=[
   ["رقم الفاتورة","رقم الطلب","العميل","المندوب","الصنف","SKU","الكمية","سعر الوحدة","الإجمالي","المدفوع","المتبقي","طريقة الدفع","الحالة","التاريخ","نوع المستند"],
   ...db.invoices.map(invoice=>[
    invoice.id,invoice.orderId||"",invoice.customer,invoice.rep,invoice.product||"",invoice.sku||"",
    invoice.quantity??"",invoice.unitPrice??"",Number(invoice.total||0),Number(invoice.paid||0),
    Math.max(0,Number(invoice.total||0)-Number(invoice.paid||0)),invoice.payment,invoice.status,
    invoice.date,"مستند عرض تجريبي — ليس فاتورة ضريبية"
   ])
  ];
  downloadSpreadsheet({format,filename:"rock-b2b-invoices",sheets:[{name:"الفواتير",rows}]});
 }
 function exportProducts(format="xlsx"){
  const rows=[
   ["SKU","Barcode","Model","Product","Category","Unit","Distribution Price","Stock Snapshot","Status"],
   ...db.products.map(product=>[product.sku,product.barcode||"",product.model||"",product.name,product.category,product.unit,Number(product.price||0),product.stock??"",product.status])
  ];
  downloadSpreadsheet({format,filename:"rock-b2b-catalog-and-stock",sheets:[{name:"المنتجات والمخزون",rows}]});
 }
 function exportReport(format="xlsx"){
  const today=new Date().toISOString().slice(0,10);
  const invoiceRows=[
   ["رقم الفاتورة","العميل","المندوب","الصنف","SKU","الكمية","الإجمالي","المدفوع","المتبقي","الحالة","التاريخ"],
   ...db.invoices.map(invoice=>[invoice.id,invoice.customer,invoice.rep,invoice.product||"",invoice.sku||"",invoice.quantity??"",Number(invoice.total||0),Number(invoice.paid||0),Math.max(0,Number(invoice.total||0)-Number(invoice.paid||0)),invoice.status,invoice.date])
  ];
  const summaryRows=[
   ["المؤشر","القيمة"],
   ["تاريخ التصدير",today],
   ["عدد العملاء",db.customers.length],
   ["عدد الطلبات",db.orders.length],
   ["عدد مستندات الفواتير",db.invoices.length],
   ["عدد التحصيلات",db.payments.length],
   ["إجمالي قيمة الفواتير",sales],
   ["إجمالي المحصل",paid],
   ["إجمالي المستحق",due],
   [],
   ["المبيعات حسب المندوب","قيمة المستندات"],
   ...db.reps.map(rep=>[rep.name,db.invoices.filter(invoice=>invoice.rep===rep.name).reduce((sum,invoice)=>sum+Number(invoice.total||0),0)]),
   [],
   ["طريقة الدفع","قيمة المستندات"],
   ...["نقدي","تحويل بنكي","آجل"].map(method=>[method,db.invoices.filter(invoice=>invoice.payment===method).reduce((sum,invoice)=>sum+Number(invoice.total||0),0)])
  ];
  const paymentRows=[
   ["رقم التحصيل","العميل","رقم الفاتورة","المبلغ","الطريقة","الحالة","التاريخ"],
   ...db.payments.map(payment=>[payment.id,payment.customer,payment.invoiceId,Number(payment.amount||0),payment.method,payment.status,payment.date])
  ];
  downloadSpreadsheet({format,filename:"rock-b2b-management-report-"+today,sheets:[
   {name:"ملخص",rows:summaryRows},{name:"الفواتير",rows:invoiceRows},{name:"التحصيلات",rows:paymentRows}
  ]});
 }
 function exportStockTemplate(){
  downloadSpreadsheet({format:"xlsx",filename:"rock-inventory-import-template",sheets:[{name:"Inventory",rows:[
   ["SKU","Barcode","Model","Stock","Name","Price","Category"]
  ]}]});
 }
 function title(t,s,a){return <div className="title-row"><div><p className="eyebrow">ROCK B2B / WORKSPACE</p><h2>{t}</h2><p className="muted">{s}</p></div>{a&&<div className="actions">{a}</div>}</div>}
 function table(headers,rows){return <div className="table-wrap"><table><thead><tr>{headers.map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{rows.length?rows:<tr><td colSpan={headers.length} className="empty">لا توجد بيانات</td></tr>}</tbody></table></div>}
 const stat=(Icon,label,val,note)=><Stat Icon={Icon} label={label} value={val} note={note}/>;
 function TrendChart({rows}){
 const max=Math.max(1,...rows.flatMap(x=>[x.sales,x.collections]));
 const width=760,height=250,left=42,right=16,top=18,bottom=42;
 const xAt=i=>left+(rows.length<=1?0:i*(width-left-right)/(rows.length-1));
 const yAt=value=>top+(height-top-bottom)*(1-value/max);
 const pathFor=key=>rows.map((row,index)=>(index===0?"M":"L")+xAt(index).toFixed(1)+","+yAt(row[key]).toFixed(1)).join(" ");
 const labelAt=index=>rows[index]?.date?.slice(5)||"";
 const hasValues=rows.some(x=>x.sales>0||x.collections>0);
 return <div className="chart-frame">
  {hasValues?<svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="رسم اتجاه المبيعات والتحصيلات">
   {[0,.25,.5,.75,1].map(step=><g key={step}><line x1={left} x2={width-right} y1={yAt(max*step)} y2={yAt(max*step)} stroke="#e8eef4" strokeDasharray="4 5"/><text x={left-8} y={yAt(max*step)+4} textAnchor="end" fontSize="10" fill="#8b9bad">{Math.round(max*step).toLocaleString("en-US")}</text></g>)}
   <path d={pathFor("sales")} fill="none" stroke="#1479dc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
   <path d={pathFor("collections")} fill="none" stroke="#18a477" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
   {rows.map((row,index)=>index===0||index===rows.length-1||index%Math.max(1,Math.floor(rows.length/5))===0?<text key={row.date} x={xAt(index)} y={height-12} textAnchor="middle" fontSize="10" fill="#8292a4">{labelAt(index)}</text>:null)}
  </svg>:<div className="chart-empty"><BarChart3 size={26}/><b>لا توجد حركات مسجلة في هذه الفترة</b><span>ستظهر الرسوم تلقائيًا عند تسجيل الفواتير والتحصيلات.</span></div>}
  <div className="chart-legend"><span><i className="legend-sales"/>قيمة الفواتير</span><span><i className="legend-collections"/>التحصيلات المؤكدة</span></div>
 </div>;
}

function HorizontalBars({items,valueKey="value",formatValue=fmt}){
 const max=Math.max(1,...items.map(x=>Number(x[valueKey]||0)));
 return <div className="horizontal-bars">{items.length?items.map((item,index)=><div className="hbar-row" key={item.id||item.name}>
  <div className="hbar-label"><b>{item.name}</b><strong>{formatValue(Number(item[valueKey]||0))}</strong></div>
  <div className="hbar-track"><i style={{width:Math.max(0,Number(item[valueKey]||0)/max*100)+"%"}}/></div>
 </div>):<div className="chart-empty">لا توجد بيانات للعرض</div>}</div>;
}

let view;
 if(page==="customers")view=<div className="stack">{title("العملاء","إدارة المحلات والشركات",<button className="btn primary" onClick={()=>setModal("customer")}><Plus size={16}/>إضافة عميل</button>)}<section className="panel"><div className="toolbar"><div className="search"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="ابحث بالاسم أو الهاتف أو المدينة"/></div><small>{filtered.length} عميل</small></div>{table(["العميل","المسؤول","المدينة","المندوب","الرصيد المستحق","آخر زيارة","الحالة"],filtered.map(x=><tr key={x.id}><td><b>{x.name}</b><small>{x.id} · {x.type}</small></td><td>{x.contact}<small>{x.phone}</small></td><td>{x.city}</td><td>{x.rep}</td><td>{fmt(x.balance)}</td><td>{day(x.lastVisit)}</td><td><Tag v={x.status}/></td></tr>))}</section></div>;
 else if(page==="products")view=<div className="stack">{title("المنتجات والأسعار","كتالوج ROCK 2026 — يتم تحديث الكميات من ملف نظام المخزون",<><button className="btn secondary" onClick={()=>exportProducts("ods")}>ODS</button><button className="btn secondary" onClick={()=>exportProducts("xlsx")}>Excel</button>{["owner","manager"].includes(role)&&<><button className="btn secondary" onClick={()=>setModal("product")}><Plus size={16}/>إضافة صنف</button><button className="btn primary" onClick={()=>file.current?.click()}><Upload size={16}/>استيراد Excel</button></>}</>)}<div className="notice"><FileSpreadsheet size={18}/>تم تحميل قائمة ROCK 2026: {db.products.length} صنفًا. الأسعار هي Distribution كما وردت في المصدر، والعملة والضريبة غير محددتين فيه. روابط الصور تفتح مجلدات Google Drive.</div><section className="panel"><div className="toolbar"><div className="search"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="ابحث بالاسم أو الموديل أو الباركود أو الوصف"/></div><small>{db.products.filter(x=>[x.name,x.sku,x.model,x.barcode,x.description].join(" ").toLowerCase().includes(q.toLowerCase())).length} صنف</small></div>{table(["المنتج والوصف","الموديل","الباركود","القسم","Distribution","المخزون","الضريبة","صور المنتج"],db.products.filter(x=>[x.name,x.sku,x.model,x.barcode,x.description].join(" ").toLowerCase().includes(q.toLowerCase())).map(x=><tr key={x.id}><td><b>{x.name}</b><small>{x.description}</small></td><td className="ltr">{x.model||"—"}</td><td className="ltr">{x.barcode}</td><td>{x.category}</td><td className="ltr">{fmtDistribution(x.price)}</td><td>{x.stock==null?"غير مستورد":fmtDistribution(x.stock)}</td><td>{x.vat==null?"غير محددة":x.vat+"%"}</td><td>{x.imageUrl?<a href={x.imageUrl} target="_blank" rel="noreferrer">عرض الصور</a>:"غير متاح"}</td></tr>))}</section></div>;
 else if(page==="orders")view=<div className="stack">{title("طلبات البيع","الطلبات الميدانية والطلبات عن بُعد",<button className="btn primary" onClick={()=>setModal("order")}><Plus size={16}/>طلب بيع جديد</button>)}<section className="panel"><div className="toolbar"><div className="search"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="رقم الطلب أو اسم العميل"/></div><small>{db.orders.length} طلب</small></div>{table(["رقم الطلب","العميل","المندوب","الصنف","الكمية","القناة","الإجمالي","الخصم","الدفع","الحالة","الإجراء"],db.orders.filter(x=>(x.id+" "+x.customer).toLowerCase().includes(q.toLowerCase())).map(x=><tr key={x.id}><td className="ltr">{x.id}</td><td>{x.customer}<small>{day(x.date)}</small></td><td>{x.rep}</td><td>{x.product||"—"}</td><td>{x.quantity??"—"}</td><td>{x.channel}</td><td>{fmt(x.total)}</td><td>{x.discount}%</td><td>{x.payment}</td><td><Tag v={x.status}/></td><td>{x.status==="بانتظار اعتماد الخصم"&&["owner","manager"].includes(role)?<button className="small-btn" onClick={()=>approve(x.id)}><Check size={14}/>اعتماد</button>:"—"}</td></tr>))}</section></div>;
 else if(page==="invoices")view=<div className="stack">{title("الفواتير","سجل مستندات العرض وحالات السداد — التصدير XLSX وODS",<><button className="btn secondary" onClick={()=>exportInvoices("ods")}>تصدير ODS</button><button className="btn primary" onClick={()=>exportInvoices("xlsx")}><Download size={16}/>تصدير Excel</button></>)}<div className="notice warn"><AlertCircle size={17}/>هذه فواتير تجريبية فقط، وليست فواتير ضريبية ولا تتصل بمنصة فاتورة.</div><section className="panel">{table(["رقم الفاتورة","العميل","المندوب","الإجمالي","المدفوع","المتبقي","حالة الدفع","التاريخ"],db.invoices.map(x=><tr key={x.id}><td className="ltr"><b>{x.id}</b><small>DEMO — NOT A TAX INVOICE</small></td><td>{x.customer}</td><td>{x.rep}</td><td>{fmt(x.total)}</td><td>{fmt(x.paid)}</td><td>{fmt(x.total-x.paid)}</td><td><Tag v={x.status}/></td><td>{day(x.date)}</td></tr>))}</section></div>;
 else if(page==="financial")view=<div className="stack">
  {title("التقارير المالية","ملخص الفواتير والتحصيلات والذمم المدينة",<><button className="btn secondary" onClick={()=>exportReport("ods")}>تصدير ODS</button><button className="btn primary" onClick={()=>exportReport("xlsx")}><Download size={16}/>تصدير Excel</button></>)}
  <div className="notice warn"><AlertCircle size={18}/>هذه مؤشرات إدارية مبنية على المستندات والتحصيلات المسجلة في ROCK، وليست قوائم محاسبية مدققة أو فواتير ضريبية.</div>
  <div className="report-toolbar"><div><b>الفترة الزمنية</b><span>اختر الفترة التي تريد تحليلها</span></div><select value={reportRange} onChange={e=>setReportRange(e.target.value)}><option value="7">آخر 7 أيام</option><option value="30">آخر 30 يومًا</option><option value="90">آخر 90 يومًا</option><option value="all">كل السجلات</option></select></div>
  <div className="stats">
   {stat(ReceiptText,"قيمة مستندات الفترة",fmt(periodSales),"حسب تاريخ المستند")}
   {stat(Banknote,"التحصيلات المؤكدة",fmt(periodCollections),"خلال الفترة المحددة")}
   {stat(Wallet,"إجمالي الذمم الحالية",fmt(due),"قيمة غير مسددة")}
   {stat(Clock3,"تحصيلات بانتظار التحقق",fmt(pendingCollections),"كل التحويلات بانتظار التحقق")}
  </div>
  <section className="panel"><div className="panel-heading"><div><h3>اتجاه المبيعات والتحصيل</h3><p className="muted">مقارنة قيمة المستندات بالتحصيلات المؤكدة يومًا بيوم</p></div><span className="chart-period">{reportRange==="7"?"7 أيام":reportRange==="30"?"30 يومًا":"آخر 90 يومًا"}</span></div><TrendChart rows={trendRows}/></section>
  <div className="two-col">
   <section className="panel"><h3>قيمة المستندات حسب طريقة الدفع</h3><HorizontalBars items={paymentMethodRows}/></section>
   <section className="panel"><h3>مؤشرات التحصيل</h3>
    <div className="finance-ratio"><div><span>نسبة التحصيل من إجمالي المستندات</span><b>{sales>0?Math.round(paid/sales*100):0}%</b></div><div className="ratio-track"><i style={{width:(sales>0?Math.min(100,paid/sales*100):0)+"%"}}/></div></div>
    <div className="finance-ratio"><div><span>الرصيد غير المسدد</span><b>{fmt(due)}</b></div><div className="ratio-track"><i className="ratio-warning" style={{width:(sales>0?Math.min(100,due/sales*100):0)+"%"}}/></div></div>
    <div className="finance-mini"><span>عدد المستندات</span><strong>{db.invoices.length}</strong></div>
    <div className="finance-mini"><span>عدد عمليات التحصيل</span><strong>{db.payments.length}</strong></div>
   </section>
  </div>
  <section className="panel"><div className="panel-heading"><div><h3>أعلى أرصدة العملاء</h3><p className="muted">الرصيد المتبقي محسوب من إجمالي المستندات ناقص المدفوع</p></div></div>
   {table(["العميل","إجمالي المستندات","المسدد","الرصيد المتبقي"],receivablesByCustomer.map(row=><tr key={row.name}><td><b>{row.name}</b></td><td>{fmt(row.total)}</td><td>{fmt(row.paid)}</td><td><strong className="due-value">{fmt(row.due)}</strong></td></tr>))}
  </section>
 </div>;
 else if(page==="payments")view=<div className="stack">{title("التحصيلات والذمم","المدفوعات المؤكدة والتحويلات المعلقة",<button className="btn primary" onClick={()=>setModal("payment")}><Plus size={16}/>تسجيل تحصيل</button>)}<div className="stats three">{stat(Banknote,"المبالغ المؤكدة",fmt(db.payments.filter(x=>x.status==="مؤكد").reduce((s,x)=>s+x.amount,0)))}{stat(Clock3,"بانتظار التحقق",fmt(db.payments.filter(x=>x.status==="بانتظار التحقق").reduce((s,x)=>s+x.amount,0)))}{stat(Wallet,"الرصيد المستحق",fmt(due))}</div><section className="panel">{table(["رقم التحصيل","العميل","الفاتورة","المبلغ","الطريقة","الحالة","التاريخ","الإجراء"],db.payments.map(x=><tr key={x.id}><td className="ltr">{x.id}</td><td>{x.customer}</td><td className="ltr">{x.invoiceId}</td><td>{fmt(x.amount)}</td><td>{x.method}</td><td><Tag v={x.status}/></td><td>{day(x.date)}</td><td>{x.status==="بانتظار التحقق"&&["owner","finance"].includes(role)?<button className="small-btn" onClick={()=>verify(x.id)}><Check size={14}/>تأكيد</button>:"—"}</td></tr>))}</section></div>;
 else if(page==="visits")view=<div className="stack">{title("الزيارات والمتابعات","النشاط الميداني والاتصالات",<button className="btn primary" onClick={()=>setModal("visit")}><Plus size={16}/>تسجيل نشاط</button>)}<section className="panel">{table(["الرقم","العميل","المندوب","القناة","النتيجة","التاريخ"],db.visits.map(x=><tr key={x.id}><td className="ltr">{x.id}</td><td>{x.customer}</td><td>{x.rep}</td><td>{x.channel}</td><td><Tag v={x.result}/></td><td>{day(x.date)}</td></tr>))}</section></div>;
 else if(page==="team")view=<div className="stack">
  {title("إدارة المناديب","متابعة الأهداف الشهرية والأداء والحدود التشغيلية للمناديب",role==="owner"&&<button className="btn primary" onClick={()=>setModal("rep")}><Plus size={16}/>إضافة مندوب</button>)}
  <div className="notice"><Users size={18}/>تظهر هنا حسابات المناديب النشطين والموقوفين. تعديل الهدف أو حد الخصم أو الحالة متاح لصاحب المؤسسة فقط؛ المدير يستطيع الاطلاع على الأداء.</div>
  <div className="stats three">
   {stat(Users,"إجمالي المناديب",String(db.reps.length),"في سجل المؤسسة")}
   {stat(CheckCircle2,"حسابات نشطة",String(db.reps.filter(x=>x.status==="نشط").length),"يمكنهم تسجيل الدخول")}
   {stat(Target,"أهداف الشهر",fmt(db.reps.reduce((sum,x)=>sum+Number(x.target||0),0)),"مجموع أهداف الفريق")}
  </div>
  <section className="panel">
   <div className="panel-heading"><div><h3>أداء الفريق هذا الشهر</h3><p className="muted">المبيعات الفعلية من مستندات الفواتير مقارنة بالهدف الشهري لكل مندوب</p></div></div>
   {repMetrics.length?<div className="rep-management-list">{repMetrics.map(rep=><article className="rep-management-row" key={rep.id}>
    <div className="rep-management-person"><div className="avatar">{rep.name.slice(0,1)}</div><div><b>{rep.name}</b><small>{rep.phone||"رقم الهاتف غير مسجل"}</small></div><Tag v={rep.status||"نشط"}/></div>
    <div className="rep-management-kpis"><span>مبيعات الشهر<strong>{fmt(rep.monthSales)}</strong></span><span>الهدف الشهري<strong>{rep.target?fmt(rep.target):"غير محدد"}</strong></span><span>طلبات الفترة<strong>{rep.orders}</strong></span><span>العملاء<strong>{rep.customers}</strong></span></div>
    <div className="rep-target-line"><div><span>تحقيق الهدف</span><b>{rep.target?Math.round(rep.achievement)+"%":"لم يُحدد هدف"}</b></div><div className="track"><i style={{width:rep.achievement+"%"}}/></div></div>
    <div className="rep-management-actions"><span className="rep-limit">سقف الخصم: {Number(rep.discountLimit||0)}%</span>{role==="owner"&&<button className="btn secondary" onClick={()=>setEditingRep({...rep})}><Pencil size={15}/>تعديل البيانات</button>}</div>
   </article>)}</div>:<div className="chart-empty">لا يوجد مندوبون مسجلون بعد.</div>}
  </section>
  <section className="panel"><h3>مقارنة مبيعات المناديب</h3><HorizontalBars items={repMetrics.map(rep=>({id:rep.id,name:rep.name,value:rep.monthSales}))}/></section>
 </div>;
 else if(page==="integrations")view=<div className="stack">{title("مركز التكامل","مراقبة تبادل البيانات بين ROCK B2B ونظام المبيعات والمخزون",<><button className="btn secondary" onClick={exportStockTemplate}><FileSpreadsheet size={16}/>قالب استيراد المخزون</button><button className="btn primary" onClick={()=>file.current?.click()}><Upload size={16}/>استيراد ملف النظام</button></>)}<div className="stats three">{stat(CheckCircle2,"كتالوج المنتجات",String(db.products.length)+" صنف","متاح داخل ROCK")}{stat(FileSpreadsheet,"تحديث المخزون",db.products.some(x=>x.stock!=null)?"ملف مستورد":"بانتظار ملف Excel","تحديث يدوي من النظام الحالي")}{stat(ShieldCheck,"الفوترة الضريبية","غير مفعّلة","لا يوجد اتصال مع ZATCA")}</div><div className="notice warn"><AlertCircle size={18}/>لا يوجد اتصال API مباشر مهيأ الآن. ارفع ملف Excel المُصدّر من برنامج المخزون لتحديث أرصدة الأصناف؛ لن يرسل ROCK تغييرات أوامر البيع إلى البرنامج الخارجي قبل تحديد طريقة الربط واختبارها.</div><div className="two-col"><section className="panel"><h3>استيراد بيانات المخزون</h3><p className="muted">يتعرف المستورد على الصنف باستخدام SKU أو الباركود أو الموديل. يمكن أن يحتوي ملفك على رمز الصنف والكمية فقط، كما يمكن تحديث السعر والاسم والتصنيف إذا كانت أعمدتها متوفرة.</p><div className="rep-progress"><div><b>مفاتيح المطابقة</b><span>SKU / Barcode / Model</span></div></div><div className="rep-progress"><div><b>أعمدة المخزون</b><span>Stock / Quantity / الكمية</span></div></div><button className="btn secondary" onClick={exportStockTemplate}>تنزيل قالب Excel</button></section><section className="panel"><h3>الفواتير والتقارير</h3><p className="muted">يمكن تصدير مستندات العرض والتقارير بصيغ XLSX أو ODS لفتحها في Microsoft Excel أو LibreOffice. تبقى مستندات العرض منفصلة عن الفاتورة الضريبية.</p><div className="actions" style={{marginTop:14}}><button className="btn secondary" onClick={()=>exportInvoices("xlsx")}>فواتير XLSX</button><button className="btn secondary" onClick={()=>exportInvoices("ods")}>فواتير ODS</button><button className="btn primary" onClick={()=>exportReport("xlsx")}>تقرير شامل Excel</button></div></section></div><section className="panel"><h3>حالة الاتصالات</h3>{table(["الخدمة","الحالة الحالية","طريقة التشغيل"],[<tr key="inventory"><td>برنامج المخزون الحالي</td><td><Tag v={db.products.some(x=>x.stock!=null)?"استيراد ملف متاح":"بانتظار الملف"}/></td><td>استيراد XLSX/CSV يدويًا</td></tr>,<tr key="sales"><td>نظام المبيعات / الفواتير الحالي</td><td><Tag v="غير مربوط"/></td><td>نحتاج اسم النظام وتوثيق API أو نموذج تصدير</td></tr>,<tr key="zatca"><td>منصة فاتورة ZATCA</td><td><Tag v="غير مفعّلة"/></td><td>تتطلب إعداد الشهادة والتهيئة والاختبارات حسب موجة المنشأة</td></tr>])}</section></div>;
 else if(page==="reports")view=<div className="stack">
  {title("تقارير المبيعات","تحليل حركة المبيعات وأداء فريق المناديب",<><button className="btn secondary" onClick={()=>exportReport("ods")}>تصدير ODS</button><button className="btn primary" onClick={()=>exportReport("xlsx")}><Download size={16}/>تصدير Excel</button></>)}
  <div className="report-toolbar"><div><b>الفترة الزمنية</b><span>قارن أداء المبيعات عبر فترة محددة</span></div><select value={reportRange} onChange={e=>setReportRange(e.target.value)}><option value="7">آخر 7 أيام</option><option value="30">آخر 30 يومًا</option><option value="90">آخر 90 يومًا</option><option value="all">آخر 90 يومًا (عرض الاتجاه)</option></select></div>
  <div className="stats">
   {stat(TrendingUp,"قيمة مبيعات الفترة",fmt(periodSales),"قيمة المستندات المسجلة")}
   {stat(ShoppingCart,"طلبات الفترة",String(periodOrders.length),"جميع حالات الطلبات")}
   {stat(ReceiptText,"متوسط المستند",fmt(periodInvoices.length?periodSales/periodInvoices.length:0),"للفواتير المسجلة")}
   {stat(Activity,"الزيارات والمتابعات",String(periodVisits.length),"خلال الفترة المحددة")}
  </div>
  <section className="panel"><div className="panel-heading"><div><h3>حركة المبيعات</h3><p className="muted">قيمة المستندات يوميًا خلال الفترة المحددة</p></div></div><TrendChart rows={trendRows}/></section>
  <div className="two-col">
   <section className="panel"><h3>ترتيب المناديب حسب المبيعات</h3><HorizontalBars items={repMetrics.map(rep=>({id:rep.id,name:rep.name,value:rep.sales}))}/></section>
   <section className="panel"><h3>ملخص الفريق</h3>{table(["المندوب","المبيعات","الطلبات","الزيارات"],repMetrics.map(rep=><tr key={rep.id}><td><b>{rep.name}</b></td><td>{fmt(rep.sales)}</td><td>{rep.orders}</td><td>{rep.visits}</td></tr>))}</section>
  </div>
 </div>;
 else view=<div className="stack dashboard-view">
  <section className="welcome welcome-command">
   <div className="welcome-copy">
    <p className="eyebrow">ROCK B2B <span>/</span> لوحة المؤسسة</p>
    <h2>إدارة المبيعات. بوضوح.</h2>
    <p className="muted">كل ما تحتاجه لمتابعة العملاء والطلبات والتحصيل وأداء فريقك من مساحة واحدة.</p>
    <div className="welcome-meta"><i/><b>مساحة عمل تجريبية</b><span>بيانات العرض فقط — لا تستخدم في العمليات الفعلية</span></div>
   </div>
   <div className="welcome-actions">
    <button className="btn primary" onClick={()=>setModal("order")}><Plus size={16}/>طلب بيع جديد</button>
    <button className="btn secondary" onClick={()=>setPage(role==="finance"?"financial":role==="rep"?"invoices":"reports")}><BarChart3 size={16}/>{role==="finance"?"التقارير المالية":role==="rep"?"الفواتير":"تقارير المبيعات"}</button>
   </div>
  </section>
  <div className="stats dashboard-stats">
   {stat(ReceiptText,"إجمالي الفواتير",fmt(sales),"قيمة فواتير العرض")}
   {stat(Wallet,"المبالغ المحصلة",fmt(paid),"حسب السداد المسجل")}
   {stat(Clock3,"الرصيد المستحق",fmt(due),"غير المسدد")}
   {stat(Users,"العملاء",String(db.customers.length),"في بيانات العرض")}
  </div>
  <div className="dashboard-main-grid">
   <section className="panel dashboard-trend">
    <div className="panel-heading"><div><h3>حركة المبيعات والتحصيل</h3><p className="muted">متابعة يومية للقيم المسجلة خلال آخر أسبوعين</p></div><span className="chart-period">آخر 14 يومًا</span></div>
    <TrendChart rows={trendRows.slice(-14)}/>
   </section>
   <section className="panel dashboard-reps">
    <div className="panel-heading"><div><h3>أداء فريق المبيعات</h3><p className="muted">المبيعات المسجلة مقارنة بالأهداف</p></div><span className="panel-count">{db.reps.length} مناديب</span></div>
    {db.reps.slice(0,5).map(x=><div className="rep-progress" key={x.id}><div><b>{x.name}</b><span>{fmt(x.sales)} / {x.target?fmt(x.target):"لم يحدد الهدف"}</span></div><div className="track"><i style={{width:(x.target>0?Math.min(100,(x.sales||0)/x.target*100):0)+"%"}}/></div></div>)}
   </section>
  </div>
  <section className="panel dashboard-latest">
   <div className="panel-heading"><div><h3>أحدث طلبات البيع</h3><p className="muted">آخر الطلبات المسجلة في مساحة العمل</p></div><button className="text-link" onClick={()=>setPage("orders")}>عرض جميع الطلبات <ArrowUpLeft size={15}/></button></div>
   {table(["رقم الطلب","العميل","المندوب","الإجمالي","الحالة"],db.orders.slice(0,5).map(x=><tr key={x.id}><td className="ltr"><b>{x.id}</b></td><td><b>{x.customer}</b><small>{day(x.date)}</small></td><td>{x.rep}</td><td><strong>{fmt(x.total)}</strong></td><td><Tag v={x.status}/></td></tr>))}
  </section>
  <div className="notice"><ShieldCheck size={18}/><span>تتم مزامنة التغييرات مع قاعدة بيانات مشتركة. بيانات البداية اصطناعية، والفواتير المعروضة ليست فواتير ضريبية.</span></div>
 </div>;

 if(!auth.ready)return <div className="auth-screen" dir="rtl"><div className="auth-card"><div className="auth-brand"><BrandMark tone="dark"/><div className="brand-copy"><b>B2B</b><small>BUSINESS WORKSPACE</small></div></div><h2>جارٍ تحميل مساحة العمل...</h2></div></div>;
 if(!auth.user)return <Login onLogin={login} busy={authBusy} error={authError}/>;
 return <div className={"shell "+(sidebarCollapsed?"sidebar-is-collapsed":"")}>
  {drawer&&<button className="scrim" aria-label="إغلاق القائمة" onClick={()=>setDrawer(false)}/>}
  <aside className={"sidebar "+(drawer?"open ":"")+(sidebarCollapsed?"collapsed":"")}>
   <div className="brand"><BrandMark tone="dark"/><span className="sidebar-rail-mark"><img src="/icon.svg" alt="ROCK"/></span><div className="brand-copy"><b>B2B</b><small>SALES &amp; OPERATIONS</small></div><button className="icon-btn close" onClick={()=>setDrawer(false)} aria-label="إغلاق القائمة"><X size={18}/></button></div>
   <p className="side-label"><span>إدارة الأعمال</span></p>
   <nav aria-label="التنقل الرئيسي">{menus.map(([k,label,Icon])=><button key={k} title={sidebarCollapsed?label:undefined} aria-current={page===k?"page":undefined} className={"nav "+(page===k?"active":"")} onClick={()=>{setPage(k);setQ("");setDrawer(false)}}><Icon size={18} strokeWidth={1.8}/><span>{label}</span>{k==="orders"&&db.orders.some(x=>x.status==="بانتظار اعتماد الخصم")&&<i/>}</button>)}</nav>
   <div className="side-bottom"><div className="demo-card"><ShieldCheck size={18}/><div><b>مساحة عمل موحّدة</b><small>بيانات مشتركة محفوظة على الخادم</small></div></div>{role==="owner"&&<button className="nav reset" title="إعادة بيانات العرض" onClick={reset}><LogOut size={17}/><span>إعادة بيانات العرض</span></button>}<small className="version">ROCK B2B · WORKSPACE</small></div>
  </aside>
  <main className="main">
   <header className="topbar">
    <div className="crumb"><button className="icon-btn sidebar-toggle" onClick={()=>setSidebarCollapsed(value=>!value)} aria-label={sidebarCollapsed?"توسيع القائمة":"تصغير القائمة"} title={sidebarCollapsed?"توسيع القائمة":"تصغير القائمة"}><Menu size={18}/></button><button className="icon-btn menu" onClick={()=>setDrawer(true)} aria-label="فتح القائمة"><Menu size={19}/></button><span className="crumb-brand">ROCK B2B</span><span>/</span><b>{current[1]}</b></div>
    <div className="top-actions"><button type="button" className="quick-search" onClick={()=>setCommandOpen(true)} title="بحث سريع (Ctrl K)"><Search size={16}/><span>بحث سريع</span><kbd>Ctrl K</kbd></button><span className="today"><CalendarDays size={15}/>{new Intl.DateTimeFormat("ar-SA",{dateStyle:"medium"}).format(new Date())}</span><span className="demo-pill">بيئة تجريبية</span><span className="role-pill">{roles[role]} · {auth.user?.fullName||""}</span><button className="icon-btn" title="تغيير كلمة المرور" aria-label="تغيير كلمة المرور" onClick={()=>setModal("password")}><ShieldCheck size={17}/></button><button className="icon-btn" title="تسجيل الخروج" aria-label="تسجيل الخروج" onClick={logout}><LogOut size={17}/></button></div>
   </header>
   <input hidden ref={file} type="file" accept=".xlsx,.csv" onChange={importFile}/>
   <div className="content">{view}</div>
   <nav className="mobile-tabbar" aria-label="التنقل السريع">{mobileMenus.map(([key,label,Icon])=><button type="button" key={key} className={page===key?"active":""} aria-current={page===key?"page":undefined} onClick={()=>{setPage(key);setQ("")}}><Icon size={18} strokeWidth={1.8}/><span>{label}</span></button>)}<button type="button" className={menus.slice(4).some(([key])=>key===page)?"active more":"more"} onClick={()=>setDrawer(true)}><Menu size={18}/><span>المزيد</span></button></nav>
   <footer><span>ROCK B2B © 2026</span><span>ROCK B2B · نسخة تشغيل تجريبية</span></footer>
  </main>
  {modal==="customer"&&<Modal title="إضافة عميل" close={()=>setModal("")}><form className="form" onSubmit={customer}><Field label="اسم العميل"><input name="name" required placeholder="اسم المحل أو الشركة"/></Field><Field label="نوع العميل"><select name="type"><option>محل</option><option>شركة</option></select></Field><Field label="اسم المسؤول"><input name="contact"/></Field><Field label="رقم الهاتف"><input name="phone" required inputMode="tel" placeholder="05xxxxxxxx"/></Field><Field label="المدينة"><input name="city" placeholder="جدة"/></Field><Field label="المندوب"><select name="rep">{db.reps.filter(x=>role!=="rep"||x.name===(auth.user?.repName||auth.user?.fullName)).map(x=><option key={x.id}>{x.name}</option>)}</select></Field>{["owner","manager"].includes(role)&&<Field label="حد الائتمان"><input name="credit" type="number" min="0" defaultValue="0"/></Field>}<div className="form-actions"><button type="button" className="btn secondary" onClick={()=>setModal("")}>إلغاء</button><button className="btn primary">حفظ العميل</button></div></form></Modal>}
  {modal==="product"&&<Modal title="إضافة صنف" close={()=>setModal("")}><form className="form" onSubmit={product}><Field label="الموديل"><input name="model"/></Field><Field label="الباركود"><input name="barcode" inputMode="numeric"/></Field><Field label="اسم المنتج"><input name="name" required/></Field><Field label="الوصف"><input name="description"/></Field><Field label="القسم"><input name="category"/></Field><Field label="السعر التوزيعي — رقم فقط"><input name="price" type="number" min="0" step="0.01" required/></Field><Field label="كمية المخزون (اختياري)"><input name="stock" type="number" min="0" step="1" placeholder="تُحدّث من ملف نظام المخزون"/></Field><Field label="رابط صور المنتج"><input name="imageUrl" type="url"/></Field><div className="form-actions"><button type="button" className="btn secondary" onClick={()=>setModal("")}>إلغاء</button><button className="btn primary">إضافة الصنف</button></div></form></Modal>}
  {modal==="order"&&<Modal title="إنشاء طلب بيع" close={()=>setModal("")}><form className="form" onSubmit={order}><Field label="العميل"><select name="customer">{db.customers.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="المندوب"><select name="rep">{db.reps.filter(x=>role!=="rep"||x.name===(auth.user?.repName||auth.user?.fullName)).map(x=><option key={x.id}>{x.name}</option>)}</select></Field><Field label="المنتج"><select name="product">{db.products.map(x=><option key={x.id} value={x.id}>{x.name} — {fmtDistribution(x.price)}</option>)}</select></Field><Field label="الكمية"><input name="qty" type="number" min="1" defaultValue="1"/></Field><Field label="الخصم %"><input name="discount" type="number" min="0" max="100" step="0.5" defaultValue="0"/></Field><Field label="قناة البيع"><select name="channel"><option>ميداني</option><option>عن بُعد</option></select></Field><Field label="شرط الدفع"><select name="payment"><option>نقدي</option><option>تحويل بنكي</option><option>آجل</option></select></Field><p className="hint">الأسعار التوزيعية من قائمة ROCK 2026؛ العملة غير محددة في المصدر. مبالغ الفواتير هنا للعرض والتجربة فقط حتى اعتماد العملة والضريبة.</p><p className="hint">الخصم فوق سقف المندوب يتطلب موافقة مدير المبيعات قبل إنشاء فاتورة العرض.</p><div className="form-actions"><button type="button" className="btn secondary" onClick={()=>setModal("")}>إلغاء</button><button className="btn primary">حفظ وإصدار فاتورة عرض</button></div></form></Modal>}
  {modal==="payment"&&<Modal title="تسجيل تحصيل" close={()=>setModal("")}><form className="form" onSubmit={payment}><Field label="الفاتورة"><select name="invoice">{db.invoices.filter(x=>x.total>x.paid).map(x=><option key={x.id} value={x.id}>{x.id} · {x.customer} · متبقي {fmt(x.total-x.paid)}</option>)}</select></Field><Field label="المبلغ"><input name="amount" type="number" min="0.01" step="0.01" required/></Field><Field label="طريقة التحصيل"><select name="method"><option>نقدي</option><option>تحويل بنكي</option></select></Field><p className="hint">التحويل البنكي ينتظر تأكيد المالية؛ لا يحدّث الرصيد قبل التحقق.</p><div className="form-actions"><button type="button" className="btn secondary" onClick={()=>setModal("")}>إلغاء</button><button className="btn primary">تسجيل التحصيل</button></div></form></Modal>}
  {modal==="visit"&&<Modal title="تسجيل زيارة أو اتصال" close={()=>setModal("")}><form className="form" onSubmit={visit}><Field label="العميل"><select name="customer">{db.customers.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="المندوب"><select name="rep">{db.reps.filter(x=>role!=="rep"||x.name===(auth.user?.repName||auth.user?.fullName)).map(x=><option key={x.id}>{x.name}</option>)}</select></Field><Field label="القناة"><select name="channel"><option>ميداني</option><option>اتصال</option><option>عن بُعد</option></select></Field><Field label="النتيجة"><select name="result"><option>تم البيع</option><option>متابعة عرض سعر</option><option>يحتاج متابعة</option><option>لم يتم التواصل</option></select></Field><div className="form-actions"><button type="button" className="btn secondary" onClick={()=>setModal("")}>إلغاء</button><button className="btn primary">حفظ النشاط</button></div></form></Modal>}
  {modal==="rep"&&<Modal title="إضافة مندوب جديد" close={()=>!repBusy&&setModal("")}><form className="form" onSubmit={addRep}>
   <Field label="اسم المندوب"><input name="name" required minLength="2" maxLength="80" placeholder="الاسم الكامل"/></Field>
   <Field label="رقم الهاتف"><input name="phone" inputMode="tel" placeholder="05xxxxxxxx"/></Field>
   <Field label="اسم المستخدم للدخول"><input name="username" required minLength="3" maxLength="32" pattern="[a-zA-Z0-9._-]+" autoComplete="username" placeholder="مثال: rep.jeddah"/></Field>
   <Field label="كلمة المرور الأولية (12 حرفًا على الأقل)"><input name="password" type="password" required minLength="12" maxLength="200" autoComplete="new-password"/></Field>
   <Field label="الهدف الشهري"><input name="target" type="number" min="0" step="0.01" defaultValue="0"/></Field>
   <Field label="حد الخصم (%)"><input name="discountLimit" type="number" min="0" max="100" step="0.5" defaultValue="0"/></Field>
   <p className="hint">سيُضاف المندوب إلى قوائم العملاء والطلبات والزيارات، وسيُنشأ له حساب دخول مستقل. احتفظ باسم المستخدم وكلمة المرور وأرسلها له بطريقة آمنة.</p>
   <div className="form-actions"><button type="button" className="btn secondary" disabled={repBusy} onClick={()=>setModal("")}>إلغاء</button><button className="btn primary" disabled={repBusy}>{repBusy?"جارٍ الإضافة...":"حفظ وإضافة المندوب"}</button></div>
  </form></Modal>}
  {editingRep&&<Modal title={"تعديل بيانات المندوب — "+editingRep.name} close={()=>!repSaving&&setEditingRep(null)}><form className="form" onSubmit={updateRep}>
   <Field label="اسم المندوب"><input value={editingRep.name} disabled/></Field>
   <Field label="رقم الهاتف"><input name="phone" inputMode="tel" defaultValue={editingRep.phone||""} placeholder="05xxxxxxxx"/></Field>
   <Field label="الهدف الشهري"><input name="target" type="number" min="0" step="0.01" defaultValue={editingRep.target||0}/></Field>
   <Field label="حد الخصم (%)"><input name="discountLimit" type="number" min="0" max="100" step="0.5" defaultValue={editingRep.discountLimit||0}/></Field>
   <Field label="حالة المندوب"><select name="status" defaultValue={editingRep.status||"نشط"}><option value="نشط">نشط</option><option value="موقوف">موقوف</option></select></Field>
   <p className="hint">عند اختيار «موقوف» يتم تعطيل تسجيل الدخول لهذا المندوب. تبقى طلباته وفواتيره وسجلاته التاريخية محفوظة.</p>
   <div className="form-actions"><button type="button" className="btn secondary" disabled={repSaving} onClick={()=>setEditingRep(null)}>إلغاء</button><button className="btn primary" disabled={repSaving}>{repSaving?"جارٍ الحفظ...":"حفظ التعديلات"}</button></div>
  </form></Modal>}
  {modal==="password"&&<Modal title="تغيير كلمة المرور" close={()=>setModal("")}><form className="form" onSubmit={updatePassword}><Field label="كلمة المرور الحالية"><input name="currentPassword" type="password" autoComplete="current-password" required/></Field><Field label="كلمة المرور الجديدة (12 حرفًا على الأقل)"><input name="newPassword" type="password" minLength="12" autoComplete="new-password" required/></Field><div className="form-actions"><button type="button" className="btn secondary" onClick={()=>setModal("")}>إلغاء</button><button className="btn primary">حفظ كلمة المرور</button></div></form></Modal>}
  <CommandPalette open={commandOpen} menus={menus} role={role} onClose={()=>setCommandOpen(false)} onNavigate={key=>{setPage(key);setQ("");setDrawer(false)}} onAction={action=>setModal(action)}/>
  {toast&&<div className="toast"><CheckCircle2 size={17}/>{toast}</div>}
 </div>;
}