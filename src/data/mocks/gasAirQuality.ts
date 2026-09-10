export const gasAirQualityPayload = Array.from({ length: 24 }, (_, i) => {
  const time_hours = i;
  let h2s_ppm = Math.random() * 2;
  let co2_ppm = 400 + Math.random() * 20;
  let ch4_lel_percent = Math.random() * 1;
  
  // Gas kick anomaly
  if (time_hours === 14 || time_hours === 15) {
    h2s_ppm = 25 + Math.random() * 10; // Dangerous
    ch4_lel_percent = 20 + Math.random() * 10; // High risk
  }
  return { time_hours, h2s_ppm, co2_ppm, ch4_lel_percent };
});
