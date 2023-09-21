/**
 * Including bonus jades but not first time bonus!
 */
const primoPrice = [
  [8080, 1599000],
  [3880, 799000],
  [2240, 479000],
  [1090, 249000],
  [330, 79000],
  [60, 16000],
];

export const primoToCurrency = (primo: number) => {
  let total = 0;
  for (let i = 0; i < primoPrice.length; i++) {
    const [prm, price] = primoPrice[i];
    if (primo >= prm) {
      const qty = Math.floor(primo / prm);
      primo = primo %= prm;
      total += qty * price;
    }
  }

  // leftover primo must be deducted by buying lowest price primo package
  if (primo > 0) {
    const [_, price] = primoPrice[primoPrice.length - 1];
    total += price;
    primo = 0;
  }

  return total;
};
