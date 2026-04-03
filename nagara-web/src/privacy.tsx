import React from "react";

const Privacy = () => {
  return (
    <main className="wrap">
      <section className="card privacy-card" aria-labelledby="privacy-title">
        <button className="back-button" onClick={() => window.history.back()}>&gt; 戻る</button>
        <br />
        <h1 id="privacy-title">プライバシーポリシー</h1>

        <p className="policy-text">
          MKapps（以下「当方」）は、本アプリケーション「Nagara」（以下「本アプリ」）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。
        </p>

        <hr className="policy-divider" />

        <section className="policy-section">
          <h2>1. 収集する情報</h2>
          <p>当方は、本アプリにおいて以下の情報を収集する場合があります。</p>
          <p>・アカウント情報: Googleアカウントより提供されるユーザー名、メールアドレス、プロフィール画像</p>
          <p>・利用状況・端末情報: 識別子、OSの種類、クラッシュログ、パフォーマンスデータ</p>
          <p>・通信データ: 接続日時や通信品質等のログ（※通話内容自体は収集・保存されません）</p>
        </section>

        <section className="policy-section">
          <h2>2. 利用目的</h2>
          <p>収集した情報は、以下の目的で利用します。</p>
          <p>・本アプリの提供・維持およびユーザー認証のため</p>
          <p>・不具合の調査、アプリの品質向上のため</p>
          <p>・ユーザーからのお問い合わせに対応するため</p>
        </section>

        <section className="policy-section">
          <h2>3. 第三者提供・外部サービス</h2>
          <p>本アプリでは、以下の外部サービスを利用しており、各事業者に情報が提供される場合があります。</p>
          <p>・Google (Firebase): ユーザー認証、ログ収集、パフォーマンス監視</p>
          <p>・Agora.io: リアルタイム音声通信の提供</p>
          <p>・AWS: データのバックエンド処理および保存</p>
        </section>

        <section className="policy-section">
          <h2>4. 安全管理措置</h2>
          <p>当方は、個人情報の漏洩、滅失または毀損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。</p>
        </section>

        <section className="policy-section">
          <h2>5. アカウントおよびデータの削除</h2>
          <p>本アプリからアカウントの削除が可能です。プロフィール画面の「退会する」ボタンから退会手続きを行うと、Firebase Authentication上のアカウント情報およびFirestore上のユーザーデータが削除されます。</p>
          <p>なお、退会後はアカウントの復元はできませんのでご注意ください。</p>
          <p>お問い合わせ先: mkapps.app@gmail.com</p>
        </section>

        <section className="policy-section">
          <h2>6. プライバシーポリシーの変更</h2>
          <p>当方は、法令変更への対応や本アプリの機能追加（広告の導入など）に伴い、必要に応じて本ポリシーを変更することがあります。重要な変更を行う場合は、本アプリ内または当方の指定する方法でユーザーに通知いたします。</p>
        </section>
        <p className="policy-footer">MKapps 2026</p>
      </section>
    </main>
  );
};

export default Privacy;