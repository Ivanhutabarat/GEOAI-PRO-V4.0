export const fluidIdPayload = Array.from({ length: 20 }, (_, i) => {
  const depth_m = 1500 + i * 10;
  let Vp = 3000 + Math.random() * 200;
  let Vs = 1500 + Math.random() * 100;
  let density = 2.4 + Math.random() * 0.1;
  let poisson_ratio = (Vp**2 - 2 * Vs**2) / (2 * (Vp**2 - Vs**2)); // approx 0.33
  let acoustic_impedance = Vp * density;

  // Gas signature (low Poisson ratio, low impedance)
  if (depth_m >= 1550 && depth_m <= 1600) {
    Vp = 2500;
    Vs = 1600; // Vs relatively unaffected by fluid, Vp drops
    density = 2.1;
    poisson_ratio = (Vp**2 - 2 * Vs**2) / (2 * (Vp**2 - Vs**2)); // drops to ~0.15
    acoustic_impedance = Vp * density;
  }
  return { depth_m, Vp, Vs, density, poisson_ratio, acoustic_impedance };
});
