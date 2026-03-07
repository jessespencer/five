export interface Location {
  utcOffset: number;
  city: string;
  country: string;
  region: string;
  timezone: string;
  longitude: number;
  latitude: number;
}

export const locations: Location[] = [
  { utcOffset: -12, city: "Baker Island", country: "US Minor Outlying Islands", region: "Pacific", timezone: "Etc/GMT+12", longitude: -176.5, latitude: 0.2 },
  { utcOffset: -11, city: "Pago Pago", country: "American Samoa", region: "Pacific", timezone: "Pacific/Pago_Pago", longitude: -170.7, latitude: -14.3 },
  { utcOffset: -10, city: "Honolulu", country: "United States", region: "North America", timezone: "Pacific/Honolulu", longitude: -157.8, latitude: 21.3 },
  { utcOffset: -9, city: "Anchorage", country: "United States", region: "North America", timezone: "America/Anchorage", longitude: -149.9, latitude: 61.2 },
  { utcOffset: -8, city: "Los Angeles", country: "United States", region: "North America", timezone: "America/Los_Angeles", longitude: -118.2, latitude: 34.1 },
  { utcOffset: -7, city: "Denver", country: "United States", region: "North America", timezone: "America/Denver", longitude: -104.9, latitude: 39.7 },
  { utcOffset: -6, city: "Mexico City", country: "Mexico", region: "North America", timezone: "America/Mexico_City", longitude: -99.1, latitude: 19.4 },
  { utcOffset: -5, city: "New York", country: "United States", region: "North America", timezone: "America/New_York", longitude: -74.0, latitude: 40.7 },
  { utcOffset: -4, city: "Santiago", country: "Chile", region: "South America", timezone: "America/Santiago", longitude: -70.7, latitude: -33.4 },
  { utcOffset: -3, city: "Buenos Aires", country: "Argentina", region: "South America", timezone: "America/Argentina/Buenos_Aires", longitude: -58.4, latitude: -34.6 },
  { utcOffset: -2, city: "Fernando de Noronha", country: "Brazil", region: "South America", timezone: "America/Noronha", longitude: -32.4, latitude: -3.9 },
  { utcOffset: -1, city: "Praia", country: "Cape Verde", region: "Africa", timezone: "Atlantic/Cape_Verde", longitude: -23.5, latitude: 15.0 },
  { utcOffset: 0, city: "London", country: "United Kingdom", region: "Europe", timezone: "Europe/London", longitude: -0.1, latitude: 51.5 },
  { utcOffset: 1, city: "Paris", country: "France", region: "Europe", timezone: "Europe/Paris", longitude: 2.3, latitude: 48.9 },
  { utcOffset: 2, city: "Cairo", country: "Egypt", region: "Africa", timezone: "Africa/Cairo", longitude: 31.2, latitude: 30.0 },
  { utcOffset: 3, city: "Moscow", country: "Russia", region: "Europe", timezone: "Europe/Moscow", longitude: 37.6, latitude: 55.8 },
  { utcOffset: 3.5, city: "Tehran", country: "Iran", region: "Middle East", timezone: "Asia/Tehran", longitude: 51.4, latitude: 35.7 },
  { utcOffset: 4, city: "Dubai", country: "United Arab Emirates", region: "Middle East", timezone: "Asia/Dubai", longitude: 55.3, latitude: 25.2 },
  { utcOffset: 4.5, city: "Kabul", country: "Afghanistan", region: "Asia", timezone: "Asia/Kabul", longitude: 69.2, latitude: 34.5 },
  { utcOffset: 5, city: "Karachi", country: "Pakistan", region: "Asia", timezone: "Asia/Karachi", longitude: 67.0, latitude: 24.9 },
  { utcOffset: 5.5, city: "Mumbai", country: "India", region: "Asia", timezone: "Asia/Kolkata", longitude: 72.9, latitude: 19.1 },
  { utcOffset: 5.75, city: "Kathmandu", country: "Nepal", region: "Asia", timezone: "Asia/Kathmandu", longitude: 85.3, latitude: 27.7 },
  { utcOffset: 6, city: "Dhaka", country: "Bangladesh", region: "Asia", timezone: "Asia/Dhaka", longitude: 90.4, latitude: 23.8 },
  { utcOffset: 6.5, city: "Yangon", country: "Myanmar", region: "Asia", timezone: "Asia/Yangon", longitude: 96.2, latitude: 16.9 },
  { utcOffset: 7, city: "Bangkok", country: "Thailand", region: "Asia", timezone: "Asia/Bangkok", longitude: 100.5, latitude: 13.8 },
  { utcOffset: 8, city: "Singapore", country: "Singapore", region: "Asia", timezone: "Asia/Singapore", longitude: 103.8, latitude: 1.4 },
  { utcOffset: 9, city: "Tokyo", country: "Japan", region: "Asia", timezone: "Asia/Tokyo", longitude: 139.7, latitude: 35.7 },
  { utcOffset: 9.5, city: "Adelaide", country: "Australia", region: "Oceania", timezone: "Australia/Adelaide", longitude: 138.6, latitude: -34.9 },
  { utcOffset: 10, city: "Sydney", country: "Australia", region: "Oceania", timezone: "Australia/Sydney", longitude: 151.2, latitude: -33.9 },
  { utcOffset: 11, city: "Noumea", country: "New Caledonia", region: "Pacific", timezone: "Pacific/Noumea", longitude: 166.5, latitude: -22.3 },
  { utcOffset: 12, city: "Auckland", country: "New Zealand", region: "Oceania", timezone: "Pacific/Auckland", longitude: 174.8, latitude: -36.8 },
];
