let handler = async (m, { conn, args, command }) => {

  global.cavalli = global.cavalli || {}

  let user = global.db.data.users[m.sender]
  if (!user) global.db.data.users[m.sender] = { money: 0 }

  // ───────────────────────────────
  // 🐎 MENU PUNTATE — 888
  // ───────────────────────────────
  if (command === "cavalli") {
    let money = user.money || 0

    const bet = (x) => money >= x ? `.cavalliplay ${x}` : `no_money`

    return conn.sendMessage(m.chat, {
      text: `
🐎 *CAVALLI ORIGAMI*
💰 Portafoglio: *${money} COIN*

Scegli la puntata:
`.trim(),
      buttons: [
        { buttonId: bet(100),   buttonText: { displayText: "100 COIN" }, type: 1 },
        { buttonId: bet(200),   buttonText: { displayText: "200 COIN" }, type: 1 },
        { buttonId: bet(500),   buttonText: { displayText: "500 COIN" }, type: 1 },
        { buttonId: bet(1000),  buttonText: { displayText: "1000 COIN" }, type: 1 },
        { buttonId: bet(10000), buttonText: { displayText: "10000 COIN" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  // ───────────────────────────────
  // 🎯 SCELTA CAVALLO — 888
  // ───────────────────────────────
  if (command === "cavalliplay") {
    let bet = parseInt(args[0])

    if (!bet || bet < 50) return m.reply("💸 Puntata minima: *50 COIN*")
    if (user.money < bet) return m.reply(`💸 Ti servono almeno *${bet} COIN*`)

    global.cavalli[m.sender] = { bet }

    return conn.sendMessage(m.chat, {
      text: `
🐎 *CAVALLI ORIGAMI*
🎯 Scegli il cavallo
💰 Puntata: *${bet} COIN*

1️⃣ Jonny  
2️⃣ Dav  
3️⃣ Franco
`.trim(),
      buttons: [
        { buttonId: ".cavallo 1", buttonText: { displayText: "🐎 Riley" }, type: 1 },
        { buttonId: ".cavallo 2", buttonText: { displayText: "🐎 Gasto" }, type: 1 },
        { buttonId: ".cavallo 3", buttonText: { displayText: "🐎 Joe" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  // ───────────────────────────────
  // 🏆 RISULTATO CORSA — 888
  // ───────────────────────────────
  if (command === "cavallo") {
    let scelta = parseInt(args[0])
    let game = global.cavalli[m.sender]

    if (!game) return m.reply("❌ Devi prima usare *.cavalli*")
    if (![1,2,3].includes(scelta)) return m.reply("❌ Scelta non valida")

    const cavalli = { 1: "Jonny", 2: "Dav", 3: "Franco" }
    const vincitore = Math.floor(Math.random() * 3) + 1
    const nomeVincitore = cavalli[vincitore]

    let text

    if (scelta === vincitore) {
      user.money += game.bet * 2
      text = `
🐎 *CAVALLI ORIGAMI*
🏆 Vincitore: *${nomeVincitore}*
💰 Guadagno: +${game.bet * 2} COIN

💼 Saldo: *${user.money} COIN*
`.trim()
    } else {
      user.money -= game.bet
      text = `
🐎 *CAVALLI ORIGAMI*
🏆 Vincitore: *${nomeVincitore}*
💀 Perso: -${game.bet} COIN

💼 Saldo: *${user.money} COIN*
`.trim()
    }

    delete global.cavalli[m.sender]

    return conn.sendMessage(m.chat, {
      text,
      buttons: [
        { buttonId: ".cavalli", buttonText: { displayText: "🔁 Gioca di nuovo" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

}

handler.command = /^(cavalli|cavalliplay|cavallo)$/i
export default handler