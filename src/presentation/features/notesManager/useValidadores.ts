import { useCallback } from 'react';

/** Reglas de validación (idénticas a tu intención original) */
export const useValidadores = () => {
  const validarNotaNumerica = useCallback((valor: string) => {
    const num = parseFloat(valor);
    return !isNaN(num) && num >= 1.0 && num <= 5.0;
  }, []);

  const validarCantidadFallas = useCallback((valor: string) => {
    const num = parseInt(valor);
    return !isNaN(num) && num >= 0 && num < 100;
  }, []);

  return { validarNotaNumerica, validarCantidadFallas };
};
