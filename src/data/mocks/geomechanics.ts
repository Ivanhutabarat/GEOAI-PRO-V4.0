export const geomechanicsPayload = Array.from({ length: 25 }, (_, i) => {
  const depth_m = 2000 + i * 50;
  // Normal hydrostatic gradient ~ 0.433 psi/ft ~ 1.42 psi/m
  let pore_pressure_psi = depth_m * 1.42 + Math.random() * 100;
  let Shmin = depth_m * 2.0;
  let Shmax = depth_m * 2.5;
  let Sv = depth_m * 3.5;
  let UCS = 5000 + Math.random() * 1000;

  // Overpressure zone between 2500 and 2800
  if (depth_m >= 2500 && depth_m <= 2800) {
    pore_pressure_psi = depth_m * 2.2 + Math.random() * 200; // Dangerously high
    UCS = 3000 + Math.random() * 500; // Weak rock
  }

  return { depth_m, pore_pressure_psi, Shmin, Shmax, Sv, UCS };
});
