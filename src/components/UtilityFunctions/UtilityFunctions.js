export const getChargeText = (charge) => {
    if (charge === 1) {
      return '+'
    } else if (charge === 2) {
      return '2+';
    } else if (charge === -1) {
      return '-';
    } else if (charge === -2) {
      return '2-';
    } else {
      return '';
    }
  }