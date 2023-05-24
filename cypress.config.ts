import { defineConfig } from 'cypress'
import * as path from 'path'
import { spawn } from 'node:child_process'

export default defineConfig({
  env: {
    NODE_ENV: 'cypress',
    reactDevtools: true,
  },

  component: {
    viewportHeight: 1200,
    viewportWidth: 1200,
    video: false,
    supportFile: false,
    indexHtmlFile: '/',
    async devServer({ specs, cypressConfig, devServerEvents }) {
      const rspackProcess = spawn('pnpm', ['rspack', 'dev'], {
        stdio: 'inherit',
        env: {
          NODE_ENV: 'development',
          CYPRESS: '1',
          ...process.env,
        },
        cwd: process.cwd(),
      })
      console.log('root', cypressConfig.repoRoot, cypressConfig.indexHtmlFile)

      return new Promise((resolve, reject) => {
        if (rspackProcess.stderr) {
          console.error('error', rspackProcess.stderr)
          reject(rspackProcess.stderr)
        }

        resolve({
          port: 3003,
          close() {
            rspackProcess.kill(0)
          },
        })
      })
    },
    experimentalSingleTabRunMode: true,
    experimentalSourceRewriting: true,
    experimentalMemoryManagement: true,
    specPattern: '**/*.cy.spec.{js,jsx,ts,tsx}',
    setupNodeEvents(on, _config) {
      on('before:browser:launch', (browser, launchOptions) => {
        // only load React DevTools extension when opening Chrome in interactive mode
        if (browser.family === 'chromium' && browser.isHeaded) {
          // we could also restrict the extension to only load when browser.isHeaded is true
          const extensionFolder = path.resolve(__dirname, '..', '..', '4.2.1_0')

          launchOptions.args.push(extensionFolder)

          return launchOptions
        }
      })
    },
  },

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})
