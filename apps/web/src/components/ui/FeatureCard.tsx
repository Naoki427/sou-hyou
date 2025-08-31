"use client";
import Image from "next/image";

type Props = {
  variant?: "red" | "green";
  title: string;
  desc: string;
  img: string;
  alt?: string;
};

export default function FeatureCard({
  variant = "red",
  title,
  desc,
  img,
  alt = "",
}: Props) {
  return (
    <article className={`featureCard ${variant}`}>
      <h3 className="cardTitle">{title}</h3>

      {/* 画像は fill を使い、親で角丸クリップ */}
      <div className="cardImage">
        <Image
          src={img}
          alt={alt}
          fill
          sizes="(min-width: 948px) 520px, 90vw"
          className="cardImg"
          priority={false}
        />
      </div>

      <p className="cardDesc">{desc}</p>

      <style jsx>{`
        .featureCard {
          position: relative;
          overflow: hidden;
          border-radius: 14px;
          background: #fff;
          border: 1px solid #e9e9ee;
          box-shadow: 0 6px 22px rgba(0, 0, 0, 0.05);
          padding: 12px;             /* 余白は控えめのまま */
          display: grid;
          row-gap: 10px;
          transition: box-shadow 0.2s ease, transform 0.06s ease;
          will-change: transform;
        }
        .featureCard:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.07);
        }

        /* 上から“かぶせる”グラデ（右上薄→左下濃）を少しだけ強めに */
        .featureCard::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2; /* コンテンツの上 */
          background:
            radial-gradient(
              120% 120% at 0% 100%,     /* 左下を起点に広がる */
              var(--grad-blob, rgba(0,0,0,0)) 0%,
              var(--grad-blob, rgba(0,0,0,0)) 24%,
              rgba(255,255,255,0) 60%
            ),
            linear-gradient(
              to left bottom,
              var(--grad-start2, rgba(0,0,0,0.0)) 10%,
              var(--grad-end2,   rgba(0,0,0,0.0)) 85%
            );
        }
        .featureCard.red   {
          --grad-blob: rgba(255, 99, 99, 0.20);
          --grad-start2: rgba(255, 99, 99, 0.04);
          --grad-end2:   rgba(255, 99, 99, 0.10);
          --img-stroke:  rgba(255, 99, 99, 0.28);  /* ← 縁取りの色 */
        }
        .featureCard.green {
          --grad-blob: rgba(34, 197, 94, 0.18);
          --grad-start2: rgba(34, 197, 94, 0.04);
          --grad-end2:   rgba(34, 197, 94, 0.10);
          --img-stroke:  rgba(34, 197, 94, 0.26);  /* ← 縁取りの色 */
        }

        /* コンテンツは ::after より下の z-index */
        .cardTitle,
        .cardDesc,
        .cardImage {
          position: relative;
          z-index: 1;
        }

        .cardTitle {
          font-weight: 800;
          font-size: 20px;
          color: #0f172a;
          letter-spacing: -0.01em;
          line-height: 1.25;
        }

        /* 親で角丸＆クリップ、子 Image は fill  object-fit: cover */
        .cardImage {
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          background: #f6f7f9;
          aspect-ratio: 16 / 10;
          border: 1px solid var(--img-stroke, #e5e7eb);
        }
        :global(.cardImg) {
          object-fit: cover;
          object-position: center;
        }

        .cardDesc {
          color: #334155;
          font-size: 15.5px;
          line-height: 1.7;
        }

        @media (max-width: 560px) {
          .cardTitle { font-size: 18px; }
          .cardDesc  { font-size: 15px; }
          .featureCard { padding: 10px; row-gap: 8px; }
        }
      `}</style>
    </article>
  );
}
