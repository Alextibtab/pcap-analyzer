import "preact/debug";
import { PageProps } from "$fresh/server.ts";

const App = ({ Component }: PageProps) => {
  return (
    <html lang="en" class="dark">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>pcap-analyzer</title>
        <link rel="stylesheet" href="/styles.css" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body class="bg-gray-900 text-white font-mono">
        <Component />
      </body>
    </html>
  );
};

export default App;
