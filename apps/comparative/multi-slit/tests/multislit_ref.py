"""Independent reference for the many-slit app.
Propagates psi0 = sum_k a_k exp(-(y-y_k)^2/4 sigma^2) with a split-step FFT
(exact free propagator in Fourier space) for d psi/d zeta = (i/2pi) psi'' , no use of the
closed-form Gaussian solution. Outputs densities and slit-cell boundaries on the screen."""
import json, numpy as np

def run(N, sigma, zeta, amps=None, L=512.0, n=2**18):
    y = (np.arange(n) - n//2) * (2*L/n)
    yk = (N-1)/2 - np.arange(N)
    a = np.ones(N) if amps is None else np.array(amps, float)
    psi0 = sum(a[k]*np.exp(-(y-yk[k])**2/(4*sigma**2)) for k in range(N))
    q = 2*np.pi*np.fft.fftfreq(n, d=2*L/n)
    psi = np.fft.ifft(np.fft.fft(psi0)*np.exp(-1j*q**2*zeta/(2*np.pi)))
    rho0, rho = abs(psi0)**2, abs(psi)**2
    dy = 2*L/n
    norm0, norm = rho0.sum()*dy, rho.sum()*dy
    c0 = np.cumsum(rho0)*dy/norm0  # from bottom
    c = np.cumsum(rho)*dy/norm
    openk = [k for k in range(N) if a[k] > 0]
    # cell boundaries measured from the top: P_i = 1 - F0(mid)
    P = [0.0] + [1 - np.interp(0.5*(yk[openk[i]]+yk[openk[i+1]]), y+dy/2, c0) for i in range(len(openk)-1)] + [1.0]
    # screen y at those quantiles (from top)
    ys = [float(np.interp(1-p, c, y+dy/2)) for p in P[1:-1]]
    pts = [-3.0, -1.0, 0.0, 0.375, 2.5]  # exact grid points (dy = 1/256)
    # analytic normalisation reference: density with the app's prefactor sigma/sqrt(s) convention
    # equals |psi|^2 here exactly (same psi0), so report raw rho
    return dict(N=N, sigma=sigma, zeta=zeta, amps=list(map(float, a)), norm0=norm0, norm=norm,
                P=list(map(float, P)), screenBoundaries=ys,
                rho={str(p): float(np.interp(p, y, rho)) for p in pts})

cases = [run(5, 0.15, 6.0), run(2, 0.15, 6.0), run(15, 0.1, 1.0),
         run(4, 0.2, 3.0, amps=[np.exp(-(yk-1.0)**2/4) for yk in (1.5,0.5,-0.5,-1.5)]),
         run(5, 0.15, 6.0, amps=[1,1,1,1,0])]
json.dump(cases, open('/home/claude/ref/reference.json','w'), indent=1)
for c in cases: print(c['N'], c['zeta'], ['%.5f'%b for b in c['screenBoundaries']], 'norm drift %.2e'%(c['norm']/c['norm0']-1))
