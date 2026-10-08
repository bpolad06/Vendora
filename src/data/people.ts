import type { Customer, CustomerTag, Supplier } from './types';
import { VUQAR_ID } from './sellers';
import { DAY } from '../lib/time';

type CustomerRow = [string, string | undefined, string, string, string, CustomerTag];

const CUSTOMER_ROWS: CustomerRow[] = [
  ['Nərgiz Əliyeva', undefined, '+994 50 912 33 41', 'Bakı', 'Nəsimi r., Səməd Vurğun 64', 'Pərakəndə'],
  ['Rauf Hüseynov', 'Kafe Qala', '+994 70 445 11 28', 'Gəncə', 'Nizami küç. 112', 'Kafe'],
  ['Kamran Məmmədov', 'Şirvan Restoran', '+994 50 678 90 15', 'Sumqayıt', '9-cu mkr., Sülh küç. 4', 'Restoran'],
  ['Elnur Cəfərov', 'Ofis Market MMC', '+994 12 432 99 81', 'Bakı', 'Nərimanov r., Ə.Rəcəbli 22', 'Topdan'],
  ['Leyla Quliyeva', undefined, '+994 55 234 56 72', 'Bakı', 'Yasamal r., H.Cavid pr. 18', 'Pərakəndə'],
  ['Orxan Abbasov', 'Dönər House', '+994 77 301 44 09', 'Xırdalan', 'Heydər Əliyev pr. 31', 'Kafe'],
  ['Səbinə Mirzəyeva', undefined, '+994 51 778 20 36', 'Bakı', 'Xətai r., Babək pr. 7', 'Pərakəndə'],
  ['Tofiq Rəhimov', 'Toy sarayı "Gülüstan"', '+994 50 220 71 64', 'Sumqayıt', 'Sahil qəsəbəsi', 'Restoran'],
  ['Aynur Rzayeva', undefined, '+994 70 615 92 08', 'Lənkəran', 'Mirzə Fətəli küç. 15', 'Pərakəndə'],
  ['Murad Qasımov', 'Çay evi "Bulaq"', '+994 55 902 13 47', 'Şəki', 'Rəsulzadə küç. 3', 'Kafe'],
  ['Fəridə Nəbiyeva', 'Mini market "Fərid"', '+994 50 333 18 25', 'Bakı', 'Binəqədi r., 7-ci mkr.', 'Topdan'],
  ['Cavid Məlikov', undefined, '+994 77 410 66 53', 'Gəncə', 'Atatürk pr. 45', 'Pərakəndə'],
  ['Zaur Həsənli', 'Lahıc Restoranı', '+994 51 287 30 94', 'Bakı', 'Səbail r., Neftçilər pr. 81', 'Restoran'],
  ['Günay İsmayılova', undefined, '+994 55 646 71 20', 'Xırdalan', 'AAAF parkı, bina 12', 'Pərakəndə'],
  ['Rəşid Babayev', 'Coffee Point', '+994 70 512 08 77', 'Bakı', '28 May küç. 3', 'Kafe'],
  ['Ülviyyə Bağırova', undefined, '+994 50 707 41 62', 'Sumqayıt', '12-ci mkr., bina 4', 'Pərakəndə'],
  ['Natiq Əsgərov', 'Əsgərov Ticarət MMC', '+994 12 510 22 39', 'Bakı', 'Sədərək, A-blok 18', 'Topdan'],
  ['Lalə Hüseynova', undefined, '+994 51 455 63 11', 'Bakı', 'Nizami r., Qara Qarayev 40', 'Pərakəndə'],
  ['Ilqar Məmmədli', 'Kabab evi "Mangal"', '+994 77 682 15 30', 'Gəncə', 'Cavadxan küç. 19', 'Restoran'],
  ['Pərvin Sadıqova', undefined, '+994 55 391 84 26', 'Şəki', 'M.F.Axundzadə pr. 60', 'Pərakəndə'],
  ['Elvin Qasımov', undefined, '+994 50 284 17 93', 'Gəncə', 'Heydər Əliyev pr. 147, mənzil 21', 'Pərakəndə'],
  ['Arzu Kərimli', 'Şirniyyat "Arzu"', '+994 70 826 54 18', 'Bakı', 'Xətai r., Nobel pr. 15', 'Kafe'],
  ['Vüsal Nəsirov', 'Nəsirov Market', '+994 50 119 40 72', 'Lənkəran', 'Bazar küç. 2', 'Topdan'],
  ['Könül Əhmədova', undefined, '+994 51 903 27 65', 'Bakı', 'Suraxanı r., Hövsan', 'Pərakəndə'],
  ['Emil Vəliyev', 'Pizza Nostra', '+994 55 740 31 08', 'Sumqayıt', 'Nizami küç. 88', 'Kafe'],
];

export function buildCustomers(now: number): Customer[] {
  return CUSTOMER_ROWS.map(([name, company, phone, city, address, tag], i) => ({
    id: `c${String(i + 1).padStart(2, '0')}`,
    sellerId: VUQAR_ID,
    name,
    company,
    phone,
    city,
    address,
    tag,
    createdAt: now - (60 + i * 11) * DAY,
  }));
}

export function buildSuppliers(now: number): Supplier[] {
  return [
    {
      id: 'sup-azerplast',
      sellerId: VUQAR_ID,
      name: 'Azər-Plast MMC',
      city: 'Sumqayıt',
      phone: '+994 18 654 22 17',
      contact: 'Rövşən müəllim',
      leadDays: 3,
      debt: 1450,
      lastDelivery: now - 9 * DAY,
      prices: { v01: 0.4, v03: 1.95, v04: 1.3, v11: 0.31, v35: 2.2 },
    },
    {
      id: 'sup-xezer',
      sellerId: VUQAR_ID,
      name: 'Xəzər Polimer',
      city: 'Sumqayıt',
      phone: '+994 18 642 70 35',
      contact: 'Aqil Səmədov',
      leadDays: 5,
      debt: 0,
      lastDelivery: now - 4 * DAY,
      prices: { v01: 0.38, v06: 0.92, v28: 1.4, v29: 0.6 },
    },
    {
      id: 'sup-turkpak',
      sellerId: VUQAR_ID,
      name: 'Turkpak İdxal',
      city: 'Bakı',
      phone: '+994 50 221 09 46',
      contact: 'Mehmet bəy',
      leadDays: 12,
      debt: 3200.5,
      lastDelivery: now - 22 * DAY,
      prices: { v01: 0.35, v05: 3.05, v07: 0.27, v10: 4.35 },
    },
    {
      id: 'sup-kaspi',
      sellerId: VUQAR_ID,
      name: 'Kaspi Qablaşdırma',
      city: 'Bakı',
      phone: '+994 12 490 88 73',
      contact: 'Nigar xanım',
      leadDays: 2,
      debt: 0,
      lastDelivery: now - 5 * DAY,
      prices: { v02: 0.68, v09: 0.71, v12: 0.43 },
    },
    {
      id: 'sup-gence-kagiz',
      sellerId: VUQAR_ID,
      name: 'Gəncə Kağız Fabriki',
      city: 'Gəncə',
      phone: '+994 22 256 11 40',
      contact: 'Elçin Hüseynov',
      leadDays: 4,
      debt: 680,
      lastDelivery: now - 17 * DAY,
      prices: { v23: 11.2, v24: 7.1, v25: 8.6 },
    },
    {
      id: 'sup-ekopak',
      sellerId: VUQAR_ID,
      name: 'Ekopak Xırdalan',
      city: 'Xırdalan',
      phone: '+994 70 334 55 62',
      contact: 'Sevda Quliyeva',
      leadDays: 6,
      debt: 420,
      lastDelivery: now - 12 * DAY,
      prices: { v08: 4.1, v18: 3.9, v40: 1.05 },
    },
  ];
}

export const WALK_IN = 'Pərakəndə alıcı';
