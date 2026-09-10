export const meteorologyPayload = Array.from({ length: 24 }, (_, i) => {
  const time_hours = i;
  let wind_speed_m_s = 5 + Math.random() * 5;
  let temperature_c = 25 + Math.sin(i / 24 * Math.PI) * 10;
  let humidity_percent = 60 + Math.random() * 10;
  let pressure_hpa = 1013 - Math.random() * 5;

  // Storm event
  if (time_hours >= 16 && time_hours <= 19) {
    wind_speed_m_s = 20 + Math.random() * 5;
    pressure_hpa = 995;
    humidity_percent = 95;
  }
  return { time_hours, wind_speed_m_s, temperature_c, humidity_percent, pressure_hpa };
});
