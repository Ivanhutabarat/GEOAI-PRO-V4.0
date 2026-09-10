export const seismicPayload = Array.from({ length: 25 }, (_, i) => {
  const cmp_id = 100 + i;
  const time_ms = 1500; // specific horizon
  // Bright spot anomaly around CMP 110 - 115
  let amplitude = Math.random() * 0.1 - 0.05;
  if (cmp_id >= 110 && cmp_id <= 115) {
    amplitude = -0.8 + Math.random() * 0.2; // Strong negative reflection (bright spot)
  }
  return {
    cmp_id,
    inline: 10,
    crossline: cmp_id,
    time_ms,
    traces: Array.from({ length: 10 }, () => amplitude * (0.8 + Math.random() * 0.4)),
    amplitude
  };
});
