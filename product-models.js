import * as THREE from './vendor/three/three.module.js';

// Procedural illustrations of the commodity forms described in the supplied PDF.
// These models are not scans, measurements, or guarantees of a shipment's appearance.
export const PRODUCT_FORMS = Object.freeze({
  vanilla: [{id:'bundle',idLabel:'Ikatan polong',enLabel:'Pod bundle'},{id:'single',idLabel:'Polong tunggal',enLabel:'Single pod'}],
  coffee: [{id:'cluster',idLabel:'Kelompok biji',enLabel:'Bean cluster'},{id:'single',idLabel:'Biji tunggal',enLabel:'Single bean'}],
  carbon: [{id:'granular',idLabel:'Granular',enLabel:'Granular'},{id:'pellet',idLabel:'Pellet',enLabel:'Pellet'},{id:'powder',idLabel:'Powder',enLabel:'Powder'}],
  candlenut: [{id:'shell',idLabel:'Dengan cangkang',enLabel:'In shell'},{id:'kernel',idLabel:'Inti kemiri',enLabel:'Shelled kernels'}],
  sulfur: [{id:'lump',idLabel:'Bongkahan',enLabel:'Lumps'},{id:'granular',idLabel:'Butiran',enLabel:'Granules'},{id:'powder',idLabel:'Bubuk',enLabel:'Powder'}],
  broom: [{id:'bundle',idLabel:'Ikatan alami',enLabel:'Natural bundle'},{id:'handle',idLabel:'Dengan gagang',enLabel:'With handle'}]
});

function rng(seed=42){return()=>{seed|=0;seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function noise(x,y,z){return(Math.sin(x*37.1+y*19.7+z*43.3)*Math.cos(x*13.2-z*29.4)+1)*.5;}
const material=(color,roughness=.8,options={})=>new THREE.MeshStandardMaterial({color,roughness,metalness:0,...options});
function addMesh(group,geometry,mat,position=[0,0,0],scale=[1,1,1]){const m=new THREE.Mesh(geometry,mat);m.position.set(...position);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
function surfaceTexture(seed=1){
  const rand=rng(seed),data=new Uint8Array(64*64*4);
  for(let i=0;i<data.length;i+=4){const v=Math.floor(90+rand()*150);data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;}
  const texture=new THREE.DataTexture(data,64,64,THREE.RGBAFormat);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.needsUpdate=true;return texture;
}
function taperedTube(points,radius=.025,segments=48,sides=8){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  const g=new THREE.TubeGeometry(curve,segments,radius,sides,false),p=g.attributes.position;
  for(let i=0;i<=segments;i++){
    const t=i/segments,center=curve.getPointAt(t),taper=.12+.88*Math.pow(Math.sin(Math.PI*t),.25);
    for(let j=0;j<=sides;j++){const index=i*(sides+1)+j;const v=new THREE.Vector3().fromBufferAttribute(p,index).sub(center).multiplyScalar(taper);v.add(center);p.setXYZ(index,v.x,v.y,v.z);}
  }
  p.needsUpdate=true;g.computeVertexNormals();return g;
}
function torus(group,radius,tube,y,mat){const m=addMesh(group,new THREE.TorusGeometry(radius,tube,8,48),mat,[0,y,0]);m.rotation.x=Math.PI/2;return m;}
function vanilla(form){
  const root=new THREE.Group(),rand=rng(11),bump=surfaceTexture(11);
  const pod=material('#352018',.54,{bumpMap:bump,bumpScale:.016}),ridge=material('#69432c',.8),rope=material('#b9a474',.95);
  const count=form==='single'?1:9;
  for(let i=0;i<count;i++){
    const angle=i*2.3999,spread=form==='single'?0:Math.sqrt(i/count)*.17;
    const x=Math.cos(angle)*spread,z=Math.sin(angle)*spread,length=2.9+rand()*.4;
    const points=[[x-.04,-length/2,z],[x+.02,-.6,z+.03],[x-.025,.35,z-.02],[x+.03,1.1,z+.025],[x+.09,length/2,z+.005]];
    addMesh(root,taperedTube(points,.035+rand()*.007,64,9),pod);
    addMesh(root,taperedTube(points.map(([a,b,c])=>[a+.025,b,c-.014]),.003,50,4),ridge);
  }
  if(form!=='single'){
    for(let j=0;j<4;j++)torus(root,.178,.012,-.18+j*.025,rope);
    const loose=new THREE.Group();root.add(loose);
    addMesh(loose,taperedTube([[-.5,-1.5,.25],[-.45,-.6,.12],[-.5,.4,.1],[-.3,1.35,.15]],.034,64,9),pod);
    addMesh(loose,taperedTube([[.55,-1.6,-.15],[.35,-.4,-.12],[.4,.8,-.07],[.6,1.4,-.12]],.032,64,9),pod);
  }
  root.rotation.z=-.13;return root;
}
function beanGeometry(){
  const g=new THREE.SphereGeometry(1,44,30),p=g.attributes.position;
  const colors=[];
  for(let i=0;i<p.count;i++){
    let x=p.getX(i)*.4,y=p.getY(i)*.25,z=p.getZ(i)*.61;
    const seam=.03*Math.sin(z*6),groove=Math.exp(-((x-seam)**2)/.0018);
    if(y>0)y-=.085*groove*Math.sqrt(Math.max(0,1-(z/.63)**2));
    const uneven=.98+noise(x*3,y*4,z*3)*.035;x*=uneven;z*=uneven;
    p.setXYZ(i,x,y,z);
    const c=new THREE.Color('#c2aa7f').multiplyScalar(.86+noise(x,y,z)*.23);if(y>0)c.multiplyScalar(1-.42*groove);colors.push(c.r,c.g,c.b);
  }
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
}
function coffee(form){
  const root=new THREE.Group(),rand=rng(22),bump=surfaceTexture(22);
  const mat=material('#ffffff',.7,{vertexColors:true,bumpMap:bump,bumpScale:.011}),crease=material('#695238',.95);
  const bean=new THREE.Group();addMesh(bean,beanGeometry(),mat);
  const line=[[-.012,.10,-.49],[-.028,.16,-.25],[0,.171,0],[.028,.16,.25],[.012,.10,.49]];
  addMesh(bean,taperedTube(line,.009,40,6),crease);
  if(form==='single'){root.add(bean);bean.rotation.set(.2,.35,-.08);return root;}
  const positions=[[0,.45,0],[.73,0,.1],[-.7,-.04,.15],[.22,-.08,.8],[-.5,-.12,-.7],[.58,-.11,-.65],[-.5,-.12,.85]];
  positions.forEach((pos,i)=>{const b=bean.clone();b.position.set(...pos);b.rotation.set((rand()-.5)*.6,rand()*Math.PI*2,(rand()-.5)*.7);b.scale.setScalar(i===0?1.2:.8+rand()*.25);root.add(b);});return root;
}
function rockGeometry(seed=1,detail=1){
  const rand=rng(seed),g=new THREE.IcosahedronGeometry(.57,detail),p=g.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i),f=.83+.25*noise(x*3+seed,y*3,z*3);
    p.setXYZ(i,x*f,y*f,z*f);
  }
  g.computeVertexNormals();return g;
}
function mound(group,mat,seed=1){
  const points=[new THREE.Vector2(0,-.19),new THREE.Vector2(1.05,-.19),new THREE.Vector2(1.03,-.12),new THREE.Vector2(.81,.08),new THREE.Vector2(.5,.34),new THREE.Vector2(.22,.49),new THREE.Vector2(0,.54)];
  const g=new THREE.LatheGeometry(points,64),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(y>-.15)p.setY(i,y+(noise(x*seed,y,z*seed)-.5)*.035);}
  g.computeVertexNormals();addMesh(group,g,mat);
}
function particles(group,mat,count,seed,colorVariation=false){
  const rand=rng(seed),geometry=new THREE.IcosahedronGeometry(1,1),instances=new THREE.InstancedMesh(geometry,mat,count),dummy=new THREE.Object3D();
  for(let i=0;i<count;i++){
    const angle=rand()*Math.PI*2,r=Math.sqrt(rand())*.96,size=.035+rand()*.045;
    const height=.06+(1-r)*.5;
    dummy.position.set(Math.cos(angle)*r,rand()*height-.08,Math.sin(angle)*r);
    dummy.scale.set(size,size*(.65+rand()*.5),size);dummy.rotation.set(rand()*3,rand()*3,rand()*3);dummy.updateMatrix();instances.setMatrixAt(i,dummy.matrix);
    if(colorVariation)instances.setColorAt(i,new THREE.Color('#ead327').multiplyScalar(.8+rand()*.25));
  }
  instances.castShadow=true;instances.receiveShadow=true;group.add(instances);
}
function carbon(form){
  const root=new THREE.Group(),rand=rng(33),bump=surfaceTexture(33),mat=material('#242724',.95,{flatShading:true,bumpMap:bump,bumpScale:.06});
  if(form==='powder'){mound(root,mat,5);particles(root,mat,180,43);return root;}
  if(form==='pellet'){
    for(let i=0;i<18;i++){
      const a=i*2.3999,r=Math.sqrt(i/18)*.9;
      const m=addMesh(root,new THREE.CylinderGeometry(.12,.12,.48+rand()*.18,16),mat,[Math.cos(a)*r,(1-r)*.35-.1,Math.sin(a)*r]);
      m.rotation.set((rand()-.5)*2.6,rand()*Math.PI,(rand()-.5)*2.6);
    }return root;
  }
  for(let i=0;i<12;i++){
    const a=i*2.3999,r=i===0?0:Math.sqrt(i/12)*.85;
    const m=addMesh(root,rockGeometry(i+9,1),mat,[Math.cos(a)*r,i===0?.32:-.2+rand()*.15,Math.sin(a)*r],[.7+rand()*.4,.6+rand()*.7,.65+rand()*.4]);m.rotation.set(rand(),rand()*3,rand());
  }return root;
}
function nutGeometry(kernel=false){
  const g=new THREE.SphereGeometry(.58,44,30),p=g.attributes.position,colors=[];
  for(let i=0;i<p.count;i++){
    let x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const f=kernel?.96+.07*noise(x*3,y*3,z*3):.95+.085*noise(x*7,y*7,z*7);
    x*=f*(1-.12*y);y*=f*.94;z*=f*.9;
    if(kernel)y+=.04*Math.sin(x*5)*Math.cos(z*5);
    p.setXYZ(i,x,y,z);
    const c=new THREE.Color(kernel?'#eee0bd':'#a78b60').multiplyScalar(.8+noise(x*4,y*4,z*4)*.35);colors.push(c.r,c.g,c.b);
  }
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
}
function candlenut(form){
  const root=new THREE.Group(),kernel=form==='kernel',rand=rng(44),bump=surfaceTexture(44),mat=material('#ffffff',kernel?.68:.96,{vertexColors:true,bumpMap:bump,bumpScale:kernel?.014:.07}),g=nutGeometry(kernel);
  const positions=[[0,.36,-.05],[-.67,-.22,.42],[.62,-.2,.46]];
  positions.forEach((pos,i)=>{const n=addMesh(root,g,mat,pos);n.scale.setScalar(i===0?1.12:.86);n.rotation.set(rand(),rand()*3,rand());});return root;
}
function sulfur(form){
  const root=new THREE.Group(),rand=rng(55),bump=surfaceTexture(55),mat=material('#f1d12a',.86,{flatShading:form==='lump',bumpMap:bump,bumpScale:.025});
  if(form==='powder'){mound(root,mat,7);particles(root,mat,160,55,true);return root;}
  if(form==='granular'){particles(root,mat,380,55,true);return root;}
  for(let i=0;i<7;i++){
    const a=i*2.3999,r=i===0?0:.55+rand()*.35;
    const m=addMesh(root,rockGeometry(i+55,1),mat,[Math.cos(a)*r,i===0?.36:-.14+rand()*.12,Math.sin(a)*r],[.7+rand()*.5,.7+rand()*.6,.65+rand()*.4]);m.rotation.set(rand(),rand()*3,rand());
  }return root;
}
function broom(form){
  const root=new THREE.Group(),rand=rng(66),fiberMaterials=['#b79755','#a78446','#c6a567','#9c783c'].map(c=>material(c,.92)),rope=material('#76623e',.98);
  const withHandle=form==='handle',tipY=withHandle?.3:1.45;
  for(let i=0;i<78;i++){
    const a=i*2.3999,r=Math.sqrt(i/78),x=Math.cos(a)*r,z=Math.sin(a)*r;
    const bottom=[x*.64,-1.5-rand()*.2,z*.13],upper=[x*.12,tipY,z*.1];
    const points=[bottom,[x*.43,-.85,z*.13],[x*.17,-.05,z*.11],upper];
    addMesh(root,taperedTube(points,.009+rand()*.004,30,5),fiberMaterials[i%fiberMaterials.length]);
  }
  const tieY=withHandle?.15:.75;
  for(let i=0;i<7;i++)torus(root,.126,.013,tieY+i*.022,rope);
  if(withHandle){addMesh(root,new THREE.CylinderGeometry(.045,.055,2.0,18),material('#957140',.8),[0,1.12,0]);torus(root,.057,.008,2.11,rope);}
  root.rotation.z=-.14;return root;
}

export function createProductModel(id,requestedForm){
  const forms=PRODUCT_FORMS[id];if(!forms)throw new Error(`Unknown product model: ${id}`);
  const form=forms.some(f=>f.id===requestedForm)?requestedForm:forms[0].id;
  const factory={vanilla,coffee,carbon,candlenut,sulfur,broom}[id],content=factory(form);
  content.updateMatrixWorld(true);
  const original=new THREE.Box3().setFromObject(content),center=original.getCenter(new THREE.Vector3()),size=original.getSize(new THREE.Vector3());
  const extent=Math.max(size.x,size.y,size.z);if(!Number.isFinite(extent)||extent<=0)throw new Error('Invalid product geometry');
  content.position.sub(center);const root=new THREE.Group();root.name=`${id}-${form}`;root.add(content);root.scale.setScalar(2.8/extent);root.updateMatrixWorld(true);
  return {root,form,bounds:new THREE.Box3().setFromObject(root)};
}

export function disposeObject(root){
  const geometries=new Set(),materials=new Set(),textures=new Set();
  root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m){materials.add(m);for(const value of Object.values(m))if(value?.isTexture)textures.add(value);}});
  textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());
}
