// JSON-LD из старого index.html
export const JSON_LD: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "НАШЕ for Russia Transfer",
    "description": "Междугородний трансфер и такси по России без агрегаторов. Фиксированная цена, комфортные авто, водители-профессионалы. Звоните: +7 996 160-65-67",
    "url": "https://nashe-transfer.ru/",
    "telephone": [
      "+79961606567",
      "+79365250050",
      "+79958998065"
    ],
    "priceRange": "₽₽",
    "openingHours": "Mo-Su 00:00-24:00",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "RU",
      "addressLocality": "Москва"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Россия"
    },
    "sameAs": [
      "https://nashe-transfer.ru/"
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    "name": "НАШЕ for Russia Transfer",
    "description": "Междугородний трансфер и такси по России без агрегаторов. Фиксированная цена, комфортные авто.",
    "telephone": [
      "+79961606567",
      "+79365250050",
      "+79958998065"
    ],
    "url": "https://nashe-transfer.ru/",
    "areaServed": {
      "@type": "Country",
      "name": "Россия"
    },
    "provider": {
      "@type": "LocalBusiness",
      "name": "НАШЕ for Russia Transfer",
      "telephone": [
        "+79961606567",
        "+79365250050",
        "+79958998065"
      ],
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "RU",
        "addressLocality": "Москва"
      },
      "priceRange": "₽₽",
      "openingHours": "Mo-Su 00:00-24:00"
    },
    "serviceType": "Междугородний трансфер",
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "priceCurrency": "RUB"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "НАШЕ for Russia Transfer",
    "url": "https://nashe-transfer.ru/",
    "telephone": "+7 (996) 160-65-67",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+7 (996) 160-65-67",
        "contactType": "customer service",
        "contactOption": "TollFree",
        "areaServed": "RU",
        "availableLanguage": "Russian"
      },
      {
        "@type": "ContactPoint",
        "telephone": "+7 (936) 525-00-50",
        "contactType": "customer service",
        "contactOption": "TollFree",
        "areaServed": "RU",
        "availableLanguage": "Russian"
      },
      {
        "@type": "ContactPoint",
        "telephone": "+7 (995) 899-80-65",
        "contactType": "customer service",
        "contactOption": "TollFree",
        "areaServed": "RU",
        "availableLanguage": "Russian"
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "НАШЕ Трансфер — межгород",
    "url": "https://nashe-transfer.ru/",
    "telephone": "+7 (996) 160-65-67",
    "priceRange": "₽₽",
    "openingHours": "Mo-Su 00:00-24:00",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "RU",
      "addressLocality": "Москва"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Россия"
    }
  }
];
