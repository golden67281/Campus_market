export const isMobile = (val) => /^[6-9]\d{9}$/.test(val);
export const isEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
export const isCollegeEmail = (val) => /\.(edu|ac\.in)$/.test(val);
export const isStrongPassword = (val) =>
  val.length >= 8 && /[A-Z]/.test(val) && /\d/.test(val);
