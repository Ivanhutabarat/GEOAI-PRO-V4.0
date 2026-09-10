export function normalizeRawData(rawData: any[], moduleType: string) {
  if (!rawData || rawData.length === 0) return { xAxisKey: 'x', availableKeys: [] };
  
  const firstItem = rawData[0];
  const keys = Object.keys(firstItem || {});
  
  // Find a suitable x-axis key
  let xAxisKey = 'time';
  if (keys.includes('depth_m')) xAxisKey = 'depth_m';
  else if (keys.includes('time_hours')) xAxisKey = 'time_hours';
  else if (keys.includes('depth_ft')) xAxisKey = 'depth_ft';
  else if (keys.includes('twt_ms')) xAxisKey = 'twt_ms';
  else if (keys.includes('profile_m')) xAxisKey = 'profile_m';
  else if (keys.includes('distance_m')) xAxisKey = 'distance_m';
  else if (keys.includes('cmp_id')) xAxisKey = 'cmp_id';
  else if (keys.includes('station_id')) xAxisKey = 'station_id';
  else if (keys.includes('sample_id')) xAxisKey = 'sample_id';
  else if (keys.includes('point_id')) xAxisKey = 'point_id';
  else if (keys.includes('time')) xAxisKey = 'time';
  else if (keys.length > 0) xAxisKey = keys[0];

  const excludeKeys = ['time', 'depth', 'station', 'distance', 'id', 'name', 'label', xAxisKey, 'station_id', 'sample_id', 'point_id'];

  const availableKeys = keys.filter(key => {
    return !excludeKeys.includes(key) && (typeof firstItem[key] === 'number' || !isNaN(Number(firstItem[key])));
  });

  return { xAxisKey, availableKeys };
}
