"use client";
import { gql, useQuery } from "@apollo/client";
import { loginWithGoogle, logout } from "../../lib/firebase";

const ME = gql`query { me { uid email name } }`;

export default function Page() {
  const { data, refetch } = useQuery(ME, { fetchPolicy: "network-only" });
  return (
    <main style={{ padding: 16 }}>
      <button onClick={() => loginWithGoogle().then(() => refetch())}>Googleでログイン</button>
      <button onClick={() => logout().then(() => refetch())} style={{ marginLeft: 8 }}>ログアウト</button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
