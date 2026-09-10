export const electricalEmPayload = Array.from({ length: 20 }, (_, i) => {
  const profile_m = i * 20;
  let apparent_resistivity_ohm_m = 100 + Math.random() * 20;
  let chargeability_mv_v = 5 + Math.random() * 2;

  // Mineralized zone (high chargeability, low resistivity)
  if (profile_m >= 100 && profile_m <= 200) {
    apparent_resistivity_ohm_m = 20 + Math.random() * 10;
    chargeability_mv_v = 40 + Math.random() * 10;
  }
  return { profile_m, apparent_resistivity_ohm_m, chargeability_mv_v };
});
