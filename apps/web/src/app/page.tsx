"use client";
import { GuestOnly } from "@/components/auth/GuestOnly";
import Link from "next/link";
import Image from "next/image";
import FeatureCard from "@/components/ui/FeatureCard";

export default function Page() {
  return (
    <GuestOnly>
      <main className="mainContainer">
        <section className="introSection">
          <div className="main_pop">
            <h1 className="theme">
              <span className="themeLine">あなた独自の出走表で、</span>
              <br />
              <span className="themeLine">レースの総合評価を。</span>
            </h1>

            <Link href="/register" className="register_button" aria-label="新規登録">
              新規登録
            </Link>
          </div>

          <div className="home_image">
            <Image
              src="/mainpage.png"
              alt="予想を考える人物のイラスト"
              width={960}
              height={720}
              priority
              sizes="(max-width: 948px) 76vw, (max-width: 1110px) 32vw, 34vw"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </section>
        <section id="features" className="featuresSection">
          <div className="featuresHeader">
            <h2 className="featuresHeading">機能</h2>
          </div>

          <div className="featuresGrid">
            <FeatureCard
              variant="red"
              title="パス形式で予想を管理"
              img="/feature_path.png"
              alt=""
              desc="フォルダ階層で整理できるので、過去の予想も簡単に見返せます。"
            />

            <FeatureCard
              variant="green"
              title="カスタムフィールドで独自の評価"
              img="/feature_field.png"
              alt=""
              desc="テーブルに独自の予想項目を追加し、オリジナルの出走表に"
            />
          </div>
        </section>
        <section id="roadmap" className="devSection">
          <div className="devHeader">
            <span className="devBadge">開発中</span>
            <h2 className="devHeading">開発状況と今後の予定</h2>
            <p className="devLead">
              このアプリは現在 <strong>β 開発中</strong> です。以下の機能を順次リリース予定です。
            </p>
          </div>

          <div className="devGrid">
            <article className="devCard">
              <div className="devIcon">
                <Image src="/devicon.svg" alt="" width="40" height="40" />
              </div>
              <h3 className="devTitle">レース選択で自動補完</h3>
              <p className="devDesc">
                レースを選んで、出走馬・騎手・斤量などの基本情報を自動で入力。手入力の手間を減らします。
              </p>
            </article>

            <article className="devCard">
              <div className="devIcon">
                <Image src="/devicon.svg" alt="" width="40" height="40" />
              </div>
              <h3 className="devTitle">テーブルのテンプレート化</h3>
              <p className="devDesc">
                予想項目のテンプレートを作成・保存。毎回同じ評価項目を呼び出して、素早く出走表を整えられます。
              </p>
            </article>

            <article className="devCard">
              <div className="devIcon">
                <Image src="/devicon.svg" alt="" width="40" height="40" />
              </div>
              <h3 className="devTitle">馬名検索で過去の予想一覧</h3>
              <p className="devDesc">
                検索ボックスに馬名を入力すると、その馬に関する過去の予想を表示できます。
              </p>
            </article>
          </div>
        </section>
      </main>

      <style jsx>{`
        .mainContainer {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 100vh;
          background: #fff;
        }

        .introSection {
          display: grid;
          grid-template-columns: 1fr minmax(360px, 480px);
          align-items: center;
          gap: 32px;
          width: 100%;
          max-width: 1200px;
          padding: 40px 48px;
          box-sizing: border-box;
        }

        @media (max-width: 1110px) {
          .introSection {
            grid-template-columns: 1fr minmax(320px, 440px);
            gap: 28px;
            padding: 28px 32px;
          }
          .theme {
            font-size: clamp(32px, 6vw, 56px);
          }
        }

        @media (max-width: 948px) {
          .introSection {
            grid-template-columns: 1fr;
            justify-items: center;
            gap: 20px;
            padding: 20px 16px;
          }
          .theme {
            text-align: center;
            font-size: clamp(26px, 7vw, 44px);
            line-height: 1.1;
          }
        }

        .main_pop {
          display: grid;
          row-gap: 36px;
          max-width: 680px;
          width: 100%;
        }

        .theme {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, "SF Pro Text", "SF Pro Display", sans-serif;
          font-weight: 800;
          color: #121212;
          font-size: clamp(34px, 7.4vw, 66px);
          line-height: 1.12;
          letter-spacing: -0.04em;
          margin: 0 0 6px;
        }
        .themeLine { 
          white-space: nowrap; 
        }
        @media (max-width: 360px) {
          .themeLine { white-space: normal; }
        }

        .home_image {
          width: 100%;
          max-width: clamp(320px, 34vw, 460px);
          margin: 0 0 0 auto;
        }
        @media (max-width: 1110px) {
          .home_image { max-width: clamp(300px, 32vw, 440px); }
        }
        @media (max-width: 948px) {
          .home_image {
            margin: 8px auto 0; 
            max-width: clamp(280px, 76vw, 500px);
          }
        }
      `}</style>

      <style jsx global>{`
        .register_button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 44px;           /* ← 高さ固定 */
          padding: 0 18px;
          white-space: nowrap;    /* ← 改行しない */
          line-height: 1;

          border-radius: 12px;
          background: linear-gradient(180deg, #0e82ff, #0b6fe0);
          color: #fff;
          text-decoration: none !important;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.02em;
          box-shadow: 0 6px 18px rgba(14, 130, 255, 0.25);
          transition: transform 0.06s ease, box-shadow 0.2s ease,
            background 0.2s ease, opacity 0.2s ease;
          outline: none;
          border: 0;
          align-self: start;
        }
        .register_button:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(14, 130, 255, 0.35);
          opacity: 0.98;
        }
        .register_button:active {
          transform: translateY(0);
          box-shadow: 0 5px 14px rgba(14, 130, 255, 0.28);
          opacity: 0.96;
        }
        .register_button:focus-visible {
          box-shadow: 0 0 0 3px rgba(14, 130, 255, 0.35),
            0 6px 18px rgba(14, 130, 255, 0.25);
        }
      `}</style>
      <style jsx>{`
        .featuresSection {
          width: 100%;
          max-width: 1200px;
          box-sizing: border-box;
          padding: 0 48px 36px;
          margin: 0 auto;
        }
        @media (max-width: 948px) {
          .featuresSection { padding: 12px 16px 28px; }
        }

        .featuresHeader { margin: 0 0 10px; }
        .featuresHeading {
          font-weight: 900;
          font-size: clamp(40px, 2.6vw, 48px);
          letter-spacing: -0.02em;
          color: #0f172a;
        }
        .featuresSub {
          margin-top: 4px;
          color: #475569;
          font-size: clamp(13px, 1.3vw, 15px);
        }

        .featuresGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(460px, 1fr));
          gap: 16px;
        }
        @media (max-width: 500px) {
          .featuresGrid { grid-template-columns: 1fr; }
        }
      `}</style>

      <style jsx>{`
        .devSection {
          width: 100%;
          max-width: 1200px;
          box-sizing: border-box;
          padding: 12px 48px 32px;    /* 余白控えめ */
          margin: 0 auto;
        }
        @media (max-width: 948px) {
          .devSection { padding: 8px 16px 24px; }
        }

        .devHeader {
          display: grid;
          row-gap: 8px;
          margin: 0 0 10px;
        }
        .devBadge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 22px;
          padding: 0 10px;
          font-size: 12px;
          font-weight: 700;
          border-radius: 999px;
          color: #0b5bd6;
          background: rgba(14, 130, 255, 0.10);
          border: 1px solid rgba(14, 130, 255, 0.25);
          width: fit-content;
        }
        .devHeading {
          font-weight: 900;
          font-size: clamp(22px, 2.4vw, 28px);
          letter-spacing: -0.02em;
          color: #0f172a;
          margin: 0;
        }
        .devLead {
          color: #475569;
          font-size: 14.5px;
          margin: 0;
        }

        .devGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 12px;                  /* ぎゅっと */
        }

        .devCard {
          position: relative;
          border-radius: 12px;
          border: 1px solid #e9e9ee;
          background: #fff;
          padding: 12px;
          display: grid;
          grid-template-columns: 28px 1fr;
          column-gap: 10px;
          row-gap: 6px;
          align-items: start;
        }
        .devIcon {
          grid-row: 1 / span 2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          color: #0b6fe0;
          background: rgba(14,130,255,0.10);
          border: 1px solid rgba(14,130,255,0.18);
        }
        .devTitle {
          margin: 0;
          font-weight: 800;
          font-size: 16px;
          color: #0f172a;
          letter-spacing: -0.01em;
          line-height: 1.25;
        }
        .devDesc {
          margin: 0;
          color: #334155;
          font-size: 14.5px;
          line-height: 1.6;
        }
      `}</style>

    </GuestOnly>
  );
}
