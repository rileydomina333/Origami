let handler = async (m, { conn }) => {
  let gruppi = 0
  try {
    gruppi = Object.keys(await conn.groupFetchAllParticipating()).length
  } catch {
    gruppi = Object.keys(global.db?.data?.chats || {}).filter(j => j.endsWith('@g.us')).length
  }

  const plugins = Object.keys(global.plugins || {}).length

  const txt =
`⚡ *888 BOT — Sistema Ufficiale*
Benvenuto nel pannello principale.

✨ *Pannello Informazioni Origami* ✨

👑 *Creatore:*
• https://wa.me/639552686323

🤖 *Nome Bot:* ORIGAMI BOT
📦 *Versione:* 1.00

📡 *Stato:* Online
👥 *Gruppi:* ${gruppi}
🧩 *Plugins:* ${plugins}

📜 *Comandi:* Usa .menu per vedere la lista completa`

  await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
}

handler.help = ['infobot']
handler.tags = ['info']
handler.command = /^(infobot|info888)$/i

export default handler