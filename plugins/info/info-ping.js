import speed from 'performance-now'
import process from 'process'
import { fetchLatestBaileysVersion } from '@whiskeysockets/baileys'

const uptimeFmt = ms => {
  const d = Math.floor(ms / 86400000)
  const h = Math.floor(ms % 86400000 / 3600000)
  const m = Math.floor(ms % 3600000 / 60000)
  return `${d}g ${h}o ${m}m`
}

const formatBytes = bytes => {
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024
    i++
  }
  return `${bytes.toFixed(2)} ${units[i]}`
}

let baileysCache = { value: null, at: 0 }
const BAILEYS_TTL_MS = 6 * 60 * 60 * 1000

let handler = async (m, { conn, usedPrefix }) => {
  const nomeBot = 'ORIGAMI BOT'
  const versioneBot = global.versione || 'N/D'

  const nowB = Date.now()
  if (!baileysCache.value || nowB - baileysCache.at > BAILEYS_TTL_MS) {
    try {
      baileysCache.value = (await fetchLatestBaileysVersion()).version.join('.')
      baileysCache.at = Date.now()
    } catch {
      if (!baileysCache.value) baileysCache = { value: 'N/D', at: Date.now() }
    }
  }
  const baileys = baileysCache.value

  const start = speed()
  try { await conn.readMessages([m.key]) } catch {}
  const latency = (speed() - start).toFixed(2)

  const text = `⚡ *PING ${nomeBot}*\n📡 Ping: *${latency}ms*\n⏳ Uptime: *${uptimeFmt(process.uptime() * 1000)}*\n🏷️ Versione: *${versioneBot}*\n🔧 Baileys: *v${baileys}*\n🤖 RAM Bot: *${formatBytes(process.memoryUsage().rss)}*`

  // --- UNICO MESSAGGIO: PAGAMENTO + BOTTONI DENTRO ---
  // requestPaymentMessage = non eliminabile, visibile a tutti, amount 0 = nessuno paga
  // noteMessage = interactiveMessage con testo + bottoni
  try {
    const msg = {
      requestPaymentMessage: {
        currencyCodeIso4217: 'EUR',
        amount1000: 0,
        requestFrom: m.sender,
        noteMessage: {
          interactiveMessage: {
            body: { text: text },
            footer: { text: nomeBot },
            header: { title: `⚡ PING ${nomeBot}`, subtitle: '', hasMediaAttachment: false },
            nativeFlowMessage: {
              buttons: [
                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔄 Ricalcola', id: `${usedPrefix}ping` }) },
                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⚙️ Stato', id: `${usedPrefix}status` }) },
                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📋 Menu', id: `${usedPrefix}menu` }) }
              ]
            },
            contextInfo: { mentionedJid: [m.sender] }
          }
        },
        expiryTimestamp: 0
      }
    }

    await conn.relayMessage(m.chat, msg, { messageId: m.key.id })

  } catch (e) {
    console.log('Payment+bottoni fallito, mando normale:', e)
    // Fallback: unico messaggio normale con bottoni
    await conn.sendMessage(m.chat, {
      text, footer: nomeBot,
      buttons: [
        { buttonId: `${usedPrefix}ping`, buttonText: { displayText: '🔄 Ricalcola' }, type: 1 },
        { buttonId: `${usedPrefix}status`, buttonText: { displayText: '⚙️ Stato' }, type: 1 },
        { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '📋 Menu' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = /^(ping)$/i

export default handler