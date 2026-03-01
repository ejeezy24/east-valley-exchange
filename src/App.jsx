import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ─── FONT ────────────────────────────────────────────────────────────────────
const fl = document.createElement("link");
fl.href = "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500&display=swap";
fl.rel = "stylesheet";
if (!document.querySelector(`link[href="${fl.href}"]`)) document.head.appendChild(fl);

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const CATEGORIES = ["Electronics","Home & Kitchen","Apparel & Shoes","Toys & Games","Sports & Outdoors","Beauty & Health","Tools & Hardware","Automotive","Books & Media","Other"];
const CONDITIONS = ["New - Sealed","New w/ Tags","New - Open Box","Like New","Good","Fair","Refurbished","For Parts"];
const CHANNELS = ["eBay","Amazon","Direct / Website","Wholesale","Facebook Marketplace","Whatnot","Mercari","OfferUp"];
const SOURCES = ["Amazon Liquidation","Target Returns","Walmart Returns","Costco Returns","Best Buy Returns","Nordstrom Returns","REI Returns","Home Depot Returns","Direct Purchase","Other"];
const ITEM_STATUSES = ["Received","Grading","Processing","Listed","Sold","Shipped"];
const PO_STATUSES = ["Draft","Ordered","In Transit","Received","Processing","Complete"];
const EXPENSE_CATEGORIES = ["Shipping & Postage","Platform Fees","Packaging & Supplies","Storage & Rent","Equipment","Labor","Returns & Refunds","Marketing","Software & Tools","Other"];
const CARRIERS = ["USPS","UPS","FedEx","DHL","Amazon Logistics","OnTrac","Other"];
const SHIPMENT_STATUSES = ["Pending","Label Created","Picked Up","In Transit","Out for Delivery","Delivered","Exception"];

const uid = () => "EVE-" + Math.floor(1000 + Math.random() * 9000);
const poUid = () => "PO-" + String(Math.floor(100 + Math.random() * 900)).padStart(4,"0");
const expUid = () => "EXP-" + Math.floor(1000 + Math.random() * 9000);
const custUid = () => "CUS-" + Math.floor(1000 + Math.random() * 9000);
const shipUid = () => "SHP-" + Math.floor(1000 + Math.random() * 9000);
const fmt = (n) => "$" + Number(n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtK = (n) => n >= 1000 ? "$" + (n/1000).toFixed(1)+"k" : "$"+n;
const td = () => new Date().toISOString().split("T")[0];

// ─── DEFAULT DATA ────────────────────────────────────────────────────────────
const DEFAULT_ITEMS = [
  {id:"EVE-7201",name:"Sony WH-1000XM5 Headphones",sku:"SKU-SN1000XM5",barcode:"4548736132597",category:"Electronics",condition:"Like New",status:"Listed",channel:"eBay",cost:142,price:248,source:"Target Returns",received:"2026-02-20",soldDate:"",notes:"",customerId:"",history:[{date:"2026-02-20",action:"Received",note:"From Target pallet PO-0380"},{date:"2026-02-21",action:"Graded",note:"Condition: Like New, all accessories present"},{date:"2026-02-22",action:"Listed",note:"Listed on eBay at $248"}]},
  {id:"EVE-7202",name:"Ninja Foodi 8-Qt Pressure Cooker",sku:"SKU-NJ8QPC",barcode:"622356565615",category:"Home & Kitchen",condition:"New - Open Box",status:"Processing",channel:"",cost:48,price:0,source:"Amazon Liquidation",received:"2026-02-22",soldDate:"",notes:"Missing manual, unit looks unused",customerId:"",history:[{date:"2026-02-22",action:"Received",note:"From Amazon pallet PO-0381"},{date:"2026-02-23",action:"Processing",note:"Cleaning and testing"}]},
  {id:"EVE-7203",name:"KitchenAid Artisan Mixer - Red",sku:"SKU-KAMXR",barcode:"883049515977",category:"Home & Kitchen",condition:"Good",status:"Listed",channel:"Direct / Website",cost:89,price:219,source:"Costco Returns",received:"2026-02-18",soldDate:"",notes:"Minor scuff on base",customerId:"",history:[{date:"2026-02-18",action:"Received",note:""},{date:"2026-02-19",action:"Graded",note:"Good - minor cosmetic wear"},{date:"2026-02-20",action:"Listed",note:"Listed on website at $219"}]},
  {id:"EVE-7204",name:"Nike Air Max 90 - Size 10",sku:"SKU-NAM90-10",barcode:"194956623412",category:"Apparel & Shoes",condition:"New w/ Tags",status:"Sold",channel:"eBay",cost:38,price:94,source:"Nordstrom Returns",received:"2026-02-15",soldDate:"2026-02-23",notes:"",customerId:"CUS-1001",history:[{date:"2026-02-15",action:"Received",note:""},{date:"2026-02-16",action:"Listed",note:"Listed on eBay at $94"},{date:"2026-02-23",action:"Sold",note:"Sold to buyer for $94"}]},
  {id:"EVE-7205",name:"iPad Air M2 64GB - Space Gray",sku:"SKU-IPAM2-64",barcode:"194253392798",category:"Electronics",condition:"Refurbished",status:"Grading",channel:"",cost:285,price:0,source:"Best Buy Returns",received:"2026-02-24",soldDate:"",notes:"Needs full diagnostic",customerId:"",history:[{date:"2026-02-24",action:"Received",note:""},{date:"2026-02-25",action:"Grading",note:"Running diagnostics"}]},
  {id:"EVE-7206",name:"Dyson V15 Detect Vacuum",sku:"SKU-DYSV15",barcode:"885609027555",category:"Home & Kitchen",condition:"Good",status:"Listed",channel:"Amazon",cost:198,price:449,source:"Target Returns",received:"2026-02-17",soldDate:"",notes:"Battery holds full charge",customerId:"",history:[{date:"2026-02-17",action:"Received",note:""},{date:"2026-02-18",action:"Graded",note:"Good condition, tested"},{date:"2026-02-19",action:"Listed",note:"Listed on Amazon at $449"}]},
  {id:"EVE-7207",name:"LEGO Star Wars UCS Set #75375",sku:"SKU-LGSW75375",barcode:"673419388795",category:"Toys & Games",condition:"New - Sealed",status:"Listed",channel:"eBay",cost:62,price:134,source:"Walmart Returns",received:"2026-02-21",soldDate:"",notes:"Box has minor shelf wear",customerId:"",history:[{date:"2026-02-21",action:"Received",note:""},{date:"2026-02-21",action:"Listed",note:"Listed on eBay at $134"}]},
  {id:"EVE-7208",name:"Bose SoundLink Flex Speaker",sku:"SKU-BSLF",barcode:"017817832014",category:"Electronics",condition:"Like New",status:"Shipped",channel:"Direct / Website",cost:52,price:119,source:"Amazon Liquidation",received:"2026-02-19",soldDate:"2026-02-24",notes:"",customerId:"CUS-1002",history:[{date:"2026-02-19",action:"Received",note:""},{date:"2026-02-20",action:"Listed",note:"Listed at $119"},{date:"2026-02-23",action:"Sold",note:"Sold for $119"},{date:"2026-02-24",action:"Shipped",note:"USPS tracking 9400111899223"}]},
  {id:"EVE-7209",name:"The North Face Nuptse Jacket - L",sku:"SKU-TNFNL",barcode:"194906754321",category:"Apparel & Shoes",condition:"New w/ Tags",status:"Listed",channel:"eBay",cost:78,price:189,source:"REI Returns",received:"2026-02-23",soldDate:"",notes:"",customerId:"",history:[{date:"2026-02-23",action:"Received",note:""},{date:"2026-02-23",action:"Listed",note:"Listed on eBay at $189"}]},
  {id:"EVE-7210",name:"Breville Barista Express Espresso",sku:"SKU-BVBE",barcode:"021614063090",category:"Home & Kitchen",condition:"New - Open Box",status:"Grading",channel:"",cost:215,price:0,source:"Costco Returns",received:"2026-02-25",soldDate:"",notes:"Checking portafilter and grinder",customerId:"",history:[{date:"2026-02-25",action:"Received",note:""},{date:"2026-02-25",action:"Grading",note:"Inspecting all components"}]},
  {id:"EVE-7211",name:"DeWalt 20V Impact Driver Kit",sku:"SKU-DWID20",barcode:"885911738163",category:"Tools & Hardware",condition:"Like New",status:"Sold",channel:"Facebook Marketplace",cost:45,price:115,source:"Home Depot Returns",received:"2026-02-12",soldDate:"2026-02-20",notes:"",customerId:"CUS-1003",history:[{date:"2026-02-12",action:"Received",note:""},{date:"2026-02-14",action:"Listed",note:"Listed on FB at $115"},{date:"2026-02-20",action:"Sold",note:"Local pickup sale"}]},
  {id:"EVE-7212",name:"Yeti Rambler 30oz Tumbler",sku:"SKU-YR30",barcode:"888830130292",category:"Sports & Outdoors",condition:"New - Sealed",status:"Sold",channel:"Direct / Website",cost:12,price:28,source:"Target Returns",received:"2026-02-10",soldDate:"2026-02-16",notes:"",customerId:"CUS-1004",history:[{date:"2026-02-10",action:"Received",note:""},{date:"2026-02-11",action:"Listed",note:""},{date:"2026-02-16",action:"Sold",note:""}]},
];

const DEFAULT_POS = [
  {id:"PO-0381",source:"Amazon Liquidation",pallets:3,units:312,cost:8400,status:"In Transit",eta:"2026-02-28",notes:"Mixed electronics & home goods"},
  {id:"PO-0380",source:"Target Returns",pallets:2,units:186,cost:5200,status:"Received",eta:"",notes:"Mostly apparel and home"},
  {id:"PO-0379",source:"Costco Returns",pallets:1,units:94,cost:4800,status:"Processing",eta:"",notes:"Kitchen appliances"},
  {id:"PO-0378",source:"Walmart Returns",pallets:4,units:448,cost:6100,status:"Complete",eta:"",notes:"General merchandise"},
];

const DEFAULT_EXPENSES = [
  {id:"EXP-1001",date:"2026-02-25",category:"Shipping & Postage",amount:124.50,description:"USPS Priority Mail - 8 packages",relatedItem:""},
  {id:"EXP-1002",date:"2026-02-24",category:"Platform Fees",amount:38.20,description:"eBay final value fees - February batch",relatedItem:""},
  {id:"EXP-1003",date:"2026-02-23",category:"Packaging & Supplies",amount:67.80,description:"Boxes, bubble wrap, tape from Uline",relatedItem:""},
  {id:"EXP-1004",date:"2026-02-20",category:"Storage & Rent",amount:850.00,description:"Warehouse rent - February",relatedItem:""},
  {id:"EXP-1005",date:"2026-02-18",category:"Platform Fees",amount:22.10,description:"Amazon referral fees",relatedItem:""},
  {id:"EXP-1006",date:"2026-02-15",category:"Shipping & Postage",amount:89.30,description:"FedEx Ground - 5 packages",relatedItem:""},
];

const DEFAULT_CUSTOMERS = [
  {id:"CUS-1001",name:"Marcus Johnson",email:"marcus.j@email.com",phone:"480-555-0142",address:"1234 E Baseline Rd, Mesa, AZ 85204",notes:"Repeat buyer, prefers eBay",totalOrders:3,totalSpent:312,lastOrder:"2026-02-23"},
  {id:"CUS-1002",name:"Sarah Chen",email:"sarah.chen@email.com",phone:"602-555-0198",address:"567 N Scottsdale Rd, Scottsdale, AZ 85250",notes:"Interested in electronics",totalOrders:1,totalSpent:119,lastOrder:"2026-02-23"},
  {id:"CUS-1003",name:"David Torres",email:"dtorres@email.com",phone:"623-555-0177",address:"890 W Glendale Ave, Glendale, AZ 85301",notes:"Local pickup only, tools buyer",totalOrders:2,totalSpent:185,lastOrder:"2026-02-20"},
  {id:"CUS-1004",name:"Emily Park",email:"emily.park@email.com",phone:"",address:"",notes:"Website customer",totalOrders:1,totalSpent:28,lastOrder:"2026-02-16"},
];

const DEFAULT_SHIPMENTS = [
  {id:"SHP-3001",itemId:"EVE-7208",customerId:"CUS-1002",carrier:"USPS",trackingNumber:"9400111899223",service:"Priority Mail",weight:"1.2",dimensions:"12x8x6",shippingCost:8.95,status:"Delivered",labelDate:"2026-02-24",shipDate:"2026-02-24",deliveryDate:"2026-02-26",notes:""},
  {id:"SHP-3002",itemId:"EVE-7204",customerId:"CUS-1001",carrier:"USPS",trackingNumber:"9400111899224",service:"Priority Mail",weight:"2.0",dimensions:"14x10x5",shippingCost:9.45,status:"Delivered",labelDate:"2026-02-23",shipDate:"2026-02-23",deliveryDate:"2026-02-25",notes:""},
  {id:"SHP-3003",itemId:"EVE-7211",customerId:"CUS-1003",carrier:"",trackingNumber:"",service:"Local Pickup",weight:"",dimensions:"",shippingCost:0,status:"Delivered",labelDate:"2026-02-20",shipDate:"2026-02-20",deliveryDate:"2026-02-20",notes:"Customer picked up in person"},
];

// ─── ICONS ───────────────────────────────────────────────────────────────────
const I={
  dashboard:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  inventory:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  listings:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/></svg>,
  purchasing:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>,
  analytics:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  expenses:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  customers:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  alerts:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  settings:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  search:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  plus:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  x:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  edit:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  trash:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  check:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  arrowRight:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  arrowUp:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m18 15-6-6-6 6"/></svg>,
  arrowDown:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6"/></svg>,
  download:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  upload:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  barcode:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 5v14M7 5v14M10 5v14M13 5v14M17 5v14M21 5v14"/></svg>,
  eye:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  warn:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  channels:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  shipping:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  reports:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>,
  printer:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  clock:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  menu:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>,
};
const icon = (i,s=18) => <span style={{width:s,height:s,display:"inline-flex",flexShrink:0}}>{i}</span>;

// ─── ERROR BOUNDARY ──────────────────────────────────────────────────────────
export class ErrorBoundary extends React.Component{
  constructor(props){super(props);this.state={error:null}}
  static getDerivedStateFromError(e){return{error:e}}
  componentDidCatch(e,info){console.error("App error:",e,info)}
  render(){
    if(this.state.error)return(
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#0A0C10",color:"#E8ECF4",fontFamily:"'DM Sans',sans-serif",gap:16,padding:32,textAlign:"center"}}>
        <div style={{fontSize:48}}>⚠</div>
        <h2 style={{fontSize:20,fontWeight:600,margin:0}}>Something went wrong</h2>
        <p style={{fontSize:13,color:"#8B95A9",margin:0,maxWidth:400}}>{this.state.error.message}</p>
        <button onClick={()=>this.setState({error:null})} style={{padding:"9px 20px",borderRadius:8,border:"none",background:"#6366F1",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Try again</button>
      </div>
    );
    return this.props.children;
  }
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
const StatusBadge=({status})=>{const c={Listed:["rgba(99,102,241,0.12)","#818CF8"],Active:["rgba(99,102,241,0.12)","#818CF8"],Processing:["rgba(245,158,11,0.12)","#FBBF24"],Grading:["rgba(6,182,212,0.12)","#22D3EE"],Sold:["rgba(16,185,129,0.12)","#34D399"],Shipped:["rgba(16,185,129,0.12)","#34D399"],Complete:["rgba(16,185,129,0.12)","#34D399"],Received:["rgba(99,102,241,0.12)","#818CF8"],"In Transit":["rgba(245,158,11,0.12)","#FBBF24"],Draft:["rgba(255,255,255,0.06)","#8B95A9"],Ordered:["rgba(6,182,212,0.12)","#22D3EE"]};const[bg,fg]=c[status]||["rgba(255,255,255,0.06)","#8B95A9"];return<span style={{background:bg,color:fg,padding:"3px 10px",borderRadius:6,fontSize:12,fontWeight:500,whiteSpace:"nowrap"}}>{status}</span>};

const CustomTooltip=({active,payload,label})=>{if(!active||!payload?.length)return null;return(<div style={{background:"#1C2130",border:"1px solid #262D3D",borderRadius:10,padding:"10px 14px",fontSize:12}}><div style={{color:"#8B95A9",marginBottom:6}}>{label}</div>{payload.map((p,i)=>(<div key={i} style={{color:p.color,display:"flex",gap:12,justifyContent:"space-between",marginBottom:2}}><span>{p.name}</span><span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:500}}>{typeof p.value==="number"&&p.value>10?fmtK(p.value):p.value}</span></div>))}</div>)};

const Modal=({open,onClose,title,width,children})=>{if(!open)return null;return(<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}><div onClick={e=>e.stopPropagation()} style={{background:"#171B24",border:"1px solid #262D3D",borderRadius:16,width:width||520,maxHeight:"90vh",overflow:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.5)"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 24px",borderBottom:"1px solid #1E2330",position:"sticky",top:0,background:"#171B24",borderRadius:"16px 16px 0 0",zIndex:2}}><h2 style={{fontSize:16,fontWeight:600,margin:0}}>{title}</h2><button onClick={onClose} style={{width:32,height:32,borderRadius:8,border:"1px solid #1E2330",background:"transparent",color:"#8B95A9",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{icon(I.x,16)}</button></div><div style={{padding:24}}>{children}</div></div></div>)};

const Field=({label,children,required,error})=>(<div style={{display:"flex",flexDirection:"column",gap:6}}><label style={{fontSize:12,fontWeight:500,color:"#8B95A9"}}>{label}{required&&<span style={{color:"#F43F5E"}}> *</span>}</label>{children}{error&&<span style={{fontSize:11,color:"#F43F5E",marginTop:-2}}>{error}</span>}</div>);

const IS={width:"100%",background:"#0D0F14",border:"1px solid #1E2330",borderRadius:8,padding:"9px 12px",color:"#E8ECF4",fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif"};
const SS={...IS,appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235A6478' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center",paddingRight:32};
const BTN=(primary)=>({padding:"9px 20px",borderRadius:8,border:primary?"none":"1px solid #1E2330",background:primary?"#6366F1":"transparent",color:primary?"#fff":"#8B95A9",fontSize:13,fontWeight:primary?600:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6});

const Toast=({message,type,onClose})=>{useEffect(()=>{const t=setTimeout(onClose,3000);return()=>clearTimeout(t)},[onClose]);const bg=type==="success"?"#10B981":type==="error"?"#F43F5E":"#6366F1";return(<div style={{position:"fixed",bottom:24,right:24,zIndex:200,background:"#171B24",border:`1px solid ${bg}40`,borderRadius:12,padding:"12px 20px",display:"flex",alignItems:"center",gap:10,boxShadow:`0 8px 32px ${bg}20`,animation:"slideUp 0.3s ease"}}><span style={{fontSize:13,fontWeight:500}}>{message}</span></div>)};

// ─── STORAGE ─────────────────────────────────────────────────────────────────
function useStorage(key,def,onError){
  const[data,setData]=useState(def);
  const[loaded,setLoaded]=useState(false);
  const onErrRef=useRef(onError);
  onErrRef.current=onError;
  useEffect(()=>{(async()=>{try{const r=await window.storage.get(key);if(r&&r.value)setData(JSON.parse(r.value))}catch(e){console.error("Storage load error:",key,e);onErrRef.current?.("Failed to load saved data. Using defaults.")}setLoaded(true)})()},[key]);
  const save=useCallback(async(nd)=>{setData(nd);try{await window.storage.set(key,JSON.stringify(nd))}catch(e){console.error("Storage save error:",key,e);onErrRef.current?.("Failed to save changes. Data may not persist.")}},[key]);
  return[data,save,loaded];
}

// ─── ITEM DETAIL MODAL ──────────────────────────────────────────────────────
function ItemDetailModal({open,onClose,item,customers}){
  const[tab,setTab]=useState("details");
  if(!open||!item)return null;
  const margin=item.price>0?Math.round(((item.price-item.cost)/item.price)*100):null;
  const profit=item.price>0?item.price-item.cost:null;
  const cust=customers.find(c=>c.id===item.customerId);
  const tabs=[{id:"details",label:"Details"},{id:"history",label:"History"},{id:"notes",label:"Notes"}];
  return(
    <Modal open={open} onClose={onClose} title={item.name} width={620}>
      <div style={{display:"flex",gap:6,marginBottom:20,borderBottom:"1px solid #1E2330",paddingBottom:12}}>
        {tabs.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"6px 16px",borderRadius:6,border:"none",background:tab===t.id?"rgba(99,102,241,0.12)":"transparent",color:tab===t.id?"#818CF8":"#8B95A9",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{t.label}</button>))}
      </div>
      {tab==="details"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={{background:"#0D0F14",borderRadius:10,padding:16}}>
              <div style={{fontSize:11,color:"#5A6478",marginBottom:4}}>Item ID</div>
              <div style={{fontSize:14,fontFamily:"'JetBrains Mono',monospace",color:"#818CF8"}}>{item.id}</div>
            </div>
            <div style={{background:"#0D0F14",borderRadius:10,padding:16}}>
              <div style={{fontSize:11,color:"#5A6478",marginBottom:4}}>Status</div>
              <StatusBadge status={item.status}/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <div style={{background:"#0D0F14",borderRadius:10,padding:16}}>
              <div style={{fontSize:11,color:"#5A6478",marginBottom:4}}>Cost</div>
              <div style={{fontSize:18,fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>{fmt(item.cost)}</div>
            </div>
            <div style={{background:"#0D0F14",borderRadius:10,padding:16}}>
              <div style={{fontSize:11,color:"#5A6478",marginBottom:4}}>Price</div>
              <div style={{fontSize:18,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:item.price?"#E8ECF4":"#5A6478"}}>{item.price?fmt(item.price):"—"}</div>
            </div>
            <div style={{background:"#0D0F14",borderRadius:10,padding:16}}>
              <div style={{fontSize:11,color:"#5A6478",marginBottom:4}}>Profit / Margin</div>
              <div style={{fontSize:18,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:profit>0?"#34D399":profit<0?"#F87171":"#5A6478"}}>{profit!==null?`${fmt(profit)} (${margin}%)`:"—"}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[["Category",item.category],["Condition",item.condition],["Source",item.source],["Channel",item.channel||"—"],["SKU",item.sku||"—"],["Barcode",item.barcode||"—"],["Received",item.received],["Sold Date",item.soldDate||"—"]].map(([l,v],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #1E2330"}}>
                <span style={{fontSize:12,color:"#5A6478"}}>{l}</span>
                <span style={{fontSize:13,fontWeight:500,fontFamily:["SKU","Barcode","Received","Sold Date"].includes(l)?"'JetBrains Mono',monospace":"inherit"}}>{v}</span>
              </div>
            ))}
          </div>
          {cust&&(<div style={{background:"#0D0F14",borderRadius:10,padding:16,marginTop:4}}>
            <div style={{fontSize:11,color:"#5A6478",marginBottom:6}}>Buyer</div>
            <div style={{fontSize:14,fontWeight:500}}>{cust.name}</div>
            <div style={{fontSize:12,color:"#8B95A9"}}>{cust.email}</div>
          </div>)}
        </div>
      )}
      {tab==="history"&&(
        <div style={{display:"flex",flexDirection:"column",gap:0}}>
          {(item.history||[]).length===0?<div style={{color:"#5A6478",fontSize:13,textAlign:"center",padding:32}}>No history recorded yet.</div>:
          (item.history||[]).map((h,i)=>(
            <div key={i} style={{display:"flex",gap:14,padding:"12px 0",borderBottom:i<item.history.length-1?"1px solid #1E2330":"none"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#6366F1",marginTop:6,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,fontWeight:600}}>{h.action}</span>
                  <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:"#5A6478"}}>{h.date}</span>
                </div>
                {h.note&&<div style={{fontSize:12,color:"#8B95A9",marginTop:2}}>{h.note}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==="notes"&&(
        <div style={{color:item.notes?"#E8ECF4":"#5A6478",fontSize:13,lineHeight:1.6,whiteSpace:"pre-wrap"}}>
          {item.notes||"No notes for this item."}
        </div>
      )}
    </Modal>
  );
}

// ─── ITEM FORM MODAL ─────────────────────────────────────────────────────────
function ItemFormModal({open,onClose,onSave,item}){
  const[form,setForm]=useState({});
  const[submitted,setSubmitted]=useState(false);
  useEffect(()=>{
    setSubmitted(false);
    if(item)setForm({...item,cost:String(item.cost),price:String(item.price||"")});
    else setForm({name:"",sku:"",barcode:"",category:"Electronics",condition:"Like New",status:"Received",channel:"",cost:"",price:"",source:"Amazon Liquidation",received:td(),soldDate:"",notes:"",customerId:"",history:[]});
  },[item,open]);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const errs={};
  if(!form.name?.trim())errs.name="Name is required";
  if(!form.cost||Number(form.cost)<=0)errs.cost="Cost must be greater than 0";
  if(form.price&&Number(form.price)<0)errs.price="Price cannot be negative";
  if(form.barcode&&!/^\d{8,14}$/.test(form.barcode.replace(/\s/g,"")))errs.barcode="Must be 8–14 digits";
  if(!form.received)errs.received="Date received is required";
  const canSave=Object.keys(errs).length===0;
  const handleSave=()=>{
    setSubmitted(true);
    if(!canSave)return;
    const newItem={...form,id:item?.id||uid(),cost:Number(form.cost)||0,price:Number(form.price)||0};
    if(!item){newItem.history=[{date:td(),action:"Received",note:"Item added to inventory"}]}
    onSave(newItem);onClose();
  };
  return(
    <Modal open={open} onClose={onClose} title={item?"Edit Item":"Add New Item"} width={600}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Field label="Product Name" required error={submitted&&errs.name}><input style={IS} value={form.name||""} onChange={e=>set("name",e.target.value)} placeholder="e.g. Sony WH-1000XM5 Headphones"/></Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="SKU"><input style={IS} value={form.sku||""} onChange={e=>set("sku",e.target.value)} placeholder="SKU-XXXXX"/></Field>
          <Field label="Barcode / UPC" error={submitted&&errs.barcode}><input style={IS} value={form.barcode||""} onChange={e=>set("barcode",e.target.value)} placeholder="0123456789012"/></Field>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Category" required><select style={SS} value={form.category||""} onChange={e=>set("category",e.target.value)}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></Field>
          <Field label="Condition"><select style={SS} value={form.condition||""} onChange={e=>set("condition",e.target.value)}>{CONDITIONS.map(c=><option key={c}>{c}</option>)}</select></Field>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Cost (what you paid)" required error={submitted&&errs.cost}><input style={IS} type="number" step="0.01" value={form.cost||""} onChange={e=>set("cost",e.target.value)} placeholder="0.00"/></Field>
          <Field label="List Price" error={submitted&&errs.price}><input style={IS} type="number" step="0.01" value={form.price||""} onChange={e=>set("price",e.target.value)} placeholder="0.00"/></Field>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Status"><select style={SS} value={form.status||""} onChange={e=>set("status",e.target.value)}>{ITEM_STATUSES.map(s=><option key={s}>{s}</option>)}</select></Field>
          <Field label="Channel"><select style={SS} value={form.channel||""} onChange={e=>set("channel",e.target.value)}><option value="">— None —</option>{CHANNELS.map(c=><option key={c}>{c}</option>)}</select></Field>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Source"><select style={SS} value={form.source||""} onChange={e=>set("source",e.target.value)}>{SOURCES.map(s=><option key={s}>{s}</option>)}</select></Field>
          <Field label="Date Received" required error={submitted&&errs.received}><input style={IS} type="date" value={form.received||""} onChange={e=>set("received",e.target.value)}/></Field>
        </div>
        <Field label="Notes"><textarea style={{...IS,minHeight:56,resize:"vertical"}} value={form.notes||""} onChange={e=>set("notes",e.target.value)} placeholder="Optional notes..."/></Field>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
          <button onClick={onClose} style={BTN(false)}>Cancel</button>
          <button onClick={handleSave} style={{...BTN(true),opacity:canSave||!submitted?1:0.4,cursor:"pointer"}}>{item?"Save Changes":"Add Item"}</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── PO FORM MODAL ───────────────────────────────────────────────────────────
function POFormModal({open,onClose,onSave,po}){
  const[form,setForm]=useState({});
  const[submitted,setSubmitted]=useState(false);
  useEffect(()=>{setSubmitted(false);if(po)setForm({...po,pallets:String(po.pallets),units:String(po.units),cost:String(po.cost)});else setForm({source:"Amazon Liquidation",pallets:"",units:"",cost:"",status:"Draft",eta:"",notes:""})},[po,open]);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const errs={};
  if(!form.cost||Number(form.cost)<=0)errs.cost="Cost must be greater than 0";
  if(form.pallets&&Number(form.pallets)<0)errs.pallets="Cannot be negative";
  if(form.units&&Number(form.units)<0)errs.units="Cannot be negative";
  const canSave=Object.keys(errs).length===0;
  const handleSave=()=>{setSubmitted(true);if(!canSave)return;onSave({...form,id:po?.id||poUid(),pallets:Number(form.pallets)||0,units:Number(form.units)||0,cost:Number(form.cost)||0});onClose()};
  return(<Modal open={open} onClose={onClose} title={po?"Edit PO":"New Purchase Order"} width={500}><div style={{display:"flex",flexDirection:"column",gap:14}}>
    <Field label="Source" required><select style={SS} value={form.source||""} onChange={e=>set("source",e.target.value)}>{SOURCES.map(s=><option key={s}>{s}</option>)}</select></Field>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}><Field label="Pallets" error={submitted&&errs.pallets}><input style={IS} type="number" value={form.pallets||""} onChange={e=>set("pallets",e.target.value)}/></Field><Field label="Est. Units" error={submitted&&errs.units}><input style={IS} type="number" value={form.units||""} onChange={e=>set("units",e.target.value)}/></Field><Field label="Total Cost" required error={submitted&&errs.cost}><input style={IS} type="number" step="0.01" value={form.cost||""} onChange={e=>set("cost",e.target.value)}/></Field></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Field label="Status"><select style={SS} value={form.status||""} onChange={e=>set("status",e.target.value)}>{PO_STATUSES.map(s=><option key={s}>{s}</option>)}</select></Field><Field label="ETA"><input style={IS} type="date" value={form.eta||""} onChange={e=>set("eta",e.target.value)}/></Field></div>
    <Field label="Notes"><textarea style={{...IS,minHeight:56,resize:"vertical"}} value={form.notes||""} onChange={e=>set("notes",e.target.value)}/></Field>
    <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}><button onClick={onClose} style={BTN(false)}>Cancel</button><button onClick={handleSave} style={{...BTN(true),opacity:canSave||!submitted?1:0.4}}>{po?"Save":"Create PO"}</button></div>
  </div></Modal>);
}

// ─── EXPENSE FORM MODAL ──────────────────────────────────────────────────────
function ExpenseFormModal({open,onClose,onSave,expense}){
  const[form,setForm]=useState({});
  const[submitted,setSubmitted]=useState(false);
  useEffect(()=>{setSubmitted(false);if(expense)setForm({...expense,amount:String(expense.amount)});else setForm({date:td(),category:"Shipping & Postage",amount:"",description:"",relatedItem:""})},[expense,open]);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const errs={};
  if(!form.date)errs.date="Date is required";
  if(!form.amount||Number(form.amount)<=0)errs.amount="Amount must be greater than 0";
  const canSave=Object.keys(errs).length===0;
  const handleSave=()=>{setSubmitted(true);if(!canSave)return;onSave({...form,id:expense?.id||expUid(),amount:Number(form.amount)||0});onClose()};
  return(<Modal open={open} onClose={onClose} title={expense?"Edit Expense":"Add Expense"} width={480}><div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Field label="Date" required error={submitted&&errs.date}><input style={IS} type="date" value={form.date||""} onChange={e=>set("date",e.target.value)}/></Field><Field label="Amount" required error={submitted&&errs.amount}><input style={IS} type="number" step="0.01" value={form.amount||""} onChange={e=>set("amount",e.target.value)} placeholder="0.00"/></Field></div>
    <Field label="Category" required><select style={SS} value={form.category||""} onChange={e=>set("category",e.target.value)}>{EXPENSE_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></Field>
    <Field label="Description"><input style={IS} value={form.description||""} onChange={e=>set("description",e.target.value)} placeholder="What was this expense for?"/></Field>
    <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}><button onClick={onClose} style={BTN(false)}>Cancel</button><button onClick={handleSave} style={{...BTN(true),opacity:canSave||!submitted?1:0.4}}>{expense?"Save":"Add Expense"}</button></div>
  </div></Modal>);
}

// ─── CUSTOMER FORM MODAL ─────────────────────────────────────────────────────
function CustomerFormModal({open,onClose,onSave,customer}){
  const[form,setForm]=useState({});
  const[submitted,setSubmitted]=useState(false);
  useEffect(()=>{setSubmitted(false);if(customer)setForm({...customer});else setForm({name:"",email:"",phone:"",address:"",notes:"",totalOrders:0,totalSpent:0,lastOrder:""})},[customer,open]);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const errs={};
  if(!form.name?.trim())errs.name="Name is required";
  if(form.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))errs.email="Invalid email format";
  const canSave=Object.keys(errs).length===0;
  const handleSave=()=>{setSubmitted(true);if(!canSave)return;onSave({...form,id:customer?.id||custUid()});onClose()};
  return(<Modal open={open} onClose={onClose} title={customer?"Edit Customer":"Add Customer"} width={480}><div style={{display:"flex",flexDirection:"column",gap:14}}>
    <Field label="Name" required error={submitted&&errs.name}><input style={IS} value={form.name||""} onChange={e=>set("name",e.target.value)} placeholder="Full name"/></Field>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Field label="Email" error={submitted&&errs.email}><input style={IS} value={form.email||""} onChange={e=>set("email",e.target.value)} placeholder="email@example.com"/></Field><Field label="Phone"><input style={IS} value={form.phone||""} onChange={e=>set("phone",e.target.value)} placeholder="480-555-0000"/></Field></div>
    <Field label="Address"><input style={IS} value={form.address||""} onChange={e=>set("address",e.target.value)} placeholder="Street, City, State ZIP"/></Field>
    <Field label="Notes"><textarea style={{...IS,minHeight:56,resize:"vertical"}} value={form.notes||""} onChange={e=>set("notes",e.target.value)}/></Field>
    <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}><button onClick={onClose} style={BTN(false)}>Cancel</button><button onClick={handleSave} style={{...BTN(true),opacity:canSave||!submitted?1:0.4}}>{customer?"Save":"Add Customer"}</button></div>
  </div></Modal>);
}

const ConfirmModal=({open,onClose,onConfirm,message})=>(<Modal open={open} onClose={onClose} title="Confirm" width={400}><p style={{fontSize:14,color:"#8B95A9",marginBottom:24}}>{message}</p><div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><button onClick={onClose} style={BTN(false)}>Cancel</button><button onClick={()=>{onConfirm();onClose()}} style={{...BTN(false),background:"#F43F5E",borderColor:"#F43F5E",color:"#fff"}}>Delete</button></div></Modal>);

// ─── SHIPMENT FORM MODAL ────────────────────────────────────────────────────
function ShipmentFormModal({open,onClose,onSave,shipment,items,customers}){
  const[form,setForm]=useState({});
  const[submitted,setSubmitted]=useState(false);
  useEffect(()=>{setSubmitted(false);if(shipment)setForm({...shipment,shippingCost:String(shipment.shippingCost)});else setForm({itemId:"",customerId:"",carrier:"USPS",trackingNumber:"",service:"Priority Mail",weight:"",dimensions:"",shippingCost:"",status:"Pending",labelDate:td(),shipDate:"",deliveryDate:"",notes:""})},[shipment,open]);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const errs={};
  if(!form.itemId)errs.itemId="Item is required";
  if(form.shippingCost&&Number(form.shippingCost)<0)errs.shippingCost="Cannot be negative";
  const canSave=Object.keys(errs).length===0;
  const soldItems=items.filter(i=>["Sold","Shipped"].includes(i.status));
  const handleSave=()=>{setSubmitted(true);if(!canSave)return;onSave({...form,id:shipment?.id||shipUid(),shippingCost:Number(form.shippingCost)||0});onClose()};
  return(<Modal open={open} onClose={onClose} title={shipment?"Edit Shipment":"Create Shipment"} width={560}><div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Field label="Item" required error={submitted&&errs.itemId}><select style={SS} value={form.itemId||""} onChange={e=>{set("itemId",e.target.value);const it=items.find(i=>i.id===e.target.value);if(it?.customerId)set("customerId",it.customerId)}}><option value="">— Select Item —</option>{soldItems.map(i=><option key={i.id} value={i.id}>{i.id} - {i.name.substring(0,30)}</option>)}</select></Field>
      <Field label="Customer"><select style={SS} value={form.customerId||""} onChange={e=>set("customerId",e.target.value)}><option value="">— Select —</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Field label="Carrier"><select style={SS} value={form.carrier||""} onChange={e=>set("carrier",e.target.value)}>{CARRIERS.map(c=><option key={c}>{c}</option>)}</select></Field>
      <Field label="Service"><input style={IS} value={form.service||""} onChange={e=>set("service",e.target.value)} placeholder="e.g. Priority Mail, Ground"/></Field>
    </div>
    <Field label="Tracking Number"><input style={IS} value={form.trackingNumber||""} onChange={e=>set("trackingNumber",e.target.value)} placeholder="Enter tracking number"/></Field>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
      <Field label="Weight (lbs)"><input style={IS} value={form.weight||""} onChange={e=>set("weight",e.target.value)} placeholder="0.0"/></Field>
      <Field label="Dimensions (LxWxH)"><input style={IS} value={form.dimensions||""} onChange={e=>set("dimensions",e.target.value)} placeholder="12x8x6"/></Field>
      <Field label="Shipping Cost" error={submitted&&errs.shippingCost}><input style={IS} type="number" step="0.01" value={form.shippingCost||""} onChange={e=>set("shippingCost",e.target.value)} placeholder="0.00"/></Field>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
      <Field label="Status"><select style={SS} value={form.status||""} onChange={e=>set("status",e.target.value)}>{SHIPMENT_STATUSES.map(s=><option key={s}>{s}</option>)}</select></Field>
      <Field label="Ship Date"><input style={IS} type="date" value={form.shipDate||""} onChange={e=>set("shipDate",e.target.value)}/></Field>
      <Field label="Delivery Date"><input style={IS} type="date" value={form.deliveryDate||""} onChange={e=>set("deliveryDate",e.target.value)}/></Field>
    </div>
    <Field label="Notes"><textarea style={{...IS,minHeight:48,resize:"vertical"}} value={form.notes||""} onChange={e=>set("notes",e.target.value)}/></Field>
    <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}><button onClick={onClose} style={BTN(false)}>Cancel</button><button onClick={handleSave} style={{...BTN(true),opacity:canSave||!submitted?1:0.4}}>{shipment?"Save":"Create Shipment"}</button></div>
  </div></Modal>);
}

// ─── CSV UTILITIES ───────────────────────────────────────────────────────────
function exportCSV(items){
  const headers=["id","name","sku","barcode","category","condition","status","channel","cost","price","source","received","soldDate","notes"];
  const rows=items.map(i=>headers.map(h=>JSON.stringify(String(i[h]||""))).join(","));
  const csv=[headers.join(","),...rows].join("\n");
  const blob=new Blob([csv],{type:"text/csv"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download=`eve-inventory-${td()}.csv`;a.click();
  URL.revokeObjectURL(url);
}

function parseCSVLine(line){
  const vals=[];let cur="";let inQuote=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(inQuote){
      if(ch==='"'&&line[i+1]==='"'){cur+='"';i++}  // escaped quote ""
      else if(ch==='"'){inQuote=false}
      else{cur+=ch}
    }else{
      if(ch==='"'){inQuote=true}
      else if(ch===','){vals.push(cur.trim());cur=""}
      else{cur+=ch}
    }
  }
  vals.push(cur.trim());
  return vals;
}

function parseCSV(text){
  const lines=text.split(/\r?\n/).filter(l=>l.trim());
  if(lines.length<2)return[];
  const headers=parseCSVLine(lines[0]).map(h=>h.replace(/^"|"$/g,"").trim());
  return lines.slice(1).map(line=>{
    const vals=parseCSVLine(line);
    const obj={};
    headers.forEach((h,i)=>{obj[h]=(vals[i]||"").replace(/^"|"$/g,"")});
    return{id:obj.id||uid(),name:obj.name||"Unnamed",sku:obj.sku||"",barcode:obj.barcode||"",category:CATEGORIES.includes(obj.category)?obj.category:"Other",condition:CONDITIONS.includes(obj.condition)?obj.condition:"Good",status:ITEM_STATUSES.includes(obj.status)?obj.status:"Received",channel:obj.channel||"",cost:Number(obj.cost)||0,price:Number(obj.price)||0,source:obj.source||"Other",received:obj.received||td(),soldDate:obj.soldDate||"",notes:obj.notes||"",customerId:"",history:[{date:td(),action:"Imported",note:"Imported via CSV"}]};
  });
}

// ─── REPORT EXPORT UTILITIES ────────────────────────────────────────────────
function generatePLReport(items,expenses,shipments){
  const soldItems=items.filter(i=>["Sold","Shipped"].includes(i.status));
  const totalRev=soldItems.reduce((s,i)=>s+(i.price||0),0);
  const cogs=soldItems.reduce((s,i)=>s+i.cost,0);
  const grossProfit=totalRev-cogs;
  const totalExp=expenses.reduce((s,e)=>s+e.amount,0);
  const shippingCost=shipments.reduce((s,sh)=>s+sh.shippingCost,0);
  const netProfit=grossProfit-totalExp-shippingCost;

  const catBreak={};expenses.forEach(e=>{catBreak[e.category]=(catBreak[e.category]||0)+e.amount});
  const channelBreak={};soldItems.forEach(i=>{if(i.channel)channelBreak[i.channel]=(channelBreak[i.channel]||0)+(i.price||0)});

  let csv="EAST VALLEY EXCHANGE — PROFIT & LOSS REPORT\n";
  csv+=`Generated: ${td()}\n\n`;
  csv+="REVENUE\n";
  csv+=`Total Revenue (${soldItems.length} items sold),${totalRev.toFixed(2)}\n`;
  Object.entries(channelBreak).sort((a,b)=>b[1]-a[1]).forEach(([ch,val])=>{csv+=`  ${ch},${val.toFixed(2)}\n`});
  csv+=`\nCOST OF GOODS SOLD\n`;
  csv+=`Total COGS,${cogs.toFixed(2)}\n`;
  csv+=`\nGROSS PROFIT,${grossProfit.toFixed(2)}\n`;
  csv+=`Gross Margin,${totalRev>0?((grossProfit/totalRev)*100).toFixed(1):0}%\n`;
  csv+=`\nOPERATING EXPENSES\n`;
  Object.entries(catBreak).sort((a,b)=>b[1]-a[1]).forEach(([cat,val])=>{csv+=`  ${cat},${val.toFixed(2)}\n`});
  csv+=`Total Operating Expenses,${totalExp.toFixed(2)}\n`;
  csv+=`\nSHIPPING COSTS\n`;
  csv+=`Total Shipping (${shipments.length} shipments),${shippingCost.toFixed(2)}\n`;
  csv+=`\nNET PROFIT,${netProfit.toFixed(2)}\n`;
  csv+=`Net Margin,${totalRev>0?((netProfit/totalRev)*100).toFixed(1):0}%\n`;
  csv+=`ROI,${cogs>0?((grossProfit/cogs)).toFixed(2):0}x\n`;

  const blob=new Blob([csv],{type:"text/csv"});
  const url=URL.createObjectURL(blob);const a=document.createElement("a");
  a.href=url;a.download=`eve-pl-report-${td()}.csv`;a.click();URL.revokeObjectURL(url);
}

function generateInventoryReport(items){
  const headers=["ID","Name","SKU","Barcode","Category","Condition","Status","Channel","Cost","Price","Margin%","Source","Received","Sold Date","Days Held","Notes"];
  const now=new Date();
  const rows=items.map(i=>{
    const margin=i.price>0?((i.price-i.cost)/i.price*100).toFixed(1):"";
    const days=Math.floor((now-new Date(i.received))/(1000*60*60*24));
    return[i.id,i.name,i.sku,i.barcode,i.category,i.condition,i.status,i.channel||"",i.cost,i.price||"",margin,i.source,i.received,i.soldDate||"",days,i.notes||""].map(v=>JSON.stringify(String(v))).join(",");
  });
  const csv=[headers.join(","),...rows].join("\n");
  const blob=new Blob([csv],{type:"text/csv"});
  const url=URL.createObjectURL(blob);const a=document.createElement("a");
  a.href=url;a.download=`eve-inventory-report-${td()}.csv`;a.click();URL.revokeObjectURL(url);
}

function generateMonthlyReport(items,expenses,shipments,month){
  const monthItems=items.filter(i=>i.received?.startsWith(month)||i.soldDate?.startsWith(month));
  const monthSold=items.filter(i=>["Sold","Shipped"].includes(i.status)&&i.soldDate?.startsWith(month));
  const monthReceived=items.filter(i=>i.received?.startsWith(month));
  const monthExp=expenses.filter(e=>e.date?.startsWith(month));
  const monthShip=shipments.filter(s=>s.shipDate?.startsWith(month));
  const rev=monthSold.reduce((s,i)=>s+(i.price||0),0);
  const cogs=monthSold.reduce((s,i)=>s+i.cost,0);
  const exp=monthExp.reduce((s,e)=>s+e.amount,0);
  const shipCost=monthShip.reduce((s,sh)=>s+sh.shippingCost,0);

  let csv=`EAST VALLEY EXCHANGE — MONTHLY SUMMARY: ${month}\n`;
  csv+=`Generated: ${td()}\n\n`;
  csv+=`Items Received,${monthReceived.length}\n`;
  csv+=`Items Sold,${monthSold.length}\n`;
  csv+=`Revenue,${rev.toFixed(2)}\n`;
  csv+=`COGS,${cogs.toFixed(2)}\n`;
  csv+=`Gross Profit,${(rev-cogs).toFixed(2)}\n`;
  csv+=`Operating Expenses,${exp.toFixed(2)}\n`;
  csv+=`Shipping Costs,${shipCost.toFixed(2)}\n`;
  csv+=`Net Profit,${(rev-cogs-exp-shipCost).toFixed(2)}\n`;
  csv+=`\nSOLD ITEMS\n`;
  csv+=`ID,Name,Channel,Cost,Price,Profit,Sold Date\n`;
  monthSold.forEach(i=>{csv+=`${i.id},"${i.name}",${i.channel||""},${i.cost},${i.price||0},${(i.price||0)-i.cost},${i.soldDate}\n`});
  csv+=`\nEXPENSES\n`;
  csv+=`ID,Date,Category,Amount,Description\n`;
  monthExp.forEach(e=>{csv+=`${e.id},${e.date},${e.category},${e.amount},"${e.description||""}"\n`});

  const blob=new Blob([csv],{type:"text/csv"});
  const url=URL.createObjectURL(blob);const a=document.createElement("a");
  a.href=url;a.download=`eve-monthly-${month}.csv`;a.click();URL.revokeObjectURL(url);
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function DashboardPage({items,expenses,setPage}){
  const soldItems=items.filter(i=>["Sold","Shipped"].includes(i.status));
  const totalRev=soldItems.reduce((s,i)=>s+(i.price||0),0);
  const totalCostSold=soldItems.reduce((s,i)=>s+i.cost,0);
  const totalProfit=totalRev-totalCostSold;
  const totalExpenses=expenses.reduce((s,e)=>s+e.amount,0);
  const netProfit=totalProfit-totalExpenses;
  const unsold=items.filter(i=>!["Sold","Shipped"].includes(i.status));
  const invCost=unsold.reduce((s,i)=>s+i.cost,0);

  const channelMap={};soldItems.forEach(i=>{if(i.channel)channelMap[i.channel]=(channelMap[i.channel]||0)+(i.price||0)});
  const channelColors={"eBay":"#F59E0B","Amazon":"#6366F1","Direct / Website":"#10B981","Wholesale":"#EC4899","Facebook Marketplace":"#06B6D4","Whatnot":"#F43F5E","Mercari":"#8B5CF6","OfferUp":"#14B8A6"};
  const chData=Object.entries(channelMap).map(([n,v])=>({name:n,value:v,color:channelColors[n]||"#8B95A9"}));

  const stats=[
    {label:"Total Items",value:items.length.toLocaleString(),sub:`${unsold.length} in stock`,accent:"#6366F1"},
    {label:"Inventory Cost",value:fmt(invCost),sub:"unsold items",accent:"#F59E0B"},
    {label:"Revenue",value:fmt(totalRev),sub:`${soldItems.length} items sold`,accent:"#10B981"},
    {label:"Net Profit",value:fmt(netProfit),sub:`after $${totalExpenses.toFixed(0)} expenses`,accent:netProfit>=0?"#10B981":"#F43F5E"},
  ];

  return(
    <div className="eve-page-pad" style={{padding:"28px 32px",display:"flex",flexDirection:"column",gap:24}}>
      <div className="eve-grid-4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>{stats.map((s,i)=>(
        <div key={i} style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:"20px 22px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${s.accent},transparent)`}}/>
          <div style={{fontSize:12,color:"#8B95A9",fontWeight:500,marginBottom:8}}>{s.label}</div>
          <div style={{fontSize:26,fontWeight:700,letterSpacing:-1,fontFamily:"'JetBrains Mono',monospace"}}>{s.value}</div>
          <div style={{fontSize:12,color:"#5A6478",marginTop:6}}>{s.sub}</div>
        </div>
      ))}</div>

      <div className="eve-grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {/* Pipeline */}
        <div style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:16}}>Inventory Pipeline</div>
          <div style={{display:"flex",gap:8}}>{ITEM_STATUSES.map(s=>{
            const count=items.filter(i=>i.status===s).length;
            const colors={Received:"#818CF8",Grading:"#22D3EE",Processing:"#FBBF24",Listed:"#6366F1",Sold:"#34D399",Shipped:"#10B981"};
            return(<div key={s} style={{flex:1,background:"#0D0F14",borderRadius:10,padding:"14px 8px",textAlign:"center",cursor:"pointer"}} onClick={()=>setPage("inventory")}>
              <div style={{fontSize:22,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:colors[s]||"#8B95A9"}}>{count}</div>
              <div style={{fontSize:10,color:"#5A6478",marginTop:4,fontWeight:500}}>{s}</div>
            </div>);
          })}</div>
        </div>
        {/* Channel Mix */}
        <div style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:12}}>Sales by Channel</div>
          {chData.length===0?<div style={{textAlign:"center",padding:32,color:"#5A6478",fontSize:13}}>No sales yet</div>:(
            <><ResponsiveContainer width="100%" height={120}><PieChart><Pie data={chData} cx="50%" cy="50%" innerRadius={32} outerRadius={52} paddingAngle={3} dataKey="value" stroke="none">{chData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart></ResponsiveContainer>
            <div style={{display:"flex",flexDirection:"column",gap:5,marginTop:6}}>{chData.map((c,i)=>(<div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:12}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{width:8,height:8,borderRadius:2,background:c.color}}/><span style={{color:"#8B95A9"}}>{c.name}</span></div><span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:500}}>{fmt(c.value)}</span></div>))}</div></>
          )}
        </div>
      </div>

      {/* Recent items */}
      <div style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24}}>
        <div style={{fontSize:15,fontWeight:600,marginBottom:16}}>Recent Items</div>
        <div className="eve-grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {[...items].sort((a,b)=>b.received.localeCompare(a.received)).slice(0,6).map(i=>{
            const icons2={Received:"📦",Grading:"🔍",Processing:"⚙️",Listed:"📋",Sold:"💰",Shipped:"🚚"};
            return(<div key={i.id} style={{background:"#0D0F14",borderRadius:10,padding:14,display:"flex",gap:10,alignItems:"center"}}>
              <span style={{fontSize:18}}>{icons2[i.status]||"📦"}</span>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{i.name}</div><div style={{fontSize:11,color:"#5A6478"}}>{i.status} · {fmt(i.cost)}{i.price>0&&<span style={{color:"#34D399"}}> → {fmt(i.price)}</span>}</div></div>
            </div>);
          })}
        </div>
      </div>
    </div>
  );
}

// ─── INVENTORY PAGE ──────────────────────────────────────────────────────────
function InventoryPage({items,saveItems,toast}){
  const[search,setSearch]=useState("");
  const[statusFilter,setStatusFilter]=useState("All");
  const[catFilter,setCatFilter]=useState("All");
  const[showForm,setShowForm]=useState(false);
  const[editItem,setEditItem]=useState(null);
  const[deleteId,setDeleteId]=useState(null);
  const[detailItem,setDetailItem]=useState(null);
  const[selected,setSelected]=useState(new Set());
  const[bulkAction,setBulkAction]=useState("");
  const fileRef=useRef();

  const filtered=items.filter(i=>{
    const ms=!search||i.name.toLowerCase().includes(search.toLowerCase())||i.id.toLowerCase().includes(search.toLowerCase())||i.sku?.toLowerCase().includes(search.toLowerCase())||i.barcode?.includes(search)||i.source.toLowerCase().includes(search.toLowerCase());
    return ms&&(statusFilter==="All"||i.status===statusFilter)&&(catFilter==="All"||i.category===catFilter);
  });

  const toggleSelect=(id)=>setSelected(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n});
  const toggleAll=()=>{if(selected.size===filtered.length)setSelected(new Set());else setSelected(new Set(filtered.map(i=>i.id)))};

  const handleSave=(item)=>{
    const idx=items.findIndex(i=>i.id===item.id);
    const n=[...items];if(idx>=0)n[idx]=item;else n.unshift(item);
    saveItems(n);toast(idx>=0?"Item updated":"Item added","success");
  };

  const advanceStatus=(id)=>{
    const idx=items.findIndex(i=>i.id===id);if(idx<0)return;
    const si=ITEM_STATUSES.indexOf(items[idx].status);
    if(si<ITEM_STATUSES.length-1){
      const n=[...items];const ns=ITEM_STATUSES[si+1];
      n[idx]={...n[idx],status:ns,soldDate:ns==="Sold"?td():n[idx].soldDate,history:[...(n[idx].history||[]),{date:td(),action:ns,note:`Status changed to ${ns}`}]};
      saveItems(n);toast(`Moved to ${ns}`,"success");
    }
  };

  const handleBulkAction=()=>{
    if(!bulkAction||selected.size===0)return;
    let n=[...items];
    if(bulkAction==="delete"){n=n.filter(i=>!selected.has(i.id));toast(`Deleted ${selected.size} items`,"success")}
    else if(ITEM_STATUSES.includes(bulkAction)){
      n=n.map(i=>selected.has(i.id)?{...i,status:bulkAction,soldDate:bulkAction==="Sold"?td():i.soldDate,history:[...(i.history||[]),{date:td(),action:bulkAction,note:`Bulk: status → ${bulkAction}`}]}:i);
      toast(`Updated ${selected.size} items to ${bulkAction}`,"success");
    }
    saveItems(n);setSelected(new Set());setBulkAction("");
  };

  const handleCSVImport=(e)=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=(ev)=>{const imported=parseCSV(ev.target.result);if(imported.length>0){saveItems([...imported,...items]);toast(`Imported ${imported.length} items`,"success")}else toast("No valid items found","error")};
    reader.readAsText(file);e.target.value="";
  };

  return(
    <div className="eve-page-pad" style={{padding:"28px 32px",display:"flex",flexDirection:"column",gap:16}}>
      <ItemFormModal open={showForm} onClose={()=>{setShowForm(false);setEditItem(null)}} onSave={handleSave} item={editItem}/>
      <ItemDetailModal open={!!detailItem} onClose={()=>setDetailItem(null)} item={detailItem} customers={[]}/>
      <ConfirmModal open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={()=>{saveItems(items.filter(i=>i.id!==deleteId));setDeleteId(null);toast("Deleted","success")}} message="Delete this item permanently?"/>
      <input ref={fileRef} type="file" accept=".csv" onChange={handleCSVImport} style={{display:"none"}}/>

      {/* Toolbar */}
      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,maxWidth:320}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#5A6478"}}>{icon(I.search,16)}</span>
          <input type="text" placeholder="Search name, ID, SKU, barcode, source..." value={search} onChange={e=>setSearch(e.target.value)} style={{...IS,paddingLeft:36}}/>
        </div>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{...SS,width:150}}><option value="All">All Categories</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
        <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{["All",...ITEM_STATUSES].map(s=>(
          <button key={s} onClick={()=>setStatusFilter(s)} style={{padding:"6px 10px",borderRadius:6,border:"1px solid",fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:statusFilter===s?"rgba(99,102,241,0.12)":"transparent",borderColor:statusFilter===s?"rgba(99,102,241,0.3)":"#1E2330",color:statusFilter===s?"#818CF8":"#8B95A9"}}>{s}</button>
        ))}</div>
        <div style={{flex:1}}/>
        <button onClick={()=>fileRef.current?.click()} style={{...BTN(false),fontSize:12}} title="Import CSV">{icon(I.upload,14)}Import</button>
        <button onClick={()=>exportCSV(items)} style={{...BTN(false),fontSize:12}} title="Export CSV">{icon(I.download,14)}Export</button>
        <button onClick={()=>{setEditItem(null);setShowForm(true)}} style={BTN(true)}>{icon(I.plus,16)}Add Item</button>
      </div>

      {/* Bulk actions bar */}
      {selected.size>0&&(
        <div style={{background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:13,fontWeight:600,color:"#818CF8"}}>{selected.size} selected</span>
          <select value={bulkAction} onChange={e=>setBulkAction(e.target.value)} style={{...SS,width:180,padding:"6px 10px",fontSize:12}}>
            <option value="">Choose action...</option>
            <optgroup label="Change Status">{ITEM_STATUSES.map(s=><option key={s} value={s}>Set → {s}</option>)}</optgroup>
            <option value="delete">🗑 Delete Selected</option>
          </select>
          <button onClick={handleBulkAction} disabled={!bulkAction} style={{...BTN(true),padding:"6px 14px",fontSize:12,opacity:bulkAction?1:0.4}}>Apply</button>
          <button onClick={()=>setSelected(new Set())} style={{...BTN(false),padding:"6px 14px",fontSize:12}}>Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="eve-table-wrap" style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{borderBottom:"1px solid #1E2330"}}>
              <th style={{padding:"12px 8px",width:40}}><input type="checkbox" checked={selected.size===filtered.length&&filtered.length>0} onChange={toggleAll} style={{accentColor:"#6366F1"}}/></th>
              {["ID","Product","SKU","Category","Condition","Source","Cost","Price","Margin","Status","Channel",""].map(h=>(
                <th key={h} style={{padding:"12px 10px",textAlign:"left",fontSize:11,fontWeight:600,color:"#5A6478",textTransform:"uppercase",letterSpacing:"0.5px",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.length===0?<tr><td colSpan={13} style={{padding:40,textAlign:"center",color:"#5A6478"}}>No items found</td></tr>:
              filtered.map(item=>{
                const margin=item.price>0?Math.round(((item.price-item.cost)/item.price)*100):null;
                const canAdv=ITEM_STATUSES.indexOf(item.status)<ITEM_STATUSES.length-1;
                return(<tr key={item.id} style={{borderBottom:"1px solid #1E2330"}} onMouseEnter={e=>e.currentTarget.style.background="#1C2130"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"10px 8px",width:40}}><input type="checkbox" checked={selected.has(item.id)} onChange={()=>toggleSelect(item.id)} style={{accentColor:"#6366F1"}}/></td>
                  <td style={{padding:"10px 10px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#818CF8"}}>{item.id}</td>
                  <td style={{padding:"10px 10px",fontWeight:500,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</td>
                  <td style={{padding:"10px 10px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#5A6478"}}>{item.sku||"—"}</td>
                  <td style={{padding:"10px 10px",color:"#8B95A9",fontSize:12}}>{item.category}</td>
                  <td style={{padding:"10px 10px",color:"#8B95A9",fontSize:12}}>{item.condition}</td>
                  <td style={{padding:"10px 10px",color:"#8B95A9",fontSize:11}}>{item.source}</td>
                  <td style={{padding:"10px 10px",fontFamily:"'JetBrains Mono',monospace",fontSize:12}}>{fmt(item.cost)}</td>
                  <td style={{padding:"10px 10px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:item.price?"#E8ECF4":"#5A6478"}}>{item.price?fmt(item.price):"—"}</td>
                  <td style={{padding:"10px 10px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:margin!==null?(margin>0?"#34D399":"#F87171"):"#5A6478",fontWeight:600}}>{margin!==null?margin+"%":"—"}</td>
                  <td style={{padding:"10px 10px"}}><StatusBadge status={item.status}/></td>
                  <td style={{padding:"10px 10px",color:"#8B95A9",fontSize:11}}>{item.channel||"—"}</td>
                  <td style={{padding:"10px 8px"}}>
                    <div style={{display:"flex",gap:3}}>
                      <button onClick={()=>setDetailItem(item)} title="View" style={{width:26,height:26,borderRadius:5,border:"1px solid #1E2330",background:"transparent",color:"#8B95A9",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{icon(I.eye,13)}</button>
                      {canAdv&&<button onClick={()=>advanceStatus(item.id)} title={`→ ${ITEM_STATUSES[ITEM_STATUSES.indexOf(item.status)+1]}`} style={{width:26,height:26,borderRadius:5,border:"1px solid #1E2330",background:"transparent",color:"#10B981",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{icon(I.arrowRight,13)}</button>}
                      <button onClick={()=>{setEditItem(item);setShowForm(true)}} title="Edit" style={{width:26,height:26,borderRadius:5,border:"1px solid #1E2330",background:"transparent",color:"#8B95A9",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{icon(I.edit,13)}</button>
                      <button onClick={()=>setDeleteId(item.id)} title="Delete" style={{width:26,height:26,borderRadius:5,border:"1px solid #1E2330",background:"transparent",color:"#F43F5E",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{icon(I.trash,13)}</button>
                    </div>
                  </td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
        <div style={{padding:"10px 16px",borderTop:"1px solid #1E2330",fontSize:12,color:"#5A6478"}}>{filtered.length} of {items.length} items</div>
      </div>
    </div>
  );
}

// ─── LISTINGS PAGE ───────────────────────────────────────────────────────────
function ListingsPage({items,saveItems,toast}){
  const listed=items.filter(i=>i.status==="Listed");
  const totalValue=listed.reduce((s,i)=>s+(i.price||0),0);
  const potentialProfit=listed.reduce((s,i)=>s+((i.price||0)-i.cost),0);
  const markSold=(id)=>{saveItems(items.map(i=>i.id===id?{...i,status:"Sold",soldDate:td(),history:[...(i.history||[]),{date:td(),action:"Sold",note:"Marked as sold"}]}:i));toast("Marked as sold!","success")};
  return(<div className="eve-page-pad" style={{padding:"28px 32px",display:"flex",flexDirection:"column",gap:20}}>
    <div className="eve-grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>{[{label:"Active Listings",value:listed.length,color:"#6366F1"},{label:"Total Listed Value",value:fmt(totalValue),color:"#10B981"},{label:"Potential Profit",value:fmt(potentialProfit),color:"#F59E0B"}].map((s,i)=>(<div key={i} style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:12,padding:"18px 20px"}}><div style={{fontSize:11,color:"#5A6478",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.5px"}}>{s.label}</div><div style={{fontSize:28,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:-1,marginTop:4,color:s.color}}>{s.value}</div></div>))}</div>
    <div className="eve-table-wrap" style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,overflow:"hidden"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr style={{borderBottom:"1px solid #1E2330"}}>{["ID","Product","Channel","Cost","Price","Profit","Margin","Condition",""].map(h=>(<th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:11,fontWeight:600,color:"#5A6478",textTransform:"uppercase"}}>{h}</th>))}</tr></thead><tbody>
      {listed.length===0?<tr><td colSpan={9} style={{padding:40,textAlign:"center",color:"#5A6478"}}>No active listings. Move items to "Listed" status.</td></tr>:
      listed.map(l=>{const profit=(l.price||0)-l.cost;const margin=l.price>0?Math.round((profit/l.price)*100):0;return(<tr key={l.id} style={{borderBottom:"1px solid #1E2330"}} onMouseEnter={e=>e.currentTarget.style.background="#1C2130"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <td style={{padding:"12px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#818CF8"}}>{l.id}</td>
        <td style={{padding:"12px 14px",fontWeight:500,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.name}</td>
        <td style={{padding:"12px 14px",color:"#8B95A9",fontSize:12}}>{l.channel||"—"}</td>
        <td style={{padding:"12px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#8B95A9"}}>{fmt(l.cost)}</td>
        <td style={{padding:"12px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:600}}>{fmt(l.price)}</td>
        <td style={{padding:"12px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:profit>0?"#34D399":"#F87171",fontWeight:600}}>{profit>0?"+":""}{fmt(profit)}</td>
        <td style={{padding:"12px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#34D399",fontWeight:600}}>{margin}%</td>
        <td style={{padding:"12px 14px",color:"#8B95A9",fontSize:12}}>{l.condition}</td>
        <td style={{padding:"12px 14px"}}><button onClick={()=>markSold(l.id)} style={{padding:"5px 12px",borderRadius:6,border:"1px solid rgba(16,185,129,0.3)",background:"rgba(16,185,129,0.1)",color:"#34D399",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Mark Sold</button></td>
      </tr>)})}
    </tbody></table></div>
  </div>);
}

// ─── PURCHASING PAGE ─────────────────────────────────────────────────────────
function PurchasingPage({pos,savePOs,toast}){
  const[showForm,setShowForm]=useState(false);const[editPO,setEditPO]=useState(null);const[deleteId,setDeleteId]=useState(null);
  const totalSpend=pos.reduce((s,p)=>s+p.cost,0);const totalUnits=pos.reduce((s,p)=>s+p.units,0);
  const advanceStatus=(id)=>{const idx=pos.findIndex(p=>p.id===id);if(idx<0)return;const si=PO_STATUSES.indexOf(pos[idx].status);if(si<PO_STATUSES.length-1){const n=[...pos];n[idx]={...n[idx],status:PO_STATUSES[si+1]};savePOs(n);toast(`PO → ${PO_STATUSES[si+1]}`,"success")}};
  const sourceMap={};pos.forEach(p=>{sourceMap[p.source]=(sourceMap[p.source]||0)+p.cost});
  const sourceData=Object.entries(sourceMap).map(([source,spent])=>({source:source.replace(" Returns","").replace(" Liquidation"," Liq."),spent}));

  return(<div className="eve-page-pad" style={{padding:"28px 32px",display:"flex",flexDirection:"column",gap:20}}>
    <POFormModal open={showForm} onClose={()=>{setShowForm(false);setEditPO(null)}} onSave={(po)=>{const idx=pos.findIndex(p=>p.id===po.id);const n=[...pos];if(idx>=0)n[idx]=po;else n.unshift(po);savePOs(n);toast(idx>=0?"PO updated":"PO created","success")}} po={editPO}/>
    <ConfirmModal open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={()=>{savePOs(pos.filter(p=>p.id!==deleteId));setDeleteId(null);toast("Deleted","success")}} message="Delete this PO?"/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div className="eve-grid-4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,flex:1,marginRight:16}}>
        {[{label:"Active POs",value:pos.filter(p=>!["Complete"].includes(p.status)).length,accent:"#6366F1"},{label:"Total Units",value:totalUnits.toLocaleString(),accent:"#F59E0B"},{label:"Total Spend",value:fmt(totalSpend),accent:"#EC4899"},{label:"Avg Cost/Unit",value:totalUnits>0?fmt(totalSpend/totalUnits):"—",accent:"#10B981"}].map((s,i)=>(
          <div key={i} style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:12,padding:"16px 18px",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${s.accent},transparent)`}}/><div style={{fontSize:11,color:"#5A6478",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.5px"}}>{s.label}</div><div style={{fontSize:24,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:-1,marginTop:4}}>{s.value}</div></div>
        ))}
      </div>
      <button onClick={()=>{setEditPO(null);setShowForm(true)}} style={BTN(true)}>{icon(I.plus,16)}New PO</button>
    </div>
    <div className="eve-table-wrap" style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,overflow:"hidden"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr style={{borderBottom:"1px solid #1E2330"}}>{["PO #","Source","Pallets","Units","Cost","Cost/Unit","Status","ETA","Notes",""].map(h=>(<th key={h} style={{padding:"12px 12px",textAlign:"left",fontSize:11,fontWeight:600,color:"#5A6478",textTransform:"uppercase"}}>{h}</th>))}</tr></thead><tbody>
      {pos.map(po=>{const canAdv=PO_STATUSES.indexOf(po.status)<PO_STATUSES.length-1;return(<tr key={po.id} style={{borderBottom:"1px solid #1E2330"}} onMouseEnter={e=>e.currentTarget.style.background="#1C2130"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <td style={{padding:"12px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#818CF8"}}>{po.id}</td><td style={{padding:"12px 12px",fontWeight:500}}>{po.source}</td><td style={{padding:"12px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#8B95A9"}}>{po.pallets}</td><td style={{padding:"12px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#8B95A9"}}>{po.units}</td><td style={{padding:"12px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:600}}>{fmt(po.cost)}</td><td style={{padding:"12px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#8B95A9"}}>{po.units>0?fmt(po.cost/po.units):"—"}</td><td style={{padding:"12px 12px"}}><StatusBadge status={po.status}/></td><td style={{padding:"12px 12px",color:"#8B95A9",fontSize:12}}>{po.eta||"—"}</td><td style={{padding:"12px 12px",color:"#5A6478",fontSize:11,maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{po.notes||"—"}</td>
        <td style={{padding:"12px 8px"}}><div style={{display:"flex",gap:3}}>
          {canAdv&&<button onClick={()=>advanceStatus(po.id)} style={{width:26,height:26,borderRadius:5,border:"1px solid #1E2330",background:"transparent",color:"#10B981",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{icon(I.arrowRight,13)}</button>}
          <button onClick={()=>{setEditPO(po);setShowForm(true)}} style={{width:26,height:26,borderRadius:5,border:"1px solid #1E2330",background:"transparent",color:"#8B95A9",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{icon(I.edit,13)}</button>
          <button onClick={()=>setDeleteId(po.id)} style={{width:26,height:26,borderRadius:5,border:"1px solid #1E2330",background:"transparent",color:"#F43F5E",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{icon(I.trash,13)}</button>
        </div></td>
      </tr>)})}
    </tbody></table></div>
    {sourceData.length>0&&<div style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24}}><div style={{fontSize:15,fontWeight:600,marginBottom:16}}>Spend by Source</div><ResponsiveContainer width="100%" height={200}><BarChart data={sourceData}><CartesianGrid stroke="#1E2330" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="source" tick={{fill:"#5A6478",fontSize:12}} axisLine={false} tickLine={false}/><YAxis tick={{fill:"#5A6478",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={fmtK}/><Tooltip content={<CustomTooltip/>}/><Bar dataKey="spent" fill="#6366F1" radius={[6,6,0,0]} name="Spent"/></BarChart></ResponsiveContainer></div>}
  </div>);
}

// ─── ANALYTICS PAGE ──────────────────────────────────────────────────────────
function AnalyticsPage({items,expenses,shipments}){
  const[tab,setTab]=useState("overview");
  const soldItems=items.filter(i=>["Sold","Shipped"].includes(i.status));
  const totalRev=soldItems.reduce((s,i)=>s+(i.price||0),0);
  const totalCostSold=soldItems.reduce((s,i)=>s+i.cost,0);
  const totalExp=expenses.reduce((s,e)=>s+e.amount,0);
  const shipCost=shipments.reduce((s,sh)=>s+sh.shippingCost,0);
  const grossProfit=totalRev-totalCostSold;
  const netProfit=grossProfit-totalExp-shipCost;
  const overallROI=totalCostSold>0?((grossProfit)/totalCostSold).toFixed(1):"0.0";

  // Category analysis
  const catMap={};items.forEach(i=>{if(!catMap[i.category])catMap[i.category]={bought:0,sold:0,revenue:0,costSold:0};catMap[i.category].bought++;if(["Sold","Shipped"].includes(i.status)){catMap[i.category].sold++;catMap[i.category].revenue+=(i.price||0);catMap[i.category].costSold+=i.cost}});
  const catData=Object.entries(catMap).map(([cat,d])=>({category:cat,...d,margin:d.revenue>0?Math.round(((d.revenue-d.costSold)/d.revenue)*100):0,sellThrough:d.bought>0?Math.round((d.sold/d.bought)*100):0,roi:d.costSold>0?((d.revenue-d.costSold)/d.costSold).toFixed(1):"0.0"})).sort((a,b)=>b.bought-a.bought);

  // Profit timeline
  const profitByDate={};soldItems.forEach(i=>{const d=i.soldDate||i.received;const m=d?.substring(0,7)||"Unknown";if(!profitByDate[m])profitByDate[m]={revenue:0,cost:0};profitByDate[m].revenue+=(i.price||0);profitByDate[m].cost+=i.cost});
  const expByDate={};expenses.forEach(e=>{const m=e.date?.substring(0,7)||"Unknown";expByDate[m]=(expByDate[m]||0)+e.amount});
  const allMonths=[...new Set([...Object.keys(profitByDate),...Object.keys(expByDate)])].sort();
  const profitTimeline=allMonths.map(m=>{const p=profitByDate[m]||{revenue:0,cost:0};const exp=expByDate[m]||0;return{month:m.substring(5),revenue:p.revenue,cost:p.cost,grossProfit:p.revenue-p.cost,expenses:exp,netProfit:p.revenue-p.cost-exp}});

  // Source ROI
  const sourceMap={};soldItems.forEach(i=>{if(!sourceMap[i.source])sourceMap[i.source]={rev:0,cost:0,count:0};sourceMap[i.source].rev+=(i.price||0);sourceMap[i.source].cost+=i.cost;sourceMap[i.source].count++});
  const sourceData=Object.entries(sourceMap).map(([s,d])=>({source:s.replace(" Returns","").replace(" Liquidation"," Liq."),roi:d.cost>0?Number(((d.rev-d.cost)/d.cost).toFixed(1)):0,count:d.count})).sort((a,b)=>b.roi-a.roi);

  // Inventory aging
  const now=new Date();
  const agingBuckets={"0-7 days":0,"8-14 days":0,"15-30 days":0,"31-60 days":0,"60+ days":0};
  const agingItems=items.filter(i=>!["Sold","Shipped"].includes(i.status));
  agingItems.forEach(i=>{const days=Math.floor((now-new Date(i.received))/(1000*60*60*24));if(days<=7)agingBuckets["0-7 days"]++;else if(days<=14)agingBuckets["8-14 days"]++;else if(days<=30)agingBuckets["15-30 days"]++;else if(days<=60)agingBuckets["31-60 days"]++;else agingBuckets["60+ days"]++});
  const agingData=Object.entries(agingBuckets).map(([range,count])=>({range,count}));
  const agingColors=["#10B981","#34D399","#F59E0B","#F97316","#F43F5E"];
  const totalAgingCost={};agingItems.forEach(i=>{const days=Math.floor((now-new Date(i.received))/(1000*60*60*24));const bucket=days<=7?"0-7 days":days<=14?"8-14 days":days<=30?"15-30 days":days<=60?"31-60 days":"60+ days";totalAgingCost[bucket]=(totalAgingCost[bucket]||0)+i.cost});

  // Channel performance
  const channelMap={};soldItems.forEach(i=>{if(!i.channel)return;if(!channelMap[i.channel])channelMap[i.channel]={revenue:0,cost:0,count:0,profit:0};channelMap[i.channel].revenue+=(i.price||0);channelMap[i.channel].cost+=i.cost;channelMap[i.channel].count++;channelMap[i.channel].profit+=(i.price||0)-i.cost});
  const channelPerf=Object.entries(channelMap).map(([ch,d])=>({channel:ch,revenue:d.revenue,profit:d.profit,count:d.count,margin:d.revenue>0?Math.round((d.profit/d.revenue)*100):0,avgPrice:d.count>0?Math.round(d.revenue/d.count):0})).sort((a,b)=>b.revenue-a.revenue);
  const chColors={"eBay":"#F59E0B","Amazon":"#6366F1","Direct / Website":"#10B981","Wholesale":"#EC4899","Facebook Marketplace":"#06B6D4","Whatnot":"#F43F5E","Mercari":"#8B5CF6","OfferUp":"#14B8A6"};

  // Top performers
  const topProfit=[...soldItems].filter(i=>i.price>0).map(i=>({...i,profit:(i.price||0)-i.cost,margin:Math.round(((i.price-i.cost)/i.price)*100)})).sort((a,b)=>b.profit-a.profit).slice(0,5);
  const topMargin=[...soldItems].filter(i=>i.price>0).map(i=>({...i,profit:(i.price||0)-i.cost,margin:Math.round(((i.price-i.cost)/i.price)*100)})).sort((a,b)=>b.margin-a.margin).slice(0,5);
  const fastestSellers=[...soldItems].filter(i=>i.soldDate&&i.received).map(i=>({...i,days:Math.max(0,Math.floor((new Date(i.soldDate)-new Date(i.received))/(1000*60*60*24))),profit:(i.price||0)-i.cost})).sort((a,b)=>a.days-b.days).slice(0,5);

  const tabs2=[{id:"overview",label:"Overview"},{id:"aging",label:"Inventory Aging"},{id:"channels",label:"Channel Performance"},{id:"top",label:"Top Performers"}];

  return(<div className="eve-page-pad" style={{padding:"28px 32px",display:"flex",flexDirection:"column",gap:20}}>
    <div className="eve-grid-5" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:16}}>
      {[{label:"Gross Profit",value:fmt(grossProfit),sub:`${soldItems.length} items sold`,color:"#10B981"},{label:"Expenses",value:fmt(totalExp+shipCost),sub:`ops + shipping`,color:"#F43F5E"},{label:"Net Profit",value:fmt(netProfit),sub:"after all costs",color:netProfit>=0?"#10B981":"#F43F5E"},{label:"ROI",value:overallROI+"x",sub:"return on cost",color:"#F59E0B"},{label:"Avg Days to Sell",value:soldItems.length>0?Math.round(soldItems.filter(i=>i.soldDate&&i.received).reduce((s,i)=>s+Math.floor((new Date(i.soldDate)-new Date(i.received))/(1000*60*60*24)),0)/(soldItems.filter(i=>i.soldDate&&i.received).length||1)):"—",sub:"time to sale",color:"#06B6D4"}].map((s,i)=>(
        <div key={i} style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:"18px 20px",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${s.color},transparent)`}}/><div style={{fontSize:11,color:"#5A6478",fontWeight:500}}>{s.label}</div><div style={{fontSize:24,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:-1,marginTop:6,color:s.color}}>{s.value}</div><div style={{fontSize:11,color:"#5A6478",marginTop:4}}>{s.sub}</div></div>
      ))}
    </div>

    <div style={{display:"flex",gap:4,borderBottom:"1px solid #1E2330",paddingBottom:0}}>
      {tabs2.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 16px",borderRadius:"6px 6px 0 0",border:"none",borderBottom:tab===t.id?"2px solid #6366F1":"2px solid transparent",background:tab===t.id?"rgba(99,102,241,0.08)":"transparent",color:tab===t.id?"#818CF8":"#8B95A9",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{t.label}</button>))}
    </div>

    {tab==="overview"&&<>
      {profitTimeline.length>0&&<div style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24}}>
        <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>Profit Over Time</div>
        <div style={{fontSize:12,color:"#5A6478",marginBottom:20}}>Monthly revenue and net profit</div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={profitTimeline}>
            <defs>
              <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366F1" stopOpacity={0.3}/><stop offset="100%" stopColor="#6366F1" stopOpacity={0}/></linearGradient>
              <linearGradient id="gProf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.3}/><stop offset="100%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid stroke="#1E2330" strokeDasharray="3 3" vertical={false}/>
            <XAxis dataKey="month" tick={{fill:"#5A6478",fontSize:12}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:"#5A6478",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={fmtK}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Area type="monotone" dataKey="revenue" stroke="#6366F1" fill="url(#gRev)" strokeWidth={2} name="Revenue"/>
            <Area type="monotone" dataKey="netProfit" stroke="#10B981" fill="url(#gProf)" strokeWidth={2} name="Net Profit"/>
            <Line type="monotone" dataKey="expenses" stroke="#F43F5E" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Expenses"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>}
      <div className="eve-grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:16}}>Profit Margin by Category</div>
          {catData.filter(c=>c.sold>0).length===0?<div style={{textAlign:"center",padding:32,color:"#5A6478",fontSize:13}}>Sell items to see data</div>:
          <ResponsiveContainer width="100%" height={200}><BarChart data={catData.filter(c=>c.sold>0)} layout="vertical"><CartesianGrid stroke="#1E2330" strokeDasharray="3 3" horizontal={false}/><XAxis type="number" tick={{fill:"#5A6478",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>v+"%"} domain={[0,100]}/><YAxis dataKey="category" type="category" tick={{fill:"#8B95A9",fontSize:11}} axisLine={false} tickLine={false} width={110}/><Tooltip content={<CustomTooltip/>}/><Bar dataKey="margin" fill="#10B981" radius={[0,6,6,0]} name="Margin %"/></BarChart></ResponsiveContainer>}
        </div>
        <div style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:16}}>ROI by Source</div>
          {sourceData.length===0?<div style={{textAlign:"center",padding:32,color:"#5A6478",fontSize:13}}>Sell items to see source ROI</div>:
          <ResponsiveContainer width="100%" height={200}><BarChart data={sourceData}><CartesianGrid stroke="#1E2330" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="source" tick={{fill:"#5A6478",fontSize:10}} axisLine={false} tickLine={false}/><YAxis tick={{fill:"#5A6478",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>v+"x"}/><Tooltip content={<CustomTooltip/>}/><Bar dataKey="roi" fill="#F59E0B" radius={[6,6,0,0]} name="ROI"/></BarChart></ResponsiveContainer>}
        </div>
      </div>
      <div className="eve-table-wrap" style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24}}>
        <div style={{fontSize:15,fontWeight:600,marginBottom:16}}>Category Breakdown</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr style={{borderBottom:"1px solid #1E2330"}}>{["Category","Items","Sold","Sell-Through","Revenue","Cost","Profit","Margin","ROI"].map(h=>(<th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:11,fontWeight:600,color:"#5A6478",textTransform:"uppercase"}}>{h}</th>))}</tr></thead><tbody>
          {catData.map((c,i)=>(<tr key={i} style={{borderBottom:"1px solid #1E2330"}}>
            <td style={{padding:"10px 12px",fontWeight:500}}>{c.category}</td>
            <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#8B95A9"}}>{c.bought}</td>
            <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#8B95A9"}}>{c.sold}</td>
            <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#818CF8"}}>{c.sellThrough}%</td>
            <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12}}>{c.revenue>0?fmt(c.revenue):"—"}</td>
            <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#8B95A9"}}>{c.costSold>0?fmt(c.costSold):"—"}</td>
            <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:c.revenue-c.costSold>0?"#34D399":"#5A6478",fontWeight:600}}>{c.revenue>0?fmt(c.revenue-c.costSold):"—"}</td>
            <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#34D399",fontWeight:600}}>{c.margin>0?c.margin+"%":"—"}</td>
            <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#F59E0B",fontWeight:600}}>{Number(c.roi)>0?c.roi+"x":"—"}</td>
          </tr>))}
        </tbody></table>
      </div>
    </>}

    {tab==="aging"&&<>
      <div className="eve-grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>Inventory Age Distribution</div>
          <div style={{fontSize:12,color:"#5A6478",marginBottom:20}}>{agingItems.length} unsold items</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={agingData}>
              <CartesianGrid stroke="#1E2330" strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="range" tick={{fill:"#5A6478",fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#5A6478",fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="count" name="Items" radius={[6,6,0,0]}>
                {agingData.map((_,i)=><Cell key={i} fill={agingColors[i]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>Capital at Risk by Age</div>
          <div style={{fontSize:12,color:"#5A6478",marginBottom:20}}>Cost tied up in aging inventory</div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {agingData.map((a,i)=>{const cost=totalAgingCost[a.range]||0;const totalCost=agingItems.reduce((s,it)=>s+it.cost,0);const pct=totalCost>0?(cost/totalCost)*100:0;
              return(<div key={i}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:8,height:8,borderRadius:2,background:agingColors[i]}}/>{a.range} <span style={{color:"#5A6478"}}>({a.count} items)</span></span><span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:500}}>{fmt(cost)}</span></div><div style={{height:6,background:"#0D0F14",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:agingColors[i],borderRadius:3}}/></div></div>);
            })}
          </div>
        </div>
      </div>
      <div className="eve-table-wrap" style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24}}>
        <div style={{fontSize:15,fontWeight:600,marginBottom:16}}>Oldest Unsold Items</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr style={{borderBottom:"1px solid #1E2330"}}>{["ID","Product","Category","Status","Cost","Price","Days Held","Source"].map(h=>(<th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:11,fontWeight:600,color:"#5A6478",textTransform:"uppercase"}}>{h}</th>))}</tr></thead><tbody>
          {[...agingItems].sort((a,b)=>new Date(a.received)-new Date(b.received)).slice(0,10).map(i=>{const days=Math.floor((now-new Date(i.received))/(1000*60*60*24));return(<tr key={i.id} style={{borderBottom:"1px solid #1E2330"}}>
            <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#818CF8"}}>{i.id}</td>
            <td style={{padding:"10px 12px",fontWeight:500,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{i.name}</td>
            <td style={{padding:"10px 12px",color:"#8B95A9",fontSize:12}}>{i.category}</td>
            <td style={{padding:"10px 12px"}}><StatusBadge status={i.status}/></td>
            <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12}}>{fmt(i.cost)}</td>
            <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:i.price?"#E8ECF4":"#5A6478"}}>{i.price?fmt(i.price):"—"}</td>
            <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:600,color:days>30?"#F43F5E":days>14?"#F59E0B":"#34D399"}}>{days}d</td>
            <td style={{padding:"10px 12px",color:"#8B95A9",fontSize:11}}>{i.source}</td>
          </tr>)})}
        </tbody></table>
      </div>
    </>}

    {tab==="channels"&&<>
      <div className="eve-grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>Revenue by Channel</div>
          <div style={{fontSize:12,color:"#5A6478",marginBottom:20}}>Total sales per platform</div>
          {channelPerf.length===0?<div style={{textAlign:"center",padding:32,color:"#5A6478",fontSize:13}}>No sales data yet</div>:
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={channelPerf}>
              <CartesianGrid stroke="#1E2330" strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="channel" tick={{fill:"#5A6478",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#5A6478",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={fmtK}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="revenue" name="Revenue" radius={[6,6,0,0]}>
                {channelPerf.map((c,i)=><Cell key={i} fill={chColors[c.channel]||"#8B95A9"}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>}
        </div>
        <div style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>Profit Margin by Channel</div>
          <div style={{fontSize:12,color:"#5A6478",marginBottom:20}}>Which platforms are most profitable</div>
          {channelPerf.length===0?<div style={{textAlign:"center",padding:32,color:"#5A6478",fontSize:13}}>No sales data yet</div>:
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={channelPerf} layout="vertical">
              <CartesianGrid stroke="#1E2330" strokeDasharray="3 3" horizontal={false}/>
              <XAxis type="number" tick={{fill:"#5A6478",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>v+"%"} domain={[0,100]}/>
              <YAxis dataKey="channel" type="category" tick={{fill:"#8B95A9",fontSize:11}} axisLine={false} tickLine={false} width={120}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="margin" fill="#10B981" radius={[0,6,6,0]} name="Margin %"/>
            </BarChart>
          </ResponsiveContainer>}
        </div>
      </div>
      <div className="eve-table-wrap" style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24}}>
        <div style={{fontSize:15,fontWeight:600,marginBottom:16}}>Channel Performance Summary</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr style={{borderBottom:"1px solid #1E2330"}}>{["Channel","Items Sold","Revenue","Profit","Margin","Avg Sale Price"].map(h=>(<th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:11,fontWeight:600,color:"#5A6478",textTransform:"uppercase"}}>{h}</th>))}</tr></thead><tbody>
          {channelPerf.map((c,i)=>(<tr key={i} style={{borderBottom:"1px solid #1E2330"}}>
            <td style={{padding:"10px 12px",fontWeight:500}}><span style={{display:"inline-flex",alignItems:"center",gap:8}}><span style={{width:8,height:8,borderRadius:2,background:chColors[c.channel]||"#8B95A9"}}/>{c.channel}</span></td>
            <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#8B95A9"}}>{c.count}</td>
            <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:600}}>{fmt(c.revenue)}</td>
            <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:c.profit>0?"#34D399":"#F87171",fontWeight:600}}>{fmt(c.profit)}</td>
            <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#34D399",fontWeight:600}}>{c.margin}%</td>
            <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#8B95A9"}}>{fmt(c.avgPrice)}</td>
          </tr>))}
        </tbody></table>
      </div>
    </>}

    {tab==="top"&&<>
      <div className="eve-grid-3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
        <div style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>💰 Top Profit</div>
          <div style={{fontSize:12,color:"#5A6478",marginBottom:16}}>Highest dollar profit items</div>
          {topProfit.length===0?<div style={{color:"#5A6478",fontSize:13,textAlign:"center",padding:20}}>No sold items</div>:
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {topProfit.map((i,idx)=>(<div key={i.id} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 0",borderBottom:idx<topProfit.length-1?"1px solid #1E2330":"none"}}>
              <span style={{fontSize:14,fontWeight:700,color:"#5A6478",fontFamily:"'JetBrains Mono',monospace",width:20}}>#{idx+1}</span>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{i.name}</div><div style={{fontSize:11,color:"#5A6478"}}>{i.channel}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:600,color:"#34D399",fontFamily:"'JetBrains Mono',monospace"}}>{fmt(i.profit)}</div><div style={{fontSize:10,color:"#5A6478"}}>{i.margin}% margin</div></div>
            </div>))}
          </div>}
        </div>
        <div style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>📈 Top Margin</div>
          <div style={{fontSize:12,color:"#5A6478",marginBottom:16}}>Highest % margin items</div>
          {topMargin.length===0?<div style={{color:"#5A6478",fontSize:13,textAlign:"center",padding:20}}>No sold items</div>:
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {topMargin.map((i,idx)=>(<div key={i.id} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 0",borderBottom:idx<topMargin.length-1?"1px solid #1E2330":"none"}}>
              <span style={{fontSize:14,fontWeight:700,color:"#5A6478",fontFamily:"'JetBrains Mono',monospace",width:20}}>#{idx+1}</span>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{i.name}</div><div style={{fontSize:11,color:"#5A6478"}}>{fmt(i.cost)} → {fmt(i.price)}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:600,color:"#10B981",fontFamily:"'JetBrains Mono',monospace"}}>{i.margin}%</div><div style={{fontSize:10,color:"#5A6478"}}>{fmt(i.profit)}</div></div>
            </div>))}
          </div>}
        </div>
        <div style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>⚡ Fastest Sellers</div>
          <div style={{fontSize:12,color:"#5A6478",marginBottom:16}}>Quickest items to sell</div>
          {fastestSellers.length===0?<div style={{color:"#5A6478",fontSize:13,textAlign:"center",padding:20}}>No sold items</div>:
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {fastestSellers.map((i,idx)=>(<div key={i.id} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 0",borderBottom:idx<fastestSellers.length-1?"1px solid #1E2330":"none"}}>
              <span style={{fontSize:14,fontWeight:700,color:"#5A6478",fontFamily:"'JetBrains Mono',monospace",width:20}}>#{idx+1}</span>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{i.name}</div><div style={{fontSize:11,color:"#5A6478"}}>{i.category}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:600,color:"#06B6D4",fontFamily:"'JetBrains Mono',monospace"}}>{i.days}d</div><div style={{fontSize:10,color:"#5A6478"}}>{fmt(i.profit)} profit</div></div>
            </div>))}
          </div>}
        </div>
      </div>
    </>}
  </div>);
}

// ─── EXPENSES PAGE ───────────────────────────────────────────────────────────
function ExpensesPage({expenses,saveExpenses,toast}){
  const[showForm,setShowForm]=useState(false);const[editExp,setEditExp]=useState(null);const[deleteId,setDeleteId]=useState(null);
  const total=expenses.reduce((s,e)=>s+e.amount,0);
  const catTotals={};expenses.forEach(e=>{catTotals[e.category]=(catTotals[e.category]||0)+e.amount});
  const catData=Object.entries(catTotals).map(([name,value])=>({name:name.length>15?name.substring(0,15)+"…":name,value})).sort((a,b)=>b.value-a.value);
  const colors=["#6366F1","#F59E0B","#10B981","#EC4899","#06B6D4","#F43F5E","#8B5CF6","#14B8A6","#EAB308","#F97316"];

  return(<div className="eve-page-pad" style={{padding:"28px 32px",display:"flex",flexDirection:"column",gap:20}}>
    <ExpenseFormModal open={showForm} onClose={()=>{setShowForm(false);setEditExp(null)}} onSave={(exp)=>{const idx=expenses.findIndex(e=>e.id===exp.id);const n=[...expenses];if(idx>=0)n[idx]=exp;else n.unshift(exp);saveExpenses(n);toast(idx>=0?"Updated":"Expense added","success")}} expense={editExp}/>
    <ConfirmModal open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={()=>{saveExpenses(expenses.filter(e=>e.id!==deleteId));setDeleteId(null);toast("Deleted","success")}} message="Delete this expense?"/>

    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div className="eve-grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,flex:1,marginRight:16}}>
        <div style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:12,padding:"18px 20px"}}><div style={{fontSize:11,color:"#5A6478",fontWeight:500,textTransform:"uppercase"}}>Total Expenses</div><div style={{fontSize:28,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:-1,marginTop:4,color:"#F43F5E"}}>{fmt(total)}</div></div>
        <div style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:12,padding:"18px 20px"}}><div style={{fontSize:11,color:"#5A6478",fontWeight:500,textTransform:"uppercase"}}>Entries</div><div style={{fontSize:28,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:-1,marginTop:4}}>{expenses.length}</div></div>
        <div style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:12,padding:"18px 20px"}}><div style={{fontSize:11,color:"#5A6478",fontWeight:500,textTransform:"uppercase"}}>Top Category</div><div style={{fontSize:16,fontWeight:600,marginTop:8}}>{catData[0]?.name||"—"}</div></div>
      </div>
      <button onClick={()=>{setEditExp(null);setShowForm(true)}} style={BTN(true)}>{icon(I.plus,16)}Add Expense</button>
    </div>

    <div className="eve-grid-2" style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
      <div className="eve-table-wrap" style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,overflow:"hidden"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr style={{borderBottom:"1px solid #1E2330"}}>{["ID","Date","Category","Amount","Description",""].map(h=>(<th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:11,fontWeight:600,color:"#5A6478",textTransform:"uppercase"}}>{h}</th>))}</tr></thead><tbody>
        {expenses.length===0?<tr><td colSpan={6} style={{padding:40,textAlign:"center",color:"#5A6478"}}>No expenses yet</td></tr>:
        [...expenses].sort((a,b)=>b.date.localeCompare(a.date)).map(e=>(<tr key={e.id} style={{borderBottom:"1px solid #1E2330"}} onMouseEnter={ev=>ev.currentTarget.style.background="#1C2130"} onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
          <td style={{padding:"12px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#818CF8"}}>{e.id}</td>
          <td style={{padding:"12px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#8B95A9"}}>{e.date}</td>
          <td style={{padding:"12px 14px",fontSize:12}}>{e.category}</td>
          <td style={{padding:"12px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:600,color:"#F87171"}}>{fmt(e.amount)}</td>
          <td style={{padding:"12px 14px",color:"#8B95A9",fontSize:12,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.description||"—"}</td>
          <td style={{padding:"12px 8px"}}><div style={{display:"flex",gap:3}}>
            <button onClick={()=>{setEditExp(e);setShowForm(true)}} style={{width:26,height:26,borderRadius:5,border:"1px solid #1E2330",background:"transparent",color:"#8B95A9",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{icon(I.edit,13)}</button>
            <button onClick={()=>setDeleteId(e.id)} style={{width:26,height:26,borderRadius:5,border:"1px solid #1E2330",background:"transparent",color:"#F43F5E",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{icon(I.trash,13)}</button>
          </div></td>
        </tr>))}
      </tbody></table></div>
      {catData.length>0&&<div style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24}}>
        <div style={{fontSize:15,fontWeight:600,marginBottom:16}}>By Category</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>{catData.map((c,i)=>{const pct=total>0?(c.value/total)*100:0;return(<div key={i}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:"#8B95A9"}}>{c.name}</span><span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:500}}>{fmt(c.value)}</span></div><div style={{height:6,background:"#0D0F14",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:colors[i%colors.length],borderRadius:3}}/></div></div>)})}</div>
      </div>}
    </div>
  </div>);
}

// ─── CUSTOMERS PAGE ──────────────────────────────────────────────────────────
function CustomersPage({customers,saveCustomers,items,toast}){
  const[showForm,setShowForm]=useState(false);const[editCust,setEditCust]=useState(null);const[deleteId,setDeleteId]=useState(null);const[search,setSearch]=useState("");
  const filtered=customers.filter(c=>!search||c.name.toLowerCase().includes(search.toLowerCase())||c.email.toLowerCase().includes(search.toLowerCase()));

  // Recalculate customer stats from items
  const custStats={};items.filter(i=>i.customerId&&["Sold","Shipped"].includes(i.status)).forEach(i=>{if(!custStats[i.customerId])custStats[i.customerId]={orders:0,spent:0};custStats[i.customerId].orders++;custStats[i.customerId].spent+=(i.price||0)});

  return(<div className="eve-page-pad" style={{padding:"28px 32px",display:"flex",flexDirection:"column",gap:20}}>
    <CustomerFormModal open={showForm} onClose={()=>{setShowForm(false);setEditCust(null)}} onSave={(c)=>{const idx=customers.findIndex(x=>x.id===c.id);const n=[...customers];if(idx>=0)n[idx]=c;else n.unshift(c);saveCustomers(n);toast(idx>=0?"Updated":"Customer added","success")}} customer={editCust}/>
    <ConfirmModal open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={()=>{saveCustomers(customers.filter(c=>c.id!==deleteId));setDeleteId(null);toast("Deleted","success")}} message="Delete this customer?"/>

    <div style={{display:"flex",gap:10,alignItems:"center"}}>
      <div style={{position:"relative",flex:1,maxWidth:320}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#5A6478"}}>{icon(I.search,16)}</span><input type="text" placeholder="Search customers..." value={search} onChange={e=>setSearch(e.target.value)} style={{...IS,paddingLeft:36}}/></div>
      <div style={{flex:1}}/>
      <button onClick={()=>{setEditCust(null);setShowForm(true)}} style={BTN(true)}>{icon(I.plus,16)}Add Customer</button>
    </div>

    <div className="eve-grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>{[{label:"Total Customers",value:customers.length,color:"#6366F1"},{label:"Total Revenue",value:fmt(Object.values(custStats).reduce((s,c)=>s+c.spent,0)),color:"#10B981"},{label:"Repeat Buyers",value:Object.values(custStats).filter(c=>c.orders>1).length,color:"#F59E0B"}].map((s,i)=>(<div key={i} style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:12,padding:"18px 20px"}}><div style={{fontSize:11,color:"#5A6478",fontWeight:500,textTransform:"uppercase"}}>{s.label}</div><div style={{fontSize:28,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:-1,marginTop:4,color:s.color}}>{s.value}</div></div>))}</div>

    <div className="eve-table-wrap" style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,overflow:"hidden"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr style={{borderBottom:"1px solid #1E2330"}}>{["ID","Name","Email","Phone","Orders","Total Spent","Notes",""].map(h=>(<th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:11,fontWeight:600,color:"#5A6478",textTransform:"uppercase"}}>{h}</th>))}</tr></thead><tbody>
      {filtered.length===0?<tr><td colSpan={8} style={{padding:40,textAlign:"center",color:"#5A6478"}}>No customers found</td></tr>:
      filtered.map(c=>{const st=custStats[c.id]||{orders:c.totalOrders||0,spent:c.totalSpent||0};return(<tr key={c.id} style={{borderBottom:"1px solid #1E2330"}} onMouseEnter={e=>e.currentTarget.style.background="#1C2130"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <td style={{padding:"12px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#818CF8"}}>{c.id}</td>
        <td style={{padding:"12px 14px",fontWeight:500}}>{c.name}</td>
        <td style={{padding:"12px 14px",color:"#8B95A9",fontSize:12}}>{c.email||"—"}</td>
        <td style={{padding:"12px 14px",color:"#8B95A9",fontSize:12}}>{c.phone||"—"}</td>
        <td style={{padding:"12px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:12}}>{st.orders}</td>
        <td style={{padding:"12px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:600,color:"#34D399"}}>{fmt(st.spent)}</td>
        <td style={{padding:"12px 14px",color:"#5A6478",fontSize:12,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.notes||"—"}</td>
        <td style={{padding:"12px 8px"}}><div style={{display:"flex",gap:3}}>
          <button onClick={()=>{setEditCust(c);setShowForm(true)}} style={{width:26,height:26,borderRadius:5,border:"1px solid #1E2330",background:"transparent",color:"#8B95A9",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{icon(I.edit,13)}</button>
          <button onClick={()=>setDeleteId(c.id)} style={{width:26,height:26,borderRadius:5,border:"1px solid #1E2330",background:"transparent",color:"#F43F5E",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{icon(I.trash,13)}</button>
        </div></td>
      </tr>)})}
    </tbody></table></div>
  </div>);
}

// ─── ALERTS PAGE ─────────────────────────────────────────────────────────────
function AlertsPage({items,expenses}){
  const alerts=[];
  // Low margin items
  items.filter(i=>i.status==="Listed"&&i.price>0).forEach(i=>{const margin=((i.price-i.cost)/i.price)*100;if(margin<20)alerts.push({type:"warn",icon:"⚠️",title:`Low margin: ${i.name}`,desc:`Only ${margin.toFixed(0)}% margin (cost ${fmt(i.cost)}, price ${fmt(i.price)})`,category:"Low Margin"})});
  // Slow movers (listed > 10 days ago)
  const now=new Date();items.filter(i=>i.status==="Listed").forEach(i=>{const days=Math.floor((now-new Date(i.received))/(1000*60*60*24));if(days>10)alerts.push({type:"info",icon:"🐌",title:`Slow mover: ${i.name}`,desc:`Listed for ${days} days — consider a price drop`,category:"Slow Mover"})});
  // High value items stuck in processing/grading
  items.filter(i=>["Grading","Processing"].includes(i.status)&&i.cost>100).forEach(i=>{alerts.push({type:"action",icon:"⏰",title:`High-value item in ${i.status}: ${i.name}`,desc:`${fmt(i.cost)} cost — move to Listed to start recovering`,category:"Action Needed"})});
  // Large expenses
  expenses.filter(e=>e.amount>500).forEach(e=>{alerts.push({type:"info",icon:"💸",title:`Large expense: ${e.category}`,desc:`${fmt(e.amount)} — ${e.description}`,category:"Expense Alert"})});
  // No price set on listed items
  items.filter(i=>i.status==="Listed"&&!i.price).forEach(i=>{alerts.push({type:"warn",icon:"🏷️",title:`No price set: ${i.name}`,desc:"This item is listed but has no price — set one to track margin",category:"Missing Data"})});

  const typeColors={warn:"#F59E0B",info:"#6366F1",action:"#F43F5E"};

  return(<div className="eve-page-pad" style={{padding:"28px 32px",display:"flex",flexDirection:"column",gap:20}}>
    <div className="eve-grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
      {[{label:"Total Alerts",value:alerts.length,color:"#F59E0B"},{label:"Action Required",value:alerts.filter(a=>a.type==="action").length,color:"#F43F5E"},{label:"Warnings",value:alerts.filter(a=>a.type==="warn").length,color:"#FBBF24"}].map((s,i)=>(<div key={i} style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:12,padding:"18px 20px"}}><div style={{fontSize:11,color:"#5A6478",fontWeight:500,textTransform:"uppercase"}}>{s.label}</div><div style={{fontSize:28,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:-1,marginTop:4,color:s.color}}>{s.value}</div></div>))}
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {alerts.length===0?<div style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:48,textAlign:"center",color:"#5A6478"}}>🎉 No alerts — everything looks good!</div>:
      alerts.map((a,i)=>(<div key={i} style={{background:"#171B24",border:`1px solid ${typeColors[a.type]}30`,borderRadius:12,padding:"16px 20px",display:"flex",alignItems:"flex-start",gap:14}}>
        <span style={{fontSize:22,flexShrink:0,marginTop:2}}>{a.icon}</span>
        <div style={{flex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:14,fontWeight:600}}>{a.title}</span><span style={{fontSize:10,fontWeight:600,color:typeColors[a.type],background:`${typeColors[a.type]}15`,padding:"3px 8px",borderRadius:4,textTransform:"uppercase"}}>{a.category}</span></div>
          <div style={{fontSize:12,color:"#8B95A9",marginTop:4}}>{a.desc}</div>
        </div>
      </div>))}
    </div>
  </div>);
}

// ─── SHIPPING PAGE ──────────────────────────────────────────────────────────
function ShippingPage({shipments,saveShipments,items,customers,toast}){
  const[showForm,setShowForm]=useState(false);const[editShip,setEditShip]=useState(null);const[deleteId,setDeleteId]=useState(null);const[filter,setFilter]=useState("All");

  // Fulfillment queue: items sold but not yet shipped (no matching shipment)
  const shippedItemIds=new Set(shipments.map(s=>s.itemId));
  const awaitingShipment=items.filter(i=>i.status==="Sold"&&!shippedItemIds.has(i.id));

  const totalShipCost=shipments.reduce((s,sh)=>s+sh.shippingCost,0);
  const inTransit=shipments.filter(s=>["Pending","Label Created","Picked Up","In Transit","Out for Delivery"].includes(s.status));
  const delivered=shipments.filter(s=>s.status==="Delivered");

  const filtered=filter==="All"?shipments:shipments.filter(s=>s.status===filter);

  const getItemName=(id)=>{const item=items.find(i=>i.id===id);return item?item.name:"Unknown"};
  const getCustName=(id)=>{const c=customers.find(c=>c.id===id);return c?c.name:"—"};

  const advanceStatus=(id)=>{
    const idx=shipments.findIndex(s=>s.id===id);if(idx<0)return;
    const si=SHIPMENT_STATUSES.indexOf(shipments[idx].status);
    if(si<SHIPMENT_STATUSES.length-1){
      const n=[...shipments];const ns=SHIPMENT_STATUSES[si+1];
      n[idx]={...n[idx],status:ns,shipDate:ns==="Picked Up"&&!n[idx].shipDate?td():n[idx].shipDate,deliveryDate:ns==="Delivered"?td():n[idx].deliveryDate};
      // Also update item status to Shipped if transitioning
      saveShipments(n);toast(`Shipment → ${ns}`,"success");
    }
  };

  return(<div className="eve-page-pad" style={{padding:"28px 32px",display:"flex",flexDirection:"column",gap:20}}>
    <ShipmentFormModal open={showForm} onClose={()=>{setShowForm(false);setEditShip(null)}} onSave={(sh)=>{const idx=shipments.findIndex(s=>s.id===sh.id);const n=[...shipments];if(idx>=0)n[idx]=sh;else n.unshift(sh);saveShipments(n);toast(idx>=0?"Updated":"Shipment created","success")}} shipment={editShip} items={items} customers={customers}/>
    <ConfirmModal open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={()=>{saveShipments(shipments.filter(s=>s.id!==deleteId));setDeleteId(null);toast("Deleted","success")}} message="Delete this shipment?"/>

    <div className="eve-grid-4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
      {[{label:"Total Shipments",value:shipments.length,accent:"#6366F1"},{label:"In Transit",value:inTransit.length,accent:"#F59E0B"},{label:"Awaiting Shipment",value:awaitingShipment.length,accent:awaitingShipment.length>0?"#F43F5E":"#10B981"},{label:"Shipping Costs",value:fmt(totalShipCost),accent:"#EC4899"}].map((s,i)=>(
        <div key={i} style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:12,padding:"18px 20px",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${s.accent},transparent)`}}/><div style={{fontSize:11,color:"#5A6478",fontWeight:500,textTransform:"uppercase"}}>{s.label}</div><div style={{fontSize:24,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:-1,marginTop:4}}>{s.value}</div></div>
      ))}
    </div>

    {/* Fulfillment Queue */}
    {awaitingShipment.length>0&&<div style={{background:"#171B24",border:"1px solid rgba(244,63,94,0.2)",borderRadius:14,padding:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><div style={{fontSize:15,fontWeight:600,color:"#F43F5E"}}>Fulfillment Queue</div><div style={{fontSize:12,color:"#5A6478",marginTop:2}}>{awaitingShipment.length} item{awaitingShipment.length!==1?"s":""} sold but not yet shipped</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
        {awaitingShipment.map(i=>{
          const cust=customers.find(c=>c.id===i.customerId);
          return(<div key={i.id} style={{background:"#0D0F14",borderRadius:10,padding:14,display:"flex",gap:12,alignItems:"center"}}>
            <span style={{fontSize:20}}>📦</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{i.name}</div>
              <div style={{fontSize:11,color:"#5A6478"}}>{cust?cust.name:"No buyer"} · {fmt(i.price)}</div>
            </div>
            <button onClick={()=>{setEditShip({itemId:i.id,customerId:i.customerId||"",carrier:"USPS",trackingNumber:"",service:"Priority Mail",weight:"",dimensions:"",shippingCost:"",status:"Pending",labelDate:td(),shipDate:"",deliveryDate:"",notes:""});setShowForm(true)}} style={{padding:"5px 10px",borderRadius:6,border:"1px solid rgba(99,102,241,0.3)",background:"rgba(99,102,241,0.1)",color:"#818CF8",fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>Ship</button>
          </div>);
        })}
      </div>
    </div>}

    {/* Shipments Table */}
    <div style={{display:"flex",gap:10,alignItems:"center"}}>
      <div style={{display:"flex",gap:3}}>{["All",...SHIPMENT_STATUSES].map(s=>(
        <button key={s} onClick={()=>setFilter(s)} style={{padding:"5px 10px",borderRadius:6,border:"1px solid",fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:filter===s?"rgba(99,102,241,0.12)":"transparent",borderColor:filter===s?"rgba(99,102,241,0.3)":"#1E2330",color:filter===s?"#818CF8":"#8B95A9"}}>{s}</button>
      ))}</div>
      <div style={{flex:1}}/>
      <button onClick={()=>{setEditShip(null);setShowForm(true)}} style={BTN(true)}>{icon(I.plus,16)}New Shipment</button>
    </div>

    <div className="eve-table-wrap" style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr style={{borderBottom:"1px solid #1E2330"}}>{["ID","Item","Customer","Carrier","Tracking","Service","Cost","Status","Ship Date",""].map(h=>(<th key={h} style={{padding:"12px 12px",textAlign:"left",fontSize:11,fontWeight:600,color:"#5A6478",textTransform:"uppercase"}}>{h}</th>))}</tr></thead><tbody>
        {filtered.length===0?<tr><td colSpan={10} style={{padding:40,textAlign:"center",color:"#5A6478"}}>No shipments found</td></tr>:
        filtered.map(sh=>{const canAdv=SHIPMENT_STATUSES.indexOf(sh.status)<SHIPMENT_STATUSES.length-1&&sh.status!=="Exception";return(<tr key={sh.id} style={{borderBottom:"1px solid #1E2330"}} onMouseEnter={e=>e.currentTarget.style.background="#1C2130"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <td style={{padding:"12px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#818CF8"}}>{sh.id}</td>
          <td style={{padding:"12px 12px",fontWeight:500,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{getItemName(sh.itemId)}</td>
          <td style={{padding:"12px 12px",color:"#8B95A9",fontSize:12}}>{getCustName(sh.customerId)}</td>
          <td style={{padding:"12px 12px",fontSize:12}}>{sh.carrier||"—"}</td>
          <td style={{padding:"12px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#8B95A9",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis"}}>{sh.trackingNumber||"—"}</td>
          <td style={{padding:"12px 12px",color:"#8B95A9",fontSize:11}}>{sh.service||"—"}</td>
          <td style={{padding:"12px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12}}>{sh.shippingCost>0?fmt(sh.shippingCost):"—"}</td>
          <td style={{padding:"12px 12px"}}><StatusBadge status={sh.status}/></td>
          <td style={{padding:"12px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#8B95A9"}}>{sh.shipDate||"—"}</td>
          <td style={{padding:"12px 8px"}}><div style={{display:"flex",gap:3}}>
            {canAdv&&<button onClick={()=>advanceStatus(sh.id)} title={`→ ${SHIPMENT_STATUSES[SHIPMENT_STATUSES.indexOf(sh.status)+1]}`} style={{width:26,height:26,borderRadius:5,border:"1px solid #1E2330",background:"transparent",color:"#10B981",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{icon(I.arrowRight,13)}</button>}
            <button onClick={()=>{setEditShip(sh);setShowForm(true)}} style={{width:26,height:26,borderRadius:5,border:"1px solid #1E2330",background:"transparent",color:"#8B95A9",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{icon(I.edit,13)}</button>
            <button onClick={()=>setDeleteId(sh.id)} style={{width:26,height:26,borderRadius:5,border:"1px solid #1E2330",background:"transparent",color:"#F43F5E",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{icon(I.trash,13)}</button>
          </div></td>
        </tr>)})}
      </tbody></table>
    </div>
  </div>);
}

// ─── REPORTS PAGE ───────────────────────────────────────────────────────────
function ReportsPage({items,expenses,shipments}){
  const[selectedMonth,setSelectedMonth]=useState(td().substring(0,7));

  // Build available months from data
  const months=useMemo(()=>{
    const set=new Set();
    items.forEach(i=>{if(i.received)set.add(i.received.substring(0,7));if(i.soldDate)set.add(i.soldDate.substring(0,7))});
    expenses.forEach(e=>{if(e.date)set.add(e.date.substring(0,7))});
    return[...set].sort().reverse();
  },[items,expenses]);

  // Summary data for selected month
  const monthSold=items.filter(i=>["Sold","Shipped"].includes(i.status)&&i.soldDate?.startsWith(selectedMonth));
  const monthReceived=items.filter(i=>i.received?.startsWith(selectedMonth));
  const monthExp=expenses.filter(e=>e.date?.startsWith(selectedMonth));
  const monthShip=shipments.filter(s=>s.shipDate?.startsWith(selectedMonth));
  const rev=monthSold.reduce((s,i)=>s+(i.price||0),0);
  const cogs=monthSold.reduce((s,i)=>s+i.cost,0);
  const exp=monthExp.reduce((s,e)=>s+e.amount,0);
  const shipCost=monthShip.reduce((s,sh)=>s+sh.shippingCost,0);
  const netProfit=rev-cogs-exp-shipCost;

  const reportTypes=[
    {id:"pl",title:"Profit & Loss Report",desc:"Full P&L with revenue, COGS, expenses, and net profit breakdown by channel and category",icon:"📊",action:()=>generatePLReport(items,expenses,shipments)},
    {id:"inv",title:"Inventory Report",desc:"Complete inventory listing with aging, margins, and status for all items",icon:"📦",action:()=>generateInventoryReport(items)},
    {id:"monthly",title:"Monthly Summary",desc:`Detailed report for ${selectedMonth} including sold items, expenses, and shipping`,icon:"📅",action:()=>generateMonthlyReport(items,expenses,shipments,selectedMonth)},
  ];

  return(<div className="eve-page-pad" style={{padding:"28px 32px",display:"flex",flexDirection:"column",gap:20}}>
    {/* Month selector + stats */}
    <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        <label style={{fontSize:12,fontWeight:500,color:"#8B95A9"}}>Report Period</label>
        <select value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)} style={{...SS,width:180}}>
          {months.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="eve-grid-5" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,flex:1}}>
        {[{label:"Revenue",value:fmt(rev),color:"#6366F1"},{label:"COGS",value:fmt(cogs),color:"#8B95A9"},{label:"Expenses",value:fmt(exp+shipCost),color:"#F43F5E"},{label:"Net Profit",value:fmt(netProfit),color:netProfit>=0?"#10B981":"#F43F5E"},{label:"Items Sold",value:monthSold.length,color:"#F59E0B"}].map((s,i)=>(
          <div key={i} style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:10,padding:"14px 16px"}}><div style={{fontSize:10,color:"#5A6478",fontWeight:500,textTransform:"uppercase"}}>{s.label}</div><div style={{fontSize:20,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:-1,marginTop:4,color:s.color}}>{s.value}</div></div>
        ))}
      </div>
    </div>

    {/* Export buttons */}
    <div className="eve-grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
      {reportTypes.map(r=>(<div key={r.id} style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24,display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:24}}>{r.icon}</span><div><div style={{fontSize:15,fontWeight:600}}>{r.title}</div><div style={{fontSize:12,color:"#5A6478",marginTop:2}}>{r.desc}</div></div></div>
        <button onClick={r.action} style={{...BTN(true),justifyContent:"center",marginTop:"auto"}}>{icon(I.download,14)}Export CSV</button>
      </div>))}
    </div>

    {/* Monthly snapshot */}
    <div style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24}}>
      <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>Monthly P&L Snapshot — {selectedMonth}</div>
      <div style={{fontSize:12,color:"#5A6478",marginBottom:20}}>Quick view of financial performance</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:32,alignItems:"start"}}>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{fontSize:12,fontWeight:600,color:"#10B981",textTransform:"uppercase",marginBottom:4}}>Income</div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #1E2330"}}><span style={{fontSize:13,color:"#8B95A9"}}>Revenue ({monthSold.length} items)</span><span style={{fontSize:13,fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>{fmt(rev)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #1E2330"}}><span style={{fontSize:13,color:"#8B95A9"}}>Cost of Goods</span><span style={{fontSize:13,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:"#F87171"}}>-{fmt(cogs)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontWeight:600}}><span style={{fontSize:13}}>Gross Profit</span><span style={{fontSize:13,fontFamily:"'JetBrains Mono',monospace",color:"#34D399"}}>{fmt(rev-cogs)}</span></div>
        </div>
        <div style={{width:1,background:"#1E2330",alignSelf:"stretch"}}/>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{fontSize:12,fontWeight:600,color:"#F43F5E",textTransform:"uppercase",marginBottom:4}}>Expenses</div>
          {Object.entries(monthExp.reduce((m,e)=>{m[e.category]=(m[e.category]||0)+e.amount;return m},{})).sort((a,b)=>b[1]-a[1]).map(([cat,amt],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #1E2330"}}><span style={{fontSize:13,color:"#8B95A9"}}>{cat}</span><span style={{fontSize:13,fontFamily:"'JetBrains Mono',monospace"}}>{fmt(amt)}</span></div>
          ))}
          {shipCost>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #1E2330"}}><span style={{fontSize:13,color:"#8B95A9"}}>Shipping ({monthShip.length})</span><span style={{fontSize:13,fontFamily:"'JetBrains Mono',monospace"}}>{fmt(shipCost)}</span></div>}
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontWeight:600}}><span style={{fontSize:13}}>Net Profit</span><span style={{fontSize:13,fontFamily:"'JetBrains Mono',monospace",color:netProfit>=0?"#34D399":"#F87171"}}>{fmt(netProfit)}</span></div>
        </div>
      </div>
    </div>

    {/* Sold items for the month */}
    <div className="eve-table-wrap" style={{background:"#171B24",border:"1px solid #1E2330",borderRadius:14,padding:24}}>
      <div style={{fontSize:15,fontWeight:600,marginBottom:16}}>Items Sold — {selectedMonth}</div>
      {monthSold.length===0?<div style={{textAlign:"center",padding:32,color:"#5A6478",fontSize:13}}>No items sold this month</div>:
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr style={{borderBottom:"1px solid #1E2330"}}>{["ID","Product","Channel","Cost","Price","Profit","Margin","Sold Date"].map(h=>(<th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:11,fontWeight:600,color:"#5A6478",textTransform:"uppercase"}}>{h}</th>))}</tr></thead><tbody>
        {monthSold.map(i=>{const profit=(i.price||0)-i.cost;const margin=i.price>0?Math.round((profit/i.price)*100):0;return(<tr key={i.id} style={{borderBottom:"1px solid #1E2330"}}>
          <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#818CF8"}}>{i.id}</td>
          <td style={{padding:"10px 12px",fontWeight:500,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{i.name}</td>
          <td style={{padding:"10px 12px",color:"#8B95A9",fontSize:12}}>{i.channel||"—"}</td>
          <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#8B95A9"}}>{fmt(i.cost)}</td>
          <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:600}}>{fmt(i.price)}</td>
          <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:profit>0?"#34D399":"#F87171",fontWeight:600}}>{profit>0?"+":""}{fmt(profit)}</td>
          <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#34D399",fontWeight:600}}>{margin}%</td>
          <td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#8B95A9"}}>{i.soldDate}</td>
        </tr>)})}
      </tbody></table>}
    </div>
  </div>);
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App(){
  const[page,setPage]=useState("dashboard");
  const[sidebarOpen,setSidebarOpen]=useState(false);
  const[toastMsg,setToastMsg]=useState(null);
  const toast=(m,t)=>setToastMsg({message:m,type:t});
  const storageError=useCallback((m)=>toast(m,"error"),[]);
  const[items,saveItems,il]=useStorage("eve-items-v2",DEFAULT_ITEMS,storageError);
  const[pos,savePOs,pl]=useStorage("eve-pos-v2",DEFAULT_POS,storageError);
  const[expenses,saveExpenses,el]=useStorage("eve-expenses",DEFAULT_EXPENSES,storageError);
  const[customers,saveCustomers,cl]=useStorage("eve-customers",DEFAULT_CUSTOMERS,storageError);
  const[shipments,saveShipments,sl]=useStorage("eve-shipments",DEFAULT_SHIPMENTS,storageError);

  const alertCount=useMemo(()=>{let c=0;items.filter(i=>i.status==="Listed"&&i.price>0).forEach(i=>{if(((i.price-i.cost)/i.price)*100<20)c++});const now=new Date();items.filter(i=>i.status==="Listed").forEach(i=>{if(Math.floor((now-new Date(i.received))/(1000*60*60*24))>10)c++});items.filter(i=>["Grading","Processing"].includes(i.status)&&i.cost>100).forEach(()=>c++);return c},[items]);

  const awaitingShipCount=useMemo(()=>{const shipped=new Set(shipments.map(s=>s.itemId));return items.filter(i=>i.status==="Sold"&&!shipped.has(i.id)).length},[items,shipments]);

  const nav=[
    {id:"dashboard",label:"Dashboard",icon:I.dashboard},
    {id:"inventory",label:"Inventory",icon:I.inventory,badge:items.length},
    {id:"listings",label:"Listings",icon:I.listings},
    {id:"purchasing",label:"Purchasing",icon:I.purchasing},
    {id:"shipping",label:"Shipping",icon:I.shipping,badge:awaitingShipCount||null,badgeColor:"#F43F5E"},
    {id:"expenses",label:"Expenses",icon:I.expenses},
    {id:"customers",label:"Customers",icon:I.customers},
    {id:"analytics",label:"Analytics",icon:I.analytics},
    {id:"reports",label:"Reports",icon:I.reports},
    {id:"alerts",label:"Alerts",icon:I.alerts,badge:alertCount||null,badgeColor:"#F59E0B"},
  ];
  const titles={dashboard:["Dashboard","Overview of your recommerce operations"],inventory:["Inventory","Track items from intake to sale"],listings:["Listings","Active listings across channels"],purchasing:["Purchasing","Purchase orders and sourcing"],shipping:["Shipping","Fulfillment, tracking, and label management"],expenses:["Expenses","Track shipping, fees, and overhead"],customers:["Customers","Buyer management and CRM"],analytics:["Analytics","Performance metrics and profit analysis"],reports:["Reports","P&L, monthly summaries, and data export"],alerts:["Alerts","Warnings and action items"]};

  if(!il||!pl||!el||!cl||!sl)return(<div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",background:"#0A0C10",color:"#8B95A9",fontFamily:"'DM Sans',sans-serif"}}>Loading...</div>);

  return(
    <div className="eve-root" style={{display:"flex",height:"100vh",overflow:"hidden",background:"#0A0C10",color:"#E8ECF4",fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
        input[type=checkbox]{width:16px;height:16px;cursor:pointer}
        .eve-hamburger{display:none}
        .eve-sidebar-overlay{display:none}
        .eve-sidebar{width:220px;min-width:220px}
        .eve-header-pad{padding:18px 32px}
        .eve-page-pad{padding:28px 32px}
        @media(max-width:1024px){
          .eve-sidebar{position:fixed;left:0;top:0;bottom:0;z-index:50;transform:translateX(-100%);transition:transform 0.25s ease;width:240px;min-width:240px}
          .eve-sidebar.open{transform:translateX(0)}
          .eve-sidebar-overlay{display:block;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:49;opacity:0;pointer-events:none;transition:opacity 0.25s}
          .eve-sidebar-overlay.open{opacity:1;pointer-events:auto}
          .eve-hamburger{display:flex}
          .eve-header-pad{padding:14px 16px}
          .eve-page-pad,.eve-page-pad>div{padding-left:16px!important;padding-right:16px!important}
        }
        @media(max-width:768px){
          .eve-grid-4{grid-template-columns:repeat(2,1fr)!important}
          .eve-grid-5{grid-template-columns:repeat(2,1fr)!important}
          .eve-grid-3{grid-template-columns:1fr!important}
          .eve-grid-2{grid-template-columns:1fr!important}
          .eve-header-pad{padding:12px 14px}
          .eve-page-pad,.eve-page-pad>div{padding-left:12px!important;padding-right:12px!important}
          .eve-header-title{font-size:16px!important}
          .eve-header-sub{display:none}
        }
        @media(max-width:480px){
          .eve-grid-4{grid-template-columns:1fr 1fr!important}
          .eve-grid-5{grid-template-columns:1fr 1fr!important}
          .eve-stat-value{font-size:20px!important}
          .eve-table-wrap{font-size:12px!important}
        }
      `}</style>
      {toastMsg&&<Toast message={toastMsg.message} type={toastMsg.type} onClose={()=>setToastMsg(null)}/>}

      {/* Sidebar Overlay */}
      <div className={`eve-sidebar-overlay${sidebarOpen?" open":""}`} onClick={()=>setSidebarOpen(false)}/>

      {/* Sidebar */}
      <div className={`eve-sidebar${sidebarOpen?" open":""}`} style={{background:"#0D0F14",borderRight:"1px solid #1E2330",display:"flex",flexDirection:"column",padding:"20px 10px",gap:1,overflowY:"auto"}}>
        <div style={{padding:"8px 12px 24px",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,background:"linear-gradient(135deg,#6366F1,#EC4899)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,flexShrink:0}}>E</div>
          <div><div style={{fontSize:15,fontWeight:700,letterSpacing:-0.3,lineHeight:1.2}}>East Valley</div><div style={{fontSize:11,color:"#5A6478",fontWeight:500}}>Exchange</div></div>
        </div>
        <div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"1.2px",color:"#5A6478",padding:"10px 12px 4px"}}>Main</div>
        {nav.map(item=>(
          <button key={item.id} onClick={()=>{setPage(item.id);setSidebarOpen(false)}} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 12px",borderRadius:8,cursor:"pointer",transition:"all 0.15s",fontSize:13,border:"none",width:"100%",textAlign:"left",fontFamily:"'DM Sans',sans-serif",background:page===item.id?"rgba(99,102,241,0.12)":"transparent",color:page===item.id?"#818CF8":"#8B95A9",fontWeight:page===item.id?500:400}}>
            {icon(item.icon,17)}{item.label}
            {item.badge!=null&&<span style={{marginLeft:"auto",fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:item.badgeColor||"#5A6478",background:item.badgeColor?`${item.badgeColor}20`:"#171B24",padding:"2px 6px",borderRadius:4,fontWeight:600}}>{item.badge}</span>}
          </button>
        ))}
        <div style={{flex:1}}/>
        <div style={{padding:"14px 12px",borderTop:"1px solid #1E2330",marginTop:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#6366F1,#10B981)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600}}>EV</div>
            <div><div style={{fontSize:12,fontWeight:500}}>East Valley HQ</div><div style={{fontSize:10,color:"#5A6478"}}>Pro Plan</div></div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",minWidth:0}}>
        <div className="eve-header-pad" style={{borderBottom:"1px solid #1E2330",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(10,12,16,0.85)",backdropFilter:"blur(16px)",flexShrink:0,gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button className="eve-hamburger" onClick={()=>setSidebarOpen(!sidebarOpen)} style={{width:36,height:36,borderRadius:8,border:"1px solid #1E2330",background:"transparent",color:"#8B95A9",cursor:"pointer",alignItems:"center",justifyContent:"center",flexShrink:0}}>{icon(I.menu,20)}</button>
            <div><h1 className="eve-header-title" style={{fontSize:20,fontWeight:600,letterSpacing:-0.3,margin:0}}>{titles[page]?.[0]}</h1><p className="eve-header-sub" style={{fontSize:13,color:"#8B95A9",margin:"2px 0 0"}}>{titles[page]?.[1]}</p></div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
            {alertCount>0&&<button onClick={()=>{setPage("alerts");setSidebarOpen(false)}} style={{padding:"6px 12px",borderRadius:7,border:"1px solid rgba(245,158,11,0.3)",background:"rgba(245,158,11,0.08)",color:"#FBBF24",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6}}>{icon(I.warn,14)}{alertCount} alert{alertCount!==1?"s":""}</button>}
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",overflowX:"hidden"}}>
          {page==="dashboard"&&<DashboardPage items={items} expenses={expenses} setPage={setPage}/>}
          {page==="inventory"&&<InventoryPage items={items} saveItems={saveItems} toast={toast}/>}
          {page==="listings"&&<ListingsPage items={items} saveItems={saveItems} toast={toast}/>}
          {page==="purchasing"&&<PurchasingPage pos={pos} savePOs={savePOs} toast={toast}/>}
          {page==="shipping"&&<ShippingPage shipments={shipments} saveShipments={saveShipments} items={items} customers={customers} toast={toast}/>}
          {page==="expenses"&&<ExpensesPage expenses={expenses} saveExpenses={saveExpenses} toast={toast}/>}
          {page==="customers"&&<CustomersPage customers={customers} saveCustomers={saveCustomers} items={items} toast={toast}/>}
          {page==="analytics"&&<AnalyticsPage items={items} expenses={expenses} shipments={shipments}/>}
          {page==="reports"&&<ReportsPage items={items} expenses={expenses} shipments={shipments}/>}
          {page==="alerts"&&<AlertsPage items={items} expenses={expenses}/>}
        </div>
      </div>
    </div>
  );
}
