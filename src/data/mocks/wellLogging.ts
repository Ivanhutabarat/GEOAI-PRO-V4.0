export const wellLoggingPayload = Array.from({ length: 25 }, (_, i) => {
  const depth_m = 1000 + i * 10;
  let gamma_ray_api = 80 + Math.random() * 20;
  let resistivity_ohm_m = 1 + Math.random() * 2;
  let density_g_cc = 2.5 + Math.random() * 0.1;
  let neutron_porosity = 0.3 + Math.random() * 0.05;

  // Crossover anomaly (Gas zone) between 1100 and 1150
  if (depth_m >= 1100 && depth_m <= 1150) {
    gamma_ray_api = 30 + Math.random() * 10; // Clean sand
    resistivity_ohm_m = 50 + Math.random() * 20; // High resistivity (hydrocarbon)
    density_g_cc = 2.1 + Math.random() * 0.05; // Density drops
    neutron_porosity = 0.15 + Math.random() * 0.02; // Neutron porosity drops
  }

  return { depth_m, gamma_ray_api, resistivity_ohm_m, density_g_cc, neutron_porosity };
});
