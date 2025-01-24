import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <h1 className="text-xl font-bold">Chat</h1>
          </Link>

          <div className="flex items-center space-x-2"></div>
        </div>
      </header>
      <main className="flex-grow">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
