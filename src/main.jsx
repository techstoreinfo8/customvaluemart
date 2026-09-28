import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  onAuthStateChanged,
  RecaptchaVerifier,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPhoneNumber,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';
import { Search, ShoppingCart, User, Menu, X, Heart, Star, ChevronRight, Minus, Plus, Trash2, ArrowLeft, ShieldCheck, Phone, Mail, LogOut } from 'lucide-react';
import './styles.css';

const categories = ['All','Dals / Pulses','Biscuits','Cooking Oil','Rice','Vegetables','Fruits','Ice Cream','Groceries'];
const products = [
{id:1,name:'Toor Dal 1 kg',cat:'Dals / Pulses',price:145,old:165,rating:4.7,img:'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80',desc:'Premium quality toor dal for everyday Indian cooking.'},
{id:2,name:'Moong Dal 1 kg',cat:'Dals / Pulses',price:125,old:145,rating:4.6,img:'https://images.unsplash.com/photo-1615485737651-9b6d0c7f9f90?auto=format&fit=crop&w=900&q=80',desc:'Clean, nutritious moong dal with great taste.'},
{id:3,name:'Butter Biscuits 250 g',cat:'Biscuits',price:45,old:55,rating:4.5,img:'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=900&q=80',desc:'Crispy, buttery biscuits perfect for tea time.'},
{id:4,name:'Sunflower Oil 1 L',cat:'Cooking Oil',price:139,old:159,rating:4.6,img:'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=80',desc:'Light sunflower cooking oil for everyday meals.'},
{id:5,name:'Sona Masoori Rice 5 kg',cat:'Rice',price:329,old:379,rating:4.8,img:'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80',desc:'Everyday rice with soft texture and aromatic flavour.'},
{id:6,name:'Fresh Tomatoes 1 kg',cat:'Vegetables',price:49,old:60,rating:4.4,img:'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=80',desc:'Fresh, juicy tomatoes selected for daily cooking.'},
{id:7,name:'Fresh Bananas 1 dozen',cat:'Fruits',price:69,old:80,rating:4.6,img:'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=80',desc:'Naturally sweet bananas, freshly stocked.'},
{id:8,name:'Mangoes 1 kg',cat:'Fruits',price:119,old:149,rating:4.8,img:'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=80',desc:'Seasonal ripe mangoes with rich flavour.'},
{id:9,name:'Vanilla Ice Cream 500 ml',cat:'Ice Cream',price:189,old:220,rating:4.7,img:'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=80',desc:'Creamy vanilla ice cream for a delicious dessert.'},
{id:10,name:'Premium Tea 500 g',cat:'Groceries',price:219,old:249,rating:4.5,img:'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=900&q=80',desc:'Aromatic tea leaves for a refreshing cup every time.'},
{id:11,name:'Sugar 1 kg',cat:'Groceries',price:49,old:55,rating:4.6,img:'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=900&q=80',desc:'Fine crystal sugar for beverages and cooking.'},
{id:12,name:'Potatoes 1 kg',cat:'Vegetables',price:39,old:50,rating:4.5,img:'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80',desc:'Fresh everyday potatoes, cleaned and ready to cook.'}
];

function App(){
 const [user,setUser]=useState(null),[login,setLogin]=useState(false),[contact,setContact]=useState(''),[method,setMethod]=useState('phone'),[otp,setOtp]=useState(''),[otpSent,setOtpSent]=useState(false),[emailLinkSent,setEmailLinkSent]=useState(false),[confirmation,setConfirmation]=useState(null),[notice,setNotice]=useState('');
 const loggedIn=Boolean(user);

 React.useEffect(()=>onAuthStateChanged(auth,setUser),[]);
 React.useEffect(()=>{
   const completeEmailLogin=async()=>{
     if(!window.location.href || !window.location.href.includes('apiKey=')) return;
     if(!window.location.href.includes('mode=signIn')) return;
     const savedEmail=window.localStorage.getItem('customvaluemartEmailForSignIn');
     if(!savedEmail) return;
     try {
       await signInWithEmailLink(auth,savedEmail,window.location.href);
       window.localStorage.removeItem('customvaluemartEmailForSignIn');
       window.history.replaceState({},document.title,window.location.pathname);
       setNotice('Email login successful');
       setTimeout(()=>setNotice(''),2200);
     } catch(error) {
       setNotice(firebaseError(error));
       setTimeout(()=>setNotice(''),4000);
     }
   };
   completeEmailLogin();
 },[]);
 const firebaseError=(error)=>{
   const map={
     'auth/invalid-phone-number':'Enter a valid phone number in international format, e.g. +919876543210.',
     'auth/too-many-requests':'Too many attempts. Please wait and try again.',
     'auth/invalid-verification-code':'The OTP is incorrect. Please try again.',
     'auth/invalid-email':'Enter a valid email address.',
     'auth/operation-not-allowed':'This sign-in method is not enabled in Firebase Authentication.',
     'auth/unauthorized-domain':'Add this domain to Firebase Authentication → Settings → Authorized domains.'
   };
   return map[error?.code] || error?.message || 'Authentication failed. Please try again.';
 };
 const [cat,setCat]=useState('All'),[query,setQuery]=useState(''),[cart,setCart]=useState([]),[page,setPage]=useState('home'),[selected,setSelected]=useState(null),[menu,setMenu]=useState(false);
 const filtered=useMemo(()=>products.filter(p=>(cat==='All'||p.cat===cat)&&p.name.toLowerCase().includes(query.toLowerCase())),[cat,query]);
 const count=cart.reduce((a,x)=>a+x.qty,0),total=cart.reduce((a,x)=>a+x.price*x.qty,0);
 const add=p=>{if(!loggedIn){setLogin(true);return} setCart(c=>{const x=c.find(i=>i.id===p.id);return x?c.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...c,{...p,qty:1}]});setNotice(`${p.name} added to cart`);setTimeout(()=>setNotice(''),1800)};
 const change=(id,d)=>setCart(c=>c.map(i=>i.id===id?{...i,qty:i.qty+d}:i).filter(i=>i.qty>0));
 const sendOtp=async()=>{
   if(!contact.trim()) return setNotice(method==='phone'?'Enter your phone number.':'Enter your email address.');
   try {
     if(method==='phone'){
       if(!window.recaptchaVerifier){
         window.recaptchaVerifier=new RecaptchaVerifier(auth,'recaptcha-container',{size:'normal'});
       }
       const result=await signInWithPhoneNumber(auth,contact.trim(),window.recaptchaVerifier);
       setConfirmation(result);
       setOtpSent(true);
       setNotice('SMS OTP sent.');
     } else {
       const actionCodeSettings={url:window.location.origin,handleCodeInApp:true};
       await sendSignInLinkToEmail(auth,contact.trim(),actionCodeSettings);
       window.localStorage.setItem('customvaluemartEmailForSignIn',contact.trim());
       setEmailLinkSent(true);
       setNotice('Sign-in link sent to your email.');
     }
     setTimeout(()=>setNotice(''),3000);
   } catch(error){
     if(window.recaptchaVerifier) { try { window.recaptchaVerifier.clear(); } catch {} window.recaptchaVerifier=null; }
     setNotice(firebaseError(error));
   }
 };
 const verify=async()=>{
   if(!confirmation) return;
   try {
     await confirmation.confirm(otp.trim());
     setLogin(false); setOtpSent(false); setOtp(''); setContact(''); setConfirmation(null);
     setNotice('Login successful'); setTimeout(()=>setNotice(''),2200);
   } catch(error){ setNotice(firebaseError(error)); }
 };
 const logout=async()=>{await signOut(auth);setCart([]);setNotice('Logged out');setTimeout(()=>setNotice(''),1800)};
 const Header=()=> <header><div className="nav"><button className="icon mobile" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button><button className="logo" onClick={()=>setPage('home')}>Custom<span>Value</span>Mart</button><div className="search"><Search size={19}/><input placeholder="Search groceries, fruits, rice..." value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="actions"><button onClick={()=>setLogin(true)}><User size={20}/><span>{loggedIn?'Account':'Login'}</span></button><button onClick={()=>setPage('cart')} className="cartBtn"><ShoppingCart size={21}/><span>Cart</span>{count>0&&<b>{count}</b>}</button></div></div>{menu&&<div className="mobileMenu">{categories.map(c=><button key={c} onClick={()=>{setCat(c);setMenu(false)}}>{c}</button>)}</div>}</header>;
 const ProductCard=({p})=><article className="card"><div className="pic" onClick={()=>{setSelected(p);setPage('product')}}><img src={p.img}/><button className="heart" onClick={e=>e.stopPropagation()}><Heart size={18}/></button></div><div className="cardbody"><small>{p.cat}</small><h3 onClick={()=>{setSelected(p);setPage('product')}}>{p.name}</h3><div className="rating"><Star size={15} fill="currentColor"/> {p.rating}</div><div className="price">₹{p.price.toLocaleString('en-IN')} <del>₹{p.old.toLocaleString('en-IN')}</del></div><button className="add" onClick={()=>add(p)}>Add to Cart</button></div></article>;
 const Home=()=> <><section className="hero"><div><p className="eyebrow">YOUR DIGITAL SUPERMARKET</p><h1>Everything you need.<br/><span>Delivered with value.</span></h1><p>Browse your everyday supermarket products, compare prices, view details and shop from your phone.</p><button className="primary" onClick={()=>document.getElementById('products').scrollIntoView({behavior:'smooth'})}>Shop Groceries <ChevronRight size={18}/></button></div><div className="heroArt"><div className="orb"></div><div className="deal">DAILY<br/><strong>VALUE DEALS</strong></div></div></section><section className="category"><div className="sectionHead"><div><p className="eyebrow">EXPLORE</p><h2>Shop by category</h2></div></div><div className="chips">{categories.map(c=><button className={cat===c?'active':''} key={c} onClick={()=>{setCat(c);document.getElementById('products').scrollIntoView({behavior:'smooth'})}}>{c}</button>)}</div></section><section id="products" className="products"><div className="sectionHead"><div><p className="eyebrow">FRESHLY STOCKED</p><h2>{cat==='All'?'Popular products':cat}</h2></div><span>{filtered.length} items</span></div><div className="grid">{filtered.map(p=><ProductCard p={p} key={p.id}/>)}</div></section></>;
 const Product=()=> <section className="detail"><button className="back" onClick={()=>setPage('home')}><ArrowLeft size={18}/> Back to shopping</button><div className="detailGrid"><img src={selected.img}/><div><small>{selected.cat}</small><h1>{selected.name}</h1><div className="rating"><Star size={17} fill="currentColor"/> {selected.rating} customer rating</div><div className="bigprice">₹{selected.price.toLocaleString('en-IN')} <del>₹{selected.old.toLocaleString('en-IN')}</del></div><p>{selected.desc}</p><div className="benefits"><span>✓ Product details & pricing</span><span>✓ Easy shopping from your phone</span><span>✓ Secure checkout</span></div><button className="primary wide" onClick={()=>add(selected)}>Add to Cart</button></div></div></section>;
 const Cart=()=> <section className="cartPage"><h1>Your Cart</h1>{cart.length===0?<div className="empty"><ShoppingCart size={42}/><h2>Your cart is empty</h2><p>Browse CustomValueMart and add the items you need.</p><button className="primary" onClick={()=>setPage('home')}>Continue Shopping</button></div>:<div className="cartGrid"><div>{cart.map(i=><div className="cartItem" key={i.id}><img src={i.img}/><div className="cartInfo"><h3>{i.name}</h3><small>{i.cat}</small><div className="price">₹{i.price.toLocaleString('en-IN')}</div></div><div className="qty"><button onClick={()=>change(i.id,-1)}><Minus size={15}/></button><b>{i.qty}</b><button onClick={()=>change(i.id,1)}><Plus size={15}/></button></div><button className="delete" onClick={()=>setCart(c=>c.filter(x=>x.id!==i.id))}><Trash2 size={18}/></button></div>)}</div><aside className="summary"><h2>Order Summary</h2><div><span>Subtotal</span><b>₹{total.toLocaleString('en-IN')}</b></div><div><span>Delivery</span><b>FREE</b></div><hr/><div className="grand"><span>Total</span><b>₹{total.toLocaleString('en-IN')}</b></div><button className="primary wide" onClick={()=>loggedIn?setPage('checkout'):setLogin(true)}>Proceed to Checkout</button></aside></div>}</section>;
 const Checkout=()=> <section className="checkout"><button className="back" onClick={()=>setPage('cart')}><ArrowLeft size={18}/> Back to cart</button><h1>Checkout</h1><div className="checkoutGrid"><form onSubmit={e=>{e.preventDefault();setNotice('Order placed successfully!');setCart([]);setPage('home');setTimeout(()=>setNotice(''),2500)}}><h2>Delivery details</h2><input required placeholder="Full name"/><input required placeholder="Phone number"/><input required placeholder="Email address" type="email"/><input required placeholder="Delivery address"/><div className="two"><input required placeholder="City"/><input required placeholder="PIN code"/></div><button className="primary wide" type="submit">Place Order · ₹{total.toLocaleString('en-IN')}</button></form><aside className="summary"><h2>Items ({count})</h2>{cart.map(i=><div className="mini" key={i.id}><img src={i.img}/><span>{i.name} × {i.qty}</span><b>₹{(i.price*i.qty).toLocaleString('en-IN')}</b></div>)}</aside></div></section>;
 const LoginModal=()=> <div className="modalWrap"><div className="modal"><button className="close" onClick={()=>setLogin(false)}><X/></button>{!otpSent&&!emailLinkSent?<><div className="loginIcon"><ShieldCheck/></div><h2>Welcome to CustomValueMart</h2><p>Sign in with your phone using SMS OTP or use a passwordless email sign-in link.</p><div className="method"><button className={method==='phone'?'sel':''} onClick={()=>setMethod('phone')}><Phone size={17}/> Phone OTP</button><button className={method==='email'?'sel':''} onClick={()=>setMethod('email')}><Mail size={17}/> Email</button></div><label>{method==='phone'?'Phone number':'Email address'}</label><input autoFocus type={method==='phone'?'tel':'email'} placeholder={method==='phone'?'+91 98765 43210':'you@example.com'} value={contact} onChange={e=>setContact(e.target.value)}/>{method==='phone'&&<div id="recaptcha-container" className="recaptcha"></div>}<button id="send-otp-button" className="primary wide" onClick={sendOtp}>{method==='phone'?'Send SMS OTP':'Send Email Link'}</button><small className="hint">Phone login uses Firebase SMS + reCAPTCHA. Email login uses Firebase's one-time sign-in link.</small></>:otpSent?<><div className="loginIcon"><ShieldCheck/></div><h2>Verify your OTP</h2><p>Enter the 6-digit OTP sent to <b>{contact}</b>.</p><input className="otp" autoFocus inputMode="numeric" maxLength="6" placeholder="123456" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))}/><button className="primary wide" onClick={verify}>Verify & Login</button><button className="resend" onClick={sendOtp}>Resend SMS OTP</button></>:<><div className="loginIcon"><Mail/></div><h2>Check your email</h2><p>We sent a one-time sign-in link to <b>{contact}</b>. Open the link to finish logging in.</p><button className="resend" onClick={()=>{setEmailLinkSent(false);setMethod('email')}}>Use a different email</button></>}</div></div>;
 return <><Header/><main>{page==='home'?<Home/>:page==='product'&&selected?<Product/>:page==='cart'?<Cart/>:<Checkout/>}</main><footer><b>Custom<span>Value</span>Mart</b><p>Your digital supermarket for everyday shopping.</p><small>© 2026 CustomValueMart</small>{loggedIn&&<button className="logout" onClick={logout}><LogOut size={14}/> Logout</button>}</footer>{login&&<LoginModal/>}{notice&&<div className="toast">{notice}</div>}</>;
}
createRoot(document.getElementById('root')).render(<App/>);
