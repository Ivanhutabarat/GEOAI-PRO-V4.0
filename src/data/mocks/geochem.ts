export const geochemPayload = Array.from({ length: 20 }, (_, i) => {
  const sample_id = `GC-${i+1}`;
  let au_ppb = 5 + Math.random() * 5;
  let cu_ppm = 50 + Math.random() * 20;
  let as_ppm = 10 + Math.random() * 5; // Arsenic pathfinder

  // Ore body signature
  if (i >= 12 && i <= 16) {
    au_ppb = 500 + Math.random() * 200;
    cu_ppm = 2000 + Math.random() * 500;
    as_ppm = 150 + Math.random() * 50;
  }
  return { sample_id, au_ppb, cu_ppm, as_ppm };
});
