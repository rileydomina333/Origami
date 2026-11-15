
// 🌿 GIARDINO RPG - ORIGAMI BOT
// Comandi:
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
    desc: 'Rifornisce di acqua'
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

// DATABASE
function getPlayer(m) {
  if (!global.db || !global.db.data)
    throw new Error('Database non inizializzato')

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

  const p = global.db.data.giardino[m.sender]

  // Compatibilità salvataggi precedenti
  if (!p.inventario)
    p.inventario = { acqua: 3, concime: 1, vaso: 0 }

  p.inventario.acqua ??= 0
  p.inventario.concime ??= 0
  p.inventario.vaso ??= 0

  p.piante ||= []
  p.soldi ??= 200
  p.xp ??= 0
  p.raccolti ??= 0
  p.started ??= false

  return p
}

function getLivello(xp) {
  return Math.floor(xp / 150) + 1
}

function maxPiante(p) {
  return 3 + p.inventario.vaso
}

function trovaPianta(nome) {
  return PIANTE.find(x =>
    x.id === nome ||
    x.nome.toLowerCase() === nome
  )
}

let handler = async (m, { conn, text, usedPrefix = '.' }) => {

  const p = getPlayer(m)

  const args = (text || '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  const cmd = args[0] || ''
  const nome = args.slice(1).join(' ')
  const tag = '@' + m.sender.split('@')[0]

  const send = (txt) => conn.sendMessage(m.chat, {
    text: txt,
    mentions: [m.sender]
  }, { quoted: m })

  // MENU
  if (!cmd || cmd === 'menu' || cmd === 'aiuto') {
    return send(
`╭━━━━━━🌿━━━━━━╮
   GIARDINO RPG
╰━━━━━━🌿━━━━━━╯

👋 Ciao ${tag}!

Gestisci il tuo giardino e colleziona piante.

📋 COMANDI

🌱 ${usedPrefix}giardino inizia
👤 ${usedPrefix}giardino profilo
🪴 ${usedPrefix}giardino pianta <nome>
💧 ${usedPrefix}giardino annaffia
💩 ${usedPrefix}giardino concima
🧺 ${usedPrefix}giardino raccogli
🏪 ${usedPrefix}giardino negozio
💰 ${usedPrefix}giardino compra <nome>

💰 200$ iniziali
💧 3 acqua
💩 1 concime`
    )
  }

  // INIZIA
  if (cmd === 'inizia' || cmd === 'start') {
    if (p.started)
      return send('⚠️ Hai già iniziato il gioco!')

    p.started = true

    return send(
`🌱 BENVENUTO NEL GIARDINO!

Hai ricevuto:

💰 200$
💧 3 acqua
💩 1 concime
🪴 3 posti disponibili

Usa ${usedPrefix}giardino negozio per iniziare!`
    )
  }

  if (!p.started)
    return send(`⚠️ Prima inizia con ${usedPrefix}giardino inizia`)

  // PROFILO
  if (cmd === 'profilo') {

    const lista = p.piante.length
      ? p.piante.map((pl, i) => {

          const info = PIANTE.find(x => x.id === pl.id)

          if (!info) return `${i + 1}. ❓ Pianta sconosciuta`

          const tempoTot = pl.concimata
            ? info.tempo * 0.7
            : info.tempo

          const trascorso = Date.now() - pl.piantataIl

          const perc = Math.min(
            100,
            Math.floor(trascorso / tempoTot * 100)
          )

          const pronta =
            perc >= 100 &&
            pl.acquaData >= info.acqua

          return `${i + 1}. ${info.emoji} *${info.nome}*
⭐ ${info.rarita}
${pronta ? '✅ PRONTA!' : `🌱 Crescita: ${perc}%`}
💧 ${pl.acquaData}/${info.acqua}
${pl.concimata ? '💩 Concimata' : 'Non concimata'}`

        }).join('\n\n')
      : '_Non hai ancora piante._'

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

🌱 LE TUE PIANTE

${lista}

╰━━━━━━━━━━━━━━━━╯`
    )
  }

  // NEGOZIO
  if (cmd === 'negozio' || cmd === 'shop') {

    const semi = PIANTE.map(x =>
`${x.emoji} *${x.nome}*
⭐ ${x.rarita}
💰 Prezzo: ${x.prezzoSeme}$
⏳ Tempo: ${x.tempo / 1000}s
💧 Acqua: ${x.acqua}
🪙 Ricompensa: ${x.ricompensa}$
✨ XP: ${x.xp}`
    ).join('\n\n')

    const attrezzi = NEGOZIO.map(x =>
`${x.emoji} *${x.nome}*
💰 ${x.prezzo}$
📝 ${x.desc}`
    ).join('\n\n')

    return send(
`╭━━━━🏪 NEGOZIO ━━━━╮

💰 Portafoglio: ${p.soldi}$

🌱 CATALOGO

${semi}

🧰 ATTREZZI

${attrezzi}

Usa:
${usedPrefix}giardino compra <nome>

╰━━━━━━━━━━━━━━━━╯`
    )
  }

  // COMPRA ATTREZZI
  if (cmd === 'compra' || cmd === 'buy') {

    if (!nome)
      return send('⚠️ Scrivi cosa vuoi comprare!')

    const att = NEGOZIO.find(x =>
      x.id === nome ||
      x.nome.toLowerCase() === nome
    )

    if (att) {

      if (p.soldi < att.prezzo)
        return send(`❌ Servono ${att.prezzo}$! Hai ${p.soldi}$`)

      p.soldi -= att.prezzo

      if (att.id === 'vaso')
        p.inventario.vaso++
      else
        p.inventario[att.id]++

      return send(
`✅ ACQUISTO COMPLETATO!

${att.emoji} ${att.nome}
💰 Spesi: ${att.prezzo}$
💵 Saldo: ${p.soldi}$`
      )
    }

    const pianta = trovaPianta(nome)

    if (!pianta)
      return send('❌ Pianta non trovata! Usa .giardino negozio')

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
⭐ ${pianta.rarita}

💰 Pagato: ${pianta.prezzoSeme}$
💧 Acqua richiesta: ${pianta.acqua}
⏳ Tempo: ${pianta.tempo / 1000}s

Usa ${usedPrefix}giardino annaffia per prendertene cura!`
    )
  }

  // PIANTA
  if (cmd === 'pianta') {

    if (!nome)
      return send('⚠️ Scrivi il nome della pianta!')

    // Gestione diretta senza richiamare handler
    const pianta = trovaPianta(nome)

    if (!pianta)
      return send('❌ Pianta non trovata! Usa .giardino negozio')

    if (p.piante.length >= maxPiante(p))
      return send('❌ Giardino pieno!')

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
`🌱 HAI AGGIUNTO UNA PIANTA!

${pianta.emoji} ${pianta.nome}
⭐ ${pianta.rarita}
💰 Pagato: ${pianta.prezzoSeme}$
💵 Saldo: ${p.soldi}$`
    )
  }

  // ANNAFFIA
  if (['annaffia', 'innaffia', 'acqua'].includes(cmd)) {

    if (!p.piante.length)
      return send('⚠️ Non hai piante!')

    if (p.inventario.acqua <= 0)
      return send('❌ Hai finito l’acqua!')

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

Controlla:
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
`💩 GIARDINO CONCIMATO!

✨ Crescita accelerata del 30%!
💩 Concime rimasto: ${p.inventario.concime}`
    )
  }

  // RACCOGLI
  if (cmd === 'raccogli' || cmd === 'raccolta') {

    if (!p.piante.length)
      return send('⚠️ Non hai piante da raccogliere!')

    let guadagno = 0
    let xp = 0
    let raccolte = 0
    const nomi = []
    const rimaste = []

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
      return send('⏳ Nessuna pianta pronta! Controlla il profilo.')

    p.piante = rimaste
    p.soldi += guadagno
    p.xp += xp
    p.raccolti += raccolte
    p.livello = getLivello(p.xp)

    return send(
`╭━━━━🧺 RACCOLTO ━━━━╮

${nomi.join('\n')}

🌱 Raccolte: ${raccolte}
💰 Guadagno: +${guadagno}$
✨ XP: +${xp}

⭐ Livello: ${p.livello}
💵 Saldo: ${p.soldi}$

╰━━━━━━━━━━━━━━━━╯`
    )
  }

  return send(
`❓ COMANDO NON RICONOSCIUTO!

Usa ${usedPrefix}giardino per vedere il menu.`
  )
}

handler.help = ['giardino']
handler.tags = ['giochi', 'rpg']
handler.command = /^(giardino|orto|garden|gasto|erba)$/i

export default handler
