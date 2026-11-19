# Reference calculation for the shutter text in the Math panel (split-operator, numpy/scipy).
# Usage: python3 shutter_reference.py SIGMA MODE TAUS   e.g.  25 blade 0,60   (MODE: blade | blade-absorb)
# Decompose psi(tc) = A (already past the wall exit) + B (the rest), evolve each
# with the slit kept open (ref) and closed at tc (live).
import numpy as np, scipy.fft as sf, sys, json
hb, m, p0 = 6.0, 1.0, 1.5; v = p0/m
def setup(dx=1.0, nx=1000, ny=640, xw=380.0, thick=10.0, w=25.0, sep=60.0, V0=50.0, nslits=2):
    Nx, Ny = int(nx/dx), int(ny/dx)
    x = np.arange(Nx)*dx; y = (np.arange(Ny)-Ny/2)*dx
    X, Y = np.meshgrid(x, y, indexing='ij')
    def sm(a,b,z): t=np.clip((z-a)/(b-a),0,1); return t*t*(3-2*t)
    band = lambda u,c,hw: sm(c-hw-1,c-hw,u)*(1-sm(c+hw,c+hw+1,u))
    slab = band(X, xw, thick/2)
    cs = [(2*k-1-nslits)*sep/2 for k in range(1,nslits+1)]
    holes = [band(Y,c,w/2) for c in cs]
    Vwall = V0*slab*(1-np.clip(sum(holes),0,1))
    def ramp(d,L): t=np.clip((L-d)/L,0,1); return (t**3*(t*(t*6-15)+10))**2
    Wb = 2.0*np.maximum.reduce([ramp(X,60), ramp(x[-1]-X,60), ramp(Y-y[0],80), ramp(y[-1]-Y,80)])
    kx = 2*np.pi*sf.fftfreq(Nx,dx); ky = 2*np.pi*sf.fftfreq(Ny,dx)
    K2 = kx[:,None]**2+ky[None,:]**2
    c2=cs[1]; hw=w/2
    def blade(f):
        # covered part of slit 2 when a blade has slid a fraction f across it from the +y edge
        if f<=0: return 0*X
        oh = hw*(1-f)
        open_ = band(Y, c2-hw+oh, oh)*min(1,2*oh) if oh>0 else 0*Y
        return slab*np.clip(band(Y,c2,hw)-open_,0,1)
    return dict(x=x,y=y,X=X,Y=Y,dx=dx,slab=slab,hole=slab*holes[1],Vwall=Vwall,Wb=Wb,K2=K2,xw=xw,thick=thick,V0=V0,blade=blade)
def evolve(g, psi, t0, t1, dt, s_of, mode='reflect', Wabs=5.0):
    kin = np.exp(-1j*hb*g['K2']/(2*m)*dt); n=int(round((t1-t0)/dt)); t=t0
    for _ in range(n):
        s = s_of(t+dt/2)
        if mode in ('reflect','absorb'):
            V = g['Vwall'] + (g['V0']*s*g['hole'] if mode=='reflect' else 0)
            W = g['Wb'] + (Wabs*s*g['hole'] if mode=='absorb' else 0)
        else:
            if s != getattr(evolve,'_s',None): evolve._s=s; evolve._b=g['blade'](s)
            b = evolve._b
            V = g['Vwall'] + (g['V0']*b if mode=='blade' else 0)
            W = g['Wb'] + (Wabs*b if mode=='blade-absorb' else 0)
        h = np.exp((-1j*V-W)/hb*dt/2)
        psi = h*sf.ifft2(kin*sf.fft2(h*psi, workers=8), workers=8); t+=dt
    return psi
if __name__=='__main__':
    sig = float(sys.argv[1]); mode = sys.argv[2]; taus=[float(a) for a in sys.argv[3].split(',')]
    T_after = float(sys.argv[4]) if len(sys.argv)>4 else 140
    g = setup(); dt=0.05; x0 = g['xw'] - 4*sig
    psi = np.exp(-((g['X']-x0)**2+g['Y']**2)/(2*sig**2)+1j*p0/hb*g['X']); psi/=np.sqrt((abs(psi)**2).sum())
    tc = (g['xw']-x0)/v
    psi_c = evolve(g, psi, 0, tc, dt, lambda t:0.0)
    exitx = g['xw']+g['thick']/2+1
    u = np.clip((g['X']-exitx)/50.0, 0, 1); mask = u*u*(3-2*u)   # smooth split over two wavelengths
    A = psi_c*mask; B = psi_c-A
    zero = lambda t:0.0
    Aref = evolve(g, A, tc, tc+T_after, dt, zero); Bref = evolve(g, B, tc, tc+T_after, dt, zero)
    cut = exitx + v*T_after; R = g['X']>cut
    n2 = lambda f,M: float((abs(f[M])**2).sum())
    ref = Aref+Bref
    base = dict(sigma=sig, P_A=float((abs(A)**2).sum()), P_inslit=float((abs(psi_c)**2*(g['hole']>0.5)).sum()),
                B_share_ahead=np.sqrt(n2(Bref,R)/n2(ref,R)), P_ahead=n2(ref,R))
    print(json.dumps(base)); sys.stdout.flush()
    for tau in taus:
        s_of = (lambda t, tau=tau: 0.0 if t<tc else (1.0 if tau<=0 else min(1,(t-tc)/tau)**2*(3-2*min(1,(t-tc)/tau))))
        Alive = evolve(g, A, tc, tc+T_after, dt, s_of, mode); Blive = evolve(g, B, tc, tc+T_after, dt, s_of, mode)
        live = Alive+Blive
        # high-k content of the change ahead (k > k0 + 4 sigma_k): scattering signature
        d = (live-ref)*R
        D = sf.fftshift(abs(sf.fft2(d))**2); 
        kx = sf.fftshift(2*np.pi*sf.fftfreq(d.shape[0])); ky=sf.fftshift(2*np.pi*sf.fftfreq(d.shape[1]))
        Kn = np.sqrt(kx[:,None]**2+ky[None,:]**2); k0=p0/hb; sk=1/(np.sqrt(2)*sig)
        fast = float(D[Kn>k0+4*sk].sum()/D.sum())
        print(json.dumps(dict(mode=mode, tau=tau,
           A_change=np.sqrt(n2(Alive-Aref, g['X']>0)/n2(Aref, g['X']>0)),
           A_change_ahead=np.sqrt(n2(Alive-Aref, R)/n2(Aref, R)),
           eps_ahead=np.sqrt(n2(live-ref,R)/n2(ref,R)),
           eps_ahead_from_B=np.sqrt(n2(Blive-Bref,R)/n2(ref,R)),
           fast_fraction_of_change=fast))); sys.stdout.flush()
