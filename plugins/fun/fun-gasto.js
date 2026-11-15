
// 🌿 GIARDINO DI MARJUANA - ORIGAMI BOT
// .giardino
// .giardino inizia
// .giardino profilo
// .giardino pianta <nome>
// .giardino annaffia
// .giardino concima
// .giardino raccogli
// .giardino negozio
// .giardino compra <nome>

const PIANTE = [
  {
    id: 'purplehaze',
    nome: 'Purple Haze',
    emoji: '🟣',
    rarita: 'Epica',
    prezzoSeme: 120,
    tempo: 180000,
    ricompensa: 350,
    xp: 50,
    acqua: 3
  },
  {
    id: 'bluedream',
    nome: 'Blue Dream',
    emoji: '🔵',
    rarita: 'Rara',
    prezzoSeme: 80,
    tempo: 120000,
    ricompensa: 220,
    xp: 30,
    acqua: 2
  },
  {
    id: 'whitewidow',
    nome: 'White Widow',
    emoji: '⚪',
    rarita: 'Epica',
    prezzoSeme: 150,
    tempo: 210000,
    ricompensa: 420,
    xp: 60,
    acqua: 3
  },
  {
    id: 'northernlights',
    nome: 'Northern Lights',
    emoji: '🌌',
    rarita: 'Leggendaria',
    prezzoSeme: 250,
    tempo: 300000,
    ricompensa: 800,
    xp: 100,
    acqua: 4
  },
  {
    id: 'greenphantom',
    nome: 'Green Phantom',
    emoji: '👻',
    rarita: 'Rara',
    prezzoSeme: 100,
    tempo: 150000,
    ricompensa: 280,
    xp: 40,
    acqua: 3
  },
  {
    id: 'blackdiamond',
    nome: 'Black Diamond',
    emoji: '💎',
    rarita: 'Leggendaria',
    prezzoSeme: 300,
    tempo: 360000,
    ricompensa: 1000,
    xp: 130,
    acqua: 4
  },
  {
    id: 'goldenkush',
    nome: 'Golden Kush',
    emoji: '🟡',
    rarita: 'Epica',
    prezzoSeme: 180,
    tempo: 240000,
    ricompensa: 550,
    xp: 75,
    acqua: 3
  },
  {
    id: 'emeraldog',
    nome: 'Emerald OG',
    emoji: '💚',
    rarita: 'Mitica',
    prezzoSeme: 450,
    tempo: 480000,
    ricompensa: 1600,
    xp: 200,
    acqua: 5
  }
]

const NEGOZIO = [
  {
    id: 'acqua',
    nome: 'Annaffiatoio',
    emoji: '💧',
    prezzo: 100,
    desc: 'Serve per annaffiare'
  },
  {
    id: 'concime',
    nome: 'Concime Bio',
    emoji: '💩',
    prezzo: 80,
    desc: 'Velocizza la crescita del 30%'
  },
  {
    id: 'vaso',
    nome: 'Vaso Extra',
    emoji: '🪴',
    prezzo: 200,
    desc: '+1 posto nel giardino'
  }
]

function getPlayer(m) {
  if (!global.db.data.giardino)
    global.db.data.giardino = {}

  if (!global.db.data.giardino[m.sender]) {
    global.db.data.giardino[m.sender] = {
      started: false,
      soldi: 200,
      xp: 0,
      livello: 1,
      inventario: {
        acqua: 3,
        concime: 1,
        vaso: 0
      },
      piante: [],
      raccolti: 0
    }
  }

  return global.db.data.giardino[m.sender]
}

function getLivello(xp) {
  return Math.floor(xp / 150) + 1
}

function maxPiante(p) {
  return 3 + (p.inventario.vaso || 0)
}

let handler = async (m, { conn, text, usedPrefix = '.' }) => {
  const p = getPlayer(m)
  const args = (text || '').trim().toLowerCase().split(/\s+/)
  const cmd = args[0] || ''
  const tag = '@' + m.sender.split('@')[0]

  const send = (txt) => conn.sendMessage(m.chat, {
    text: txt,
    mentions: [m.sender]
  }, { quoted: m })

  // MENU
  if (!cmd || cmd === 'menu' || cmd === 'aiuto') {
    return send(
`╭━━━━━━🌿━━━━━━╮
   ✦ GIARDINO ✦
╰━━━━━━🌿━━━━━━╯

👋 Ciao ${tag}!

Gestisci il tuo giardino, colleziona varietà, guadagna soldi e sali di livello!

📋 COMANDI:

🌱 ${usedPrefix}giardino inizia
👤 ${usedPrefix}giardino profilo
🪴 ${usedPrefix}giardino pianta <nome>
💧 ${usedPrefix}giardino annaffia
💩 ${usedPrefix}giardino concima
🧺 ${usedPrefix}giardino raccogli
🏪 ${usedPrefix}giardino negozio
💰 ${usedPrefix}giardino compra <nome>

💰 Inizi con 200$
💧 3 acqua
💩 1 concime`
    )
  }

  // INIZIA
  if (cmd === 'inizia' || cmd === 'start') {
    if (p.started)
      return send('⚠️ Hai già iniziato!')

    p.started = true

    return send(
`🌱 BENVENUTO NEL TUO GIARDINO!

Hai ricevuto:
💰 200$
💧 3 acqua
💩 1 concime

Usa:
${usedPrefix}giardino negozio

Per vedere tutte le varietà disponibili!`
    )
  }

  if (!p.started)
    return send(`⚠️ Prima inizia con ${usedPrefix}giardino inizia`)

  // PROFILO
  if (cmd === 'profilo') {
    const lista = p.piante.length === 0
      ? '_Nessuna pianta nel giardino._'
      : p.piante.map((pl, i) => {
          const info = PIANTE.find(x => x.id === pl.id)
          if (!info) return ''

          const tempoTot = pl.concimata
            ? info.tempo * 0.7
            : info.tempo

          const trascorso = Date.now() - pl.piantataIl
          const perc = Math.min(
            100,
            Math.floor(trascorso / tempoTot * 100)
          )

          const pronta =
            perc >= 100 && pl.acquaData >= info.acqua

          return `${i + 1}. ${info.emoji} *${info.nome}*
   ⭐ ${info.rarita}
   ${pronta ? '✅ PRONTA!' : `🌱 Crescita: ${perc}%`}
   💧 ${pl.acquaData}/${info.acqua}
   ${pl.concimata ? '💩 Concimata' : 'Senza concime'}`
        }).join('\n\n')

    return send(
`╭━━━━🌿 GIARDINO ━━━━╮

👤 ${tag}
⭐ Livello: ${getLivello(p.xp)}
✨ XP: ${p.xp}
💰 Soldi: ${p.soldi}$
🧺 Raccolti: ${p.raccolti}

💧 Acqua: ${p.inventario.acqua}
💩 Concime: ${p.inventario.concime}
🪴 Posti: ${p.piante.length}/${maxPiante(p)}

🌱 LE TUE PIANTE:

${lista}

╰━━━━━━━━━━━━━━━━╯`
    )
  }

  // NEGOZIO
  if (cmd === 'negozio' || cmd === 'shop') {
    const semi = PIANTE.map(x =>
      `${x.emoji} *${x.nome}*
⭐ Rarità: ${x.rarita}
💰 Seme: ${x.prezzoSeme}$
⏳ Tempo: ${x.tempo / 1000}s
💧 Acqua: ${x.acqua}
🪙 Ricompensa: ${x.ricompensa}$
✨ XP: ${x.xp}`
    ).join('\n\n')

    const attrezzi = NEGOZIO.map(x =>
      `${x.emoji} *${x.nome}* - ${x.prezzo}$\n${x.desc}`
    ).join('\n\n')

    return send(
`╭━━━━🏪 NEGOZIO ━━━━╮

💰 Portafoglio: ${p.soldi}$

🌱 VARIETÀ DISPONIBILI:

${semi}

🧰 ATTREZZI:

${attrezzi}

Per acquistare:
${usedPrefix}giardino compra <nome>

╰━━━━━━━━━━━━━━━━╯`
    )
  }

  // COMPRA
  if (cmd === 'compra' || cmd === 'buy') {
    const want = args.slice(1).join(' ')

    if (!want)
      return send('⚠️ Scrivi il nome di quello che vuoi comprare.')

    const att = NEGOZIO.find(x =>
      x.id === want || x.nome.toLowerCase() === want
    )

    if (att) {
      if (p.soldi < att.prezzo)
        return send(`❌ Servono ${att.prezzo}$! Hai ${p.soldi}$`)

      p.soldi -= att.prezzo

      if (att.id === 'vaso')
        p.inventario.vaso++
      else
        p.inventario[att.id] =
          (p.inventario[att.id] || 0) + 1

      return send(`✅ Comprato ${att.emoji} ${att.nome}!`)
    }

    const pianta = PIANTE.find(x =>
      x.id === want || x.nome.toLowerCase() === want
    )

    if (!pianta)
      return send('❌ Pianta non trovata!')

    if (p.piante.length >= maxPiante(p))
      return send('❌ Giardino pieno! Compra un vaso extra.')

    if (p.soldi < pianta.prezzoSeme)
      return send(`❌ Servono ${pianta.prezzoSeme}$!`)

    p.soldi -= pianta.prezzoSeme

    p.piante.push({
      id: pianta.id,
      piantataIl: Date.now(),
      acquaData: 0,
      concimata: false
    })

    return send(
`🌱 NUOVA PIANTA!

${pianta.emoji} *${pianta.nome}*
⭐ Rarità: ${pianta.rarita}

💧 Annaffiature richieste: ${pianta.acqua}
⏳ Tempo: ${pianta.tempo / 1000}s

Usa ${usedPrefix}giardino annaffia per prendertene cura!`
    )
  }

  // PIANTA
  if (cmd === 'pianta') {
    const want = args.slice(1).join(' ')
    if (!want) return send('⚠️ Scrivi il nome della pianta!')

    return handler(m, {
      conn,
      text: `compra ${want}`,
      usedPrefix
    })
  }

  // ANNAFFIA
  if (['annaffia', 'innaffia', 'acqua'].includes(cmd)) {
    if (!p.piante.length)
      return send('⚠️ Non hai piante!')

    if (p.inventario.acqua <= 0)
      return send('❌ Acqua terminata! Comprala nel negozio.')

    const daAnnaffiare = p.piante.filter(pl => {
      const info = PIANTE.find(x => x.id === pl.id)
      return info && pl.acquaData < info.acqua
    })

    if (!daAnnaffiare.length)
      return send('💧 Tutte le piante hanno già ricevuto l’acqua necessaria!')

    p.inventario.acqua--

    for (const pl of daAnnaffiare)
      pl.acquaData++

    return send(
`💧 ANNAFFIATURA COMPLETATA!

🌱 Piante annaffiate: ${daAnnaffiare.length}
💧 Acqua rimasta: ${p.inventario.acqua}

Controlla il tuo giardino con:
${usedPrefix}giardino profilo`
    )
  }

  // CONCIMA
  if (cmd === 'concima' || cmd === 'concime') {
    if (!p.piante.length)
      return send('⚠️ Non hai piante!')

    if (p.inventario.concime <= 0)
      return send('❌ Concime terminato!')

    const daConcimare = p.piante.filter(pl => !pl.concimata)

    if (!daConcimare.length)
      return send('💩 Tutte le piante sono già concimate!')

    p.inventario.concime--

    for (const pl of daConcimare)
      pl.concimata = true

    return send(
'💩 GIARDINO CONCIMATO!\n\n✨ Crescita più veloce del 30%!'
    )
  }

  // RACCOGLI
  if (cmd === 'raccogli' || cmd === 'raccolta') {
    if (!p.piante.length)
      return send('⚠️ Non hai piante da raccogliere!')

    let guadagno = 0
    let xp = 0
    let raccolte = 0
    let nomi = []
    let rimaste = []

    for (const pl of p.piante) {
      const info = PIANTE.find(x => x.id === pl.id)

      if (!info) continue

      const tempoTot = pl.concimata
        ? info.tempo * 0.7
        : info.tempo

      const pronta =
        Date.now() - pl.piantataIl >= tempoTot &&
        pl.acquaData >= info.acqua

      if (pronta) {
        guadagno += info.ricompensa
        xp += info.xp
        raccolte++

        nomi.push(`${info.emoji} ${info.nome}`)
      } else {
        rimaste.push(pl)
      }
    }

    if (!raccolte)
      return send('⏳ Nessuna pianta è ancora pronta! Controlla il profilo.')

    p.piante = rimaste
    p.soldi += guadagno
    p.xp += xp
    p.raccolti += raccolte
    p.livello = getLivello(p.xp)

    return send(
`╭━━━━🧺 RACCOLTO ━━━━╮

${nomi.join('\n')}

🌱 Piante raccolte: ${raccolte}
💰 Guadagno: +${guadagno}$
✨ XP guadagnati: +${xp}

⭐ Livello: ${p.livello}
💰 Saldo: ${p.soldi}$

╰━━━━━━━━━━━━━━━━╯`
    )
  }

  return send(`❓ Comando sconosciuto!\nUsa ${usedPrefix}giardino`)
}

handler.help = ['gasto']
handler.tags = ['giochi', 'rpg']
handler.command = /^(gasto|erba|garden)$/i

export default handler
