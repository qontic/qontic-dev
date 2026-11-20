"""Independent reference for the Einstein recoiling-slit app (Zhang et al., PRL 135, 230202 (2025)).

Routes that do not share code with the JS engine:
  1. Trap frequency implied by the quoted momentum spread (Rb-87, D2 line).
  2. Visibility |Tr rho e^{2ikx}| for a thermal state, from harmonic-oscillator
     eigenfunctions on a grid (Fock-state sum), compared with exp(-2 eta^2 (2n+1)).
  3. Monte Carlo: Fock number n from the thermal distribution, atom position X from
     |phi_n(X)|^2, detector port from P(+|X) = (1 + cos(2kX + phi))/2.
Writes reference.json for tests/reference.test.mjs.
"""
import json, math
import numpy as np
from numpy.polynomial.hermite import hermval

hbar = 1.054571817e-34
amu = 1.66053906660e-27
m = 86.909180527 * amu          # Rb-87
lam = 780.241e-9                 # D2 line, F=2 -> F'=3 cycling transition
k = 2 * math.pi / lam
hk = hbar * k

# 1. trap frequency for dp = 1.60 hk and 0.78 hk (ground state: dp^2 = hbar m w / 2)
out = {}
for dp in (1.60, 0.78):
    w = 2 * (dp * hk) ** 2 / (hbar * m)
    out[f"axial_kHz_dp{dp}"] = w / (2 * math.pi) / 1e3
# fourth-root scaling: dp(0.60 mK) from dp(10.49 mK)
out["dp_at_0p60_from_scaling"] = 1.60 * (0.60 / 10.49) ** 0.25

# 2. thermal visibility from eigenfunctions. Lengths in units of dx0 = hbar/(2 dp);
#    then 2kx = 2*eta*xi with eta = hk/(2 dp). Oscillator length a = sqrt(2) dx0.
xi = np.linspace(-40, 40, 40001)
dxi = xi[1] - xi[0]
s = xi / math.sqrt(2)


def phi2(n):
    c = np.zeros(n + 1); c[n] = 1
    h = hermval(s, c)
    norm = 1 / math.sqrt(2 ** n * math.factorial(n) * math.sqrt(math.pi))
    return (norm * h * np.exp(-s * s / 2)) ** 2 / math.sqrt(2)   # density in xi


dens = [phi2(n) for n in range(40)]


def vis_numeric(eta, nbar):
    p = np.array([nbar ** n / (1 + nbar) ** (n + 1) for n in range(40)])
    p /= p.sum()
    rho = sum(pn * d for pn, d in zip(p, dens))
    return abs(np.sum(rho * np.exp(2j * eta * xi)) * dxi)


vis = []
for dp in (0.335, 0.78, 1.0, 1.60, 1.88):
    eta = 1 / (2 * dp)
    for nbar in (0.0, 0.08, 0.37, 1.0):
        vis.append({"dp": dp, "nbar": nbar, "numeric": vis_numeric(eta, nbar),
                    "closed": math.exp(-2 * eta ** 2 * (2 * nbar + 1))})
out["visibility"] = vis

# 3. Monte Carlo via Fock states
rng = np.random.default_rng(12345)
mc = []
for dp, nbar, phase in ((0.78, 0.0, 0.0), (1.60, 0.0, 0.0), (1.60, 0.37, 0.7), (0.5, 0.2, 2.0)):
    eta = 1 / (2 * dp)
    N = 400000
    p = np.array([nbar ** n / (1 + nbar) ** (n + 1) for n in range(40)]); p /= p.sum()
    ns = rng.choice(40, size=N, p=p)
    X = np.empty(N)
    for n in np.unique(ns):
        idx = np.where(ns == n)[0]
        cdf = np.cumsum(dens[n]); cdf /= cdf[-1]
        X[idx] = np.interp(rng.random(idx.size), cdf, xi)
    plus = rng.random(N) < (1 + np.cos(2 * eta * X + phase)) / 2
    mc.append({"dp": dp, "nbar": nbar, "phase": phase, "N": N,
               "Pplus": float(plus.mean()),
               "Pplus_closed": (1 + math.exp(-2 * eta ** 2 * (2 * nbar + 1)) * math.cos(phase)) / 2,
               "meanX_plus": float(X[plus].mean()), "meanX_minus": float(X[~plus].mean())})
out["monte_carlo"] = mc

json.dump(out, open(__file__.replace("reference.py", "reference.json"), "w"), indent=1)
print(json.dumps({k: v for k, v in out.items() if k != "visibility"}, indent=1))
print("max |numeric-closed| visibility:", max(abs(v["numeric"] - v["closed"]) for v in vis))
