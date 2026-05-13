require('dotenv').config();

const express = require('express');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const TARGET_URL = process.env.TARGET_URL;
const STATE_FILE = './state.json';
const LOG_FILE = './logs.json';

app.use(express.static('public'));
app.use('/screenshots', express.static('screenshots'));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function getPageData() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    await page.goto(TARGET_URL, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    await page.setViewport({
      width: 1440,
      height: 1200,
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    const content = await page.content();

    return {
      content,
      browser,
      page,
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

function createHash(content) {
  return crypto
    .createHash('md5')
    .update(content)
    .digest('hex');
}

async function loadState() {
  const exists = await fs.pathExists(STATE_FILE);

  if (!exists) {
    return null;
  }

  return fs.readJson(STATE_FILE);
}

async function saveState(hash) {
  await fs.writeJson(STATE_FILE, {
    hash,
    updatedAt: new Date().toISOString(),
  });
}

async function addLog(type, message, screenshot = null) {
  const exists = await fs.pathExists(LOG_FILE);

  let logs = [];

  if (exists) {
    logs = await fs.readJson(LOG_FILE);
  }

  logs.unshift({
    type,
    message,
    screenshot,
    time: new Date().toISOString(),
  });

  logs = logs.slice(0, 50);

  await fs.writeJson(LOG_FILE, logs, {
    spaces: 2,
  });
}

async function sendNotification(oldHash, newHash) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.NOTIFY_EMAIL,
    subject: 'Takachiho Website Updated',
    text: `
The Takachiho reservation website has changed.

Website:
${TARGET_URL}

Previous Hash:
${oldHash}

New Hash:
${newHash}

Check the dashboard for details.
    `,
  });
}

async function monitorWebsite() {
  console.log('Checking website...');

  try {
    const result = await getPageData();

    const hash = createHash(result.content);

    const previous = await loadState();

    if (!previous) {
      await saveState(hash);

      await addLog(
        'startup',
        'Initial website state saved'
      );

      await result.browser.close();

      return;
    }

    if (previous.hash !== hash) {
      console.log('Website updated');

      const filename = `change-${Date.now()}.png`;
      const screenshotPath = path.join(
        __dirname,
        'screenshots',
        filename
      );

      await fs.ensureDir('screenshots');

      await result.page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      await sendNotification(previous.hash, hash);

      await addLog(
        'change',
        'Website update detected',
        `/screenshots/${filename}`
      );

      await saveState(hash);
    } else {
      await addLog(
        'check',
        'No changes detected'
      );
    }

    await result.browser.close();
  } catch (error) {
    console.error(error);

    await addLog(
      'error',
      error.message
    );
  }
}

app.get('/api/status', async (req, res) => {
  const stateExists = await fs.pathExists(STATE_FILE);

  let state = null;

  if (stateExists) {
    state = await fs.readJson(STATE_FILE);
  }

  const logsExist = await fs.pathExists(LOG_FILE);

  let logs = [];

  if (logsExist) {
    logs = await fs.readJson(LOG_FILE);
  }

  res.json({
    target: TARGET_URL,
    monitoring: true,
    interval: '2 minutes',
    email: process.env.NOTIFY_EMAIL,
    state,
    logs,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  monitorWebsite();

  cron.schedule('*/2 * * * *', async () => {
    await monitorWebsite();
  });
});
