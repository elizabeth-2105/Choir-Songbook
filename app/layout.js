import "./globals.css";

export const metadata = {
  title: "Choir Song Library",
  description: "Weekly sheet music and recordings for the choir",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="site-header">
          <p>Weekly Rehearsal Library</p>
          <h1>The Choir Songbook</h1>
          <nav>
            <a href="/">All songs</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
