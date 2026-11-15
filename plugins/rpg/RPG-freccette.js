//Plugin by Elixir, Punisher & 888 staff — Grafica Premium 888

let handler = async (m, { conn, args, command }) => {

  let user = global.db.data.users[m.sender]
  if (!user) return

  // ───────────────────────────────
  // 🎯 MENU FRECCETTE — 888
  // ───────────────────────────────
  if (command === "freccette") {

    let money = user.money || 0
    const bet = (x) => money >= x ? `.freccetteplay ${x}` : `no_${x}`

    return conn.sendMessage(m.chat, {
      text: `
🎯 *FRECCETTE ORIGAMI*
💰 Portafoglio: *${money} COIN*

Colpisci il bersaglio:
più punti fai, più vinci.
`.trim(),
      buttons: [
        { buttonId: bet(100),   buttonText: { displayText: "💵 100 COIN" }, type: 1 },
        { buttonId: bet(200),   buttonText: { displayText: "💵 200 COIN" }, type: 1 },
        { buttonId: bet(500),   buttonText: { displayText: "💰 500 COIN" }, type: 1 },
        { buttonId: bet(1000),  buttonText: { displayText: "💰 1000 COIN" }, type: 1 },
        { buttonId: bet(10000), buttonText: { displayText: "💎 10000 COIN" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  // ───────────────────────────────
  // 🎯 GIOCO FRECCETTE — 888
  // ───────────────────────────────
  if (command === "freccetteplay") {

    let bet = parseInt(args[0])
    let money = user.money || 0

    if (!bet || bet < 50) return m.reply("💸 Puntata minima: *50 COIN*")
    if (money < bet) return m.reply(`💸 Ti servono almeno *${bet} COIN*`)

    user.money -= bet

    await conn.sendMessage(m.chat, { text: "🎯 Lancio della freccetta..." }, { quoted: m })
    await new Promise(r => setTimeout(r, 2000))

    let score = Math.floor(Math.random() * 61)
    let win = 0

    let text = `
🎯 *FRECCETTA ORIGAMI*
Punteggio: *${score}*
`.trim() + "\n\n"

    if (score >= 50) {
      win = bet * 2
      text += `🎯 *BULLSEYE!*\n💰 Vinci *${win} COIN*`
    } else if (score >= 30) {
      win = Math.floor(bet * 1.5)
      text += `🙂 *Buon tiro*\n💰 Vinci *${win} COIN*`
    } else {
      text += `💀 *Tiro pessimo*\nHai perso *${bet} COIN*`
    }

    user.money += win

    return conn.sendMessage(m.chat, {
      text,
      buttons: [
        { buttonId: ".freccette", buttonText: { displayText: "🎯 Gioca di nuovo" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }
}

handler.command = /^(freccette|freccetteplay)$/i
export default handler