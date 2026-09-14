"use strict";
(globalThis.webpackChunkclient=globalThis.webpackChunkclient||[]).push([[605],{
2605(e,s,t){
t.r(s),t.d(s,{
default:()=>g
}
);
var i=t(2166),a=t(925),n=t(154),l=t(2040),r=t(45),c=t(3367),o=t(3580),d=t(3113),m=t(4915),h=t(422);
const x=e=>{
let{
end:s,
duration:t=2e3
}
=e;
const[a,n]=(0,i.useState)(0);
return(0,i.useEffect)(()=>{
let e=!0;
const i=Date.now(),a=()=>{
if(!e)return;
const l=Date.now()-i,r=Math.min(l/t,1);
n(Math.floor(s*r)),r<1&&requestAnimationFrame(a)
}
;
return requestAnimationFrame(a),()=>{
e=!1
}

}
,[s,t]),(0,h.jsx)("span",{
children:a
}
)
}
,g=()=>{
const[e,s]=(0,i.useState)([]),[t,g]=(0,i.useState)([]),[p,u]=(0,i.useState)([]),[j,v]=(0,i.useState)([]),[y,f]=(0,i.useState)(!0),[N]=(0,i.useState)(null),{
t:w
}
=(0,r.ok)(),b=e=>{
var s;
const t=null===e||void 0===e?void 0:e.data;
return Array.isArray(t)?t:Array.isArray(null===t||void 0===t||null===(s=t.data)||void 0===s?void 0:s.posts)?t.data.posts:Array.isArray(null===t||void 0===t?void 0:t.data)?t.data:Array.isArray(null===t||void 0===t?void 0:t.posts)?t.posts:[]
}
;
(0,i.useEffect)(()=>{
(async()=>{
try{
f(!0);
const[e,t,i,n]=await Promise.all([a.A.get("/courses").catch(()=>({
data:[]
}
)),a.A.get("/blog-posts").catch(()=>({
data:[]
}
)),a.A.get("/events").catch(()=>({
data:[]
}
)),a.A.get("/event-categories/active").catch(()=>({
data:[]
}
))]);
s(b(e)),g(b(t)),u(b(i)),v(b(n))
}
catch(N){
s([]),g([]),u([]),v([])
}
finally{
f(!1)
}

}
)()
}
,[]);
const A=function(e){
let s=arguments.length>1&&void 0!==arguments[1]?arguments[1]:120;
if(!e)return"Read this insightful article about education and learning.";
const t=e.replace(/<[^>]*>/g,"").replace(/\s+/g," ").trim();
if(t.length<=s)return t;
const i=t.substring(0,s),a=i.lastIndexOf(" ");
return a>0?i.substring(0,a)+"...":i+"..."
}
,k=e=>{
if(e.category){
if("object"===typeof e.category&&e.category.name)return e.category.name;
if("string"===typeof e.category)return e.category
}
if(e.tags){
let t=[];
if(Array.isArray(e.tags))t=e.tags;
else if("string"===typeof e.tags)try{
const s=JSON.parse(e.tags);
t=Array.isArray(s)?s:[]
}
catch(s){
t=[e.tags]
}
if(t.length>0){
const e=t[0];
if("object"===typeof e&&e.name)return e.name;
if("string"===typeof e)return e
}

}
if(e.title){
const s=e.title.toLowerCase();
if(s.includes("course")||s.includes("class")||s.includes("education"))return"Education";
if(s.includes("event")||s.includes("ceremony")||s.includes("graduation"))return"Events";
if(s.includes("news")||s.includes("announcement")||s.includes("notice"))return"News";
if(s.includes("student")||s.includes("achievement")||s.includes("award"))return"Student Life"
}
return"Education"
}
,S=()=>{
window.scrollTo({
top:0,
behavior:"smooth"
}
)
}
,C=e=>{
if(!e)return[];
const s=(t=e.id,p.length?p.filter(e=>e.category===t):[]);
var t;
if(0===s.length){
const s=e.name.toLowerCase();
return p.filter(e=>{
if(!e.title)return!1;
const t=e.title.toLowerCase();
return s.includes("course")||s.includes("class")?t.includes("course")||t.includes("class")||t.includes("education"):s.includes("admission")||s.includes("enroll")?t.includes("admission")||t.includes("enrollment")||t.includes("registration"):s.includes("training")||s.includes("workshop")?t.includes("training")||t.includes("workshop")||t.includes("seminar"):s.includes("event")||s.includes("general")?t.includes("event")||t.includes("ceremony")||t.includes("celebration"):t.includes(s)
}
)
}
return s
}
,I=e=>e.toLowerCase().replace(/[^a-z0-9]/g,"-")+"-tab";
return N?(0,h.jsx)("div",{
style:{
display:"flex",
justifyContent:"center",
alignItems:"center",
minHeight:"50vh"
}
,
children:(0,h.jsxs)("div",{
style:{
textAlign:"center",
color:"#e74c3c"
}
,
children:[(0,h.jsx)("h3",{
children:"Error Loading Content"
}
),(0,h.jsx)("p",{
children:N
}
),(0,h.jsx)("button",{
onClick:()=>window.location.reload(),
style:{
padding:"10px 20px",
backgroundColor:"#3498db",
color:"white",
border:"none",
borderRadius:"5px",
cursor:"pointer"
}
,
children:"Retry"
}
)]
}
)
}
):(0,h.jsxs)("div",{
children:[(0,h.jsx)(l.A,{
title:"\ud83c\udfdb\ufe0f Regional Polytechnic Institute Techo Sen Siem Reap | \u179c\u17b7\u1791\u17d2\u1799\u17b6\u179f\u17d2\u1790\u17b6\u1793\u1796\u17a0\u17bb\u1794\u1785\u17d2\u1785\u17c1\u1780\u1791\u17c1\u179f\u1797\u17bc\u1798\u17b7\u1797\u17b6\u1782\u178f\u17c1\u1787\u17c4\u179f\u17c2\u1793\u179f\u17c0\u1798\u179a\u17b6\u1794",
description:"\ud83c\udf93 \u179c\u17b7\u1791\u17d2\u1799\u17b6\u179f\u17d2\u1790\u17b6\u1793\u1796\u17a0\u17bb\u1794\u1785\u17d2\u1785\u17c1\u1780\u1791\u17c1\u179f\u1782\u17bb\u178e\u1797\u17b6\u1796\u1781\u17d2\u1796\u179f\u17cb \u179a\u17b6\u1787\u1792\u17b6\u1793\u17b8\u179f\u17c0\u1798\u179a\u17b6\u1794 | ISO 9001:2015 \u1794\u178e\u17d2\u178a\u17bb\u17c7\u1794\u178e\u17d2\u178a\u17b6\u179b\u1787\u17c6\u1793\u17b6\u1789\u1794\u1785\u17d2\u1785\u17c1\u1780\u1791\u17c1\u179f \u1793\u17b7\u1784\u179c\u17b7\u1787\u17d2\u1787\u17b6\u1787\u17b8\u179c\u17c8 | Quality Technical & Vocational Education in Siem Reap, Cambodia",
image:"/images/social/og-image.jpg",
keywords:"Regional Polytechnic Institute Techo Sen Siem Reap, Cambodia education, Siem Reap, technical education, vocational training, TVET",
type:"website"
}
),(0,h.jsx)("section",{
className:"slider-area",
style:{
paddingTop:"5px"
}
,
children:(0,h.jsx)("div",{
className:"single-slider d-flex align-items-center bg_cover position-relative",
style:{
backgroundImage:"url(/images/teacher-all.jpg)",
backgroundPosition:"center bottom",
backgroundSize:"cover",
backgroundRepeat:"no-repeat",
minHeight:"600px"
}
,
children:(0,h.jsx)("div",{
className:"container",
style:{
position:"relative",
zIndex:2
}

}
)
}
)
}
),(0,h.jsx)("section",{
className:"features-area single-campus",
children:(0,h.jsx)("div",{
className:"container",
children:(0,h.jsxs)("div",{
className:"features-wrapper",
children:[(0,h.jsx)("div",{
className:"row justify-content-end",
children:(0,h.jsx)("div",{
className:"col-lg-8",
children:(0,h.jsxs)("h2",{
className:"features-title",
children:["Visit our ",(0,h.jsxs)("span",{
children:["Campus ",(0,h.jsx)("br",{

}
)," with"]
}
)," Image Gallery"]
}
)
}
)
}
),(0,h.jsx)("div",{
className:"row justify-content-end",
children:(0,h.jsx)("div",{
className:"col-lg-11",
children:(0,h.jsx)("div",{
className:"features-image",
children:(0,h.jsx)("img",{
className:"campus-image",
src:"images/gallery/school.jpg",
width:"1061",
height:"387",
alt:"Campus gallery"
}
)
}
)
}
)
}
)]
}
)
}
)
}
),(0,h.jsx)("section",{
className:"top-courses-area",
children:(0,h.jsxs)("div",{
className:"container",
children:[(0,h.jsx)("div",{
className:"row",
children:(0,h.jsx)("div",{
className:"col-lg-8",
children:(0,h.jsxs)("div",{
className:"section-title mt-40",
children:[(0,h.jsx)("h2",{
className:"title",
children:w("home.topCourses")
}
),(0,h.jsx)("p",{
children:w("home.coursesDescription")
}
)]
}
)
}
)
}
),(0,h.jsx)("div",{
className:"courses-wrapper",
children:(0,h.jsx)("div",{
className:"row",
children:y?Array.from({
length:4
}
).map((e,s)=>(0,h.jsx)("div",{
className:"col-lg-3 col-sm-6 courses-col",
children:(0,h.jsx)(o.A,{
type:"card",
count:1
}
)
}
,s)):e.length>0?e.map((e,s)=>(0,h.jsx)("div",{
className:"col-lg-3 col-sm-6 courses-col",
children:(0,h.jsx)(c.A,{
delay:.1*s,
direction:"up",
children:(0,h.jsxs)("div",{
className:"single-courses mt-30",
children:[e.imageUrl&&(0,h.jsx)("div",{
className:"courses-image",
style:{
marginBottom:"15px"
}
,
children:(0,h.jsx)(d.A,{
src:(0,m.VG)(e.imageUrl,"course"),
alt:e.title,
style:{
width:"100%",
height:"150px",
objectFit:"cover",
borderRadius:"8px",
display:"block"
}

}
)
}
),(0,h.jsxs)(n.N_,{
to:`/courses-details/${
e.id
}
`,
className:"category",
children:["#",e.title.split(" ")[0]]
}
),(0,h.jsx)("h4",{
className:"courses-title",
children:(0,h.jsx)(n.N_,{
to:`/courses-details/${
e.id
}
`,
children:e.title
}
)
}
),(0,h.jsxs)("div",{
className:"duration-fee",
children:[(0,h.jsxs)("p",{
className:"duration",
children:["Duration: ",(0,h.jsxs)("span",{
children:[" ",e.duration]
}
)]
}
),(0,h.jsxs)("p",{
className:"fee",
children:["Fee: ",(0,h.jsxs)("span",{
children:[" $",e.fee]
}
)]
}
)]
}
),(0,h.jsxs)("div",{
className:"courses-link",
children:[(0,h.jsx)(n.N_,{
className:"apply",
to:"/register",
children:"Online Apply"
}
),(0,h.jsxs)(n.N_,{
className:"more",
to:`/courses-details/${
e.id
}
`,
children:["Read more ",(0,h.jsx)("i",{
className:"fal fa-chevron-right"
}
)]
}
)]
}
)]
}
)
}
)
}
,e.id)):(0,h.jsx)("div",{
className:"col-12 text-center",
children:(0,h.jsx)("p",{
children:"No courses available at the moment."
}
)
}
)
}
)
}
)]
}
)
}
),(0,h.jsx)("section",{
className:"specialty-area",
children:(0,h.jsx)("div",{
className:"container",
children:(0,h.jsxs)("div",{
className:"row no-gutters wow fadeInUpBig","data-wow-duration":"1s","data-wow-delay":"0.2s",
children:[(0,h.jsx)("div",{
className:"col-sm-4",
children:(0,h.jsx)("div",{
className:"single-specialty mt-30",
children:(0,h.jsxs)("div",{
className:"specialty-box",
children:[(0,h.jsx)("div",{
className:"box-icon",
children:(0,h.jsx)("img",{
src:"images/icon/icon-1.webp",
width:"70",
height:"70",
alt:"icon"
}
)
}
),(0,h.jsx)("div",{
className:"box-content",
children:(0,h.jsx)("p",{
children:"Skill Based Scholarships"
}
)
}
)]
}
)
}
)
}
),(0,h.jsx)("div",{
className:"col-sm-4",
children:(0,h.jsx)("div",{
className:"single-specialty active mt-30",
children:(0,h.jsxs)("div",{
className:"specialty-box",
children:[(0,h.jsx)("div",{
className:"box-icon",
children:(0,h.jsx)("img",{
src:"images/icon/icon-2.webp",
width:"70",
height:"70",
alt:"icon"
}
)
}
),(0,h.jsx)("div",{
className:"box-content",
children:(0,h.jsx)("p",{
children:"Download Prospectus"
}
)
}
)]
}
)
}
)
}
),(0,h.jsx)("div",{
className:"col-sm-4",
children:(0,h.jsx)("div",{
className:"single-specialty mt-30",
children:(0,h.jsxs)("div",{
className:"specialty-box",
children:[(0,h.jsx)("div",{
className:"box-icon",
children:(0,h.jsx)("img",{
src:"images/icon/icon-3.webp",
width:"70",
height:"70",
alt:"icon"
}
)
}
),(0,h.jsx)("div",{
className:"box-content",
children:(0,h.jsx)("p",{
children:"After Course Certification"
}
)
}
)]
}
)
}
)
}
)]
}
)
}
)
}
),(0,h.jsx)("section",{
className:"campus-visit-area",
children:(0,h.jsx)("div",{
className:"container",
children:(0,h.jsxs)("div",{
className:"campus-visit-wrapper",
children:[(0,h.jsx)("div",{
className:"campus-image-col",
children:(0,h.jsx)("div",{
className:"campus-image",
children:(0,h.jsx)("div",{
className:" single-campus",
children:(0,h.jsx)("img",{
src:"images/gallery/gallery 7.jpg",
width:"521",
height:"392",
alt:"Campus"
}
)
}
)
}
)
}
),(0,h.jsx)("div",{
className:"campus-content-col",
children:(0,h.jsxs)("div",{
className:"campus-content",
children:[(0,h.jsx)("h2",{
className:"campus-title",
children:"Visit our Campus with image gallery"
}
),(0,h.jsx)("span",{
className:"line"
}
),(0,h.jsx)("p",{
children:"If you are looking for something truly valuable, even the smallest detail matters \u2014 choose from our carefully curated list of courses."
}
),(0,h.jsx)("h3",{
className:"video-title",
children:"or watch video"
}
),(0,h.jsxs)("a",{
className:"play video-popup",
href:"https://www.youtube.com/watch?v=v7dNbyovCxM",
children:[(0,h.jsx)("i",{
className:"fas fa-play"
}
)," ",(0,h.jsx)("span",{
children:"Play now"
}
)]
}
)]
}
)
}
)]
}
)
}
)
}
),(0,h.jsx)("section",{
className:"event-area",
children:(0,h.jsxs)("div",{
className:"container",
children:[(0,h.jsxs)("div",{
className:"event-title-tab-menu",
children:[(0,h.jsx)("div",{
className:"event-title mt-40",
children:(0,h.jsx)("h2",{
className:"title",
children:w("home.upcomingEventsTitle")
}
)
}
),(0,h.jsx)("div",{
className:"event-tab-menu mt-40",
children:(0,h.jsx)("ul",{
className:"nav",
children:j.length>0?j.slice(0,6).map((e,s)=>(0,h.jsx)("li",{
children:(0,h.jsx)("a",{
className:0===s?"active":"","data-bs-toggle":"tab",
href:`#${
I(e.name)
}
`,
children:e.name
}
)
}
,e.id)):(0,h.jsx)("li",{
children:(0,h.jsx)("a",{
className:"active","data-bs-toggle":"tab",
href:"#all-events-tab",
children:"All Events"
}
)
}
)
}
)
}
)]
}
),(0,h.jsxs)("div",{
className:"tab-content event-tab-items wow fadeInUpBig","data-wow-duration":"1s","data-wow-delay":"0.2s",
children:[j.length>0?j.slice(0,6).map((e,s)=>{
const t=C(e);
return(0,h.jsx)("div",{
className:"tab-pane fade "+(0===s?"show active":""),
id:I(e.name),
children:(0,h.jsx)("div",{
className:"row",
children:y?Array.from({
length:4
}
).map((e,s)=>(0,h.jsx)("div",{
className:"col-lg-3 col-sm-6",
children:(0,h.jsx)(o.A,{
type:"card",
count:1
}
)
}
,s)):t.length>0?t.slice(0,4).map((e,s)=>(0,h.jsx)(c.A,{
delay:.1*s,
direction:"up",
children:(0,h.jsx)("div",{
className:"col-lg-3 col-sm-6",
children:(0,h.jsxs)("div",{
className:"single-event text-center mt-30",
children:[(0,h.jsx)("span",{
className:"time",
children:e.time||"TBD"
}
),(0,h.jsx)("span",{
className:"date",
children:e.date?new Date(e.date).toLocaleDateString():"TBD"
}
),(0,h.jsx)("h4",{
className:"event-title",
children:(0,h.jsx)(n.N_,{
to:`/event-details/${
e.id
}
`,
children:e.title
}
)
}
),(0,h.jsxs)("p",{
className:"place",
children:[w("home.place"),": ",e.place||"TBD"]
}
),(0,h.jsxs)(n.N_,{
to:`/event-details/${
e.id
}
`,
className:"more",
children:[w("home.readMore")," ",(0,h.jsx)("i",{
className:"far fa-chevron-right"
}
)]
}
)]
}
)
}
)
}
,e.id)):(0,h.jsx)("div",{
className:"col-12 text-center",
children:(0,h.jsxs)("div",{
className:"no-events-message mt-30",
children:[(0,h.jsx)("i",{
className:"fas fa-calendar-times",
style:{
fontSize:"48px",
color:"#ddd",
marginBottom:"20px"
}

}
),(0,h.jsxs)("h5",{
children:["No ",e.name," Events Available"]
}
),(0,h.jsxs)("p",{
children:["Check back later for upcoming ",e.name.toLowerCase(),"-related events."]
}
)]
}
)
}
)
}
)
}
,e.id)
}
):(0,h.jsx)("div",{
className:"tab-pane fade show active",
id:"all-events-tab",
children:(0,h.jsx)("div",{
className:"row",
children:y?Array.from({
length:4
}
).map((e,s)=>(0,h.jsx)("div",{
className:"col-lg-3 col-sm-6",
children:(0,h.jsx)(o.A,{
type:"card",
count:1
}
)
}
,s)):p.length>0?p.slice(0,4).map(e=>(0,h.jsx)("div",{
className:"col-lg-3 col-sm-6",
children:(0,h.jsxs)("div",{
className:"single-event text-center mt-30",
children:[(0,h.jsx)("span",{
className:"time",
children:e.time||"TBD"
}
),(0,h.jsx)("span",{
className:"date",
children:e.date?new Date(e.date).toLocaleDateString():"TBD"
}
),(0,h.jsx)("h4",{
className:"event-title",
children:(0,h.jsx)(n.N_,{
to:`/event-details/${
e.id
}
`,
children:e.title
}
)
}
),(0,h.jsxs)("p",{
className:"place",
children:[w("home.place"),": ",e.place||"TBD"]
}
),(0,h.jsxs)(n.N_,{
to:`/event-details/${
e.id
}
`,
className:"more",
children:[w("home.readMore")," ",(0,h.jsx)("i",{
className:"far fa-chevron-right"
}
)]
}
)]
}
)
}
,e.id)):(0,h.jsx)("div",{
className:"col-12 text-center",
children:(0,h.jsxs)("div",{
className:"no-events-message mt-30",
children:[(0,h.jsx)("i",{
className:"fas fa-calendar-times",
style:{
fontSize:"48px",
color:"#ddd",
marginBottom:"20px"
}

}
),(0,h.jsx)("h5",{
children:"No Events Available"
}
),(0,h.jsx)("p",{
children:"Check back later for upcoming events."
}
)]
}
)
}
)
}
)
}
),(0,h.jsx)("div",{
className:"view-btn text-center",
children:(0,h.jsxs)(n.N_,{
to:"/events",
className:"view-more",
children:[w("home.viewMore")," ",(0,h.jsx)("i",{
className:"fal fa-chevron-right"
}
)]
}
)
}
)]
}
),(0,h.jsx)("div",{
style:{
height:"50px"
}

}
)]
}
)
}
),(0,h.jsx)("div",{
className:"counter-area",
children:(0,h.jsx)("div",{
className:"container",
children:(0,h.jsx)("div",{
className:"counter-wrapper bg_cover",
style:{
backgroundImage:"url(/images/counter-bg.webp)"
}
,
children:(0,h.jsxs)("div",{
className:"row",
children:[(0,h.jsx)("div",{
className:"col-sm-3 col-6 counter-col",
children:(0,h.jsxs)("div",{
className:"single-counter mt-30 wow fadeInLeftBig","data-wow-duration":"1s","data-wow-delay":"0.2s",
children:[(0,h.jsxs)("span",{
className:"counter-count",
children:[(0,h.jsx)(x,{
end:3652,
duration:2e3
}
)," +"]
}
),(0,h.jsx)("p",{
children:"Students"
}
)]
}
)
}
),(0,h.jsx)("div",{
className:"col-sm-3 col-6 counter-col",
children:(0,h.jsxs)("div",{
className:"single-counter mt-30 wow fadeInLeftBig","data-wow-duration":"1s","data-wow-delay":"0.4s",
children:[(0,h.jsxs)("span",{
className:"counter-count",
children:[(0,h.jsx)(x,{
end:105,
duration:2e3
}
)," +"]
}
),(0,h.jsx)("p",{
children:"Faculties"
}
)]
}
)
}
),(0,h.jsx)("div",{
className:"col-sm-3 col-6 counter-col",
children:(0,h.jsxs)("div",{
className:"single-counter mt-30 wow fadeInLeftBig","data-wow-duration":"1s","data-wow-delay":"0.6s",
children:[(0,h.jsxs)("span",{
className:"counter-count",
children:[(0,h.jsx)(x,{
end:120,
duration:2e3
}
)," +"]
}
),(0,h.jsx)("p",{
children:"Branches"
}
)]
}
)
}
),(0,h.jsx)("div",{
className:"col-sm-3 col-6 counter-col",
children:(0,h.jsxs)("div",{
className:"single-counter mt-30 wow fadeInLeftBig","data-wow-duration":"1s","data-wow-delay":"0.8s",
children:[(0,h.jsxs)("span",{
className:"counter-count",
children:[(0,h.jsx)(x,{
end:30,
duration:2e3
}
)," +"]
}
),(0,h.jsx)("p",{
children:"Awards win"
}
)]
}
)
}
)]
}
)
}
)
}
)
}
),(0,h.jsx)("section",{
className:"blog-area modern-blog",
children:(0,h.jsxs)("div",{
className:"container",
children:[(0,h.jsx)("div",{
className:"row justify-content-center",
children:(0,h.jsx)("div",{
className:"col-lg-8 col-md-10",
children:(0,h.jsxs)("div",{
className:"section-title-2 text-center",
children:[(0,h.jsx)("h2",{
className:"title",
children:w("home.latestNews")
}
),(0,h.jsx)("span",{
className:"line"
}
),(0,h.jsx)("p",{
children:w("home.latestNewsDescription")
}
)]
}
)
}
)
}
),(0,h.jsxs)("div",{
className:"blog-wrapper",
children:[(0,h.jsx)("div",{
className:"row blog-cards-row",
children:y?Array.from({
length:3
}
).map((e,s)=>(0,h.jsx)("div",{
className:"col-lg-4 col-md-6 blog-card-col",
children:(0,h.jsx)(o.A,{
type:"card",
count:1
}
)
}
,s)):t.slice(0,3).map((e,s)=>(0,h.jsx)("div",{
className:"col-lg-4 col-md-6 blog-card-col",
children:(0,h.jsx)(c.A,{
delay:.15*s,
direction:"up",
children:(0,h.jsxs)("div",{
className:"modern-blog-card "+(0===s?"featured":""),
children:[(0,h.jsxs)("div",{
className:"blog-image-wrapper",
children:[(0,h.jsx)(n.N_,{
to:`/blog-details/${
e.id
}
`,
onClick:S,
children:(0,h.jsx)(d.A,{
src:(0,m.VG)(e.imageUrl)||"/images/blog-placeholder.jpg",
alt:e.title||"Blog post",
fallbackSrc:"/images/blog-placeholder.jpg",
style:{
width:"100%",
height:"100%",
objectFit:"cover"
}

}
)
}
),(0,h.jsx)("div",{
className:"blog-category",
children:(0,h.jsx)("span",{
children:k(e)
}
)
}
)]
}
),(0,h.jsxs)("div",{
className:"blog-content-wrapper",
children:[(0,h.jsxs)("div",{
className:"blog-meta",
children:[(0,h.jsxs)("div",{
className:"meta-item",
children:[(0,h.jsx)("i",{
className:"fas fa-calendar"
}
),(0,h.jsx)("span",{
children:(()=>{
const s=e.publishedAt||e.createdAt;
if(!s)return"N/A";
const t=new Date(s);
return isNaN(t.getTime())?"N/A":t.toLocaleDateString("en-US",{
month:"short",
day:"numeric",
year:"numeric"
}
)
}
)()
}
)]
}
),(0,h.jsxs)("div",{
className:"meta-item",
children:[(0,h.jsx)("i",{
className:"fas fa-user"
}
),(0,h.jsx)("span",{
children:e.author
}
)]
}
)]
}
),(0,h.jsx)("h4",{
className:"blog-title",
children:(0,h.jsx)(n.N_,{
to:`/blog-details/${
e.id
}
`,
onClick:S,
children:e.title
}
)
}
),(0,h.jsx)("p",{
className:"blog-excerpt",
children:A(e.content)
}
),(0,h.jsxs)("div",{
className:"blog-footer",
children:[(0,h.jsxs)(n.N_,{
to:`/blog-details/${
e.id
}
`,
className:"read-more-btn",
onClick:S,
children:[w("home.readMore")," ",(0,h.jsx)("i",{
className:"fas fa-arrow-right"
}
)]
}
),(0,h.jsx)("div",{
className:"blog-engagement",
children:(0,h.jsxs)("span",{
className:"comments-count",
children:[(0,h.jsx)("i",{
className:"fas fa-comments"
}
),e.comments?e.comments.length:0]
}
)
}
)]
}
)]
}
)]
}
)
}
)
}
,e.id))
}
),t.length>3&&(0,h.jsx)("div",{
className:"row mt-4",
children:(0,h.jsx)("div",{
className:"col-12 text-center",
children:(0,h.jsxs)(n.N_,{
to:"/blog",
className:"view-all-blogs-btn",
onClick:S,
children:[w("home.viewAllNews"),(0,h.jsx)("i",{
className:"fas fa-arrow-right ml-2"
}
)]
}
)
}
)
}
)]
}
)]
}
)
}
),(0,h.jsx)("div",{
style:{
height:"50px"
}

}
)]
}
)
}

}
,2040(e,s,t){
t.d(s,{
A:()=>n
}
);
t(2166);
var i=t(2014),a=t(422);
const n=e=>{
let{
title:s="\u179c\u17b7\u1791\u17d2\u1799\u17b6\u179f\u17d2\u1790\u17b6\u1793\u1796\u17a0\u17bb\u1794\u1785\u17d2\u1785\u17c1\u1780\u1791\u17c1\u179f\u1797\u17bc\u1798\u17b7\u1797\u17b6\u1782\u178f\u17c1\u1787\u17c4\u179f\u17c2\u1793\u179f\u17c0\u1798\u179a\u17b6\u1794 - Regional Polytechnic Institute Techo Sen Siem Reap",
description:t="\ud83c\udf93 \u179c\u17b7\u1791\u17d2\u1799\u17b6\u179f\u17d2\u1790\u17b6\u1793\u1796\u17a0\u17bb\u1794\u1785\u17d2\u1785\u17c1\u1780\u1791\u17c1\u179f\u1782\u17bb\u178e\u1797\u17b6\u1796\u1781\u17d2\u1796\u179f\u17cb \u179a\u17b6\u1787\u1792\u17b6\u1793\u17b8\u179f\u17c0\u1798\u179a\u17b6\u1794 | ISO 9001:2015 \u1794\u178e\u17d2\u178a\u17bb\u17c7\u1794\u178e\u17d2\u178a\u17b6\u179b\u1787\u17c6\u1793\u17b6\u1789\u1794\u1785\u17d2\u1785\u17c1\u1780\u1791\u17c1\u179f \u1793\u17b7\u1784\u179c\u17b7\u1787\u17d2\u1787\u17b6\u1787\u17b8\u179c\u17c8 | Regional Polytechnic Institute Techo Sen Siem Reap - Quality Technical & Vocational Education",
image:n="/images/social/og-image.jpg",
url:l="",
type:r="website",
keywords:c="",
author:o="Regional Polytechnic Institute Techo Sen Siem Reap",
publishedTime:d="",
modifiedTime:m="",
section:h="",
tags:x=[]
}
=e;
const g=l||window.location.href,p=n.startsWith("http")?n:`https://www.rpitssr.edu.kh${
n
}
`;
return(0,a.jsxs)(i.mg,{
children:[(0,a.jsx)("title",{
children:s
}
),(0,a.jsx)("meta",{
name:"description",
content:t
}
),c&&(0,a.jsx)("meta",{
name:"keywords",
content:c
}
),(0,a.jsx)("meta",{
name:"author",
content:o
}
),(0,a.jsx)("meta",{
property:"og:type",
content:r
}
),(0,a.jsx)("meta",{
property:"og:title",
content:s
}
),(0,a.jsx)("meta",{
property:"og:description",
content:t
}
),(0,a.jsx)("meta",{
property:"og:image",
content:p
}
),(0,a.jsx)("meta",{
property:"og:image:alt",
content:s
}
),(0,a.jsx)("meta",{
property:"og:image:type",
content:"image/jpeg"
}
),(0,a.jsx)("meta",{
property:"og:image:width",
content:"1200"
}
),(0,a.jsx)("meta",{
property:"og:image:height",
content:"630"
}
),(0,a.jsx)("meta",{
property:"og:url",
content:g
}
),(0,a.jsx)("meta",{
property:"og:site_name",
content:"Regional Polytechnic Institute Techo Sen Siem Reap"
}
),(0,a.jsx)("meta",{
property:"og:locale",
content:"km_KH"
}
),(0,a.jsx)("meta",{
property:"og:locale:alternate",
content:"en_US"
}
),(0,a.jsx)("meta",{
name:"twitter:card",
content:"summary_large_image"
}
),(0,a.jsx)("meta",{
name:"twitter:site",
content:"@rpitssr"
}
),(0,a.jsx)("meta",{
name:"twitter:creator",
content:"@rpitssr"
}
),(0,a.jsx)("meta",{
name:"twitter:title",
content:s
}
),(0,a.jsx)("meta",{
name:"twitter:description",
content:t
}
),(0,a.jsx)("meta",{
name:"twitter:image",
content:p
}
),(0,a.jsx)("meta",{
name:"twitter:image:alt",
content:s
}
),"article"===r&&d&&(0,a.jsx)("meta",{
property:"article:published_time",
content:d
}
),"article"===r&&m&&(0,a.jsx)("meta",{
property:"article:modified_time",
content:m
}
),"article"===r&&h&&(0,a.jsx)("meta",{
property:"article:section",
content:h
}
),"article"===r&&(0,a.jsx)("meta",{
property:"article:publisher",
content:"https://www.facebook.com/rpitssr"
}
),"article"===r&&x.map(e=>(0,a.jsx)("meta",{
property:"article:tag",
content:e
}
,e)),(0,a.jsx)("link",{
rel:"canonical",
href:g
}
),(0,a.jsx)("meta",{
name:"robots",
content:"index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
}
)]
}
)
}

}
,3367(e,s,t){
t.d(s,{
A:()=>l
}
);
t(2166);
var i=t(7051),a=t(1362),n=t(422);
const l=e=>{
let{
children:s,
direction:t="up",
delay:l=0,
duration:r=.6,
className:c=""
}
=e;
const[o,d]=(0,a.Wx)({
triggerOnce:!0,
threshold:.1
}
),m={
hidden:{
opacity:0,...{
up:{
y:40
}
,
down:{
y:-40
}
,
left:{
x:40
}
,
right:{
x:-40
}

}
[t]
}
,
visible:{
opacity:1,
x:0,
y:0,
transition:{
duration:r,
delay:l,
ease:[.25,.46,.45,.94]
}

}

}
;
return(0,n.jsx)(i.P.div,{
ref:o,
initial:"hidden",
animate:d?"visible":"hidden",
variants:m,
className:c,
children:s
}
)
}

}
,3113(e,s,t){
t.d(s,{
A:()=>n
}
);
var i=t(2166),a=t(422);
const n=e=>{
let{
src:s,
alt:t,
className:n="",
style:l={

}
,
placeholderColor:r="#f0f0f0",
blurAmount:c="20px",
fallbackSrc:o="/images/blog-placeholder.jpg",...d
}
=e;
const[m,h]=(0,i.useState)(null),[x,g]=(0,i.useState)(!1),[p,u]=(0,i.useState)(!1);
return(0,i.useEffect)(()=>{
u(!1),g(!1)
}
,[s,o]),p?(0,a.jsx)("div",{
className:n,
style:{
...l,
backgroundColor:r,
display:"flex",
alignItems:"center",
justifyContent:"center",
color:"#999",
fontSize:"14px"
}
,
children:(0,a.jsx)("span",{
children:"Image not available"
}
)
}
):(0,a.jsxs)("div",{
style:{
position:"relative",
overflow:"hidden",...l
}
,
className:n,
children:[!x&&!p&&(0,a.jsx)("div",{
style:{
position:"absolute",
top:0,
left:0,
width:"100%",
height:"100%",
backgroundColor:r,
animation:"pulse 1.5s ease-in-out infinite",
zIndex:1
}
,
children:(0,a.jsx)("div",{
style:{
width:"100%",
height:"100%",
background:"linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)",
animation:"shimmer 2s infinite"
}

}
)
}
),(0,a.jsx)("img",{
src:p?o:s,
alt:t,
onLoad:()=>g(!0),
onError:()=>{
p||s===o||u(!0)
}
,
style:{
width:"100%",
height:"100%",
objectFit:"cover",
opacity:x?1:0,
filter:x?"blur(0)":`blur(${
c
}
)`,
transition:"opacity 0.5s ease-in-out, filter 0.5s ease-in-out",
display:"block"
}
,...d
}
),(0,a.jsx)("style",{
children:"\n          @keyframes pulse {
\n            0%, 100% {
 opacity: 1;
 
}
\n            50% {
 opacity: 0.5;
 
}
\n          
}
\n          \n          @keyframes shimmer {
\n            0% {
 transform: translateX(-100%);
 
}
\n            100% {
 transform: translateX(100%);
 
}
\n          
}
\n        "
}
)]
}
)
}

}
,3580(e,s,t){
t.d(s,{
A:()=>a
}
);
t(2166);
var i=t(422);
const a=e=>{
let{
type:s="card",
count:t=1
}
=e;
const a={
backgroundColor:"#e0e0e0",
borderRadius:"4px",
animation:"pulse 1.5s ease-in-out infinite"
}
,n=()=>(0,i.jsxs)("div",{
style:{
border:"1px solid #f0f0f0",
borderRadius:"8px",
padding:"20px",
marginBottom:"20px",
backgroundColor:"#fff"
}
,
children:[(0,i.jsx)("div",{
style:{
...a,
height:"200px",
marginBottom:"15px"
}

}
),(0,i.jsx)("div",{
style:{
...a,
height:"24px",
width:"80%",
marginBottom:"10px"
}

}
),(0,i.jsx)("div",{
style:{
...a,
height:"16px",
width:"100%",
marginBottom:"8px"
}

}
),(0,i.jsx)("div",{
style:{
...a,
height:"16px",
width:"90%",
marginBottom:"8px"
}

}
),(0,i.jsx)("div",{
style:{
...a,
height:"40px",
width:"120px",
marginTop:"15px"
}

}
)]
}
),l=()=>{
switch(s){
case"card":default:return n();
case"text":return(0,i.jsxs)("div",{
style:{
marginBottom:"15px"
}
,
children:[(0,i.jsx)("div",{
style:{
...a,
height:"20px",
width:"100%",
marginBottom:"8px"
}

}
),(0,i.jsx)("div",{
style:{
...a,
height:"20px",
width:"95%",
marginBottom:"8px"
}

}
),(0,i.jsx)("div",{
style:{
...a,
height:"20px",
width:"88%"
}

}
)]
}
);
case"list":return(0,i.jsxs)("div",{
style:{
border:"1px solid #f0f0f0",
borderRadius:"8px",
padding:"15px",
marginBottom:"10px",
backgroundColor:"#fff",
display:"flex",
alignItems:"center",
gap:"15px"
}
,
children:[(0,i.jsx)("div",{
style:{
...a,
width:"50px",
height:"50px",
borderRadius:"50%",
flexShrink:0
}

}
),(0,i.jsxs)("div",{
style:{
flex:1
}
,
children:[(0,i.jsx)("div",{
style:{
...a,
height:"16px",
width:"60%",
marginBottom:"8px"
}

}
),(0,i.jsx)("div",{
style:{
...a,
height:"14px",
width:"40%"
}

}
)]
}
)]
}
)
}

}
;
return(0,i.jsxs)(i.Fragment,{
children:[(0,i.jsx)("style",{
children:"\n          @keyframes pulse {
\n            0%, 100% {
\n              opacity: 1;
\n            
}
\n            50% {
\n              opacity: 0.5;
\n            
}
\n          
}
\n        "
}
),Array.from({
length:t
}
).map((e,s)=>(0,i.jsx)("div",{
children:l()
}
,s))]
}
)
}

}
,4915(e,s,t){
t.d(s,{
VG:()=>n
}
);
var i=t(925);
t(422);
const a={
blog:"/images/blog-1.webp",
blogDetails:"/images/blog-details.webp",
gallery:"/images/gallery/gallery 1.jpg",
course:"/images/courses/Course 3.jpg",
teacher:"/images/blog-1.webp",
general:"/images/blog-1.webp"
}
,n=function(e){
if(!e)return a[arguments.length>1&&void 0!==arguments[1]?arguments[1]:"general"]||a.general;
const s=e.replace(/\\/g,"/");
if(s.startsWith("http://")||s.startsWith("https://"))return s;
if(s.startsWith("/uploads/")){
const e=`${
i.J
}
${
s
}
`;
return console.log("[ImageUtils] Converting upload path:",s,"\u2192",e),e
}
if(s.startsWith("uploads/")){
const e=`${
i.J
}
/${
s
}
`;
return console.log("[ImageUtils] Converting upload path (no slash):",s,"\u2192",e),e
}
if(s.startsWith("/images/"))return s;
const t=`${
i.J
}
/uploads/${
s
}
`;
return console.log("[ImageUtils] Default conversion:",s,"\u2192",t),t
}

}
,1362(e,s,t){
t.d(s,{
Wx:()=>h
}
);
var i=t(2166),a=Object.defineProperty,n=(e,s,t)=>((e,s,t)=>s in e?a(e,s,{
enumerable:!0,
configurable:!0,
writable:!0,
value:t
}
):e[s]=t)(e,"symbol"!==typeof s?s+"":s,t),l=new Map,r=new WeakMap,c=0,o=void 0;
function d(e){
return Object.keys(e).sort().filter(s=>void 0!==e[s]).map(s=>{
return`${
s
}
_${
"root"===s?(t=e.root,t?(r.has(t)||(c+=1,r.set(t,c.toString())),r.get(t)):"0"):e[s]
}
`;
var t
}
).toString()
}
function m(e,s){
let t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{

}
,i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:o;
if("undefined"===typeof window.IntersectionObserver&&void 0!==i){
const a=e.getBoundingClientRect();
return s(i,{
isIntersecting:i,
target:e,
intersectionRatio:"number"===typeof t.threshold?t.threshold:0,
time:0,
boundingClientRect:a,
intersectionRect:a,
rootBounds:a
}
),()=>{

}

}
const{
id:a,
observer:n,
elements:r
}
=function(e){
const s=d(e);
let t=l.get(s);
if(!t){
const i=new Map;
let a;
const n=new IntersectionObserver(s=>{
s.forEach(s=>{
var t;
const n=s.isIntersecting&&a.some(e=>s.intersectionRatio>=e);
e.trackVisibility&&"undefined"===typeof s.isVisible&&(s.isVisible=n),null==(t=i.get(s.target))||t.forEach(e=>{
e(n,s)
}
)
}
)
}
,e);
a=n.thresholds||(Array.isArray(e.threshold)?e.threshold:[e.threshold||0]),t={
id:s,
observer:n,
elements:i
}
,l.set(s,t)
}
return t
}
(t),c=r.get(e)||[];
return r.has(e)||r.set(e,c),c.push(s),n.observe(e),function(){
c.splice(c.indexOf(s),1),0===c.length&&(r.delete(e),n.unobserve(e)),0===r.size&&(n.disconnect(),l.delete(a))
}

}
i.Component;
function h(){
let{
threshold:e,
delay:s,
trackVisibility:t,
rootMargin:a,
root:n,
triggerOnce:l,
skip:r,
initialInView:c,
fallbackInView:o,
onChange:d
}
=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{

}
;
var h;
const[x,g]=i.useState(null),p=i.useRef(d),[u,j]=i.useState({
inView:!!c,
entry:void 0
}
);
p.current=d,i.useEffect(()=>{
if(r||!x)return;
let i;
return i=m(x,(e,s)=>{
j({
inView:e,
entry:s
}
),p.current&&p.current(e,s),s.isIntersecting&&l&&i&&(i(),i=void 0)
}
,{
root:n,
rootMargin:a,
threshold:e,
trackVisibility:t,
delay:s
}
,o),()=>{
i&&i()
}

}
,[Array.isArray(e)?e.toString():e,x,n,a,l,r,t,o,s]);
const v=null==(h=u.entry)?void 0:h.target,y=i.useRef(void 0);
x||!v||l||r||y.current===v||(y.current=v,j({
inView:!!c,
entry:void 0
}
));
const f=[g,u.inView,u.entry];
return f.ref=f[0],f.inView=f[1],f.entry=f[2],f
}

}

}
]);
