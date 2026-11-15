import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MENU_SECTIONS = [
  {
    title: 'MENU PRINCIPALE',
    rows: [
      { title: '⚙️ 𝐅𝐮𝐧𝐳𝐢𝐨𝐧𝐢', command: 'funzioni' },
      { title: '🛡️ 𝐌𝐨𝐝𝐞𝐫𝐚𝐭𝐨𝐫𝐢', command: 'mods' },
      { title: '👑 𝐀𝐝𝐦𝐢𝐧', command: 'admin' },
    ],
  },
  {
    title: 'GIOCHI, RPG E AUDIO',
    rows: [
      { title: '🎮 𝐆𝐢𝐨𝐜𝐡𝐢', command: 'giochi' },
      { title: '🎰 𝐑𝐏𝐆', command: 'rpg' },
      { title: '🎵 𝐀𝐮𝐝𝐢𝐨', command: 'menuaudio' },
    ],
  },
  {
    title: 'STATS E OWNER',
    rows: [
      { title: '📊 𝐒𝐭𝐚𝐭𝐬', command: 'modstats' },
      { title: '🔐 𝐎𝐰𝐧𝐞𝐫', command: 'owner' },
    ],
  },
];

const handler = async (m, { conn, usedPrefix = '.' }) => {
  const botName = global.db?.data?.nomedelbot || 'ORIGAMI BOT';
  const botVersion = global.db?.data?.version || '1.5';

  const menuText = `⚡ *${botName}*
*VERSIONE*: ${botVersion}

🛡️ *Staff & Moderatori:* ${usedPrefix}mods

📂 *Scorri il carosello e scegli una categoria.*`;

  const mediaDir = path.join(__dirname, '..', '..', 'media');

  // GIF ANIMATA ORIGAMI BOT
  const gifPath = path.join(
    mediaDir,
    'file_00000000b91881f49cf027960acd8a28.gif'
  );

  if (!fs.existsSync(gifPath)) {
    throw new Error('GIF ORIGAMI BOT non trovata nella cartella media!');
  }

  const gifBuffer = fs.readFileSync(gifPath);

  const cards = MENU_SECTIONS.map(section => ({
    video: gifBuffer,
    gifPlayback: true,
    title: section.title,
    text: section.rows
      .map(({ title, command }) =>
        `${title}\n${usedPrefix}${command}`
      )
      .join('\n\n'),
    footer: botName,
    buttons: section.rows.map(({ title, command }) => ({
      buttonId: `${usedPrefix}${command}`,
      buttonText: { displayText: title },
      type: 1
    }))
  }));

  const textFallback = `${menuText}

${MENU_SECTIONS.map(({ title, rows }) =>
  `📂 *${title}*\n${rows.map(({ title, command }) =>
    `• ${title}: ${usedPrefix}${command}`
  ).join('\n')}`
).join('\n\n')}`;

  try {
    return await conn.sendMessage(m.chat, {
      text: menuText,
      footer: botName,
      cards
    }, { quoted: m });

  } catch (error) {
    console.warn(`[MENU] Carosello non inviato: ${error.message}`);

    return conn.sendMessage(
      m.chat,
      { text: textFallback },
      { quoted: m }
    );
  }
};

handler.help = ['menu'];
handler.tags = ['menu'];
handler.command = /^(menu|comandi|commands|help)$/i;

export default handler;