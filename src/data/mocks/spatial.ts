export const spatialPayload = Array.from({ length: 25 }, (_, i) => {
  const lat = 34.0522 + (Math.random() * 0.01 - 0.005); 
  const lon = -118.2437 + (Math.random() * 0.01 - 0.005);
  const elevation = 100 + Math.random() * 50;
  const subsidence_mm_yr = -2 + Math.random() * 1;

  // High sinkhole risk zone
  let risk_index = Math.random() * 0.3;
  if (i >= 18 && i <= 21) {
    risk_index = 0.85 + Math.random() * 0.1;
  }
  return { point_id: i, lat, lon, elevation, subsidence_mm_yr, risk_index };
});
