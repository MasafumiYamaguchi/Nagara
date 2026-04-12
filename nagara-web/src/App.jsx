import "./App.css";
import Privacy from "./privacy";

export default function App() {
  const page = new URLSearchParams(window.location.search).get("page");
  const isPrivacy = page === "privacy";
  const supportEmail = "mkapps.app@gmail.com";
  const mailSubject = encodeURIComponent("Nagara お問い合わせ");
  const mailBody = encodeURIComponent(
    "お問い合わせ内容:\n\n---\n利用端末:\nOSバージョン:\nアプリバージョン:\n"
  );
  const mailtoLink = `mailto:${supportEmail}?subject=${mailSubject}&body=${mailBody}`;
  const gmailComposeLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    supportEmail
  )}&su=${mailSubject}&body=${mailBody}`;

  if (isPrivacy) {
    return <Privacy />;
  }

  return (
    <main className="wrap">
      <section className="card" aria-labelledby="support-title">
        <h1 id="support-title">Nagara サポートページ</h1>

        <section className="support-block" aria-labelledby="contact-title">
          <h2 id="contact-title">お問い合わせ</h2>
          <p>返信の目安：1週間以内（目安）</p>
          <p>メーラーが起動しない場合は、Webメールをご利用ください。</p>
          <p>
            メール：{supportEmail}
            <br />
            アプリ内：設定 &gt; ヘルプとサポート
          </p>
        </section>

        <div className="actions">
          <button onClick={() => (window.location.href = mailtoLink)}>
            お問い合わせ先
          </button>
          <button onClick={() => window.open(gmailComposeLink, "_blank", "noopener,noreferrer")}>
            Webメールでお問い合わせ
          </button>
          <button onClick={() => (window.location.search = "?page=privacy")}>
            プライバシーポリシー
          </button>
        </div>
        <p className="policy-footer">MKapps 2026</p>
      </section>
    </main>
  );
}