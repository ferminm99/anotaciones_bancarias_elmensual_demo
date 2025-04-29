// src/utils/formatNumber.ts
export const formatNumber = (number: number | string) => {
  const parsedNumber = Number(number);

  if (isNaN(parsedNumber)) {
    return "0,00";
  }

  return parsedNumber.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });
};
