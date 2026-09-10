export const groundwaterPayload = Array.from({ length: 24 }, (_, i) => {
  const time_hours = i;
  // Drawdown test
  let water_level_m = 15 + Math.log(time_hours + 1) * 2; 
  let transmissivity_m2_d = 500;
  let storativity = 0.001; 
  return { time_hours, water_level_m, transmissivity_m2_d, storativity };
});
