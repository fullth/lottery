import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function purchaseLottery() {
    const isTestMode = process.env.TEST_MODE === 'true';
    const browser = await puppeteer.launch({ headless: !isTestMode });
    const page = await browser.newPage();

    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir);
    }

    try {
        console.log('동행복권 사이트 접속 시도');
        await page.goto('https://www.dhlottery.co.kr/user.do?method=login');
        await page.screenshot({ path: path.join(screenshotDir, 'login-page.png') });
        console.log('로그인 페이지 스크린샷 저장');

        console.log('로그인 시도');
        await page.type('#userId', process.env.LOGIN_ID || '');
        await page.type('input[name="password"]', process.env.LOGIN_PW || '');

        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 });
        await page.evaluate(() => {
            const loginButton = document.querySelector('.btn_common.lrg.blu');
            if (loginButton) {
                (loginButton as HTMLElement).click();
            } else {
                throw new Error('로그인 버튼을 찾을 수 없습니다.');
            }
        })

        console.log('로그인 버튼 클릭 완료 및 페이지 전환 대기 완료');

        // await page.screenshot({ path: path.join(screenshotDir, 'after-login.png') });
        // console.log('로그인 후 스크린샷 저장');
        //
        // console.log('로또 구매 페이지로 이동');
        // await page.goto('https://el.dhlottery.co.kr/game/TotalGame.jsp?LottoId=LO40');
        // await page.screenshot({ path: path.join(screenshotDir, 'purchase-page.png') });
        //
        // console.log('번호 선택 (자동)');
        // await page.click('#num2');
        //
        // if (isTestMode) {
        //     console.log('테스트 모드: 구매 버튼 클릭 시뮬레이션');
        // } else {
        //     console.log('구매하기 버튼 클릭');
        //     await page.click('.btn_common.lrg.blu');
        // }
        //
        // await page.screenshot({ path: path.join(screenshotDir, 'purchase-complete1.png') });
        // console.log('구매 완료 후 스크린샷 저장');
        //
        // const purchaseConfirmation = await page.$eval('.popup_win', el => el.textContent);
        // console.log('구매 확인:', purchaseConfirmation);
    } catch (error) {
        console.error('오류 발생:', error);
        await page.screenshot({ path: path.join(screenshotDir, 'error.png') });
        console.log('오류 발생 시 스크린샷 저장');
    } finally {
        await browser.close();
        console.log('브라우저 종료');
    }
}

purchaseLottery().then(() => console.log('프로세스 완료'));