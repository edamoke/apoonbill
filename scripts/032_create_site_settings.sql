-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on site_settings"
  ON site_settings FOR SELECT
  USING (true);

-- Allow admin write access
CREATE POLICY "Allow admin write access on site_settings"
  ON site_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- Insert initial settings
INSERT INTO site_settings (id, content) VALUES
('hero', '{
  "title": "thespoonbill",
  "subtitle": "Malindi",
  "mainHeading": "Stars & <br />Gaters",
  "buttonText": "START ORDER",
  "backgroundImage": "/images/hero-new.png",
  "excellenceText": "Certificate of Excellence",
  "choiceText": "Travelers'' Choice 2024"
}'),
('grid_split', '{
  "giftCard": {
    "tag": "BRAND NEW",
    "intro": "INTRODUCING",
    "title": "THE MOST <br />DELICIOUS GIFT",
    "cardText": "thespoonbill Gift Card",
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
  "disclaimer": "By clicking \"SUBSCRIBE\" I agree to receive news, promotions, information, and offers from thespoonbill.",
  "socials": ["Facebook", "Twitter", "Instagram"]
}'),
('footer', '{
  "location": {
    "title": "LOCATION",
    "lines": ["Opposite KCB Bank,", "Malindi Lamu Road,", "Malindi"]
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
  "copyright": "© 2025 thespoonbill. All Rights Reserved"
}'),
('styles', '{
  "fontSize": "base",
  "backgroundColor": "#ffffff",
  "primaryColor": "#d62828",
  "secondaryColor": "#0A2D4A",
  "fontFamily": "serif"
}')
ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;
