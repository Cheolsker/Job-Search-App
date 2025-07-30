#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Chrome이 설치되어 있는지 확인하는 함수
 */
function isChromeInstalled() {
  try {
    // Puppeteer의 Chrome 설치 경로 확인
    const puppeteer = require("puppeteer");
    const browserFetcher = puppeteer.createBrowserFetcher();
    const revisionInfo = browserFetcher.revisionInfo(
      puppeteer.PUPPETEER_REVISIONS.chromium
    );

    // Chrome 실행 파일이 존재하는지 확인
    if (fs.existsSync(revisionInfo.executablePath)) {
      console.log("✅ Chrome이 이미 설치되어 있습니다.");
      return true;
    }

    return false;
  } catch (error) {
    console.log("❌ Chrome 설치 상태를 확인할 수 없습니다.");
    return false;
  }
}

/**
 * Chrome을 설치하는 함수
 */
function installChrome() {
  try {
    console.log("🔄 Chrome을 설치하고 있습니다...");
    console.log("이 작업은 몇 분 정도 소요될 수 있습니다.");

    execSync("npx puppeteer browsers install chrome", {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    console.log("✅ Chrome 설치가 완료되었습니다!");
    return true;
  } catch (error) {
    console.error("❌ Chrome 설치 중 오류가 발생했습니다:", error.message);
    return false;
  }
}

/**
 * 메인 함수
 */
function main() {
  console.log("🔍 Chrome 설치 상태를 확인하고 있습니다...");

  if (!isChromeInstalled()) {
    console.log("⚠️  Chrome이 설치되어 있지 않습니다.");

    if (!installChrome()) {
      console.error(
        "❌ Chrome 설치에 실패했습니다. 서버를 시작할 수 없습니다."
      );
      process.exit(1);
    }
  }

  console.log("🚀 Chrome 준비 완료! 서버를 시작합니다...");
}

// 스크립트가 직접 실행될 때만 main 함수 실행
if (require.main === module) {
  main();
}

module.exports = { isChromeInstalled, installChrome };
