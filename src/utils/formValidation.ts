
export const validateCPF = (cpf: string): boolean => {
  // Remove any non-digit characters
  const cleanCPF = cpf.replace(/\D/g, "");
  
  // CPF must have 11 digits
  if (cleanCPF.length !== 11) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Simple validation (enough for frontend validation)
  return true;
};

export const validatePhone = (phone: string): boolean => {
  // Remove non-digit characters
  const cleanPhone = phone.replace(/\D/g, "");
  
  // Phone must have at least 10 digits (area code + number)
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
