let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  let money = user.money || 0

  const bet = (x) => money >= x ? `.slotplay ${x}` : `no_${x}`

  const text = `
🎰 *ORIGAMI SLOT*
💰 Portafoglio: *${money} COIN*

Scegli l'importo da puntare:
`.trim()

  await conn.sendMessage(m.chat, {
    text,
    buttons: [
      { buttonId: bet(100), buttonText: { displayText: "100 COIN" }, type: 1 },
      { buttonId: bet(200), buttonText: { displayText: "200 COIN" }, type: 1 },
      { buttonId: bet(500), buttonText: { displayText: "500 COIN" }, type: 1 },
      { buttonId: bet(1000), buttonText: { displayText: "1000 COIN" }, type: 1 },
      { buttonId: bet(10000), buttonText: { displayText: "10000 COIN" }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = /^slot$/i
export default handler