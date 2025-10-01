name: e2e

on:
  push:
  workflow_dispatch:
  schedule:
    - cron: "0 18 * * *"   # 毎日 03:00 JST

jobs:
  run:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: |
          npm ci || npm i

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        env:
          TEST_URL: ${{ secrets.TEST_URL }}
        run: npx playwright test --reporter=list

      - name: Upload HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report
          retention-days: 7
