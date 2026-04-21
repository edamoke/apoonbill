
-- Update initial settings
INSERT INTO site_settings (id, content) VALUES
('hero', '{
  "title": "The Spoonbill",
  "subtitle": "Fast Food",
  "mainHeading": "Fresh & <br />Delicious",
  "buttonText": "START ORDER",
  "backgroundImage": "/images/hero-new.png",
  "excellenceText": "Certificate of Excellence",
  "choiceText": "Travelers'' Choice 2026"
}'),
('grid_split', '{
  "giftCard": {
    "tag": "BRAND NEW",
    "intro": "INTRODUCING",
    "title": "THE MOST <br />DELICIOUS GIFT",
    "cardText": "The Spoonbill Gift Card",
    "buttonText": "BUY NOW",
    "promoText": "GET & GIFT SOMEONE TODAY"
  },
  "seafoodCard": {
    "tag": "BRAND NEW",
    "intro": "FRESH",
    "title": "FRESH SEAFOOD",
    "image": "/images/pili-pili-prawns.webp"
  }
}'),
('subscription', '{
  "title": "Join our email list",
  "disclaimer": "By clicking \"SUBSCRIBE\" I agree to receive news, promotions, information, and offers from The Spoonbill.",
  "socials": ["Facebook", "Twitter", "Instagram"]
}'),
('footer', '{
  "location": {
    "title": "LOCATION",
    "lines": ["Opposite Barclays Bank,", "Malindi Lamu Road,", "Malindi"]
  },
  "menu": {
    "title": "OUR MENU",
    "items": [
      {"label": "BREAKFAST", "href": "/menu"},
      {"label": "DRINKS", "href": "/menu"},
      {"label": "MAINS", "href": "/menu"},
      {"label": "DESSERTS", "href": "/menu"}
    ]
  },
  "contact": {
    "title": "CALL US",
    "phone": "0748 422 994"
  },
  "copyright": "© 2026 The Spoonbill. All Rights Reserved"
}'),
('styles', '{
  "fontSize": "base",
  "backgroundColor": "#ffffff",
  "primaryColor": "#d62828",
  "secondaryColor": "#0A2D4A",
  "fontFamily": "serif"
}')
ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;
