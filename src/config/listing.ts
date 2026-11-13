/**
 * Listing content — edit this file to update the page.
 *
 * VIDEO TOUR: paste ONE link into `videoTour.url` and the player switches automatically.
 *   - MP4 file:   put the file in /public/videos/ and use "/videos/tour.mp4"
 *   - YouTube:    "https://www.youtube.com/watch?v=XXXX" or "https://youtu.be/XXXX" or a /shorts/ link
 *   - Instagram:  "https://www.instagram.com/reel/XXXX/"
 *   - TikTok:     "https://www.tiktok.com/@handle/video/1234567890"
 * Leave it empty ("") to show the "request a live video call" fallback.
 */
const WHATSAPP_NUMBER = "2348000000000";
const WHATSAPP_MESSAGE = "Hello, I am interested in the Lekki Phase 1 Duplex";

export const listing = {
  badge: "EXCLUSIVE LISTING • LEKKI PHASE 1",
  title: "Luxury 3-Bedroom Waterfront Duplex",
  subtitle: "₦150,000 / Night • 24/7 Power • Starlink Wi-Fi • Armed Estate Security",
  priceLabel: "₦150,000",
  priceUnit: "/ night",
  location: "Lekki Phase 1, Lagos",
  whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE.split(" ").join("%20")}`,
  videoTour: {
    url: "",
    duration: "01:45 HD Tour",
    caption:
      "Take a 2-minute virtual walkthrough of the interior, compound, and neighborhood",
  },
  agency: {
    name: "PrimeHaven Properties Lagos",
    agent: "Adaeze Okafor",
    role: "Lead Property Consultant",
    bio: "Trusted luxury short-let and property specialists in Lekki & Victoria Island",
    stats: [
      { value: "120+", label: "Luxury stays hosted" },
      { value: "4.9", label: "Guest rating" },
      { value: "8 yrs", label: "In Lagos real estate" },
    ],
  },
  testimonials: [
    {
      quote:
        "Spotless, secure and the power never blinked once. Check-in was seamless — easily the best short-let I've booked in Lekki.",
      name: "Tunde A.",
      detail: "Business stay • 5 nights",
    },
    {
      quote:
        "The pool, the Starlink, the view — exactly as shown in the video. PrimeHaven responded on WhatsApp within minutes.",
      name: "Chioma E.",
      detail: "Family getaway • 3 nights",
    },
  ],
} as const;
