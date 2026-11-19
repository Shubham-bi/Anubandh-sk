export interface BookletCandidate {
  id: string;
  sr: string;
  name: string;
  mulgaon: string;
  height: string;
  complexion: string;
  gotra: string;
  mamkul: string;
  time: string;
  date: string;
  blood: string;
  edu: string;
  fam: string;
  exp: string;
  contact: string;
  phones: string[];
  status: string;
  age: number;
  logs?: any[];
}

export interface ParsedContactPerson {
  name: string;
  address: string;
  phoneRaw: string;
  phoneClean: string;
}

export function marathiToAscii(str: string): string {
  if (!str) return '';
  const marathiDigits = '०१२३४५६७८९';
  return str.replace(/[०-९]/g, (d) => String(marathiDigits.indexOf(d)));
}

export function cleanMarathiPhone(phone: string): string {
  const ascii = marathiToAscii(phone);
  return ascii.replace(/[^\d]/g, '');
}

export function parseCandidateContacts(text: string, fallbackPhones: string[] = []): ParsedContactPerson[] {
  if (!text) {
    return fallbackPhones.map((p) => ({
      name: 'पालक / संपर्क',
      address: '',
      phoneRaw: p,
      phoneClean: cleanMarathiPhone(p).slice(-10),
    }));
  }

  // Normalize text: split into distinct contact blocks
  const normalized = text
    .replace(/(?:\r\n|\r|\n)/g, '\n')
    .replace(/(?:^|\n)(?:संपर्क[\s-]*)?([०-९1-9]\))/g, '\n---SPLIT---$1');

  const blocks = normalized.split('---SPLIT---').map((b) => b.trim()).filter(Boolean);
  const contacts: ParsedContactPerson[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    let name = '';
    const addressParts: string[] = [];
    let phoneRaw = '';
    let phoneClean = '';

    for (const line of lines) {
      const phoneMatch =
        line.match(/(?:मो\.|मोबाईल|संपर्क)?[\s:.-]*([०-९0-9\s-]{10,})/i) ||
        line.match(/([०-९0-9]{10})/);

      if (phoneMatch && !phoneClean) {
        const c = cleanMarathiPhone(phoneMatch[1] || phoneMatch[0]);
        if (c.length >= 10) {
          phoneRaw = (phoneMatch[1] || phoneMatch[0]).trim();
          phoneClean = c.slice(-10);
        }
      }

      if (/^(?:[०-९1-9]\)\s*)?(?:श्री|सौ|प्रा|डॉ|कु)\.?/i.test(line) && !name) {
        name = line.replace(/^[०-९1-9]\)\s*/, '').trim();
      } else if (/^रा[\s:.-]/i.test(line)) {
        addressParts.push(line.replace(/^रा[\s:.-]*/i, '').trim());
      } else if (!phoneMatch) {
        if (!name && !/^(?:मो|संपर्क)/i.test(line)) {
          name = line.replace(/^[०-९1-9]\)\s*/, '').trim();
        } else {
          addressParts.push(line);
        }
      }
    }

    if (!phoneClean && fallbackPhones.length > 0) {
      const unusedPhone = fallbackPhones.find((p) => !contacts.some((c) => c.phoneRaw === p));
      if (unusedPhone) {
        phoneRaw = unusedPhone;
        phoneClean = cleanMarathiPhone(unusedPhone).slice(-10);
      }
    }

    if (name || phoneClean || addressParts.length > 0) {
      contacts.push({
        name: name || 'पालक / संपर्क',
        address: addressParts.join(', '),
        phoneRaw,
        phoneClean,
      });
    }
  }

  // Attach any unmapped phones
  fallbackPhones.forEach((p) => {
    const clean = cleanMarathiPhone(p).slice(-10);
    if (!contacts.some((c) => c.phoneClean === clean)) {
      contacts.push({
        name: 'इतर संपर्क',
        address: '',
        phoneRaw: p,
        phoneClean: clean,
      });
    }
  });

  return contacts;
}
