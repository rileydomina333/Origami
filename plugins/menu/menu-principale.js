import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- GIF UNICA PER TUTTO IL MENU ---
const GIF_FILE = 'file_00000000b91881f49cf027960acd8a28.gif';

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
  const botName = 'ORIGAMI BOT';
  const botVersion = global.db?.data?.version || '1.5';
  const menuText = `⚡ *${botName}*\n*VERSIONE*: ${botVersion}\n\n🛡️ *Staff & Moderatori:* ${usedPrefix}mods\n\n📂 *Scorri il carosello e scegli una categoria.*`;

  const mediaDir = path.join(__dirname, '..', '..', 'media');
  const iconsDir = path.join(__dirname, '..', '..', 'icone');

  // Cerca la gif in media/ e poi in icone/
  let gifPath = path.join(mediaDir, GIF_FILE);
  if (!fs.existsSync(gifPath)) gifPath = path.join(iconsDir, GIF_FILE);
  if (!fs.existsSync(gifPath)) gifPath = path.join(__dirname, GIF_FILE);

  let gifBuffer = null;
  try {
    if (fs.existsSync(gifPath)) gifBuffer = fs.readFileSync(gifPath);
  } catch {}

  const cards = MENU_SECTIONS.map(section => ({
    // GIF su tutte le card - Baileys la vuole come video + gifPlayback
    ...(gifBuffer
      ? { video: gifBuffer, gifPlayback: true }
      : { image: Buffer.from([]) }),
    title: section.title,
    text: section.rows.map(({ title, command }) => `${title}\n${usedPrefix}${command}`).join('\n\n'),
    footer: botName,
    buttons: section.rows.map(({ title, command }) => ({
      buttonId: `${usedPrefix}${command}`,
      buttonText: { displayText: title },
      type: 1
    }))
  }));

  const textFallback = `${menuText}\n\n${MENU_SECTIONS.map(({ title, rows }) =>
    `📂 *${title}*\n${rows.map(({ title: rowTitle, command }) => `• ${rowTitle}: ${usedPrefix}${command}`).join('\n')}`
  ).join('\n\n')}`;

  try {
    // Se abbiamo la gif, manda carosello con gif
    if (gifBuffer) {
      return await conn.sendMessage(m.chat, {
        text: menuText,
        footer: botName,
        cards
      }, { quoted: m });
    }
    // Se gif non trovata, manda solo testo
    throw new Error('Gif non trovata');
  } catch (error) {
    console.warn(`[MENU] Carosello non inviato: ${error.message} - Path cercato: ${gifPath}`);
    return conn.sendMessage(m.chat, { text: textFallback }, { quoted: m });
  }
};

handler.help = ['menu'];
handler.tags = ['menu'];
handler.command = /^(menu|comandi|commands|help)$/i;

export default handler;