export const roles = { owner:"صاحب المؤسسة", manager:"مدير المبيعات", finance:"المحاسب", rep:"مندوب مبيعات" };
export const seed = {
 customers:[
  {id:"C-1001",name:"مؤسسة ركن الأعمال",type:"شركة",contact:"سالم العتيبي",phone:"0501234567",city:"جدة",rep:"أحمد",creditLimit:12000,balance:2350,lastVisit:"2026-11-24",status:"نشط"},
  {id:"C-1002",name:"متاجر المدار",type:"محل",contact:"محمد سالم",phone:"0552345678",city:"مكة",rep:"أحمد",creditLimit:8000,balance:0,lastVisit:"2026-11-23",status:"نشط"},
  {id:"C-1003",name:"شركة نقطة التوريد",type:"شركة",contact:"نورة الحربي",phone:"0563456789",city:"جدة",rep:"خالد",creditLimit:20000,balance:5700,lastVisit:"2026-11-21",status:"نشط"},
  {id:"C-1004",name:"مركز التقنية الحديثة",type:"محل",contact:"فهد علي",phone:"0534567890",city:"الطائف",rep:"أحمد",creditLimit:5000,balance:900,lastVisit:"2026-11-19",status:"نشط"},
  {id:"C-1005",name:"شركة آفاق التجارية",type:"شركة",contact:"ريم عبدالله",phone:"0545678901",city:"جدة",rep:"خالد",creditLimit:15000,balance:0,lastVisit:"2026-11-18",status:"نشط"}
 ],
 products:[
  {id:"P-001",sku:"RK-001",name:"شاحن ROCK سريع 30W",category:"الشواحن",unit:"قطعة",price:85,vat:15,status:"فعال"},
  {id:"P-002",sku:"RK-002",name:"كابل USB-C بطول 1م",category:"الكابلات",unit:"قطعة",price:29,vat:15,status:"فعال"},
  {id:"P-003",sku:"RK-003",name:"باور بانك 20,000mAh",category:"الطاقة",unit:"قطعة",price:149,vat:15,status:"فعال"},
  {id:"P-004",sku:"RK-004",name:"سماعة لاسلكية",category:"الصوتيات",unit:"قطعة",price:119,vat:15,status:"فعال"},
  {id:"P-005",sku:"RK-005",name:"حماية شاشة زجاجية",category:"الحماية",unit:"قطعة",price:18,vat:15,status:"فعال"}
 ],
 orders:[
  {id:"ORD-2084",customerId:"C-1001",customer:"مؤسسة ركن الأعمال",rep:"أحمد",channel:"ميداني",total:2450,discount:3,payment:"آجل",status:"مفوتر",date:"2026-11-25"},
  {id:"ORD-2083",customerId:"C-1002",customer:"متاجر المدار",rep:"أحمد",channel:"عن بُعد",total:1150,discount:0,payment:"نقدي",status:"مفوتر",date:"2026-11-25"},
  {id:"ORD-2082",customerId:"C-1003",customer:"شركة نقطة التوريد",rep:"خالد",channel:"ميداني",total:3850,discount:8,payment:"آجل",status:"بانتظار اعتماد الخصم",date:"2026-11-24"}
 ],
 invoices:[
  {id:"INV-DEMO-0041",orderId:"ORD-2084",customerId:"C-1001",customer:"مؤسسة ركن الأعمال",rep:"أحمد",total:2450,paid:0,payment:"آجل",status:"غير مدفوعة",date:"2026-11-25"},
  {id:"INV-DEMO-0040",orderId:"ORD-2083",customerId:"C-1002",customer:"متاجر المدار",rep:"أحمد",total:1150,paid:1150,payment:"نقدي",status:"مدفوعة بالكامل",date:"2026-11-25"},
  {id:"INV-DEMO-0039",orderId:"ORD-2081",customerId:"C-1004",customer:"مركز التقنية الحديثة",rep:"أحمد",total:760,paid:0,payment:"تحويل بنكي",status:"غير مدفوعة",date:"2026-11-23"}
 ],
 payments:[
  {id:"PAY-0091",customer:"متاجر المدار",invoiceId:"INV-DEMO-0040",amount:1150,method:"نقدي",status:"مؤكد",date:"2026-11-25"},
  {id:"PAY-0090",customer:"مؤسسة ركن الأعمال",invoiceId:"INV-DEMO-0041",amount:1000,method:"تحويل بنكي",status:"بانتظار التحقق",date:"2026-11-25"}
 ],
 visits:[
  {id:"VIS-031",customer:"مؤسسة ركن الأعمال",rep:"أحمد",date:"2026-11-25",result:"تم البيع",channel:"ميداني"},
  {id:"VIS-030",customer:"متاجر المدار",rep:"أحمد",date:"2026-11-25",result:"متابعة عرض سعر",channel:"اتصال"}
 ],
 reps:[
  {id:"U-01",name:"أحمد",phone:"0500000001",discountLimit:5,target:25000,sales:18400,status:"نشط"},
  {id:"U-02",name:"خالد",phone:"0500000002",discountLimit:7,target:30000,sales:21200,status:"نشط"},
  {id:"U-03",name:"محمد",phone:"0500000003",discountLimit:3,target:20000,sales:9600,status:"نشط"},
  {id:"U-04",name:"خلدون",phone:"",discountLimit:0,target:0,sales:0,status:"نشط"},
  {id:"U-05",name:"نبراس",phone:"",discountLimit:0,target:0,sales:0,status:"نشط"},
  {id:"U-06",name:"يحيى",phone:"",discountLimit:0,target:0,sales:0,status:"نشط"},
  {id:"U-07",name:"علي",phone:"",discountLimit:0,target:0,sales:0,status:"نشط"}
 ]
};