// GTA - Gioco testuale per ORIGAMI BOT
// Comandi: .gta | .gta inizia | .gta profilo | .gta missione | .gta garage | .gta auto | .gta negozio | .gta lavora

const CARS = [
  { id: 'panto', nome: 'Panto', prezzo: 500, emoji: '🚗', velocita: 20 },
  { id: 'sultan', nome: 'Sultan RS', prezzo: 2500, emoji: '🚙', velocita: 45 },
  { id: 'elegy', nome: 'Elegy RH8', prezzo: 8000, emoji: '🏎️', velocita: 70 },
  { id: 'zentorno', nome: 'Zentorno', prezzo: 25000, emoji: '🔥', velocita: 95 },
  { id: 'oppressor', nome: 'Oppressor MK2', prezzo: 60000, emoji: '🛸', velocita: 120 },
]

const MISSIONS = [
  { nome: 'Consegna pizza a Vinewood', ricompensa: 300, xp: 20, rischio: 5, testo: 'Hai consegnato 5 pizze senza farle cadere. Il cliente ti ha lasciato la mancia.' },
  { nome: 'Taxi a Los Santos', ricompensa: 500, xp: 35, rischio: 10, testo: 'Hai fatto il tassista per tutta la notte. Un cliente famoso ti ha pagato extra.' },
  { nome: 'Gara clandestina', ricompensa: 1200, xp: 60, rischio: 25, testo: 'Hai vinto la gara a Vespucci Beach bruciando tutti sul rettilineo finale!' },
  { nome: 'Rapina al negozio', ricompensa: 2500, xp: 90, rischio: 45, testo: 'Colpo riuscito! Sei scappato prima che arrivasse la polizia.' },
  { nome: 'Colpo alla banca', ricompensa: 6000, xp: 150, rischio: 70, testo: 'Colpo da leggenda! Hai svuotato la banca di Paleto Bay e sei sparito.' },
]

const JOBS = [
  { nome: 'Lavapiatti al Burger Shot', paga: 150 },
  { nome: 'Meccanico a Los Santos Customs', paga: 350 },
  { nome: 'Corriere Amazon', paga: 500 },
  { nome: 'Buttafuori al Vanilla Unicorn', paga: 800 },
]

function getPlayer(m) {
  if (!global.db.data.gta) global.db.data.gta = {}
  if (!global.db.data.gta[m.sender]) {
    global.db.data.gta[m.sender] = {
      started: false, soldi: 1000, banca: 0, xp: 0, livello: 1,
      auto: 'panto', garage: ['panto'], ricercato: 0, missioni: 0, ultimoLavoro: 0, ultimaMissione: 0
    }
  }
  return global.db.data.gta[m.sender]
}

function getLivello(xp) { return Math.floor(xp / 200) + 1 }
function barRicercato(n) { return '⭐'.repeat(n) + '☆'.repeat(5 - n) }

let handler = async (m, { conn, text, usedPrefix = '.' }) => {
  const p = getPlayer(m)
  const args = (text || '').trim().toLowerCase().split(/\s+/)
  const cmd = args[0] || ''
  const tag = '@' + m.sender.split('@')[0]

  // MENU
  if (!cmd || cmd === 'menu' || cmd === 'aiuto') {
    return conn.sendMessage(m.chat, {
      text: `╭━━━━━━━🎮━━━━━━━╮\n     *✦ GTA - ORIGAMI CITY ✦*\n╰━━━━━━━🎮━━━━━━━╯\n\n👋 Ciao ${tag}!\n\n*📋 COMANDI:*\n• \`${usedPrefix}gta inizia\` - Inizia a giocare\n• \`${usedPrefix}gta profilo\` - Vedi soldi, livello, auto\n• \`${usedPrefix}gta missione\` - Fai una missione\n• \`${usedPrefix}gta lavora\` - Guadagna soldi\n• \`${usedPrefix}gta garage\` - Vedi le tue auto\n• \`${usedPrefix}gta negozio\` - Compra auto\n• \`${usedPrefix}gta auto <nome>\` - Cambia auto\n• \`${usedPrefix}gta banca\` - Deposita / Preleva\n\n💰 *Soldi iniziali: 1000$*`,
      footer: 'ORIGAMI BOT • GTA',
      buttons: [
        { buttonId: `${usedPrefix}gta inizia`, buttonText: { displayText: '▶️ Inizia' }, type: 1 },
        { buttonId: `${usedPrefix}gta profilo`, buttonText: { displayText: '👤 Profilo' }, type: 1 },
        { buttonId: `${usedPrefix}gta missione`, buttonText: { displayText: '🎯 Missione' }, type: 1 },
        { buttonId: `${usedPrefix}gta negozio`, buttonText: { displayText: '🏪 Negozio' }, type: 1 },
      ],
      headerType: 1, mentions: [m.sender]
    }, { quoted: m })
  }

  // INIZIA
  if (cmd === 'inizia' || cmd === 'start') {
    if (p.started) return conn.sendMessage(m.chat, { text: `⚠️ ${tag} hai già iniziato! Fai \`${usedPrefix}gta profilo\`` , mentions: [m.sender] }, { quoted: m })
    p.started = true
    return conn.sendMessage(m.chat, { text: `🎉 *BENVENUTO A ORIGAMI CITY, ${tag}!*\n\nTi abbiamo dato *1000$* e una *Panto* scassata.\n\nFai \`${usedPrefix}gta missione\` per diventare ricco!\nAttento alla polizia: se il livello ricercato arriva a 5, ti arrestano e perdi soldi!`, mentions: [m.sender] }, { quoted: m })
  }

  if (!p.started) return conn.sendMessage(m.chat, { text: `⚠️ Prima devi iniziare! Scrivi \`${usedPrefix}gta inizia\``, mentions: [m.sender] }, { quoted: m })

  // PROFILO
  if (cmd === 'profilo' || cmd === 'stats') {
    const car = CARS.find(c => c.id === p.auto)
    return conn.sendMessage(m.chat, {
      text: `╭━━━👤 *PROFILO GTA* ━━━╮\n\n🧑 Giocatore: ${tag}\n⭐ Livello: *${getLivello(p.xp)}* (${p.xp} XP)\n💰 Contanti: *${p.soldi}$*\n🏦 Banca: *${p.banca}$*\n${car?.emoji || '🚗'} Auto: *${car?.nome}*\n🚨 Ricercato: *${barRicercato(p.ricercato)}* (${p.ricercato}/5)\n🎯 Missioni: *${p.missioni}*\n🚗 Garage: *${p.garage.length} auto*\n\n╰━━━━━━━━━━━━━━╯`,
      mentions: [m.sender]
    }, { quoted: m })
  }

  // MISSIONE
  if (cmd === 'missione' || cmd === 'missioni') {
    const now = Date.now()
    if (now - p.ultimaMissione < 30000) return conn.sendMessage(m.chat, { text: `⏳ Aspetta ancora *${Math.ceil((30000 - (now - p.ultimaMissione)) / 1000)}s* prima di un'altra missione!`, mentions: [m.sender] }, { quoted: m })
    const miss = MISSIONS[Math.floor(Math.random() * MISSIONS.length)]
    const car = CARS.find(c => c.id === p.auto)
    const bonusAuto = Math.floor(car.velocita / 10) * 10
    const successo = Math.random() * 100 > miss.rischio - bonusAuto

    p.ultimaMissione = now
    if (!successo) {
      p.ricercato = Math.min(5, p.ricercato + 1)
      const multa = Math.min(p.soldi, 300)
      p.soldi -= multa
      if (p.ricercato >= 5) {
        p.ricercato = 0
        const perso = Math.floor(p.soldi * 0.5)
        p.soldi -= perso
        return conn.sendMessage(m.chat, { text: `🚨 *ARRESTATO!*\nLa polizia ti ha beccato durante: *${miss.nome}*\nHai perso *${perso}$* di cauzione e il livello ricercato è tornato a 0.`, mentions: [m.sender] }, { quoted: m })
      }
      return conn.sendMessage(m.chat, { text: `❌ *MISSIONE FALLITA*\n*${miss.nome}*\nSei scappato ma ti hanno multato di *${multa}$*.\n🚨 Ricercato ora: ${barRicercato(p.ricercato)}`, mentions: [m.sender] }, { quoted: m })
    }
    const guadagno = miss.ricompensa + bonusAuto
    p.soldi += guadagno; p.xp += miss.xp; p.missioni++
    p.ricercato = Math.max(0, p.ricercato - 1)
    return conn.sendMessage(m.chat, { text: `✅ *MISSIONE COMPLETATA!*\n\n🎯 *${miss.nome}*\n${miss.testo}\n\n💰 +*${guadagno}$*\n✨ +*${miss.xp} XP*\n⭐ Livello: *${getLivello(p.xp)}*`, mentions: [m.sender] }, { quoted: m })
  }

  // LAVORA
  if (cmd === 'lavora' || cmd === 'lavoro') {
    const now = Date.now()
    if (now - p.ultimoLavoro < 60000) return conn.sendMessage(m.chat, { text: `⏳ Devi riposare! Riprova tra *${Math.ceil((60000 - (now - p.ultimoLavoro)) / 1000)}s*`, mentions: [m.sender] }, { quoted: m })
    const job = JOBS[Math.floor(Math.random() * JOBS.length)]
    p.ultimoLavoro = now; p.soldi += job.paga; p.xp += 10
    p.ricercato = Math.max(0, p.ricercato - 1)
    return conn.sendMessage(m.chat, { text: `💼 *LAVORO: ${job.nome}*\nHai lavorato sodo e hai guadagnato *${job.paga}$*!\n🚨 La polizia ti ha un po' dimenticato.`, mentions: [m.sender] }, { quoted: m })
  }

  // GARAGE
  if (cmd === 'garage') {
    const list = p.garage.map(id => {
      const c = CARS.find(x => x.id === id)
      return `${c.emoji} *${c.nome}* ${id === p.auto ? '✅ in uso' : ''}`
    }).join('\n')
    return conn.sendMessage(m.chat, { text: `🚗 *IL TUO GARAGE*\n\n${list}\n\nPer cambiare auto: \`${usedPrefix}gta auto <nome>\``, mentions: [m.sender] }, { quoted: m })
  }

  // NEGOZIO
  if (cmd === 'negozio' || cmd === 'shop' || cmd === 'auto') {
    if (cmd === 'auto' && args[1]) {
      const want = CARS.find(c => c.id === args[1] || c.nome.toLowerCase().includes(args[1]))
      if (!want) return conn.sendMessage(m.chat, { text: `❌ Auto non trovata. Fai \`${usedPrefix}gta negozio\``, mentions: [m.sender] }, { quoted: m })
      if (!p.garage.includes(want.id)) {
        if (p.soldi < want.prezzo) return conn.sendMessage(m.chat, { text: `❌ Ti servono *${want.prezzo}$*, tu hai *${p.soldi}$*`, mentions: [m.sender] }, { quoted: m })
        p.soldi -= want.prezzo; p.garage.push(want.id)
        return conn.sendMessage(m.chat, { text: `🎉 Hai comprato *${want.emoji} ${want.nome}* per *${want.prezzo}$*!`, mentions: [m.sender] }, { quoted: m })
      }
      p.auto = want.id
      return conn.sendMessage(m.chat, { text: `✅ Ora guidi la *${want.emoji} ${want.nome}*`, mentions: [m.sender] }, { quoted: m })
    }
    const list = CARS.map(c => `${c.emoji} *${c.nome}* - *${c.prezzo}$* - Vel. ${c.velocita} ${p.garage.includes(c.id) ? '✅ posseduta' : ''}`).join('\n')
    return conn.sendMessage(m.chat, { text: `🏪 *CONCESSIONARIO ORIGAMI CITY*\n💰 Tu hai: *${p.soldi}$*\n\n${list}\n\nPer comprare / usare: \`${usedPrefix}gta auto <nome>\`\nEs: \`${usedPrefix}gta auto zentorno\``, mentions: [m.sender] }, { quoted: m })
  }

  // BANCA
  if (cmd === 'banca') {
    const sub = args[1]
    const amount = parseInt(args[2])
    if (sub === 'deposita' && amount > 0) {
      if (p.soldi < amount) return conn.sendMessage(m.chat, { text: `❌ Non hai abbastanza contanti`, mentions: [m.sender] }, { quoted: m })
      p.soldi -= amount; p.banca += amount
      return conn.sendMessage(m.chat, { text: `🏦 Depositati *${amount}$*. Banca: *${p.banca}$*`, mentions: [m.sender] }, { quoted: m })
    }
    if (sub === 'preleva' && amount > 0) {
      if (p.banca < amount) return conn.sendMessage(m.chat, { text: `❌ Non hai abbastanza in banca`, mentions: [m.sender] }, { quoted: m })
      p.banca -= amount; p.soldi += amount
      return conn.sendMessage(m.chat, { text: `💰 Prelevati *${amount}$*. Contanti: *${p.soldi}$*`, mentions: [m.sender] }, { quoted: m })
    }
    return conn.sendMessage(m.chat, { text: `🏦 *BANCA*\nContanti: *${p.soldi}$* | Banca: *${p.banca}$*\n\n• \`${usedPrefix}gta banca deposita 500\`\n• \`${usedPrefix}gta banca preleva 500\``, mentions: [m.sender] }, { quoted: m })
  }

  return conn.sendMessage(m.chat, { text: `❓ Comando non capito. Scrivi \`${usedPrefix}gta\` per il menù`, mentions: [m.sender] }, { quoted: m })
}

handler.help = ['gta']
handler.tags = ['giochi', 'rpg']
handler.command = /^(gta)$/i

export default handler