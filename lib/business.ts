/**
 * Legal business details, supplied by the owner. Used by the Impressum and the
 * other legal pages. Change them here if the business details change.
 */
export const BUSINESS = {
  owner: "Caleb Turkson",
  brand: "EXEPRA",
  street: "Saargemünder Str. 105",
  postalCode: "66119",
  city: "Saarbrücken",
  country: "Deutschland",
  email: "cal.turkson@gmail.com",
  phone: "+49 176 21958322",
  phoneHref: "+4917621958322",
} as const;

export const BUSINESS_LINE = `${BUSINESS.owner}, ${BUSINESS.brand}, ${BUSINESS.street}, ${BUSINESS.postalCode} ${BUSINESS.city}, ${BUSINESS.country}`;
