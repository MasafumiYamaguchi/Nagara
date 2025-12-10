describe('ホーム画面までの遷移', () => {
  beforeAll(async () => {
    await device.launchApp({ delete: true });
    // Index画面は一瞬で消えるから、最初から同期無効にしとく
    await device.disableSynchronization();
  });

  it('should show login screen', async () => {
    // Index画面スキップして、いきなりLogin画面を待つ
    await waitFor(element(by.id('loginScreen')))
      .toBeVisible()
      .withTimeout(20000);
      
    // Login画面来たら同期ON
    await device.enableSynchronization();
    
    await expect(element(by.id('loginScreen'))).toBeVisible();
  });

  it('Googleログインボタンを押すとホーム画面に遷移すること', async () => {
    await expect(element(by.id('loginScreen'))).toBeVisible();

    const googleButton = element(by.text('Googleでログイン'));
    await expect(googleButton).toBeVisible();

    await googleButton.tap();

    // ホーム画面への遷移を確認
    await waitFor(element(by.id('homeScreen')))
      .toBeVisible()
      .withTimeout(10000);
  });
});
