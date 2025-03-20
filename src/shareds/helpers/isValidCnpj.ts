export function isValidCNPJ(cnpj: string): boolean {
  const cleanedCnpj = cnpj.replace(/\D/g, '');

  if (cleanedCnpj.length !== 14) {
    return false;
  }

  if (/^(\d)\1{13}$/.test(cleanedCnpj)) {
    return false;
  }

  const calculateCheckDigit = (cnpjArray: number[], factor: number): number => {
    let total = 0;
    for (let i = 0; i < cnpjArray.length; i++) {
      total += cnpjArray[i] * factor;
      factor--;
      if (factor < 2) {
        factor = 9;
      }
    }
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const cnpjNumbers = cleanedCnpj.split('').map((digit) => parseInt(digit, 10));

  const firstCheckDigit = calculateCheckDigit(cnpjNumbers.slice(0, 12), 5);
  if (cnpjNumbers[12] !== firstCheckDigit) {
    return false;
  }

  const secondCheckDigit = calculateCheckDigit(cnpjNumbers.slice(0, 13), 6);
  if (cnpjNumbers[13] !== secondCheckDigit) {
    return false;
  }

  return true;
}
