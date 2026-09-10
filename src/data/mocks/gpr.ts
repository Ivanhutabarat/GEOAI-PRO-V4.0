export const gprPayload = Array.from({ length: 30 }, (_, i) => {
  const distance_m = i * 0.5;
  const two_way_time_ns = 25 + Math.random() * 2;
  // Hyperbolic diffraction from buried pipe
  let amplitude = Math.random() * 0.2;
  if (distance_m >= 5 && distance_m <= 10) {
    amplitude = 1.5 + Math.random();
  }
  return { distance_m, two_way_time_ns, amplitude };
});
