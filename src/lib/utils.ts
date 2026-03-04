import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateBookLink({ title, author, isbn, asin }: { title: string; author: string; isbn?: string | null; asin?: string | null; }) {
  const slugify = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  
  const bookSlug = slugify(title);
  const authorSlug = slugify(author);
  
  // Build the URL with both ISBN and ASIN if available
  let url = `/${bookSlug}/${authorSlug}`;
  
  // Add ISBN if available
  if (isbn && isbn.length > 0) {
    url += `/${isbn}`;
  }
  
  // Add ASIN if available (always include ASIN when it exists)
  if (asin && asin.length === 10) {
    url += `/${asin}`;
  }
  
  return url;
}

export function isbn13to10(isbn13: string): string | null {
  // Remove any hyphens or spaces
  const clean = isbn13.replace(/[^0-9X]/gi, '');
  if (!/^97[89][0-9]{10}$/.test(clean)) return null;
  if (!clean.startsWith('978')) return null;
  const nine = clean.slice(3, 12); // next 9 digits after 978
  let check_sum = 0;
  for (let i = 0; i < 9; i++) {
    check_sum += parseInt(nine[i], 10) * (10 - i);
  }
  let check_digit: string;
  const check = 11 - (check_sum % 11);
  if (check === 10) check_digit = 'X';
  else if (check === 11) check_digit = '0';
  else check_digit = check.toString();
  return nine + check_digit;
}

export function isValidISBN10(isbn10: string): boolean {
  return /^[A-Za-z0-9]{10}$/.test(isbn10);
}

export function isValidISBN13(isbn13: string): boolean {
  return /^[0-9]{13}$/.test(isbn13);
}

export function isValidASIN(asin: string): boolean {
  return /^[A-Za-z0-9]{10}$/.test(asin);
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function generateAffiliateLinks({ title, isbn10, isbn13, directLinks = {} }: {
  title: string;
  isbn10?: string | null;
  isbn13?: string | null;
  directLinks?: Partial<Record<string, string>>;
}) {
  const links: Record<string, string | undefined> = {};
  // Amazon.in
  links.amazonIn = directLinks.amazonIn || (isbn10 ? `https://www.amazon.in/dp/${isbn10}?tag=bookshubindia-21&linkCode=osi&th=1&psc=1` : undefined);
  // Amazon.com
  links.amazonCom = directLinks.amazonCom || (isbn10 ? `https://www.amazon.com/dp/${isbn10}?tag=bookshub008-20` : undefined);
  // Flipkart
  links.flipkart = directLinks.flipkart || (isbn13 ? `https://www.flipkart.com/search?q=${isbn13}` : undefined);
  // Bookscape (search by ISBN13)
  links.bookscape = directLinks.bookscape || (isbn13 ? `https://bookscape.com/search/${isbn13}?page=1&searchKeyWord=${isbn13}&searchedBy=&sort=` : undefined);
  // Bookswagon
  links.bookswagon = directLinks.bookswagon || (isbn13 ? `https://www.bookswagon.com/book/${slugifyTitle(title)}/${isbn13}` : undefined);
  // JioMart
  links.jiomart = directLinks.jiomart || (title ? `https://www.jiomart.com/search/${encodeURIComponent(title)}` : undefined);
  // Sapnaonline
  links.sapnaonline = directLinks.sapnaonline || (isbn13 ? `https://www.sapnaonline.com/verify/books/${isbn13}` : undefined);
  // Crossword
  links.crossword = directLinks.crossword || (isbn13 ? `https://www.crossword.in/pages/search?q=${isbn13}` : undefined);
  return links;
} 