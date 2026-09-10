export const soilPhPayload = Array.from({ length: 20 }, (_, i) => {
  const sample_id = `SP-${i+1}`;
  let pH = 6.5 + Math.random() * 1;
  let moisture_percent = 15 + Math.random() * 5;
  let cec_meq_100g = 20 + Math.random() * 5;
  
  // Acid mine drainage spill zone
  if (i >= 5 && i <= 8) {
    pH = 3.2 + Math.random() * 0.5;
    cec_meq_100g = 10;
  }
  return { sample_id, pH, moisture_percent, cec_meq_100g };
});
