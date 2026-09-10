export const gravityMagneticPayload = Array.from({ length: 25 }, (_, i) => {
  const station_id = `ST-${i+1}`;
  const easting = 300000 + i * 50;
  const northing = 5000000;
  const elevation = 150 + Math.random() * 10;
  // Bouguer anomaly (mGal)
  let bouguer_anomaly = -50 + Math.random() * 2;
  // Dense intrusive body anomaly
  if (i >= 10 && i <= 15) {
    bouguer_anomaly = -35 + Math.random() * 2; // Positive anomaly
  }
  const observed_gravity = 980000 + bouguer_anomaly;
  return { station_id, easting, northing, elevation, observed_gravity, bouguer_anomaly };
});
