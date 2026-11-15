// 🧟 RESIDENT EVIL - ORIGAMI BOT
// .residentevil
// .residentevil inizia
// .residentevil profilo
// .residentevil mappa
// .residentevil vai <nord/sud/est/ovest>
// .residentevil spara
// .residentevil ricarica
// .residentevil raccogli
// .residentevil usa erba
// .residentevil scappa

const STANZE = {
  ingresso: { nome: 'Ingresso Villa', desc: 'Atrio buio, sangue sul pavimento. Si sente un rumore...', nord: 'corridoio', sud: null, est: 'cucina', ovest: 'biblioteca', zombie: 0, oggetto: null },
  corridoio: { nome: 'Corridoio', desc: 'Corridoio lungo e stretto. Le luci lampeggiano.', nord: 'camera', sud: 'ingresso', est: 'bagno', ovest: null, zombie: 1, oggetto: 'chiave' },
  cucina: { nome: 'Cucina', desc: 'Pentole cadute, odore di marcio. Qualcosa si muove.', nord: null, sud: null, est: null, ovest: 'ingresso', zombie: 1, oggetto: 'erba' },
  biblioteca: { nome: 'Biblioteca', desc: 'Libri ovunque. C’è un diario insanguinato.', nord: null, sud: null, est: 'ingresso', ovest: null, zombie: 0, oggetto: 'munizioni' },
  bagno: { nome: 'Bagno', desc: 'Specchio rotto. Acqua rossa nel lavandino.', nord: null, sud: null, est: null, ovest: 'corridoio', zombie: 1, oggetto: 'erba' },
  camera: { nome: 'Camera da Letto', desc: 'Letto distrutto. La porta di uscita è qui!', nord: 'uscita', sud: 'corridoio', est: null, ovest: null, zombie: 2, oggetto: 'chiave' },
  uscita: { nome: 'Porta Uscita', desc: 'PORTA VERDE - Ti serve 3 chiavi per scappare!', nord: null, sud: 'camera', est: null, ovest: null, zombie: 0, oggetto: 'porta' },
}

function getPlayer(m) {
  if (!global.db.data.residentevil) global.db.data.residentevil = {}
  if (!global.db.data.residentevil[m.sender]) {
    global.db.data.residentevil[m.sender] = {
      started: false,
      vita: 100,
      proiettili: 12,
      maxProiettili: 12,
      chiavi: 0,
      erbe: 0,
      kill: 0,
      stanza: 'ingresso',
      zombieInStanza: 0,
      stanzeVisitate: ['ingresso'],
      finito: false
    }
  }
  return global.db.data.residentevil[m.sender]
}

function getZombieInStanza(p) {
  let stanza = STANZE[p.stanza]
  // zombie persistenti per giocatore: usiamo un seed semplice
  // se non l'abbiamo ancora impostato, lo prendiamo dalla mappa
  if (p._zombieMap === undefined) p._zombieMap = {}
  if (p._zombieMap[p.stanza] === undefined) p._zombieMap[p.stanza] = stanza.zombie
  return p._zombieMap[p.stanza]
}
function setZombieInStanza(p, n) {
  if (!p._zombieMap) p._zombieMap = {}
  p._zombieMap[p.stanza] = n
}
function getOggettoInStanza(p) {
  if (!p._oggettiMap) p._oggettiMap = {}
  if (p._oggettiMap[p.stanza] === undefined) p._oggettiMap[p.stanza] = STANZE[p.stanza].oggetto
  return p._oggettiMap[p.stanza]
}
function setOggettoInStanza(p, v) {
  if (!p._oggettiMap) p._oggettiMap = {}
  p._oggettiMap[p.stanza] = v
}

let handler = async (m, { conn, text, usedPrefix = '.' }) => {
  const p = getPlayer(m)
  const args = (text || '').trim().toLowerCase().split(/\s+/)
  const cmd = args[0] || ''
  const arg2 = args[1] || ''
  const tag = '@' + m.sender.split('@')[0]

  const send = (txt) => conn.sendMessage(m.chat, { text: txt, mentions: [m.sender] }, { quoted: m })

  // MENU
  if (!cmd || cmd === 'menu' || cmd === 'aiuto') {
    return send(
`╭━━━━━🧟━━━━━╮
   ✦ RESIDENT EVIL ✦
╰━━━━━🧟━━━━━╯

👋 Ciao ${tag}!
Sei intrappolato nella Stazione di recoon city.
Trova 3 chiavi e scappa dalla porta verde!

📋 COMANDI:
🧟 ${usedPrefix}residentevil inizia
👤 ${usedPrefix}residentevil profilo
🗺️ ${usedPrefix}residentevil mappa
🚶 ${usedPrefix}residentevil vai <nord/sud/est/ovest>
🔫 ${usedPrefix}residentevil spara
🔄 ${usedPrefix}residentevil ricarica
🎒 ${usedPrefix}residentevil raccogli
🌿 ${usedPrefix}residentevil usa erba
🚪 ${usedPrefix}residentevil scappa

❤️ Inizi con 100 vita
🔫 12 proiettili
🧟 Gli zombie ti attaccano se resti nella stanza!`
    )
  }

  // INIZIA
  if (cmd === 'inizia' || cmd === 'start') {
    if (p.started && !p.finito) return send('⚠️ Hai già iniziato! Fai `.residentevil profilo`')
    // reset
    p.started = true
    p.finito = false
    p.vita = 100
    p.proiettili = 12
    p.chiavi = 0
    p.erbe = 0
    p.kill = 0
    p.stanza = 'ingresso'
    p._zombieMap = {}
    p._oggettiMap = {}
    p.stanzeVisitate = ['ingresso']
    return send(
`🧟 *BENVENUTO NELLA VILLA, ${tag}!*

Ti svegli nell'ingresso. Fuori c'è la nebbia, dentro... loro.

❤️ Vita: 100
🔫 Proiettili: 12
📍 Sei in: *Ingresso Villa*

Usa:
${usedPrefix}residentevil mappa
${usedPrefix}residentevil vai est
${usedPrefix}residentevil vai ovest`
    )
  }

  if (!p.started) return send(`⚠️ Prima inizia! ${usedPrefix}residentevil inizia`)
  if (p.finito) return send(`🏆 Hai già vinto! Fai ${usedPrefix}residentevil inizia per rigiocare`)

  if (p.vita <= 0) {
    p.started = false
    return send(`💀 *SEI MORTO!*\nGli zombie ti hanno preso...\n\nFai ${usedPrefix}residentevil inizia per riprovare.`)
  }

  // PROFILO
  if (cmd === 'profilo' || cmd === 'stato') {
    let stanza = STANZE[p.stanza]
    let zombie = getZombieInStanza(p)
    let oggetto = getOggettoInStanza(p)
    let oggettoTxt = oggetto ? `🎒 Oggetto qui: *${oggetto}* - fai ${usedPrefix}residentevil raccogli` : '🎒 Nessun oggetto qui'
    return send(
`╭━━🧟 *RESIDENT EVIL*━━╮

👤 ${tag}
❤️ Vita: ${p.vita}/100
🔫 Proiettili: ${p.proiettili}/${p.maxProiettili}
🔑 Chiavi: ${p.chiavi}/3
🌿 Erbe: ${p.erbe}
🧟 Zombie uccisi: ${p.kill}

📍 Sei in: *${stanza.nome}*
${stanza.desc}
🧟 Zombie qui: ${zombie}
${oggettoTxt}

╰━━━━━━━━━━━━╯`
    )
  }

  // MAPPA
  if (cmd === 'mappa' || cmd === 'map') {
    return send(
`🗺️ *MAPPA VILLA*

        [Camera] -> [Uscita 🚪]
            |
[Bagno] - [Corridoio]
            |
[Biblioteca] - [Ingresso] - [Cucina]

📍 Tu sei in: *${STANZE[p.stanza].nome}*
🔑 Ti servono 3 chiavi per aprire l'Uscita
🌿 Erbe verdi = +30 vita
🔫 Munizioni = +12 proiettili

Comandi movimento:
${usedPrefix}residentevil vai nord
${usedPrefix}residentevil vai sud
${usedPrefix}residentevil vai est
${usedPrefix}residentevil vai ovest`
    )
  }

  // VAI
  if (cmd === 'vai' || cmd === 'muovi' || cmd === 'go') {
    let direzioni = { nord: 'nord', sud: 'sud', est: 'est', ovest: 'ovest', north: 'nord', south: 'sud', east: 'est', west: 'ovest', n: 'nord', s: 'sud', e: 'est', o: 'ovest' }
    let dir = direzioni[arg2]
    if (!dir) return send(`⚠️ Dove vuoi andare? Es: ${usedPrefix}residentevil vai nord`)
    let stanzaAttuale = STANZE[p.stanza]
    let prossima = stanzaAttuale[dir]
    if (!prossima) return send('🚧 Non c’è nessuna porta da quella parte!')

    // zombie ti attaccano se scappi senza ucciderli
    let zombieQui = getZombieInStanza(p)
    if (zombieQui > 0) {
      let danno = zombieQui * 15
      p.vita -= danno
      if (p.vita <= 0) return send(`💀 Mentre scappavi, gli zombie ti hanno afferrato!\nHai perso ${danno} vita.\n\n💀 SEI MORTO! Fai ${usedPrefix}residentevil inizia`)
      p.stanza = prossima
      if (!p.stanzeVisitate.includes(prossima)) p.stanzeVisitate.push(prossima)
      let nuovaStanza = STANZE[prossima]
      let zombieNuovi = getZombieInStanza(p)
      return send(`🏃 *SCAPPATO!* Ma gli zombie ti hanno morso!\n❤️ -${danno} vita | Vita rimasta: ${p.vita}\n\n📍 Sei in: *${nuovaStanza.nome}*\n${nuovaStanza.desc}\n🧟 Zombie qui: ${zombieNuovi}\n\n${zombieNuovi > 0 ? `⚠️ Attento! Usa ${usedPrefix}residentevil spara` : '✅ Stanza sicura!'}`)
    }

    p.stanza = prossima
    if (!p.stanzeVisitate.includes(prossima)) p.stanzeVisitate.push(prossima)
    let nuova = STANZE[prossima]
    let zombieNuovi = getZombieInStanza(p)
    let oggetto = getOggettoInStanza(p)
    return send(
`🚶 *TI SEI MOSSO A ${dir.toUpperCase()}*

📍 Sei in: *${nuova.nome}*
${nuova.desc}
🧟 Zombie qui: ${zombieNuovi}
${oggetto ? `🎒 C'è: *${oggetto}* - ${usedPrefix}residentevil raccogli` : ''}

${zombieNuovi > 0 ? `⚠️ ${zombieNuovi} zombie ti guardano! Usa ${usedPrefix}residentevil spara` : ''}`
    )
  }

  // SPARA
  if (cmd === 'spara' || cmd === 'shoot' || cmd === 'attacca') {
    let zombieQui = getZombieInStanza(p)
    if (zombieQui <= 0) return send('✅ Nessuno zombie qui! Non sprecare proiettili.')
    if (p.proiettili <= 0) return send(`❌ Senza proiettili! Fai ${usedPrefix}residentevil ricarica o trova munizioni.`)
    p.proiettili--
    // 80% colpisci
    let colpito = Math.random() < 0.8
    if (!colpito) {
      p.vita -= 10
      return send(`💨 *MANCATO!*\nLo zombie ti ha morso!\n❤️ -10 vita | Vita: ${p.vita}\n🔫 Proiettili: ${p.proiettili}\n\nRiprova: ${usedPrefix}residentevil spara`)
    }
    zombieQui--
    setZombieInStanza(p, zombieQui)
    p.kill++
    // zombie ti colpisce 30% delle volte
    let tiColpisce = Math.random() < 0.3
    let dannoTxt = ''
    if (tiColpisce && zombieQui > 0) { p.vita -= 12; dannoTxt = `\n⚠️ Un altro zombie ti ha morso! ❤️ -12` }
    if (p.vita <= 0) return send('💀 SEI MORTO! Fai `.residentevil inizia` per riprovare.')
    return send(
`🔫 *BANG!*

🧟 Zombie eliminato! +1 kill
🧟 Zombie rimasti qui: ${zombieQui}
🔫 Proiettili: ${p.proiettili}
❤️ Vita: ${p.vita}${dannoTxt}

${zombieQui === 0 ? '✅ Stanza pulita! Ora puoi esplorare tranquillo.' : `Continua: ${usedPrefix}residentevil spara`}`
    )
  }

  // RICARICA
  if (cmd === 'ricarica' || cmd === 'reload') {
    if (p.proiettili === p.maxProiettili) return send('✅ Caricatore già pieno!')
    p.proiettili = p.maxProiettili
    return send(`🔄 *RICARICATO!*\n🔫 Proiettili: ${p.proiettili}/${p.maxProiettili}`)
  }

  // RACCOGLI
  if (cmd === 'raccogli' || cmd === 'prendi' || cmd === 'loot') {
    let oggetto = getOggettoInStanza(p)
    if (!oggetto) return send('🎒 Niente da raccogliere qui!')
    if (getZombieInStanza(p) > 0) return send(`🧟 Prima uccidi gli zombie! Ci sono ${getZombieInStanza(p)} zombie qui. Usa ${usedPrefix}residentevil spara`)
    setOggettoInStanza(p, null)
    if (oggetto === 'chiave') {
      p.chiavi++
      return send(`🔑 *CHIAVE TROVATA!*\n🔑 Chiavi: ${p.chiavi}/3\n${p.chiavi >= 3 ? '🏃 Vai alla Porta Uscita! ' + usedPrefix + 'residentevil vai nord dalla Camera' : 'Continua a cercare...'}`)
    }
    if (oggetto === 'erba') {
      p.erbe++
      return send(`🌿 *ERBA CURATIVA!*\n🌿 Erbe: ${p.erbe}\nUsala con: ${usedPrefix}residentevil usa erba (+30 vita)`)
    }
    if (oggetto === 'munizioni') {
      p.proiettili = p.maxProiettili
      return send(`🔫 *MUNIZIONI!*\n🔫 Proiettili ripristinati: ${p.proiettili}/${p.maxProiettili}`)
    }
    if (oggetto === 'porta') {
      return send(`🚪 Questa è la porta di uscita! Ti servono 3 chiavi.\nHai: ${p.chiavi}/3\nUsa: ${usedPrefix}residentevil scappa`)
    }
    return send(`🎒 Hai raccolto: ${oggetto}`)
  }

  // USA ERBA
  if (cmd === 'usa' || cmd === 'cura' || cmd === 'erba') {
    if (arg2 && arg2 !== 'erba') return send(`⚠️ Usa: ${usedPrefix}residentevil usa erba`)
    if (p.erbe <= 0) return send('🌿 Non hai erbe! Cercale in Cucina e Bagno.')
    if (p.vita >= 100) return send('❤️ Vita già al massimo!')
    p.erbe--
    p.vita = Math.min(100, p.vita + 30)
    return send(`🌿 *ERBA USATA!*\n❤️ +30 vita | Vita: ${p.vita}/100\n🌿 Erbe rimaste: ${p.erbe}`)
  }

  // SCAPPA / VITTORIA
  if (cmd === 'scappa' || cmd === 'esci' || cmd === 'fuga') {
    if (p.stanza !== 'uscita') return send(`🚪 Non sei alla porta! Vai alla Camera e poi a nord.\n📍 Tu sei in: ${STANZE[p.stanza].nome}`)
    if (p.chiavi < 3) return send(`🔒 Porta chiusa! Ti servono 3 chiavi.\nHai: ${p.chiavi}/3\nTorna indietro a cercare!`)
    p.finito = true
    return send(
`╭━━━━🏆━━━━╮
   SEI SCAPPATO!
╰━━━━🏆━━━━╯

🎉 *HAI VINTO, ${tag}!*

🧟 Zombie uccisi: ${p.kill}
❤️ Vita rimasta: ${p.vita}
🔑 Chiavi usate: 3
🌿 Erbe rimaste: ${p.erbe}

Sei uscito dalla Villa Spencer vivo!
Jill Valentine sarebbe fiera di te!

Rigioca con: ${usedPrefix}residentevil inizia`
    )
  }

  return send(`❓ Comando sconosciuto! Fai ${usedPrefix}residentevil per il menù`)
}

handler.help = ['residentevil']
handler.tags = ['giochi', 'rpg']
handler.command = /^(residentevil|re|zombie)$/i

export default handler