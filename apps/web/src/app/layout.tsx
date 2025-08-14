import ApolloProviders from "./apollo-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <ApolloProviders>{children}</ApolloProviders>
      </body>
    </html>
  );
}