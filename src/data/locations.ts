export interface Location {
  utcOffset: number;
  city: string;
  country: string;
  timezone: string;
  longitude: number;
  latitude: number;
}

export const locations: Location[] = [
  { utcOffset: -12, city: "Baker Island", country: "US Minor Outlying Islands", timezone: "Etc/GMT+12", longitude: -176.5, latitude: 0.2 },
  { utcOffset: -11, city: "Pago Pago", country: "American Samoa", timezone: "Pacific/Pago_Pago", longitude: -170.7, latitude: -14.3 },
  { utcOffset: -10, city: "Honolulu", country: "United States", timezone: "Pacific/Honolulu", longitude: -157.8, latitude: 21.3 },
  { utcOffset: -9, city: "Gambier Islands", country: "French Polynesia", timezone: "Pacific/Gambier", longitude: -135.0, latitude: -23.1 },
  { utcOffset: -9, city: "Anchorage", country: "United States", timezone: "America/Anchorage", longitude: -149.9, latitude: 61.2 },
  { utcOffset: -8, city: "Los Angeles", country: "United States", timezone: "America/Los_Angeles", longitude: -118.2, latitude: 34.1 },
  { utcOffset: -7, city: "Denver", country: "United States", timezone: "America/Denver", longitude: -104.9, latitude: 39.7 },
  { utcOffset: -6, city: "Mexico City", country: "Mexico", timezone: "America/Mexico_City", longitude: -99.1, latitude: 19.4 },
  { utcOffset: -6, city: "Chicago", country: "United States", timezone: "America/Chicago", longitude: -87.6, latitude: 41.9 },
  { utcOffset: -5, city: "New York", country: "United States", timezone: "America/New_York", longitude: -74.0, latitude: 40.7 },
  { utcOffset: -4, city: "Santiago", country: "Chile", timezone: "America/Santiago", longitude: -70.7, latitude: -33.4 },
  { utcOffset: -3, city: "Buenos Aires", country: "Argentina", timezone: "America/Argentina/Buenos_Aires", longitude: -58.4, latitude: -34.6 },
  { utcOffset: -2, city: "Fernando de Noronha", country: "Brazil", timezone: "America/Noronha", longitude: -32.4, latitude: -3.9 },
  { utcOffset: -1, city: "Praia", country: "Cape Verde", timezone: "Atlantic/Cape_Verde", longitude: -23.5, latitude: 15.0 },
  { utcOffset: 0, city: "London", country: "United Kingdom", timezone: "Europe/London", longitude: -0.1, latitude: 51.5 },
  { utcOffset: 1, city: "Paris", country: "France", timezone: "Europe/Paris", longitude: 2.3, latitude: 48.9 },
  { utcOffset: 2, city: "Cairo", country: "Egypt", timezone: "Africa/Cairo", longitude: 31.2, latitude: 30.0 },
  { utcOffset: 3, city: "Moscow", country: "Russia", timezone: "Europe/Moscow", longitude: 37.6, latitude: 55.8 },
  { utcOffset: 3.5, city: "Tehran", country: "Iran", timezone: "Asia/Tehran", longitude: 51.4, latitude: 35.7 },
  { utcOffset: 4, city: "Dubai", country: "United Arab Emirates", timezone: "Asia/Dubai", longitude: 55.3, latitude: 25.2 },
  { utcOffset: 4.5, city: "Kabul", country: "Afghanistan", timezone: "Asia/Kabul", longitude: 69.2, latitude: 34.5 },
  { utcOffset: 5, city: "Karachi", country: "Pakistan", timezone: "Asia/Karachi", longitude: 67.0, latitude: 24.9 },
  { utcOffset: 5.5, city: "Mumbai", country: "India", timezone: "Asia/Kolkata", longitude: 72.9, latitude: 19.1 },
  { utcOffset: 5.75, city: "Kathmandu", country: "Nepal", timezone: "Asia/Kathmandu", longitude: 85.3, latitude: 27.7 },
  { utcOffset: 6, city: "Dhaka", country: "Bangladesh", timezone: "Asia/Dhaka", longitude: 90.4, latitude: 23.8 },
  { utcOffset: 6.5, city: "Yangon", country: "Myanmar", timezone: "Asia/Yangon", longitude: 96.2, latitude: 16.9 },
  { utcOffset: 7, city: "Bangkok", country: "Thailand", timezone: "Asia/Bangkok", longitude: 100.5, latitude: 13.8 },
  { utcOffset: 8, city: "Singapore", country: "Singapore", timezone: "Asia/Singapore", longitude: 103.8, latitude: 1.4 },
  { utcOffset: 9, city: "Tokyo", country: "Japan", timezone: "Asia/Tokyo", longitude: 139.7, latitude: 35.7 },
  { utcOffset: 9.5, city: "Adelaide", country: "Australia", timezone: "Australia/Adelaide", longitude: 138.6, latitude: -34.9 },
  { utcOffset: 10, city: "Sydney", country: "Australia", timezone: "Australia/Sydney", longitude: 151.2, latitude: -33.9 },
  { utcOffset: 11, city: "Noumea", country: "New Caledonia", timezone: "Pacific/Noumea", longitude: 166.5, latitude: -22.3 },
  { utcOffset: 12, city: "Auckland", country: "New Zealand", timezone: "Pacific/Auckland", longitude: 174.8, latitude: -36.8 },
];
