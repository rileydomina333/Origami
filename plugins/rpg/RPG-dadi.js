let handler = async (m, { conn, args }) => {
  let bet = parseInt(args[0])
  let user = global.db.data.users[m.sender]

  if (user.money < bet) return m.reply(`💸 Ti servono almeno *${bet} COIN*`)

  let u = Math.floor(Math.random() * 6) + 1
  let b = Math.floor(Math.random() * 6) + 1

  let text

  // 🏆 VITTORIA — ORIGAMI
  if (u > b) {
    user.money += bet
    text = `
🎲 *DADI ORIGAMI*
Tu: ${u} | Bot: ${b}

🏆 Vittoria  
+${bet} COIN

💼 Saldo: *${user.money} COIN*
`.trim()
  }

  // 💀 SCONFITTA — 888
  else if (u < b) {
    user.money -= bet
    text = `
🎲 *DADI ORIGAMI*
Tu: ${u} | Bot: ${b}

💀 Sconfitta  
-${bet} COIN

💼 Saldo: *${user.money} COIN*
`.trim()
  }

  // 😐 PAREGGIO — 888
  else {
    text = `
🎲 *DADI ORIGAMI*
Tu: ${u} | Bot: ${b}

😐 Pareggio

💼 Saldo: *${user.money} COIN*
`.trim()
  }

  await conn.sendMessage(m.chat, {
    text,
    buttons: [
      { buttonId: ".dadi", buttonText: { displayText: "🔁 Gioca di nuovo" }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = /^dadiplay$/i
export default handler