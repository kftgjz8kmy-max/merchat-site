export const siteConfig = {
  name: "merchat",
  description: "El asistente de IA para gestionar Mercado Libre.",
  whatsappUrl: "https://wa.me/51999999999?text=Hola%2C%20quiero%20conocer%20merchat",
  trialUrl: "https://ml-automation-iota.vercel.app/prueba-gratis",
  chatgptGuideUrl: "https://ml-automation-iota.vercel.app/guia-chatgpt",
  brand: {
    logo: "/brand/merchat-logo.png",
    icon: "/brand/merchat-chat-icon.png",
  },
  navigation: [
    { label: "Cómo funciona", href: "#como-funciona" },
    { label: "Qué puedes hacer", href: "#funciones" },
    { label: "Precios", href: "#planes" },
    { label: "Seguridad", href: "#seguridad" },
    { label: "FAQ", href: "#faq" },
    { label: "IA a medida", href: "#ia-negocios", icon: "lightbulb" },
  ],
} as const;
