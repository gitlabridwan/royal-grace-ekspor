import * as THREE from './vendor/three/three.module.js';
import {OrbitControls} from './vendor/three/OrbitControls.js';
import {createProductModel,disposeObject,PRODUCT_FORMS} from './product-models.js';

const labels={
  id:{title:'Jelajahi produk dalam 3D',products:'Pilih komoditas',model:'Model 3D',photo:'Foto referensi',form:'Pilihan bentuk',illustration:'ILUSTRASI 3D',reference:'VISUAL DARI PROFIL PERUSAHAAN',drag:'Seret untuk memutar · scroll / pinch untuk zoom',keyboard:'Keyboard: panah untuk putar, + / − untuk zoom, Home untuk reset.',note:'Ilustrasi bentuk, bukan hasil pemindaian produk. Warna, tekstur, ukuran, dan susunan tidak mewakili batch aktual. Tidak menggunakan skala pengukuran.',zoomIn:'Perbesar',zoomOut:'Perkecil',left:'Putar ke kiri',right:'Putar ke kanan',reset:'Reset tampilan',auto:'Putar otomatis',pause:'Hentikan putaran',fullscreen:'Layar penuh',exitFullscreen:'Keluar layar penuh',close:'Tutup penampil 3D',add:'Pilih untuk RFQ',remove:'Hapus dari RFQ',specs:'Spesifikasi lengkap',retry:'Coba 3D lagi',unsupported:'3D tidak tersedia pada browser/perangkat ini. Foto referensi tetap dapat dilihat.',lost:'Tampilan 3D terhenti. Gunakan foto referensi atau coba muat ulang 3D.',loading:'Menyiapkan model…',ready:'Three.js · 360°',about:'Tentang visual ini',variantNote:'Bentuk akhir dan ketersediaan dikonfirmasi dalam penawaran.'},
  en:{title:'Explore products in 3D',products:'Choose a commodity',model:'3D model',photo:'Reference photo',form:'Product form',illustration:'3D ILLUSTRATION',reference:'VISUAL FROM THE COMPANY PROFILE',drag:'Drag to rotate · scroll / pinch to zoom',keyboard:'Keyboard: arrows to rotate, + / − to zoom, Home to reset.',note:'An illustration of the form, not a product scan. Colors, textures, dimensions, and arrangement do not represent an actual batch. Not shown to a measurement scale.',zoomIn:'Zoom in',zoomOut:'Zoom out',left:'Rotate left',right:'Rotate right',reset:'Reset view',auto:'Auto rotate',pause:'Stop rotating',fullscreen:'Full screen',exitFullscreen:'Exit full screen',close:'Close 3D viewer',add:'Select for RFQ',remove:'Remove from RFQ',specs:'Full specifications',retry:'Retry 3D',unsupported:'3D is unavailable on this browser/device. You can still view the reference photo.',lost:'The 3D view was interrupted. View the reference photo or retry 3D.',loading:'Preparing the model…',ready:'Three.js · 360°',about:'About this visual',variantNote:'Final product form and availability are confirmed by quotation.'}
};
const svg=name=>`<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
let dialog,bridge,language='id',currentId='vanilla',currentForm='bundle',mode='3d',state=null,lastFocus=null,failure=null,initialized=false;
const t=k=>labels[language][k];
const q=s=>dialog.querySelector(s);

function buildShell(){
  dialog.innerHTML=`<div class="viewer-heading"><div><p class="eyebrow">ROYAL GRACE / PRODUCT 3D</p><h2 id="viewerTitle"></h2></div><button class="icon-button" data-viewer-action="close">×</button></div><div class="viewer-product-tabs" role="group" data-product-tabs></div><div class="viewer-layout"><div class="viewer-stage" data-stage><div class="viewer-stage-bar"><div class="viewer-modes" role="group"><button data-viewer-mode="3d"></button><button data-viewer-mode="photo"></button></div><button class="viewer-tool viewer-fullscreen" data-viewer-action="fullscreen">${svg('expand')}</button></div><div class="viewer-canvas" data-canvas-host></div><img class="viewer-photo" data-reference-photo alt="" hidden><div class="viewer-status" data-status role="status" hidden><p></p><button data-viewer-action="retry"></button></div><div class="viewer-stage-label"><span data-visual-label></span><span data-engine-label>Three.js · 360°</span></div><div class="viewer-controls" data-controls><button class="viewer-tool" data-viewer-action="left">${svg('rotate-left')}</button><button class="viewer-tool" data-viewer-action="right">${svg('rotate-right')}</button><span class="viewer-control-divider"></span><button class="viewer-tool" data-viewer-action="zoomIn">${svg('plus')}</button><button class="viewer-tool" data-viewer-action="zoomOut">${svg('minus')}</button><button class="viewer-tool" data-viewer-action="reset">${svg('reset')}</button><button class="viewer-tool viewer-auto" data-viewer-action="auto" aria-pressed="false">${svg('play')}</button></div><p class="viewer-instructions" id="viewerInstructions"></p></div><aside class="viewer-sidebar"><p class="eyebrow" data-side-eyebrow></p><h3 data-product-title></h3><p class="viewer-product-description" data-product-description></p><label class="viewer-form-label" for="viewerForm" data-form-label></label><select id="viewerForm" data-form-select></select><p class="viewer-variant-note" data-variant-note></p><button class="btn viewer-rfq" data-viewer-action="rfq"></button><button class="text-link viewer-specs" data-viewer-action="specs"></button><div class="viewer-note"><strong data-note-title></strong><p data-note></p></div></aside></div><p class="viewer-keyboard" data-keyboard></p>`;
  dialog.setAttribute('aria-labelledby','viewerTitle');
}

function renderText(){
  if(!dialog?.open)return;
  const product=bridge.getProduct(currentId),name=product.name[language];
  q('#viewerTitle').textContent=t('title');
  q('[data-product-tabs]').setAttribute('aria-label',t('products'));
  q('[data-product-tabs]').innerHTML=bridge.getProducts().map(p=>`<button data-viewer-product="${p.id}" class="${p.id===currentId?'active':''}" aria-pressed="${p.id===currentId}"><img src="assets/${p.image}.webp" alt="" width="28" height="28"><span>${p.name[language]}</span></button>`).join('');
  q('[data-product-title]').textContent=name;
  q('[data-product-description]').textContent=product.description[language];
  q('[data-side-eyebrow]').textContent=language==='id'?'KOMODITAS PILIHAN':'SELECTED COMMODITY';
  q('[data-form-label]').textContent=t('form');
  q('[data-form-select]').innerHTML=PRODUCT_FORMS[currentId].map(f=>`<option value="${f.id}" ${f.id===currentForm?'selected':''}>${language==='id'?f.idLabel:f.enLabel}</option>`).join('');
  q('[data-variant-note]').textContent=t('variantNote');
  q('[data-reference-photo]').src=`assets/${product.image}.webp`;
  q('[data-reference-photo]').alt=`${name} — ${t('reference')}`;
  q('[data-note-title]').textContent=t('about');q('[data-note]').textContent=t('note');
  q('[data-keyboard]').textContent=t('keyboard');
  for(const key of ['model','photo'])q(`[data-viewer-mode="${key==='model'?'3d':'photo'}"]`).textContent=t(key);
  q('.viewer-modes').setAttribute('aria-label',language==='id'?'Mode tampilan':'Viewing mode');
  for(const key of ['left','right','zoomIn','zoomOut','reset','close','retry']){
    const el=q(`[data-viewer-action="${key}"]`);el.setAttribute('aria-label',t(key));el.title=t(key);if(key==='retry')el.textContent=t(key);
  }
  q('[data-viewer-action="specs"]').innerHTML=`<span>${t('specs')}</span>${svg('arrow-up')}`;
  state?.renderer.domElement.setAttribute('aria-label',`${name}. ${t('drag')} ${t('keyboard')}`);
  syncSelection();updateModeUI();updateAutoUI();updateFullscreenUI();
  if(failure){q('[data-status] p').textContent=t(failure);q('[data-status]').hidden=false;}
}

export function syncSelection(){
  if(!dialog?.open)return;
  const selected=bridge.isSelected(currentId),button=q('[data-viewer-action="rfq"]');
  button.innerHTML=`${svg(selected?'check':'plus')}<span>${t(selected?'remove':'add')}</span>`;
  button.classList.toggle('outline',selected);button.setAttribute('aria-pressed',String(selected));
}
export function setLanguage(value){language=value==='en'?'en':'id';renderText();}

function updateModeUI(){
  q('[data-canvas-host]').hidden=mode!=='3d';
  q('[data-reference-photo]').hidden=mode!=='photo';
  q('[data-controls]').hidden=mode!=='3d'||!state;
  q('[data-visual-label]').textContent=t(mode==='3d'?'illustration':'reference');
  q('[data-engine-label]').hidden=mode!=='3d';
  q('#viewerInstructions').textContent=mode==='3d'?t('drag'):t('reference');
  dialog.querySelectorAll('[data-viewer-mode]').forEach(b=>{const active=b.dataset.viewerMode===mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  if(mode==='3d')requestRender();else stopRender();
}
function updateAutoUI(){
  const active=!!state?.controls.autoRotate,el=q('[data-viewer-action="auto"]');
  el.innerHTML=svg(active?'pause':'play');el.setAttribute('aria-pressed',String(active));el.title=t(active?'pause':'auto');el.setAttribute('aria-label',t(active?'pause':'auto'));
}
function updateFullscreenUI(){
  if(!dialog?.open)return;
  const expanded=!!document.fullscreenElement||dialog.classList.contains('viewer-expanded'),el=q('[data-viewer-action="fullscreen"]');
  el.title=t(expanded?'exitFullscreen':'fullscreen');el.setAttribute('aria-label',el.title);el.setAttribute('aria-pressed',String(expanded));
}

function unavailable(key='unsupported'){
  failure=key;mode='photo';stopRender();
  q('[data-status]').hidden=false;q('[data-status]').classList.add('compact');q('[data-status] p').textContent=t(key);
  updateModeUI();
}
function initializeScene(){
  disposeScene();failure=null;q('[data-status]').hidden=true;
  let renderer,controls,scene;
  try{
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));renderer.setClearColor(0x000000,0);
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-describedby','viewerInstructions');
    q('[data-canvas-host]').replaceChildren(canvas);
    scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(35,1,.05,40);camera.position.set(4.1,2.5,5.4);
    controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.1;controls.enablePan=false;controls.minDistance=2.1;controls.maxDistance=11;controls.minPolarAngle=.12;controls.maxPolarAngle=Math.PI-.18;controls.autoRotate=false;controls.autoRotateSpeed=.7;controls.cursorStyle='grab';
    scene.add(new THREE.HemisphereLight('#fff8e8','#a9b5aa',2.4));
    const key=new THREE.DirectionalLight('#fff1d1',3.4);key.position.set(4,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-3.5;key.shadow.camera.right=3.5;key.shadow.camera.top=3.5;key.shadow.camera.bottom=-3.5;key.shadow.camera.near=.1;key.shadow.camera.far=25;key.shadow.bias=-.0004;key.shadow.normalBias=.02;scene.add(key);
    const fill=new THREE.DirectionalLight('#d9e7ff',1.7);fill.position.set(-5,3,1);scene.add(fill);
    const rim=new THREE.DirectionalLight('#ffffff',2.3);rim.position.set(0,4,-5);scene.add(rim);
    const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(1.68,1.73,.065,72),new THREE.MeshStandardMaterial({color:'#e3e7db',roughness:.88}));pedestal.receiveShadow=true;scene.add(pedestal);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(18,18),new THREE.ShadowMaterial({opacity:.13}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
    state={renderer,controls,scene,camera,pedestal,floor,model:null,frame:0,lastTime:0,interacting:false,disposed:false,observer:null};
    const owner=state;
    controls.addEventListener('change',requestRender);controls.addEventListener('start',()=>{if(state===owner&&!owner.disposed){owner.interacting=true;requestRender();}});controls.addEventListener('end',()=>{if(state===owner&&!owner.disposed){owner.interacting=false;requestRender();}});
    canvas.addEventListener('keydown',handleCanvasKey);
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();if(state===owner&&!owner.disposed)unavailable('lost');});
    const observer=new ResizeObserver(resize);observer.observe(q('[data-stage]'));state.observer=observer;
    replaceModel();resize();renderText();requestRender();
  }catch{
    if(state)disposeScene();else{controls?.dispose();if(scene)disposeObject(scene);renderer?.dispose();q('[data-canvas-host]').replaceChildren();}
    unavailable();
  }
}
function replaceModel(){
  if(!state)return;
  if(state.model){state.scene.remove(state.model);disposeObject(state.model);}
  const model=createProductModel(currentId,currentForm);currentForm=model.form;state.model=model.root;state.scene.add(model.root);
  state.pedestal.position.y=model.bounds.min.y-.055;state.floor.position.y=model.bounds.min.y-.091;
  resetCamera();requestRender();
}
function resetCamera(){
  if(!state)return;
  state.camera.position.set(4.1,2.5,5.4);state.controls.target.set(0,0,0);state.controls.update();requestRender();
}
function resize(){
  if(!state)return;const rect=q('[data-stage]').getBoundingClientRect(),w=Math.max(1,rect.width),h=Math.max(1,rect.height);
  state.camera.aspect=w/h;state.camera.updateProjectionMatrix();state.renderer.setSize(w,h,false);requestRender();
}
function requestRender(){
  if(!state||state.disposed||state.frame||!dialog.open||mode!=='3d'||document.hidden)return;
  state.frame=requestAnimationFrame(renderFrame);
}
function renderFrame(time){
  if(!state)return;state.frame=0;
  if(state.disposed||!dialog.open||mode!=='3d'||document.hidden)return;
  const delta=state.lastTime?Math.min((time-state.lastTime)/1000,.1):1/60;state.lastTime=time;
  try{const changed=state.controls.update(delta);state.renderer.render(state.scene,state.camera);if(changed||state.interacting||state.controls.autoRotate)requestRender();}catch{unavailable('lost');}
}
function stopRender(){if(state?.frame){cancelAnimationFrame(state.frame);state.frame=0;}if(state)state.lastTime=0;}
function disposeScene(){
  if(!state)return;const old=state;old.disposed=true;stopRender();old.observer?.disconnect();old.controls.dispose();disposeObject(old.scene);old.scene.traverse(o=>{if(o.isLight)o.dispose?.();});old.renderer.dispose();old.renderer.forceContextLoss();old.renderer.domElement.remove();state=null;
}
function changeProduct(id){
  if(!PRODUCT_FORMS[id])return;currentId=id;currentForm=PRODUCT_FORMS[id][0].id;
  if(state&&!failure)replaceModel();renderText();requestRender();
}
function orbit(horizontal=0,vertical=0){
  if(!state)return;const offset=state.camera.position.clone().sub(state.controls.target),s=new THREE.Spherical().setFromVector3(offset);
  s.theta+=horizontal;s.phi=THREE.MathUtils.clamp(s.phi+vertical,state.controls.minPolarAngle,state.controls.maxPolarAngle);offset.setFromSpherical(s);state.camera.position.copy(state.controls.target).add(offset);state.controls.update();requestRender();
}
function zoom(factor){
  if(!state)return;const offset=state.camera.position.clone().sub(state.controls.target),distance=THREE.MathUtils.clamp(offset.length()*factor,state.controls.minDistance,state.controls.maxDistance);
  offset.setLength(distance);state.camera.position.copy(state.controls.target).add(offset);state.controls.update();requestRender();
}
function toggleAuto(){if(!state)return;state.controls.autoRotate=!state.controls.autoRotate;updateAutoUI();requestRender();}
function handleCanvasKey(event){
  const actions={ArrowLeft:()=>orbit(-.15),ArrowRight:()=>orbit(.15),ArrowUp:()=>orbit(0,-.13),ArrowDown:()=>orbit(0,.13),'+':()=>zoom(.85),'=':()=>zoom(.85),'-':()=>zoom(1.15),Home:resetCamera,'0':resetCamera,' ':toggleAuto};
  if(actions[event.key]){event.preventDefault();event.stopPropagation();actions[event.key]();}
}
async function toggleFullscreen(){
  if(document.fullscreenElement){await document.exitFullscreen();return;}
  if(dialog.classList.contains('viewer-expanded')){dialog.classList.remove('viewer-expanded');updateFullscreenUI();resize();return;}
  try{if(!q('[data-stage]').requestFullscreen)throw new Error('Unsupported');await q('[data-stage]').requestFullscreen();}catch{dialog.classList.add('viewer-expanded');updateFullscreenUI();resize();}
}
function closeViewer(){if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});dialog.close();}
function initializeDialog(){
  if(initialized)return;initialized=true;dialog=document.querySelector('#product3dDialog');
  dialog.addEventListener('click',event=>{
    const product=event.target.closest('[data-viewer-product]');if(product){changeProduct(product.dataset.viewerProduct);q(`[data-viewer-product="${currentId}"]`)?.focus({preventScroll:true});return;}
    const modeButton=event.target.closest('[data-viewer-mode]');if(modeButton){mode=modeButton.dataset.viewerMode;if(mode==='3d'&&(!state||failure))initializeScene();updateModeUI();return;}
    const action=event.target.closest('[data-viewer-action]')?.dataset.viewerAction;
    if(action){({close:closeViewer,left:()=>orbit(-.28),right:()=>orbit(.28),zoomIn:()=>zoom(.8),zoomOut:()=>zoom(1.2),reset:resetCamera,auto:toggleAuto,fullscreen:()=>toggleFullscreen(),rfq:()=>bridge.toggle(currentId),retry:()=>{mode='3d';initializeScene();updateModeUI();},specs:()=>{const id=currentId;closeViewer();bridge.showSpecs(id);}})[action]?.();return;}
    if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeViewer();}
  });
  dialog.addEventListener('change',event=>{if(event.target.matches('[data-form-select]')){currentForm=event.target.value;if(state&&!failure)replaceModel();}});
  dialog.addEventListener('cancel',event=>{if(document.fullscreenElement){event.preventDefault();document.exitFullscreen().catch(()=>{});}});
  dialog.addEventListener('close',()=>{disposeScene();dialog.classList.remove('viewer-expanded');document.body.style.overflow=document.querySelector('dialog[open]')?'hidden':'';if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopRender();else requestRender();});
  document.addEventListener('fullscreenchange',()=>{updateFullscreenUI();resize();});
}

export function openViewer(options){
  initializeDialog();bridge=options.bridge;language=options.language==='en'?'en':'id';
  const id=PRODUCT_FORMS[options.id]?options.id:'vanilla';
  if(dialog.open){changeProduct(id);return;}
  lastFocus=document.activeElement;currentId=id;currentForm=PRODUCT_FORMS[id][0].id;mode='3d';failure=null;
  buildShell();dialog.showModal();document.body.style.overflow='hidden';renderText();initializeScene();
  q('[data-viewer-action="close"]').focus({preventScroll:true});
}
