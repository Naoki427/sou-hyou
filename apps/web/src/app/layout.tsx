import ApolloProviders from "./apollo-provider";
import { Header } from "@/components/Header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body suppressHydrationWarning className="h-full flex flex-col">
        <ApolloProviders>
          <Header />
          <main className="flex-1 overflow-auto">{children}</main>
        </ApolloProviders>
      </body>
    </html>
  );
}
