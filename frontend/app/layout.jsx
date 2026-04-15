import "./globals.css";

export const metadata = {
  title: "Cal.com Demo Clone",
  description: "Scraped Cal pages + demo auth and meeting scheduler",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
