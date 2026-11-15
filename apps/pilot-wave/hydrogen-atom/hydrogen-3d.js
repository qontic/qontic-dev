// ════════════════════════════════════════════════════════════════
//  QUANTUM MECHANICS — hydrogen atom, atomic units (a₀=ħ=mₑ=e=1)
// ════════════════════════════════════════════════════════════════
function factorial(n){let f=1;for(let i=2;i<=n;i++)f*=i;return f;}

function laguerre(n,a,x){
  if(n<0)return 0;if(n===0)return 1;if(n===1)return 1+a-x;
  let l0=1,l1=1+a-x;
  for(let i=2;i<=n;i++){const l2=((2*i-1+a-x)*l1-(i-1+a)*l0)/i;l0=l1;l1=l2;}
  return l1;
}

function assocLegendre(l,m,x){
  let pmm=1;
  if(m>0){const s=Math.sqrt(Math.max(0,1-x*x));let f=1;for(let i=1;i<=m;i++){pmm*=-f*s;f+=2;}}
  if(l===m)return pmm;
  let pm1=(2*m+1)*x*pmm;if(l===m+1)return pm1;
  let plm=0;
  for(let k=m+2;k<=l;k++){plm=((2*k-1)*x*pm1-(k+m-1)*pmm)/(k-m);pmm=pm1;pm1=plm;}
  return plm;
}

function ylmNorm(l,m){
  const am=Math.abs(m);let r=1;
  for(let i=l-am+1;i<=l+am;i++)r*=i;
  return Math.sqrt((2*l+1)/(4*Math.PI)/r);
}

// Complex Y_l^m → [Re,Im]
function Ylm(l,m,theta,phi){
  const am=Math.abs(m);
  const P=assocLegendre(l,am,Math.cos(theta));
  const N=ylmNorm(l,m);
  const csPhase=(m>=0)?1:Math.pow(-1,am);
  return[csPhase*N*P*Math.cos(m*phi), csPhase*N*P*Math.sin(m*phi)];
}

function Rnl(n,l,r){
  const rho=2*r/n;
  const N2=Math.pow(2/n,3)*factorial(n-l-1)/(2*n*factorial(n+l));
  return Math.sqrt(Math.max(0,N2))*Math.exp(-rho/2)*Math.pow(rho,l)*laguerre(n-l-1,2*l+1,rho);
}

// ψ(x,y,z,t) → [Re,Im]
function psiXYZ(comps,x,y,z,t){
  const r=Math.sqrt(x*x+y*y+z*z);

  const theta=Math.acos(Math.max(-1,Math.min(1,r > 0 ? z/r : 1)));
  const phi=Math.atan2(y,x);
  let re=0,im=0;
  for(const c of comps){
    const R=Rnl(c.n,c.l,r);
    const[yRe,yIm]=Ylm(c.l,c.m,theta,phi);
    const Et=-0.5/(c.n*c.n)*t;
    const ce=Math.cos(Et),se=Math.sin(Et);
    const sRe=R*(yRe*ce+yIm*se),sIm=R*(yIm*ce-yRe*se);
    re+=c.cRe*sRe-c.cIm*sIm;im+=c.cRe*sIm+c.cIm*sRe;
  }
  return[re,im];
}

function rhoAt(comps,x,y,z,t){const[a,b]=psiXYZ(comps,x,y,z,t);return a*a+b*b;}

// Particle velocity v=Im(∇ψ/ψ)
function bohmV(comps,x,y,z,t){
  // ── Spin gate: delegate to Pauli–Bohm guidance when spin is on ──
  if(spinEnabled&&spinComps.length)return bohmVPauli(spinComps,x,y,z,t);
  if(Math.sqrt(x*x+y*y+z*z)<0.15)return[0,0,0];
  const h=0.07,p0=psiXYZ(comps,x,y,z,t);
  const den=p0[0]*p0[0]+p0[1]*p0[1];
  if(den<1e-22)return[0,0,0];
  const ig=(dre,dim)=>(p0[0]*dim-p0[1]*dre)/den;
  const px=psiXYZ(comps,x+h,y,z,t),nx_=psiXYZ(comps,x-h,y,z,t);
  const py=psiXYZ(comps,x,y+h,z,t),ny_=psiXYZ(comps,x,y-h,z,t);
  const pz=psiXYZ(comps,x,y,z+h,t),nz_=psiXYZ(comps,x,y,z-h,t);
  const vx=ig((px[0]-nx_[0])/(2*h),(px[1]-nx_[1])/(2*h));
  const vy=ig((py[0]-ny_[0])/(2*h),(py[1]-ny_[1])/(2*h));
  const vz=ig((pz[0]-nz_[0])/(2*h),(pz[1]-nz_[1])/(2*h));
  const spd=Math.sqrt(vx*vx+vy*vy+vz*vz);
  if(spd>25){const s=25/spd;return[vx*s,vy*s,vz*s];}
  return[vx,vy,vz];
}

// ════════════════════════════════════════════════════════════════
//  PAULI–BOHMIAN GUIDANCE  (spinor wave function)
//
//  Reference: T. Jia & R. Callaway, BYU preprint (2005).
//  v_P = Im(Ψ†∇Ψ)/ρ  +  (∇×S)/(2ρ)
//  where S = Ψ†σΨ  is the local spin-density vector.
//  The second term is zero for the scalar case and makes every
//  m=0 eigenstate non-stationary when the spin is not aligned
//  with z (the orbital quantisation axis).
// ════════════════════════════════════════════════════════════════

// Spinor ψ(x,y,z,t) → [ψ↑_Re, ψ↑_Im, ψ↓_Re, ψ↓_Im]
// Each spinor-component c: {n,l,m, upRe,upIm,dnRe,dnIm}
function psiSpinor(sc,x,y,z,t){
  const r=Math.sqrt(x*x+y*y+z*z);

  const theta=Math.acos(Math.max(-1,Math.min(1,r > 0 ? z/r : 1)));
  const phi=Math.atan2(y,x);
  let ur=0,ui=0,dr=0,di=0;
  for(const c of sc){
    const R=Rnl(c.n,c.l,r);
    const[yRe,yIm]=Ylm(c.l,c.m,theta,phi);
    const Et=-0.5/(c.n*c.n)*t;
    const ce=Math.cos(Et),se=Math.sin(Et);
    const sRe=R*(yRe*ce+yIm*se),sIm=R*(yIm*ce-yRe*se);
    ur+=c.upRe*sRe-c.upIm*sIm; ui+=c.upRe*sIm+c.upIm*sRe;
    dr+=c.dnRe*sRe-c.dnIm*sIm; di+=c.dnRe*sIm+c.dnIm*sRe;
  }
  return[ur,ui,dr,di];
}

function rhoSpinAt(sc,x,y,z,t){
  const[ur,ui,dr,di]=psiSpinor(sc,x,y,z,t);
  return ur*ur+ui*ui+dr*dr+di*di;
}

// Pauli–Bohmian guidance velocity using 6-point central finite differences.
// Convective term is the same as scalar bohmV but summed over both channels.
// Spin-current term adds (∇×S)/(2ρ) where S = [2Re(ψ↑*ψ↓), 2Im(ψ↑*ψ↓), |ψ↑|²−|ψ↓|²].
function bohmVPauli(sc,x,y,z,t){
  if(Math.sqrt(x*x+y*y+z*z)<0.15)return[0,0,0];
  const h=0.07;
  const p0=psiSpinor(sc,x,y,z,t);
  const rho=p0[0]*p0[0]+p0[1]*p0[1]+p0[2]*p0[2]+p0[3]*p0[3];
  if(rho<1e-22)return[0,0,0];
  const pp=psiSpinor(sc,x+h,y,z,t),pn=psiSpinor(sc,x-h,y,z,t);
  const qp=psiSpinor(sc,x,y+h,z,t),qn=psiSpinor(sc,x,y-h,z,t);
  const rp=psiSpinor(sc,x,y,z+h,t),rn=psiSpinor(sc,x,y,z-h,t);
  // Convective: Im(Ψ†∂ᵢΨ)/ρ  summed over both spin channels
  const vcx=(p0[0]*(pp[1]-pn[1])-p0[1]*(pp[0]-pn[0])+p0[2]*(pp[3]-pn[3])-p0[3]*(pp[2]-pn[2]))/(2*h*rho);
  const vcy=(p0[0]*(qp[1]-qn[1])-p0[1]*(qp[0]-qn[0])+p0[2]*(qp[3]-qn[3])-p0[3]*(qp[2]-qn[2]))/(2*h*rho);
  const vcz=(p0[0]*(rp[1]-rn[1])-p0[1]*(rp[0]-rn[0])+p0[2]*(rp[3]-rn[3])-p0[3]*(rp[2]-rn[2]))/(2*h*rho);
  // Spin-density vector S = [Sx,Sy,Sz] at each of the 6 stencil points
  const sv=(ps)=>[2*(ps[0]*ps[2]+ps[1]*ps[3]), 2*(ps[0]*ps[3]-ps[1]*ps[2]), ps[0]*ps[0]+ps[1]*ps[1]-ps[2]*ps[2]-ps[3]*ps[3]];
  const Sxp=sv(pp),Sxn=sv(pn),Syp=sv(qp),Syn=sv(qn),Szp=sv(rp),Szn=sv(rn);
  // (∇×S)/(2ρ)  where (∇×S)_x = ∂_y S_z − ∂_z S_y, etc.
  const curlx=(Syp[2]-Syn[2]-Szp[1]+Szn[1])/(2*h*2*rho);
  const curly=(Szp[0]-Szn[0]-Sxp[2]+Sxn[2])/(2*h*2*rho);
  const curlz=(Sxp[1]-Sxn[1]-Syp[0]+Syn[0])/(2*h*2*rho);
  let vx=vcx+curlx,vy=vcy+curly,vz=vcz+curlz;
  const spd=Math.sqrt(vx*vx+vy*vy+vz*vz);
  if(spd>25){const s=25/spd;return[vx*s,vy*s,vz*s];}
  return[vx,vy,vz];
}

// Build spinComps from scalar comps via product-state construction.
// Spin state |n̂⟩ = cos(θ/2)|↑⟩ + e^{iφ}sin(θ/2)|↓⟩
// For each scalar component (cRe+i·cIm)·ψ_orbital:
//   up amplitude = (cRe+i·cIm)·cos(θ/2)
//   dn amplitude = (cRe+i·cIm)·e^{iφ}·sin(θ/2)
function buildSpinComps(){
  if(!spinEnabled){spinComps=[];return;}
  if(spinMode==='jstate')return; // spinComps set directly by j-state selector
  const cth=Math.cos(spinTheta/2),sth=Math.sin(spinTheta/2);
  const cphi=Math.cos(spinPhi),sphi=Math.sin(spinPhi);
  spinComps=comps.map(c=>({
    n:c.n,l:c.l,m:c.m,
    upRe:c.cRe*cth,
    upIm:c.cIm*cth,
    dnRe:(c.cRe*cphi-c.cIm*sphi)*sth,
    dnIm:(c.cRe*sphi+c.cIm*cphi)*sth,
  }));
}

// Spin-orbit j-eigenstates |n,l,j,mⱼ⟩ via Clebsch-Gordan coefficients.
// j=l+½: C↑=√[(l+½+mⱼ)/(2l+1)], m↑=mⱼ−½; C↓=√[(l+½−mⱼ)/(2l+1)], m↓=mⱼ+½
// j=l−½: C↑=−√[(l+½−mⱼ)/(2l+1)], C↓=+√[(l+½+mⱼ)/(2l+1)] (same m rule)
function _jState(n,l,j,mj){
  const twoLp1=2*l+1, isPlus=(j>l);
  const mu=mj-0.5, md=mj+0.5;
  const Cup=isPlus?+Math.sqrt((l+0.5+mj)/twoLp1):-Math.sqrt((l+0.5-mj)/twoLp1);
  const Cdn=isPlus?+Math.sqrt((l+0.5-mj)/twoLp1):+Math.sqrt((l+0.5+mj)/twoLp1);
  const out=[];
  if(Math.abs(mu)<=l+0.01) out.push({n,l,m:Math.round(mu),upRe:Cup,upIm:0,dnRe:0,dnIm:0});
  if(Math.abs(md)<=l+0.01) out.push({n,l,m:Math.round(md),upRe:0,upIm:0,dnRe:Cdn,dnIm:0});
  return out;
}
// Scalar sampling comps equivalent for j-state (uses same orbital but ignores spin)
function _jScalar(sc){
  return sc.map(c=>({n:c.n,l:c.l,m:c.m,cRe:Math.sqrt(c.upRe*c.upRe+c.upIm*c.upIm+c.dnRe*c.dnRe+c.dnIm*c.dnIm),cIm:0}));
}

// ── Dynamic j-state entries for any (n,l) ───────────────────────
function _buildJStatesForOrbit(n,l){
  const lName=['s','p','d','f','g'][l]??String(l);
  const fmtJ =j=>({0.5:'½',1.5:'³/₂',2.5:'⁵/₂',3.5:'⁷/₂'}[j]??j.toFixed(1));
  const fmtMj=mj=>{const a=Math.abs(mj);return (mj>=0?'+':'−')+({0.5:'½',1.5:'³/₂',2.5:'⁵/₂',3.5:'⁷/₂'}[a]??a.toFixed(1));};
  const out=[];
  for(const dj of [0.5,-0.5]){
    const j=l+dj; if(j<0.45) continue;
    for(let mj=j;mj>=-j+0.001;mj-=1){
      const sc=_jState(n,l,j,mj); if(!sc.length) continue;
      const note=l===0?' (= product)':sc.length===1?' (pure)':' (mixed)';
      out.push({label:`${n}${lName}  j=${fmtJ(j)}, mⱼ=${fmtMj(mj)}${note}`, sc, n, l, j, mj});
    }
  }
  return out;
}

let _currentJEntries=[]; // cache of j-state entries for current orbital

function _applyJState(entry){
  if(!entry) return;
  spinComps=entry.sc.map(c=>({...c}));
  // Update scalar comps to match the orbital parts of the spinor
  comps=entry.sc.map(c=>{
    const w=Math.sqrt(c.upRe*c.upRe+c.upIm*c.upIm+c.dnRe*c.dnRe+c.dnIm*c.dnIm);
    return {n:c.n,l:c.l,m:c.m,cRe:w,cIm:0};
  });
  if(comps.length===1) comps[0].cRe=1;
  else{
    const nm=Math.sqrt(comps.reduce((s,c)=>s+c.cRe*c.cRe,0));
    if(nm>1e-10) comps.forEach(c=>c.cRe/=nm);
  }
}

function _refreshJStateDropdown(){
  const o=ORBITALS[orbIdx];
  _currentJEntries=_buildJStatesForOrbit(o.n,o.l);
  const sel=document.getElementById('jStateSel');
  if(sel) sel.innerHTML=_currentJEntries.map((e,i)=>`<option value="${i}">${e.label}</option>`).join('');
  if(_currentJEntries.length){
    if(sel) sel.value='0';
    _applyJState(_currentJEntries[0]);
  }
}

const SPIN_ORBITALS=[
  {label:'2p₃/₂, mⱼ=+³/₂ (pure ↑)',  sc:_jState(2,1,1.5,+1.5)},
  {label:'2p₃/₂, mⱼ=+½ (mixed)',      sc:_jState(2,1,1.5,+0.5)},
  {label:'2p₃/₂, mⱼ=−½ (mixed)',      sc:_jState(2,1,1.5,-0.5)},
  {label:'2p₁/₂, mⱼ=+½ (mixed)',      sc:_jState(2,1,0.5,+0.5)},
  {label:'2p₁/₂, mⱼ=−½ (mixed)',      sc:_jState(2,1,0.5,-0.5)},
  {label:'3d₅/₂, mⱼ=+½ (mixed)',      sc:_jState(3,2,2.5,+0.5)},
  {label:'3d₃/₂, mⱼ=+½ (mixed)',      sc:_jState(3,2,1.5,+0.5)},
];

// ════════════════════════════════════════════════════════════════
//  ORBITALS
// ════════════════════════════════════════════════════════════════
const ORBITALS=[
  {label:'1s',  n:1,l:0,m: 0},
  {label:'2s',  n:2,l:0,m: 0},
  {label:'2p₀', n:2,l:1,m: 0},
  {label:'2p+', n:2,l:1,m:+1},
  {label:'2p−', n:2,l:1,m:-1},
  {label:'3s',  n:3,l:0,m: 0},
  {label:'3p₀', n:3,l:1,m: 0},
  {label:'3p+', n:3,l:1,m:+1},
  {label:'3d₀', n:3,l:2,m: 0},
  {label:'3d+1',n:3,l:2,m:+1},
  {label:'3d−1',n:3,l:2,m:-1},
  {label:'3d+2',n:3,l:2,m:+2},
  // n = 4
  {label:'4s',  n:4,l:0,m: 0},
  {label:'4p₀', n:4,l:1,m: 0},
  {label:'4p+', n:4,l:1,m:+1},
  {label:'4d₀', n:4,l:2,m: 0},
  {label:'4d+1',n:4,l:2,m:+1},
  {label:'4d+2',n:4,l:2,m:+2},
  {label:'4f₀', n:4,l:3,m: 0},
  {label:'4f+3',n:4,l:3,m:+3},
  // n = 5
  {label:'5s',  n:5,l:0,m: 0},
  {label:'5p₀', n:5,l:1,m: 0},
  {label:'5p+', n:5,l:1,m:+1},
  {label:'5d₀', n:5,l:2,m: 0},
  {label:'5d+1',n:5,l:2,m:+1},
  {label:'5d+2',n:5,l:2,m:+2},
  {label:'5f₀', n:5,l:3,m: 0},
  {label:'5f+3',n:5,l:3,m:+3},
  {label:'5g₀', n:5,l:4,m: 0},
  {label:'5g+4',n:5,l:4,m:+4},
  // n = 6
  {label:'6s',  n:6,l:0,m: 0},
  {label:'6p₀', n:6,l:1,m: 0},
  {label:'6p+', n:6,l:1,m:+1},
  {label:'6d₀', n:6,l:2,m: 0},
  {label:'6d+1',n:6,l:2,m:+1},
  {label:'6d+2',n:6,l:2,m:+2},
  {label:'6f₀', n:6,l:3,m: 0},
  {label:'6f+3',n:6,l:3,m:+3},
  {label:'6g₀', n:6,l:4,m: 0},
  {label:'6g+4',n:6,l:4,m:+4},
  {label:'6h₀', n:6,l:5,m: 0},
  {label:'6h+5',n:6,l:5,m:+5},
];
// Real-orbital superpositions. To derive: ψ_real = Σ c_m · R(r)·Y_l^m(θ,φ)·e^{-iEt}
// With our Ylm convention (csPhase=(-1)^|m| for m<0):
//   Y₁⁺¹ = N·P·e^{+iφ}   Y₁⁻¹ = -N·P·e^{-iφ}
// p_x ∝ cos(φ): m=+1 cRe=+1/√2,  m=-1 cRe=-1/√2
// Degenerate pairs (same n, same E) → stationary particles.
// Different-n pairs (ΔE≠0) → oscillating ρ(t) → genuine particle dynamics.
//
// 1s+2s: canonical example from Tumulka / bohmian-mechanics.net.
//   Both spherically symmetric → density oscillates radially.
//   ΔE = E₁−E₂ = 1/2−1/8 = 3/8 a.u. → period = 2π/(3/8) ≈16.8 a.u.
//
// 2p⁺¹+3d⁺¹: same m=+1 → both have azimuthal phase e^{iφ} → particles circulate.
//   Different n → ΔE = 1/8−1/18 = 5/72 a.u. → period≈91 a.u. Density ring beats radially
//   while particles orbit. Most dynamic preset: circulation + beating combined.
const SUPERS={
  none:null,
  px:[{n:2,l:1,m:+1,cRe: 1/Math.SQRT2,cIm:0},{n:2,l:1,m:-1,cRe:-1/Math.SQRT2,cIm:0}],
  ss:[{n:1,l:0,m:0,cRe:1/Math.SQRT2,cIm:0},{n:2,l:0,m:0,cRe:1/Math.SQRT2,cIm:0}],
  sp:[{n:1,l:0,m:0,cRe:1/Math.SQRT2,cIm:0},{n:2,l:1,m:0,cRe:1/Math.SQRT2,cIm:0}],
  pd:[{n:2,l:1,m:0,cRe:1/Math.SQRT2,cIm:0},{n:3,l:2,m:0,cRe:1/Math.SQRT2,cIm:0}],
  circ:[{n:2,l:1,m:+1,cRe:1/Math.SQRT2,cIm:0},{n:3,l:2,m:+1,cRe:1/Math.SQRT2,cIm:0}],
};
// Tighter bounding-box overrides for presets whose density falls off quickly.
// Smaller box → better voxel resolution within the fixed VRES grid.
// px/ss/sp: both components are n≤2; virtually all density within 14 a₀.
// pd/circ: max n=3; density mostly within 24 a₀.
const SUPER_RM={px:14,ss:14,sp:14,pd:24,circ:24,spin_ss:14,spin_sp:14,spin_circ:24};

// Spin superpositions — each has a 'spinComps' (full spinor state) and
// 'comps' (scalar equivalent for density sampling and volume visualisation).
// Activating any of these automatically sets spinEnabled=true.
const SPIN_SUPERS={
  spin_ss:{
    spinComps:[
      {n:1,l:0,m:0,upRe:1/Math.SQRT2,upIm:0,dnRe:0,dnIm:0},
      {n:2,l:0,m:0,upRe:0,upIm:0,dnRe:1/Math.SQRT2,dnIm:0},
    ],
    comps:[{n:1,l:0,m:0,cRe:1/Math.SQRT2,cIm:0},{n:2,l:0,m:0,cRe:1/Math.SQRT2,cIm:0}],
  },
  spin_sp:{
    spinComps:[
      {n:1,l:0,m:0,upRe:1/Math.SQRT2,upIm:0,dnRe:0,dnIm:0},
      {n:2,l:1,m:0,upRe:0,upIm:0,dnRe:1/Math.SQRT2,dnIm:0},
    ],
    comps:[{n:1,l:0,m:0,cRe:1/Math.SQRT2,cIm:0},{n:2,l:1,m:0,cRe:1/Math.SQRT2,cIm:0}],
  },
  spin_circ:{
    spinComps:[
      {n:2,l:1,m:+1,upRe:1/Math.SQRT2,upIm:0,dnRe:0,dnIm:0},
      {n:3,l:2,m:+1,upRe:0,upIm:0,dnRe:1/Math.SQRT2,dnIm:0},
    ],
    comps:[{n:2,l:1,m:+1,cRe:1/Math.SQRT2,cIm:0},{n:3,l:2,m:+1,cRe:1/Math.SQRT2,cIm:0}],
  },
};

// Exact ⟨r⟩ = a₀/2 * (3n² - l(l+1))
function exactR(n,l){return 0.5*(3*n*n-l*(l+1));}

const INFO={
  '1s':'Ground state. m=0 → real ψ → Im(∇ψ/ψ)=0. Particles are stationary.',
  '2s':'Two radial shells. Node at r≈2a₀. Stationary particles.',
  '2p₀':'2p_z dumbbell. Real ψ, stationary. Nodal plane at z=0.',
  '2p+':'m=+1 → ψ∝e^{+iφ}. CCW azimuthal particle circulation: v_φ=1/(r sinθ).',
  '2p−':'m=−1 → ψ∝e^{−iφ}. Clockwise circulation. Same |ψ|² as 2p+.',
  '3s':'Three concentric shells. Stationary.',
  '3p₀':'3p_z elongated dumbbell with inner radial node. Stationary.',
  '3p+':'m=+1, n=3. CCW circulation over toroidal density ring.',
  '3d₀':'3d_z² double-cone. Stationary.',
  '3d+1':'m=+1. Azimuthal particle circulation, double-ring density.',
  '3d−1':'m=−1. CW circulation.',
  '3d+2':'m=+2. Fastest circulation: v_φ=2/(r sinθ). Strong toroidal current.',
  '4s':'n=4 s-state. 3 radial nodes. Real ψ, stationary. Spread over ~80 a₀.',
  '4p₀':'n=4 p_z. 2 radial nodes plus equatorial node. Real ψ, stationary.',
  '4p+':'m=+1. CCW azimuthal circulation. Density forms thick torus at ~40 a₀.',
  '4d₀':'n=4 d_z² type. 1 radial node. Real ψ, stationary.',
  '4d+1':'m=+1. Azimuthal circulation. Layered toroidal density.',
  '4d+2':'m=+2. v_φ=2/(r sinθ). Double-ring fast circulation.',
  '4f₀':'n=4 f orbital, m=0. No radial nodes. Axially symmetric nodal cones. Stationary.',
  '4f+3':'m=+3. Maximum l=3 circulation: v_φ=3/(r sinθ). Equatorial ring current.',
  // n=5
  '5s':'n=5 s-state. 4 radial nodes. Real ψ, stationary. Extends ~125 a₀.',
  '5p₀':'n=5 p_z. 3 radial nodes plus equatorial nodal plane. Stationary.',
  '5p+':'m=+1. CCW azimuthal circulation over extended torus (~80 a₀).',
  '5d₀':'n=5 d_z² type. 2 radial nodes. Real ψ, stationary.',
  '5d+1':'m=+1. Azimuthal circulation. Multi-ring layered toroidal density.',
  '5d+2':'m=+2. v_φ=2/(r sinθ). Fast double-ring circulation.',
  '5f₀':'n=5 f orbital, m=0. 1 radial node. Nodal cones. Stationary.',
  '5f+3':'m=+3. v_φ=3/(r sinθ). Ring current with radial envelope.',
  '5g₀':'n=5 g orbital, m=0. l=4, no radial nodes. Stationary. Complex nodal structure.',
  '5g+4':'m=+4. Maximum l=4 circulation: v_φ=4/(r sinθ). Dense equatorial ring.',
  // n=6
  '6s':'n=6 s-state. 5 radial nodes. Spread over ~200 a₀. Stationary.',
  '6p₀':'n=6 p_z. 4 radial nodes. Elongated along z. Stationary.',
  '6p+':'m=+1. CCW circulation. Very extended torus.',
  '6d₀':'n=6 d_z² type. 3 radial nodes. Stationary.',
  '6d+1':'m=+1. Layered toroidal density. Circulation.',
  '6d+2':'m=+2. Fast double-ring current.',
  '6f₀':'n=6 f orbital, m=0. 2 radial nodes. Stationary.',
  '6f+3':'m=+3. Ring current. 2 radial nodes.',
  '6g₀':'n=6 g orbital, m=0. l=4. 1 radial node. Stationary.',
  '6g+4':'m=+4. Maximum g-orbital circulation.',
  '6h₀':'n=6 h orbital, m=0. l=5, no radial nodes. Highest angular momentum at n=6. Stationary.',
  '6h+5':'m=+5. Maximum l=5 circulation: v_φ=5/(r sinθ). Extreme equatorial ring current.',
};

// ════════════════════════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════════════════════════
let orbIdx=3,superKey='none';
let selectedN=ORBITALS[3].n; // n-shell shown in sub-grid (defaults to n=2) 
let nPart=2,simSpeed=1.0,trailLen=800,dtStep=0.04;
const BASE_SPEED=20;
let running=true;

const PT_PRESETS=[
  {hue:190,r:0,  g:229,b:255,hex:'#00e5ff',label:'Cyan'},
  {hue:38, r:255,g:183,b:77, hex:'#ffb74d',label:'Amber'},
  {hue:280,r:204,g:128,b:255,hex:'#cc80ff',label:'Violet'},
  {hue:140,r:105,g:240,b:174,hex:'#69f0ae',label:'Green'},
  {hue:210,r:100,g:170,b:255,hex:'#64aaff',label:'Blue'},
  {hue:0,  r:255,g:255,b:255,hex:'#ffffff',label:'White'},
];
let ptColor=PT_PRESETS[0];

let densOp=0.60,isoOp=0.00,ptSize=2.5,lobeThresh=0.12,showAxes=false;
let lightTheme=false,showInset=false,showProjections=false;
let projData={xz:null,xy:null,yz:null},projDirty=true;
let projVolCache=null; // {xz,xy,yz} offscreen canvases — volumetric render matching main canvas
let projPanelHitBoxes=[]; // [{plane,x,y,w,h}] — rebuilt each frame by drawProjectionPanels
let showVol=true,showSlice=false,showLobes=false,showPhase=false,showCloud=false;
// Volume / Slices / Lobes / Cloud are a radio group (only one active).
// Phase is an additive overlay compatible with Volume, Slices, Lobes.

// ---- Cloud particle mode state ----
let cloudSpherePx=10;      // sphere sprite diameter in screen pixels (user slider)
                           // cloudN is auto-computed — see autoCloudN()
                           // (particles[] serves both roles — cloud or trail)
let cloudSprite=null;      // pre-rendered sphere sprite (rebuilt when colour changes)

// Auto-compute cloud particle count: pack non-overlapping spheres of diameter
// cloudSpherePx into the projected orbital area.
// Formula: 0.65 × (canvasDim / spherePx)² × √n — stays non-overlapping on
// average, scales up for higher-n orbitals (larger lobes).
function autoCloudN(){
  const dim=Math.min(W||600,H||600);
  const maxN=comps.reduce((a,c)=>Math.max(a,c.n),1);
  const base=Math.round(0.65*(dim/cloudSpherePx)**2*Math.sqrt(maxN));
  return Math.max(50,Math.min(40000,base));
}

let slicePlane='xz';
let t=0,comps=[],particles=[];
let camTheta=0.55,camPhi=0.5,camDist=1.25;
let preferSliceFallback=false;

// ════════════════════════════════════════════════════════════════
//  SPIN — Pauli–Bohmian extension (completely non-destructive)
//  Toggle spinEnabled to switch between the original scalar-Bohm
//  guidance equation and the full Pauli–Bohm equation which adds
//  a spin-current term (∇×S)/(2ρ) — making ALL m=0 orbitals
//  non-stationary and modifying the velocity of m≠0 orbitals.
// ════════════════════════════════════════════════════════════════
let spinEnabled  = false;           // master gate — false → exactly original behaviour
let spinMode     = 'product';       // 'product': orbital × spin-state  |  'jstate': spin-orbit eigenstate
let spinTheta    = Math.PI/2;       // spin polar angle  (π/2 = equatorial, breaks azimuthal symmetry)
let spinPhi      = 0;               // spin azimuthal angle
let spinComps    = [];              // spinor components [{n,l,m, upRe,upIm,dnRe,dnIm},...]
let voxelRhoUp   = null;           // Float32Array[VRES³] — |ψ↑|²  (allocated only when spinEnabled)
let voxelRhoDn   = null;           // Float32Array[VRES³] — |ψ↓|²
let spinUpColor  = {r:0,  g:229,b:255,hex:'#00e5ff'};  // ↑ channel colour (cyan)
let spinDnColor  = {r:224,g:64, b:251,hex:'#e040fb'};  // ↓ channel colour (magenta)
let dragging=false,lastMX=0,lastMY=0;

function buildComps(){
  if(SPIN_SUPERS[superKey]){
    // ── Spin superposition preset ──────────────────────────────────
    const sp=SPIN_SUPERS[superKey];
    comps=sp.comps.map(c=>({...c}));  // scalar equiv for sampling/visualisation
    spinComps=sp.spinComps.map(c=>({...c}));
    spinEnabled=true; spinMode='product';
    showPhase=false;
  } else if(superKey!=='none'&&SUPERS[superKey]){
    comps=SUPERS[superKey].map(c=>({...c}));
    if(spinEnabled){spinMode='product';buildSpinComps();}
  } else {
    const o=ORBITALS[orbIdx];comps=[{n:o.n,l:o.l,m:o.m,cRe:1,cIm:0}];
    if(spinEnabled){
      if(spinMode==='jstate'&&superKey==='none') _refreshJStateDropdown();
      else buildSpinComps();
    }
  }
  invalidateDensity();
  _syncSpinUI();
}

// A single source of Born density for every renderer and sampler.
function densityAt(x,y,z,time){
  return spinEnabled&&spinComps.length
    ? rhoSpinAt(spinComps,x,y,z,time)
    : rhoAt(comps,x,y,z,time);
}

function densityEvolves(){
  // The spin presets have orthogonal spin channels; their individual densities are stationary.
  return !SPIN_SUPERS[superKey] && comps.some(c=>c.n!==comps[0].n);
}

function invalidateDensity(){
  sliceDirty=true; volumeDirty=true; lobeTexDirty=true; volNeedsRedraw=true;
  projDirty=true; projVolCache=null;
}

function initCloudParts(){
  buildCloudSprite();
  // Auto-derive count from sphere size and orbital extent
  const n=autoCloudN();
  particles=sampleParticlesStratified(n,t);
  // For pure m≠0 eigenstates, |ψ|² is azimuthally symmetric (no φ dependence).
  // Bohmian motion only rotates φ — it never changes ρ=√(x²+y²) or z.
  // Randomising φ at init gives a uniform azimuthal distribution; rotating a
  // uniform distribution by any (ρ-dependent) angle keeps it uniform forever.
  // This prevents Cartesian-grid sampling asymmetry from winding into a spiral.
  if(!spinEnabled&&comps.length===1&&comps[0].m!==0){
    for(const p of particles){
      const rho=Math.sqrt(p.x*p.x+p.y*p.y);
      const phi=Math.random()*2*Math.PI;
      p.x=rho*Math.cos(phi); p.y=rho*Math.sin(phi);
    }
  }
  // Fisher-Yates shuffle so draw order has no systematic z-bias from the
  // CDF walk order (which fills the array roughly sorted by x then z).
  // Without this, particles with z<0 are always drawn before z>0 particles,
  // making the near lobe consistently overdraw the far lobe on every frame.
  for(let i=particles.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    const tmp=particles[i];particles[i]=particles[j];particles[j]=tmp;
  }
  // Update readonly count label in sidebar
  const lbl=document.getElementById('vAutoN');
  if(lbl)lbl.textContent=particles.length;
}

// Pre-render a shaded sphere sprite once; reused for every particle draw.
// drawImage() is ~5× faster than arc()+fill() per particle, enabling 50 K dots.
function buildCloudSprite(){
  const S=cloudSpherePx,r=S/2;
  const oc=document.createElement('canvas');
  oc.width=oc.height=S;
  const c=oc.getContext('2d');
  // Highlight offset left-only — vertical position stays at r (sprite centre y)
  // so the brightness centroid of each sphere is at the particle's screen position.
  // A vertical offset shifts ALL particles the same direction, displacing the
  // whole cloud's visual centre away from the nucleus.
  const g=c.createRadialGradient(r*0.38,r,0,r,r,r);
  g.addColorStop(0,  'rgba(255,255,255,0.92)');
  g.addColorStop(0.30,`rgba(${ptColor.r},${ptColor.g},${ptColor.b},0.88)`);
  g.addColorStop(0.65,`rgba(${ptColor.r>>1},${ptColor.g>>1},${ptColor.b>>1},0.55)`);
  g.addColorStop(1,  'rgba(0,0,0,0)');
  c.fillStyle=g;
  c.beginPath();c.arc(r,r,r,0,6.2832);c.fill();
  cloudSprite=oc;
}

function rotateAroundZ(p,angle){
  const cosine=Math.cos(angle), sine=Math.sin(angle);
  const x=p.x*cosine-p.y*sine;
  p.y=p.x*sine+p.y*cosine;
  p.x=x;
}

function stepCloudParticles(dt){
  if(densityEvolves()){
    // A fresh sample represents the changing Born density. Individual dots in
    // this mode are not presented as continuous trajectories.
    particles=sampleParticlesStratified(autoCloudN(),t);
  } else if(!spinEnabled&&comps.length===1&&comps[0].m!==0){
    for(const p of particles){
      const radiusSquared=p.x*p.x+p.y*p.y;
      if(radiusSquared>1e-14) rotateAroundZ(p,comps[0].m*dt/radiusSquared);
    }
  }
}

function renderCloudCanvas(cam){
  if(!showCloud||!particles.length)return;
  if(!cloudSprite)buildCloudSprite();
  const S=cloudSprite.width,hs=S/2;
  const baseAlpha=Math.min(1,densOp*1.5);
  ctx.save();
  ctx.globalAlpha=baseAlpha;
  if(spinEnabled&&spinComps.length){
    // Dual-channel spin rendering: each particle coloured by its ↑/↓ weight
    // Uses arc+fill per particle (slower but required for per-particle colour).
    for(const p of particles){
      const[sx,sy]=proj(p.x,p.y,p.z,cam);
      const w=p.spinW??0.5;
      const r=(spinUpColor.r*w+spinDnColor.r*(1-w))|0;
      const g=(spinUpColor.g*w+spinDnColor.g*(1-w))|0;
      const b=(spinUpColor.b*w+spinDnColor.b*(1-w))|0;
      const gr=ctx.createRadialGradient(sx-hs*0.38,sy,0,sx,sy,hs);
      gr.addColorStop(0,'rgba(255,255,255,0.90)');
      gr.addColorStop(0.30,`rgba(${r},${g},${b},0.85)`);
      gr.addColorStop(0.65,`rgba(${r>>1},${g>>1},${b>>1},0.52)`);
      gr.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath();ctx.arc(sx,sy,hs,0,6.2832);
      ctx.fillStyle=gr;ctx.fill();
    }
  }else{
    // Do NOT depth-sort: equal probability elements, no physical z-ordering.
    for(const p of particles){
      const[sx,sy]=proj(p.x,p.y,p.z,cam);
      ctx.drawImage(cloudSprite,sx-hs,sy-hs);
    }
  }
  // Nucleus at geometric centre — on top
  ctx.globalAlpha=1;
  const[nnx,nny]=proj(0,0,0,cam);
  const ng=ctx.createRadialGradient(nnx,nny,0,nnx,nny,12);
  ng.addColorStop(0,'rgba(255,140,60,1)');ng.addColorStop(0.4,'rgba(255,60,20,.6)');ng.addColorStop(1,'rgba(255,30,0,0)');
  ctx.beginPath();ctx.arc(nnx,nny,12,0,Math.PI*2);ctx.fillStyle=ng;ctx.fill();
  ctx.restore();
}
function rMax(){
  // Spin superposition presets have their own rm override
  if(SUPER_RM[superKey]) return SUPER_RM[superKey];
  // When a superposition is active, grid must accommodate the highest-n component.
  if(superKey!=='none'&&SUPERS[superKey]){
    const maxN=comps.reduce((a,c)=>Math.max(a,c.n),1);
    return Math.max(8,maxN*maxN*7);
  }
  const o=ORBITALS[orbIdx];
  // Tighter bound: outermost classical turning point ≈ n²(1+e), e=√(1-(l+½)²/n²).
  // Formula n*(2n + 1.5l + 5) matches within 15% and avoids the 3x overestimate
  // of n²*7 for high-n/low-l states (crucial: grid step ∝ rMax/G).
  if(!o)return 15;
  return Math.max(15, Math.round(o.n*(2*o.n + 1.5*o.l + 5)));
}

// Stratified CDF sampling: builds a 3-D density grid, computes the cumulative
// weight function, then draws exactly one particle per equal-probability stratum.
// IMPORTANT: grid is uniform Cartesian (dV = step³), so the correct weight is
// simply |ψ|² — NOT |ψ|²·r².  The r² Jacobian is only needed when sampling in
// spherical coordinates (as in the rejection sampler below).
function sampleParticlesStratified(n, sampleT=0){
  const rm=rMax();
  // Grid resolution: at minimum we need ~10 voxels per n-shell so radial nodes
  // are resolved. Use the larger of the particle-count heuristic and 10×maxN.
  const maxOrbN=comps.reduce((a,c)=>Math.max(a,c.n),1);
  // Raise cap to 100: G³ rhoAt calls are one-time init cost (~1s at G=100 for n=6).
  // 12×maxOrbN ensures radial nodes are resolved (was 10×).
  const G=Math.max(20,Math.min(100,Math.max(Math.ceil(Math.cbrt(n*8)),12*maxOrbN)));
  const step=2*rm/(G-1);
  const wt=new Float32Array(G*G*G);
  let total=0;
  for(let i=0;i<G;i++){const x=-rm+i*step;
    for(let j=0;j<G;j++){const y=-rm+j*step;
      for(let k=0;k<G;k++){const z=-rm+k*step;
        const w=densityAt(x,y,z,sampleT);
        const idx=i*G*G+j*G+k; wt[idx]=w; total+=w;
      }}}
  if(total<1e-30)return [];
  // Build normalised CDF over flattened voxel array
  const cdf=new Float32Array(G*G*G);
  let cum=0;
  for(let i=0;i<wt.length;i++){cum+=wt[i]/total;cdf[i]=cum;}
  // Stratified draw: target for stratum p is (p + U[0,1]) / n
  const pts=[];
  let ci=0;
  for(let p=0;p<n;p++){
    const target=(p+Math.random())/n;
    while(ci<wt.length-1&&cdf[ci]<target)ci++;
    const gi=ci/(G*G)|0, gj=(ci/G|0)%G, gk=ci%G;
    // Jitter symmetrically around the grid point with 1.5× voxel width.
    // ±0.5×step confines each particle to its own voxel, making voxel boundaries
    // subtly visible. ±0.75×step blurs across neighbours while keeping the mean
    // exactly at the grid point, eliminating the grid appearance.
    const x=-rm+gi*step+(Math.random()-0.5)*step*1.5;
    const y=-rm+gj*step+(Math.random()-0.5)*step*1.5;
    const z=-rm+gk*step+(Math.random()-0.5)*step*1.5;
    const particle={x,y,z,trail:[],age:0};
    if(spinEnabled&&spinComps.length){
      const [ur,ui,dr,di]=psiSpinor(spinComps,x,y,z,sampleT);
      const up=ur*ur+ui*ui;
      particle.spinW=up/(up+dr*dr+di*di||1);
    }
    pts.push(particle);
  }
  return pts;
}

// Rejection sampling — used for trail-mode particles (small n, no cloud).
function sampleParticles(n, sampleT=0){
  const rm=rMax();let maxR=1e-30;
  for(let i=0;i<3000;i++){
    const r=Math.random()*rm,th=Math.acos(2*Math.random()-1),ph=Math.random()*2*Math.PI;
    const v=densityAt(r*Math.sin(th)*Math.cos(ph),r*Math.sin(th)*Math.sin(ph),r*Math.cos(th),sampleT)*r*r;
    if(v>maxR)maxR=v;
  }
  maxR*=1.2;
  const pts=[];let tries=0;
  const maxTries=Math.min(n*200,800000);
  while(pts.length<n&&tries<maxTries){
    tries++;
    const r=Math.random()*rm,th=Math.acos(2*Math.random()-1),ph=Math.random()*2*Math.PI;
    const x=r*Math.sin(th)*Math.cos(ph),y=r*Math.sin(th)*Math.sin(ph),z=r*Math.cos(th);
    if(Math.random()<densityAt(x,y,z,sampleT)*r*r/maxR)pts.push({x,y,z,trail:[],age:0});
  }
  return pts;
}

// Compute ⟨r⟩ numerically from voxel grid for verification
function computeMeanR(voxelVals,voxelN,rm){
  let sumRho=0,sumRRho=0;
  const step=2*rm/(voxelN-1);
  for(let i=0;i<voxelN;i++)for(let j=0;j<voxelN;j++)for(let k=0;k<voxelN;k++){
    const x=-rm+i*step,y=-rm+j*step,z=-rm+k*step;
    const r=Math.sqrt(x*x+y*y+z*z);
    const rho=voxelVals[i*voxelN*voxelN+j*voxelN+k];
    sumRho+=rho;sumRRho+=rho*r;
  }
  return sumRho>0?sumRRho/sumRho:0;
}

// ════════════════════════════════════════════════════════════════
//  CANVAS & CAMERA
// ════════════════════════════════════════════════════════════════
const canvas=document.getElementById('c');
const ctx=canvas.getContext('2d');
let W=0,H=0;
let sliceDirty=true,volumeDirty=true;
// WebGL2 lobe renderer state (declared here so resize() can reference lobeGLCanvas)
let gl2=null,lobeGLCanvas=null,lobeProg=null,lobeVAO=null;
let lobeDensTex=null,lobeSignTex=null,lobeUnif={};
let phasePalTex=null; // 256×1 RGBA 2D texture for phase palette
let densPalTex=null;  // 256×1 RGBA 2D texture for density palette
let gl2Ready=false,lobeTexDirty=true;

function resize(){
  const wrap=canvas.parentElement;
  if(!wrap.clientWidth||!wrap.clientHeight||(W===wrap.clientWidth&&H===wrap.clientHeight)) return;
  W=canvas.width=wrap.clientWidth;
  H=canvas.height=wrap.clientHeight;
  if(lobeGLCanvas){lobeGLCanvas.width=W;lobeGLCanvas.height=H;}
  sliceDirty=true;volumeDirty=true;
}
resize();
new ResizeObserver(resize).observe(canvas.parentElement);

function getCam(){
  const sT=Math.sin(camTheta),cT=Math.cos(camTheta),sP=Math.sin(camPhi),cP=Math.cos(camPhi);
  const fx=sT*cP,fy=sT*sP,fz=cT;
  const rl=Math.sqrt(fx*fx+fy*fy)||1e-9;
  const rx=fy/rl,ry=-fx/rl,rz=0;
  const upx=ry*fz,upy=-rx*fz,upz=rx*fy-ry*fx;
  return{fx,fy,fz,rx,ry,rz,upx,upy,upz};
}
function proj(x,y,z,cam){
  const sc=Math.min(W,H)*0.47/rMax()*camDist;
  return[W/2+(x*cam.rx+y*cam.ry+z*cam.rz)*sc,
         H/2-(x*cam.upx+y*cam.upy+z*cam.upz)*sc,
         x*cam.fx+y*cam.fy+z*cam.fz,sc];
}

// ════════════════════════════════════════════════════════════════
//  COLORMAP  — palette system
// ════════════════════════════════════════════════════════════════
const PALETTES={
  cyan:   [[0,2,20],[0,40,120],[0,160,220],[60,230,255],[255,255,255]],
  hot:    [[0,0,0],[160,0,0],[255,100,0],[255,220,0],[255,255,255]],
  viridis:[[68,1,84],[72,40,120],[33,144,141],[79,193,77],[253,231,37]],
  plasma: [[13,8,135],[126,3,168],[204,71,120],[248,149,64],[240,249,33]],
  inferno:[[0,0,4],[51,13,96],[142,36,103],[237,121,83],[252,255,164]],
};
const PAL_META=[
  {key:'cyan',  label:'Cyan',   grad:'linear-gradient(90deg,rgb(0,2,20),rgb(0,160,220),rgb(60,230,255),#fff)'},
  {key:'hot',   label:'Hot',    grad:'linear-gradient(90deg,#000,#a00,#ff6400,#ffdc00,#fff)'},
  {key:'viridis',label:'Viridis',grad:'linear-gradient(90deg,rgb(68,1,84),rgb(33,144,141),rgb(79,193,77),rgb(253,231,37))'},
  {key:'plasma', label:'Plasma', grad:'linear-gradient(90deg,rgb(13,8,135),rgb(126,3,168),rgb(204,71,120),rgb(248,149,64),rgb(240,249,33))'},
  {key:'inferno',label:'Inferno',grad:'linear-gradient(90deg,rgb(0,0,4),rgb(51,13,96),rgb(142,36,103),rgb(237,121,83),rgb(252,255,164))'},
];
let densityPalette='cyan';

// ---- Phase palettes (cyclic colormaps) ----
// RGB stop tables [0-255]; first == last to close the cycle.
const PHASE_PALS={
  // hsv: handled analytically via hsvToRgb, no stop table needed
  twilight:[[29,32,110],[109,82,162],[186,153,214],[250,239,220],[220,140,90],[197,92,38],[29,32,110]],
  phase4:  [[220,50,30],[235,200,0],[0,200,220],[55,55,220],[220,50,30]],
};
const PHASE_PAL_META=[
  {key:'hsv',      label:'HSV',      grad:'linear-gradient(90deg,hsl(0,90%,50%),hsl(60,90%,50%),hsl(120,90%,50%),hsl(180,90%,50%),hsl(240,90%,50%),hsl(300,90%,50%),hsl(360,90%,50%))'},
  {key:'twilight', label:'Twilight', grad:'linear-gradient(90deg,#1d2073,#6d52a2,#b999d6,#faeedd,#dc8c5a,#c45c26,#1d2073)'},
  {key:'phase4',   label:'4-Phase',  grad:'linear-gradient(90deg,#dc3220,#ebc800,#00c8dc,#3737dc,#dc3220)'},
];
let phasePalette='hsv';

function palColor(v,pal){
  const stops=PALETTES[pal]||PALETTES.cyan;
  const n=stops.length-1;
  const pos=Math.max(0,Math.min(1,v))*n;
  const i=Math.min(n-1,pos|0); const f=pos-i;
  const a=stops[i],b=stops[i+1];
  return[(a[0]+(b[0]-a[0])*f)|0,(a[1]+(b[1]-a[1])*f)|0,(a[2]+(b[2]-a[2])*f)|0];
}

// HSL → [r,g,b] 0-255 each; h∈[0,1] s∈[0,1] l∈[0,1]
function hslToRgb(h,s,l){
  const a=s*Math.min(l,1-l);
  const f=(n,k=(n+h*12)%12)=>l-a*Math.max(-1,Math.min(k-3,9-k,1));
  return[f(0)*255|0,f(8)*255|0,f(4)*255|0];
}
// HSV → [r,g,b] — standard domain-coloring encoding:
//   h=0 → red (phase=0, positive real)
//   h=½ → cyan (phase=π, negative real)
function hsvToRgb(h,s,v){
  const f=(n,k=(n+h*6)%6)=>v-v*s*Math.max(0,Math.min(k,4-k,1));
  return[f(5)*255|0,f(3)*255|0,f(1)*255|0];
}

// Shared phase color lookup used by all CPU renderers (slice, volume, lobe fallback)
// h ∈ [0,1], bri ∈ [0,1] (brightness / amplitude weight)
function phaseColorCpu(h,bri=1){
  h=((h%1)+1)%1;
  if(phasePalette==='hsv'||!PHASE_PALS[phasePalette]) return hsvToRgb(h,0.95,bri);
  const stops=PHASE_PALS[phasePalette],n=stops.length-1;
  const pos=h*n,idx=Math.min(n-1,pos|0),f=pos-idx;
  const a=stops[idx],b=stops[idx+1];
  return[((a[0]+(b[0]-a[0])*f)*bri)|0,((a[1]+(b[1]-a[1])*f)*bri)|0,((a[2]+(b[2]-a[2])*f)*bri)|0];
}

// Build a flat 256×1 RGBA palette for the GPU density texture
function buildDensPal256(){
  const data=new Uint8Array(256*4);
  for(let i=0;i<256;i++){
    const[r,g,b]=palColor(i/255,densityPalette);
    data[i*4]=r;data[i*4+1]=g;data[i*4+2]=b;data[i*4+3]=255;
  }
  return data;
}

// Build a flat 256×1 RGBA palette for the GPU phase texture
function buildPhasePal256(){
  const data=new Uint8Array(256*4);
  for(let i=0;i<256;i++){
    const[r,g,b]=phaseColorCpu(i/256,1);
    data[i*4]=r;data[i*4+1]=g;data[i*4+2]=b;data[i*4+3]=255;
  }
  return data;
}

// For slices
function sliceCol(v){return palColor(v,densityPalette);}

// For volume: returns {r,g,b} in 0-255, a in 0-1
function volColor(v){
  const[r,g,b]=palColor(v,densityPalette);
  const a=v<0.3?v/0.3*0.6:v<0.7?0.6+(v-0.3)/0.4*0.35:0.95+(v-0.7)/0.3*0.05;
  return{r,g,b,a};
}

// ════════════════════════════════════════════════════════════════
//  SLICE PLANES
// ════════════════════════════════════════════════════════════════
const SRES=90;
function computeSlice(plane){
  const N=SRES,rm=rMax();
  const vals=new Float32Array(N*N);let maxV=1e-30;
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){
    const u=(i/(N-1))*2*rm-rm,v=(j/(N-1))*2*rm-rm;
    let x=0,y=0,z=0;
    if(plane==='xz'){x=u;z=-v;}
    else if(plane==='xy'){x=u;y=-v;}
    else{y=u;z=-v;}
    const d=densityAt(x,y,z,t);
    vals[j*N+i]=d;if(d>maxV)maxV=d;
  }
  const img=new ImageData(N,N);
  for(let k=0;k<N*N;k++){
    const vn=Math.pow(vals[k]/maxV,0.42);
    const[r,g,b]=sliceCol(vn);
    img.data[k*4]=r;img.data[k*4+1]=g;img.data[k*4+2]=b;img.data[k*4+3]=vn*255|0;
  }
  return{vals,img,maxV,N,rm};
}

let sliceData={xz:null,xy:null,yz:null};
function buildSlices(){
  if(slicePlane==='all'||slicePlane==='xz')sliceData.xz=computeSlice('xz');
  if(slicePlane==='all'||slicePlane==='xy')sliceData.xy=computeSlice('xy');
  if(slicePlane==='all'||slicePlane==='yz')sliceData.yz=computeSlice('yz');
  sliceDirty=false;
}

// Phase slice — standard domain coloring:
//   hue   = arg(ψ)  [red=0, yellow=+π/3, cyan=±π, blue=-π/2, magenta=-π/3]
//   value = |ψ|^0.4 (brightness → black at nodes, vivid colour where ψ is large)
//   alpha = |ψ|^0.25 × 235 (mostly opaque in dense regions, lets 3D show through at nodes)
function computePhaseSlice(plane,tVal){
  const N=SRES,rm=rMax();
  const rhos=new Float32Array(N*N),phases=new Float32Array(N*N);
  let maxRho=1e-30;
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){
    const u=(i/(N-1))*2*rm-rm,v=(j/(N-1))*2*rm-rm;
    let x=0,y=0,z=0;
    if(plane==='xz'){x=u;z=-v;}
    else if(plane==='xy'){x=u;y=-v;}
    else{y=u;z=-v;}
    const[re,im]=psiXYZ(comps,x,y,z,tVal);
    const rho=re*re+im*im;
    const k=j*N+i;
    rhos[k]=rho;if(rho>maxRho)maxRho=rho;
    phases[k]=Math.atan2(im,re);
  }
  const img=new ImageData(N,N);
  for(let k=0;k<N*N;k++){
    const amp=Math.pow(rhos[k]/maxRho,0.2);  // linear ψ amplitude normalised
    const h=((phases[k]/(2*Math.PI))%1+1)%1; // [0,1], phase=0 → red
    const[r,g,b]=phaseColorCpu(h,Math.pow(amp,2)); // palette-aware, brightness ∝ |ψ|^0.4
    img.data[k*4]=r;img.data[k*4+1]=g;img.data[k*4+2]=b;
    img.data[k*4+3]=Math.pow(amp,0.5)*235|0; // alpha ∝ |ψ|^0.25
  }
  return{img,N,rm};
}
let phaseSliceData={xz:null,xy:null,yz:null};
function buildPhaseSlices(tVal){
  if(slicePlane==='all'||slicePlane==='xz')phaseSliceData.xz=computePhaseSlice('xz',tVal);
  if(slicePlane==='all'||slicePlane==='xy')phaseSliceData.xy=computePhaseSlice('xy',tVal);
  if(slicePlane==='all'||slicePlane==='yz')phaseSliceData.yz=computePhaseSlice('yz',tVal);
}

function drawSlice(sd,plane,cam,alpha){
  if(!sd||alpha<0.01)return;
  const{N,rm}=sd;
  let C;
  if(plane==='xz')C=[[-rm,0,rm],[rm,0,rm],[rm,0,-rm],[-rm,0,-rm]];
  else if(plane==='xy')C=[[-rm,-rm,0],[rm,-rm,0],[rm,rm,0],[-rm,rm,0]];
  else C=[[0,-rm,rm],[0,rm,rm],[0,rm,-rm],[0,-rm,-rm]];
  const ps=C.map(([x,y,z])=>proj(x,y,z,cam));
  const tmp=document.createElement('canvas');tmp.width=N;tmp.height=N;
  tmp.getContext('2d').putImageData(sd.img,0,0);
  const[ax,ay]=ps[0],[bx,by]=ps[1],[dx,dy]=ps[3];
  ctx.save();ctx.globalAlpha=alpha;
  ctx.setTransform((bx-ax)/N,(by-ay)/N,(dx-ax)/N,(dy-ay)/N,ax,ay);
  ctx.drawImage(tmp,0,0);ctx.resetTransform();
  ctx.globalAlpha=alpha*0.3;ctx.strokeStyle='rgba(80,160,255,0.6)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(ps[0][0],ps[0][1]);
  ps.forEach(p=>ctx.lineTo(p[0],p[1]));ctx.closePath();ctx.stroke();
  ctx.restore();
}

function marchingSquares(vals,N,rm,threshold,plane){
  const segs=[];
  const LUT=[[],[0,3],[0,1],[1,3],[1,2],[0,3,1,2],[0,2],[2,3],[2,3],[0,2],[0,1,2,3],[1,2],[1,3],[0,1],[0,3],[]];
  const LUT5=[0,3,1,2],LUT10=[0,1,2,3];
  const vv=(i,j)=>(i<0||j<0||i>=N||j>=N)?0:vals[j*N+i];
  for(let i=0;i<N-1;i++)for(let j=0;j<N-1;j++){
    const v00=vv(i,j),v10=vv(i+1,j),v01=vv(i,j+1),v11=vv(i+1,j+1);
    const cas=((v00>threshold)?8:0)|((v10>threshold)?4:0)|((v11>threshold)?2:0)|((v01>threshold)?1:0);
    if(cas===0||cas===15)continue;
    const u0=(i/(N-1))*2*rm-rm,u1=((i+1)/(N-1))*2*rm-rm;
    const w0=(j/(N-1))*2*rm-rm,w1=((j+1)/(N-1))*2*rm-rm;
    const lerp=(va,vb)=>va===vb?0.5:Math.max(0,Math.min(1,(threshold-va)/(vb-va)));
    const top=[u0+(u1-u0)*lerp(v00,v10),w0];
    const right=[u1,w0+(w1-w0)*lerp(v10,v11)];
    const bottom=[u0+(u1-u0)*lerp(v01,v11),w1];
    const left=[u0,w0+(w1-w0)*lerp(v00,v01)];
    const pts=[top,right,bottom,left];
    const edges=(cas===5)?LUT5:(cas===10)?LUT10:LUT[cas];
    const toW=(u,w)=>plane==='xz'?[u,0,-w]:plane==='xy'?[u,-w,0]:[0,u,-w];
    for(let e=0;e<edges.length;e+=2)
      segs.push([toW(pts[edges[e]][0],pts[edges[e]][1]),toW(pts[edges[e+1]][0],pts[edges[e+1]][1])]);
  }
  return segs;
}

function drawIso(sd,plane,cam,alpha){
  if(!sd||alpha<0.01)return;
  const{vals,N,rm,maxV}=sd;if(maxV<1e-30)return;
  ctx.save();
  for(const[thresh,lw,la,color]of[
    [maxV*0.50,1.5,0.95,'rgba(0,230,255,1)'],
    [maxV*0.15,0.8,0.45,'rgba(80,170,255,1)'],
  ]){
    const segs=marchingSquares(vals,N,rm,thresh,plane);
    ctx.globalAlpha=alpha*la;ctx.strokeStyle=color;ctx.lineWidth=lw;
    for(const[wA,wB]of segs){
      const[ax,ay]=proj(wA[0],wA[1],wA[2],cam);
      const[bx,by]=proj(wB[0],wB[1],wB[2],cam);
      ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();
    }
  }
  ctx.restore();
}

// ════════════════════════════════════════════════════════════════
//  VOLUME RENDERER
//  Strategy: compute |ψ|² on a 3D voxel grid, then for each
//  screen pixel cast a ray through the volume and composite
//  front-to-back with alpha accumulation (direct volume rendering).
//  Resolution is kept low (~64³) for real-time performance.
// ════════════════════════════════════════════════════════════════
// VRES is dynamic: bumped to 72 when rMax≤20 so compact states (1s,2s,2p)
// get ~0.4 a₀/voxel resolution instead of ~1.1 a₀ — the sphere stays spherical.
let VRES=52; // updated by buildVoxelGrid each rebuild
let voxelVals=null;   // Float32Array size VRES³, stores |ψ|²
let voxelPsi=null;   // Float32Array size VRES³, stores Re[ψ]
let voxelImPsi=null; // Float32Array size VRES³, stores Im[ψ] (needed for arg(ψ) phase coloring)
let voxelMaxV=1;
let meanRcomputed=0;
let volumeImageData=null;
let volumeBuildPending=false;

let voxelBasis;
function buildVoxelGrid(){
  const rm=rMax();
  VRES=Math.min(96,Math.max(52,Math.ceil(2*rm/3)+1));
  const N=VRES, size=N**3, step=2*rm/(N-1);
  const evolving=densityEvolves();
  const spin=spinEnabled&&spinComps.length>0;
  const product=spin&&spinMode==='product'&&!SPIN_SUPERS[superKey];
  const sampleTime=evolving?t:0;
  if(evolving&&voxelBasis?.comps!==comps){
    const fields=comps.map(()=>new Float32Array(size*2));
    for(let i=0;i<N;i++)for(let j=0;j<N;j++)for(let k=0;k<N;k++){
      const index=2*(i*N*N+j*N+k);
      for(let c=0;c<comps.length;c++){
        const [re,im]=psiXYZ([comps[c]],-rm+i*step,-rm+j*step,-rm+k*step,0);
        fields[c][index]=re;
        fields[c][index+1]=im;
      }
    }
    voxelBasis={comps,fields};
  }else if(!evolving) voxelBasis=null;

  if(voxelVals?.length!==size){
    voxelVals=new Float32Array(size);
    voxelPsi=new Float32Array(size);
    voxelImPsi=new Float32Array(size);
  }
  if(spin&&voxelRhoUp?.length!==size){
    voxelRhoUp=new Float32Array(size);
    voxelRhoDn=new Float32Array(size);
  }else if(!spin){
    voxelRhoUp=null;
    voxelRhoDn=null;
  }
  const phase=comps.map(c=>sampleTime/(2*c.n*c.n));
  const cosines=phase.map(Math.cos), sines=phase.map(Math.sin);
  const upWeight=Math.cos(spinTheta/2)**2;
  voxelMaxV=1e-30;
  for(let i=0;i<N;i++)for(let j=0;j<N;j++)for(let k=0;k<N;k++){
    const index=i*N*N+j*N+k;
    let re=0,im=0,density;
    if(evolving){
      for(let c=0;c<comps.length;c++){
        const field=voxelBasis.fields[c];
        re+=field[2*index]*cosines[c]-field[2*index+1]*sines[c];
        im+=field[2*index]*sines[c]+field[2*index+1]*cosines[c];
      }
    }else if(!spin||product){
      [re,im]=psiXYZ(comps,-rm+i*step,-rm+j*step,-rm+k*step,0);
    }
    density=re*re+im*im;
    if(product){
      voxelRhoUp[index]=density*upWeight;
      voxelRhoDn[index]=density*(1-upWeight);
    }else if(spin){
      const [ur,ui,dr,di]=psiSpinor(spinComps,-rm+i*step,-rm+j*step,-rm+k*step,0);
      const up=ur*ur+ui*ui, down=dr*dr+di*di;
      voxelRhoUp[index]=up;
      voxelRhoDn[index]=down;
      density=up+down;
    }
    voxelVals[index]=density;
    voxelPsi[index]=re;
    voxelImPsi[index]=im;
    voxelMaxV=Math.max(voxelMaxV,density);
  }
  meanRcomputed=computeMeanR(voxelVals,N,rm);
  volumeDirty=false;
  lobeTexDirty=true;
  volNeedsRedraw=true;
  projDirty=true;
  projVolCache=null;
}

// Trilinear interpolation into voxel grid
function sampleVoxel(x,y,z){
  const N=VRES,rm=rMax();
  const fi=(x+rm)/(2*rm)*(N-1);
  const fj=(y+rm)/(2*rm)*(N-1);
  const fk=(z+rm)/(2*rm)*(N-1);
  const i0=Math.max(0,Math.min(N-2,fi|0));
  const j0=Math.max(0,Math.min(N-2,fj|0));
  const k0=Math.max(0,Math.min(N-2,fk|0));
  const tx=fi-i0,ty=fj-j0,tz=fk-k0;
  const idx=(i,j,k)=>i*N*N+j*N+k;
  const v000=voxelVals[idx(i0,j0,k0)],  v100=voxelVals[idx(i0+1,j0,k0)];
  const v010=voxelVals[idx(i0,j0+1,k0)],v110=voxelVals[idx(i0+1,j0+1,k0)];
  const v001=voxelVals[idx(i0,j0,k0+1)],v101=voxelVals[idx(i0+1,j0,k0+1)];
  const v011=voxelVals[idx(i0,j0+1,k0+1)],v111=voxelVals[idx(i0+1,j0+1,k0+1)];
  return(1-tz)*((1-ty)*((1-tx)*v000+tx*v100)+ty*((1-tx)*v010+tx*v110))
        +tz*((1-ty)*((1-tx)*v001+tx*v101)+ty*((1-tx)*v011+tx*v111));
}

// Trilinear interpolation returning [Re(ψ), Im(ψ)] — used for phase coloring
function sampleVoxelReIm(x,y,z){
  const N=VRES,rm=rMax();
  const fi=(x+rm)/(2*rm)*(N-1);
  const fj=(y+rm)/(2*rm)*(N-1);
  const fk=(z+rm)/(2*rm)*(N-1);
  const i0=Math.max(0,Math.min(N-2,fi|0));
  const j0=Math.max(0,Math.min(N-2,fj|0));
  const k0=Math.max(0,Math.min(N-2,fk|0));
  const tx=fi-i0,ty=fj-j0,tz=fk-k0;
  const id=(i,j,k)=>i*N*N+j*N+k;
  const tri=(arr)=>{
    const v000=arr[id(i0,j0,k0)],  v100=arr[id(i0+1,j0,k0)];
    const v010=arr[id(i0,j0+1,k0)],v110=arr[id(i0+1,j0+1,k0)];
    const v001=arr[id(i0,j0,k0+1)],v101=arr[id(i0+1,j0,k0+1)];
    const v011=arr[id(i0,j0+1,k0+1)],v111=arr[id(i0+1,j0+1,k0+1)];
    return(1-tz)*((1-ty)*((1-tx)*v000+tx*v100)+ty*((1-tx)*v010+tx*v110))
          +tz*((1-ty)*((1-tx)*v001+tx*v101)+ty*((1-tx)*v011+tx*v111));
  };
  return[tri(voxelPsi),tri(voxelImPsi)];
}

// We render at half resolution and upscale for speed
let cachedVolCanvas=null;

function renderVolume(cam){
  // proj() maps world point P to screen as:
  //   sx = W/2 + dot(P, right) * sc
  //   sy = H/2 - dot(P, up)   * sc
  // where sc = min(W,H)*0.47/rMax()*camDist
  //
  // INVERSE (orthographic ray-march):
  //   For screen pixel (px,py):
  //   world offset from origin = right*(px-W/2)/sc + up*(H/2-py)/sc
  //   Ray origin = that offset - forward*bigDist  (behind the scene)
  //   Ray direction = +forward  (pointing toward and through the scene)

  const scale=2; // render at half res, upscale
  const rw=Math.ceil(W/scale), rh=Math.ceil(H/scale);
  const img=new ImageData(rw,rh);
  const rm=rMax();
  const sc=Math.min(W,H)*0.47/rMax()*camDist; // same scale as proj()
  const bigDist=rm*3.0;
  // Scale step count so each step ≈ 2.5 a₀ — enough to resolve radial nodes at all n
  const STEPS=Math.min(220,Math.max(90,Math.ceil(bigDist*2/2.5)));
  const stepSize=(bigDist*2)/STEPS;
  // Per-step base opacity: normalise so that integrated look is independent of STEPS.
  // Calibrated at STEPS=90 → baseDens=0.30; scales as 90/STEPS for larger step counts.
  const baseDens=27/STEPS;

  for(let py=0;py<rh;py++){
    for(let px=0;px<rw;px++){
      // Screen pixel in full-res coords
      const fpx=px*scale, fpy=py*scale;
      // Unproject: world coords of the pixel on the focal plane (z=0 plane perp to forward)
      const wu=(fpx-W/2)/sc;
      const wv=(H/2-fpy)/sc;
      // World position of ray origin = pixel position - forward*bigDist
      const ox=cam.rx*wu+cam.upx*wv - cam.fx*bigDist;
      const oy=cam.ry*wu+cam.upy*wv - cam.fy*bigDist;
      const oz=cam.rz*wu+cam.upz*wv - cam.fz*bigDist;
      // Ray direction = +forward
      const rdx=cam.fx, rdy=cam.fy, rdz=cam.fz;

      let accR=0,accG=0,accB=0,accA=0;
      for(let s=0;s<STEPS&&accA<0.97;s++){
        const wx=ox+rdx*(s*stepSize);
        const wy=oy+rdy*(s*stepSize);
        const wz=oz+rdz*(s*stepSize);
        if(Math.abs(wx)>rm||Math.abs(wy)>rm||Math.abs(wz)>rm) continue;
        const raw=sampleVoxel(wx,wy,wz);
        if(raw<1e-30) continue;
        const v=Math.pow(raw/voxelMaxV,0.42); // gamma: matches slice/projection renderers
        if(v<0.008+isoOp*0.65) continue;      // isoOp=0: show all; isoOp=1: show top ~35%
        let cr,cg,cb,ca;
        if(showPhase){
          // For phase coloring, derive time-evolved Re/Im from cached t=0 values:
          // pure state: rotate by −E·t; superposition: call psiXYZ directly (shape also changes).
          let rp,ip;
          if(superKey==='none'){
            const[re0,im0]=sampleVoxelReIm(wx,wy,wz);
            const En=-0.5/(ORBITALS[orbIdx].n*ORBITALS[orbIdx].n);
            const cs=Math.cos(-En*t),sn=Math.sin(-En*t);
            rp=cs*re0-sn*im0; ip=sn*re0+cs*im0;
          }else{
            [rp,ip]=psiXYZ(comps,wx,wy,wz,t);
          }
          const ph=Math.atan2(ip,rp);
          const hue=((ph/(2*Math.PI))%1+1)%1;
          const bri=Math.pow(raw/voxelMaxV,0.14);
          const pAlpha=v<0.3?v/0.3*0.6:v<0.7?0.6+(v-0.3)/0.4*0.35:0.95;
          [cr,cg,cb]=phaseColorCpu(hue,bri);ca=pAlpha;
        }else{
          const c=volColor(v);cr=c.r;cg=c.g;cb=c.b;ca=c.a;
        }
        const sa=ca*baseDens*densOp*(1-accA); // densOp: per-step absorption (low=ray penetrates deeper)
        accR+=cr*sa; accG+=cg*sa; accB+=cb*sa; accA+=sa;
      }

      const idx=(py*rw+px)*4;
      img.data[idx  ]=Math.min(255,accR)|0;
      img.data[idx+1]=Math.min(255,accG)|0;
      img.data[idx+2]=Math.min(255,accB)|0;
      img.data[idx+3]=Math.min(255,accA*255)|0;
    }
  }

  cachedVolCanvas=document.createElement('canvas');
  cachedVolCanvas.width=rw; cachedVolCanvas.height=rh;
  cachedVolCanvas.getContext('2d').putImageData(img,0,0);
}

function blitVolume(){
  ctx.save();
  ctx.imageSmoothingEnabled=true;
  ctx.globalAlpha=1.0; // densOp is applied per-step inside renderVolume
  if((showLobes||showVol)&&gl2Ready){
    ctx.drawImage(lobeGLCanvas,0,0,W,H);
  }else if(cachedVolCanvas){
    ctx.drawImage(cachedVolCanvas,0,0,W,H);
  }
  ctx.restore();
}

// ════════════════════════════════════════════════════════════════
//  WEBGL2 LOBE RENDERER — GPU ray-march, full resolution, real-time
// ════════════════════════════════════════════════════════════════
function showGpuFallbackNotice(){
  preferSliceFallback=true;
  showGpuStatusBanner('Slices selected', 'This browser has limited graphics acceleration. Volume and Lobes may render more slowly.');
}

function showGpuStatusBanner(title, message) {
  const banner = document.getElementById('gpuStatusBanner');
  if (!banner) return;

  banner.innerHTML = `<b>${title}:</b> ${message}`;
  banner.hidden = false;
  banner.classList.add('show');
}

function detectWebGl2Renderer(gl) {
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  const vendor = dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
  return {
    text: `${vendor} / ${renderer}`,
    hasDebugInfo: !!dbg
  };
}

function isSoftwareRenderer(rendererInfo) {
  return /SwiftShader|llvmpipe|softpipe|Microsoft Basic|Software|Mesa Offscreen|software rasterizer|ANGLE \(Software/i.test(rendererInfo);
}

function initLobeGL(){
  lobeGLCanvas=document.createElement('canvas');
  lobeGLCanvas.width=W; lobeGLCanvas.height=H;
  gl2=lobeGLCanvas.getContext('webgl2',{antialias:false,premultipliedAlpha:false,alpha:true});
  if(!gl2){console.warn('WebGL2 unavailable — using CPU lobe renderer');showGpuFallbackNotice();return;}

  const rendererInfo = detectWebGl2Renderer(gl2);
  if (!rendererInfo.hasDebugInfo || isSoftwareRenderer(rendererInfo.text)) {
    console.warn('WebGL2 software or unverified renderer detected:', rendererInfo.text);
    showGpuFallbackNotice();
  }

  const vsrc=`#version 300 es
in vec2 a_pos;
void main(){gl_Position=vec4(a_pos,0,1);}`;

  const fsrc=`#version 300 es
precision highp float;
precision highp sampler3D;
uniform sampler3D u_vol;
uniform sampler2D u_phaseTex; // 256x1 cyclic phase palette; hue=x, WRAP_S=REPEAT
uniform sampler2D u_densTex;  // 256x1 density palette; v=x, WRAP_S=CLAMP
uniform vec2 u_res;
uniform float u_thresh;
uniform float u_sc;
uniform float u_rm;
uniform vec3 u_cf,u_cr,u_cu;
uniform float u_phase;
uniform float u_t;
uniform float u_en;
uniform float u_volmode; // 0=isosurface lobes  1=density volume  2=phase volume
uniform float u_densOp;  // opacity multiplier passed from JS densOp
uniform float u_isoOp;   // fog-clip threshold passed from JS isoOp
// Spin dual-channel uniforms (u_spinMode=0 → original behaviour unchanged)
uniform float u_spinMode;    // 0=no spin  1=dual channel
uniform vec3  u_spinUpCol;   // ↑ channel colour [0,1]
uniform vec3  u_spinDnCol;   // ↓ channel colour [0,1]
out vec4 outColor;

vec3 hsv2rgb(float h,float s,float v){
  vec3 c=clamp(abs(fract(vec3(h)+vec3(0,2,1)/3.0)*6.0-3.0)-1.0,0.0,1.0);
  return v*mix(vec3(1.0),c,s);
}

float sDens(vec3 p){
  vec3 uv=p/(2.0*u_rm)+0.5;
  if(any(lessThan(uv,vec3(0.0)))||any(greaterThan(uv,vec3(1.0))))return 0.0;
  return texture(u_vol,uv).r;
}
// A channel holds ρ↑/(ρ↑+ρ↓) quantised to [0,1] when spin is enabled
float sSpinW(vec3 p){
  vec3 uv=p/(2.0*u_rm)+0.5;
  if(any(lessThan(uv,vec3(0.0)))||any(greaterThan(uv,vec3(1.0))))return 0.5;
  return texture(u_vol,uv).a;
}
vec2 sReIm(vec3 p){
  vec3 uv=p/(2.0*u_rm)+0.5;
  if(any(lessThan(uv,vec3(0.0)))||any(greaterThan(uv,vec3(1.0))))return vec2(0.0);
  vec4 t=texture(u_vol,uv);
  return vec2(t.g*2.0-1.0, t.b*2.0-1.0);
}
const vec3 KEY=vec3(0.5711,0.7514,0.3307);
const vec3 FILL=vec3(-0.6202,0.2481,0.7442);
void main(){
  float cx=gl_FragCoord.x;
  float cy=u_res.y-gl_FragCoord.y;
  float wu=(cx-u_res.x*0.5)/u_sc;
  float wv=(u_res.y*0.5-cy)/u_sc;
  float bigD=u_rm*3.0;
  vec3 ro=u_cr*wu+u_cu*wv-u_cf*bigD;
  vec3 rd=u_cf;

  // ---- Density volume (mode 1) ----
  if(u_volmode>0.5&&u_volmode<1.5){
    const int VS=220;
    float vss=bigD*2.0/float(VS);
    float baseDens=u_densOp*27.0/float(VS);
    float fogClip=0.008+u_isoOp*0.65;
    vec4 acc=vec4(0.0);
    for(int i=0;i<VS;i++){
      if(acc.a>=0.97) break;
      vec3 p=ro+rd*float(i)*vss;
      if(any(greaterThan(abs(p),vec3(u_rm)))) continue;
      float raw=sDens(p);
      float v=pow(raw,0.42);
      if(v<fogClip) continue;
      float sa=v*baseDens*(1.0-acc.a);
      vec3 col;
      if(u_spinMode>0.5){
        float spinW=sSpinW(p);
        col=mix(u_spinDnCol,u_spinUpCol,spinW);
      }else{
        col=texture(u_densTex,vec2(v,0.5)).rgb;
      }
      acc.rgb+=col*sa;
      acc.a+=sa;
    }
    outColor=acc;
    return;
  }
  // ---- Phase volume (mode 2) ----
  if(u_volmode>1.5){
    const int VS=220;
    float vss=bigD*2.0/float(VS);
    float baseDens=u_densOp*27.0/float(VS);
    float fogClip=0.008+u_isoOp*0.65;
    vec4 acc=vec4(0.0);
    float angle=-u_en*u_t;
    float cs=cos(angle),sn=sin(angle);
    for(int i=0;i<VS;i++){
      if(acc.a>=0.97) break;
      vec3 p=ro+rd*float(i)*vss;
      if(any(greaterThan(abs(p),vec3(u_rm)))) continue;
      float raw=sDens(p);
      float v=pow(raw,0.42);
      if(v<fogClip) continue;
      vec2 ri=sReIm(p);
      ri=vec2(cs*ri.x-sn*ri.y,sn*ri.x+cs*ri.y);
      float hue=fract(atan(ri.y,ri.x)/(2.0*3.14159265));
      float bri=pow(raw,0.14);
      float sa=v*baseDens*(1.0-acc.a);
      acc.rgb+=texture(u_phaseTex,vec2(hue,0.5)).rgb*bri*sa;
      acc.a+=sa;
    }
    outColor=acc;
    return;
  }
  // ---- Isosurface lobe mode ----
  const int N=200;
  float ss=bigD*2.0/float(N);
  float prevV=0.0;
  vec3 prevP=ro;
  bool hit=false;
  vec3 hp=vec3(0);
  for(int i=0;i<N;i++){
    vec3 p=ro+rd*float(i)*ss;
    float v=sDens(p);
    if(prevV<u_thresh&&v>=u_thresh){
      hp=mix(prevP,p,(u_thresh-prevV)/max(1e-6,v-prevV));
      hit=true; break;
    }
    prevV=v; prevP=p;
  }
  if(!hit){outColor=vec4(0);return;}
  float h2=2.0*u_rm/52.0*1.5;
  float gx=sDens(hp+vec3(h2,0,0))-sDens(hp-vec3(h2,0,0));
  float gy=sDens(hp+vec3(0,h2,0))-sDens(hp-vec3(0,h2,0));
  float gz=sDens(hp+vec3(0,0,h2))-sDens(hp-vec3(0,0,h2));
  vec3 n=-normalize(vec3(gx,gy,gz)+vec3(1e-9));
  if(dot(n,u_cf)<0.0)n=-n;
  float dK=max(0.0,dot(n,KEY));
  float dF=max(0.0,dot(n,FILL));
  float spec=pow(max(0.0,dot(reflect(-KEY,n),u_cf)),12.0);
  float rim=pow(1.0-abs(dot(n,u_cf)),3.0)*0.22;
  float light=0.28+0.58*dK+0.30*dF+rim+0.28*spec;
  vec3 base;
  if(u_phase>0.5){
    // Rotate stored (Re₀, Im₀) by −E·t to get time-evolved phase.
    // For pure states (u_en != 0) this is exact: ψ(t)=ψ(0)·e^{−iEt}.
    // For superpositions u_en=0 (each component has a different E), so no rotation.
    vec2 ri=sReIm(hp);
    float angle=-u_en*u_t;
    float cs=cos(angle),sn=sin(angle);
    ri=vec2(cs*ri.x-sn*ri.y, sn*ri.x+cs*ri.y);
    float hue=fract(atan(ri.y,ri.x)/(2.0*3.14159265));
    base=texture(u_phaseTex,vec2(hue,0.5)).rgb;
  }else if(u_spinMode>0.5){
    base=mix(u_spinDnCol,u_spinUpCol,sSpinW(hp));
  }else{
    vec2 ri=sReIm(hp);
    // Still apply time rotation so sign coloring is consistent with evolving phase
    float angle=-u_en*u_t;
    float cs=cos(angle),sn=sin(angle);
    ri=vec2(cs*ri.x-sn*ri.y, sn*ri.x+cs*ri.y);
    base=ri.x>=0.0?vec3(0.883,0.431,0.078):vec3(0.275,0.353,0.863);
  }
  outColor=vec4(clamp(base*light+spec*vec3(1.0,0.86,0.86),0.0,1.0),1.0);
}`;

  function compile(type,src){
    const s=gl2.createShader(type);
    gl2.shaderSource(s,src);gl2.compileShader(s);
    if(!gl2.getShaderParameter(s,gl2.COMPILE_STATUS)){console.error(gl2.getShaderInfoLog(s));return null;}
    return s;
  }
  const vs=compile(gl2.VERTEX_SHADER,vsrc);
  const fs=compile(gl2.FRAGMENT_SHADER,fsrc);
  if(!vs||!fs)return;
  lobeProg=gl2.createProgram();
  gl2.attachShader(lobeProg,vs);gl2.attachShader(lobeProg,fs);
  gl2.linkProgram(lobeProg);
  if(!gl2.getProgramParameter(lobeProg,gl2.LINK_STATUS)){console.error(gl2.getProgramInfoLog(lobeProg));return;}

  // Fullscreen quad
  lobeVAO=gl2.createVertexArray();
  gl2.bindVertexArray(lobeVAO);
  const buf=gl2.createBuffer();
  gl2.bindBuffer(gl2.ARRAY_BUFFER,buf);
  gl2.bufferData(gl2.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl2.STATIC_DRAW);
  const loc=gl2.getAttribLocation(lobeProg,'a_pos');
  gl2.enableVertexAttribArray(loc);
  gl2.vertexAttribPointer(loc,2,gl2.FLOAT,false,0,0);
  gl2.bindVertexArray(null);

  // Uniform locations
  ['u_vol','u_res','u_thresh','u_sc','u_rm','u_cf','u_cr','u_cu','u_phase','u_t','u_en','u_volmode','u_phaseTex','u_densTex','u_densOp','u_isoOp','u_spinMode','u_spinUpCol','u_spinDnCol']
    .forEach(n=>{lobeUnif[n]=gl2.getUniformLocation(lobeProg,n);});

  // Create RGBA8 3D texture (R=density, G=Re(ψ) in [0,1], B=Im(ψ) in [0,1]).
  // Storing Re and Im separately lets GLSL compute atan(im,re) without branch-cut artifacts
  // (linear interpolation on smooth Re/Im rather than on a wrapped phase angle).
  function make3DTex(){
    const t=gl2.createTexture();
    gl2.bindTexture(gl2.TEXTURE_3D,t);
    gl2.texParameteri(gl2.TEXTURE_3D,gl2.TEXTURE_MIN_FILTER,gl2.LINEAR);
    gl2.texParameteri(gl2.TEXTURE_3D,gl2.TEXTURE_MAG_FILTER,gl2.LINEAR);
    gl2.texParameteri(gl2.TEXTURE_3D,gl2.TEXTURE_WRAP_S,gl2.CLAMP_TO_EDGE);
    gl2.texParameteri(gl2.TEXTURE_3D,gl2.TEXTURE_WRAP_T,gl2.CLAMP_TO_EDGE);
    gl2.texParameteri(gl2.TEXTURE_3D,gl2.TEXTURE_WRAP_R,gl2.CLAMP_TO_EDGE);
    return t;
  }
  lobeDensTex=make3DTex();
  lobeSignTex=null;
  gl2Ready=true;
  uploadPhasePalTex(); // initialise phase palette texture
  uploadDensPalTex();  // initialise density palette texture
}

function uploadLobeTex(){
  if(!gl2Ready||!voxelVals)return;
  // RGBA8 texture: R=density, G=Re(ψ) mapped [0,1], B=Im(ψ) mapped [0,1], A=255.
  // Re and Im are normalised by maxAbs=sqrt(voxelMaxV) so both fit in [0,1].
  // Storing them as separate channels lets GLSL compute atan(im,re) with linear
  // interpolation on smooth quantities — eliminates the branch-cut band artifact.
  const N=VRES;
  const packed=new Uint8Array(voxelVals.length*4);
  const invMax=1/voxelMaxV;
  const maxAbs=Math.sqrt(voxelMaxV)+1e-30;
  const invAbs=1/maxAbs;
  for(let ix=0;ix<N;ix++){
    for(let jy=0;jy<N;jy++){
      for(let kz=0;kz<N;kz++){
        const volFlat=ix*N*N+jy*N+kz;
        const texFlat=ix+jy*N+kz*N*N;
        packed[texFlat*4  ]=(voxelVals[volFlat]*invMax*255+0.5)|0; // R = density
        packed[texFlat*4+1]=((voxelPsi  [volFlat]*invAbs+1)*0.5*255+0.5)|0; // G = Re mapped [0,1]
        packed[texFlat*4+2]=((voxelImPsi[volFlat]*invAbs+1)*0.5*255+0.5)|0; // B = Im mapped [0,1]
              // A channel: spin-↑ fraction when spin enabled, 255 otherwise
        const upRho=spinEnabled&&voxelRhoUp?voxelRhoUp[volFlat]:1;
        const dnRho=spinEnabled&&voxelRhoDn?voxelRhoDn[volFlat]:0;
        packed[texFlat*4+3]=(upRho/(upRho+dnRho+1e-30)*255+0.5)|0;
      }
    }
  }
  gl2.bindTexture(gl2.TEXTURE_3D,lobeDensTex);
  gl2.texImage3D(gl2.TEXTURE_3D,0,gl2.RGBA8,VRES,VRES,VRES,0,gl2.RGBA,gl2.UNSIGNED_BYTE,packed);
}

function uploadDensPalTex(){
  if(!gl2Ready)return;
  if(!densPalTex){
    densPalTex=gl2.createTexture();
    gl2.bindTexture(gl2.TEXTURE_2D,densPalTex);
    gl2.texParameteri(gl2.TEXTURE_2D,gl2.TEXTURE_MIN_FILTER,gl2.LINEAR);
    gl2.texParameteri(gl2.TEXTURE_2D,gl2.TEXTURE_MAG_FILTER,gl2.LINEAR);
    gl2.texParameteri(gl2.TEXTURE_2D,gl2.TEXTURE_WRAP_S,gl2.CLAMP_TO_EDGE);
    gl2.texParameteri(gl2.TEXTURE_2D,gl2.TEXTURE_WRAP_T,gl2.CLAMP_TO_EDGE);
  }
  gl2.bindTexture(gl2.TEXTURE_2D,densPalTex);
  gl2.texImage2D(gl2.TEXTURE_2D,0,gl2.RGBA,256,1,0,gl2.RGBA,gl2.UNSIGNED_BYTE,buildDensPal256());
}

function uploadPhasePalTex(){
  if(!gl2Ready)return;
  if(!phasePalTex){
    phasePalTex=gl2.createTexture();
    gl2.bindTexture(gl2.TEXTURE_2D,phasePalTex);
    gl2.texParameteri(gl2.TEXTURE_2D,gl2.TEXTURE_MIN_FILTER,gl2.LINEAR);
    gl2.texParameteri(gl2.TEXTURE_2D,gl2.TEXTURE_MAG_FILTER,gl2.LINEAR);
    gl2.texParameteri(gl2.TEXTURE_2D,gl2.TEXTURE_WRAP_S,gl2.REPEAT); // cyclic wrap
    gl2.texParameteri(gl2.TEXTURE_2D,gl2.TEXTURE_WRAP_T,gl2.CLAMP_TO_EDGE);
  }
  gl2.bindTexture(gl2.TEXTURE_2D,phasePalTex);
  gl2.texImage2D(gl2.TEXTURE_2D,0,gl2.RGBA,256,1,0,gl2.RGBA,gl2.UNSIGNED_BYTE,buildPhasePal256());
}

function renderLobesGL(cam, volmode=0){
  if(!gl2Ready)return;
  const rm=rMax();
  const sc=Math.min(W,H)*0.47/rm*camDist;
  const thresh=lobeThresh;

  gl2.viewport(0,0,W,H);
  gl2.clearColor(0,0,0,0);
  gl2.clear(gl2.COLOR_BUFFER_BIT);
  gl2.useProgram(lobeProg);

  gl2.activeTexture(gl2.TEXTURE0);
  gl2.bindTexture(gl2.TEXTURE_3D,lobeDensTex);
  gl2.uniform1i(lobeUnif['u_vol'],0);

  gl2.activeTexture(gl2.TEXTURE1);
  gl2.bindTexture(gl2.TEXTURE_2D,phasePalTex);
  gl2.uniform1i(lobeUnif['u_phaseTex'],1);

  gl2.activeTexture(gl2.TEXTURE2);
  gl2.bindTexture(gl2.TEXTURE_2D,densPalTex);
  gl2.uniform1i(lobeUnif['u_densTex'],2);

  gl2.uniform2f(lobeUnif['u_res'],W,H);
  gl2.uniform1f(lobeUnif['u_thresh'],thresh);
  gl2.uniform1f(lobeUnif['u_sc'],sc);
  gl2.uniform1f(lobeUnif['u_rm'],rm);
  gl2.uniform3f(lobeUnif['u_cf'],cam.fx,cam.fy,cam.fz);
  gl2.uniform3f(lobeUnif['u_cr'],cam.rx,cam.ry,cam.rz);
  gl2.uniform3f(lobeUnif['u_cu'],cam.upx,cam.upy,cam.upz);
  gl2.uniform1f(lobeUnif['u_phase'],showPhase?1.0:0.0);
  gl2.uniform1f(lobeUnif['u_volmode'],volmode);
  gl2.uniform1f(lobeUnif['u_densOp'],densOp);
  gl2.uniform1f(lobeUnif['u_isoOp'],isoOp);
  const pureEn=showPhase&&!densityEvolves() ? -0.5/comps[0].n**2 : 0;
  gl2.uniform1f(lobeUnif['u_t'],t);
  gl2.uniform1f(lobeUnif['u_en'],pureEn);
  // Spin uniforms
  gl2.uniform1f(lobeUnif['u_spinMode'],(spinEnabled&&spinComps.length&&!showPhase)?1.0:0.0);
  gl2.uniform3f(lobeUnif['u_spinUpCol'],spinUpColor.r/255,spinUpColor.g/255,spinUpColor.b/255);
  gl2.uniform3f(lobeUnif['u_spinDnCol'],spinDnColor.r/255,spinDnColor.g/255,spinDnColor.b/255);

  gl2.bindVertexArray(lobeVAO);
  gl2.drawArrays(gl2.TRIANGLES,0,6);
  gl2.bindVertexArray(null);
}

// ════════════════════════════════════════════════════════════════
//  CPU LOBE RENDERER — fallback if WebGL2 unavailable
//  Positive-ψ lobes: amber  |  Negative-ψ lobes: blue-violet
// ════════════════════════════════════════════════════════════════
function renderLobes(cam, preview=false){
  const scale=preview?5:2;
  const stepCount=preview?60:160;
  const rw=Math.ceil(W/scale), rh=Math.ceil(H/scale);
  const img=new ImageData(rw,rh);
  const rm=rMax();
  const sc=Math.min(W,H)*0.47/rMax()*camDist;
  const bigDist=rm*3.0;
  const STEPS=stepCount;
  const stepSize=(bigDist*2)/STEPS;
  const thresh=voxelMaxV*lobeThresh;

  // Key light and fill light directions (world space)
  const klen=Math.sqrt(0.57*0.57+0.75*0.75+0.33*0.33);
  const flen=Math.sqrt(0.5*0.5+0.2*0.2+0.6*0.6);
  const kdx=0.57/klen, kdy=0.75/klen, kdz=0.33/klen;
  const fdx=-0.5/flen, fdy=0.2/flen, fdz=0.6/flen;

  for(let py=0;py<rh;py++){
    for(let px=0;px<rw;px++){
      const fpx=px*scale, fpy=py*scale;
      const wu=(fpx-W/2)/sc, wv=(H/2-fpy)/sc;
      const ox=cam.rx*wu+cam.upx*wv - cam.fx*bigDist;
      const oy=cam.ry*wu+cam.upy*wv - cam.fy*bigDist;
      const oz=cam.rz*wu+cam.upz*wv - cam.fz*bigDist;
      const rdx=cam.fx, rdy=cam.fy, rdz=cam.fz;

      let hit=false, hx=0, hy=0, hz=0;
      let prevV=0, prevX=ox, prevY=oy, prevZ=oz;

      for(let s=0;s<STEPS;s++){
        const wx=ox+rdx*s*stepSize, wy=oy+rdy*s*stepSize, wz=oz+rdz*s*stepSize;
        if(Math.abs(wx)>rm*1.05||Math.abs(wy)>rm*1.05||Math.abs(wz)>rm*1.05){prevV=0;prevX=wx;prevY=wy;prevZ=wz;continue;}
        const v=sampleVoxel(wx,wy,wz);
        if(prevV<thresh&&v>=thresh){
          // Linear interpolation to isosurface
          const f2=(thresh-prevV)/Math.max(1e-20,v-prevV);
          hx=prevX+(wx-prevX)*f2; hy=prevY+(wy-prevY)*f2; hz=prevZ+(wz-prevZ)*f2;
          hit=true; break;
        }
        prevV=v; prevX=wx; prevY=wy; prevZ=wz;
      }

      const pidx=(py*rw+px)*4;
      if(!hit){img.data[pidx+3]=0;continue;}

      // Surface normal from density gradient (central differences)
      const h2=2*rm/(VRES-1)*1.5;
      const gx=sampleVoxel(hx+h2,hy,hz)-sampleVoxel(hx-h2,hy,hz);
      const gy=sampleVoxel(hx,hy+h2,hz)-sampleVoxel(hx,hy-h2,hz);
      const gz=sampleVoxel(hx,hy,hz+h2)-sampleVoxel(hx,hy,hz-h2);
      const gl=Math.sqrt(gx*gx+gy*gy+gz*gz)||1;
      // Gradient points inward (toward higher density), so negate for outward normal
      let nx=-gx/gl, ny=-gy/gl, nz=-gz/gl;
      // Ensure normal faces camera
      if(nx*cam.fx+ny*cam.fy+nz*cam.fz<0){nx=-nx;ny=-ny;nz=-nz;}

      // Phong: key + fill diffuse, key specular only
      const dotK=Math.max(0,nx*kdx+ny*kdy+nz*kdz);
      const dotF=Math.max(0,nx*fdx+ny*fdy+nz*fdz);
      const rx2=2*dotK*nx-kdx, ry2=2*dotK*ny-kdy, rz2=2*dotK*nz-kdz;
      const spec=Math.pow(Math.max(0,rx2*cam.fx+ry2*cam.fy+rz2*cam.fz),40);
      const light=0.10+0.72*dotK+0.15*dotF+0.65*spec;

      // Color: phase domain coloring when showPhase, else sign-based amber/blue
      let cr,cg,cb;
      if(showPhase){
        const[rp,ip]=psiXYZ(comps,hx,hy,hz,t); // t not 0 — full time-dependent phase
        const ph=Math.atan2(ip,rp);
        const hue=((ph/(2*Math.PI))%1+1)%1;
        [cr,cg,cb]=phaseColorCpu(hue,1.0);
        cr=Math.round(cr);cg=Math.round(cg);cb=Math.round(cb);
      }else{
        const[pRe]=psiXYZ(comps,hx,hy,hz,0);
        [cr,cg,cb]=pRe>=0?[225,110,20]:[70,90,220];
      }
      img.data[pidx  ]=Math.min(255,cr*light+spec*255)|0;
      img.data[pidx+1]=Math.min(255,cg*light+spec*220)|0;
      img.data[pidx+2]=Math.min(255,cb*light+spec*220)|0;
      img.data[pidx+3]=255;
    }
  }

  cachedVolCanvas=document.createElement('canvas');
  cachedVolCanvas.width=rw; cachedVolCanvas.height=rh;
  cachedVolCanvas.getContext('2d').putImageData(img,0,0);
}

// ════════════════════════════════════════════════════════════════
//  MAIN LOOP
// ════════════════════════════════════════════════════════════════
function integrate(dt){
  const start=t;
  t+=dt;
  if(densityEvolves()) invalidateDensity();
  if(showCloud){
    stepCloudParticles(dt);
    return;
  }

  const spin=spinEnabled&&spinComps.length>0;
  const isSingleOrbital=comps.length===1;
  const is1s=spin&&isSingleOrbital&&comps[0].n===1&&comps[0].l===0;
  const radiusLimit=(rMax()*1.4)**2;
  const stepCount=Math.max(1,Math.ceil(dt/Math.min(dtStep,0.05)));
  const step=dt/stepCount;
  for(const p of particles){
    const previous=[p.x,p.y,p.z];
    if(is1s){
      const {upRe,upIm,dnRe,dnIm}=spinComps[0];
      const axis=[2*(upRe*dnRe+upIm*dnIm),2*(upRe*dnIm-upIm*dnRe),upRe**2+upIm**2-dnRe**2-dnIm**2];
      const r=Math.hypot(...previous);
      if(r>0){
        const [x,y,z]=previous, [nx,ny,nz]=axis;
        const ca=Math.cos(dt/r), sa=Math.sin(dt/r), dot=(nx*x+ny*y+nz*z)*(1-ca);
        p.x=x*ca+(ny*z-nz*y)*sa+nx*dot;
        p.y=y*ca+(nz*x-nx*z)*sa+ny*dot;
        p.z=z*ca+(nx*y-ny*x)*sa+nz*dot;
      }
    }else if(!spin&&isSingleOrbital){
      const radiusSquared=p.x*p.x+p.y*p.y;
      if(radiusSquared>1e-14&&comps[0].m!==0) rotateAroundZ(p,comps[0].m*dt/radiusSquared);
    }else{
      for(let i=0;i<stepCount;i++){
        const ti=start+i*step;
        const a=bohmV(comps,p.x,p.y,p.z,ti);
        const b=bohmV(comps,p.x+step*a[0]/2,p.y+step*a[1]/2,p.z+step*a[2]/2,ti+step/2);
        const c=bohmV(comps,p.x+step*b[0]/2,p.y+step*b[1]/2,p.z+step*b[2]/2,ti+step/2);
        const d=bohmV(comps,p.x+step*c[0],p.y+step*c[1],p.z+step*c[2],ti+step);
        p.x+=step*(a[0]+2*b[0]+2*c[0]+d[0])/6;
        p.y+=step*(a[1]+2*b[1]+2*c[1]+d[1])/6;
        p.z+=step*(a[2]+2*b[2]+2*c[2]+d[2])/6;
      }
    }
    if(!Number.isFinite(p.x+p.y+p.z)||p.x*p.x+p.y*p.y+p.z*p.z>radiusLimit){
      const replacement=sampleParticles(1,t)[0];
      Object.assign(p,replacement??{x:previous[0],y:previous[1],z:previous[2],trail:[]});
      continue;
    }
    if(p.x!==previous[0]||p.y!==previous[1]||p.z!==previous[2]){
      p.trail.push(previous);
      if(p.trail.length>trailLen) p.trail.splice(0,p.trail.length-trailLen);
      p.age++;
    }
  }
}

let volNeedsRedraw=true;
let lastCamTheta=null,lastCamPhi=null,lastCamDist=null;

function renderFrame(){
  ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over';
  ctx.fillStyle=lightTheme?'#f0f4ff':'#04070f';ctx.fillRect(0,0,W,H);
  const cam=getCam();
  const rm=rMax();

  // Lobes rendering — GPU path every frame, no caching needed
  if(showLobes&&!showCloud){
    if(volumeDirty||!voxelVals){
      buildVoxelGrid();
      volumeDirty=false;
      lobeTexDirty=true;
      cachedVolCanvas=null;
    }
    if(gl2Ready&&lobeTexDirty){uploadLobeTex();lobeTexDirty=false;}
    if(gl2Ready){
      renderLobesGL(cam);
    }else{
      // CPU fallback: low-res during drag, full on release
      const camMoved=(camTheta!==lastCamTheta||camPhi!==lastCamPhi||camDist!==lastCamDist);
      if(camMoved){lastCamTheta=camTheta;lastCamPhi=camPhi;lastCamDist=camDist;}
      if(dragging&&camMoved){ renderLobes(cam,true); }
      else if(!cachedVolCanvas||volNeedsRedraw||(!dragging&&camMoved)){ renderLobes(cam,false); volNeedsRedraw=false; }
    }
    blitVolume();
  }

  // Volume — always GPU (real-time rotation every frame, no caching needed)
  if(showVol&&!showCloud){
    if(volumeDirty||!voxelVals){
      buildVoxelGrid();
      volumeDirty=false;
      cachedVolCanvas=null;
      lobeTexDirty=true;
    }
    if(gl2Ready){
      if(lobeTexDirty){uploadLobeTex();lobeTexDirty=false;}
      // mode 2=phase volume, mode 1=density-only volume
      renderLobesGL(cam, showPhase?2:1);
      blitVolume();
    }else{
      // CPU fallback for no-WebGL2 browsers — only rerenders after drag ends
      const camMoved=(camTheta!==lastCamTheta||camPhi!==lastCamPhi||camDist!==lastCamDist);
      if(camMoved){lastCamTheta=camTheta;lastCamPhi=camPhi;lastCamDist=camDist;}
      const needsRender=!cachedVolCanvas||volNeedsRedraw||(camMoved&&!dragging);
      if(needsRender&&!dragging){renderVolume(cam);volNeedsRedraw=false;}
      blitVolume();
    }
  }

  // Slice planes — only drawn when showSlice is on.
  // When showPhase is also on, phase-colored slices are shown; otherwise density slices.
  // If only showPhase is on (no showSlice), phase coloring is handled by the 3D volume/lobe renderers above.
  if(showSlice){
    if(sliceDirty) buildSlices(); // density vals needed for isocontours either way
    if(showPhase) buildPhaseSlices(t);
    const normals={xz:[0,1,0],xy:[0,0,1],yz:[1,0,0]};
    let active=slicePlane==='all'?['xz','xy','yz']:[slicePlane];
    active.sort((a,b)=>{
      const[ax,ay,az]=normals[a],[bx2,by2,bz2]=normals[b];
      return Math.abs(bx2*cam.fx+by2*cam.fy+bz2*cam.fz)-Math.abs(ax*cam.fx+ay*cam.fy+az*cam.fz);
    });
    for(const pk of active){
      // Phase takes priority when both active (same plane — can't overlay without confusion)
      if(showPhase)  drawSlice(phaseSliceData[pk],pk,cam,densOp);
      else           drawSlice(sliceData[pk],pk,cam,densOp);
      drawIso(sliceData[pk],pk,cam,isoOp);
    }
  }

  // Particles & trails (trail mode) — or cloud dots (cloud mode)
  if(showCloud){
    renderCloudCanvas(cam);
  }else{
    const rm2=rMax();
    const sorted=particles.map(p=>{const[sx,sy,d]=proj(p.x,p.y,p.z,cam);return{p,sx,sy,d};}).sort((a,b)=>a.d-b.d);
    for(const{p,sx,sy,d}of sorted){
      const tl=p.trail.length;
      if(tl>=2)for(let i=1;i<tl;i++){
        const[ax,ay]=proj(p.trail[i-1][0],p.trail[i-1][1],p.trail[i-1][2],cam);
        const[bx,by]=proj(p.trail[i][0],p.trail[i][1],p.trail[i][2],cam);
        const f=i/tl;
        ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);
        ctx.strokeStyle=`hsla(${ptColor.hue},90%,65%,${(Math.pow(f,1.3)*0.72).toFixed(3)})`;
        ctx.lineWidth=0.6+f*0.9;ctx.stroke();
      }
      const df=Math.max(0.3,Math.min(1,(d+rm2)/(2*rm2)));
      const g2=ctx.createRadialGradient(sx,sy,0,sx,sy,ptSize*2.8);
      g2.addColorStop(0,`rgba(${ptColor.r},${ptColor.g},${ptColor.b},${df.toFixed(3)})`);
      g2.addColorStop(0.5,`rgba(${ptColor.r>>1},${ptColor.g>>1},${ptColor.b>>1},${(df*0.4).toFixed(3)})`);
      g2.addColorStop(1,`rgba(${ptColor.r>>2},${ptColor.g>>2},${ptColor.b>>2},0)`);
      ctx.beginPath();ctx.arc(sx,sy,ptSize*(0.4+df*0.6),0,Math.PI*2);ctx.fillStyle=g2;ctx.fill();
    }
    // Nucleus on top
    const[nx2,ny2]=proj(0,0,0,cam);
    const ng=ctx.createRadialGradient(nx2,ny2,0,nx2,ny2,12);
    ng.addColorStop(0,'rgba(255,140,60,1)');ng.addColorStop(0.4,'rgba(255,60,20,.6)');ng.addColorStop(1,'rgba(255,30,0,0)');
    ctx.beginPath();ctx.arc(nx2,ny2,12,0,Math.PI*2);ctx.fillStyle=ng;ctx.fill();
  }

  // Axes
  if(showAxes) drawAxes(cam,rm);

  // Canvas insets
  if(showInset) drawRadialInset();
  if(showProjections) drawProjectionPanels();

  // Diagnostics are optional and use the same clock as the displayed state.
  if(expertMode){
    if(volumeDirty) buildVoxelGrid();
    updateVerification();
  }
  const o=ORBITALS[orbIdx];
  if(superKey!=='none'&&comps.length){
    // ⟨E⟩ = Σ |c_i|² E_i  (eigenstates are orthogonal → no cross terms)
    const Eavg=comps.reduce((s,c)=>(c.cRe*c.cRe+c.cIm*c.cIm)*(-13.6/(c.n*c.n))+s,0);
    document.getElementById('stE').textContent=Eavg.toFixed(2)+' eV';
  } else {
    document.getElementById('stE').textContent=(-13.6/(o.n*o.n)).toFixed(2)+' eV';
  }
  document.getElementById('stNLM').textContent=comps.map(c=>`${c.n}, ${c.l}, ${c.m}`).join(' + ');
  document.getElementById('stN').textContent=particles.length;
  document.getElementById('stT').textContent=(t*24.1888).toFixed(0)+' as';
}

// Numerical normalization check: ∫₀^∞ r² |R_nl(r)|² dr should = 1
function computeRadialNorm(n,l){
  const rm=n*n*18+20; // always larger than orbital extent
  const NPTS=800;
  const dr=rm/NPTS;
  let sum=0;
  for(let i=0;i<NPTS;i++){
    const r=(i+0.5)*dr;
    const R=Rnl(n,l,r);
    sum+=r*r*R*R;
  }
  return sum*dr;
}

function updateVerification(){
  const o=ORBITALS[orbIdx];
  const isSuper=superKey!=='none'&&comps.length>0;

  // ── Spin diagnostics (expert rows) ──────────────────────────────
  const spinDiagVisible=spinEnabled&&spinComps.length>0;
  ['rowSpinFrac','rowSpinNorm','rowSpinCurl'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.style.display=spinDiagVisible?'contents':'none';
  });
  if(spinDiagVisible){
    // 1. ρ↑ fraction from voxel grid vs cos²(θ/2)
    if(voxelRhoUp&&voxelRhoDn){
      let sumUp=0,sumTot=0;
      for(let i=0;i<voxelRhoUp.length;i++){sumUp+=voxelRhoUp[i];sumTot+=voxelRhoUp[i]+voxelRhoDn[i];}
      const frac=sumTot>0?sumUp/sumTot:0.5;
      const expected=spinMode==='product'&&!SPIN_SUPERS[superKey]?Math.cos(spinTheta/2)**2:null;
      const fracEl=document.getElementById('stSpinFrac');
      if(fracEl){
        fracEl.textContent=frac.toFixed(4)+(expected!==null?' / '+expected.toFixed(4):'');
        fracEl.className='stat-val '+(expected===null||Math.abs(frac-expected)<0.015?'ok':'warn');
      }
    }
    // 2. Spinor norm: Σ(upRe²+upIm²+dnRe²+dnIm²) should = 1
    const snorm=spinComps.reduce((s,c)=>s+c.upRe*c.upRe+c.upIm*c.upIm+c.dnRe*c.dnRe+c.dnIm*c.dnIm,0);
    const snEl=document.getElementById('stSpinNorm');
    if(snEl){snEl.textContent=snorm.toFixed(6);snEl.className='stat-val '+(Math.abs(snorm-1)<0.0001?'ok':'warn');}
    // 3. |v| at orbital peak: sample one point near Bohr-radius-weighted peak
    //    For hydrogen: peak radial density at r ≈ n²·a₀ for dominant component
    const n0=spinComps[0].n;
    const testR=n0*n0*1.05; // just outside the peak
    const[vx,vy,vz]=bohmVPauli(spinComps,testR,0,0,t);
    const vmag=Math.sqrt(vx*vx+vy*vy+vz*vz);
    const curlEl=document.getElementById('stSpinCurl');
    if(curlEl){
      curlEl.textContent=vmag.toFixed(4)+(vmag>0.001?' ← non-zero ✓':' ≈ 0 at this point');
      curlEl.className='stat-val '+(vmag>0.001?'ok':'');
    }
  }

  if(isSuper){
    // Only the coherent 1s + 2s preset has a nonzero radial cross term.
    const diagonal=comps.reduce((sum,c)=>sum+(c.cRe**2+c.cIm**2)*exactR(c.n,c.l),0);
    const rExact=diagonal+(superKey==='ss'?-64/(81*Math.SQRT2)*Math.cos(3*t/8):0);
    const rComp=meanRcomputed;
    document.getElementById('stRe').textContent=rExact.toFixed(2)+' a\u2080';
    document.getElementById('stRc').textContent=rComp.toFixed(2)+' a\u2080';
    const err=Math.abs(rComp-rExact)/Math.max(rExact,0.01);
    const el=document.getElementById('stMatch');
    el.textContent=(err*100).toFixed(1)+'% err';
    el.className='stat-val '+(err<0.05?'ok':'warn');
    // Show component summary: "2,1,+1 + 3,2,+1"
    const klabel=comps.map(c=>`${c.n},${c.l},${c.m>=0?'+':''}${c.m}`).join(' + ');
    document.getElementById('stNLM').textContent=klabel;
    // Normalization: Σ|c_i|² should equal 1
    const norm=comps.reduce((s,c)=>s+c.cRe*c.cRe+c.cIm*c.cIm,0);
    const normEl=document.getElementById('stNorm');
    normEl.textContent=norm.toFixed(4);
    normEl.className='stat-val '+(Math.abs(norm-1)<0.01?'ok':'warn');
  } else {
    const rExact=exactR(o.n,o.l);
    const rComp=meanRcomputed;
    document.getElementById('stRe').textContent=rExact.toFixed(2)+' a\u2080';
    document.getElementById('stRc').textContent=rComp.toFixed(2)+' a\u2080';
    const err=Math.abs(rComp-rExact)/rExact;
    const el=document.getElementById('stMatch');
    el.textContent=(err*100).toFixed(1)+'% err';
    el.className='stat-val '+(err<0.05?'ok':'warn');
    document.getElementById('stNLM').textContent=`${o.n}, ${o.l}, ${o.m>=0?'+':''}${o.m}`;
    const norm=computeRadialNorm(o.n,o.l);
    const normEl=document.getElementById('stNorm');
    normEl.textContent=norm.toFixed(4);
    normEl.className='stat-val '+(Math.abs(norm-1)<0.01?'ok':'warn');
  }
}

// (radial probability chart moved to canvas inset — see drawRadialInset)

let previousFrame;
function loop(now){
  if(running&&previousFrame!==undefined){
    const elapsed=Math.min(0.05,Math.max(0,(now-previousFrame)/1000));
    if(elapsed>0) integrate(elapsed*BASE_SPEED*simSpeed);
  }
  previousFrame=running?now:undefined;
  if(!canvas.closest('[hidden]')) renderFrame();
  requestAnimationFrame(loop);
}
document.addEventListener('visibilitychange',()=>{previousFrame=undefined;});

// ════════════════════════════════════════════════════════════════
//  CANVAS INSETS — P(r) radial probability + projection panels
// ════════════════════════════════════════════════════════════════
function _insetBg(x,y,w,h){
  const bg=lightTheme?'rgba(240,244,255,0.96)':'rgba(6,11,22,0.92)';
  const br=lightTheme?'#c8d0e8':'#16213a';
  ctx.fillStyle=bg;ctx.strokeStyle=br;ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(x,y,w,h,4);ctx.fill();ctx.stroke();
}

function drawRadialInset(){
  if(!comps.length)return;
  const iW=220,iH=130,ix=W-iW-14,iy=H-iH-42;
  _insetBg(ix,iy,iW,iH);
  const pl=28,pr=8,pt=18,pb=18;
  const pw=iW-pl-pr,ph=iH-pt-pb;
  const tc=lightTheme?'#6070a0':'#6a80a8';
  ctx.fillStyle=tc;ctx.font='9px JetBrains Mono,monospace';ctx.textAlign='left';
  ctx.fillText('Radial probability P(r)',ix+pl,iy+11);
  const rPlot=rMax(),NPTS=200;
  const total=new Float32Array(NPTS);
  let maxP=1e-30;
  for(let j=0;j<NPTS;j++){
    const r=j/(NPTS-1)*rPlot;
    let radialDensity=comps.reduce((sum,c)=>sum+(c.cRe**2+c.cIm**2)*Rnl(c.n,c.l,r)**2,0);
    if(superKey==='ss') radialDensity+=Rnl(1,0,r)*Rnl(2,0,r)*Math.cos(3*t/8);
    total[j]=r*r*Math.max(0,radialDensity);
    maxP=Math.max(maxP,total[j]);
  }
  // axes
  ctx.strokeStyle=lightTheme?'#c8d0e8':'#1e2f50';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(ix+pl,iy+pt);ctx.lineTo(ix+pl,iy+pt+ph);ctx.lineTo(ix+pl+pw,iy+pt+ph);ctx.stroke();
  // ⟨r⟩ line
  const o=ORBITALS[orbIdx];const rE=superKey==='none'?exactR(o.n,o.l):0;
  if(rE>0&&rE<=rPlot){
    const xR=ix+pl+(rE/rPlot)*pw;
    ctx.save();ctx.setLineDash([3,3]);ctx.strokeStyle='rgba(105,240,174,0.65)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(xR,iy+pt);ctx.lineTo(xR,iy+pt+ph);ctx.stroke();
    ctx.restore();
    ctx.fillStyle='rgba(105,240,174,0.8)';ctx.font='8px JetBrains Mono,monospace';
    ctx.fillText('⟨r⟩',xR+3,iy+pt+9);
  }
  ctx.strokeStyle=lightTheme?'#0077cc':'#00e5ff';
  ctx.lineWidth=1.8;
  ctx.beginPath();
  ctx.moveTo(ix+pl,iy+pt+ph);
  for(let j=1;j<NPTS;j++){
    const x=ix+pl+j/(NPTS-1)*pw, y=iy+pt+ph*(1-total[j]/maxP);
    ctx.lineTo(x,y);
  }
  ctx.stroke();
  // r axis label
  ctx.fillStyle=tc;ctx.font='9px JetBrains Mono,monospace';ctx.textAlign='center';
  ctx.fillText('r / a₀',ix+pl+pw/2,iy+iH-3);
  ctx.textAlign='left';
}

// Self-contained projection builder — evaluates rhoAt directly, no voxelVals dependency.
// Works in any viz mode (Cloud, Slice-only, etc.) and always reflects current comps.
// N=48: 3×48³ ≈ 330k evals ≈ 10–20 ms — acceptable on orbital change.
function buildProjectionsDirect(){
  if(densityEvolves()){
    if(volumeDirty) buildVoxelGrid();
    const n=VRES, xz=new Float32Array(n*n), xy=new Float32Array(n*n), yz=new Float32Array(n*n);
    for(let i=0;i<n;i++)for(let j=0;j<n;j++)for(let k=0;k<n;k++){
      const density=voxelVals[i*n*n+j*n+k];
      xz[i*n+k]+=density;
      xy[i*n+j]+=density;
      yz[j*n+k]+=density;
    }
    for(const [plane,vals] of Object.entries({xz,xy,yz})){
      projData[plane]={vals,maxV:Math.max(1e-30,...vals),N:n};
    }
    projDirty=false;
    return;
  }
  const PN=48, rm=rMax(), step=2*rm/(PN-1);
  ['xz','xy','yz'].forEach(pln=>{
    const p2D=new Float32Array(PN*PN); let maxV=1e-30;
    for(let a=0;a<PN;a++){
      const u=-rm+a*step;
      for(let b=0;b<PN;b++){
        const v=-rm+b*step;
        let sum=0;
        for(let c=0;c<PN;c++){
          const w=-rm+c*step;
          let x,y,z;
          if(pln==='xz'){x=u;y=w;z=v;}
          else if(pln==='xy'){x=u;y=v;z=w;}
          else{x=w;y=u;z=v;}
          sum+=densityAt(x,y,z,t);
        }
        p2D[a*PN+b]=sum; if(sum>maxV)maxV=sum;
      }
    }
    projData[pln]={vals:p2D,maxV,N:PN};
  });
  projDirty=false;
}

// Legacy: kept in case called from other paths, now just delegates.
function buildProjections(){
  buildProjectionsDirect();
}

// Volumetric ray-march for projection panels — mirrors GPU density-volume shader exactly.
// Results are cached; invalidated on orbital/palette/opacity change.
function buildVolProjections(){
  if(!voxelVals)return;
  const PN=48, rm=rMax(), step=2*rm/(PN-1);
  const fogClip=0.008+isoOp*0.65;
  const baseDens=densOp*27/PN; // mirrors GPU: u_densOp*27/VS
  projVolCache={};
  ['xz','xy','yz'].forEach(pln=>{
    const imgD=new ImageData(PN,PN);
    for(let a=0;a<PN;a++){
      const u=-rm+a*step;
      for(let b=0;b<PN;b++){
        const vv=-rm+b*step;
        let accR=0,accG=0,accB=0,accA=0;
        for(let c=0;c<PN;c++){
          if(accA>=0.97) break;
          const w=-rm+c*step;
          let wx,wy,wz;
          if(pln==='xz'){wx=u;wy=w;wz=vv;}
          else if(pln==='xy'){wx=u;wy=vv;wz=w;}
          else{wx=w;wy=u;wz=vv;}
          const raw=sampleVoxel(wx,wy,wz)/voxelMaxV;
          const pv=Math.pow(raw,0.42);
          if(pv<fogClip) continue;
          const sa=pv*baseDens*(1-accA);
          const col=palColor(pv,densityPalette);
          accR+=col[0]*sa; accG+=col[1]*sa; accB+=col[2]*sa; accA+=sa;
        }
        const i2=(b*PN+a)*4;
        imgD.data[i2  ]=Math.min(255,accR|0);
        imgD.data[i2+1]=Math.min(255,accG|0);
        imgD.data[i2+2]=Math.min(255,accB|0);
        imgD.data[i2+3]=Math.min(255,accA*255|0);
      }
    }
    const tmp=document.createElement('canvas');
    tmp.width=PN; tmp.height=PN;
    tmp.getContext('2d').putImageData(imgD,0,0);
    projVolCache[pln]=tmp;
  });
}

function drawProjectionPanels(){
  // Build volumetric cache if stale (same ray-march as GPU volume shader)
  if(!projVolCache&&voxelVals&&!volumeDirty&&!densityEvolves()) buildVolProjections();
  // Keep sum-based projData as fallback for modes where voxelVals isn't built
  if(projDirty&&!projVolCache) buildProjectionsDirect();
  const pW=Math.min(100,Math.floor((W-42)/3)),pH=pW,gap=6;
  const labels=['XZ','XY','YZ'];
  projPanelHitBoxes=[];
  ['xz','xy','yz'].forEach((pln,pi)=>{
    const px=14+(pW+gap)*pi,py=14;
    projPanelHitBoxes.push({plane:pln,x:px-2,y:py-2,w:pW+4,h:pH+22});
    _insetBg(px-2,py-2,pW+4,pH+20);
    const volSrc=projVolCache&&projVolCache[pln];
    if(volSrc){
      // Volumetric render — visually identical to main canvas
      ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      ctx.filter='blur(1.2px)';
      ctx.drawImage(volSrc,px,py,pW,pH);
      ctx.restore();
    } else {
      // Fallback: direct palette lookup from pre-built projection sums
      const pd=projData[pln];if(!pd)return;
      const N=pd.N;
      const imgD=ctx.createImageData(N,N);
      for(let a=0;a<N;a++)for(let b=0;b<N;b++){
        const v=Math.pow(pd.vals[a*N+b]/pd.maxV,0.42);
        const c=palColor(v,densityPalette);
        const i2=(b*N+a)*4;
        imgD.data[i2]=c[0];imgD.data[i2+1]=c[1];imgD.data[i2+2]=c[2];imgD.data[i2+3]=v>0.02?255:0;
      }
      const tmp=document.createElement('canvas');tmp.width=N;tmp.height=N;
      tmp.getContext('2d').putImageData(imgD,0,0);
      ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      ctx.filter='blur(1.2px)';
      ctx.drawImage(tmp,px,py,pW,pH);
      ctx.restore();
    }
    // Label — highlight on hover
    const tc=lightTheme?'#6070a0':'#8aa0c8';
    const hovered=projHoveredPlane===pln;
    ctx.fillStyle=hovered?(lightTheme?'#0066cc':'#00e5ff'):tc;
    ctx.font='bold 9px JetBrains Mono,monospace';
    ctx.textAlign='center';
    ctx.fillText(labels[pi]+(hovered?' ← click':''),(px+pW/2),py+pH+12);
    ctx.textAlign='left';
  });
}
// ────────────────────────────────────────────────────────────────
//  PROJECTION-PANEL CLICK — snap camera to axis-aligned view
// ────────────────────────────────────────────────────────────────
let projHoveredPlane=null; // plane currently under the mouse, or null

// Target angles for each projection plane:
//  XZ panel sums along Y  → look from +Y: theta=π/2, phi=π/2
//  XY panel sums along Z  → look from +Z: theta≈0 (top-down)
//  YZ panel sums along X  → look from +X: theta=π/2, phi=0
const PROJ_CAM={
  xz:{theta:Math.PI/2, phi:Math.PI/2},
  xy:{theta:0.01,      phi:0},
  yz:{theta:Math.PI/2, phi:0},
};

let _camTween=null;
function snapCamTo(plane){
  const tgt=PROJ_CAM[plane];if(!tgt)return;
  let startTheta=camTheta,startPhi=camPhi;
  // Normalise phi difference to [-π, π] for shortest-arc interpolation
  let dPhi=tgt.phi-startPhi;
  while(dPhi> Math.PI)dPhi-=2*Math.PI;
  while(dPhi<-Math.PI)dPhi+=2*Math.PI;
  const endPhi=startPhi+dPhi;
  const dur=350; // ms
  const t0=performance.now();
  if(_camTween)cancelAnimationFrame(_camTween);
  function step(){
    const p=Math.min(1,(performance.now()-t0)/dur);
    const e=1-(1-p)**3; // ease-out cubic
    camTheta=startTheta+(tgt.theta-startTheta)*e;
    camPhi  =startPhi  +(endPhi-startPhi)*e;
    volNeedsRedraw=true;
    if(p<1)_camTween=requestAnimationFrame(step);
    else _camTween=null;
  }
  _camTween=requestAnimationFrame(step);
}

function drawAxes(cam,rm){
  const axes=[
    {dir:[1,0,0],col:'rgba(255,80,80,0.85)', label:'x'},
    {dir:[0,1,0],col:'rgba(80,220,80,0.85)',  label:'y'},
    {dir:[0,0,1],col:'rgba(80,140,255,0.85)', label:'z'},
  ];
  const[ox,oy]=proj(0,0,0,cam);
  const len=rm*0.9;
  const AS=10; // arrowhead size px
  for(const{dir:[dx,dy,dz],col,label} of axes){
    const[tx,ty]=proj(dx*len,dy*len,dz*len,cam);
    // Axis line
    ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(tx,ty);
    ctx.strokeStyle=col;ctx.lineWidth=1.8;ctx.stroke();
    // Arrowhead
    const ang=Math.atan2(ty-oy,tx-ox);
    ctx.beginPath();
    ctx.moveTo(tx,ty);
    ctx.lineTo(tx-AS*Math.cos(ang-0.4),ty-AS*Math.sin(ang-0.4));
    ctx.lineTo(tx-AS*Math.cos(ang+0.4),ty-AS*Math.sin(ang+0.4));
    ctx.closePath();ctx.fillStyle=col;ctx.fill();
    // Label
    ctx.font='bold 13px JetBrains Mono,monospace';
    ctx.fillStyle=col;
    ctx.fillText(label,tx+6,ty-4);
  }
}

let expertMode=false;
function toggleExpert(){
  expertMode=!expertMode;
  document.getElementById('stGrid').classList.toggle('show-expert',expertMode);
  const button=document.getElementById('expertBtn');
  button.classList.toggle('active',expertMode);
  button.setAttribute('aria-pressed',String(expertMode));
  if(expertMode){
    if(volumeDirty) buildVoxelGrid();
    updateVerification();
  }
}

// ════════════════════════════════════════════════════════════════
//  THEORY PANEL
// ════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════
//  ANALYTICAL VERIFICATION CHECKS
// ════════════════════════════════════════════════════════════════
function runAnalyticalChecks(){
  // Open expert panel so results are visible
  if(!expertMode) toggleExpert();

  const lines=[];
  const PASS='\u2713'; const FAIL='\u2717'; const WARN='\u26a0';

  // ── Test 1: m≠0 eigenstate without spin ──────────────────────
  // Analytical: v = (-m·y/ρ², m·x/ρ², 0), |v| = |m|/ρ_cyl
  if(!spinEnabled && comps.length===1 && comps[0].m!==0){
    const m=comps[0].m;
    let maxErr=0;
    const testPts=[[3,0,0],[0,3,0],[2,2,0],[1.5,2.5,0],[4,1,0]];
    for(const[x,y,z] of testPts){
      const rho2=x*x+y*y;
      const [vx,vy,vz]=bohmV(comps,x,y,z,t);
      const vAnalytic=[-m*y/rho2, m*x/rho2, 0];
      const err=Math.sqrt(
        (vx-vAnalytic[0])**2+(vy-vAnalytic[1])**2+(vz-vAnalytic[2])**2
      )/Math.max(Math.abs(m)/Math.sqrt(rho2),1e-6);
      maxErr=Math.max(maxErr,err);
    }
    const ok=maxErr<0.02;
    lines.push(`${ok?PASS:FAIL} m≠0 azimuthal v: max err ${(maxErr*100).toFixed(2)}% (expect <2%) ${ok?'':'— FD grid too coarse near axis?'}`);
  } else if(!spinEnabled && comps.length===1 && comps[0].m===0){
    lines.push(`${WARN} m=0 eigenstate — v should be 0 everywhere (no circulation). Enable spin to see spin-curl.`);
  }

  // ── Test 2: 1s product spin — |v| = sin∠(r̂, n̂) ─────────────
  if(spinEnabled && spinMode==='product' && comps.length===1 && comps[0].n===1 && comps[0].l===0){
    const nx=Math.sin(spinTheta)*Math.cos(spinPhi);
    const ny=Math.sin(spinTheta)*Math.sin(spinPhi);
    const nz=Math.cos(spinTheta);
    // Test at several radii to confirm r-independence
    const testPts=[[1,0,0],[2,0,0],[0.5,0.5,0],[3,1,0],[0,2,1]];
    let maxErr=0;
    for(const[x,y,z] of testPts){
      const r=Math.sqrt(x*x+y*y+z*z); if(r<0.1) continue;
      const rx=x/r, ry=y/r, rz=z/r;
      // v_analytical = -(r̂ × n̂)
      const axn=[ry*nz-rz*ny, rz*nx-rx*nz, rx*ny-ry*nx];
      const vAnalytic=[-axn[0],-axn[1],-axn[2]];
      const[vx,vy,vz]=bohmVPauli(spinComps,x,y,z,t);
      const mag=Math.sqrt(vAnalytic[0]**2+vAnalytic[1]**2+vAnalytic[2]**2);
      if(mag<1e-6) continue;
      const err=Math.sqrt((vx-vAnalytic[0])**2+(vy-vAnalytic[1])**2+(vz-vAnalytic[2])**2)/mag;
      maxErr=Math.max(maxErr,err);
    }
    const ok=maxErr<0.05;
    lines.push(`${ok?PASS:FAIL} 1s+spin v=−(r̂×n̂): max err ${(maxErr*100).toFixed(2)}% (expect <5% — FD accuracy)`);
    // Also check r-independence: |v| should be same at r=1 and r=3
    const[v1x,v1y,v1z]=bohmVPauli(spinComps,1,0,0,t);
    const[v3x,v3y,v3z]=bohmVPauli(spinComps,3,0,0,t);
    const mag1=Math.sqrt(v1x**2+v1y**2+v1z**2);
    const mag3=Math.sqrt(v3x**2+v3y**2+v3z**2);
    const rErr=Math.abs(mag1-mag3)/Math.max(mag1,1e-6);
    const rok=rErr<0.05;
    lines.push(`${rok?PASS:FAIL} 1s+spin r-independence: |v|(r=1)=${mag1.toFixed(3)}, |v|(r=3)=${mag3.toFixed(3)}, diff ${(rErr*100).toFixed(1)}% (expect <5%)`);
  }

  // ── Test 3: spinor norm ──────────────────────────────────────
  if(spinEnabled && spinComps.length){
    const norm=spinComps.reduce((s,c)=>s+c.upRe**2+c.upIm**2+c.dnRe**2+c.dnIm**2,0);
    const ok=Math.abs(norm-1)<0.0001;
    lines.push(`${ok?PASS:FAIL} Spinor norm = ${norm.toFixed(6)} (expect 1.000000)`);
  }

  // ── Test 4: ρ↑ fraction vs cos²(θ/2) ─────────────────────────
  if(spinEnabled && spinMode==='product' && voxelRhoUp && voxelRhoDn){
    let sumUp=0,sumTot=0;
    for(let i=0;i<voxelRhoUp.length;i++){sumUp+=voxelRhoUp[i];sumTot+=voxelRhoUp[i]+voxelRhoDn[i];}
    const frac=sumTot>0?sumUp/sumTot:0.5;
    const expected=Math.cos(spinTheta/2)**2;
    const err=Math.abs(frac-expected);
    const ok=err<0.015;
    lines.push(`${ok?PASS:FAIL} ρ↑ fraction: measured ${frac.toFixed(4)}, analytical cos²(θ/2)=${expected.toFixed(4)}, err=${(err*100).toFixed(2)}% (expect <1.5%)`);
  }

  if(!lines.length) lines.push(`${WARN} No applicable tests for current state. Try: m≠0 eigenstate without spin, or 1s+product spin.`);

  // Display in a browser alert (simple, always visible) + console
  console.table(lines);
  const msg='Analytical Verification Results\n─────────────────────────────────\n'+lines.join('\n');
  // Show in a temporary overlay on the canvas
  let box=document.getElementById('verifyResultBox');
  if(!box){
    box=document.createElement('div');box.id='verifyResultBox';
    box.style.cssText='position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(6,11,22,.97);border:1px solid #16213a;padding:18px 22px;z-index:500;max-width:520px;width:90%;border-radius:4px;font-size:11px;line-height:1.8;white-space:pre-wrap;cursor:pointer;';
    box.title='Click to close';
    box.onclick=()=>box.remove();
    document.querySelector('.canvas-wrap').appendChild(box);
  }
  box.textContent=msg+'\n\n(Click to close)';
  // Auto-close after 12 seconds
  clearTimeout(box._t);box._t=setTimeout(()=>box.remove(),12000);
}

// ════════════════════════════════════════════════════════════════
//  COMPREHENSIVE VERIFICATION SWEEP
// ════════════════════════════════════════════════════════════════
// Checks the continuity equation ∂ρ/∂t + ∇·(ρv) = 0 at several
// test points.  This is the gold-standard equivariance test: if
// satisfied, the velocity field correctly transports the Born
// distribution for ANY state (eigenstate, superposition, spinor).
// compsArg / useSpinArg / spinCompsArg are evaluated directly —
// the function saves & restores the globals so callers need not
// worry about global state.
function verifyContinuity(compsArg, useSpinArg, spinCompsArg, time_t, nTests, rBox) {
  // Temporarily set globals so bohmV dispatches correctly
  const savedSpin = spinEnabled, savedSC = spinComps, savedComps = comps;
  spinEnabled = useSpinArg; spinComps = spinCompsArg; comps = compsArg;

  const h = 0.25, dt_c = 0.003;
  const getRho = (x,y,z,T) =>
    useSpinArg ? rhoSpinAt(spinCompsArg,x,y,z,T) : rhoAt(compsArg,x,y,z,T);
  const getV = (x,y,z) => bohmV(compsArg,x,y,z,time_t); // dispatches via globals

  // Deterministic test points distributed inside rBox using Fibonacci sphere
  const pts = [];
  const golden = 2.39996322972865; // 2π/φ²
  for(let i = 0; pts.length < nTests && i < nTests * 8; i++) {
    const u = (i + 0.5) / (nTests * 8);
    const r = rBox * Math.cbrt(u * 0.9 + 0.1);
    const th = Math.acos(1 - 2 * u);
    const ph = i * golden;
    const x = r*Math.sin(th)*Math.cos(ph), y = r*Math.sin(th)*Math.sin(ph), z = r*Math.cos(th);
    const rho0 = getRho(x,y,z,time_t);
    if(rho0 < 1e-7) continue;
    pts.push([x, y, z]);
  }

  let maxRelErr = 0, nValid = 0;
  for(const [x,y,z] of pts) {
    // ∂ρ/∂t  (central time difference)
    const drhodt = (getRho(x,y,z,time_t+dt_c) - getRho(x,y,z,time_t-dt_c)) / (2*dt_c);
    // ∇·(ρv): central differences of each Jᵢ = ρ·vᵢ  
    const Jpx = getRho(x+h,y,z,time_t) * getV(x+h,y,z)[0];
    const Jnx = getRho(x-h,y,z,time_t) * getV(x-h,y,z)[0];
    const Jpy = getRho(x,y+h,z,time_t) * getV(x,y+h,z)[1];
    const Jny = getRho(x,y-h,z,time_t) * getV(x,y-h,z)[1];
    const Jpz = getRho(x,y,z+h,time_t) * getV(x,y,z+h)[2];
    const Jnz = getRho(x,y,z-h,time_t) * getV(x,y,z-h)[2];
    const divJ = (Jpx-Jnx)/(2*h) + (Jpy-Jny)/(2*h) + (Jpz-Jnz)/(2*h);
    const residual = Math.abs(drhodt + divJ);
    const scale = Math.max(Math.abs(drhodt), Math.abs(divJ), 1e-12);
    maxRelErr = Math.max(maxRelErr, residual / scale);
    nValid++;
  }

  spinEnabled = savedSpin; spinComps = savedSC; comps = savedComps;
  return { maxRelErr, nValid };
}

// Sweep all scalar-Bohm eigenstates + representative superpositions and
// report pass/fail for (a) the exact velocity formula and (b) the
// continuity equation for each case.
function runSweep() {
  // Show a "Computing…" placeholder immediately so the user sees a response
  let box = document.getElementById('verifyResultBox');
  if(!box) {
    box = document.createElement('div'); box.id = 'verifyResultBox';
    box.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);'
      + 'background:rgba(6,11,22,.97);border:1px solid #16213a;padding:18px 22px;z-index:500;'
      + 'max-width:560px;width:90%;border-radius:4px;font-size:10.5px;line-height:1.75;'
      + 'white-space:pre;cursor:pointer;max-height:80vh;overflow-y:auto;font-family:monospace;';
    box.title = 'Click to close';
    box.onclick = () => box.remove();
    document.querySelector('.canvas-wrap').appendChild(box);
  }
  box.textContent = 'Running sweep \u2014 please wait\u2026';

  // Defer actual work one frame so the browser paints the placeholder first
  requestAnimationFrame(() => {
  try {
  const PASS = '\u2713', FAIL = '\u2717';
  const lines = [];
  let pass = 0, fail = 0;

  // Save & override globals so bohmV uses scalar path for every sub-test
  const saveSpin = spinEnabled, saveSC = spinComps, saveComps = comps;
  spinEnabled = false; spinComps = [];

  lines.push('SCALAR BOHM \u2014 ALL PURE EIGENSTATES (n=1\u20136)');
  lines.push('\u2500'.repeat(50));

  for(const orb of ORBITALS) {
    const c1 = [{n:orb.n, l:orb.l, m:orb.m, cRe:1, cIm:0}];
    comps = c1; // needed so bohmV dispatch is correct
    const label = orb.label.padEnd(7);

    // Scale test points to the orbital's natural radius n² so density is non-negligible.
    // Six equatorial points (z=0 → sinθ=1, avoids angular nodal planes for all m)
    // plus two off-equator points. Scaling by n² places them near the radial peak.
    const rScale = orb.n * orb.n;
    const orbPts = [
      [rScale,      0,          0         ],
      [0,           rScale,     0         ],
      [rScale*0.71, rScale*0.71,0         ],
      [-rScale*0.5, rScale*0.87,0         ],
      [rScale*0.6,  rScale*0.6, rScale*0.4],
      [0,           rScale*0.8, rScale*0.4],
    ];

    if(orb.m === 0) {
      let maxSpd = 0;
      for(const [x,y,z] of orbPts) {
        const [vx,vy,vz] = bohmV(c1, x, y, z, 0);
        maxSpd = Math.max(maxSpd, Math.sqrt(vx*vx+vy*vy+vz*vz));
      }
      const ok = maxSpd < 0.005;
      ok ? pass++ : fail++;
      lines.push(`${ok?PASS:FAIL} ${label} m= 0   v\u22480:  max|v|=${maxSpd.toExponential(2)}`);
    } else {
      let maxErr = 0, nTested = 0;
      for(const [x,y,z] of orbPts) {
        const rho2 = x*x+y*y; if(rho2 < 0.01) continue;
        // Skip near-nodal points: when |ψ|² ≈ 0, bohmV returns [0,0,0] by convention
        // (0/0 is undefined), so comparing with the analytical formula is meaningless.
        const psi = psiXYZ(c1, x, y, z, 0);
        if(psi[0]*psi[0]+psi[1]*psi[1] < 1e-8) continue;
        const [vx,vy,vz] = bohmV(c1, x, y, z, 0);
        const evx = -orb.m*y/rho2, evy = orb.m*x/rho2;
        const ref = Math.abs(orb.m)/Math.sqrt(rho2);
        maxErr = Math.max(maxErr, Math.sqrt((vx-evx)**2+(vy-evy)**2+vz**2)/ref);
        nTested++;
      }
      const ok = nTested > 0 && maxErr < 0.025;
      ok ? pass++ : fail++;
      const note = nTested === 0 ? ' (all pts nodal!)' : '';
      lines.push(`${ok?PASS:FAIL} ${label} m=${orb.m>0?'+':''}${orb.m}  FD err: ${(maxErr*100).toFixed(2)}% (n=${nTested})${note}`);
    }
  }

  lines.push('');
  lines.push(`Eigenstate velocity checks: ${pass}/${pass+fail} passed`);

  // Continuity equation ∂ρ/∂t + ∇·(ρv) = 0 — only meaningful for superpositions
  // where ρ(t) oscillates and both terms are large, so their cancellation is a
  // non-trivial test of the guidance velocity.
  // Pure m≠0 eigenstates are excluded: ∂ρ/∂t ≡ 0 and ∇·J ≡ 0 analytically, but both
  // are also ~0 numerically (FD noise), making the ratio ε/ε ≈ 100% regardless of correctness.
  // Those states are already validated by the exact velocity formula test above.
  lines.push('');
  lines.push('CONTINUITY \u2202\u03c1/\u2202t + \u2207\u00b7(\u03c1v) = 0  (superpositions only — equivariance check)');
  lines.push('\u2500'.repeat(50));

  const contCases = [
    {label:'1s+2s   superpos  ', c:[{n:1,l:0,m:0,cRe:1/Math.SQRT2,cIm:0},{n:2,l:0,m:0,cRe:1/Math.SQRT2,cIm:0}], sp:false, sc:[], T:4,  rb:12},
    {label:'1s+2pz  sp super  ', c:[{n:1,l:0,m:0,cRe:1/Math.SQRT2,cIm:0},{n:2,l:1,m:0,cRe:1/Math.SQRT2,cIm:0}], sp:false, sc:[], T:3,  rb:12},
    {label:'2pz+3dz pd beat   ', c:[{n:2,l:1,m:0,cRe:1/Math.SQRT2,cIm:0},{n:3,l:2,m:0,cRe:1/Math.SQRT2,cIm:0}], sp:false, sc:[], T:3,  rb:24},
    {label:'2p++3d+ circ      ', c:[{n:2,l:1,m:+1,cRe:1/Math.SQRT2,cIm:0},{n:3,l:2,m:+1,cRe:1/Math.SQRT2,cIm:0}],sp:false,sc:[],T:5, rb:22},
    {label:'3p++4d+ circ      ', c:[{n:3,l:1,m:+1,cRe:1/Math.SQRT2,cIm:0},{n:4,l:2,m:+1,cRe:1/Math.SQRT2,cIm:0}],sp:false,sc:[],T:6, rb:35},
    {label:'2p-+3p- CW circ   ', c:[{n:2,l:1,m:-1,cRe:1/Math.SQRT2,cIm:0},{n:3,l:1,m:-1,cRe:1/Math.SQRT2,cIm:0}],sp:false,sc:[],T:4, rb:22},
  ];

  let cPass = 0, cFail = 0;
  for(const ct of contCases) {
    const {maxRelErr, nValid} = verifyContinuity(ct.c, ct.sp, ct.sc, ct.T, 16, ct.rb);
    const ok = maxRelErr < 0.06;
    ok ? (pass++, cPass++) : (fail++, cFail++);
    lines.push(`${ok?PASS:FAIL} ${ct.label} err=${(maxRelErr*100).toFixed(2)}% (n=${nValid})`);
  }
  lines.push('');
  lines.push(`Continuity checks: ${cPass}/${cPass+cFail} passed`);
  lines.push('');
  lines.push(`\u2550 GRAND TOTAL: ${pass}/${pass+fail} passed \u2550`);

  // Restore globals
  spinEnabled = saveSpin; spinComps = saveSC; comps = saveComps;

  // Display (box was already created and shown at the top of runSweep)
  box.textContent = 'Comprehensive Verification Sweep\n' + '\u2550'.repeat(40) + '\n' + lines.join('\n') + '\n\n(Click to close)';
  clearTimeout(box._t); box._t = setTimeout(() => box.remove(), 60000);
  console.log(lines.join('\n'));
  } catch(e) {
    box.textContent = 'Sweep error:\n' + e.message + '\n\n' + e.stack + '\n\n(Click to close)';
    console.error('runSweep error:', e);
  }
  }); // end requestAnimationFrame
}

function toggleAxes(){
  showAxes=!showAxes;
  document.getElementById('axesBtn').classList.toggle('active',showAxes);
}

function toggleInset(){
  showInset=!showInset;
  document.getElementById('insetBtn').classList.toggle('active',showInset);
}

function toggleProjections(){
  showProjections=!showProjections;
  if(showProjections&&projDirty&&voxelVals) buildProjections();
  document.getElementById('projBtn').classList.toggle('active',showProjections);
}

// ════════════════════════════════════════════════════════════════
//  VIEW TOGGLES
// ════════════════════════════════════════════════════════════════
// Volume / Slices / Lobes / Cloud form a RADIO GROUP — only one active at a time.
// Phase is an independent OVERLAY that combines with Volume, Slices, or Lobes.
function toggleViz(which){
  if(which==='phase'){
    // Phase overlay is incompatible with spin (gauge-ambiguous for spinors)
    if(spinEnabled){return;}
    showPhase=!showPhase;
    // Phase overlay makes no sense in Cloud mode — switch to Volume
    if(showPhase&&showCloud){
      showCloud=false;
      showVol=true;
      particles=sampleParticles(nPart,t);
    }
    _syncVizUI();
    return;
  }

  // Determine if this mode is currently active
  const wasCloud=showCloud;

  // Turn all exclusive modes off
  showVol=false; showSlice=false; showLobes=false; showCloud=false;

  if(which==='volume') showVol=true;
  else if(which==='slice') showSlice=true;
  else if(which==='lobes') showLobes=true;
  else if(which==='cloud'){
    showCloud=true;
    if(!wasCloud){cachedVolCanvas=null;initCloudParts();}
  }

  // Restore trail particles when leaving cloud mode
  if(wasCloud&&!showCloud) particles=sampleParticles(nPart,t);

  // Phase overlay is incompatible with Cloud
  if(showCloud) showPhase=false;

  _syncVizUI();
}

function _syncVizUI(){
  for(const [id,active] of Object.entries({vtVol:showVol,vtSlice:showSlice,vtLobes:showLobes,vtCloud:showCloud,vtPhase:showPhase})){
    const button=document.getElementById(id);
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  }
  document.getElementById('sliceRow').style.display=showSlice?'flex':'none';
  document.getElementById('lobeRow').style.display=showLobes?'flex':'none';
  document.getElementById('cloudRow').style.display=showCloud?'flex':'none';
  const autoRow=document.getElementById('cloudAutoRow');
  if(autoRow)autoRow.style.display=showCloud?'flex':'none';
  if(showVol||showLobes){volNeedsRedraw=true;cachedVolCanvas=null;}
  if(showLobes){lobeTexDirty=true;}
  // Grey out Phase tab when spin is active
  const phBtn=document.getElementById('vtPhase');
  if(phBtn){phBtn.disabled=spinEnabled;phBtn.title=spinEnabled?'Phase overlay unavailable in spin mode (gauge-ambiguous for spinors)':phBtn.getAttribute('data-title')||phBtn.title;}
  updateLegend();
}

// ════════════════════════════════════════════════════════════════
//  SPIN UI (toggle, mode, colour pickers)
// ════════════════════════════════════════════════════════════════
function toggleSpin(){
  spinEnabled=!spinEnabled;
  if(spinEnabled){
    // Turning on: build spinComps from current state
    if(spinMode==='jstate') _refreshJStateDropdown();
    else buildSpinComps();
    // Phase mode is incompatible with spin
    if(showPhase){showPhase=false;}
  }else{
    spinComps=[];
    if(superKey==='none') buildComps();
    voxelRhoUp=null;voxelRhoDn=null;
    // If we were in a spin-super preset, revert to its scalar comps
    if(SPIN_SUPERS[superKey]){
      superKey='none';
      document.getElementById('superSel').value='none';
      buildComps();
      updateInfo();
    }
  }
  invalidateDensity();
  t=0;
  if(showCloud){initCloudParts();}else{particles=sampleParticles(nPart);}
  if(superKey==='none') updateInfo();
  _syncSpinUI();
  _syncVizUI();
  updateQuickPresets();
}

function _syncSpinUI(){
  const btn=document.getElementById('spinToggleBtn');
  if(btn)btn.classList.toggle('active',spinEnabled);
  const sec=document.getElementById('spinSubSection');
  if(sec)sec.style.display=spinEnabled?'block':'none';
  const pr=document.getElementById('spinProductRow');
  const pr2=document.getElementById('spinProductRow2');
  const jr=document.getElementById('spinJRow');
  if(pr) pr.style.display=(spinEnabled&&spinMode==='product')?'flex':'none';
  if(pr2)pr2.style.display=(spinEnabled&&spinMode==='product')?'flex':'none';
  if(jr) jr.style.display=(spinEnabled&&spinMode==='jstate') ?'flex':'none';
  // Update mode radio buttons
  const mProd=document.getElementById('spinModeProd');
  const mJst =document.getElementById('spinModeJst');
  if(mProd)mProd.checked=(spinMode==='product');
  if(mJst){
    mJst.checked=spinMode==='jstate';
    mJst.disabled=superKey!=='none';
  }
  const fixedSpin=Boolean(SPIN_SUPERS[superKey]);
  for(const id of ['sSpinTheta','sSpinPhi']) document.getElementById(id).disabled=fixedSpin;
  // Update spin colour swatches in legend
  const upSw=document.getElementById('spinUpSwatch');
  const dnSw=document.getElementById('spinDnSwatch');
  if(upSw)upSw.style.background=spinUpColor.hex;
  if(dnSw)dnSw.style.background=spinDnColor.hex;
  updateLegend();
}

function setSpinMode(mode){
  if(mode==='jstate'&&superKey!=='none') return;
  spinMode=mode;
  t=0;previousFrame=undefined;
  buildComps();
  if(showCloud){initCloudParts();}else{particles=sampleParticles(nPart);}
  if(superKey==='none') updateInfo();
  _syncSpinUI();
}

function setJState(idx){
  // Use dynamic entries built for the current orbital (never stale 2p data for a 1s atom)
  if(!_currentJEntries.length) _refreshJStateDropdown();
  const entry=_currentJEntries[idx]; if(!entry) return;
  _applyJState(entry);
  invalidateDensity();t=0;previousFrame=undefined;
  if(showCloud){initCloudParts();}else{particles=sampleParticles(nPart);}
  updateInfo();
}

function setSpinUpColor(hex){
  const c=hexToRgb(hex);spinUpColor={r:c.r,g:c.g,b:c.b,hex};
  lobeTexDirty=true;volNeedsRedraw=true;
  const sw=document.getElementById('spinUpSwatch');if(sw)sw.style.background=hex;
  updateLegend();
}
function setSpinDnColor(hex){
  const c=hexToRgb(hex);spinDnColor={r:c.r,g:c.g,b:c.b,hex};
  lobeTexDirty=true;volNeedsRedraw=true;
  const sw=document.getElementById('spinDnSwatch');if(sw)sw.style.background=hex;
  updateLegend();
}
function hexToRgb(hex){
  const m=hex.replace('#','').match(/.{2}/g);
  return m?{r:parseInt(m[0],16),g:parseInt(m[1],16),b:parseInt(m[2],16)}:{r:255,g:255,b:255};
}

// Legacy helper — still used in a few places (ss auto-switch, init).
// Deactivates all exclusive modes, then activates the requested one.
function setView(mode){
  showVol=false;showLobes=false;showSlice=false;
  if(mode==='volume') showVol=true;
  else if(mode==='lobes') showLobes=true;
  else if(mode==='slice') showSlice=true;
  else if(mode==='both'){showVol=true;showSlice=true;}
  _syncVizUI();
}

function updateLegend(){
  const div=document.getElementById('legend');
  const curPal=PAL_META.find(p=>p.key===densityPalette)||PAL_META[0];
  const curPhasePal=PHASE_PAL_META.find(p=>p.key===phasePalette)||PHASE_PAL_META[0];
  const palRow=(lbl)=>`<button class="lrow-btn" onclick="openLegPalPop(event)" title="Change palette"><span class="lsw" style="background:${curPal.grad}"></span>${lbl}</button>`;
  const phaseRow=(lbl)=>`<button class="lrow-btn" onclick="openLegPhasePalPop(event)" title="Change phase palette"><span class="lsw" style="background:${curPhasePal.grad}"></span>${lbl}</button>`;
  const volRows   = showPhase
    ? phaseRow('arg(ψ) volume — red=0, cyan=±π')
    : palRow('|ψ|² volume');
  const lobeRows  = showPhase
    ? phaseRow('arg(ψ) lobes — red=0, cyan=±π')
    : spinEnabled ? '<div class="lrow">Spin density isosurface</div>' : palRow('|ψ|² lobes')+`<div class="lrow"><span class="lsw" style="background:linear-gradient(90deg,#1010c0,#4060e0,#8090ff)"></span>Negative-ψ lobe</div>`;
  const sliceRows=palRow('|ψ|² slice')
    +`<div class="lrow"><span class="lsw" style="background:transparent;border:1.5px solid rgba(0,220,255,.8);border-radius:2px"></span>Isosurface</div>`;
  const tg=`linear-gradient(90deg,${ptColor.hex}22,${ptColor.hex})`;
  const pg=`radial-gradient(circle at 40%,${ptColor.hex},${ptColor.hex}44)`;
  const colDots=PT_PRESETS.map(p=>`<button class="leg-col-opt${p===ptColor?' sel':''}" style="background:${p.hex}" title="${p.label}" onclick="setParticleColor('${p.label}')"></button>`).join('');
  const palOpts=PAL_META.map(p=>`<div class="pal-opt${p.key===densityPalette?' selected':''}" onclick="setPaletteByKey('${p.key}')"><span class="pal-swatch" style="background:${p.grad}"></span>${p.label}</div>`).join('');
  const phaseOpts=PHASE_PAL_META.map(p=>`<div class="pal-opt${p.key===phasePalette?' selected':''}" onclick="setPhasePaletteByKey('${p.key}')"><span class="pal-swatch" style="background:${p.grad}"></span>${p.label}</div>`).join('');
  // Spin channel rows
  const spinRows=spinEnabled&&spinComps.length&&!showSlice?`
    <div class="lrow spin-lrow">
      <button class="lrow-btn" onclick="document.getElementById('spinUpPicker').click()" title="Change spin-↑ colour"><span class="lsw" id="spinUpSwatch" style="background:${spinUpColor.hex}"></span>Spin ↑ (ρ<sub>↑</sub>)</button>
      <input type="color" id="spinUpPicker" style="opacity:0;position:absolute;width:0;height:0" value="${spinUpColor.hex}" oninput="setSpinUpColor(this.value)">
    </div>
    <div class="lrow spin-lrow">
      <button class="lrow-btn" onclick="document.getElementById('spinDnPicker').click()" title="Change spin-↓ colour"><span class="lsw" id="spinDnSwatch" style="background:${spinDnColor.hex}"></span>Spin ↓ (ρ<sub>↓</sub>)</button>
      <input type="color" id="spinDnPicker" style="opacity:0;position:absolute;width:0;height:0" value="${spinDnColor.hex}" oninput="setSpinDnColor(this.value)">
    </div>`:'';
  const common=`
    ${spinRows}
    ${showCloud?'':`<button class="lrow-btn" onclick="openLegColPop(event)" title="Change particle color"><span class="lsw" style="background:${tg}"></span>Particle trail</button>
    <button class="lrow-btn" onclick="openLegColPop(event)" title="Change particle color"><span class="lsw" style="background:${pg}"></span>Particle</button>`}
    <div class="lrow"><span class="lsw" style="background:radial-gradient(circle at 30%,#ff7040,transparent)"></span>Proton</div>
    <div class="leg-colpop" id="legColPop">${colDots}</div>
    <div class="leg-pal-pop" id="legPalPop">${palOpts}</div>
    <div class="leg-pal-pop" id="legPhasePalPop">${phaseOpts}</div>`;
  const phaseRows=phaseRow('arg(ψ) slice — red=0, cyan=±π')
    +`<div class="lrow"><span class="lsw" style="background:transparent;border:1.5px solid rgba(0,220,255,.8);border-radius:2px"></span>Isosurface</div>`;
  let legendRows='';
  if(showLobes) legendRows+=lobeRows;
  if(showVol)   legendRows+=volRows;
  if(showSlice&&!showPhase) legendRows+=sliceRows;
  if(showSlice&&showPhase)  legendRows+=phaseRows;
  if(showCloud) legendRows='<div class="lrow">Probability samples</div>';
  if(!legendRows) legendRows=volRows;
  div.innerHTML=legendRows+common;
}
function openLegColPop(e){
  e.stopPropagation();
  document.getElementById('legColPop')?.classList.toggle('open');
  document.getElementById('legPalPop')?.classList.remove('open');
}
function setParticleColor(label){
  ptColor=PT_PRESETS.find(p=>p.label===label)||PT_PRESETS[0];
  cloudSprite=null; // rebuild sphere sprite with new colour
  updateLegend();
}

// ════════════════════════════════════════════════════════════════
//  UI
// ════════════════════════════════════════════════════════════════
function refreshOrbGrid(){
  const ogrid=document.getElementById('ogrid');
  ogrid.innerHTML='';
  ORBITALS.forEach((o,i)=>{
    if(o.n!==selectedN)return;
    const btn=document.createElement('button');
    btn.className='obtn'+(i===orbIdx?' active':'');
    btn.textContent=o.label.replace(/^\d/,''); // strip leading n digit
    const desc=INFO[o.label]||'';
    btn.title=`|${o.n}, ${o.l}, ${o.m>=0?'+':''}${o.m}⟩${desc?'\n'+desc:''}`;
    btn.onclick=()=>selectPureOrbital(i);
    ogrid.appendChild(btn);
  });
}

function buildOrbPicker(){
  const nrow=document.getElementById('nrow');
  [1,2,3,4,5,6].forEach(n=>{
    const btn=document.createElement('button');
    btn.className='nbtn'+(n===selectedN?' active':'');
    btn.textContent='n='+n;
    btn.onclick=()=>{
      selectedN=n;
      document.querySelectorAll('.nbtn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      refreshOrbGrid();
    };
    nrow.appendChild(btn);
  });
  refreshOrbGrid();
}
buildOrbPicker();

function selectPureOrbital(index){
  orbIdx=index;
  selectedN=ORBITALS[index].n;
  document.querySelectorAll('.nbtn').forEach(button=>button.classList.toggle('active',button.textContent===`n=${selectedN}`));
  superKey='none';
  document.getElementById('superSel').value='none';
  t=0;
  previousFrame=undefined;
  buildComps();
  if(showCloud) initCloudParts();
  else particles=sampleParticles(nPart);
  refreshOrbGrid();
  updateInfo();
  updateQuickPresets();
  _syncVizUI();
}

function updateQuickPresets(){
  document.querySelectorAll('[data-orbital-index], #beatPreset').forEach(button=>{
    const active=button.id==='beatPreset' ? superKey==='sp' : superKey==='none'&&Number(button.dataset.orbitalIndex)===orbIdx;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
}

document.querySelectorAll('[data-orbital-index]').forEach(button=>{
  button.addEventListener('click',()=>selectPureOrbital(Number(button.dataset.orbitalIndex)));
});
document.getElementById('beatPreset').addEventListener('click',()=>{
  if(showSlice){
    slicePlane='xz';
    document.getElementById('sliceSel').value=slicePlane;
    camTheta=PROJ_CAM.xz.theta;
    camPhi=PROJ_CAM.xz.phi;
  }
  const dropdown=document.getElementById('superSel');
  dropdown.value='sp';
  dropdown.dispatchEvent(new Event('change'));
});
updateQuickPresets();

document.getElementById('superSel').onchange=function(){
  superKey=this.value;
  t=0;previousFrame=undefined;
  buildComps();
  if(showCloud){initCloudParts();}else{particles=sampleParticles(nPart);}
  const desc={
    px:'Real p_x orbital: (2p₊₁−2p₋₁)/√2 → two lobes along x. Degenerate → stationary particles.',
    ss:'1s+2s (Tumulka 2004): both spherically symmetric → pure radial density oscillation. ΔE=3/8 a.u., period≈16.8 a.u. Particles move in/out along radii. Lobes mode shows a sphere; Volume mode shows the breathing gradient best.',
    sp:'1s+2pz: density oscillates between compact sphere and elongated upper lobe. ΔE=3/8 a.u., period≈16.8 a.u.',
    pd:'2pz+3dz²: slower z-axis beating. ΔE=5/72 a.u., period≈91 a.u. Density pulses between p_z and d_z² shapes.',
    circ:'2p₊₁+3d₊₁: m=+1 on both → CCW azimuthal circulation. Radial density also beats at ΔE=5/72 a.u. Most dynamic: particles orbit while the ring expands/contracts.',
    spin_ss:'1s↑ + 2s↓: the two spin channels add without density interference. The local spin direction and guiding current can change in time.',
    spin_sp:'1s↑ + 2p₀↓: the total density is stationary and symmetric about the xy plane. The spin current can still change in time.',
    spin_circ:'2p₊₁↑ + 3d₊₁↓: stationary total density, with circulation and a time-dependent spin current.',
    none:''};
  // Per-preset lobe threshold
  const presetLb={ss:1,sp:3,pd:8,circ:6,px:10,none:12,spin_ss:1,spin_sp:3,spin_circ:6};
  const lb=presetLb[superKey];
  if(lb!==undefined){
    lobeThresh=lb/100;
    const sl=document.getElementById('sLB');sl.value=lb;document.getElementById('vLB').textContent=lb;
    cachedVolCanvas=null;
  }
  document.getElementById('infoKet').textContent=this.options[this.selectedIndex].text;
  document.getElementById('infoDesc').textContent=desc[superKey]||'';
  // Sync spin UI heading when a spin preset is selected
  _syncSpinUI();
  _syncVizUI();
  updateQuickPresets();
};

function updateInfo(){
  const o=ORBITALS[orbIdx];
  const coupled=spinEnabled&&spinMode==='jstate'&&superKey==='none';
  document.getElementById('infoKet').textContent=coupled
    ? document.getElementById('jStateSel').selectedOptions[0]?.textContent
    : `|${o.n}, ${o.l}, ${o.m>=0?'+':''}${o.m}⟩`;
  document.getElementById('infoDesc').textContent=spinEnabled
    ? 'Pilot-wave motion includes the Pauli spin current.'
    : INFO[o.label]||'';
}
updateInfo();

document.getElementById('sNP').oninput=function(){nPart=+this.value;document.getElementById('vNP').textContent=nPart;if(!showCloud)particles=sampleParticles(nPart,t);};
const _sSphPx=document.getElementById('sSphPx');
if(_sSphPx)_sSphPx.oninput=function(){
  cloudSpherePx=+this.value;
  document.getElementById('vSphPx').textContent=cloudSpherePx+'px';
  cloudSprite=null; // force sprite rebuild
  if(showCloud)initCloudParts();
};
document.getElementById('resetCloudBtn').onclick=function(){if(showCloud)initCloudParts();};
document.getElementById('sTR').oninput=function(){trailLen=+this.value;document.getElementById('vTR').textContent=trailLen;};
document.getElementById('sDT').oninput=function(){dtStep=+this.value;document.getElementById('vDT').textContent=dtStep.toFixed(3);};
document.getElementById('sDO').oninput=function(){densOp=+this.value/100;document.getElementById('vDO').textContent=this.value+'%';volNeedsRedraw=true;cachedVolCanvas=null;projVolCache=null;};
document.getElementById('sIO').oninput=function(){isoOp=+this.value/100;document.getElementById('vIO').textContent=this.value;volNeedsRedraw=true;cachedVolCanvas=null;projVolCache=null;};
document.getElementById('sLB').oninput=function(){lobeThresh=+this.value/100;document.getElementById('vLB').textContent=this.value;volNeedsRedraw=true;cachedVolCanvas=null;};
document.getElementById('sPS').oninput=function(){ptSize=+this.value;document.getElementById('vPS').textContent=ptSize;};
document.getElementById('sliceSel').onchange=function(){slicePlane=this.value;sliceDirty=true;};

// ── Palette picker ─────────────────────────────────────────────
function openLegPalPop(e){
  e.stopPropagation();
  document.getElementById('legPalPop')?.classList.toggle('open');
  document.getElementById('legColPop')?.classList.remove('open');
  document.getElementById('legPhasePalPop')?.classList.remove('open');
}
function openLegPhasePalPop(e){
  e.stopPropagation();
  document.getElementById('legPhasePalPop')?.classList.toggle('open');
  document.getElementById('legPalPop')?.classList.remove('open');
  document.getElementById('legColPop')?.classList.remove('open');
}
function setPaletteByKey(key){
  densityPalette=key;
  if(gl2Ready) uploadDensPalTex();
  sliceDirty=true;volNeedsRedraw=true;projVolCache=null;
  document.getElementById('legPalPop')?.classList.remove('open');
  updateLegend();
}
function setPhasePaletteByKey(key){
  phasePalette=key;
  if(gl2Ready) uploadPhasePalTex();
  sliceDirty=true;volNeedsRedraw=true;cachedVolCanvas=null;
  document.getElementById('legPhasePalPop')?.classList.remove('open');
  updateLegend();
}
// kept for back-compat; now routes to setPaletteByKey
function togglePalPicker(){openLegPalPop(event);}
function selectPalette(el){setPaletteByKey(el.dataset.pal);}
document.addEventListener('click',e=>{
  const lpp=document.getElementById('legPalPop');
  if(lpp&&!lpp.contains(e.target)&&!e.target.closest('.lrow-btn[title="Change palette"]'))
    lpp.classList.remove('open');
  const lphp=document.getElementById('legPhasePalPop');
  if(lphp&&!lphp.contains(e.target)&&!e.target.closest('.lrow-btn[title="Change phase palette"]'))
    lphp.classList.remove('open');
  const lp=document.getElementById('legColPop');
  if(lp&&!lp.contains(e.target)&&!e.target.closest('.lrow-btn[title="Change particle color"]'))
    lp.classList.remove('open');
});

// The shared shell owns playback and theme controls; the renderer owns the state.
const hydrogenSimulation={
  isRunning:()=>running,
  setRunning(value){
    if(running===value) return;
    running=value;
    previousFrame=undefined;
  },
  reset(){
    invalidateDensity();
    t=0;
    previousFrame=undefined;
    if(showCloud) initCloudParts();
    else particles=sampleParticles(nPart);
  },
  setSpeed(value){simSpeed=value;},
  setTheme(theme){
    lightTheme=theme==='light';
    document.body.classList.toggle('light',lightTheme);
  },
  getCanvasScale:()=>Math.min(W,H)*0.47/rMax()*camDist,
};

document.getElementById('clearBtn').onclick=()=>particles.forEach(p=>p.trail=[]);

canvas.addEventListener('keydown',event=>{
  const movement={ArrowLeft:[-0.12,0],ArrowRight:[0.12,0],ArrowUp:[0,-0.12],ArrowDown:[0,0.12]}[event.key];
  if(!movement) return;
  event.preventDefault();
  camPhi+=movement[0];
  camTheta=Math.max(0.05,Math.min(Math.PI-0.05,camTheta+movement[1]));
  volNeedsRedraw=true;
});
canvas.addEventListener('mousedown',e=>{dragging=true;lastMX=e.clientX;lastMY=e.clientY;});
window.addEventListener('mouseup',()=>{dragging=false;volNeedsRedraw=true;});
canvas.addEventListener('mousemove',e=>{
  if(dragging){
    camPhi-=(e.clientX-lastMX)*0.005;camTheta+=(e.clientY-lastMY)*0.005;
    camTheta=Math.max(0.05,Math.min(Math.PI-0.05,camTheta));
    lastMX=e.clientX;lastMY=e.clientY;volNeedsRedraw=true;
    return;
  }
  // Hover detection for projection panels
  if(showProjections&&projPanelHitBoxes.length){
    const r=canvas.getBoundingClientRect();
    const mx=e.clientX-r.left,my=e.clientY-r.top;
    const hit=projPanelHitBoxes.find(b=>mx>=b.x&&mx<=b.x+b.w&&my>=b.y&&my<=b.y+b.h);
    const hov=hit?hit.plane:null;
    if(hov!==projHoveredPlane){projHoveredPlane=hov;volNeedsRedraw=true;}
    canvas.style.cursor=hov?'pointer':'';
  } else {
    if(projHoveredPlane){projHoveredPlane=null;volNeedsRedraw=true;}
    canvas.style.cursor='';
  }
});
canvas.addEventListener('click',e=>{
  if(!showProjections||!projPanelHitBoxes.length)return;
  const r=canvas.getBoundingClientRect();
  const mx=e.clientX-r.left,my=e.clientY-r.top;
  const hit=projPanelHitBoxes.find(b=>mx>=b.x&&mx<=b.x+b.w&&my>=b.y&&my<=b.y+b.h);
  if(hit)snapCamTo(hit.plane);
});
canvas.addEventListener('wheel',e=>{camDist*=1-e.deltaY*0.001;camDist=Math.max(0.3,Math.min(3,camDist));volNeedsRedraw=true;e.preventDefault();},{passive:false});
canvas.addEventListener('touchstart',e=>{dragging=true;lastMX=e.touches[0].clientX;lastMY=e.touches[0].clientY;},{passive:true});
window.addEventListener('touchend',()=>{dragging=false;volNeedsRedraw=true;});
canvas.addEventListener('touchmove',e=>{
  if(!dragging)return;
  camPhi-=(e.touches[0].clientX-lastMX)*0.005;camTheta+=(e.touches[0].clientY-lastMY)*0.005;
  camTheta=Math.max(0.05,Math.min(Math.PI-0.05,camTheta));
  lastMX=e.touches[0].clientX;lastMY=e.touches[0].clientY;volNeedsRedraw=true;
},{passive:true});

// ─── Start ───────────────────────────────────────────────────
buildComps();
particles=sampleParticles(nPart);
updateLegend();
initLobeGL();
if(!gl2Ready) showGpuFallbackNotice();
if(preferSliceFallback){
  camTheta=PROJ_CAM.xz.theta;
  camPhi=PROJ_CAM.xz.phi;
}
setView(preferSliceFallback?'slice':'volume');
document.getElementById('insetBtn')?.classList.toggle('active',showInset);
document.getElementById('projBtn')?.classList.toggle('active',showProjections);
requestAnimationFrame(loop);
