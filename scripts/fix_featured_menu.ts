import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixFeaturedMenu() {
  const content = {
    title: "Featured Menu",
    items: [
      { title: "Tilapia Large", img: "/images/pxl-20251209-123652576.jpg" },
      { title: "Kuku Choma", img: "/images/pxl-20251209-125043384.jpg" },
      { title: "Pilau", img: "/images/pxl-20251209-114620748.jpg" },
      { title: "Beef Stew", img: "/images/pxl-20251209-120738148.jpg" },
      { title: "Fresh Juice", img: "/images/pxl-20251209-125642606.jpg" },
    ],
  };

  const { error } = await supabase.from("site_settings").upsert({
    id: "featured_menu",
    content,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error updating site setting:", error);
  } else {
    console.log("Successfully updated featured_menu setting in database");
  }
}

fixFeaturedMenu();
